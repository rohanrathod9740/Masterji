import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  PersonIcon,
  ClockIcon,
  ExclamationTriangleIcon,
   DrawingPinIcon,
  ActivityLogIcon,
   SpeakerLoudIcon,
  CheckIcon,
} from "@radix-ui/react-icons";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [dueTodayCommitments, overdueCommitments, recentInteractions] = await Promise.all([
    prisma.commitment.findMany({
      where: {
        userId: user.id,
        status: "pending",
        dueDate: { gte: today, lt: tomorrow },
      },
      include: { person: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.commitment.findMany({
      where: {
        userId: user.id,
        status: "pending",
        dueDate: { lt: today },
      },
      include: { person: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.interaction.findMany({
      where: { userId: user.id },
      include: { person: true },
      orderBy: { interactionDate: "desc" },
      take: 10,
    }),
  ]);

  const totalPeople = await prisma.person.count({
    where: { userId: user.id },
  });

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Good to see you, {user.name || user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-black">{totalPeople}</p>
          <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
            <PersonIcon className="w-3.5 h-3.5" />
            People
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{dueTodayCommitments.length}</p>
          <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
            <ClockIcon className="w-3.5 h-3.5" />
            Due Today
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{overdueCommitments.length}</p>
          <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
            <ExclamationTriangleIcon className="w-3.5 h-3.5" />
            Overdue
          </p>
        </div>
      </div>

      {/* Overdue Alerts */}
      {overdueCommitments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" />
            Overdue ({overdueCommitments.length})
          </h2>
          <div className="space-y-2">
            {overdueCommitments.map((commitment) => (
              <div key={commitment.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{commitment.title}</p>
                    <Link
                      href={`/people/${commitment.personId}`}
                      className="text-sm text-red-600 hover:underline flex items-center gap-1"
                    >
                      <PersonIcon className="w-3 h-3" />
                      {commitment.person.name}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      Due {format(commitment.dueDate, "MMM d, yyyy")}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 whitespace-nowrap flex items-center gap-1">
                    <CheckIcon className="w-3 h-3" />
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Due Today */}
      {dueTodayCommitments.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-amber-600 flex items-center gap-2">
            <DrawingPinIcon className="w-5 h-5" />
            Due Today ({dueTodayCommitments.length})
          </h2>
          <div className="space-y-2">
            {dueTodayCommitments.map((commitment) => (
              <div key={commitment.id} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{commitment.title}</p>
                    <Link
                      href={`/people/${commitment.personId}`}
                      className="text-sm text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <PersonIcon className="w-3 h-3" />
                      {commitment.person.name}
                    </Link>
                  </div>
                  <button className="px-3 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-700 whitespace-nowrap flex items-center gap-1">
                    <CheckIcon className="w-3 h-3" />
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ActivityLogIcon className="w-5 h-5" />
          Recent Activity
        </h2>
        <div className="space-y-2">
          {recentInteractions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No interactions yet. Start logging!</p>
          ) : (
            recentInteractions.map((interaction) => (
              <Link
                key={interaction.id}
                href={`/people/${interaction.personId}`}
                className="block bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <PersonIcon className="w-3.5 h-3.5 text-gray-400" />
                      {interaction.person.name}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {interaction.notes || interaction.transcript || "No notes"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {format(interaction.interactionDate, "MMM d, h:mm a")}
                    </p>
                  </div>
                  {interaction.audioUrl && (
                    <SpeakerLoudIcon className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}