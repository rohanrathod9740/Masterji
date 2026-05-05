import { forwardGetWithBody } from "@/lib/backend-api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  return forwardGetWithBody("/api/v1/auth/login", body);
}
