import { z } from "zod";

export const createPersonSchema = z.object({
  userId: z
  .string()
  .trim(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters")
    .trim(),
  type: z
    .enum(["client", "shishya", "patient", "friend", "other"])
    .optional(),
  email: z
    .string()
    .email("Invalid email")
    .optional(),
  phone: z
    .string()
    .max(20, "Phone must be at most 20 characters")
    .trim()
    .optional(),
  tags: z
    .array(z.string())
    .optional(),
  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .trim()
    .optional(),
  audioUrl:z
    .string()
    .optional(),
  interactionType:z
    .enum(["conversation", "advice", "meeting", "treatment", "proposal", "session"])
    .optional(),
});

export const editPersonSchema = z.object({
  userId: z
  .string()
  .trim(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be at most 255 characters")
    .trim(),
  type: z
    .enum(["client", "shishya", "patient", "friend", "other"])
    .optional(),
  email: z
    .string()
    .email("Invalid email")
    .optional(),
  phone: z
    .string()
    .max(20, "Phone must be at most 20 characters")
    .trim()
    .optional(),
  tags: z
    .array(z.string())
    .optional(),

});









export const listPersonSchema = z.object({
  search: z
    .string()
    .optional()
    .describe("Search by name or contact"),
  type: z
    .string()
    .optional()
    .describe("Filter by person type"),
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

export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export type ListPersonInput = z.infer<typeof listPersonSchema>;
