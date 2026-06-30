import { getCurrentClient } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { listConsultantsSchema } from "@/schemas/consultantUsersSchema";
import { NextRequest, NextResponse } from "next/server";
import type { ConsultantCardData } from "@/types";

// ── GET /api/client/consultants ───────────────────────────────────────────
// Returns a paginated list of consultant profiles, optionally filtered by tag/search.
// Requires an authenticated client session.
export async function GET(req: NextRequest) {
  try {
    // ── 1. Auth (Optional for discovery/onboarding) ────────────────────────
    const client = await getCurrentClient();

    // ── 2. Parse + validate query params ──────────────────────────────────
    const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = listConsultantsSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }


    const { tag, search, category, skip = 0, take = 20 } = parsed.data;


    // ── 3. Build where clause ──────────────────────────────────────────────
    const where: Prisma.ConsultantProfileWhereInput = {
      // Only show verified consultants accepting new clients
      // verificationStatus: "VERIFIED",
      user: { isActive: true },
    };

    // Category filter
    if (category) {
      where.category = category;
    }

    // Tag filter — match any profile whose tags include this tag name
    if (tag && tag !== "all") {
        where.tags = { some: { name: { equals: tag, mode: "insensitive" } } };
    }

    // Search filter — case-insensitive match on name or consultancy name
    if (search) {
      where.OR = [
        { fullName:        { contains: search, mode: "insensitive" } },
        { nameOfConsultancy: { contains: search, mode: "insensitive" } },
        { designation:     { contains: search, mode: "insensitive" } },
      ];
    }

    // ── 4. Query ───────────────────────────────────────────────────────────
    const [profiles, total] = await prisma.$transaction([
      prisma.consultantProfile.findMany({
        where,
        skip,
        take,
        orderBy: { ratingAvg: "desc" },
        select: {
          id:                true,
          fullName:          true,
          nameOfConsultancy: true,
          profilePhotoUrl:   true,
          headline:          true,
          bio:               true,
          designation:       true,
          yearsOfExperience: true,
          city:              true,
          country:           true,
          ratingAvg:         true,
          ratingCount:       true,
          consultationFee:   true,
          isFeatured:        true,
          category:          true,
          userId:            true,
          tags: {
            select: { name: true },
          },
          user: {
            select: { isVerified: true },
          },
        },
      }),
      prisma.consultantProfile.count({ where }),
    ]);

    // ── 5. Shape into ConsultantCardData ───────────────────────────────────
    const consultants: ConsultantCardData[] = profiles.map((p) => ({
      id:                p.id,        
      userId:            p.userId,                  
      fullName:          p.fullName,
      nameOfConsultancy: p.nameOfConsultancy,
      profilePhotoUrl:   p.profilePhotoUrl,
      headline:          p.headline,
      bio:               p.bio,
      designation:       p.designation,
      yearsOfExperience: p.yearsOfExperience,
      city:              p.city,
      country:           p.country,
      ratingAvg:         p.ratingAvg,
      ratingCount:       p.ratingCount,
      consultationFee:   Number(p.consultationFee),
      specialties:       p.tags.map((t) => t.name),
      featured:          p.isFeatured,
      isVerified:        p.user?.isVerified ?? false,
      category:          p.category,
    }));

    return NextResponse.json(
      {
        success: true,
        data: consultants,
        pagination: { total, skip, take },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/client/consultants]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}