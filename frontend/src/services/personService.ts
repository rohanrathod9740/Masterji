import { getInteractionsByPerson } from "@/services/interactionService";
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
import type { Person, PersonFormValues, PersonProfile } from "@/types/person";

const listPersonCandidates: RequestCandidate[] = [
  { path: "/api/v1/persons", method: "GET" },
];

function personDetailsCandidates(personId: string): RequestCandidate[] {
  return [{ path: `/api/v1/persons/get/${personId}`, method: "GET" }];
}

const createPersonCandidates: RequestCandidate[] = [
  { path: "/api/v1/persons/create", method: "POST" },
];

function updatePersonCandidates(personId: string): RequestCandidate[] {
  return [{ path: `/api/v1/persons/edit/${personId}`, method: "PUT" }];
}

function deletePersonCandidates(personId: string): RequestCandidate[] {
  return [{ path: `/api/v1/persons/delete/${personId}`, method: "DELETE" }];
}

const PERSON_OVERRIDE_STORAGE_KEY = "masterji.person.overrides";

type PersonOverride = Partial<
  Pick<Person, "name" | "contact" | "type" | "notes">
>;

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function readPersonOverrides() {
  const storage = getStorage();

  if (!storage) {
    return {} as Record<string, PersonOverride>;
  }

  try {
    const rawValue = storage.getItem(PERSON_OVERRIDE_STORAGE_KEY);
    return rawValue
      ? (JSON.parse(rawValue) as Record<string, PersonOverride>)
      : {};
  } catch {
    return {};
  }
}

function writePersonOverrides(overrides: Record<string, PersonOverride>) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(PERSON_OVERRIDE_STORAGE_KEY, JSON.stringify(overrides));
}

function applyPersonOverride(person: Person): Person {
  const overrides = readPersonOverrides();
  const override = overrides[person.id];

  if (!override) {
    return person;
  }

  return {
    ...person,
    ...override,
  };
}

function upsertPersonOverride(personId: string, values: PersonFormValues) {
  const overrides = readPersonOverrides();

  overrides[personId] = {
    name: values.name.trim(),
    contact: values.contact.trim() || null,
    type: values.type.trim() || null,
    notes: values.notes.trim() || null,
  };

  writePersonOverrides(overrides);
}

function removePersonOverride(personId: string) {
  const overrides = readPersonOverrides();

  if (!(personId in overrides)) {
    return;
  }

  delete overrides[personId];
  writePersonOverrides(overrides);
}

function normalizePerson(payload: unknown): Person {
  const record =
    getRecord(unwrapData(payload)) ??
    getRecord(payload, ["person"]) ??
    getRecord(payload);

  if (!record) {
    throw new ApiError("The backend did not return a valid person record.");
  }

  const id = getString(record.id);
  const name = getString(record.name);

  if (!id || !name) {
    throw new ApiError("The person response is missing required fields.");
  }

  const phone = getString(record.phone);
  const email = getString(record.email);
  const directContact = getString(record.contact);
  const fallbackContact = [phone, email].filter(Boolean).join(" / ") || null;

  return applyPersonOverride({
    id,
    userId: getString(record.userId),
    name,
    contact: directContact ?? fallbackContact,
    type: getString(record.type),
    notes: getString(record.notes),
    createdAt: getString(record.createdAt),
  });
}

function normalizePersonList(payload: unknown) {
  const list =
    getArray(unwrapData(payload), ["persons"]) ??
    getArray(payload, ["persons"]) ??
    getArray(unwrapData(payload)) ??
    getArray(payload);

  if (!list) {
    throw new ApiError("The backend did not return a valid people list.");
  }

  return [...list]
    .map((entry) => normalizePerson(entry))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function getAllPersons() {
  return requestWithFallback({
    candidates: listPersonCandidates,
    parser: normalizePersonList,
  });
}

export async function getPersonById(personId: string) {
  return requestWithFallback({
    candidates: personDetailsCandidates(personId),
    parser: normalizePerson,
  });
}

export async function createPerson(values: PersonFormValues) {
  const session = await requireSession();

  return requestWithFallback({
    candidates: createPersonCandidates,
    body: {
      userId: session.user.id,
      name: values.name.trim(),
      contact: values.contact.trim(),
      type: values.type.trim(),
      notes: values.notes.trim(),
    },
    parser: normalizePerson,
  });
}

export async function updatePerson(personId: string, values: PersonFormValues) {
  const person = await requestWithFallback({
    candidates: updatePersonCandidates(personId),
    body: {
      name: values.name.trim(),
      contact: values.contact.trim(),
      type: values.type.trim(),
      notes: values.notes.trim(),
    },
    parser: normalizePerson,
  });

  upsertPersonOverride(personId, values);
  return applyPersonOverride(person);
}

export async function deletePerson(personId: string) {
  await requestWithFallback({
    candidates: deletePersonCandidates(personId),
  });

  removePersonOverride(personId);
}

export async function getPersonProfile(
  personId: string,
): Promise<PersonProfile | null> {
  const [person, interactions] = await Promise.all([
    getPersonById(personId),
    getInteractionsByPerson(personId).catch(() => []),
  ]);

  if (!person) {
    return null;
  }

  return {
    person,
    interactions,
  };
}
