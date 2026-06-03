import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  createCommitmentSchema,
  listCommitmentSchema,
} from "@/schemas/commitmentSchema";
import { Prisma } from "@/prisma/migrations/client";
import { NextRequest, NextResponse } from "next/server";

// GET /api/commitments — list commitments with filters
export async function GET(req: NextRequest) {
  try {
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
      personId: searchParams.get("personId") || undefined,
      interactionId: searchParams.get("interactionId") || undefined,
      status: searchParams.get("status") || undefined,
      skip: searchParams.get("skip")
        ? parseInt(searchParams.get("skip")!)
        : undefined,
      take: searchParams.get("take")
        ? parseInt(searchParams.get("take")!)
        : undefined,
    };

    const result = listCommitmentSchema.safeParse(query);
    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, personId, interactionId, status, skip, take } =
      result.data;

    // Prevent privilege escalation
    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const where: Prisma.CommitmentWhereInput = { userId };
    if (personId) where.personId = personId;
    if (interactionId) where.interactionId = interactionId;
    if (status) where.status = status as any;

    const [commitments, total] = await Promise.all([
      prisma.commitment.findMany({
        where,
        skip,
        take,
        orderBy: { dueDate: "asc" },
      }),
      prisma.commitment.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: commitments,
        pagination: { total, skip, take },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error listing commitments:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/commitments — create a commitment
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createCommitmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const { personId, interactionId, title, dueDate, status } = result.data;

    // Verify person belongs to the current user
    const person = await prisma.person.findUnique({ where: { id: personId } });
    if (!person || person.userId !== user.id) {
      return NextResponse.json(
        { error: "Person not found or unauthorized" },
        { status: 403 }
      );
    }

    // If interactionId provided, verify it belongs to the current user
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

    const commitment = await prisma.commitment.create({
      data: {
        userId: user.id,
        personId,
        interactionId: interactionId ?? null,
        title,
        dueDate: new Date(dueDate),
        status: status ?? "pending",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Commitment successfully created!",
        data: commitment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating commitment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
