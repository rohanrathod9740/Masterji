import { z } from "zod";

export const createUserSchema = z.object({
  userName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  userEmail: z
    .string()
    .email("Invalid email address")
    .toLowerCase()
    .trim(),
  userPhone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
    .trim(),
  userPassword: z
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
    userEmail: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .trim()
      .optional(),

    userPhone: z
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
    (data) => data.userEmail || data.userPhone,
    {
      message: "Email or phone is required",
      path: ["userEmail"],
    }
  );

export const updateUserSchema = z.object({
  userName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim()
    .optional(),
  userPhone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
    .trim()
    .optional(),
}).strict();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;