import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentClient } from "@/lib/auth";
import { uploadSupportingDoc, deleteSupportingDocs } from "@/lib/supabase-storage";
import { ALLOWED_FILE_TYPES, createDocumentSchema } from "@/schemas/documentSchema";

// ── POST /api/client/appointment ──────────────────────────────────────────
// Accepts multipart/form-data:
//   Consultant field:   consultantId (required — the consultant being booked)
//   Appointment fields: scheduledStart, scheduledEnd, mode?, purpose?
//   File field:         doc (multiple allowed, each ≤ 10 MB)
//
// Requires authenticated client session.
// Flow: ClientProfile → Case (find/create) → Appointment → Document[]
// ─────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── 1. Auth ────────────────────────────────────────────────────────────
    const clientUser = await getCurrentClient();
    if (!clientUser) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: clientUser.id },
    });

    if (!clientProfile) {
      return NextResponse.json({ success: false, message: "Client profile not found." }, { status: 404 });
    }

    // ── 2. Parse multipart form ───────────────────────────────────────────────
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body. Expected multipart/form-data." },
        { status: 400 }
      );
    }

    const get = (key: string) => (formData.get(key) as string | null)?.trim() ?? "";

    // ── 3. Require consultantId ───────────────────────────────────────────────
    const consultantId = get("consultantId");
    if (!consultantId) {
      return NextResponse.json(
        { success: false, message: "consultantId is required." },
        { status: 422 }
      );
    }

    // Verify consultant exists and get their profile
    const consultantProfile = await prisma.consultantProfile.findFirst({
      where: { userId: consultantId },
      select: { id: true, fullName: true, category: true, consultationFee: true, currency: true, paymentTiming: true },
    });

    if (!consultantProfile) {
      return NextResponse.json(
        { success: false, message: "Consultant not found." },
        { status: 404 }
      );
    }

    // ── 4. Validate appointment timing fields ────────────────────────────────
    const scheduledStart = get("scheduledStart");
    const scheduledEnd   = get("scheduledEnd");

    if (!scheduledStart || !scheduledEnd) {
      return NextResponse.json(
        { success: false, message: "scheduledStart and scheduledEnd are required." },
        { status: 422 }
      );
    }

    const startDate = new Date(scheduledStart);
    const endDate   = new Date(scheduledEnd);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid scheduledStart or scheduledEnd date." },
        { status: 422 }
      );
    }

    if (startDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, message: "Appointment must be in the future." },
        { status: 422 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { success: false, message: "scheduledEnd must be after scheduledStart." },
        { status: 422 }
      );
    }

    const mode    = get("mode") || "IN_PERSON";
    const purpose = get("purpose") || "General consultation";

    // ── 5. Validate uploaded files ────────────────────────────────────────────
    const MAX_FILE_BYTES = 10 * 1024 * 1024;
    const rawDocFiles = (formData.getAll("doc") as File[]).filter(
      (f) => f instanceof File && f.size > 0
    );

    const oversized = rawDocFiles.filter((f) => f.size > MAX_FILE_BYTES);
    if (oversized.length > 0) {
      return NextResponse.json(
        { success: false, message: `File(s) exceed the 10 MB limit: ${oversized.map((f) => f.name).join(", ")}` },
        { status: 413 }
      );
    }

    const invalidType = rawDocFiles.filter(
      (f) => !ALLOWED_FILE_TYPES.includes(f.type as (typeof ALLOWED_FILE_TYPES)[number])
    );
    if (invalidType.length > 0) {
      return NextResponse.json(
        { success: false, message: `Unsupported file type(s): ${invalidType.map((f) => f.name).join(", ")}` },
        { status: 415 }
      );
    }

    // ── 6. Upload docs before DB write ───────────────────────────────────────
    const appointmentId = crypto.randomUUID();
    type UploadResult = Awaited<ReturnType<typeof uploadSupportingDoc>>;
    let uploadResults: UploadResult[] = [];

    if (rawDocFiles.length > 0) {
      try {
        uploadResults = await Promise.all(
          rawDocFiles.map((f) => uploadSupportingDoc(f, appointmentId))
        );
      } catch (uploadErr) {
        console.error("[upload]", uploadErr);
        await deleteSupportingDocs(uploadResults.map((r) => r.path)).catch(console.error);
        return NextResponse.json(
          { success: false, message: "Failed to upload one or more documents. Please try again." },
          { status: 502 }
        );
      }
    }

    // ── 7. Atomic DB transaction ──────────────────────────────────────────────
    // Order: Case (find or create) → Appointment → Document[]
    try {
      const txResult = await prisma.$transaction(async (tx) => {
        // Find or create an active Case between this client and consultant
        let activeCase = await tx.case.findFirst({
          where: {
            clientId: clientProfile.id,
            consultantId: consultantProfile.id,
            status: "ACTIVE",
          },
        });

        if (!activeCase) {
          activeCase = await tx.case.create({
            data: {
              clientId:     clientProfile.id,
              consultantId: consultantProfile.id,
              category:     consultantProfile.category,
              title:        `Consultation with ${consultantProfile.fullName}`,
              status:       "ACTIVE",
            },
          });
        }

        // Create Appointment
        const newAppointment = await tx.appointment.create({
          data: {
            id:             appointmentId,
            caseId:         activeCase.id,
            consultantId:   consultantProfile.id,
            clientId:       clientProfile.id,
            scheduledStart: startDate,
            scheduledEnd:   endDate,
            mode:           mode as "IN_PERSON" | "ZOOM" | "GOOGLE_MEET" | "OTHER_VIDEO" | "AUDIO_ONLY",
            purpose:        purpose,
            status:         "REQUESTED",
            feeAmount:      consultantProfile.consultationFee,
            currency:       consultantProfile.currency,
            paymentTiming:  consultantProfile.paymentTiming,
          },
        });

        // Create Document records for each uploaded file
        const newDocuments = await Promise.all(
          uploadResults.map((ur) => {
            const docParse = createDocumentSchema.safeParse({
              caseId:         activeCase!.id,
              clientId:       clientProfile.id,
              uploadedByRole: "CLIENT",
              uploadedById:   clientProfile.id,
              fileUrl:        ur.publicUrl,
              fileName:       ur.fileName,
              fileType:       ur.fileType,
              fileSizeBytes:  ur.fileSize,
              category:       "OTHER",
              accessLevel:    "CONSULTANT_ONLY",
            });

            if (!docParse.success) {
              throw new Error(`Invalid document metadata for "${ur.fileName}"`);
            }

            return tx.document.create({ data: docParse.data });
          })
        );

        return {
          case:        activeCase,
          appointment: newAppointment,
          documents:   newDocuments,
        };
      });

      return NextResponse.json(
        {
          success: true,
          message: "Appointment requested successfully.",
          data: {
            clientId:      clientProfile.id,
            caseId:        txResult.case.id,
            appointmentId: txResult.appointment.id,
            documents:     txResult.documents.length,
          },
        },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("[POST /api/client/appointment]", error);

      if (uploadResults.length > 0) {
        await deleteSupportingDocs(uploadResults.map((r) => r.path)).catch(console.error);
      }

      return NextResponse.json(
        { success: false, message: "Internal server error." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
