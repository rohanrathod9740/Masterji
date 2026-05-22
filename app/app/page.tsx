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
  SpeakerLoudIcon,
} from "@radix-ui/react-icons";
import { SearchBar } from "@/components/ui/SearchBar";

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

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 7 days from today
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const [dueTodayCommitments, overdueCommitments, recentInteractions, upcomingCaseFollowUps] = await Promise.all([
    prisma.commitment.findMany({
      where: {
        userId: user.id,
        status: "pending",
        dueDate: { gte: today, lt: tomorrow },
      },
      include: { person: true },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    prisma.commitment.findMany({
      where: {
        userId: user.id,
        status: "pending",
        dueDate: { lt: today },
      },
      include: { person: true },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),
    prisma.interaction.findMany({
      where: { userId: user.id },
      include: { person: true },
      orderBy: { interactionDate: "desc" },
      take: 10,
    }),
    prisma.case.findMany({
      where: {
        userId: user.id,
        status: { in: ["active", "monitoring"] },
        followUpDate: { gte: today, lte: sevenDaysFromNow },
      },
      include: { person: true },
      orderBy: { followUpDate: "asc" },
      take: 10,
    }),
  ]);

  return (
    <div className="pb-32 px-4 sm:px-6 lg:px-0">
      {/* Metrics Grid - Responsive: 2 cols on mobile, 3 on desktop */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4 sm:mb-5 relative">
        <div className="w-full bg-white rounded-lg p-2.5 sm:p-3 border border-gray-100">
          <div className="text-xs font-medium text-gray-600 mb-1">Overdue</div>
          <div className="text-xl sm:text-2xl font-semibold text-red-600">{overdueCommitments.length}</div>
        </div>
        <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-100">
          <div className="text-xs font-medium text-gray-600 mb-1">Due today</div>
          <div className="text-xl sm:text-2xl font-semibold text-gray-900">{dueTodayCommitments.length}</div>
        </div>
        <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-100 col-span-2 sm:col-span-1">
          <div className="text-xs font-medium text-gray-600 mb-1">Follow-ups (7d)</div>
          <div className="text-xl sm:text-2xl font-semibold text-gray-900">{upcomingCaseFollowUps.length}</div>
        </div>
      </div>

      {/* Overdue Section */}
      {overdueCommitments.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2 sm:mb-2.5 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
            Overdue
          </div>
          <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {overdueCommitments.map((commitment, idx) => {
              const daysOverdue = differenceInDays(today, commitment.dueDate);
              return (
                <Link
                  key={commitment.id}
                  href={`/app/people/${commitment.personId}`}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-10px sm:text-11px font-semibold ${getAvatarColor(idx)}`}>
                    {getInitials(commitment.person.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-sm font-semibold text-gray-900 truncate">{commitment.person.name}</div>
                    <div className="text-xs text-gray-600 truncate">{commitment.title}</div>
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

      {/* Due Today Section */}
      {dueTodayCommitments.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2 sm:mb-2.5 flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            Due today
          </div>
          <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {dueTodayCommitments.map((commitment, idx) => (
              <Link
                key={commitment.id}
                href={`/app/people/${commitment.personId}`}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-10px sm:text-11px font-semibold ${getAvatarColor(idx)}`}>
                  {getInitials(commitment.person.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-sm font-semibold text-gray-900 truncate">{commitment.person.name}</div>
                  <div className="text-xs text-gray-600 truncate">{commitment.title}</div>
                </div>
                <div className="text-xs font-semibold text-amber-600 bg-amber-100 px-1.5 sm:px-2 py-1 rounded flex-shrink-0 whitespace-nowrap">
                  Today
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Case Follow-ups Section */}
      {upcomingCaseFollowUps.length > 0 && (
        <div className="mb-4 sm:mb-5">
          <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2 sm:mb-2.5 flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upcoming case follow-ups</span>
            <span className="sm:hidden">Follow-ups</span>
          </div>
          <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {upcomingCaseFollowUps.map((caseItem, idx) => {
              const daysUntil = differenceInDays(caseItem.followUpDate!, today);
              const categoryColors: Record<string , string> = {
                health: "text-orange-600 bg-orange-100",
                astrology: "text-purple-600 bg-purple-100",
                business: "text-green-600 bg-green-100",
                null: "text-gray-600 bg-gray-100",
              };
              const badgeClass = categoryColors[caseItem.category ?? "default"] ;
              return (
                <Link
                  key={caseItem.id}
                  href={`/app/cases/${caseItem.id}`}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0 bg-teal-600"></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {caseItem.person.name} <span className="font-normal text-gray-500 hidden sm:inline">· {caseItem.category}</span>
                    </div>
                    <div className="text-xs text-gray-600 truncate">{caseItem.problem}</div>
                  </div>
                  <div className={`text-xs font-semibold px-1.5 sm:px-2 py-1 rounded flex-shrink-0 whitespace-nowrap ${badgeClass}`}>
                    In {daysUntil}d
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Interactions Section */}
      <div>
        <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2 sm:mb-2.5 flex items-center gap-1">
          <ActivityLogIcon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Recent interactions</span>
          <span className="sm:hidden">Recent</span>
        </div>
        {recentInteractions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-6 text-center text-gray-500 text-sm">
            No interactions yet. Start logging!
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {recentInteractions.map((interaction, idx) => (
              <Link
                key={interaction.id}
                href={`/app/people/${interaction.personId}`}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-50 transition-colors"
              >
                <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-10px sm:text-11px font-semibold ${getAvatarColor(idx)}`}>
                  {getInitials(interaction.person.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm sm:text-sm font-semibold text-gray-900 truncate">{interaction.person.name}</div>
                  <div className="text-xs text-gray-600 truncate">
                    {interaction.audioUrl && <span className="hidden sm:inline">Voice note — </span>}
                    {interaction.notes || interaction.transcript || "No notes"}
                  </div>
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                  {formatDistanceToNow(interaction.interactionDate, { addSuffix: true })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}