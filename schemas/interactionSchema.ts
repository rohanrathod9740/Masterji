import { z } from "zod";

// ── Enums (mirror prisma/schema.prisma) ───────────────────────────────────

export const interactionTypeEnum = z.enum([
  "RECORDED_AUDIO",
  "NOTE",
  "FOLLOW_UP_CALL",
  "MESSAGE",
  "VIDEO_SESSION",
]);

export const transcriptStatusEnum = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "LOW_CONFIDENCE",
]);

export const visibilityEnum = z.enum([
  "CONSULTANT_ONLY",
  "SHARED_WITH_CLIENT",
]);

// ── Create schema ─────────────────────────────────────────────────────────

export const createInteractionSchema = z.object({
  caseId: z.string().uuid("Invalid case ID"),
  consultantId: z.string().uuid("Invalid consultant ID"),
  clientId: z.string().uuid("Invalid client ID"),
  appointmentId: z.string().uuid("Invalid appointment ID").optional(),

  type: interactionTypeEnum,

  occurredAt: z.string().datetime().optional(),
  durationSecs: z.number().int().min(0).optional(),

  rawAudioUrl: z.string().url("Invalid audio URL").optional(),
  transcriptText: z.string().max(50000).trim().optional(),
  transcriptLang: z.string().trim().optional(),

  notesText: z.string().max(10000).trim().optional(),

  visibility: visibilityEnum.default("CONSULTANT_ONLY"),
  consentGiven: z.boolean().default(false),
});

// ── Update schema ─────────────────────────────────────────────────────────

export const updateInteractionSchema = z.object({
  notesText: z.string().max(10000).trim().optional().nullable(),
  transcriptText: z.string().max(50000).trim().optional().nullable(),
  transcriptStatus: transcriptStatusEnum.optional(),
  transcriptLang: z.string().trim().optional().nullable(),
  visibility: visibilityEnum.optional(),
  durationSecs: z.number().int().min(0).optional(),
});

// ── List / filter schema ──────────────────────────────────────────────────

export const listInteractionSchema = z.object({
  consultantId: z.string().uuid().optional(),
  caseId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  type: interactionTypeEnum.optional(),
  skip: z.number().int().min(0).default(0).optional(),
  take: z.number().int().min(1).max(100).default(10).optional(),
});

// ── Inferred types ────────────────────────────────────────────────────────

export type InteractionType = z.infer<typeof interactionTypeEnum>;
export type TranscriptStatus = z.infer<typeof transcriptStatusEnum>;
export type Visibility = z.infer<typeof visibilityEnum>;
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
export type UpdateInteractionInput = z.infer<typeof updateInteractionSchema>;
export type ListInteractionInput = z.infer<typeof listInteractionSchema>;
