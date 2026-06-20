import { redirect } from "next/navigation";
import { getCurrentClient } from "@/lib/auth";
import ClientDashboard from "./ClientDashboard";
import { prisma } from "@/lib/db";

export default async function Page() {
  const person = await getCurrentClient();

  if (!person) {
    redirect("/client/login");
  }

  const [client, rawAppointments] = await Promise.all([
    prisma.client.findUnique({
      where: { id: person.id },
      select: { id: true, name: true, email: true },
    }),
    prisma.appointment.findMany({
      where: { clientId: person.id },
      orderBy: { appointmentDate: "asc" },
      select: {
        id: true,
        appointmentDate: true,
        appointmentTime: true,
        meetingMode: true,
        status: true,
        purpose: true,
      },
    }),
  ]);

  if (!client) {
    redirect("/client/login");
  }

  // ✅ Convert Date → string here so it matches the Appointment type
  const appointments = rawAppointments.map((a) => ({
    ...a,
    appointmentDate: a.appointmentDate.toISOString().split("T")[0], // "YYYY-MM-DD"
    meetingMode: a.meetingMode as string,
    status: a.status as string,
  }));

  return <ClientDashboard client={client} appointments={appointments} />;
}