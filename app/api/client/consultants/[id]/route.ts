import { getCurrentClient } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// ── GET /api/client/consultants/[id] ─────────────────────────────────────────
// Returns the full profile of a single consultant for the detail panel.
// Requires an authenticated client session.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const client = await getCurrentClient();
    if (!client) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // ── Query ─────────────────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id },
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
        state:             true,
        country:           true,
        timezone:          true,
        avgReviews:        true,
        appointmentFee:    true,
        isFeatured:        true,
        isVerified:        true,
        website:           true,
        linkedinUrl:       true,
        portfolioUrl:      true,

        // Related models
        consultantTags: {
          select: { id: true, name: true },
        },
        languages: {
          select: { id: true, name: true },
        },
        certifications: {
          select: {
            id:            true,
            title:         true,
            issuer:        true,
            issuedAt:      true,
            expiresAt:     true,
            credentialUrl: true,
          },
          orderBy: { issuedAt: "desc" },
        },
        review: {
          select: {
            id:        true,
            rating:    true,
            comment:   true,
            createdAt: true,
            client: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: { review: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Consultant not found" },
        { status: 404 }
      );
    }

    // ── Shape response ────────────────────────────────────────────────────────
    const profile = {
      id:                user.id,
      name:              user.name ?? "Unknown",
      nameOfConsultancy: user.nameOfConsultancy,
      profilePicture:    user.profilePicture,
      headline:          user.headline,
      bio:               user.bio,
      designation:       user.designation,
      yearsOfExperience: user.yearsOfExperience,
      city:              user.city,
      state:             user.state,
      country:           user.country,
      timezone:          user.timezone,
      avgReviews:        user.avgReviews,
      reviewCount:       user._count.review,
      appointmentFee:    user.appointmentFee,
      featured:          user.isFeatured,
      isVerified:        user.isVerified,
      website:           user.website,
      linkedinUrl:       user.linkedinUrl,
      portfolioUrl:      user.portfolioUrl,
      specialties:       user.consultantTags.map((t) => t.name),
      languages:         user.languages,
      certifications:    user.certifications.map((c) => ({
        ...c,
        issuedAt:  c.issuedAt  ? c.issuedAt.toISOString()  : null,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString()  : null,
      })),
      reviews: user.review.map((r) => ({
        id:        r.id,
        rating:    r.rating,
        comment:   r.comment,
        createdAt: r.createdAt.toISOString(),
        client:    r.client,
      })),
    };

    return NextResponse.json({ success: true, data: profile }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/client/consultants/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
