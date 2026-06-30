import { redirect } from "next/navigation";
import { getCurrentClient } from "@/lib/auth";
import ClientDashboard from "./ClientDashboard";
import { prisma } from "@/lib/db";

export default async function Page() {
  const user = await getCurrentClient();

  if (!user) {
    redirect("/client/login");
  }

  // Resolve the ClientProfile
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, fullName: true },
  });

  if (!clientProfile) {
    redirect("/client/login");
  }

  // Fetch appointments for this client profile
  const rawAppointments = await prisma.appointment.findMany({
    where: { clientId: clientProfile.id },
    orderBy: { scheduledStart: "asc" },
    select: {
      id:             true,
      scheduledStart: true,
      scheduledEnd:   true,
      mode:           true,
      status:         true,
      purpose:        true,
      consultant: {
        select: { fullName: true, designation: true },
      },
    },
  });

  // Normalise dates to ISO strings for safe client serialisation
  const appointments = rawAppointments.map((a) => ({
    ...a,
    scheduledStart: a.scheduledStart.toISOString(),
    scheduledEnd:   a.scheduledEnd.toISOString(),
    mode:   a.mode   as string,
    status: a.status as string,
  }));

  return (
    <ClientDashboard
      client={{ id: clientProfile.id, name: clientProfile.fullName, email: user.email }}
      appointments={appointments}
    />
  );
}