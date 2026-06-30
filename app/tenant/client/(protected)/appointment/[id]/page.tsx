import AppointmentForm from "./AppointmentForm";

export default async function ClientOnboardingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const today = new Date().toISOString().split("T")[0];

  const prefill = {
    scheduledStart: today,
  };

  return <AppointmentForm consultantId={id} prefill={prefill} />;
}
