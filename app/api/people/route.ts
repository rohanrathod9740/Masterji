import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPersonSchema } from "@/schemas/personSchema";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // parse request body
    const body = await req.json();

    // validate request body
    const result = createPersonSchema.safeParse(body);

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

    // validated data
    const {
      userId,
      name,
      type,
      email,
      phone,
      tags,
      notes,
    } = result.data;

    // check if person already exists
    const existingPerson = await prisma.person.findFirst({
      where: {
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    if (existingPerson) {
      return NextResponse.json(
        {
          success: false,
          message: "Person already exists!",
        },
        { status: 409 }
      );
    }

    // create person
    const person = await prisma.person.create({
      data: {
        userId,
        name,
        type,
        email,
        phone,
        tags,
        notes,
      },
    });

    // success response
    return NextResponse.json(
      {
        success: true,
        message: "Person created successfully",
        person,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating person:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        const persons = await prisma.person.findMany({
            where: {
                userId: user.id,
            },
            include: {
                interactions: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 5, // Get last 5 interactions
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(persons, { status: 200 });
    } catch (error) {
        console.error("Error fetching persons:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}