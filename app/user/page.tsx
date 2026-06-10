import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format, differenceInDays, formatDistanceToNow } from "date-fns";
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarIcon,
  ActivityLogIcon,
  ArrowRightIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-red-100 text-red-700",
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function SectionHeader({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between mb-2 sm:mb-2.5">
      <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <Link
        href={href}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
      >
        View all
        <ArrowRightIcon className="w-3 h-3" />
      </Link>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/user/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const [
    overdueCommitments,
    dueTodayCommitments,
    upcomingCommitments,
    pendingCount,
    recentInteractions,
    upcomingCaseFollowUps,
  ] = await Promise.all([
    // Overdue: pending & past due
    prisma.commitment.findMany({
      where: {
        userId: user.id,
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
    // Total pending count (for metric)
    prisma.commitment.count({
      where: { userId: user.id, status: "pending" },
    }),
    // Recent interactions
    prisma.interaction.findMany({
      where: { userId: user.id },
      include: { client: true },
      orderBy: { interactionDate: "desc" },
      take: 8,
    }),
    // Upcoming case follow-ups within 7 days
    prisma.case.findMany({
      where: {
        userId: user.id,
        status: { in: ["active", "monitoring"] },
        followUpDate: { gte: today, lte: sevenDaysFromNow },
      },
      include: { client: true },
      orderBy: { followUpDate: "asc" },
      take: 10,
    }),
  ]);

  const typeColors: Record<string, string> = {
    consulting_client: "text-blue-600 bg-blue-100",
    retained_client: "text-purple-600 bg-purple-100",
    one_time_client: "text-green-600 bg-green-100",
    lead: "text-orange-600 bg-orange-100",
    other: "text-gray-600 bg-gray-100",
  };

  return (
    <div className="pb-32 px-4 sm:px-6 lg:px-0">
      {/* ── Metrics bar ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 sm:mb-6">
        <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-1">Overdue</div>
          <div className="text-xl sm:text-2xl font-semibold text-red-600">
            {overdueCommitments.length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-1">Due today</div>
          <div className="text-xl sm:text-2xl font-semibold text-amber-600">
            {dueTodayCommitments.length}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-1">Pending</div>
          <div className="text-xl sm:text-2xl font-semibold text-gray-900">
            {pendingCount}
          </div>
        </div>
        <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-1">Follow-ups (7d)</div>
          <div className="text-xl sm:text-2xl font-semibold text-teal-600">
            {upcomingCaseFollowUps.length}
          </div>
        </div>
      </div>

      {/* ── 1. Overdue commitments ── */}
      {overdueCommitments.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <SectionHeader
            icon={<ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-500" />}
            label="Overdue"
            href="/user/commitments"
          />
          <div className="bg-white rounded-lg border border-red-100 divide-y divide-gray-100 overflow-hidden">
            {overdueCommitments.map((commitment, idx) => {
              const daysOverdue = differenceInDays(today, commitment.dueDate);
              return (
                <Link
                  key={commitment.id}
                  href={`/user/commitments/${commitment.id}`}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-red-50 transition-colors"
                >
                  <div
                    className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${getAvatarColor(idx)}`}
                  >
                    {getInitials(commitment.client.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {commitment.client.name}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {commitment.title}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-red-600 bg-red-100 px-1.5 sm:px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
                    {daysOverdue}d ago
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2. Due today ── */}
      {dueTodayCommitments.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <SectionHeader
            icon={<ClockIcon className="w-3.5 h-3.5 text-amber-500" />}
            label="Due today"
            href="/user/commitments"
          />
          <div className="bg-white rounded-lg border border-amber-100 divide-y divide-gray-100 overflow-hidden">
            {dueTodayCommitments.map((commitment, idx) => (
              <Link
                key={commitment.id}
                href={`/user/commitments/${commitment.id}`}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-amber-50 transition-colors"
              >
                <div
                  className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${getAvatarColor(idx)}`}
                >
                  {getInitials(commitment.client.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {commitment.client.name}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {commitment.title}
                  </div>
                </div>
                <div className="text-xs font-semibold text-amber-600 bg-amber-100 px-1.5 sm:px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
                  Today
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}


      {/* ── 3. Upcoming commitments (tomorrow → 7 days) ── */}
      {upcomingCommitments.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <SectionHeader
            icon={<CheckCircledIcon className="w-3.5 h-3.5 text-green-500" />}
            label="Upcoming commitments"
            href="/user/commitments"
          />
          <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {upcomingCommitments.map((commitment, idx) => {
              const daysLeft = differenceInDays(commitment.dueDate, today);
              return (
                <Link
                  key={commitment.id}
                  href={`/user/commitments/${commitment.id}`}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${getAvatarColor(idx)}`}
                  >
                    {getInitials(commitment.client.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {commitment.client.name}
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {commitment.title}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-green-600 bg-green-50 px-1.5 sm:px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
                    In {daysLeft}d
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. Upcoming case follow-ups ── */}
      {upcomingCaseFollowUps.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <SectionHeader
            icon={<CalendarIcon className="w-3.5 h-3.5 text-teal-500" />}
            label="Case follow-ups"
            href="/user/cases"
          />
          <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {upcomingCaseFollowUps.map((caseItem) => {
              const daysUntil = differenceInDays(caseItem.followUpDate!, today);
              const badgeClass =
                typeColors[caseItem.client.type ?? ""] ??
                "text-gray-600 bg-gray-100";
              return (
                <Link
                  key={caseItem.id}
                  href={`/user/cases/${caseItem.id}`}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-teal-500 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {caseItem.client.name}
                      <span className="font-normal text-gray-500 hidden sm:inline">
                        {" "}
                        · {caseItem.client.type?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {caseItem.problem}
                    </div>
                  </div>
                  <div
                    className={`text-xs font-semibold px-1.5 sm:px-2 py-1 rounded flex-shrink-0 whitespace-nowrap ${badgeClass}`}
                  >
                    In {daysUntil}d
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5. Recent interactions ── */}
      <div>
        <SectionHeader
          icon={<ActivityLogIcon className="w-3.5 h-3.5 text-gray-500" />}
          label="Recent interactions"
          href="/user/interactions"
        />
        {recentInteractions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">No interactions yet.</p>
            <Link
              href="/user/interactions"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Log your first interaction →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {recentInteractions.map((interaction, idx) => (
              <Link
                key={interaction.id}
                href={`/user/people/${interaction.clientId}`}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 transition-colors"
              >
                <div
                  className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold ${getAvatarColor(idx)}`}
                >
                  {getInitials(interaction.client.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {interaction.client.name}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {interaction.audioUrl && (
                      <span className="hidden sm:inline">Voice note — </span>
                    )}
                    {interaction.notes || interaction.transcript || "No notes"}
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                  {formatDistanceToNow(interaction.interactionDate, {
                    addSuffix: true,
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}