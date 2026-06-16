import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(){
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

      // --- Clients ---
      activeClientCount,
      newClientsThisMonth,
      atRiskClients,
      openCaseFollowUps,
      allActiveClients,
    ] = await Promise.all([
      // ── Appointments ──────────────────────────────────────────────────────────

      // Today's appointments
      prisma.appointment.findMany({
        where: {
          userId: user.id,
          appointmentDate: { gte: today, lt: tomorrow },
        },
        include: { client: true },
        orderBy: { appointmentDate: "asc" },
      }),

      // Upcoming appointments (tomorrow → 7 days)
      prisma.appointment.findMany({
        where: {
          userId: user.id,
          status: "scheduled",
          appointmentDate: { gte: tomorrow, lte: sevenDaysFromNow },
        },
        include: { client: true },
        orderBy: { appointmentDate: "asc" },
        take: 5,
      }),

      // Missed in last 7 days
      prisma.appointment.count({
        where: {
          userId: user.id,
          status: "missed",
          appointmentDate: { gte: new Date(today.getTime() - 7 * 86400000) },
        },
      }),

      // ── Commitments ───────────────────────────────────────────────────────────

      // Overdue: pending & past due
      prisma.commitment.findMany({
        where: {
          userId: user.id,
          status: "pending",
          dueDate: { lt: today },
        },
        include: { client: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),

      // Due today
      prisma.commitment.findMany({
        where: {
          userId: user.id,
          status: "pending",
          dueDate: { gte: today, lt: tomorrow },
        },
        include: { client: true },
        orderBy: { dueDate: "asc" },
      }),

      // Upcoming: tomorrow → 7 days
      prisma.commitment.findMany({
        where: {
          userId: user.id,
          status: "pending",
          dueDate: { gte: tomorrow, lte: sevenDaysFromNow },
        },
        include: { client: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),

      // Total pending count
      prisma.commitment.count({
        where: { userId: user.id, status: "pending" },
      }),

      // ── Interactions ──────────────────────────────────────────────────────────

      // Recent interactions
      prisma.interaction.findMany({
        where: { userId: user.id },
        include: { client: true },
        orderBy: { interactionDate: "desc" },
        take: 8,
      }),

      // Interactions without notes or transcript
      prisma.interaction.count({
        where: {
          userId: user.id,
          notes: null,
          transcript: null,
        },
      }),

      // ── Clients ───────────────────────────────────────────────────────────────

      // Total active clients
      prisma.client.count({
        where: { userId: user.id, status: "active" },
      }),

      // New clients this month
      prisma.client.count({
        where: {
          userId: user.id,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      // At-risk: active clients with no interaction in 14 days
      prisma.client.findMany({
        where: {
          userId: user.id,
          status: "active",
          interactions: {
            none: {
              interactionDate: { gte: fourteenDaysAgo },
            },
          },
        },
        orderBy: { updatedAt: "asc" },
        take: 6,
      }),

      // Open case follow-ups within 7 days
      prisma.case.findMany({
        where: {
          userId: user.id,
          status: { in: ["active", "monitoring"] },
          followUpDate: { gte: today, lte: sevenDaysFromNow },
        },
        include: { client: true },
        orderBy: { followUpDate: "asc" },
        take: 6,
      }),

      // All active clients for portfolio breakdown
      prisma.client.findMany({
        where: { userId: user.id, status: "active" },
        select: { type: true },
      }),
    ]);


    const typeCounts = allActiveClients.reduce<Record<string, number>>(
    (acc, c) => {
      const key = c.type ?? "other";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {}
  );

  // Next appointment (for countdown)
  const nextAppointment = todayAppointments.find(
    (a) => a.appointmentDate > now && a.status === "scheduled"
  );
  const minutesToNext = nextAppointment
    ? Math.round(
        (nextAppointment.appointmentDate.getTime() - now.getTime()) / 60000
      )
    : null;

    return NextResponse.json({
      appointments: {
        todayAppointments,
        upcomingAppointments,
        missedAppointments,
        nextAppointment,
      },
      commitments: {
        overdueCommitments,
        dueTodayCommitments,
        upcomingCommitments,
        pendingCount,
      },
      interactions: {
        recentInteractions,
        pendingNotesCount,
      },
      clients: {
        activeClientCount,
        newClientsThisMonth,
        atRiskClients,
        openCaseFollowUps,
        allActiveClients,
      },
      metrics: {
        typeCounts,
        minutesToNext,
      },
    })

}