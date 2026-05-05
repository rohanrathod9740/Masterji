import { forwardJson } from "@/lib/backend-api";

export const runtime = "nodejs";

export async function GET() {
  const response = await forwardJson("/api/v1/interactions");

  if (response.status === 404) {
    return Response.json([], { status: 200 });
  }

  return response;
}

export async function POST(request: Request) {
  const body = await request.json();
  return forwardJson("/api/v1/interactions/create", { method: "POST", body });
}
