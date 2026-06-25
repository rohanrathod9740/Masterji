import { getCurrentClient } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@/prisma/migrations/client";
import { listConsultantsSchema } from "@/schemas/consultantUsersSchema";
import { NextRequest, NextResponse } from "next/server";
import type { ConsultantCardData } from "@/types";

// ── GET /api/client/consultants ───────────────────────────────────────────
// Returns a paginated list of consultant users, optionally filtered by tag.
// Requires an authenticated client session.

export async function GET(req: NextRequest) {
  try {
    // ── 1. Auth ────────────────────────────────────────────────────────────
    const client = await getCurrentClient();
    if (!client) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // ── 2. Parse + validate query params ──────────────────────────────────
    const raw = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = listConsultantsSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tag, search, skip = 0, take = 20 } = parsed.data;

    // ── 3. Build where clause ──────────────────────────────────────────────
    const where: Prisma.UserWhereInput = {};

    // Tag filter — match any user whose consultantTags include this tag name
    if (tag) {
      where.consultantTags = {
        some: { name: tag },
      };
    }

    // Search filter — case-insensitive match on name or consultancy name
    if (search) {
      where.OR = [
        { name:              { contains: search, mode: "insensitive" } },
        { nameOfConsultancy: { contains: search, mode: "insensitive" } },
      ];
    }

    // ── 4. Query ───────────────────────────────────────────────────────────
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { avgReviews: "desc" },
        select: {
          id:                true,
          name:              true,
          nameOfConsultancy: true,
          profilePicture:    true,
          headline:          true,
          bio:               true,
          designation:       true,
          yearsOfExperience: true,
          city:              true,
          country:           true,
          avgReviews:        true,
          appointmentFee:    true,
          isFeatured:        true,
          isVerified:        true,
          consultantTags: {
            select: { name: true },
          },
          _count: {
            select: { review: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // ── 5. Shape into ConsultantCardData ───────────────────────────────────
    const consultants: ConsultantCardData[] = users.map((u) => ({
      id:                u.id,
      name:              u.name ?? "Unknown",
      nameOfConsultancy: u.nameOfConsultancy,
      profilePicture:    u.profilePicture,
      headline:          u.headline,
      bio:               u.bio,
      designation:       u.designation,
      yearsOfExperience: u.yearsOfExperience,
      city:              u.city,
      country:           u.country,
      avgReviews:        u.avgReviews,
      reviewCount:       u._count.review,
      appointmentFee:    u.appointmentFee,
      specialties:       u.consultantTags.map((t) => t.name),
      featured:          u.isFeatured,
      isVerified:        u.isVerified,
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