import { forwardJson } from "@/lib/backend-api";

export const runtime = "nodejs";

export async function GET() {
  return forwardJson("/api/v1/persons");
}
