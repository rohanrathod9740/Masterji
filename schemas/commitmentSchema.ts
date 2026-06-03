import { z } from "zod";

const commitmentStatusEnum = ["pending", "done", "missed"] as const;

export const createCommitmentSchema = z.object({
  userId: z.string().trim().min(1,"You are not authenticated to perform this action."),
  personId: z.string().trim().min(1, "The person is required"),
  interactionId: z.string().trim().optional(),
  title: z.string().trim().min(1, "Title is required").max(500, "Title must be at most 500 characters"),
  dueDate: z.string().datetime("dueDate must be a valid ISO datetime string"),
  status: z.enum(commitmentStatusEnum).default("pending").optional(),
});

export const updateCommitmentSchema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  dueDate: z.string().datetime("dueDate must be a valid ISO datetime string").optional(),
  status: z.enum(commitmentStatusEnum).optional(),
  personId: z.string().trim().min(1, "The person is required").optional(),
  interactionId: z.string().trim().nullable().optional(),
});

export const listCommitmentSchema = z.object({
  userId: z.string().trim().min(1, "You are not authenticated to perform this action."),
  personId: z.string().trim().optional(),
  interactionId: z.string().trim().optional(),
  status: z.enum(commitmentStatusEnum).optional(),
  skip: z.number().int().min(0).default(0).optional(),
  take: z.number().int().min(1).max(100).default(10).optional(),
});

export type CreateCommitmentInput = z.infer<typeof createCommitmentSchema>;
export type UpdateCommitmentInput = z.infer<typeof updateCommitmentSchema>;
export type ListCommitmentInput = z.infer<typeof listCommitmentSchema>;
