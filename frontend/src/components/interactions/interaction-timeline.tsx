"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { InteractionForm } from "@/components/interactions/interaction-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatDateTime,
  getInteractionBadgeClasses,
  labelize,
} from "@/lib/utils";
import type { Interaction, InteractionFormValues } from "@/types/person";

type InteractionTimelineProps = {
  interactions: Interaction[];
  onUpdate: (id: string, values: InteractionFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  emptyAction?: ReactNode;
};

export function InteractionTimeline({
  interactions,
  onUpdate,
  onDelete,
  emptyAction,
}: InteractionTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const shouldDelete = window.confirm(
      "Delete this interaction from the timeline?",
    );

    if (!shouldDelete) {
      return;
    }

    setDeletingId(id);

    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (interactions.length === 0) {
    return (
      <EmptyState
        title="No interactions yet"
        description="Log the first interaction to start building a useful memory timeline for this person."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction, index) => {
        const isEditing = editingId === interaction.id;
        const isDeleting = deletingId === interaction.id;

        return (
          <div key={interaction.id} className="relative pl-9">
            {index < interactions.length - 1 ? (
              <span className="absolute left-1 top-11 h-[calc(100%-1.5rem)] w-px bg-stone-200" />
            ) : null}
            <span
              className={`absolute left-[-1px] top-7 h-4 w-4 rounded-full border-4 ${
                index === 0 ? "border-[#163c39] bg-white" : "border-stone-300 bg-white"
              }`}
            />

            <SectionCard className="space-y-4">
              {isEditing ? (
                <InteractionForm
                  initialValues={{
                    type: interaction.type ?? "conversation",
                    notes: interaction.notes ?? "",
                  }}
                  submitLabel="Save interaction"
                  onCancel={() => setEditingId(null)}
                  onSubmit={async (values) => {
                    await onUpdate(interaction.id, values);
                    setEditingId(null);
                  }}
                />
              ) : (
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getInteractionBadgeClasses(interaction.type)}>
                        {labelize(interaction.type)}
                      </Badge>
                      <span className="text-sm text-stone-500">
                        {formatDateTime(interaction.occurredAt)}
                      </span>
                    </div>

                    <p className="text-sm leading-7 text-stone-700">
                      {interaction.notes || "No notes captured for this interaction."}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingId(interaction.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleDelete(interaction.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              )}
            </SectionCard>
          </div>
        );
      })}
    </div>
  );
}
