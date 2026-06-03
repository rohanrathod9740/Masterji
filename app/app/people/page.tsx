"use client";
import { useRouter } from "next/navigation";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PlusCircledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  interactions: Array<{ id: string; createdAt: string }>;
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-red-100 text-red-700",
  "bg-green-100 text-green-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  client: { bg: "bg-blue-100", text: "text-blue-700" },
  shishya: { bg: "bg-purple-100", text: "text-purple-700" },
  patient: { bg: "bg-red-100", text: "text-red-700" },
  friend: { bg: "bg-green-100", text: "text-green-700" },
  other: { bg: "bg-gray-100", text: "text-gray-700" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

export default function PeoplePage() {
  const pathname = usePathname();

  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPeople = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/people");
      if (!response.ok) throw new Error("Failed to fetch people");
      const data = await response.json();
      setPeople(data);
    } catch (err) {
      setError("Failed to load people. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeletePerson = async (
    e: React.MouseEvent<HTMLButtonElement>,
    personId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this person? This action cannot be undone.")) {
      return;
    }

    setDeletingId(personId);
    try {
      const response = await fetch(`/api/people/${personId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete person");
      }

      setPeople((prevPeople) => prevPeople.filter((p) => p.id !== personId));
      setError(null);
    } catch (err) {
      setError("Failed to delete person. Please try again.");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const router = useRouter();


  const handleAddCommitment = (e: React.MouseEvent<HTMLButtonElement>, personId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`${pathname}/add?personId=${personId}`);
  };


  useEffect(() => {
    // eslint-disable-next-line
    fetchPeople();
  }, [fetchPeople]);

  useEffect(() => {
    let filtered = people;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (person) =>
          person.name.toLowerCase().includes(query) ||
          person.email?.toLowerCase().includes(query) ||
          person.phone?.includes(query)
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((person) => person.type === filterType);
    }

    // eslint-disable-next-line
    setFilteredPeople(filtered);
  }, [searchQuery, filterType, people]);

  const stats = [
    {
      label: "Total people",
      value: people.length,
      color: "text-gray-900",
    },
    {
      label: "Clients",
      value: people.filter((p) => p.type === "client").length,
      color: "text-blue-600",
    },
    {
      label: "Patients",
      value: people.filter((p) => p.type === "patient").length,
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
            People
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and track your connections
          </p>
        </div>
        <Link href={`${pathname}/add`}>
          <Button className="gap-2">
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Add Person</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 sm:mb-6">
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
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm text-gray-700 bg-white"
        >
          <option value="all">All types</option>
          <option value="client">Client</option>
          <option value="patient">Patient</option>
          <option value="shishya">Shishya</option>
          <option value="friend">Friend</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-3 border-gray-200 border-t-blue-500 animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-600">Loading people...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={fetchPeople}
            className="text-sm font-medium text-red-700 hover:text-red-800 mt-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPeople.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <PlusCircledIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-2">
            {searchQuery || filterType !== "all"
              ? "No people found"
              : "No people yet"}
          </p>
          <p className="text-sm text-gray-500 text-center mb-4">
            {searchQuery || filterType !== "all"
              ? "Try adjusting your search or filters"
              : "Start by adding your first person"}
          </p>
          {!searchQuery && filterType === "all" && (
            <Link href={`${pathname}/add`}>
              <Button className="gap-2 mt-2">
                <PlusIcon className="w-4 h-4" />
                Add your first person
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* People List */}
      {!isLoading && filteredPeople.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          {filteredPeople.map((person, idx) => (
            <div
              key={person.id}
              className="flex items-center gap-3 p-3 sm:p-4 hover:bg-gray-50 transition-colors"
            >
              <Link
                href={`/app/people/${person.id}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 text-sm sm:text-base font-semibold ${getAvatarColor(idx)}`}
                >
                  {getInitials(person.name)}
                </div>

                {/* Person Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      {person.name}
                    </div>
                    {person.type && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          TYPE_COLORS[person.type]?.bg || "bg-gray-100"
                        } ${TYPE_COLORS[person.type]?.text || "text-gray-700"}`}
                      >
                        {person.type}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-3 gap-1">
                    {person.email && (
                      <p className="text-xs text-gray-600 truncate">
                        {person.email}
                      </p>
                    )}
                    {person.phone && (
                      <p className="text-xs text-gray-600 truncate">
                        {person.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Recent Interactions */}
                {person.interactions && person.interactions.length > 0 && (
                  <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded shrink-0 whitespace-nowrap">
                    {person.interactions.length} interaction{person.interactions.length !== 1 ? "s" : ""}
                  </div>
                )}
              </Link>

              {/* Add Commitment Button */}
              <button
                onClick={(e) => handleAddCommitment(e, person.id)}
                title="Add commitment"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shrink-0 whitespace-nowrap"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Add commitment
              </button>

              {/* Delete Button */}
              <button
                onClick={(e) => handleDeletePerson(e, person.id)}
                disabled={deletingId === person.id}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                title="Delete person"
              >
                <TrashIcon className="w-8 h-8" />
              </button>
            </div>
          ))}
           </div>      
      )}      
      </div>
    </div>
  );                
}        
