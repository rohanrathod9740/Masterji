import DashboardUser from "@/components/ui/DashboardUser";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/user/login");
  }

  return (
    <div >
      <DashboardUser />
    </div>
  );
}