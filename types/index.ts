import { Prisma } from "@prisma/client";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export type UserRole = "CONSULTANT" | "CLIENT" | "ADMIN";

export type ConsultantCategory =
  | "MEDICAL"
  | "LEGAL"
  | "IT"
  | "PHYSIOTHERAPY"
  | "HOMEOPATHY"
  | "ASTROLOGY"
  | "OTHER";

export const SECTION_TO_CATEGORY: Record<string, string> = {
  medical: 'MEDICAL',
  legal: 'LEGAL',
  it: 'IT',
  physiotherapy: 'PHYSIOTHERAPY',
  homeopathy: 'HOMEOPATHY',
  astrology: 'ASTROLOGY',
  other: 'OTHER',
}



export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED" | "SUSPENDED";

export type ClientStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "BLOCKED";

export type CaseStatus = "ACTIVE" | "CLOSED" | "ARCHIVED";

export type AppointmentStatus =
  | "REQUESTED"
  | "APPROVED"
  | "RESCHEDULE_PROPOSED"
  | "RESCHEDULED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export type MeetingMode =
  | "IN_PERSON"
  | "ZOOM"
  | "GOOGLE_MEET"
  | "OTHER_VIDEO"
  | "AUDIO_ONLY";

export type InteractionType =
  | "RECORDED_AUDIO"
  | "NOTE"
  | "FOLLOW_UP_CALL"
  | "MESSAGE"
  | "VIDEO_SESSION";

export type TranscriptStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "LOW_CONFIDENCE";

export type Visibility = "CONSULTANT_ONLY" | "SHARED_WITH_CLIENT";

export type CommitmentMadeBy = "CONSULTANT" | "CLIENT";

export type CommitmentStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "FULFILLED"
  | "MISSED"
  | "CANCELLED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TaskAssignedTo = "CLIENT" | "CONSULTANT";

export type TaskStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "OVERDUE" | "CANCELLED";

export type DocumentCategory =
  | "PRESCRIPTION"
  | "REPORT"
  | "CONTRACT"
  | "ID_PROOF"
  | "RECORDING"
  | "OTHER";

export type PaymentStatus =
  | "CREATED"
  | "AUTHORIZED"
  | "CAPTURED"
  | "PAID"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED"
  | "CANCELLED";

export type PaymentTiming = "PAY_ON_BOOKING" | "PAY_AFTER_SESSION";

export type DisputeStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED_FOR_CLIENT"
  | "RESOLVED_FOR_CONSULTANT"
  | "CLOSED";

export type DisputeType = "PAYMENT" | "NO_SHOW" | "COMMITMENT_DISPUTE" | "QUALITY" | "OTHER";

export type SlotStatus = "OPEN" | "BOOKED" | "BLOCKED";

// ─────────────────────────────────────────────
// AUTH / IDENTITY
// ─────────────────────────────────────────────

