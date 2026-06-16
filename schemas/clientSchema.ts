import { z } from "zod";

// ── Enums (mirror prisma/schema.prisma) ───────────────────────────────────

export const clientTypeEnum = z.enum([
  "strategy_consulting",
  "operations_consulting",
  "it_consulting",
  "marketing_consulting",
  "human_resources_consulting",
  "other",
]);

export const clientStatusEnum = z.enum([
  "active",
  "inactive",
  "archived",
]);

// ── Create schema ─────────────────────────────────────────────────────────
// Used when onboarding a new client.

export const createClientSchema = z.object({
  // Required
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
    .trim(),

  dob: z.coerce.date("Invalid date of birth"),

  address: z.string().min(1, "Address is required").trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),

  // Optional
  companyName: z.string().trim().max(150).optional(),
  type:        clientTypeEnum.optional(),
  status:      clientStatusEnum.optional().default("active"),
  tags:        z.array(z.string().trim()).default([]),
  internalNotes: z.array(z.string().trim()).default([]),
});

// ── Update schema ─────────────────────────────────────────────────────────
// All fields optional for PATCH operations.

export const updateClientSchema = createClientSchema
  .omit({ password: true })   // password updates should go through a dedicated flow
  .partial();

// ── Login schema ──────────────────────────────────────────────────────────

export const loginClientSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Invalid email address").optional(),
    phone: z
      .string()
      .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
      .trim()
      .optional(),
    password: z.string().min(1, "Password is required").trim(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
    path: ["email"],
  });

// ── Inferred types ────────────────────────────────────────────────────────

export type ClientType        = z.infer<typeof clientTypeEnum>;
export type ClientStatus      = z.infer<typeof clientStatusEnum>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type LoginClientInput  = z.infer<typeof loginClientSchema>;
