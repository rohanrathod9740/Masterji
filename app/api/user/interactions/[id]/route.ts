import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { interactionSchema } from "@/schemas/interactionSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const interaction = await prisma.interaction.findUnique({
      where: { id },
    });

    if (!interaction) {
      return NextResponse.json(
        { error: "Interaction not found" },
        { status: 404 }
      );
    }

    if (interaction.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(interaction);
  } catch (error) {
    console.error("Error fetching interaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if interaction exists and belongs to user
    const interaction = await prisma.interaction.findUnique({
      where: { id },
    });

    if (!interaction) {
      return NextResponse.json(
        { error: "Interaction not found" },
        { status: 404 }
      );
    }

    if (interaction.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Filter out empty strings from optional fields
    const cleanedBody = Object.entries(body).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const result = interactionSchema.safeParse(cleanedBody);

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

    // Update interaction - only include provided fields
    const updateData: any = {};
    if (interactionType !== undefined) updateData.interactionType = interactionType;
    if (notes !== undefined) updateData.notes = notes;
    if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
    if (transcript !== undefined) updateData.transcript = transcript;
    if (interactionDate !== undefined) updateData.interactionDate = new Date(interactionDate);

    const updatedInteraction = await prisma.interaction.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Interaction successfully updated!",
        data: updatedInteraction,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating interaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if interaction exists and belongs to user
    const interaction = await prisma.interaction.findUnique({
      where: { id },
    });

    if (!interaction) {
      return NextResponse.json(
        { error: "Interaction not found" },
        { status: 404 }
      );
    }

    if (interaction.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete interaction
    await prisma.interaction.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Interaction successfully deleted!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting interaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}