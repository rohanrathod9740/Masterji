// =========================
// Prisma Model Types
// =========================

export type TaskStatus = "pending" | "completed" | "cancelled";

export interface Task {
  id: string;
  userId: string;

  personId?: string | null;
  caseId?: string | null;

  title: string;
  remindAt: Date;
  status: TaskStatus;

  createdAt: Date;

  // Relations
  user?: User;
  person?: Person | null;
  case?: Case | null;
}

export type CaseStatus = "active" | "closed" | "resolved";

export interface Case {
  id: string;
  userId: string;
  personId: string;

  category?: string | null;
  problem?: string | null;
  diagnosis?: string | null;
  suggestedActions?: string | null;

  followUpDate?: Date | null;
  status: CaseStatus;

  createdAt: Date;

  // Relations
  user?: User;
  person?: Person;

  tasks?: Task[];
}

export type CommitmentStatus = "pending" | "completed" | "cancelled";

export interface Commitment {
  id: string;
  userId: string;
  personId: string;
  interactionId?: string | null;

  title: string;
  dueDate: Date;
  status: CommitmentStatus;

  createdAt: Date;

  // Relations
  user?: User;
  person?: Person;
  interaction?: Interaction | null;
}

export interface Interaction {
  id: string;
  userId: string;
  personId: string;

  type?: string | null;
  notes?: string | null;

  audioUrl?: string | null;
  transcript?: string | null;

  createdAt: Date;

  // Relations
  user?: User;
  person?: Person;

  commitments?: Commitment[];
}

export interface PersonTag {
  id: string;

  personId: string;
  tagId: string;

  // Relations
  person?: Person;
  tag?: Tag;
}

export interface Person {
  id: string;
  userId: string;

  name: string;
  type?: string | null;
  contact?: string | null;
  notes?: string | null;

  createdAt: Date;

  // Relations
  user?: User;

  tags?: PersonTag[];
  interactions?: Interaction[];
  commitments?: Commitment[];
  cases?: Case[];
  tasks?: Task[];
}

export interface User {
  id: string;

  name?: string | null;
  email: string;
  phone?: string | null;

  password: string;

  createdAt: Date;

  // Relations
  persons?: Person[];
  interactions?: Interaction[];
  commitments?: Commitment[];
  cases?: Case[];
  tasks?: Task[];
  tags?: Tag[];
}

export interface Tag {
  id: string;
  userId: string;

  name: string;

  // Relations
  user?: User;
  persons?: PersonTag[];
}

export type PersonType =
  | "client"
  | "shishya"
  | "patient"
  | "friend"
  | "other";

export type TranscriberData = {
  text: string;
}

export  interface Transcriber {
  onInputChange: () => void
  isProcessing: boolean
  isModeLoading:boolean
  modelLoadingProgress: number
  start: (audioData: AudioBuffer | undefined) => void
  output?: TranscriberData
}