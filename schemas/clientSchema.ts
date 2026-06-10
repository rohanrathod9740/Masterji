import { z } from "zod";

export const createClientSchema = z.object({
  clientName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),

  clientEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  clientPhone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]{10,}$/, "Invalid phone number format")
    .trim(),

  clientPassword: z
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
    clientCompanyName:z.string().trim().optional(),
    clientDob: z.string().trim().optional(),
    clientAddress: z.string().trim().optional(),
}).strict();

export const loginClientSchema = z.object({
  clientEmail: z.string().trim().toLowerCase().email("Invalid email address").optional(),
  clientPassword: z.string().min(1, "Password is required").trim().optional(),
  clientPhone: z
   .string()
   .regex(
     /^[\d\s\-\+\(\)]{10,}$/,
     "Invalid phone number format"
   )
   .trim()
   .optional(),
})
  .refine(
    (data) => data.clientEmail || data.clientPhone,
    {
      message: "Email or phone is required",
      path: ["userEmail"],
    }
  );


export type CreateClientInput = z.infer<typeof createClientSchema>;
export type LoginClientInput = z.infer<typeof loginClientSchema>;
