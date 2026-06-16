import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appointmentUpdateSchema } from "@/schemas/appointmentSchema";
import { AppointmentStatus, MeetingMode } from "@/prisma/migrations/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type Params = {
  id: string;
};

// GET /api/user/appointments/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {

      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        client: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.userId !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { message: "Failed to fetch appointment" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/appointments/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.userId !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = appointmentUpdateSchema.parse(body);


    // If clientId is being updated, verify it belongs to user
    if (validatedData.clientId) {
      const client = await prisma.client.findUnique({
        where: { id: validatedData.clientId },
      });

      if (!client || client.userId !== user.id) {
        return NextResponse.json(
          { message: "Client not found or unauthorized" },
          { status: 404 }
        );
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        ...(validatedData.appointmentDate && {
          appointmentDate: new Date(validatedData.appointmentDate),
        }),
        ...(validatedData.status && {
          status: validatedData.status as AppointmentStatus,
        }),
        ...(validatedData.meetingMode && {
          meetingMode: validatedData.meetingMode as MeetingMode,
        }),
        ...(validatedData.duration && { duration: validatedData.duration }),
        ...(validatedData.purpose !== undefined && { purpose: validatedData.purpose }),
      },
      include: {
        client: true,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error},
        { status: 400 }
      );
    }
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { message: "Failed to update appointment" },
      { status: 500 }
    );
  }
}

// DELETE /api/user/appointments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
    });

    if (!appointment) {
      return NextResponse.json(
        { message: "Appointment not found" },
        { status: 404 }
      );
    }

    if (appointment.userId !== user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 403 }
      );
    }

    await prisma.appointment.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Appointment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { message: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
