"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PersonForm } from "@/components/people/person-form";
import { buttonClasses } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import { createPerson } from "@/services/personService";

export default function NewPersonPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <SectionCard className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
            Create Person
          </p>
          <h1 className="text-3xl font-semibold text-stone-950">
            Add a new person record
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-stone-600">
            Capture the essentials first, then deepen the profile with interaction
            history as the relationship evolves.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/people"
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            Back to directory
          </Link>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <SectionCard>
          <PersonForm
            submitLabel="Create person"
            onSubmit={async (values) => {
              const person = await createPerson(values);
              router.push(`/people/${person.id}`);
            }}
          />
        </SectionCard>

        <div className="space-y-6">
          <SectionCard className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
              What to capture
            </p>
            <div className="space-y-4 text-sm leading-7 text-stone-600">
              <p>
                Start with the name, the clearest way to contact them, and the relationship type.
              </p>
              <p>
                Keep notes short and stable here. Use the interaction timeline later for updates,
                meetings, and follow-ups.
              </p>
            </div>
          </SectionCard>

          <SectionCard className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
              Good examples
            </p>
            <div className="space-y-3 text-sm text-stone-600">
              <div className="rounded-[24px] bg-stone-100/80 p-4">
                Contact: `+91 98xxx xxxxx` or `name@example.com`
              </div>
              <div className="rounded-[24px] bg-stone-100/80 p-4">
                Notes: key context, recurring concerns, preferences, or anything worth remembering later
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
