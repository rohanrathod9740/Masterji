import { forwardJson } from "@/lib/backend-api";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forwardJson(`/api/v1/interactions/${id}`);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  return forwardJson(`/api/v1/interactions/edit/${id}`, {
    method: "PUT",
    body,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forwardJson(`/api/v1/interactions/delete/${id}`, {
    method: "DELETE",
  });
}
