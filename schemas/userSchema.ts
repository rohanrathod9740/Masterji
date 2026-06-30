import { z } from "zod";

// ── Enums (mirror prisma/schema.prisma) ───────────────────────────────────

export const consultantCategoryEnum = z.enum([
  "MEDICAL",
  "LEGAL",
  "IT",
  "PHYSIOTHERAPY",
  "HOMEOPATHY",
  "ASTROLOGY",
  "OTHER",
]);

export const paymentTimingEnum = z.enum([
  "PAY_ON_BOOKING",
  "PAY_AFTER_SESSION",
]);

// ── Register (create consultant) schema ───────────────────────────────────

export const createUserSchema = z.object({
  // ── Identity ──────────────────────────────────────────────────────────
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[\d]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      'Password must contain at least one special character'
    ),

  // ── Profile ───────────────────────────────────────────────────────────
  dob: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Date of birth must be a valid date"),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(2000, "Bio must be at most 2000 characters")
    .trim(),
  headline: z.string().max(200).trim().optional(),
  profilePhotoUrl: z.string().url().trim().optional().or(z.literal("")),

  // ── Professional ─────────────────────────────────────────────────────
  category: consultantCategoryEnum,
  subSpecialization: z.string().max(200).trim().optional(),
  nameOfConsultancy: z
    .string()
    .min(2, "Consultancy name must be at least 2 characters")
    .max(200, "Consultancy name must be at most 200 characters")
    .trim()
    .optional(),
  designation: z
    .string()
    .min(2, "Designation must be at least 2 characters")
    .max(100, "Designation must be at most 100 characters")
    .trim()
    .optional(),
  yearsOfExperience: z
    .number()
    .int("Years of experience must be a whole number")
    .min(0, "Years of experience must be 0 or greater")
    .max(60, "Years of experience must be 60 or less")
    .default(0),
  consultationFee: z
    .number()
    .min(0, "Consultation fee must be 0 or greater")
    .default(150),
  currency: z.string().default("INR"),
  paymentTiming: paymentTimingEnum.default("PAY_ON_BOOKING"),
  consultantTags: z
    .array(z.string().min(1).toLowerCase())
    .default([])
    .transform((tags) => tags.map((t) => t.trim().toLowerCase())),

  // ── Location ──────────────────────────────────────────────────────────
  address: z.string().max(500).trim().optional(),
  city: z.string().max(100).trim().optional(),
  state: z.string().max(100).trim().optional(),
  country: z.string().max(100).trim().default("India"),
  timezone: z.string().min(1, "Timezone is required").trim().default("Asia/Kolkata"),

  // ── Online Presence ────────────────────────────────────────────────────
  website: z.string().url("Website must be a valid URL").trim().optional().or(z.literal("")),
  linkedinUrl: z.string().url("LinkedIn URL must be a valid URL").trim().optional().or(z.literal("")),
  portfolioUrl: z.string().url("Portfolio URL must be a valid URL").trim().optional().or(z.literal("")),
});

export const loginSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .trim()
      .optional(),
    phone: z
      .string()
      .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
      .trim()
      .optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine((data) => data.email || data.phone, {
    message: "Email or phone is required",
    path: ["email"],
  });

export const updateUserSchema = z.object({
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
    .trim()
    .optional(),
}).strict();

export type ConsultantCategory = z.infer<typeof consultantCategoryEnum>;
export type PaymentTiming = z.infer<typeof paymentTimingEnum>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;