import { redirect } from "next/navigation";

export default function LegacyAddPersonPage() {
  redirect("/people/new");
}
