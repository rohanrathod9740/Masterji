import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/client/documents — returns attachments belonging to the authenticated client */
export async function GET() {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.attachment.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileUrl: true,
      fileSize: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, data: documents });
}
