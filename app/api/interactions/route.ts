import { prisma } from "@/lib/db";
import { interactionSchema, listInteractionSchema } from "@/schemas/interactionSchema";
import { Prisma } from "@/prisma/migrations/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const query = {
            userId: searchParams.get("userId"),
            personId: searchParams.get("personId") || undefined,
            type: searchParams.get("type") || undefined,
            skip: searchParams.get("skip") ? parseInt(searchParams.get("skip")!) : undefined,
            take: searchParams.get("take") ? parseInt(searchParams.get("take")!) : undefined,
        };

        const result = listInteractionSchema.safeParse(query);
        if (!result.success) {
            return NextResponse.json(
                {
                    success: false,
                    errors: result.error.flatten(),
                },
                { status: 400 }
            );
        }

        const { userId, personId, type, skip, take } = result.data;

        const where: Prisma.InteractionWhereInput = { userId };
        if (personId) where.personId = personId;
        if (type) where.interactionType = type as any;

        const interactions = await prisma.interaction.findMany({
            where,
            skip,
            take,
            orderBy: { interactionDate: "desc" },
        });

        const total = await prisma.interaction.count({ where });

        return NextResponse.json(
            {
                success: true,
                data: interactions,
                pagination: { total, skip, take },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error listing interactions:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = interactionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      interactionType,
      notes,
      audioUrl,
      transcript,
      interactionDate,
    } = result.data;

    // personId should come from request body
    const { personId } = body;

    if (!personId) {
      return NextResponse.json(
        { error: "personId is required" },
        { status: 400 }
      );
    }

    // Verify person belongs to user
    const person = await prisma.person.findUnique({
      where: { id: personId },
    });

    if (!person || person.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const interaction = await prisma.interaction.create({
      data: {
        userId: user.id,
        personId,
        interactionType,
        notes,
        audioUrl,
        transcript,
        interactionDate: interactionDate ? new Date(interactionDate) : new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Interaction successfully created!",
        data: interaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating interaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}