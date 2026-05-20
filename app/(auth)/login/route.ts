import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { userEmail,userPhone, userPassword } = await request.json();

    const email = userEmail?.trim().toLowerCase() || "";
    const phone= userPhone?.trim().toLowerCase() || "";
    const password = userPassword?.trim();

    if ((!email && !phone) || !password) {
      return NextResponse.json(
        {
          message: "Please enter email or phone and password",
        },
        { status: 400 }
      );
    }

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : {},
        phone ? { phone } : {},
          ],
        },
      });
    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const token = generateToken(user.id);

    const response = NextResponse.json({
      message: "Login successful",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.log("error while logging in user", error);

    return NextResponse.json(
      {
        error: "Something went wrong",
      },
      { status: 500 }
    );
  }
}