"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { InteractionForm } from "@/components/interactions/interaction-form";
import { InteractionTimeline } from "@/components/interactions/interaction-timeline";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatRelativeDate,
  formatDateTime,
  getErrorMessage,
  getPersonBadgeClasses,
  labelize,
} from "@/lib/utils";
import {
  createInteraction,
  deleteInteraction,
  updateInteraction,
} from "@/services/interactionService";
import { deletePerson, getPersonProfile } from "@/services/personService";
import type { InteractionFormValues, PersonProfile } from "@/types/person";

export default function PersonProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const personId = params.id;
  const [profile, setProfile] = useState<PersonProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [error, setError] = useState("");

  async function loadProfile() {
    const nextProfile = await getPersonProfile(personId);
    setProfile(nextProfile);
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeProfile() {
      try {
        const nextProfile = await getPersonProfile(personId);

        if (!isMounted) {
          return;
        }

        setProfile(nextProfile);
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

    void initializeProfile();

    return () => {
      isMounted = false;
    };
  }, [personId]);

  async function handleCreateInteraction(values: InteractionFormValues) {
    await createInteraction(personId, values);
    await loadProfile();
    setIsComposerOpen(false);
  }

  async function handleUpdateInteraction(
    interactionId: string,
    values: InteractionFormValues,
  ) {
    await updateInteraction(interactionId, values);
    await loadProfile();
  }

  async function handleDeleteInteraction(interactionId: string) {
    await deleteInteraction(interactionId);
    await loadProfile();
  }

  async function handleDeletePerson() {
    const shouldDelete = window.confirm(
      "Delete this person record? This action cannot be undone.",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deletePerson(personId);
      router.replace("/people");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  if (isLoading) {
    return <LoadingState label="Loading profile..." />;
  }

  if (!profile) {
    return (
      <EmptyState
        title="Person not found"
        description="This profile may have been removed or may no longer be available."
        action={
          <Link
            href="/people"
            className={buttonClasses({ variant: "primary", size: "sm" })}
          >
            Back to directory
          </Link>
        }
      />
    );
  }

  const latestInteraction = profile.interactions[0] ?? null;

  return (
    <div className="space-y-6">
      <SectionCard className="space-y-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/people"
            className="text-sm font-medium text-stone-500 transition hover:text-stone-900"
          >
            Back to directory
          </Link>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/people/${profile.person.id}/edit`}
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Edit person
            </Link>
            <Button size="sm" onClick={() => setIsComposerOpen((current) => !current)}>
              {isComposerOpen ? "Close composer" : "Log interaction"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void handleDeletePerson()}>
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={getPersonBadgeClasses(profile.person.type)}>
                {labelize(profile.person.type)}
              </Badge>
              <span className="text-sm text-stone-500">
                Created {formatDateTime(profile.person.createdAt)}
              </span>
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold text-stone-950">
                {profile.person.name}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-stone-600">
                {profile.person.notes || "No notes added yet."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-stone-600">
              <div className="rounded-full bg-stone-100 px-4 py-2">
                Contact: {profile.person.contact || "Not added yet"}
              </div>
              <div className="rounded-full bg-stone-100 px-4 py-2">
                Interactions: {profile.interactions.length}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[28px] bg-stone-100/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Contact
              </p>
              <p className="mt-3 text-lg font-semibold text-stone-950">
                {profile.person.contact || "Not added yet"}
              </p>
            </div>
            <div className="rounded-[28px] bg-stone-100/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Relationship
              </p>
              <p className="mt-3 text-lg font-semibold text-stone-950">
                {labelize(profile.person.type)}
              </p>
            </div>
            <div className="rounded-[28px] bg-stone-100/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                Last activity
              </p>
              <p className="mt-3 text-lg font-semibold text-stone-950">
                {latestInteraction
                  ? formatRelativeDate(latestInteraction.occurredAt)
                  : "No activity yet"}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="space-y-6">
          {isComposerOpen ? (
            <SectionCard className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
                  New Interaction
                </p>
                <h2 className="text-2xl font-semibold text-stone-950">
                  Add to the timeline
                </h2>
                <p className="text-sm leading-6 text-stone-600">
                  Keep the entry short and useful. The profile page is designed
                  to make the history easy to scan later.
                </p>
              </div>

              <InteractionForm
                submitLabel="Save interaction"
                onCancel={() => setIsComposerOpen(false)}
                onSubmit={handleCreateInteraction}
              />
            </SectionCard>
          ) : null}

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
                Timeline
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-stone-950">
                Interaction history
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Most recent entries appear first so the latest context stays easy to review.
              </p>
            </div>

            <InteractionTimeline
              interactions={profile.interactions}
              onUpdate={handleUpdateInteraction}
              onDelete={handleDeleteInteraction}
              emptyAction={
                <Button size="sm" onClick={() => setIsComposerOpen(true)}>
                  Log first interaction
                </Button>
              }
            />
          </div>
        </div>

        <div className="space-y-6">
          <SectionCard className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
                Record details
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-stone-950">
                Current snapshot
              </h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="rounded-[28px] bg-stone-100/80 p-4">
                <p className="text-stone-500">Contact</p>
                <p className="mt-1 font-semibold text-stone-950">
                  {profile.person.contact || "Not added yet"}
                </p>
              </div>
              <div className="rounded-[28px] bg-stone-100/80 p-4">
                <p className="text-stone-500">Type</p>
                <p className="mt-1 font-semibold text-stone-950">
                  {labelize(profile.person.type)}
                </p>
              </div>
              <div className="rounded-[28px] bg-stone-100/80 p-4">
                <p className="text-stone-500">Created</p>
                <p className="mt-1 font-semibold text-stone-950">
                  {formatDateTime(profile.person.createdAt)}
                </p>
              </div>
              <div className="rounded-[28px] bg-stone-100/80 p-4">
                <p className="text-stone-500">Interactions logged</p>
                <p className="mt-1 font-semibold text-stone-950">
                  {profile.interactions.length}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
              Next best use
            </p>
            <p className="text-sm leading-7 text-stone-600">
              Use the top note area for lasting context and use the timeline for
              meetings, follow-ups, symptoms, calls, or any update that changes over time.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
