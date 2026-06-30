import { z } from "zod";

// ── Enums (mirror prisma/schema.prisma) ───────────────────────────────────

export const clientStatusEnum = z.enum([
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
  "BLOCKED",
]);

// ── Create schema ─────────────────────────────────────────────────────────
// Creates a User (role=CLIENT) + ClientProfile

export const createClientSchema = z.object({
  // User fields
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
    .trim(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),

  // ClientProfile fields
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  dob: z.coerce.date().optional(),
  gender: z.string().trim().max(50).optional(),
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  country: z.string().trim().max(100).optional(),
  timezone: z.string().trim().default("Asia/Kolkata"),
  preferredLanguage: z.string().trim().optional(),

  // Minor fields
  isMinor: z.boolean().default(false),
  guardianName: z.string().trim().optional(),
  guardianPhone: z.string().trim().optional(),
  guardianEmail: z.string().email().trim().optional(),

  status: clientStatusEnum.optional().default("ACTIVE"),
  internalNotes: z.array(z.string().trim()).default([]),
});

// ── Update schema ─────────────────────────────────────────────────────────
// All fields optional for PATCH operations.

export const updateClientSchema = createClientSchema
  .omit({ password: true, email: true, phone: true }) // identity fields are immutable here
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

export type ClientStatus = z.infer<typeof clientStatusEnum>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type LoginClientInput = z.infer<typeof loginClientSchema>;
