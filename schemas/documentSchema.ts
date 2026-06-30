import { z } from "zod";

// ── Allowed MIME types ────────────────────────────────────────────────────

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",                                                       // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  // .docx
  "audio/mpeg",                                                               // .mp3
  "audio/wav",
  "video/mp4",
] as const;

export const allowedFileTypeEnum = z.enum([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
]);

// ── Enums (mirror prisma/schema.prisma) ───────────────────────────────────

export const documentCategoryEnum = z.enum([
  "PRESCRIPTION",
  "REPORT",
  "CONTRACT",
  "ID_PROOF",
  "RECORDING",
  "OTHER",
]);

export const scanStatusEnum = z.enum(["PENDING", "CLEAN", "INFECTED"]);

export const accessLevelEnum = z.enum([
  "CONSULTANT_ONLY",
  "SHARED_WITH_CLIENT",
]);

// ── Create schema ─────────────────────────────────────────────────────────
// Used when creating a Document record after a successful upload.

export const createDocumentSchema = z.object({
  caseId: z.string().uuid("Invalid case ID"),
  clientId: z.string().uuid("Invalid client ID"),
  interactionId: z.string().uuid("Invalid interaction ID").optional().nullable(),
  taskId: z.string().uuid("Invalid task ID").optional().nullable(),

  // Who uploaded it
  uploadedByRole: z.enum(["CONSULTANT", "CLIENT"]),
  uploadedById: z.string().uuid("Invalid uploader ID"),

  // File metadata (from upload result)
  fileUrl: z.string().url("Invalid file URL"),
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name must be at most 255 characters")
    .trim(),
  fileType: z.string().min(1, "File type is required"),
  fileSizeBytes: z
    .number()
    .int()
    .positive("File size must be positive")
    .max(10 * 1024 * 1024, "File must be 10 MB or less"),

  category: documentCategoryEnum.default("OTHER"),
  accessLevel: accessLevelEnum.default("CONSULTANT_ONLY"),
});

// ── Update schema ─────────────────────────────────────────────────────────

export const updateDocumentSchema = z.object({
  fileName: z.string().min(1).max(255).trim().optional(),
  category: documentCategoryEnum.optional(),
  accessLevel: accessLevelEnum.optional(),
});

// ── Client-side file validation helper ───────────────────────────────────

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Must be a File object" })
    .refine((f) => f.size > 0, { message: "File must not be empty" })
    .refine((f) => f.size <= MAX_FILE_BYTES, { message: "File must be 10 MB or less" })
    .refine(
      (f) =>
        ALLOWED_FILE_TYPES.includes(f.type as (typeof ALLOWED_FILE_TYPES)[number]),
      { message: "Unsupported file type" }
    ),
});

// ── Inferred types ────────────────────────────────────────────────────────

export type AllowedFileType = z.infer<typeof allowedFileTypeEnum>;
export type DocumentCategory = z.infer<typeof documentCategoryEnum>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
