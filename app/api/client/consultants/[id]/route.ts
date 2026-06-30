import { getCurrentClient } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import type { ConsultantProfileData } from "@/components/ui/client/ConsultantProfileCard";

// ── GET /api/client/consultants/[id] ────────────────────────────────────────
// Returns the full profile of a single consultant for the detail panel.
// `id` is the User.id (userId) of the consultant.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ── Auth (Optional for onboarding/discovery) ───────────────────────────
    const client = await getCurrentClient();

    const { id } = await params;

    // ── Query ConsultantProfile via userId ───────────────────────────────────
    const profile = await prisma.consultantProfile.findUnique({
      where: { id },
      select: {
        id:                true,
        userId:            true,
        fullName:          true,
        nameOfConsultancy: true,
        profilePhotoUrl:   true,
        headline:          true,
        bio:               true,
        designation:       true,
        yearsOfExperience: true,
        city:              true,
        state:             true,
        country:           true,
        timezone:          true,
        ratingAvg:         true,
        ratingCount:       true,
        consultationFee:   true,
        isFeatured:        true,
        website:           true,
        linkedinUrl:       true,
        portfolioUrl:      true,
        category:          true,

        user: {
          select: { isVerified: true },
        },

        tags: {
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

        // Reviews come from appointments → review relation
        appointments: {
          where: { review: { isNot: null } },
          select: {
            review: {
              select: {
                id:        true,
                rating:    true,
                comment:   true,
                createdAt: true,
                client: {
                  select: { fullName: true },
                },
              },
            },
          },
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Consultant not found" },
        { status: 404 }
      );
    }

    // ── Flatten reviews from the nested appointments → review structure ───────
    const reviews = profile.appointments
      .map((a) => a.review)
      .filter(Boolean)
      .map((r) => ({
        id:        r!.id,
        rating:    r!.rating,
        comment:   r!.comment ?? "",
        createdAt: r!.createdAt.toISOString(),
        client:    { name: r!.client?.fullName ?? "Client" },
      }));

    // ── Shape response to match ConsultantProfileData ────────────────────────
    const data: ConsultantProfileData = {
      id:                profile.id,          //ConsultantProfile.id 
      fullName:          profile.fullName,
      nameOfConsultancy: profile.nameOfConsultancy,
      profilePhotoUrl:   profile.profilePhotoUrl,
      headline:          profile.headline,
      bio:               profile.bio ?? "",
      designation:       profile.designation,
      yearsOfExperience: profile.yearsOfExperience,
      city:              profile.city,
      country:           profile.country,
      state:             profile.state,
      timezone:          profile.timezone,
      ratingAvg:         profile.ratingAvg,
      ratingCount:       profile.ratingCount,
      consultationFee:   Number(profile.consultationFee),
      featured:          profile.isFeatured,
      isVerified:        profile.user?.isVerified ?? false,
      website:           profile.website,
      linkedinUrl:       profile.linkedinUrl,
      portfolioUrl:      profile.portfolioUrl,
      category:          profile.category,
      specialties:       profile.tags.map((t) => t.name),
      languages:         profile.languages,
      certifications:    profile.certifications.map((c) => ({
        ...c,
        issuedAt:  c.issuedAt  ? c.issuedAt.toISOString()  : null,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      reviews,
      })),
    };

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/client/consultants/[id]]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
