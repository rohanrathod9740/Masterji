
export type Status = "pending" | "active" | "completed" | "cancelled";

export interface User {
  id: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  password: string;
  createdAt: Date;

  persons?: Person[];
  interactions?: Interaction[];
  commitments?: Commitment[];
  cases?: Case[];
  tasks?: Task[];
  tags?: Tag[];
}

export interface Person {
  id: string;
  userId: string;

  name: string;
  type?: string | null;
  contact?: string | null;
  notes?: string | null;

  createdAt: Date;

  user?: User;

  tags?: PersonTag[];
  interactions?: Interaction[];
  commitments?: Commitment[];
  cases?: Case[];
  tasks?: Task[];
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

  user?: User;
  person?: Person;

  commitments?: Commitment[];
}

export interface Commitment {
  id: string;
  userId: string;
  personId: string;
  interactionId?: string | null;

  title: string;
  dueDate: Date;
  status: Status | string;

  createdAt: Date;

  user?: User;
  person?: Person;
  interaction?: Interaction | null;
}

export interface Case {
  id: string;
  userId: string;
  personId: string;

  category?: string | null;
  problem?: string | null;
  diagnosis?: string | null;
  suggestedActions?: string | null;

  followUpDate?: Date | null;
  status: Status | string;

  createdAt: Date;

  user?: User;
  person?: Person;

  tasks?: Task[];
}

export interface Task {
  id: string;
  userId: string;

  personId?: string | null;
  caseId?: string | null;

  title: string;
  remindAt: Date;
  status: Status | string;

  createdAt: Date;

  user?: User;
  person?: Person | null;
  case?: Case | null;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;

  user?: User;
  persons?: PersonTag[];
}

export interface PersonTag {
  id: string;

  personId: string;
  tagId: string;

  person?: Person;
  tag?: Tag;
}