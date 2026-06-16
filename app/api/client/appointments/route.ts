import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/client/appointments — returns the authenticated client's appointments */
export async function GET() {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { clientId: client.id },
    orderBy: { appointmentDate: "desc" },
    select: {
      id: true,
      appointmentDate: true,
      appointmentTime: true,
      meetingMode: true,
      status: true,
      purpose: true,
    },
  });

  return NextResponse.json({ success: true, data: appointments });
}
