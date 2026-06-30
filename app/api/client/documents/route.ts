import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** GET /api/client/documents — returns documents belonging to the authenticated client */
export async function GET() {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // Look up the ClientProfile id for this user
  const clientProfile = await prisma.clientProfile.findUnique({
    where: { userId: client.id },
    select: { id: true },
  });

  if (!clientProfile) {
    return NextResponse.json({ success: false, message: "Client profile not found." }, { status: 404 });
  }

  const documents = await prisma.document.findMany({
    where: {
      clientId:  clientProfile.id,
      deletedAt: null,  // exclude soft-deleted
    },
    orderBy: { createdAt: "desc" },
    select: {
      id:            true,
      fileName:      true,
      fileType:      true,
      fileUrl:       true,
      fileSizeBytes: true,
      category:      true,
      accessLevel:   true,
      scanStatus:    true,
      createdAt:     true,
    },
  });

  return NextResponse.json({ success: true, data: documents });
}
