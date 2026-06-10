"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PlusCircledIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ClockIcon,
  CheckIcon,
  CounterClockwiseClockIcon,
} from "@radix-ui/react-icons";
import { useSearchParams } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { format, differenceInDays, isPast, isToday } from "date-fns";

interface Commitment {
  id: string;
  userId: string;
  personId: string;
  interactionId?: string | null;
  title: string;
  dueDate: string;
  status: "pending" | "done" | "missed";
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode; label: string }
> = {
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: <ClockIcon className="w-3 h-3" />,
    label: "Pending",
  },
  done: {
    bg: "bg-green-100",
    text: "text-green-700",
    icon: <CheckCircledIcon className="w-3 h-3" />,
    label: "Done",
  },
  missed: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: <CrossCircledIcon className="w-3 h-3" />,
    label: "Missed",
  },
};

function getDueDateBadge(dueDate: string, status: string) {
  const date = new Date(dueDate);
  if (status === "done") return null;
  if (status === "missed") return null;
  if (isToday(date)) {
    return {
      label: "Due today",
      className: "text-amber-700 bg-amber-100",
    };
  }
  if (isPast(date)) {
    const days = differenceInDays(new Date(), date);
    return {
      label: `${days}d overdue`,
      className: "text-red-700 bg-red-100",
    };
  }
  const daysLeft = differenceInDays(date, new Date());
  return {
    label: `In ${daysLeft}d`,
    className: "text-gray-600 bg-gray-100",
  };
}

export default function CommitmentsPage() {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [filteredCommitments, setFilteredCommitments] = useState<Commitment[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [markingDone, setMarkingDone] = useState<Set<string>>(new Set());

  // Fetch the current user first
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((user) => setUserId(user.id))
      .catch(() => setError("You must be logged in to view commitments."));
  }, []);

  const fetchCommitments = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const url = new URL("/api/commitments", window.location.origin);
      url.searchParams.set("userId", userId);
      url.searchParams.set("take", "100");
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch commitments");
      const data = await response.json();
      setCommitments(data.data ?? []);
    } catch (err) {
      setError("Failed to load commitments. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      // eslint-disable-next-line
      fetchCommitments();
    }
  }, [userId, fetchCommitments]);

  useEffect(() => {
    let filtered = commitments;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((c) =>
        c.title.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    setFilteredCommitments(filtered);
  }, [searchQuery, filterStatus, commitments]);

  const markAsDone = async (id: string) => {
    // Optimistic update
    setCommitments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "done" } : c))
    );
    setMarkingDone((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/commitments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      // Roll back on failure
      setCommitments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "pending" } : c))
      );
    } finally {
      setMarkingDone((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };
  const markAsUndone = async (id:string) =>{
    setCommitments((prev) =>
    prev.map((c) => (c.id === id ? { ...c, status:"pending"}:c)))
    setMarkingDone((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/commitments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      });
      if (!res.ok) throw new Error("Failed to update");
    } catch {
      // Roll back on failure
      setCommitments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "done" } : c))
      );
    } finally {
      setMarkingDone((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const missedCount= commitments.filter(
    (c) =>
      c.status === "missed" &&
      isPast(new Date(c.dueDate)) &&
      !isToday(new Date(c.dueDate))
  ).length;

  const stats = [
    {
      label: "Total",
      value: commitments.length,
      color: "text-gray-900",
    },
    {
      label: "Pending",
      value: commitments.filter((c) => c.status === "pending").length,
      color: "text-amber-600",
    },
    {
      label: "Done",
      value: commitments.filter((c) => c.status === "done").length,
      color: "text-green-600",
    },
    {
      label: "Missed",
      value: commitments.filter((c) => c.status === "missed").length,
      color: "text-red-600",
    },
  ];

  return (
    <div className="w-full">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 pb-32">
        {/* Header Section */}
        <div className="mb-5 sm:mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Commitments
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Track your promises and follow-ups.
            </p>
          </div>
          <Link href="/app/commitments/add">
            <Button className="gap-2">
              <PlusIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Add Commitment</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2.5 mb-5 sm:mb-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-3 sm:p-4 border border-gray-100"
            >
              <div className="text-xs font-medium text-gray-600 mb-1.5">
                {stat.label}
              </div>
              <div className={`text-xl sm:text-2xl font-semibold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter Section */}
        <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search commitments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm text-gray-700 bg-white"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
            <option value="missed">Missed</option>
          </select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-3 border-gray-200 border-t-blue-500 animate-spin mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading commitments...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
            <p className="text-sm text-red-600">{error}</p>
            {userId && (
              <button
                onClick={fetchCommitments}
                className="text-sm font-medium text-red-700 hover:text-red-800 mt-2"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCommitments.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <PlusCircledIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium mb-2">
              {searchQuery || filterStatus !== "all"
                ? "No commitments found"
                : "No commitments yet"}
            </p>
            <p className="text-sm text-gray-500 text-center mb-4">
              {searchQuery || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first commitment"}
            </p>
            {!searchQuery && filterStatus === "all" && (
              <Link href="/app/commitments/add">
                <Button className="gap-2 mt-2">
                  <PlusIcon className="w-4 h-4" />
                  Add your first commitment
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Commitments List */}
        {!isLoading && filteredCommitments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {filteredCommitments.map((commitment) => {
              const statusConfig = STATUS_CONFIG[commitment.status];
              const dueBadge = getDueDateBadge(
                commitment.dueDate,
                commitment.status
              );

              return (
                <div
                  key={commitment.id}
                  className="flex items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Status Icon */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    <span className="text-sm">{statusConfig.icon}</span>
                  </div>

                  {/* Commitment Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/app/commitments/${commitment.id}`}
                        className="text-sm sm:text-base font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors"
                      >
                        {commitment.title}
                      </Link>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Due {format(new Date(commitment.dueDate), "MMM d, yyyy")}
                    </p>
                  </div>

                  {/* Due Badge + Finished Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    {dueBadge && (
                      <div
                        className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${dueBadge.className}`}
                      >
                        {dueBadge.label}
                      </div>
                    )}
                    {(commitment.status === "pending" || commitment.status === "missed") && (
                      <button
                        type="button"
                        onClick={() => markAsDone(commitment.id)}
                        disabled={markingDone.has(commitment.id)}
                        title="Mark as done"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-400 bg-green-300 text-black hover:bg-green-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
                      >
                        <CheckIcon className="w-3.5 h-3.5" />
                        {markingDone.has(commitment.id) ? "Saving…" : "Finished this task? Click here!"}
                      </button>
                    )}

                    {commitment.status === "done" && (
                      <button
                        type="button"
                        onClick={() => markAsUndone(commitment.id)}
                        disabled={markingDone.has(commitment.id)}
                        title="Mark as undone"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <CounterClockwiseClockIcon className="w-3.5 h-3.5" />
                        {markingDone.has(commitment.id) ? "Saving…" : "Undo"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}