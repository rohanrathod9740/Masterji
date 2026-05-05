import { forwardJson } from "@/lib/backend-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  return forwardJson("/api/v1/persons/create", { method: "POST", body });
}
