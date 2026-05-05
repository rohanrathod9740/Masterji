import type { Interaction } from "@/types/person";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function labelize(value: string | null | undefined) {
  if (!value) {
    return "Not specified";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatRelativeDate(value: string | null | undefined) {
  if (!value) {
    return "No activity yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  const differenceInDays = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (differenceInDays <= 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "1 day ago";
  }

  if (differenceInDays < 7) {
    return `${differenceInDays} days ago`;
  }

  return formatDate(value);
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function truncateText(
  value: string | null | undefined,
  maxLength = 180,
) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function sortInteractionsLatestFirst<T extends Pick<Interaction, "occurredAt">>(
  interactions: T[]
) {
  return [...interactions].sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
  );
}

export function getPersonBadgeClasses(type: string | null | undefined) {
  switch ((type ?? "").toLowerCase()) {
    case "client":
      return "border-amber-200 bg-amber-100 text-amber-900";
    case "patient":
      return "border-rose-200 bg-rose-100 text-rose-900";
    case "shishya":
      return "border-emerald-200 bg-emerald-100 text-emerald-900";
    case "friend":
      return "border-sky-200 bg-sky-100 text-sky-900";
    case "family":
      return "border-violet-200 bg-violet-100 text-violet-900";
    default:
      return "border-stone-200 bg-stone-100 text-stone-900";
  }
}

export function getInteractionBadgeClasses(type: string | null | undefined) {
  switch ((type ?? "").toLowerCase()) {
    case "conversation":
      return "border-slate-200 bg-slate-100 text-slate-900";
    case "meeting":
      return "border-cyan-200 bg-cyan-100 text-cyan-900";
    case "call":
      return "border-teal-200 bg-teal-100 text-teal-900";
    case "follow_up":
      return "border-amber-200 bg-amber-100 text-amber-900";
    case "treatment":
      return "border-rose-200 bg-rose-100 text-rose-900";
    case "session":
      return "border-emerald-200 bg-emerald-100 text-emerald-900";
    default:
      return "border-stone-200 bg-stone-100 text-stone-900";
  }
}
