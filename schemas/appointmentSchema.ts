import { z } from "zod";

// ── Enums (mirror prisma/schema.prisma) ───────────────────────────────────

export const meetingModeEnum = z.enum([
  "office_meet",
  "online_meet",
  "other",
]);

export const appointmentStatusEnum = z.enum([
  "pending_for_approval",
  "scheduled",
  "rescheduled",
  "missed",
]);

// ── Create schema ─────────────────────────────────────────────────────────
export const createAppointmentSchema = z
  .object({
    appointmentDate: z.coerce.date({
      error: "Invalid appointment date",
    }),

  appointmentTime: z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid appointment time"), 

    meetingMode: meetingModeEnum.default("office_meet"),

    purpose: z.string().trim().max(1000).optional().nullable(),
  })
.superRefine((data, ctx) => {
  const appointment = new Date(data.appointmentDate);

  const [hours, minutes] = data.appointmentTime
    .split(":")
    .map(Number);

  appointment.setHours(hours, minutes, 0, 0);

  if (appointment.getTime() <= Date.now()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["appointmentDate"],
      message: "Appointment must be in the future",
    });
  }
});

// ── Update schema ─────────────────────────────────────────────────────────

export const updateAppointmentSchema = createAppointmentSchema

// ── Inferred types ────────────────────────────────────────────────────────

export type MeetingMode             = z.infer<typeof meetingModeEnum>;
export type AppointmentStatus       = z.infer<typeof appointmentStatusEnum>;
export type CreateAppointmentInput  = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput  = z.infer<typeof updateAppointmentSchema>;
