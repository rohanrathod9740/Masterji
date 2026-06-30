"use client";
import { useState, useEffect, useCallback } from "react";
import type { ConsultantCategory, MeetingMode, InteractionType } from "@/types";
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
  PlusIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { Card } from "./card";
import { Button } from "./button";



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
  meetingMode?: MeetingMode | null;
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
  interactionType?: InteractionType | null;
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
  title?: string | null;
  description?: string | null;
  client: { id: string; fullName: string };
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
  cases: {
    activeCaseCount: number;
    newCasesThisMonth: number;
    atRiskCases: CaseItem[];
    upcomingCommitmentsCount: number;
  };
  metrics: {
    categoryCounts: Partial<Record<ConsultantCategory, number>>;
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
  RECORDED_AUDIO: "Recording",
  NOTE:           "Note",
  FOLLOW_UP_CALL: "Follow-up call",
  MESSAGE:        "Message",
  VIDEO_SESSION:  "Video session",
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
    <div className="flex items-center mb-2 sm:mb-2.5">
      <div className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <Link
        href={href}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5 mx-4"
      >
        <Button> <PlusIcon className="w-4 h-4" />Create {label.slice(0,-1)}</Button>
      </Link>
    </div>
  );
}

export default function DashboardUser() {
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

  const categoryCounts = fetchedData.metrics.categoryCounts || {};
  const atRiskCases = fetchedData.cases.atRiskCases || [];

  return (
    <div className="flex min-h-screen">

      {/* ── Sticky left sidebar ───────────────────────────────────────── */}
      <aside className="w-52 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <SectionNav selectedSection={activeSection} onSelect={setActiveSection} />
      </aside>

      {/* ── Scrollable main content ───────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto px-2 space-y-5">

        {activeSection === "appointments" && (
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
                  {fetchedData.cases.upcomingCommitmentsCount}
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
                    fetchedData.appointments.nextAppointment &&
                    appt.id === fetchedData.appointments.nextAppointment.id;
                  return (
                    <Link
                      key={appt.id}
                      href={`/appointments/${appt.id}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-sm hover:bg-gray-50 transition-colors ${
                        isNext ? "border-blue-300 bg-blue-50" : "border-gray-100 bg-white"
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
                          {appt.meetingMode === "IN_PERSON"
                            ? "In person"
                            : appt.meetingMode === "ZOOM"
                              ? "Zoom"
                              : appt.meetingMode === "GOOGLE_MEET"
                                ? "Google Meet"
                                : appt.meetingMode === "AUDIO_ONLY"
                                  ? "Audio only"
                                  : "Online"}
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
        )}

        {activeSection === "commitments" && (
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
                        <div className="font-medium text-gray-900 truncate">{c.title}</div>
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
                        <div className="font-medium text-gray-900 truncate">{c.title}</div>
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
                        <div className="font-medium text-gray-900 truncate">{c.title}</div>
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
        )}

        {activeSection === "interactions" && (
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
                <div className="text-xs text-gray-500 mb-1">No touch (14d)</div>
                <div className="text-xl font-bold text-red-500">
                  {fetchedData.cases.atRiskCases.length}
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
                    {formatDistanceToNow(interaction.interactionDate, { addSuffix: true })}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {activeSection === "clients" && (
          <section id="clients">
            <SectionHeader
              icon={<PersonIcon className="w-4 h-4" />}
              label="Cases"
              href="/cases"
            />

            {/* Portfolio metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="stat-card">
                <div className="text-xs text-gray-500 mb-1">Active Cases</div>
                <div className="text-xl font-bold text-slate-900">
                  {fetchedData.cases.activeCaseCount}
                </div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-gray-500 mb-1">New Cases (30d)</div>
                <div className="text-xl font-bold text-green-600">
                  {fetchedData.cases.newCasesThisMonth}
                </div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-gray-500 mb-1">At risk Cases</div>
                <div className="text-xl font-bold text-red-500">
                  {fetchedData.cases.atRiskCases.length}
                </div>
              </div>
              <div className="stat-card">
                <div className="text-xs text-gray-500 mb-1">Upcoming Follow-ups</div>
                <div className="text-xl font-bold text-teal-600">
                  {fetchedData.cases.upcomingCommitmentsCount}
                </div>
              </div>
            </div>

            {/* Portfolio type breakdown */}
            {Object.keys(categoryCounts).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(categoryCounts).map(([category, count]) => (
                  <span
                    key={category}
                    className="text-xs font-medium px-2.5 py-1 rounded-full text-blue-700 bg-blue-100"
                  >
                    {category.replace(/_/g, " ")} · {count}
                  </span>
                ))}
              </div>
            )}

            {/* At-risk cases */}
            {atRiskCases.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-semibold text-red-600 uppercase tracking-wide flex items-center gap-1 mb-2">
                  <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                  Cases Needing Attention (No interaction in 14d)
                </div>
                <div className="space-y-2">
                  {atRiskCases.map((c, i) => (
                    <Link
                      key={c.id}
                      href={`/cases/${c.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50 text-sm hover:bg-red-100 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${getAvatarColor(i)}`}
                      >
                        {getInitials(c.client.fullName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{c.title || "Untitled Case"}</div>
                        <div className="text-xs text-gray-500 truncate">Client: {c.client.fullName}</div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        Inactive
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

      </main>
    </div>
  );
}