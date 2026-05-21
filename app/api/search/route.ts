import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = request.nextUrl.searchParams.get("q")?.trim() || "";

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    const people = await prisma.person.findMany({
      where: {
        userId: user.id,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
          { tags: { hasSome: [query] } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        type: true,
      },
      take: 20,
    });

    return NextResponse.json({
      results: people.map((person) => ({
        id: person.id,
        name: person.name,
        email: person.email,
        phone: person.phone,
        type: person.type,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
