import { prisma } from "@/lib/db";
import { interactionSchema, listInteractionSchema } from "@/schemas/interactionSchema";
import { Prisma } from "@/prisma/migrations/client";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        // Verify user is authenticated
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const searchParams = req.nextUrl.searchParams;
        const query = {
            userId: searchParams.get("userId"),
            clientId: searchParams.get("clientId") || undefined,
            type: searchParams.get("type") || undefined,
            skip: searchParams.get("skip") ? parseInt(searchParams.get("skip")!) : undefined,
            take: searchParams.get("take") ? parseInt(searchParams.get("take")!) : undefined,
        };
        console.log("userId",searchParams.get("userId"));

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

        const { userId, clientId, type, skip, take } = result.data;

        // Verify userId matches authenticated user (prevent privilege escalation)
        if (userId !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 403 }
            );
        }

        const where: Prisma.InteractionWhereInput = { userId };
        if (clientId) where.clientId = clientId;
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

    // clientId should come from request body
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    // Verify client belongs to user
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client || client.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const interaction = await prisma.interaction.create({
      data: {
        userId: user.id,
        clientId,
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