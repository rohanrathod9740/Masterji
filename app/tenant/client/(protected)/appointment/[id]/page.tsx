import { getCurrentClient } from "@/lib/auth";
import AppointmentForm from "./AppointmentForm";

export default async function ClientOnboardingPage() {
  const client = await getCurrentClient();

  const today = new Date().toISOString().split("T")[0];

  // Build prefill from whatever the logged-in client has on record
  const prefill = {
    appointmentDate: today, // Default to today's date

    ...(client && {
      name: client.name ?? undefined,
      email: client.email ?? undefined,
      phone: client.phone ?? undefined,
      dob: client.dob
        ? new Date(client.dob).toISOString().split("T")[0]
        : undefined,
      address: client.address ?? undefined,
      companyName: client.companyName ?? undefined,
      type: client.type ?? undefined,
      tags: client.tags?.length
        ? client.tags.join(", ")
        : undefined,
    }),
  };

  return <AppointmentForm prefill={prefill} />;
}
