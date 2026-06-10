import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const updateClientLocalSchema = z.object({
  name: z.string().trim().min(1).optional(),
  type: z.string().optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
  address: z.string().trim().optional(),
  dob: z.string().trim().optional(),
  companyName: z.string().trim().optional(),
});

const mapPersonTypeToClientType = (type: string | undefined): any => {
  if (type === "client") return "consulting_client";
  if (type === "patient" || type === "shishya" || type === "friend") return "other";
  const valid = ["consulting_client", "retained_client", "one_time_client", "lead", "other"];
  if (type && valid.includes(type)) return type;
  return undefined;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        interactions: {
          orderBy: {
            interactionDate: "desc",
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    if (client.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(client);

  } catch (error) {
    console.error("Error fetching client:", error);

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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if client exists and belongs to user
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    if (client.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateClientLocalSchema.partial().parse(body);

    const updateData: Record<string, any> = { ...validatedData };
    if (validatedData.type !== undefined) {
      updateData.type = mapPersonTypeToClientType(validatedData.type);
    }
    if (validatedData.dob !== undefined) {
      updateData.dob = new Date(validatedData.dob);
    }

    // Update client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedClient);

  } catch (error) {
    console.error("Error updating client:", error);

    return NextResponse.json(
      { error: "Internal server error" },
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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if client exists and belongs to user
    const client = await prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    if (client.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete client (cascade delete interactions)
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Client successfully deleted!",
    });

  } catch (error) {
    console.error("Error deleting client:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


