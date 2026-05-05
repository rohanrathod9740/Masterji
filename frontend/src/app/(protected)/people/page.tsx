"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";

import { PersonCard } from "@/components/people/person-card";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import { getErrorMessage, sortInteractionsLatestFirst } from "@/lib/utils";
import { getAllInteractions } from "@/services/interactionService";
import { deletePerson, getAllPersons } from "@/services/personService";
import type { Interaction, Person } from "@/types/person";

const inputClassName =
  "h-12 w-full rounded-2xl border border-stone-200 bg-[#fcfbf8] px-4 text-sm text-stone-900 outline-none transition focus:border-[#163c39] focus:ring-2 focus:ring-[#163c39]/10";

export default function PeopleDirectoryPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const availableTypes = Array.from(
    new Set(
      persons
        .map((person) => person.type?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ).sort((left, right) => left.localeCompare(right));

  async function loadDirectory() {
    const [nextPersons, nextInteractions] = await Promise.all([
      getAllPersons(),
      getAllInteractions().catch(() => []),
    ]);

    setPersons(nextPersons);
    setInteractions(nextInteractions);
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeDirectory() {
      try {
        const [nextPersons, nextInteractions] = await Promise.all([
          getAllPersons(),
          getAllInteractions().catch(() => []),
        ]);

        if (!isMounted) {
          return;
        }

        setPersons(nextPersons);
        setInteractions(nextInteractions);
      } catch (loadError) {
        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void initializeDirectory();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleDelete(personId: string) {
    const shouldDelete = window.confirm(
      "Delete this person record and remove it from the directory?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deletePerson(personId);
      await loadDirectory();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const totalInteractions = interactions.length;
  const hasActiveFilters =
    normalizedQuery.length > 0 || typeFilter !== "all";
  const filteredPeople = persons.filter((person) => {
    const normalizedType = person.type?.toLowerCase() ?? "";
    const matchesType = typeFilter === "all" || normalizedType === typeFilter;
    const searchableText = [
      person.name,
      person.contact ?? "",
      person.notes ?? "",
      person.type ?? "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);

    return matchesType && matchesSearch;
  });

  if (isLoading) {
    return <LoadingState label="Loading people..." />;
  }

  return (
    <div className="space-y-6">
      <SectionCard className="overflow-hidden p-0">
        <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3 px-6 py-7 sm:px-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
              People Directory
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold text-stone-950 sm:text-[2.1rem]">
              Relationship records that stay easy to search and act on
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-stone-600">
              Review profiles, keep notes current, and move from the directory
              into person timelines without extra noise.
            </p>
          </div>

          <div className="grid gap-px bg-stone-200/70 sm:grid-cols-3 xl:grid-cols-1">
            <div className="bg-stone-50/80 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                People
              </p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">{persons.length}</p>
            </div>
            <div className="bg-stone-50/80 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Interactions
              </p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">{totalInteractions}</p>
            </div>
            <div className="bg-stone-50/80 px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Active types
              </p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">
                {availableTypes.length}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard className="space-y-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-stone-900">Search and refine</p>
            <p className="mt-1 text-sm text-stone-600">
              Filter by relationship type or search across names, contact details, and notes.
            </p>
          </div>

          <Link
            href="/people/new"
            className={buttonClasses({ variant: "primary" })}
          >
            Add person
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr_auto]">
          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Search</span>
            <input
              className={inputClassName}
              placeholder="Search by name, contact, notes, or type"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-stone-700">
            <span>Filter by type</span>
            <select
              className={inputClassName}
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="all">All types</option>
              {availableTypes.map((type) => (
                <option key={type} value={type.toLowerCase()}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="rounded-full bg-stone-100 px-4 py-2 text-stone-700">
            Showing <span className="font-semibold text-stone-950">{filteredPeople.length}</span>{" "}
            of <span className="font-semibold text-stone-950">{persons.length}</span> people
          </div>
          <div className="rounded-full bg-stone-100 px-4 py-2 text-stone-700">
            Interactions in workspace:{" "}
            <span className="font-semibold text-stone-950">{totalInteractions}</span>
          </div>
          {hasActiveFilters ? (
            <div className="rounded-full bg-[#163c39] px-4 py-2 text-[#f7f5ef]">
              Filters active
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </SectionCard>

      {filteredPeople.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPeople.map((person) => {
            const personInteractions = sortInteractionsLatestFirst(
              interactions.filter((interaction) => interaction.personId === person.id),
            );

            return (
              <PersonCard
                key={person.id}
                person={person}
                interactionCount={personInteractions.length}
                lastInteractionDate={personInteractions[0]?.occurredAt ?? null}
                onDelete={(id) => void handleDelete(id)}
              />
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No people match these filters"
          description="Try another search, clear the filters, or add a new person to keep the directory moving."
          action={
            <Link
              href="/people/new"
              className={buttonClasses({ variant: "primary", size: "sm" })}
            >
              Add person
            </Link>
          }
        />
      )}
    </div>
  );
}
