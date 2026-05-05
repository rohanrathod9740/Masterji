import { forwardJson } from "@/lib/backend-api";

export const runtime = "nodejs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  return forwardJson(`/api/v1/persons/edit/${id}`, { method: "PUT", body });
}
