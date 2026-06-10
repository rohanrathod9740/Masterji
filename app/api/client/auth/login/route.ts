import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, generateToken } from "@/lib/auth";
import { loginClientSchema } from "@/schemas/clientSchema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // validate request body
    const result = loginClientSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    // validated data
    const {
      clientEmail,
      clientPhone,
      clientPassword,
    } = result.data;

    // find user
    const orConditions = [];

    if (clientEmail) {
      orConditions.push({ email: clientEmail });
    }

    if (clientPhone) {
      orConditions.push({ phone: clientPhone });
    }

    const client = await prisma.client.findFirst({
      where: {
        OR: orConditions,
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // verify password
    const isPasswordValid = await verifyPassword(
      clientPassword || "",
      client.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // generate jwt
    const token = generateToken(client.id);

    // create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
      },
      { status: 200 }
    );

    // set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}