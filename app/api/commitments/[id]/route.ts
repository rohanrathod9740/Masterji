import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateCommitmentSchema } from "@/schemas/commitmentSchema";
import { NextRequest, NextResponse } from "next/server";

// GET /api/commitments/:id — get one commitment
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

    const commitment = await prisma.commitment.findUnique({ where: { id } });

    if (!commitment) {
      return NextResponse.json(
        { error: "Commitment not found" },
        { status: 404 }
      );
    }

    if (commitment.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: commitment }, { status: 200 });
  } catch (error) {
    console.error("Error fetching commitment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/commitments/:id — update title, dueDate, status, personId, interactionId
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.commitment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Commitment not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const result = updateCommitmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { title, dueDate, status, personId, interactionId } = result.data;

    // If changing personId, verify it belongs to the user
    if (personId) {
      const person = await prisma.person.findUnique({ where: { id: personId } });
      if (!person || person.userId !== user.id) {
        return NextResponse.json(
          { error: "Person not found or unauthorized" },
          { status: 403 }
        );
      }
    }

    // If changing interactionId, verify it belongs to the user
    if (interactionId) {
      const interaction = await prisma.interaction.findUnique({
        where: { id: interactionId },
      });
      if (!interaction || interaction.userId !== user.id) {
        return NextResponse.json(
          { error: "Interaction not found or unauthorized" },
          { status: 403 }
        );
      }
    }

    // Build partial update — only include explicitly provided fields
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (status !== undefined) updateData.status = status;
    if (personId !== undefined) updateData.personId = personId;
    if (interactionId !== undefined)
      updateData.interactionId = interactionId ?? null; // allow explicit null to unlink

    const updated = await prisma.commitment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Commitment successfully updated!",
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating commitment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/commitments/:id — delete a commitment
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

    const existing = await prisma.commitment.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { error: "Commitment not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.commitment.delete({ where: { id } });

    return NextResponse.json(
      { success: true, message: "Commitment successfully deleted!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting commitment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
