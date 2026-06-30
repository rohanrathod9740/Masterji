import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Resolve ConsultantProfile id for this user
  const consultantProfile = await prisma.consultantProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!consultantProfile) {
    return NextResponse.json({ error: "Consultant profile not found." }, { status: 404 });
  }

  const consultantId = consultantProfile.id;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 14);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [
    // --- Appointments ---
    todayAppointments,
    upcomingAppointments,
    missedAppointments,

    // --- Commitments ---
    overdueCommitments,
    dueTodayCommitments,
    upcomingCommitments,
    pendingCount,

    // --- Interactions ---
    recentInteractions,
    pendingNotesCount,

    // --- Cases & Clients ---
    activeCaseCount,
    newCasesThisMonth,
    atRiskCases,
    upcomingCommitmentsCount,
    allActiveCases,
  ] = await Promise.all([
    // ── Appointments ──────────────────────────────────────────────────────────

    // Today's appointments
    prisma.appointment.findMany({
      where: {
        consultantId,
        scheduledStart: { gte: today, lt: tomorrow },
      },
      include: {
        client: { select: { id: true, fullName: true } },
        case:   { select: { id: true, title: true } },
      },
      orderBy: { scheduledStart: "asc" },
    }),

    // Upcoming appointments (tomorrow → 7 days)
    prisma.appointment.findMany({
      where: {
        consultantId,
        status: "APPROVED",
        scheduledStart: { gte: tomorrow, lte: sevenDaysFromNow },
      },
      include: {
        client: { select: { id: true, fullName: true } },
      },
      orderBy: { scheduledStart: "asc" },
      take: 5,
    }),

    // No-shows in last 7 days
    prisma.appointment.count({
      where: {
        consultantId,
        status: "NO_SHOW",
        scheduledStart: { gte: new Date(today.getTime() - 7 * 86400000) },
      },
    }),

    // ── Commitments ───────────────────────────────────────────────────────────

    // Overdue: pending & past due
    prisma.commitment.findMany({
      where: {
        consultantId,
        status: "PENDING",
        dueDate: { lt: today },
      },
      include: {
        client: { select: { id: true, fullName: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),

    // Due today
    prisma.commitment.findMany({
      where: {
        consultantId,
        status: "PENDING",
        dueDate: { gte: today, lt: tomorrow },
      },
      include: {
        client: { select: { id: true, fullName: true } },
      },
      orderBy: { dueDate: "asc" },
    }),

    // Upcoming: tomorrow → 7 days
    prisma.commitment.findMany({
      where: {
        consultantId,
        status: "PENDING",
        dueDate: { gte: tomorrow, lte: sevenDaysFromNow },
      },
      include: {
        client: { select: { id: true, fullName: true } },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),

    // Total pending count
    prisma.commitment.count({
      where: { consultantId, status: "PENDING" },
    }),

    // ── Interactions ──────────────────────────────────────────────────────────

    // Recent interactions
    prisma.interaction.findMany({
      where: { consultantId, deletedAt: null },
      include: {
        client: { select: { id: true, fullName: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: 8,
    }),

    // Interactions without notes or transcript
    prisma.interaction.count({
      where: {
        consultantId,
        deletedAt: null,
        notesText:     null,
        transcriptText: null,
      },
    }),

    // ── Cases (replaces "Clients" in old dashboard) ───────────────────────────

    // Total active cases
    prisma.case.count({
      where: { consultantId, status: "ACTIVE" },
    }),

    // New cases this month
    prisma.case.count({
      where: {
        consultantId,
        openedAt: { gte: thirtyDaysAgo },
      },
    }),

    // At-risk: active cases with no interaction in 14 days
    prisma.case.findMany({
      where: {
        consultantId,
        status: "ACTIVE",
        interactions: {
          none: {
            occurredAt: { gte: fourteenDaysAgo },
            deletedAt: null,
          },
        },
      },
      include: {
        client: { select: { id: true, fullName: true } },
      },
      orderBy: { updatedAt: "asc" },
      take: 6,
    }),

    // Open commitments due in next 7 days (for follow-ups)
    prisma.commitment.count({
      where: {
        consultantId,
        status: { in: ["PENDING", "IN_PROGRESS"] },
        dueDate: { gte: today, lte: sevenDaysFromNow },
      },
    }),

    // All active cases for category breakdown
    prisma.case.findMany({
      where: { consultantId, status: "ACTIVE" },
      select: { category: true },
    }),
  ]);

  // ── Derive next appointment & countdown ───────────────────────────────────────
  const nextAppointment = todayAppointments.find(
    (a) => a.scheduledStart > now && a.status === "APPROVED"
  );
  const minutesToNext = nextAppointment
    ? Math.round(
        (nextAppointment.scheduledStart.getTime() - now.getTime()) / 60000
      )
    : null;

  // Category breakdown
  const categoryCounts = allActiveCases.reduce<Record<string, number>>(
    (acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // ── Shape data to match DashboardUser.tsx expected types ─────────────────────

  const mapClient = (c: { id: string; fullName: string }) => ({
    id: c.id,
    name: c.fullName,
  });

  const mappedTodayAppointments = todayAppointments.map((a) => ({
    id: a.id,
    appointmentDate: a.scheduledStart.toISOString(),
    status: a.status,
    purpose: a.purpose ?? null,
    meetingMode: a.mode,
    duration: Math.round(
      (a.scheduledEnd.getTime() - a.scheduledStart.getTime()) / 3600000
    ),
    client: mapClient(a.client),
  }));

  const mappedUpcomingAppointments = upcomingAppointments.map((a) => ({
    id: a.id,
    appointmentDate: a.scheduledStart.toISOString(),
    status: a.status,
    purpose: a.purpose ?? null,
    meetingMode: a.mode,
    duration: Math.round(
      (a.scheduledEnd.getTime() - a.scheduledStart.getTime()) / 3600000
    ),
    client: mapClient(a.client),
  }));

  const mappedNextAppointment = nextAppointment
    ? {
        id: nextAppointment.id,
        appointmentDate: nextAppointment.scheduledStart.toISOString(),
        status: nextAppointment.status,
        purpose: nextAppointment.purpose ?? null,
        meetingMode: nextAppointment.mode,
        duration: Math.round(
          (nextAppointment.scheduledEnd.getTime() -
            nextAppointment.scheduledStart.getTime()) /
            3600000
        ),
        client: mapClient(nextAppointment.client),
      }
    : undefined;

  const mapCommitment = (c: {
    id: string;
    title: string;
    dueDate: Date;
    status: string;
    client: { id: string; fullName: string };
  }) => ({
    id: c.id,
    title: c.title,
    dueDate: c.dueDate.toISOString(),
    status: c.status,
    client: mapClient(c.client),
  });

  const mappedOverdueCommitments = overdueCommitments.map(mapCommitment);
  const mappedDueTodayCommitments = dueTodayCommitments.map(mapCommitment);
  const mappedUpcomingCommitments = upcomingCommitments.map(mapCommitment);

  const mappedRecentInteractions = recentInteractions.map((i) => ({
    id: i.id,
    interactionDate: i.occurredAt.toISOString(),
    interactionType: i.type,
    notes: i.notesText ?? null,
    transcript: i.transcriptText ?? null,
    client: mapClient(i.client),
  }));

  const mappedAtRiskCases = atRiskCases.map((c) => ({
    id: c.id,
    title: c.title ?? null,
    description: c.description ?? null,
    client: { id: c.client.id, fullName: c.client.fullName },
  }));

  return NextResponse.json({
    appointments: {
      todayAppointments: mappedTodayAppointments,
      upcomingAppointments: mappedUpcomingAppointments,
      missedAppointments,
      nextAppointment: mappedNextAppointment,
    },
    commitments: {
      overdueCommitments: mappedOverdueCommitments,
      dueTodayCommitments: mappedDueTodayCommitments,
      upcomingCommitments: mappedUpcomingCommitments,
      pendingCount,
    },
    interactions: {
      recentInteractions: mappedRecentInteractions,
      pendingNotesCount,
    },
    cases: {
      activeCaseCount,
      newCasesThisMonth,
      atRiskCases: mappedAtRiskCases,
      upcomingCommitmentsCount,
    },
    metrics: {
      categoryCounts,
      minutesToNext,
    },
  });
}