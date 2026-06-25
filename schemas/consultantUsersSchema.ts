import { z } from "zod";

// ── GET /api/client/consultants ───────────────────────────────────────────
export const listConsultantsSchema = z.object({
  /** Filter by a specific tag name (e.g. "legal", "software & ai") */
  tag: z
    .string()
    .min(1)
    .toLowerCase()
    .trim()
    .optional(),

  /** Full-text search on name or consultancy name */
  search: z
    .string()
    .trim()
    .optional(),

  skip: z
    .string()
    .regex(/^\d+$/, "skip must be a non-negative integer")
    .transform(Number)
    .optional(),

  take: z
    .string()
    .regex(/^\d+$/, "take must be a positive integer")
    .transform(Number)
    .optional(),
});

export type ListConsultantsInput = z.infer<typeof listConsultantsSchema>;
