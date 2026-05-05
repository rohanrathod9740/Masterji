import { forwardJson } from "@/lib/backend-api";

export const runtime = "nodejs";

export async function POST() {
  return forwardJson("/api/v1/auth/logout", { method: "POST" });
}
