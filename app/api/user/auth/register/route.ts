import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createUserSchema } from "@/schemas/userSchema";
import { hashPassword, generateToken } from "@/lib/auth";
import {
  uploadConsultantDocs,
  deleteConsultantDocs,
  type UploadResult,
} from "@/lib/supabase-storage";

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();

    // ── Extract all verification/resume docs (multiple files allowed) ──────
    // The client sends each file under the key "docs"
    const docFiles: File[] = formData
      .getAll("docs")
      .filter((v): v is File => v instanceof File && v.size > 0);

    // ── Build scalar body for Zod validation (exclude file entries) ────────
    const rawBody: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "docs") continue; // handled separately
      rawBody[key] = value;
    }

    // Coerce numeric fields from FormData strings
    rawBody.appointmentFee    = Number(rawBody.appointmentFee);
    rawBody.yearsOfExperience = Number(rawBody.yearsOfExperience);

    // Parse consultantTags JSON string → string[]
    rawBody.consultantTags = JSON.parse(
      typeof rawBody.consultantTags === "string" ? rawBody.consultantTags : "[]"
    );

    // ── Validate ───────────────────────────────────────────────────────────
    const result = createUserSchema.safeParse(rawBody);
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      password,
      dob,
      bio,
      nameOfConsultancy,
      designation,
      yearsOfExperience,
      appointmentFee,
      address,
      city,
      state,
      country,
      timezone,
      website,
      linkedinUrl,
      portfolioUrl,
      consultantTags,
    } = result.data;

    // ── Check for existing user ────────────────────────────────────────────
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    // ── Hash password ──────────────────────────────────────────────────────
    const hashedPassword = await hashPassword(password);

    // ── Create user first so we have an ID for the storage path ──────────
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        dob: new Date(dob),
        bio,
        nameOfConsultancy,
        designation,
        yearsOfExperience,
        appointmentFee,
        address:      address      ?? null,
        city,
        state,
        country,
        timezone,
        website:      website      || null,
        linkedinUrl:  linkedinUrl  || null,
        portfolioUrl: portfolioUrl || null,
        resumeUrl:    null, // populated below after upload
        consultantTags: {
          connectOrCreate: consultantTags.map((tagName: string) => {
            const normalised = tagName.trim().toLowerCase();
            return {
              where:  { name: normalised },
              create: { name: normalised },
            };
          }),
        },
      },
    });

    // ── Upload verification docs to SUPABASE_CONSULTANT_RESUME bucket ─────
    let uploadedDocs: UploadResult[] = [];
    const uploadedPaths: string[] = [];

    if (docFiles.length > 0) {
      try {
        uploadedDocs = await uploadConsultantDocs(docFiles, user.id);
        uploadedPaths.push(...uploadedDocs.map((d) => d.path));

        // Store the primary doc URL (first file) in the resumeUrl field
        await prisma.user.update({
          where: { id: user.id },
          data:  { resumeUrl: uploadedDocs[0].publicUrl },
        });
      } catch (uploadError) {
        // Roll back: delete any files that did get uploaded, then delete the user
        await deleteConsultantDocs(uploadedPaths).catch(() => {});
        await prisma.user.delete({ where: { id: user.id } }).catch(() => {});

        console.error("Consultant doc upload failed:", uploadError);
        return NextResponse.json(
          { success: false, message: "File upload failed. Please try again." },
          { status: 502 }
        );
      }
    }

    // ── Generate JWT & respond ─────────────────────────────────────────────
    const token = generateToken(user.id);

    const response = NextResponse.json(
      {
        success:  true,
        message:  "User created successfully",
        // Return all uploaded doc URLs so the client can display them
        uploadedDocs: uploadedDocs.map((d) => ({
          fileName:  d.fileName,
          publicUrl: d.publicUrl,
          fileSize:  d.fileSize,
          fileType:  d.fileType,
        })),
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   60 * 60 * 24, // 1 day
      path:     "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}