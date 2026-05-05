import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatDate,
  formatRelativeDate,
  getPersonBadgeClasses,
  labelize,
  truncateText,
} from "@/lib/utils";
import type { Person } from "@/types/person";

type PersonCardProps = {
  person: Person;
  interactionCount: number;
  lastInteractionDate: string | null;
  onDelete: (id: string) => void;
};

export function PersonCard({
  person,
  interactionCount,
  lastInteractionDate,
  onDelete,
}: PersonCardProps) {
  return (
    <SectionCard className="flex h-full flex-col justify-between gap-6">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-stone-950">{person.name}</h3>
            <p className="mt-1 text-sm text-stone-500">
              {person.contact || "No contact added yet"}
            </p>
          </div>

          <Badge className={getPersonBadgeClasses(person.type)}>
            {labelize(person.type)}
          </Badge>
        </div>

        <p className="text-sm leading-7 text-stone-600">
          {truncateText(person.notes, 180) || "No notes added yet."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 rounded-[28px] bg-stone-100/80 p-4 text-sm">
          <div>
            <p className="text-stone-500">Interactions</p>
            <p className="mt-1 text-lg font-semibold text-stone-950">
              {interactionCount}
            </p>
          </div>
          <div>
            <p className="text-stone-500">Latest touchpoint</p>
            <p className="mt-1 font-semibold text-stone-950">
              {formatRelativeDate(lastInteractionDate)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-stone-500">Created</p>
            <p className="mt-1 font-semibold text-stone-950">
              {formatDate(person.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/people/${person.id}`}
            className={buttonClasses({ variant: "primary", size: "sm" })}
          >
            Open profile
          </Link>
          <Link
            href={`/people/${person.id}/edit`}
            className={buttonClasses({ variant: "secondary", size: "sm" })}
          >
            Edit
          </Link>
          <button
            className={buttonClasses({ variant: "ghost", size: "sm" })}
            onClick={() => onDelete(person.id)}
            type="button"
          >
            Delete
          </button>
        </div>
      </div>
    </SectionCard>
  );
}
