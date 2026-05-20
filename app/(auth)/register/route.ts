import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateToken, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { userName, userEmail, userPhone, userPassword } =
      await request.json();

    const name = userName;
    const email = userEmail.trim().toLowerCase();
    const password = userPassword.trim();
    const phone = userPhone.trim();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        {
          message: "Please fill all the fields.",
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User already registered with this Email or Phone",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);

    const response = NextResponse.json({
      message: "User created successfully",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.log("error while registering user", error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}