export type User = {
  id: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SafeUser = Omit<User, "passwordHash">;

// ─────────────────────────────────────────────
// PROFILES
// ─────────────────────────────────────────────

export type ConsultantProfile = {
  id: string;
  userId: string;

  fullName: string;
  dob: Date;
  profilePhotoUrl: string | null;
  headline: string | null;
  bio: string;

  category: ConsultantCategory;
  subSpecialization: string | null;
  verificationTier: "BASIC" | "STANDARD" | "STRICT";
  verificationStatus: VerificationStatus;
  verificationNote: string | null;

  licenseNumber: string | null;
  licenseDocUrl: string | null;
  licenseExpiresAt: Date | null;

  nameOfConsultancy: string | null;
  designation: string | null;
  yearsOfExperience: number;

  consultationFee: Prisma.Decimal;
  currency: string;
  paymentTiming: PaymentTiming;

  isAcceptingNewClients: boolean;
  isFeatured: boolean;

  timezone: string;
  city: string | null;
  state: string | null;
  country: string;
  address: string | null;

  website: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  resumeUrl: string | null;

  ratingAvg: number;
  ratingCount: number;

  payoutAccountRef: string | null;

  createdAt: Date;
  updatedAt: Date;
};

export type ClientProfile = {
  id: string;
  userId: string;

  fullName: string;
  dob: Date | null;
  gender: string | null;
  profilePhotoUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  timezone: string;

  emergencyContact: string | null;
  preferredLanguage: string | null;

  kycStatus: string | null;
  kycDocUrl: string | null;

  isMinor: boolean;
  guardianName: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;

  status: ClientStatus;
  internalNotes: string[];

  createdAt: Date;
  updatedAt: Date;
};

// ─────────────────────────────────────────────
// CASE
// ─────────────────────────────────────────────

export type Case = {
  id: string;
  consultantId: string;
  clientId: string;
  category: ConsultantCategory;
  title: string | null;
  description: string | null;
  status: CaseStatus;
  openedAt: Date;
  closedAt: Date | null;
  closureReason: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

// ─────────────────────────────────────────────
// APPOINTMENT
// ─────────────────────────────────────────────

export type Appointment = {
  id: string;
  caseId: string;
  consultantId: string;
  clientId: string;
  slotId: string | null;

  scheduledStart: Date;
  scheduledEnd: Date;

  status: AppointmentStatus;

  rejectionReason: string | null;
  cancellationReason: string | null;
  cancelledBy: "CONSULTANT" | "CLIENT" | null;

  rescheduleProposedBy: "CONSULTANT" | "CLIENT" | null;
  rescheduleProposedStart: Date | null;
  rescheduleProposedEnd: Date | null;
  rescheduleReason: string | null;
  rescheduleResponseDeadline: Date | null;

  requestExpiresAt: Date | null;

  mode: MeetingMode;
  meetingLink: string | null;
  calendarEventId: string | null;
  purpose: string;

  feeAmount: Prisma.Decimal;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentTiming: PaymentTiming;

  noShowGracePeriodEndsAt: Date | null;
  noShowDisputeAllowed: boolean;
  consentGiven: boolean;

  createdAt: Date;
  updatedAt: Date;
};

// ─────────────────────────────────────────────
// INTERACTION
// ─────────────────────────────────────────────

export type Interaction = {
  id: string;
  caseId: string;
  consultantId: string;
  clientId: string;
  appointmentId: string | null;

  type: InteractionType;
  occurredAt: Date;
  durationSecs: number | null;

  rawAudioUrl: string | null;
  transcriptText: string | null;
  transcriptStatus: TranscriptStatus;
  transcriptLang: string | null;

  notesText: string | null;
  visibility: Visibility;
  consentGiven: boolean;

  deletedAt: Date | null;
  deletedBy: string | null;

  createdAt: Date;
  updatedAt: Date;
};

// ─────────────────────────────────────────────
// COMMITMENT
// ─────────────────────────────────────────────

export type Commitment = {
  id: string;
  caseId: string;
  consultantId: string;
  clientId: string;
  interactionId: string | null;

  madeBy: CommitmentMadeBy;
  title: string;
  description: string | null;
  dueDate: Date;
  priority: Priority;
  status: CommitmentStatus;
  fulfilledAt: Date | null;
  reminderSentAt: Date[];

  createdAt: Date;
  updatedAt: Date;
};

// ─────────────────────────────────────────────
// TASK
// ─────────────────────────────────────────────

export type Task = {
  id: string;
  caseId: string;
  consultantId: string;
  clientId: string;
  interactionId: string | null;

  assignedTo: TaskAssignedTo;
  title: string;
  description: string | null;
  dueDate: Date;
  priority: Priority;
  status: TaskStatus;
  completedAt: Date | null;
  reminderSentAt: Date[];

  createdAt: Date;
  updatedAt: Date;
};

// ─────────────────────────────────────────────
// DOCUMENT
// ─────────────────────────────────────────────

export type Document = {
  id: string;
  caseId: string;
  clientId: string;
  interactionId: string | null;
  taskId: string | null;

  uploadedByRole: string;
  uploadedById: string;

  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;

  category: DocumentCategory;
  accessLevel: Visibility;
  scanStatus: "PENDING" | "CLEAN" | "INFECTED";

  version: number;
  previousVersionId: string | null;

  deletedAt: Date | null;
  deletedBy: string | null;

  createdAt: Date;
  updatedAt: Date;
};

// ─────────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────────

export type Payment = {
  id: string;
  appointmentId: string;
  consultantId: string;
  clientId: string;

  orderId: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;

  amount: Prisma.Decimal;
  currency: string;
  method: string | null;

  platformFee: Prisma.Decimal;
  consultantPayoutAmount: Prisma.Decimal;
  payoutStatus: string;

  status: PaymentStatus;

  refundAmount: Prisma.Decimal | null;
  refundReason: string | null;
  refundedAt: Date | null;

  description: string | null;
  paidAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
};

// ─────────────────────────────────────────────
// REVIEW
// ─────────────────────────────────────────────

export type Review = {
  id: string;
  appointmentId: string;
  consultantId: string;
  clientId: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// ─────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────

export type AuditLog = {
  id: string;
  actorUserId: string | null;
  action: "CREATED" | "UPDATED" | "DELETED" | "ACCESSED" | "EXPORTED" | "STATUS_CHANGED";
  entityType: string;
  entityId: string;
  before: unknown | null;
  after: unknown | null;
  ipAddress: string | null;
  userAgent: string | null;
  accessJustification: string | null;
  metadata: unknown | null;
  timestamp: Date;
};

// ─────────────────────────────────────────────
// UI DATA SHAPES
// ─────────────────────────────────────────────

export type ConsultantCardData = {
  id: string;
  fullName: string;
  nameOfConsultancy: string | null;
  profilePhotoUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  designation: string | null;
  yearsOfExperience: number;
  city: string | null;
  country: string;
  ratingAvg: number;
  ratingCount: number;
  specialties: string[];             // tag names
  consultationFee: number;
  featured: boolean;
  isVerified: boolean;
  category: ConsultantCategory;
};

export const professionTags = [
  { name: "All", id: "all" },
  { name: "Medical", id: "medical" },
  { name: "Legal", id: "legal" },
  { name: "IT", id: "it" },
  { name: "Physiotherapy", id: "physiotherapy" },
  { name: "Homeopathy", id: "homeopathy" },
  { name: "Astrology", id: "astrology" },
  { name: "Other", id: "other" },
];

export type TranscriberData = {
  text: string;
};

export interface Transcriber {
  onInputChange: () => void;
  isProcessing: boolean;
  isModeLoading: boolean;
  modelLoadingProgress: number;
  start: (audioData: AudioBuffer | undefined) => void;
  output?: TranscriberData;
}