import {
  ApiError,
  getArray,
  getRecord,
  getString,
  requestWithFallback,
  unwrapData,
  type RequestCandidate,
} from "@/services/api";
import { requireSession } from "@/services/authService";
import type { Interaction, InteractionFormValues } from "@/types/person";

const listInteractionCandidates: RequestCandidate[] = [
  { path: "/api/v1/interactions", method: "GET" },
];

function interactionDetailsCandidates(interactionId: string): RequestCandidate[] {
  return [{ path: `/api/v1/interactions/${interactionId}`, method: "GET" }];
}

const createInteractionCandidates: RequestCandidate[] = [
  { path: "/api/v1/interactions", method: "POST" },
];

function updateInteractionCandidates(interactionId: string): RequestCandidate[] {
  return [{ path: `/api/v1/interactions/${interactionId}`, method: "PUT" }];
}

function deleteInteractionCandidates(interactionId: string): RequestCandidate[] {
  return [{ path: `/api/v1/interactions/${interactionId}`, method: "DELETE" }];
}

const INTERACTION_CACHE_STORAGE_KEY = "masterji.interactions.cache";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function readCachedInteractions(): Interaction[] {
  const storage = getStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawValue = storage.getItem(INTERACTION_CACHE_STORAGE_KEY);
    return rawValue ? (JSON.parse(rawValue) as Interaction[]) : [];
  } catch {
    return [];
  }
}

function writeCachedInteractions(interactions: Interaction[]) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(INTERACTION_CACHE_STORAGE_KEY, JSON.stringify(interactions));
}

function mergeInteractions(primary: Interaction[], secondary: Interaction[]) {
  const merged = new Map<string, Interaction>();

  for (const interaction of secondary) {
    merged.set(interaction.id, interaction);
  }

  for (const interaction of primary) {
    merged.set(interaction.id, interaction);
  }

  return Array.from(merged.values()).sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime(),
  );
}

function upsertCachedInteraction(interaction: Interaction) {
  const cachedInteractions = readCachedInteractions();
  const nextInteractions = mergeInteractions([interaction], cachedInteractions);
  writeCachedInteractions(nextInteractions);
}

function removeCachedInteraction(interactionId: string) {
  const cachedInteractions = readCachedInteractions().filter(
    (interaction) => interaction.id !== interactionId,
  );

  writeCachedInteractions(cachedInteractions);
}

function normalizeInteraction(payload: unknown): Interaction {
  const record = getRecord(unwrapData(payload)) ?? getRecord(payload);

  if (!record) {
    throw new ApiError("The backend did not return a valid interaction.");
  }

  const id = getString(record.id);
  const personId = getString(record.personId);

  if (!id || !personId) {
    throw new ApiError("The interaction response is missing required fields.");
  }

  return {
    id,
    userId: getString(record.userId),
    personId,
    type: getString(record.type),
    notes: getString(record.notes),
    audioUrl: getString(record.audioUrl),
    transcript: getString(record.transcript),
    occurredAt:
      getString(record.interactionDate) ??
      getString(record.createdAt) ??
      getString(record.date) ??
      new Date().toISOString(),
  };
}

function normalizeInteractionList(payload: unknown) {
  const list =
    getArray(unwrapData(payload), ["interactions"]) ??
    getArray(payload, ["interactions"]) ??
    getArray(unwrapData(payload)) ??
    getArray(payload);

  if (!list) {
    throw new ApiError("The backend did not return a valid interaction list.");
  }

  return list
    .map((entry) => normalizeInteraction(entry))
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime()
    );
}

export async function getAllInteractions() {
  const cachedInteractions = readCachedInteractions();

  try {
    const interactions = await requestWithFallback({
      candidates: listInteractionCandidates,
      parser: normalizeInteractionList,
    });

    const mergedInteractions = mergeInteractions(interactions, cachedInteractions);
    writeCachedInteractions(mergedInteractions);
    return mergedInteractions;
  } catch (error) {
    if (cachedInteractions.length > 0) {
      return mergeInteractions([], cachedInteractions);
    }

    throw error;
  }
}

export async function getInteractionById(interactionId: string) {
  const cachedInteraction = readCachedInteractions().find(
    (interaction) => interaction.id === interactionId,
  );

  if (cachedInteraction) {
    return cachedInteraction;
  }

  return requestWithFallback({
    candidates: interactionDetailsCandidates(interactionId),
    parser: normalizeInteraction,
  });
}

export async function getInteractionsByPerson(personId: string) {
  const interactions = await getAllInteractions();
  return interactions.filter((interaction) => interaction.personId === personId);
}

export async function createInteraction(
  personId: string,
  values: InteractionFormValues
) {
  const session = await requireSession();

  const interaction = await requestWithFallback({
    candidates: createInteractionCandidates,
    body: {
      userId: session.user.id,
      personId,
      type: values.type.trim(),
      notes: values.notes.trim(),
    },
    parser: normalizeInteraction,
  });

  upsertCachedInteraction(interaction);
  return interaction;
}

export async function updateInteraction(
  interactionId: string,
  values: InteractionFormValues
) {
  const interaction = await requestWithFallback({
    candidates: updateInteractionCandidates(interactionId),
    body: {
      type: values.type.trim(),
      notes: values.notes.trim(),
    },
    parser: normalizeInteraction,
  });

  upsertCachedInteraction(interaction);
  return interaction;
}

export async function deleteInteraction(interactionId: string) {
  await requestWithFallback({
    candidates: deleteInteractionCandidates(interactionId),
  });

  removeCachedInteraction(interactionId);
}
