"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import VoiceTextarea from "@/components/ui/voice-textarea";
import { useSearchParams } from 'next/navigation';


interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type?: string;
}

interface FormData {
  title: string;
  important_points: string;
  personId: string;
  dueDate: string;
  status: "pending" | "done" | "missed" | "";
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-purple-100 text-purple-700",
  "bg-red-100 text-red-700",
  "bg-green-100 text-green-700",
];

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

 function AddCommitmentPage() {

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    important_points: "",
    personId: "",
    dueDate: "",
    status: "",
  });

  // People search state
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [personSearch, setPersonSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [isPeopleLoading, setIsPeopleLoading] = useState(true);

  // Fetch people on mount
  useEffect(() => {
    fetch("/api/people")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch people");
        return res.json();
      })
      .then((data: Person[]) => {
        setPeople(data);
        setFilteredPeople(data);
      })
      .catch(() => {
        // silently fail — user will see empty dropdown
      })
      .finally(() => setIsPeopleLoading(false));
  }, []);

  // Filter people by search
  useEffect(() => {
    if (!personSearch.trim()) {
      setFilteredPeople(people);
      return;
    }
    const q = personSearch.toLowerCase();
    setFilteredPeople(
      people.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phone?.includes(q)
      )
    );
  }, [personSearch, people]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setFormData((prev) => ({ ...prev, personId: person.id }));
    setPersonSearch(person.name);
    setShowPersonDropdown(false);
  };

  const handleClearPerson = () => {
    setSelectedPerson(null);
    setFormData((prev) => ({ ...prev, personId: "" }));
    setPersonSearch("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!formData.personId) {
      setError("Please select a person for this commitment.");
      return;
    }
    if (!formData.dueDate) {
      setError("Due date is required.");
      return;
    }

    try {
      setIsLoading(true);

      // Get current user
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) throw new Error("Failed to get user information");
      const userData = await userRes.json();

      const response = await fetch("/api/commitments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userData.id,
          personId: formData.personId,
          title: formData.title,
          dueDate: new Date(formData.dueDate).toISOString(),
          status: formData.status || "pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create commitment");
      }

      router.push("/app/commitments");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create commitment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  async function fetchPerson(personId: string) {
    const res = await fetch(`/api/people/${personId}`);
    if (!res.ok) throw new Error("Failed to fetch person");
    const data = await res.json();
    return data;
  }

  const searchParams = useSearchParams();
  const personId = searchParams.get('personId');
  useEffect(() => {
    if (personId) {
      fetchPerson(personId).then((person) => {
        setSelectedPerson(person);
        setFormData((prev) => ({ ...prev, personId: person.id }));
        setPersonSearch(person.name);
        setShowPersonDropdown(false);
      });
    }
  }, [personId]);

  return (
    <div className="w-full">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 pb-20">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/app/commitments"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to commitments
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Add a commitment
          </h1>
          <p className="text-gray-600 mt-2">
            Record a promise or follow-up task linked to a person.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Commitment Details Card */}
          <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Commitment Details
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Send proposal, Follow up on treatment, Call back"
                  maxLength={500}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/500 characters
                </p>
              </div>

              {/* Important Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Important points
                  <span className="ml-2 text-xs text-blue-500 font-normal">(type or record voice)</span>
                </label>
                <VoiceTextarea
                  name="important_points"
                  value={formData.important_points}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, important_points: val }))
                  }
                  placeholder="Key details, context, or reminders about this commitment..."
                  maxLength={2500}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.important_points.length}/2500 characters
                </p>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                  required
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm bg-white"
                >
                  <option value="">Pending (default)</option>
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                  <option value="missed">Missed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Person Card */}
          <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Person *
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Search and select the person this commitment is for.
            </p>

            {/* Selected Person Preview */}
            {selectedPerson ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${getAvatarColor(
                    people.findIndex((p) => p.id === selectedPerson.id)
                  )}`}
                >
                  {getInitials(selectedPerson.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedPerson.name}
                  </div>
                  {selectedPerson.email && (
                    <div className="text-xs text-gray-500 truncate">
                      {selectedPerson.email}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClearPerson}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* Search Input */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={personSearch}
                    onChange={(e) => {
                      setPersonSearch(e.target.value);
                      setShowPersonDropdown(true);
                    }}
                    onFocus={() => setShowPersonDropdown(true)}
                    placeholder="Search by name, email, or phone..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Dropdown */}
                {showPersonDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {isPeopleLoading ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Loading people...
                      </div>
                    ) : filteredPeople.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No people found.{" "}
                        <Link
                          href="/app/people/add"
                          className="text-blue-600 hover:underline"
                        >
                          Add a person first →
                        </Link>
                      </div>
                    ) : (
                      filteredPeople.map((person, idx) => (
                        <button
                          key={person.id}
                          type="button"
                          onClick={() => handleSelectPerson(person)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${getAvatarColor(
                              idx
                            )}`}
                          >
                            {getInitials(person.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {person.name}
                            </div>
                            {(person.email || person.phone) && (
                              <div className="text-xs text-gray-500 truncate">
                                {person.email || person.phone}
                              </div>
                            )}
                          </div>
                          {person.type && (
                            <span className="text-xs text-gray-500 shrink-0">
                              {person.type}
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dismiss dropdown on outside click */}
            {showPersonDropdown && !selectedPerson && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setShowPersonDropdown(false)}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Link href="/app/commitments" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {isLoading ? "Creating..." : "Create Commitment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



export default function Page() {
  return (
    <Suspense fallback={<div>Loading....</div>}>
      <AddCommitmentPage />
    </Suspense>
  )
}