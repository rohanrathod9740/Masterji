import { z } from "zod";

// ── Enums (mirror prisma/schema.prisma) ───────────────────────────────────

export const commitmentStatusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "FULFILLED",
  "MISSED",
  "CANCELLED",
]);

export const commitmentMadeByEnum = z.enum(["CONSULTANT", "CLIENT"]);

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

// ── Create schema ─────────────────────────────────────────────────────────

export const createCommitmentSchema = z.object({
  caseId: z.string().uuid("Invalid case ID"),
  consultantId: z.string().uuid("Invalid consultant ID"),
  clientId: z.string().uuid("Invalid client ID"),
  interactionId: z.string().uuid("Invalid interaction ID").optional(),

  madeBy: commitmentMadeByEnum,
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(500, "Title must be at most 500 characters"),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.string().datetime("dueDate must be a valid ISO datetime string"),
  priority: priorityEnum.default("MEDIUM"),
  status: commitmentStatusEnum.default("PENDING").optional(),
});

// ── Update schema ─────────────────────────────────────────────────────────

export const updateCommitmentSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  dueDate: z
    .string()
    .datetime("dueDate must be a valid ISO datetime string")
    .optional(),
  priority: priorityEnum.optional(),
  status: commitmentStatusEnum.optional(),
  interactionId: z.string().uuid().nullable().optional(),
  fulfilledAt: z.string().datetime().optional().nullable(),
});

// ── List / filter schema ──────────────────────────────────────────────────

export const listCommitmentSchema = z.object({
  consultantId: z.string().uuid().optional(),
  caseId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  interactionId: z.string().uuid().optional(),
  status: commitmentStatusEnum.optional(),
  skip: z.number().int().min(0).default(0).optional(),
  take: z.number().int().min(1).max(100).default(10).optional(),
});

// ── Inferred types ────────────────────────────────────────────────────────

export type CommitmentStatus = z.infer<typeof commitmentStatusEnum>;
export type CommitmentMadeBy = z.infer<typeof commitmentMadeByEnum>;
export type Priority = z.infer<typeof priorityEnum>;
export type CreateCommitmentInput = z.infer<typeof createCommitmentSchema>;
export type UpdateCommitmentInput = z.infer<typeof updateCommitmentSchema>;
export type ListCommitmentInput = z.infer<typeof listCommitmentSchema>;
