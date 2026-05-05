"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { PersonForm } from "@/components/people/person-form";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import { getErrorMessage } from "@/lib/utils";
import { getPersonById, updatePerson } from "@/services/personService";
import type { Person } from "@/types/person";

export default function EditPersonPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const personId = params.id;
  const [person, setPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPerson() {
      try {
        const nextPerson = await getPersonById(personId);

        if (!isMounted) {
          return;
        }

        setPerson(nextPerson);
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

    void loadPerson();

    return () => {
      isMounted = false;
    };
  }, [personId]);

  if (isLoading) {
    return <LoadingState label="Loading person..." />;
  }

  if (!person) {
    return (
      <EmptyState
        title="Person not found"
        description="This record may have been removed or may no longer be available."
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

  return (
    <div className="space-y-6">
      <SectionCard className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
            Edit Person
          </p>
          <h1 className="text-3xl font-semibold text-stone-950">{person.name}</h1>
          <p className="max-w-2xl text-sm leading-7 text-stone-600">
            Refine the core profile details here while keeping the interaction
            history anchored on the profile page.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/people/${person.id}`}
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            Back to profile
          </Link>
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <SectionCard>
          <PersonForm
            initialValues={{
              name: person.name,
              contact: person.contact ?? "",
              type: person.type ?? "other",
              notes: person.notes ?? "",
            }}
            submitLabel="Save changes"
            onSubmit={async (values) => {
              await updatePerson(person.id, values);
              router.push(`/people/${person.id}`);
            }}
          />
        </SectionCard>

        <div className="space-y-6">
          <SectionCard className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
              Current record
            </p>
            <div className="space-y-3 text-sm">
              <div className="rounded-[24px] bg-stone-100/80 p-4">
                <p className="text-stone-500">Contact</p>
                <p className="mt-1 font-semibold text-stone-950">
                  {person.contact || "Not added yet"}
                </p>
              </div>
              <div className="rounded-[24px] bg-stone-100/80 p-4">
                <p className="text-stone-500">Type</p>
                <p className="mt-1 font-semibold text-stone-950">
                  {person.type || "Not specified"}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
              Editing guidance
            </p>
            <p className="text-sm leading-7 text-stone-600">
              Keep the main profile focused on durable facts. If something changes over time,
              the timeline is usually the better place to capture it.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
