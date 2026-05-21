import { z } from "zod";
import { InteractionType } from "@/prisma/migrations/enums";

export const interactionSchema = z.object({
  interactionType: z
    .enum([
      "conversation",
      "advice",
      "meeting",
      "treatment",
      "proposal",
      "session",
    ])
    .optional(),

  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .trim()
    .optional(),

  audioUrl: z
    .string()
    .url("Invalid URL")
    .optional(),

  transcript: z
    .string()
    .max(5000, "Transcript must be at most 5000 characters")
    .trim()
    .optional(),

  interactionDate: z
    .string()
    .datetime()
    .optional(),
});

export const createInteractionSchema = z.object({
  userId: z
    .string()
    .trim(),

  personId: z
    .string()
    .trim(),

  interactionType: z
    .enum([
      "conversation",
      "advice",
      "meeting",
      "treatment",
      "proposal",
      "session",
    ])
    .optional(),

  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .trim()
    .optional(),

  audioUrl: z
    .string()
    .url("Invalid URL")
    .optional(),

  transcript: z
    .string()
    .max(5000, "Transcript must be at most 5000 characters")
    .trim()
    .optional(),

  interactionDate: z
    .string()
    .datetime()
    .optional(),
});

export const listInteractionSchema = z.object({
  userId: z
    .string()
    .trim(),
  personId: z
    .string()
    .trim()
    .optional(),
  type: z
    .enum(["conversation", "advice", "meeting", "treatment", "proposal", "session"])
    .optional(),
  skip: z
    .number()
    .int()
    .min(0, "Skip must be at least 0")
    .default(0)
    .optional(),
  take: z
    .number()
    .int()
    .min(1, "Take must be at least 1")
    .max(100, "Take must be at most 100")
    .default(10)
    .optional(),
});

export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
export type ListInteractionInput = z.infer<typeof listInteractionSchema>;
