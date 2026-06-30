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

    // ── Extract verification/resume docs (multiple files allowed) ──────────
    const docFiles: File[] = formData
      .getAll("docs")
      .filter((v): v is File => v instanceof File && v.size > 0);

    // ── Build scalar body for Zod validation ──────────────────────────────
    const rawBody: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "docs") continue;
      rawBody[key] = value;
    }

    // Coerce numeric fields from FormData strings
    rawBody.yearsOfExperience = Number(rawBody.yearsOfExperience);
    rawBody.consultationFee = Number(rawBody.consultationFee);

    // Parse consultantTags JSON string → string[]
    rawBody.consultantTags = JSON.parse(
      typeof rawBody.consultantTags === "string" ? rawBody.consultantTags : "[]"
    );

    // ── Validate ───────────────────────────────────────────────────────────
    const result = createUserSchema.safeParse(rawBody);
    if (!result.success) {
      console.error("Validation failed:", result.error.flatten());
      return NextResponse.json(
        { success: false, errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const {
      fullName,
      email,
      phone,
      password,
      dob,
      bio,
      headline,
      category,
      subSpecialization,
      nameOfConsultancy,
      designation,
      yearsOfExperience,
      consultationFee,
      currency,
      paymentTiming,
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

    // ── Create User + ConsultantProfile atomically ─────────────────────────
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        passwordHash: hashedPassword,
        role: "CONSULTANT",
        consultantProfile: {
          create: {
            fullName,
            dob: new Date(dob),
            bio,
            headline: headline ?? null,
            category,
            subSpecialization: subSpecialization ?? null,
            nameOfConsultancy: nameOfConsultancy ?? null,
            designation: designation ?? null,
            yearsOfExperience: yearsOfExperience ?? 0,
            consultationFee: consultationFee ?? 150,
            currency: currency ?? "INR",
            paymentTiming: paymentTiming ?? "PAY_ON_BOOKING",
            address: address ?? null,
            city: city ?? null,
            state: state ?? null,
            country: country ?? "India",
            timezone: timezone ?? "Asia/Kolkata",
            website: website || null,
            linkedinUrl: linkedinUrl || null,
            portfolioUrl: portfolioUrl || null,
            tags: {
              connectOrCreate: consultantTags.map((tagName: string) => {
                const normalised = tagName.trim().toLowerCase();
                return {
                  where: { name: normalised },
                  create: { name: normalised },
                };
              }),
            },
          },
        },
      },
    });

    // ── Upload verification docs ────────────────────────────────────────────
    let uploadedDocs: UploadResult[] = [];
    const uploadedPaths: string[] = [];

    if (docFiles.length > 0) {
      try {
        uploadedDocs = await uploadConsultantDocs(docFiles, user.id);
        uploadedPaths.push(...uploadedDocs.map((d) => d.path));

        // Store the primary doc URL as resumeUrl on ConsultantProfile
        await prisma.consultantProfile.update({
          where: { userId: user.id },
          data: { resumeUrl: uploadedDocs[0].publicUrl },
        });
      } catch (uploadError) {
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
        success: true,
        message: "User created successfully",
        uploadedDocs: uploadedDocs.map((d) => ({
          fileName: d.fileName,
          publicUrl: d.publicUrl,
          fileSize: d.fileSize,
          fileType: d.fileType,
        })),
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
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