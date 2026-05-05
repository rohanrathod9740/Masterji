"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getErrorMessage, labelize } from "@/lib/utils";
import { personTypeOptions, type PersonFormValues } from "@/types/person";

type PersonFormProps = {
  initialValues?: PersonFormValues;
  submitLabel: string;
  onSubmit: (values: PersonFormValues) => Promise<void>;
};

const defaultValues: PersonFormValues = {
  name: "",
  contact: "",
  type: "client",
  notes: "",
};

const inputClassName =
  "h-12 w-full rounded-2xl border border-stone-200 bg-[#fcfbf8] px-4 text-sm text-stone-900 outline-none transition focus:border-[#163c39] focus:ring-2 focus:ring-[#163c39]/10";

export function PersonForm({
  initialValues = defaultValues,
  submitLabel,
  onSubmit,
}: PersonFormProps) {
  const [values, setValues] = useState<PersonFormValues>(initialValues);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  function updateValue<Key extends keyof PersonFormValues>(
    key: Key,
    value: PersonFormValues[Key],
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
        name: values.name.trim(),
        contact: values.contact.trim(),
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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-stone-700">
          <span>Name</span>
          <input
            className={inputClassName}
            placeholder="Enter full name"
            required
            value={values.name}
            onChange={(event) => updateValue("name", event.target.value)}
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-stone-700">
          <span>Relationship type</span>
          <select
            className={inputClassName}
            value={values.type}
            onChange={(event) => updateValue("type", event.target.value)}
          >
            {personTypeOptions.map((type) => (
              <option key={type} value={type}>
                {labelize(type)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-stone-700">
        <span>Contact</span>
        <input
          className={inputClassName}
          placeholder="Phone, email, or any contact detail"
          value={values.contact}
          onChange={(event) => updateValue("contact", event.target.value)}
        />
      </label>

      <label className="space-y-2 text-sm font-medium text-stone-700">
        <span>Notes</span>
        <textarea
          className="min-h-32 w-full rounded-[24px] border border-stone-200 bg-[#fcfbf8] px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-[#163c39] focus:ring-2 focus:ring-[#163c39]/10"
          placeholder="What should be remembered about this person?"
          value={values.notes}
          onChange={(event) => updateValue("notes", event.target.value)}
        />
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
