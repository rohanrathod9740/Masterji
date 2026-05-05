export const personTypeOptions = [
  "client",
  "patient",
  "shishya",
  "friend",
  "family",
  "other",
] as const;

export const interactionTypeOptions = [
  "conversation",
  "meeting",
  "call",
  "session",
  "follow_up",
  "treatment",
  "other",
] as const;

export type PersonType = (typeof personTypeOptions)[number] | string;
export type InteractionType = (typeof interactionTypeOptions)[number] | string;

export type Person = {
  id: string;
  userId: string | null;
  name: string;
  contact: string | null;
  type: string | null;
  notes: string | null;
  createdAt: string | null;
};

export type Interaction = {
  id: string;
  userId: string | null;
  personId: string;
  type: string | null;
  notes: string | null;
  audioUrl: string | null;
  transcript: string | null;
  occurredAt: string;
};

export type PersonFormValues = {
  name: string;
  contact: string;
  type: string;
  notes: string;
};

export type InteractionFormValues = {
  type: string;
  notes: string;
};

export type PersonProfile = {
  person: Person;
  interactions: Interaction[];
};
