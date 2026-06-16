import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appointmentSchema } from "@/schemas/appointmentSchema";
import { NextRequest, NextResponse } from "next/server";
import { AppointmentStatus, MeetingMode, Prisma } from "@/prisma/migrations/client";

// GET /api/user/appointments
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }


    const  searchParams  = request.nextUrl.searchParams;
    const query = {
      userId: searchParams.get("userId"),
      clientId: searchParams.get("clientId"),
      status: searchParams.get("status"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    }
    console.log("userId",searchParams.get("userId"));

    const result= appointmentSchema.safeParse(query);

    if(!result.success) {
      return NextResponse.json(
        { message: "Validation error", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    const {userId, clientId, appointmentDate, meetingMode, status, createdDate,duration,purpose}= result.data;


    if(userId !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }
    const where: Prisma.AppointmentWhereInput = {userId};
    if (clientId) where.clientId = clientId;

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: user.id,

        ...(clientId && { clientId }),
        ...(status && { status: status }),
      },
      include: {
        client: true,
      },
      orderBy: { appointmentDate: "desc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { message: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

// POST /api/user/appointments
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const result= appointmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {userId, clientId, appointmentDate, meetingMode, status, duration, purpose} = result.data;

    // Verify client belongs to user
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client || client.userId !== user.id) {
      return NextResponse.json(
        { message: "Client not found or unauthorized" },
        { status: 404 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId,
        clientId,
        appointmentDate,
        status: status as AppointmentStatus,
        meetingMode: meetingMode as MeetingMode,
        duration,
        ...(purpose && { purpose }),
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error},
        { status: 400 }
      );
    }
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { message: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

import { z } from "zod";
