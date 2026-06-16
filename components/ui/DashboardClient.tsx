"use client";
import { useState, useEffect, useCallback } from "react";
import { differenceInDays, formatDistanceToNow, format } from "date-fns";
import SectionNav from "./SectionNav";
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarIcon,
  ActivityLogIcon,
  ArrowRightIcon,
  CheckCircledIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";



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

const typeColors: Record<string, string> = {
  individual: "text-blue-700 bg-blue-100",
  corporate: "text-purple-700 bg-purple-100",
  ngo: "text-teal-700 bg-teal-100",
  government: "text-amber-700 bg-amber-100",
  other: "text-gray-600 bg-gray-100",
};



// ── Types matching the actual API response shape ──────────────────────────────

type AppointmentItem = {
  id: string;
  appointmentDate: string;
  status: string;
  purpose?: string | null;
  meetingMode?: string | null;
  duration?: number | null;
  client: { id: string; name: string };
};

type CommitmentItem = {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  client: { id: string; name: string };
};

type InteractionItem = {
  id: string;
  interactionDate: string;
  interactionType?: string | null;
  notes?: string | null;
  transcript?: string | null;
  client: { id: string; name: string };
};

type ClientItem = {
  id: string;
  name: string;
  companyName?: string | null;
  type?: string | null;
  status: string;
};

type CaseItem = {
  id: string;
  problem?: string | null;
  followUpDate?: string | null;
  client: { id: string; name: string };
};

type DashboardData = {
  appointments: {
    todayAppointments: AppointmentItem[];
    upcomingAppointments: AppointmentItem[];
    missedAppointments: number;
    nextAppointment?: AppointmentItem;
  };
  commitments: {
    overdueCommitments: CommitmentItem[];
    dueTodayCommitments: CommitmentItem[];
    upcomingCommitments: CommitmentItem[];
    pendingCount: number;
  };
  interactions: {
    recentInteractions: InteractionItem[];
    pendingNotesCount: number;
  };
  clients: {
    activeClientCount: number;
    newClientsThisMonth: number;
    atRiskClients: ClientItem[];
    openCaseFollowUps: CaseItem[];
    allActiveClients: { type?: string | null }[];
  };
  metrics: {
    typeCounts: Record<string, number>;
    minutesToNext: number | null;
  };
};



function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}


const interactionTypeLabels: Record<string, string> = {
  consultation: "Consultation",
  meeting: "Meeting",
  call: "Call",
  treatment_session: "Treatment",
  review_meeting: "Review",
  project_discussion: "Discussion",
  support_call: "Support",
};



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

