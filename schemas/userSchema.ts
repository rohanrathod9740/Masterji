import { z } from "zod";

export const createUserSchema = z.object({
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
  dob: z
    .string()
    .refine(
      (date) => !isNaN(Date.parse(date)),
      "Date of birth must be a valid date"
    ),
  type: z
    .enum(["it", "healthcare", "realestate", "legal", "other"])
    .default("it"),
  nameOfConsultancy: z
    .string()
    .min(2, "Consultancy name must be at least 2 characters")
    .max(200, "Consultancy name must be at most 200 characters")
    .trim(),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be at most 500 characters")
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

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;