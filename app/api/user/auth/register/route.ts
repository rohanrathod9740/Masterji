import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createUserSchema } from "@/schemas/userSchema";
import { hashPassword, generateToken} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // parse request body
    const body = await request.json();

    // validate request body
    const result = createUserSchema.safeParse(body);

    // validation failed
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    // validated + transformed data
    const {
      userName,
      userEmail,
      userPhone,
      userPassword,
    } = result.data;

    // check existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userEmail },
          { phone: userPhone },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 }
      );
    }

    // hash password
    const hashedPassword = await hashPassword(userPassword);

    // create user
    const user = await prisma.user.create({
      data: {
        name: userName,
        email: userEmail,
        phone: userPhone,
        password: hashedPassword,
      },
    });

    // generate jwt
    const token = generateToken(user.id);

    // create response
    const response = NextResponse.json(
      {
        success: true,
        message: "User created successfully",
      },
      { status: 201 }
    );

    // set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}