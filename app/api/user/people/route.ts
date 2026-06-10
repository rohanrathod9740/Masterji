import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { z } from "zod";

const createClientLocalSchema = z.object({
  userId: z.string().trim(),
  name: z.string().trim().min(1, "Name is required"),
  type: z.string().optional(),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  audioUrl: z.string().optional(),
  interactionType: z.string().optional(),
});

const mapPersonTypeToClientType = (type: string | undefined): any => {
  if (type === "client") return "consulting_client";
  if (type === "patient" || type === "shishya" || type === "friend") return "other";
  const valid = ["consulting_client", "retained_client", "one_time_client", "lead", "other"];
  if (type && valid.includes(type)) return type;
  return "other";
};

const mapInteractionType = (type: string | undefined): any => {
  if (type === "conversation") return "call";
  if (type === "advice") return "consulation";
  if (type === "meeting") return "meeting";
  if (type === "treatment") return "treatment_session";
  if (type === "proposal") return "project_discussion";
  if (type === "session") return "treatment_session";
  
  const valid = ["consulation", "meeting", "call", "treatment_session", "review_meeting", "project_discussion", "support_call"];
  if (type && valid.includes(type)) return type;
  return null;
};

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // parse request body
    const body = await req.json();

    // validate request body
    const result = createClientLocalSchema.safeParse(body);

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
      audioUrl,
      interactionType
    } = result.data;

    // Verify the userId matches the authenticated user (prevent privilege escalation)
    if (userId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot create client for another user" },
        { status: 403 }
      );
    }

    // check if client already exists
    const conditions = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    if (conditions.length > 0) {
      const existingClient = await prisma.client.findFirst({
        where: {
          userId,
          OR: conditions,
        },
      });

      if (existingClient) {
        return NextResponse.json(
          {
            success: false,
            message: "Client already exists!",
          },
          { status: 409 }
        );
      }
    }

    // hash default password for the client
    const defaultPasswordHash = await hashPassword("ChangeMe123!");

    // create client
    const newClient = await prisma.$transaction(async (tx) => {
      const client = await tx.client.create({
        data: {
          userId,
          name,
          type: mapPersonTypeToClientType(type),
          email: email || "",
          phone: phone || "",
          tags: tags || [],
          address: "",
          dob: new Date("1970-01-01"),
          passwordHash: defaultPasswordHash,
        },
      });

      if (notes || audioUrl || interactionType) {
        await tx.interaction.create({
          data: {
            userId,
            clientId: client.id,
            notes,
            audioUrl,
            interactionType: mapInteractionType(interactionType),
          },
        });
      }

      return client;
    });

    // success response
    return NextResponse.json(
      {
        success: true,
        message: "Client created successfully",
        data: newClient
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating client:", error);

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
        const clients = await prisma.client.findMany({
            where: {
                userId: user.id,
            },
            include: {
                interactions: {
                    orderBy: {
                        interactionDate: "desc",
                    },
                    take: 5, // Get last 5 interactions
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        return NextResponse.json(clients, { status: 200 });
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}