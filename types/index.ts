import { Prisma } from "@/prisma/migrations/client";
// =====================
// ConsultantTag
// =====================
export type ConsultantTag = {
  id: string;
  name: string;
};
enum ClientType {
  "strategy_consulting",
  "operations_consulting",
  "it_consulting",
  "marketing_consulting",
  "human_resources_consulting",
  "other",
}

enum ClientStatus {
  "active",
  "inactive",
  "archived",
}


// =====================
// User
// =====================
export type User = {
  id: string;
  name: string | null;
  dob: Date;

  email: string;
  phone: string;
  avgReviews: number;
  nameOfConsultancy: string;
  address: string;
  password: string;

  createdAt: Date;
  appointmentFee: number;
};

// =====================
// Client
// =====================
export type Client = {
  id: string;

  name: string;
  email: string;
  phone: string;

  companyName: string | null;
  password: string | null;

  type: ClientType | null;
  status: ClientStatus | null;

  tags: string[];

  address: string;
  dob: Date;

  internalNotes: string[];

  passwordHash: string;

  createdAt: Date;
  updatedAt: Date;
};

// =====================
// UserSlots
// =====================
export type UserSlots = {
  id: string;

  userId: string;
  clientId: string | null;

  dayOfWeek: number;

  startTime: Date;
  endTime: Date;
};

enum MeetingMode {
  "office_meet",
  "online_meet",
  "other",
}

enum AppointmentStatus {
  "pending_for_approval",
  "scheduled",
  "rescheduled",
  "missed",
}

// =====================
// Appointment
// =====================
export type Appointment = {
  id: string;

  clientId: string;

  appointmentDate: Date;
  appointmentTime: string;

  meetingMode: MeetingMode;
  status: AppointmentStatus;

  purpose: string;

  createdAt: Date;
  updatedAt: Date;

  userId: string | null;
};

// =====================
// Attachment
// =====================
export type Attachment = {
  id: string;

  userId: string | null;

  clientId: string | null;
  interactionId: string | null;
  taskId: string | null;
  appointmentId: string | null;

  fileName: string;
  fileType: string;
  fileUrl: string;

  fileSize: number | null;

  createdAt: Date;
};


enum InteractionType {
  "consulation",
  "meeting",
  "call",
  "treatment_session",
  "review_meeting",
  "project_discussion",
  "support_call",
}

// =====================
// Interaction
// =====================
export type Interaction = {
  id: string;

  userId: string;
  clientId: string;

  interactionType: InteractionType | null;

  notes: string | null;
  audioUrl: string | null;
  transcript: string | null;

  interactionDate: Date;
};

enum CommitmentStatus {
  "pending",
  "done",
  "missed",
}

// =====================
// Commitment
// =====================
export type Commitment = {
  id: string;

  userId: string;
  clientId: string;
  interactionId: string | null;

  title: string;

  dueDate: Date;

  status: CommitmentStatus;

  createdAt: Date;
};


enum CaseStatus {
  "active",
  "resolved",
  "monitoring",
}

// =====================
// Case
// =====================
export type Case = {
  id: string;

  userId: string;
  clientId: string;

  problem: string | null;
  diagnosis: string | null;
  suggestedActions: string | null;

  followUpDate: Date | null;

  status: CaseStatus;

  createdAt: Date;
};


enum TaskStatus {
  "pending",
  "in_progress",
  "done",
  "overdue",
}

// =====================
// Task
// =====================
export type Task = {
  id: string;

  userId: string;

  clientId: string | null;
  caseId: string | null;

  title: string;

  remindAt: Date;

  status: TaskStatus;

  createdAt: Date;
};



enum AuditRecordType {
  "client",
  "interaction",
  "task",
  "appointment",
}

enum AuditAction {
  "created",
  "updated",
  "deleted",
}

// =====================
// AuditLog
// =====================
export type AuditLog = {
  id: string;

  userId: string | null;

  recordType: AuditRecordType;

  recordId: string;

  action: AuditAction;

  before: unknown | null;
  after: unknown | null;

  timestamp: Date;
};


enum PaymentStatus {
  "created",
  "authorized",
  "captured",
  "paid",
  "failed",
  "refunded",
  "cancelled",
}


// =====================
// Payment
// =====================
export type Payment = {
  id: string;

  userId: string;
  clientId: string;

  orderId: string | null;

  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;

  amount: Prisma.Decimal;

  currency: string;

  status: PaymentStatus;

  method: string | null;
  description: string | null;

  paidAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
};

// =====================
// RazorpayWebhook
// =====================
export type RazorpayWebhook = {
  id: string;

  eventId: string | null;
  eventType: string;

  paymentId: string | null;

  payload: Prisma.JsonValue;

  processed: boolean;

  createdAt: Date;
};

export type AppointmenStatus= "pending_for_approval" | "scheduled" | "rescheduled" | "missed"

export const professtionTags= [
  { name: 'All', id: 'all' },
  { name: 'Software & AI', id: 'software_and_ai' },
  { name: 'Hardware & Robotics', id: 'hardware_and_robotics' },
  { name: 'Legal', id: 'legal' },
  { name: 'Strategy', id: 'strategy' },
  { name: 'Finance', id: 'finance' },
  { name: 'Operations', id: 'operations' },
  { name: 'People & HR', id: 'people_and_hr' },
];

export type ConsultantCardData = {
  id: string;
  name: string;
  nameOfConsultancy: string;
  profilePicture?: string | null;   // User.profilePicture
  headline?: string | null;         // User.headline
  bio?: string | null;              // User.bio
  designation: string;              // User.designation
  yearsOfExperience: number;        // User.yearsOfExperience
  city: string;                     // User.city
  country: string;                  // User.country
  avgReviews: number;
  reviewCount: number;              // _count.review
  specialties: string[];            // tag names from ConsultantTag[]
  appointmentFee: number;           // User.appointmentFee
  featured: boolean;                // User.isFeatured
  isVerified: boolean;              // User.isVerified
};
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