"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRightIcon, CalendarIcon } from "@radix-ui/react-icons";
import { SlidersHorizontal, X } from "lucide-react";
import { format, isToday, isFuture } from "date-fns";

// ── Types ───────────────────────────────────────────────────────────────────

type Client = {
  id: string;
  name: string;
  email: string;
};

type Appointment = {
  id: string;
  scheduledStart: string;  // ISO string
  scheduledEnd:   string;  // ISO string
  mode:           string;
  status:         string;
  purpose?:       string | null;
  consultant?: { fullName: string; designation: string | null } | null;
};

type Props = {
  client: Client;
  appointments: Appointment[];
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  REQUESTED:            { label: "Pending",     cls: "bg-amber-100 text-amber-700"    },
  APPROVED:             { label: "Approved",    cls: "bg-emerald-100 text-emerald-700" },
  RESCHEDULED:          { label: "Rescheduled", cls: "bg-blue-100 text-blue-700"      },
  RESCHEDULE_PROPOSED:  { label: "Reschedule",  cls: "bg-sky-100 text-sky-700"        },
  NO_SHOW:              { label: "No-show",     cls: "bg-red-100 text-red-700"        },
  CANCELLED:            { label: "Cancelled",   cls: "bg-gray-100 text-gray-600"     },
  COMPLETED:            { label: "Completed",   cls: "bg-green-100 text-green-700"   },
  REJECTED:             { label: "Rejected",    cls: "bg-red-100 text-red-700"       },
};

const MODE_LABEL: Record<string, string> = {
  IN_PERSON:   "In-person",
  ZOOM:        "Zoom",
  GOOGLE_MEET: "Google Meet",
  OTHER_VIDEO: "Video",
  AUDIO_ONLY:  "Audio",
};

// ── Sub-components ──────────────────────────────────────────────────────────

function ApptRow({ appt }: { appt: Appointment }) {
  const s = STATUS_LABEL[appt.status] ?? { label: appt.status, cls: "bg-gray-100 text-gray-600" };
  const start = new Date(appt.scheduledStart);
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-gray-900">
            {format(start, "dd MMM yyyy")}
          </span>
          <span className="text-xs text-blue-600 font-medium">{format(start, "h:mm a")}</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {appt.purpose ?? "—"}
          <span className="mx-1.5 text-gray-300">·</span>
          {MODE_LABEL[appt.mode] ?? appt.mode}
          {appt.consultant && (
            <>
              <span className="mx-1.5 text-gray-300">·</span>
              {appt.consultant.fullName}
            </>
          )}
        </div>
      </div>
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 ${s.cls}`}>
        {s.label}
      </span>
      <ArrowRightIcon className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
    </div>
  );
}

// ── Filter Panel ─────────────────────────────────────────────────────────────

type ApptFilter = { today: boolean; upcoming: boolean };

type FilterPanelProps = {
  open: boolean;
  onClose: () => void;
  apptFilter: ApptFilter;
  setApptFilter: React.Dispatch<React.SetStateAction<ApptFilter>>;
};

function FilterPanel({ open, onClose, apptFilter, setApptFilter }: FilterPanelProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 z-30 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl p-4"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
        <CalendarIcon className="w-3.5 h-3.5" />
        Appointments
      </div>
      <label className="flex items-center gap-2 py-1 cursor-pointer">
        <input
          type="checkbox"
          checked={apptFilter.today}
          onChange={(e) => setApptFilter((p) => ({ ...p, today: e.target.checked }))}
          className="w-4 h-4 rounded accent-blue-600"
        />
        <span className="text-sm text-gray-700">Today</span>
      </label>
      <label className="flex items-center gap-2 py-1 cursor-pointer">
        <input
          type="checkbox"
          checked={apptFilter.upcoming}
          onChange={(e) => setApptFilter((p) => ({ ...p, upcoming: e.target.checked }))}
          className="w-4 h-4 rounded accent-blue-600"
        />
        <span className="text-sm text-gray-700">Upcoming</span>
      </label>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function ClientDashboardPage({ client, appointments }: Props) {
  const [filterOpen, setFilterOpen]   = useState(false);
  const [apptFilter, setApptFilter]   = useState<ApptFilter>({ today: false, upcoming: false });

  const filterActive = apptFilter.today || apptFilter.upcoming;

  const filteredAppts = appointments.filter((a) => {
    if (!filterActive) return true;
    const d = new Date(a.scheduledStart);
    if (apptFilter.today    && isToday(d))                  return true;
    if (apptFilter.upcoming && isFuture(d) && !isToday(d)) return true;
    return false;
  });

  return (
    <div className="pb-28 space-y-5">
      <h1 className="text-lg font-semibold text-gray-800">
        Welcome, <span className="text-blue-700">{client.name}</span>
      </h1>

      {/* ── Header + Filter ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 relative">
        <h2 className="text-sm font-semibold text-gray-600 flex-1">Appointments</h2>

        <div className="relative">
          <button
            id="client-filter-btn"
            onClick={() => setFilterOpen((p) => !p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors ${
              filterOpen || filterActive
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            {filterOpen
              ? <X className="w-3.5 h-3.5" />
              : <SlidersHorizontal className="w-3.5 h-3.5" />}
            Filter
            {filterActive && (
              <span className="ml-1 w-4 h-4 rounded-full bg-white text-blue-600 text-xs font-bold flex items-center justify-center">
                {(apptFilter.today ? 1 : 0) + (apptFilter.upcoming ? 1 : 0)}
              </span>
            )}
          </button>

          <FilterPanel
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            apptFilter={apptFilter}
            setApptFilter={setApptFilter}
          />
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {filteredAppts.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 text-gray-400">
          <CalendarIcon className="h-7 w-7 opacity-30" />
          <p className="text-sm">
            {filterActive ? "No appointments match the filter" : "No appointments yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAppts.map((a) => (
            <ApptRow key={a.id} appt={a} />
          ))}
        </div>
      )}
    </div>
  );
}
