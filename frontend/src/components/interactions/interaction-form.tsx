"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getErrorMessage, labelize } from "@/lib/utils";
import {
  interactionTypeOptions,
  type InteractionFormValues,
} from "@/types/person";

type InteractionFormProps = {
  initialValues?: InteractionFormValues;
  submitLabel: string;
  onSubmit: (values: InteractionFormValues) => Promise<void>;
  onCancel?: () => void;
};

const defaultValues: InteractionFormValues = {
  type: "conversation",
  notes: "",
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-stone-200 bg-[#fcfbf8] px-4 text-sm text-stone-900 outline-none transition focus:border-[#163c39] focus:ring-2 focus:ring-[#163c39]/10";

export function InteractionForm({
  initialValues = defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
}: InteractionFormProps) {
  const [values, setValues] = useState<InteractionFormValues>(initialValues);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateValue<Key extends keyof InteractionFormValues>(
    key: Key,
    value: InteractionFormValues[Key],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await onSubmit({
        type: values.type.trim(),
        notes: values.notes.trim(),
      });
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="space-y-2 text-sm font-medium text-stone-700">
        <span>Interaction type</span>
        <select
          className={inputClassName}
          value={values.type}
          onChange={(event) => updateValue("type", event.target.value)}
        >
          {interactionTypeOptions.map((type) => (
            <option key={type} value={type}>
              {labelize(type)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-stone-700">
        <span>Notes</span>
        <textarea
          className="min-h-28 w-full rounded-[24px] border border-stone-200 bg-[#fcfbf8] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#163c39] focus:ring-2 focus:ring-[#163c39]/10"
          placeholder="What happened, what matters, and what should be remembered?"
          value={values.notes}
          onChange={(event) => updateValue("notes", event.target.value)}
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : submitLabel}
        </Button>
        {onCancel ? (
          <Button variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
