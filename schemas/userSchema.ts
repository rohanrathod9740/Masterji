import { z } from "zod";

export const createUserSchema = z.object({
  // ── Identity ──────────────────────────────────────────────────────────────
  name: z
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
      'Password must contain at least one special character: ! @ # $ % ^ & * ( ) , . ? " : { } | < >'
    ),

  // ── Profile ───────────────────────────────────────────────────────────────
  dob: z
    .string()
    .refine(
      (date) => !isNaN(Date.parse(date)),
      "Date of birth must be a valid date"
    ),
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(2000, "Bio must be at most 2000 characters")
    .trim(),

  // ── Professional ─────────────────────────────────────────────────────────
  nameOfConsultancy: z
    .string()
    .min(2, "Consultancy name must be at least 2 characters")
    .max(200, "Consultancy name must be at most 200 characters")
    .trim(),
  designation: z
    .string()
    .min(2, "Designation must be at least 2 characters")
    .max(100, "Designation must be at most 100 characters")
    .trim(),
  yearsOfExperience: z
    .number(  "Years of experience must be a number" )
    .int("Years of experience must be a whole number")
    .min(0, "Years of experience must be 0 or greater")
    .max(60, "Years of experience must be 60 or less"),
  appointmentFee: z
    .number( "Appointment fee must be a number" )
    .int("Appointment fee must be a whole number")
    .min(0, "Appointment fee must be 0 or greater"),
  consultantTags: z
    .array(z.string().min(1).toLowerCase())
    .default([])
    .transform((tags) => tags.map((t) => t.trim().toLowerCase())),

  // ── Location ──────────────────────────────────────────────────────────────
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters")
    .trim()
    .optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must be at most 100 characters")
    .trim(),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(100, "State must be at most 100 characters")
    .trim(),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must be at most 100 characters")
    .trim(),
  timezone: z
    .string()
    .min(1, "Timezone is required")
    .trim(),

  // ── Online Presence ────────────────────────────────────────────────────────
  website: z
    .string()
    .url("Website must be a valid URL")
    .trim()
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("LinkedIn URL must be a valid URL")
    .trim()
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("Portfolio URL must be a valid URL")
    .trim()
    .optional()
    .or(z.literal("")),
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
      .regex(
        /^[\d\s\-\+\(\)]{10,}$/,
        "Invalid phone number format"
      )
      .trim()
      .optional(),

    password: z
      .string()
      .min(1, "Password is required"),
  })
  .refine(
    (data) => data.email || data.phone,
    {
      message: "Email or phone is required",
      path: ["email"],
    }
  );

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim()
    .optional(),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
    .trim()
    .optional(),
}).strict();

export type CreateUserInput  = z.infer<typeof createUserSchema>;
export type LoginInput       = z.infer<typeof loginSchema>;
export type UpdateUserInput  = z.infer<typeof updateUserSchema>;