import { forwardJson } from "@/lib/backend-api";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forwardJson(`/api/v1/persons/get/${id}`);
}
