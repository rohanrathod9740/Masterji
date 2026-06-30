import { z } from "zod";

// ── Enums (mirror prisma/schema.prisma) ───────────────────────────────────

export const meetingModeEnum = z.enum([
  "IN_PERSON",
  "ZOOM",
  "GOOGLE_MEET",
  "OTHER_VIDEO",
  "AUDIO_ONLY",
]);

export const appointmentStatusEnum = z.enum([
  "REQUESTED",
  "APPROVED",
  "RESCHEDULE_PROPOSED",
  "RESCHEDULED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW",
]);

export const rescheduleProposedByEnum = z.enum(["CONSULTANT", "CLIENT"]);

// ── Create schema ─────────────────────────────────────────────────────────

export const createAppointmentSchema = z
  .object({
    caseId: z.string().uuid("Invalid case ID"),
    consultantId: z.string().uuid("Invalid consultant ID"),

    scheduledStart: z.coerce.date({ error: "Invalid start date/time" }),
    scheduledEnd: z.coerce.date({ error: "Invalid end date/time" }),

    mode: meetingModeEnum.default("IN_PERSON"),
    meetingLink: z.string().url("Invalid meeting link URL").optional(),

    purpose: z.string().trim().max(1000).optional(),

    feeAmount: z.number().min(0, "Fee must be 0 or greater"),
    currency: z.string().default("INR"),

    consentGiven: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.scheduledEnd <= data.scheduledStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledEnd"],
        message: "End time must be after start time",
      });
    }
    if (data.scheduledStart.getTime() <= Date.now()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledStart"],
        message: "Appointment must be in the future",
      });
    }
  });

// ── Update schema ─────────────────────────────────────────────────────────

export const updateAppointmentSchema = z.object({
  scheduledStart: z.coerce.date({ error: "Invalid start date/time" }).optional(),
  scheduledEnd: z.coerce.date({ error: "Invalid end date/time" }).optional(),
  mode: meetingModeEnum.optional(),
  meetingLink: z.string().url("Invalid meeting link URL").optional().nullable(),
  purpose: z.string().trim().max(1000).optional().nullable(),
  status: appointmentStatusEnum.optional(),
  rejectionReason: z.string().trim().optional().nullable(),
  cancellationReason: z.string().trim().optional().nullable(),
  rescheduleProposedBy: rescheduleProposedByEnum.optional(),
  rescheduleProposedStart: z.coerce.date().optional(),
  rescheduleProposedEnd: z.coerce.date().optional(),
  rescheduleReason: z.string().trim().optional().nullable(),
  consentGiven: z.boolean().optional(),
});

// ── Inferred types ────────────────────────────────────────────────────────

export type MeetingMode = z.infer<typeof meetingModeEnum>;
export type AppointmentStatus = z.infer<typeof appointmentStatusEnum>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
