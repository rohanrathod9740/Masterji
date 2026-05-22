"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeftIcon, Pencil2Icon, TrashIcon, PlusIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Person {
  id: string;
  name: string;
  type: string | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  createdAt: string;
}

interface Interaction {
  id: string;
  interactionType: string | null;
  notes: string | null;
  audioUrl: string | null;
  createdAt: string;
}

interface PersonWithInteractions extends Person {
  interactions: Interaction[];
}

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [person, setPerson] = useState<PersonWithInteractions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingInteractionId, setDeletingInteractionId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/people/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch person");
        }

        const data = await response.json();
        setPerson(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load person");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPerson();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this person?")) {
      return;
    }

    try {
      const response = await fetch(`/api/people/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete person");
      }

      router.push("/app/people");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete person");
    }
  };

  const handleInteractionClick = (interactionId: string) => {
    router.push(`/app/interactions/${interactionId}`);
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (!confirm("Delete this interaction?")) {
      return;
    }

    setDeletingInteractionId(interactionId);
    setError(null);

    try {
      const response = await fetch(`/api/interactions/${interactionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || errorData.message || "Failed to delete interaction"
        );
      }

      setPerson((prev) =>
        prev
          ? {
              ...prev,
              interactions: prev.interactions.filter(
                (interaction) => interaction.id !== interactionId
              ),
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete interaction");
    } finally {
      setDeletingInteractionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="w-full">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
        <Link href="/app/people" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to people
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error || "Person not found"}</p>
        </div>
        </div>
      </div>
    );
  }

  const typeLabel = person.type
    ? person.type.charAt(0).toUpperCase() + person.type.slice(1)
    : "Not specified";

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pb-20">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link href="/app/people" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to people
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {person.name}
            </h1>
            <p className="text-gray-600 mt-2">
              {typeLabel} • Added {new Date(person.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/app/people/${person.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil2Icon className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Person Details Card */}
      <div className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Type
            </label>
            <p className="text-gray-900 font-medium">{typeLabel}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            {person.email ? (
              <a
                href={`mailto:${person.email}`}
                className="text-blue-600 hover:text-blue-700 break-all"
              >
                {person.email}
              </a>
            ) : (
              <p className="text-gray-500">Not provided</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Phone
            </label>
            {person.phone ? (
              <a
                href={`tel:${person.phone}`}
                className="text-blue-600 hover:text-blue-700"
              >
                {person.phone}
              </a>
            ) : (
              <p className="text-gray-500">Not provided</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tags
            </label>
            {person.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {person.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tags</p>
            )}
          </div>
        </div>
      </div>

      {/* Interactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Interactions ({person.interactions.length})
          </h2>
          <Link href={`/app/people/${person.id}/add-interaction`}>
            <Button size="sm">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Interaction
            </Button>
          </Link>
        </div>

        {person.interactions.length > 0 ? (
          <div className="space-y-3">
            {person.interactions.map((interaction) => (
              <div
                key={interaction.id}
                className="bg-white rounded-lg border border-gray-100 p-5 sm:p-6 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => handleInteractionClick(interaction.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleInteractionClick(interaction.id);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {interaction.interactionType
                        ? interaction.interactionType.charAt(0).toUpperCase() +
                          interaction.interactionType.slice(1)
                        : "Interaction"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(interaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/app/interactions/${interaction.id}/edit`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <Button variant="outline" size="sm">
                        <Pencil2Icon className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteInteraction(interaction.id);
                      }}
                      disabled={deletingInteractionId === interaction.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      aria-label="Delete interaction"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {interaction.notes && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Notes
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                      {interaction.notes}
                    </p>
                  </div>
                )}

                {/* Audio URL */}
                {interaction.audioUrl && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Audio Recording
                    </p>
                    <audio
                      controls
                      className="w-full h-8"
                      src={interaction.audioUrl}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No interactions yet</p>
            <Link href={`/app/people/${person.id}/add-interaction`}>
              <Button>Add First Interaction</Button>
            </Link>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
