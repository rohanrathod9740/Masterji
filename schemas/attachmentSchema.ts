import { z } from "zod";


export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",                                                       // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // .docx
] as const;

export const allowedFileTypeEnum = z.enum([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

// ── Create schema ─────────────────────────────────────────────────────────
// Used when creating an Attachment record after a successful Supabase upload.

export const createAttachmentSchema = z.object({
  // Uploader (internal user) — optional because system-level uploads may skip this
  clientId:      z.string().uuid("Invalid client ID").optional().nullable(),
  interactionId: z.string().uuid("Invalid interaction ID").optional().nullable(),
  taskId:        z.string().uuid("Invalid task ID").optional().nullable(),
  appointmentId: z.string().uuid("Invalid appointment ID").optional().nullable(),

  // File metadata (populated from the Supabase upload result)
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must be at most 255 characters")
    .trim(),

  fileType:allowedFileTypeEnum, 

  fileUrl: z
    .string()
    .url("Invalid file URL"),

  fileSize: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(10 * 1024 * 1024, "File must be 10 MB or less")
    .optional()
    .nullable(),
})
.refine(
  (d) => d.clientId || d.interactionId || d.taskId || d.appointmentId,
  {
    message: "Attachment must be linked to at least one of: client, interaction, task, or appointment",
    path: ["clientId"],
  }
);

// ── Update schema ─────────────────────────────────────────────────────────
// Only metadata fields are patchable — parent references and file content are immutable.

export const updateAttachmentSchema = z.object({
  fileName: z.string().min(1).max(255).trim().optional(),
});

// ── Client-side file validation helper ───────────────────────────────────
// Use this before submitting a File to the upload API.

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Must be a File object" })
    .refine((f) => f.size > 0, { message: "File must not be empty" })
    .refine((f) => f.size <= MAX_FILE_BYTES, { message: "File must be 10 MB or less" })
    .refine(
      (f) =>
        ALLOWED_FILE_TYPES.includes(f.type as (typeof ALLOWED_FILE_TYPES)[number]),
      { message: "Unsupported file type. Allowed: PDF, PNG, JPG, DOC, DOCX" }
    ),
});

// ── Inferred types ────────────────────────────────────────────────────────

export type AllowedFileType       = z.infer<typeof allowedFileTypeEnum>;
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;
export type UpdateAttachmentInput = z.infer<typeof updateAttachmentSchema>;
