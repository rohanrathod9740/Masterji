import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface SearchResult {
  id: string;
  name: string;
  type: string;
  subtitle?: string;
  category?: string;
  status?: string;
}

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

    const results: SearchResult[] = [];

    // Search Clients
    const clients = await prisma.client.findMany({
      where: {
        userId: user.id,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
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
      take: 10,
    });

    results.push(
      ...clients.map((client) => ({
        id: client.id,
        name: client.name,
        type: "client" as const,
        subtitle: client.email || client.phone || undefined,
        category: client.type || undefined,
      }))
    );

    // Search Cases
    const cases = await prisma.case.findMany({
      where: {
        userId: user.id,
        OR: [
          { problem: { contains: query, mode: "insensitive" } },
          { diagnosis: { contains: query, mode: "insensitive" } },
          { client: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        client: {
          select: { name: true, type: true },
        },
      },
      take: 5,
    });

    results.push(
      ...cases.map((caseItem) => ({
        id: caseItem.id,
        name: caseItem.problem || "Untitled Case",
        type: "case" as const,
        subtitle: `with ${caseItem.client.name}`,
        category: caseItem.client.type || undefined,
        status: caseItem.status,
      }))
    );

    // Search Commitments
    const commitments = await prisma.commitment.findMany({
      where: {
        userId: user.id,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { client: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        client: {
          select: { name: true },
        },
      },
      take: 5,
    });

    results.push(
      ...commitments.map((commitment) => ({
        id: commitment.id,
        name: commitment.title,
        type: "commitment" as const,
        subtitle: `Remember to ${commitment.title} with ${commitment.client.name}`,
        status: commitment.status,
      }))
    );

    // Search Interactions
    const interactions = await prisma.interaction.findMany({
      where: {
        userId: user.id,
        OR: [
          { notes: { contains: query, mode: "insensitive" } },
          { transcript: { contains: query, mode: "insensitive" } },
          { client: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        client: {
          select: { name: true },
        },
      },
      orderBy: {
        interactionDate: "desc",
      },
      take: 5,
    });

    results.push(
      ...interactions.map((interaction) => ({
        id: interaction.id,
        name: interaction.interactionType || "Interaction",
        type: "interaction" as const,
        subtitle: `with ${interaction.client.name}`,
        category: interaction.interactionType || undefined,
      }))
    );

    // Limit total results to 25
    const limitedResults = results.slice(0, 25);

    return NextResponse.json({
      results: limitedResults,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
