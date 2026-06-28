import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { uploadSupportingDoc, deleteSupportingDocs } from "@/lib/supabase-storage";
import { ALLOWED_FILE_TYPES } from "@/schemas/attachmentSchema";

// ── Zod schemas ────────────────────────────────────────────────────────────
import { createClientSchema }      from "@/schemas/clientSchema";
import { createAppointmentSchema } from "@/schemas/appointmentSchema";
import { createAttachmentSchema }  from "@/schemas/attachmentSchema";

// ── POST /api/client/appointment ──────────────────────────────────────────
// Accepts multipart/form-data:
//   Client fields:      name, email, phone, dob, address, companyName?, type?, tags?
//   Appointment fields: appointmentDate, appointmentTime, meetingMode?, purpose?
//   File field:         doc  (multiple allowed, each ≤ 10 MB)
// ─────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Parse multipart form ───────────────────────────────────────────────
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

  // ── 2. Validate client fields via Zod ────────────────────────────────────
  const rawTags = get("tags");
  const tagsArray = rawTags.length > 0
    ? rawTags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const clientParse = createClientSchema
    .omit({ password: true })
    .safeParse({
      name:        get("name"),
      email:       get("email"),
      phone:       get("phone"),
      dob:         get("dob"),
      address:     get("address"),
      companyName: get("companyName") || undefined,
      type:        get("type")        || undefined,
      tags:        tagsArray,
    });

  if (!clientParse.success) {
    const errors = clientParse.error.flatten().fieldErrors;
    return NextResponse.json(
      { success: false, message: "Invalid client data.", errors },
      { status: 422 }
    );
  }

  // ── 3. Check for existing client ─────────────────────────────────────────
  const existingClient = await prisma.client.findFirst({
    where: {
      OR: [
        { email: clientParse.data.email },
        { phone: clientParse.data.phone },
      ],
    },
  });

  if (existingClient) {
    return NextResponse.json(
      { success: false, message: "Client already exists. Please login." },
      { status: 409 }
    );
  }

  // ── 4. Validate appointment fields via Zod ───────────────────────────────
  const apptParse = createAppointmentSchema.safeParse({
    appointmentDate: get("appointmentDate"),
    appointmentTime: get("appointmentTime"),
    meetingMode:     get("meetingMode") || undefined,
    purpose:         get("purpose")     || undefined,
  });

  if (!apptParse.success) {
    const errors = apptParse.error.flatten().fieldErrors;
    return NextResponse.json(
      { success: false, message: "Invalid appointment data.", errors },
      { status: 422 }
    );
  }

  // ── 5. Validate uploaded files ────────────────────────────────────────────
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const rawDocFiles = (formData.getAll("doc") as File[]).filter(
    (f) => f instanceof File && f.size > 0
  );

  const oversized = rawDocFiles.filter((f) => f.size > MAX_FILE_BYTES);
  if (oversized.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `File(s) exceed the 10 MB limit: ${oversized.map((f) => f.name).join(", ")}`,
      },
      { status: 413 }
    );
  }

  const invalidType = rawDocFiles.filter(
    (f) => !ALLOWED_FILE_TYPES.includes(f.type as (typeof ALLOWED_FILE_TYPES)[number])
  );
  if (invalidType.length > 0) {
    return NextResponse.json(
      {
        success: false,
        message: `Unsupported file type(s): ${invalidType.map((f) => f.name).join(", ")}. Allowed: PDF, PNG, JPG, DOC, DOCX`,
      },
      { status: 415 }
    );
  }

  // ── 6. Hash the provided password ─────────────────────────────────────────
  const providedPassword = get("password");
  if (!providedPassword) {
    return NextResponse.json(
      { success: false, message: "Password is required." },
      { status: 422 }
    );
  }
  const passwordHash = await hashPassword(providedPassword);

  // ── 7. Upload all docs in parallel (before DB transaction) ───────────────
  const appointmentId = crypto.randomUUID();
  type UploadResult   = Awaited<ReturnType<typeof uploadSupportingDoc>>;
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
        { success: false, message: "Failed to upload one or more supporting documents. Please try again." },
        { status: 502 }
      );
    }
  }

  // ── 8. Validate each attachment record via Zod (before writing) ──────────
  for (const ur of uploadResults) {
    const attachParse = createAttachmentSchema.safeParse({
      appointmentId: appointmentId,
      fileName:      ur.fileName,
      fileType:      ur.fileType,
      fileUrl:       ur.publicUrl,
      fileSize:      ur.fileSize,
    });

    if (!attachParse.success) {
      await deleteSupportingDocs(uploadResults.map((r) => r.path)).catch(console.error);
      return NextResponse.json(
        {
          success: false,
          message: `Attachment metadata invalid for "${ur.fileName}".`,
          errors:  attachParse.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }
  }

  // ── 9. Atomic DB transaction: Client → Appointment → Attachment[] ─────────
  try {
    const result = await prisma.$transaction(async (tx) => {
      const newClient = await tx.client.create({
        data: {
          name:         clientParse.data.name,
          email:        clientParse.data.email,
          phone:        clientParse.data.phone,
          dob:          clientParse.data.dob,
          address:      clientParse.data.address,
          companyName:  clientParse.data.companyName ?? null,
          passwordHash: passwordHash,
        },
      });

      const newAppointment = await tx.appointment.create({
        data: {
          id:              appointmentId,
          clientId:        newClient.id,
          appointmentDate: apptParse.data.appointmentDate,
          appointmentTime: apptParse.data.appointmentTime,
          meetingMode:     apptParse.data.meetingMode,
          purpose:         apptParse.data.purpose ?? 'Nothing to mention here.',
        },
      });

      const newAttachments = await Promise.all(
        uploadResults.map((ur) =>
          tx.attachment.create({
            data: {
              clientId:      newClient.id,
              appointmentId: appointmentId,
              fileName:      ur.fileName,
              fileType:      ur.fileType,
              fileUrl:       ur.publicUrl,
              fileSize:      ur.fileSize,
            },
          })
        )
      );

      return { client: newClient, appointment: newAppointment, attachments: newAttachments };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Client and appointment created successfully.",
        data: {
          client:      result.client,
          appointment: result.appointment,
          attachments: result.attachments,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/client/appointment]", error);

    if (uploadResults.length > 0) {
      await deleteSupportingDocs(uploadResults.map((r) => r.path)).catch(console.error);
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      const target = (error as { meta?: { target?: string[] } }).meta?.target ?? [];
      return NextResponse.json(
        {
          success: false,
          message: `A client with this ${target.join(" and ")} already exists.`,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
