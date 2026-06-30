import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClientSchema } from "@/schemas/clientSchema";
import { hashPassword, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate using createClientSchema
    const parseResult = createClientSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, errors: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check for existing user by email or phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "A user with this email or phone number already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create User & ClientProfile atomically
    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash: hashedPassword,
        role: "CLIENT",
        clientProfile: {
          create: {
            fullName: data.fullName,
            dob: data.dob ?? null,
            gender: data.gender ?? null,
            preferredLanguage: data.preferredLanguage ?? null,
            address: data.address ?? null,
            city: data.city ?? null,
            state: data.state ?? null,
            country: data.country ?? null,
            timezone: data.timezone,
            isMinor: data.isMinor,
            guardianName: data.guardianName ?? null,
            guardianPhone: data.guardianPhone ?? null,
            guardianEmail: data.guardianEmail ?? null,
          }
        }
      }
    });

    // Generate token
    const token = generateToken(user.id);

    const response = NextResponse.json(
      {
        success: true,
        message: "Client profile registered successfully.",
        data: {
          userId: user.id
        }
      },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set("clientAuthToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("[POST /api/client/register]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