export default function DashboardClient() {
  const [activeSection, setActiveSection] = useState("appointments");
  const [fetchedData, setFetchedData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/dashboard");
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const data: DashboardData = await response.json();
      setFetchedData(data);
    } catch (err) {
      setError("Failed to load dashboard. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!fetchedData) return null;

  const typeCounts = fetchedData.clients.allActiveClients.reduce<Record<string, number>>(
    (acc, c) => {
      const key = c.type ?? "other";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const atRiskClients = fetchedData.clients.atRiskClients;
  const openCaseFollowUps = fetchedData.clients.openCaseFollowUps;

  return (
    <div className="pb-28 space-y-5">
      <h1>Client Dashboard</h1>

    <div className="m-auto size-fit block p-5">
        <SectionNav selectedSection={activeSection} onSelect={setActiveSection} />
    </div>


   {activeSection === "appointments" && <>

   <section id="appointments">
        <SectionHeader
          icon={<CalendarIcon className="w-4 h-4" />}
          label="Appointments"
          href="/appointments"
   />

   {/* Metrics row */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div className="stat-card">
        <div className="text-xs text-gray-500 mb-1">Today</div>
        <div className="text-xl font-bold text-slate-900">
          {fetchedData.appointments.todayAppointments.length}
        </div>
      </div>
      <div className="stat-card">
        <div className="text-xs text-gray-500 mb-1">This week</div>
        <div className="text-xl font-bold text-slate-900">
          {fetchedData.appointments.upcomingAppointments.length}
        </div>
      </div>
      <div className="stat-card">
        <div className="text-xs text-gray-500 mb-1">Missed (7d)</div>
        <div className="text-xl font-bold text-red-600">
          {fetchedData.appointments.missedAppointments}
        </div>
      </div>
      <div className="stat-card">
        <div className="text-xs text-gray-500 mb-1">Follow-ups</div>
        <div className="text-xl font-bold text-teal-600">
          {fetchedData.clients.openCaseFollowUps.length}
        </div>
      </div>
    </div>

    {/* Today's appointment list */}
    {fetchedData.appointments.todayAppointments.length === 0 ? (
      <p className="text-sm text-gray-400 py-4 text-center">
        No appointments today
      </p>
    ) : (
      <div className="space-y-2">
        {fetchedData.appointments.todayAppointments.map((appt, i) => {
          const isNext =
            fetchedData.appointments.nextAppointment && appt.id === fetchedData.appointments.nextAppointment.id;
          return (
            <Link
              key={appt.id}
              href={`/appointments/${appt.id}`}
              className={`flex items-center gap-3 p-3 rounded-lg border text-sm hover:bg-gray-50 transition-colors ${
                isNext
                  ? "border-blue-300 bg-blue-50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${getAvatarColor(i)}`}
              >
                {getInitials(appt.client.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {appt.client.name}
                </div>
                <div className="text-xs text-gray-500">
                  {appt.purpose ?? "No purpose set"} ·{" "}
                  {appt.meetingMode === "office_meet"
                    ? "In office"
                    : appt.meetingMode === "online_meet"
                      ? "Online"
                      : "Other"}
                </div>
              </div>
              <div className="text-xs text-gray-500 flex-shrink-0 text-right">
                <div>{format(appt.appointmentDate, "h:mm a")}</div>
                <div>{appt.duration}h</div>
              </div>
              {isNext && (
                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  Next
                </span>
              )}
            </Link>
          );
        })}
      </div>
    )}
    </section>
   </>}


   {activeSection === "commitments" && <>

   <section id="commitments">
  <SectionHeader
    icon={<CheckCircledIcon className="w-4 h-4" />}
    label="Commitments"
    href="/commitments"
  />

  {/* Overdue */}
  {fetchedData.commitments.overdueCommitments.length > 0 && (
    <div className="mb-4">
      <div className="text-xs font-semibold text-red-600 uppercase tracking-wide flex items-center gap-1 mb-2">
        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
        Overdue ({fetchedData.commitments.overdueCommitments.length})
      </div>
      <div className="space-y-2">
        {fetchedData.commitments.overdueCommitments.map((c) => (
          <Link
            key={c.id}
            href={`/commitments/${c.id}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50 text-sm hover:bg-red-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {c.title}
              </div>
              <div className="text-xs text-gray-500">{c.client.name}</div>
            </div>
            <div className="text-xs text-red-600 font-medium flex-shrink-0">
              {differenceInDays(new Date(), c.dueDate)}d ago
            </div>
          </Link>
        ))}
      </div>
    </div>
  )}

  {/* Due today */}
  {fetchedData.commitments.dueTodayCommitments.length > 0 && (
    <div className="mb-4">
      <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1 mb-2">
        <ClockIcon className="w-3.5 h-3.5" />
        Due today ({fetchedData.commitments.dueTodayCommitments.length})
      </div>
      <div className="space-y-2">
        {fetchedData.commitments.dueTodayCommitments.map((c) => (
          <Link
            key={c.id}
            href={`/commitments/${c.id}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-amber-100 bg-amber-50 text-sm hover:bg-amber-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {c.title}
              </div>
              <div className="text-xs text-gray-500">{c.client.name}</div>
            </div>
            <ArrowRightIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )}

  {/* Upcoming */}
  {fetchedData.commitments.upcomingCommitments.length > 0 && (
    <div>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        Upcoming this week ({fetchedData.commitments.upcomingCommitments.length})
      </div>
      <div className="space-y-2">
        {fetchedData.commitments.upcomingCommitments.map((c) => (
          <Link
            key={c.id}
            href={`/commitments/${c.id}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-white text-sm hover:bg-gray-50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {c.title}
              </div>
              <div className="text-xs text-gray-500">{c.client.name}</div>
            </div>
            <div className="text-xs text-gray-400 flex-shrink-0">
              {format(c.dueDate, "EEE, MMM d")}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )}

  {fetchedData.commitments.overdueCommitments.length === 0 &&
    fetchedData.commitments.dueTodayCommitments.length === 0 &&
    fetchedData.commitments.upcomingCommitments.length === 0 && (
      <p className="text-sm text-gray-400 py-4 text-center">
        No pending commitments
      </p>
    )}
</section>
   </>}


   {activeSection === 'interactions' && <>

   <section id="interactions">
  <SectionHeader
    icon={<ActivityLogIcon className="w-4 h-4" />}
    label="Interactions"
    href="/interactions"
  />

  {/* Metrics */}
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
    <div className="stat-card">
      <div className="text-xs text-gray-500 mb-1">Recent (7 logged)</div>
      <div className="text-xl font-bold text-slate-900">
        {fetchedData.interactions.recentInteractions.length}
      </div>
    </div>
    <div className="stat-card">
      <div className="text-xs text-gray-500 mb-1">Awaiting notes</div>
      <div className="text-xl font-bold text-amber-600">
        {fetchedData.interactions.pendingNotesCount}
      </div>
    </div>
    <div className="stat-card col-span-2 sm:col-span-1">
      <div className="text-xs text-gray-500 mb-1">
        No touch (14d)
      </div>
      <div className="text-xl font-bold text-red-500">
        {fetchedData.clients.atRiskClients.length}
      </div>
    </div>
  </div>

  {/* Recent feed */}
  <div className="space-y-2">
    {fetchedData.interactions.recentInteractions.map((interaction, i) => (
      <Link
        key={interaction.id}
        href={`/interactions/${interaction.id}`}
        className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white text-sm hover:bg-gray-50 transition-colors"
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${getAvatarColor(i)}`}
        >
          {getInitials(interaction.client.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">
              {interaction.client.name}
            </span>
            {interaction.interactionType && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {interactionTypeLabels[interaction.interactionType] ??
                  interaction.interactionType}
              </span>
            )}
            {!interaction.notes && !interaction.transcript && (
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                No notes
              </span>
            )}
          </div>
          {interaction.notes && (
            <div className="text-xs text-gray-500 truncate mt-0.5">
              {interaction.notes}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400 flex-shrink-0">
          {formatDistanceToNow(interaction.interactionDate, {
            addSuffix: true,
          })}
        </div>
      </Link>
    ))}
  </div>
</section>
   </> }


   {activeSection === 'clients' && <>


  <section id="clients">
  <SectionHeader
    icon={<PersonIcon className="w-4 h-4" />}
    label="Clients"
    href="/clients"
  />

  {/* Portfolio metrics */}
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
    <div className="stat-card">
      <div className="text-xs text-gray-500 mb-1">Active</div>
      <div className="text-xl font-bold text-slate-900">
        {fetchedData.clients.activeClientCount}
      </div>
    </div>
    <div className="stat-card">
      <div className="text-xs text-gray-500 mb-1">New (30d)</div>
      <div className="text-xl font-bold text-green-600">
        {fetchedData.clients.newClientsThisMonth}
      </div>
    </div>
    <div className="stat-card">
      <div className="text-xs text-gray-500 mb-1">At risk</div>
      <div className="text-xl font-bold text-red-500">
        {fetchedData.clients.atRiskClients.length}
      </div>
    </div>
    <div className="stat-card">
      <div className="text-xs text-gray-500 mb-1">Case follow-ups</div>
      <div className="text-xl font-bold text-teal-600">
        {fetchedData.clients.openCaseFollowUps.length}
      </div>
    </div>
  </div>

  {/* Portfolio type breakdown */}
  {Object.keys(typeCounts).length > 0 && (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.entries(typeCounts).map(([type, count]) => (
        <span
          key={type}
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[type] ?? "text-gray-600 bg-gray-100"}`}
        >
          {type.replace(/_/g, " ")} · {count}
        </span>
      ))}
    </div>
  )}

  {/* At-risk clients */}
  {atRiskClients.length > 0 && (
    <div className="mb-4">
      <div className="text-xs font-semibold text-red-600 uppercase tracking-wide flex items-center gap-1 mb-2">
        <ExclamationTriangleIcon className="w-3.5 h-3.5" />
        Needs attention
      </div>
      <div className="space-y-2">
        {atRiskClients.map((client, i) => (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50 text-sm hover:bg-red-100 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${getAvatarColor(i)}`}
            >
              {getInitials(client.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {client.name}
              </div>
              {client.companyName && (
                <div className="text-xs text-gray-500 truncate">
                  {client.companyName}
                </div>
              )}
            </div>
            {client.type && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${typeColors[client.type] ?? "text-gray-600 bg-gray-100"}`}
              >
                {client.type.replace(/_/g, " ")}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )}

  {/* Case follow-ups */}
  {openCaseFollowUps.length > 0 && (
    <div>
      <div className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">
        Case follow-ups due
      </div>
      <div className="space-y-2">
        {openCaseFollowUps.map((c) => (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            className="flex items-center gap-3 p-3 rounded-lg border border-teal-100 bg-teal-50 text-sm hover:bg-teal-100 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {c.client.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {c.problem ?? "No problem statement"}
              </div>
            </div>
            <div className="text-xs text-teal-700 font-medium flex-shrink-0">
              {c.followUpDate ? format(c.followUpDate, "MMM d") : "—"}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )}
</section> 
   </>}

    </div>

  );
}