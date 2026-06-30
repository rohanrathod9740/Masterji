"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  CalendarDays,
  Clock,
  Video,
  FileText,
  FilePlus2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  X,
  Loader2,
  Tag,
  MapPin,
} from "lucide-react";
import Link from "next/link";

// ── Types & Constants ────────────────────────────────────────────────────────
interface ConsultantDetails {
  id: string;
  fullName: string;
  nameOfConsultancy: string | null;
  profilePhotoUrl: string | null;
  headline: string | null;
  designation: string | null;
  consultationFee: number;
  category: string;
}

const MEETING_MODES = [
  { value: "IN_PERSON",   label: "🏢 In-Person (Office)", description: "Visit the consultant's office" },
  { value: "ZOOM",        label: "💻 Zoom Video Call",    description: "Online link shared before session" },
  { value: "GOOGLE_MEET", label: "🌐 Google Meet",       description: "Standard web video meeting" },
  { value: "AUDIO_ONLY",  label: "📞 Audio Only Call",    description: "Standard phone/audio session" },
];

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 hover:border-slate-300";

const selectCls =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer";

// ── Dropzone Config ────────────────────────────────────────────────────────
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Form Field Wrapper ─────────────────────────────────────────────────────
function FormField({
  label,
  icon: Icon,
  children,
  required,
  span2,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  required?: boolean;
  span2?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${span2 ? "sm:col-span-2" : ""}`}>
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {Icon && <Icon className="size-3.5 text-indigo-500" aria-hidden />}
        {label}
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Multi-file Dropzone ────────────────────────────────────────────────────
function MultiFileDropZone({
  files,
  onAdd,
  onRemove,
}: {
  files: File[];
  onAdd: (f: File[]) => void;
  onRemove: (i: number) => void;
}) {
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSizeError(null);
    const picked = Array.from(e.target.files ?? []);
    const oversized = picked.filter((f) => f.size > MAX_FILE_BYTES);
    if (oversized.length > 0) {
      setSizeError(
        `${oversized.map((f) => f.name).join(", ")} exceed${oversized.length === 1 ? "s" : ""} the 10 MB limit and was skipped.`
      );
    }
    const valid = picked.filter((f) => f.size <= MAX_FILE_BYTES);
    if (valid.length > 0) onAdd(valid);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2.5">
      <label
        htmlFor="appt-doc"
        className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-sm text-slate-500 transition-all hover:border-indigo-300 hover:bg-indigo-50/30"
      >
        <div className="grid size-10 place-items-center rounded-xl bg-white shadow-sm shadow-slate-200 transition-transform group-hover:scale-105">
          <FilePlus2 className="size-5 text-indigo-500" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-slate-700">Click or drag files here to upload</p>
          <p className="mt-0.5 text-xs text-slate-400">PDF, DOCX, PNG, JPG — max 10 MB each</p>
        </div>
        <input
          ref={inputRef}
          id="appt-doc"
          type="file"
          accept={ACCEPTED}
          multiple
          className="sr-only"
          onChange={handleChange}
        />
      </label>

      {sizeError && (
        <p className="flex items-start gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600 border border-rose-100">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {sizeError}
        </p>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-xs"
            >
              <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-50">
                <FileText className="size-3.5 text-indigo-500" />
              </div>
              <span className="min-w-0 flex-1 truncate font-medium text-slate-700">{f.name}</span>
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-slate-400">{formatBytes(f.size)}</span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => onRemove(i)}
                className="grid size-5 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-100 hover:text-rose-500"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Component Props ────────────────────────────────────────────────────────
export interface AppointmentFormProps {
  consultantId: string;
  prefill?: {
    scheduledStart?: string;
  };
}

// ── Main Booking Form ───────────────────────────────────────────────────────
export default function AppointmentForm({ consultantId }: AppointmentFormProps) {
  const router = useRouter();

  // ── States ───────────────────────────────────────────────────────────────
  const [consultant, setConsultant] = useState<ConsultantDetails | null>(null);
  const [loadingConsultant, setLoadingConsultant] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Appointment states
  const [appt, setAppt] = useState({
    appointmentDate: "",
    appointmentTime: "",
    meetingMode: "IN_PERSON",
  });
  const [docFiles, setDocFiles] = useState<File[]>([]);

  // Category specific details (Dynamic FR4)
  const [medicalDetails, setMedicalDetails] = useState({ symptoms: "", medicalHistory: "" });
  const [legalDetails, setLegalDetails] = useState({ caseSummary: "" });
  const [itDetails, setItDetails] = useState({ techStack: "" });
  const [astrologyDetails, setAstrologyDetails] = useState({ birthTime: "", birthPlace: "", focusArea: "General" });
  const [generalDetails, setGeneralDetails] = useState({ notes: "" });

  // Fetch consultant profile details
  useEffect(() => {
    async function loadConsultant() {
      try {
        const res = await fetch(`/api/client/consultants/${consultantId}`);
        const json = await res.json();
        if (json.success && json.data) {
          setConsultant(json.data);
        } else {
          setApiError("Consultant not found.");
        }
      } catch (err) {
        console.error("Failed to load consultant details", err);
        setApiError("Failed to fetch consultant information.");
      } finally {
        setLoadingConsultant(false);
      }
    }
    loadConsultant();
  }, [consultantId]);

  // ── Change Handlers ──────────────────────────────────────────────────────
  function handleApptChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setAppt((prev) => ({ ...prev, [name]: value }));
  }

  // ── File Handlers ────────────────────────────────────────────────────────
  function addDocFiles(newFiles: File[]) {
    setDocFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}`));
      return [...prev, ...newFiles.filter((f) => !seen.has(`${f.name}-${f.size}`))];
    });
  }

  function removeDocFile(index: number) {
    setDocFiles((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Form Submission ──────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    setSuccess(false);

    if (!appt.appointmentDate || !appt.appointmentTime) {
      alert("Please choose a date and time for the appointment.");
      return;
    }

    if (!consultant) return;

    setSubmitting(true);

    try {
      const fd = new FormData();

      fd.append("consultantId", consultantId);

      // Construct scheduled start/end dates
      const scheduledStart = new Date(`${appt.appointmentDate}T${appt.appointmentTime}`);
      const scheduledEnd = new Date(scheduledStart.getTime() + 60 * 60 * 1000); // 60 min duration

      fd.append("scheduledStart", scheduledStart.toISOString());
      fd.append("scheduledEnd", scheduledEnd.toISOString());
      fd.append("mode", appt.meetingMode);

      // Formulate Category specific purpose (FR4)
      let purpose = "";
      const category = consultant.category;
      if (category === "MEDICAL" || category === "HOMEOPATHY" || category === "PHYSIOTHERAPY") {
        purpose = `[Symptoms]: ${medicalDetails.symptoms.trim()}\n[Medical History]: ${medicalDetails.medicalHistory.trim() || "None"}`;
      } else if (category === "LEGAL") {
        purpose = `[Case Summary]: ${legalDetails.caseSummary.trim()}`;
      } else if (category === "IT") {
        purpose = `[Tech Stack / Goals]: ${itDetails.techStack.trim()}`;
      } else if (category === "ASTROLOGY") {
        purpose = `[Birth Time]: ${astrologyDetails.birthTime}\n[Birth Place]: ${astrologyDetails.birthPlace.trim()}\n[Focus Area]: ${astrologyDetails.focusArea}`;
      } else {
        purpose = `[Consultation Notes]: ${generalDetails.notes.trim()}`;
      }
      fd.append("purpose", purpose);

      // Supporting Documents
      docFiles.forEach((file) => {
        fd.append("doc", file);
      });

      const res = await fetch("/api/client/appointment", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setApiError(json.message ?? "Failed to request appointment. Please check availability.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/tenant/client");
      }, 2500);
    } catch (err) {
      console.error(err);
      setApiError("Network error. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingConsultant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading consultant details...</p>
      </div>
    );
  }

  if (!consultant) {
    return (
      <div className="mx-auto max-w-lg text-center py-16 px-4">
        <AlertCircle className="size-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Consultant Not Found</h3>
        <p className="text-sm text-slate-500 mt-1">{apiError ?? "The requested consultant could not be retrieved."}</p>
        <Link href="/tenant/client" className="inline-block mt-5 text-sm font-bold text-indigo-600 hover:underline">
          &larr; Back to Consultants
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consultant Header confirmation summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Book Session</h2>
          <p className="text-sm text-slate-500">Schedule your consultation slot and submit history documents.</p>
        </div>
        <Link
          href="/tenant/client"
          className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-indigo-600 transition"
        >
          <ChevronLeft className="size-4" />
          Back to list
        </Link>
      </div>

      {/* Profile summary card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-indigo-100 bg-indigo-50/20 rounded-2xl p-5 gap-4">
        <div className="flex items-center gap-4">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
            {consultant.profilePhotoUrl ? (
              <img src={consultant.profilePhotoUrl} alt={consultant.fullName} className="object-cover size-full" />
            ) : (
              <div className="grid size-full place-items-center bg-indigo-50 text-lg font-bold text-indigo-700">
                {consultant.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">Selected Professional</span>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">{consultant.fullName}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{consultant.designation || "Expert Consultant"}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Consultation Fee</span>
          <h3 className="text-base font-extrabold text-slate-900">₹{consultant.consultationFee.toLocaleString("en-IN")}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Pay-on-booking / post-session</p>
        </div>
      </div>

      {/* Banners */}
      {apiError && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-500" />
          <span>{apiError}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-sm">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
          <div>
            <p className="font-semibold text-emerald-800">Session requested successfully!</p>
            <p className="mt-0.5 text-xs text-emerald-600 font-medium">Redirecting you to dashboard... Your consultant will review the request.</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-violet-50/30 border-b border-slate-100 py-4">
            <CardTitle className="text-lg font-bold text-slate-800">Booking Form</CardTitle>
            <CardDescription>Select appointment time and detail your requirements</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
            
            <FormField label="Preferred Date" icon={CalendarDays} required>
              <input
                type="date"
                name="appointmentDate"
                value={appt.appointmentDate}
                onChange={handleApptChange}
                required
                className={inputCls}
              />
            </FormField>

            <FormField label="Preferred Time" icon={Clock} required>
              <input
                type="time"
                name="appointmentTime"
                value={appt.appointmentTime}
                onChange={handleApptChange}
                required
                className={inputCls}
              />
            </FormField>

            <FormField label="Meeting Mode" icon={Video} required span2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {MEETING_MODES.map((m) => (
                  <label
                    key={m.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 ${
                      appt.meetingMode === m.value
                        ? "border-indigo-500 bg-indigo-50/30 shadow-sm ring-1 ring-indigo-500"
                        : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="meetingMode"
                      value={m.value}
                      checked={appt.meetingMode === m.value}
                      onChange={handleApptChange}
                      className="mt-1 border-slate-300 text-indigo-600 focus:ring-indigo-500 size-4 shrink-0"
                    />
                    <div className="-mt-0.5">
                      <span className="text-xs font-bold text-slate-800 block">{m.label}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">{m.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </FormField>

            {/* Category specific details (Dynamic FR4) */}
            <div className="col-span-1 sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Category-Specific Information</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">Provide the following information based on the consultant category to help brief the expert before your session.</p>
            </div>

            {(consultant.category === "MEDICAL" || consultant.category === "HOMEOPATHY" || consultant.category === "PHYSIOTHERAPY") && (
              <>
                <FormField label="Symptoms &amp; Current Complaints" icon={FileText} required span2>
                  <textarea
                    value={medicalDetails.symptoms}
                    onChange={(e) => setMedicalDetails((prev) => ({ ...prev, symptoms: e.target.value }))}
                    rows={3}
                    placeholder="Describe your current physical complaints, duration, severity, and any pain points..."
                    required
                    className={`${inputCls} resize-none`}
                  />
                </FormField>
                <FormField label="Medical History &amp; Medications" icon={FileText} span2>
                  <textarea
                    value={medicalDetails.medicalHistory}
                    onChange={(e) => setMedicalDetails((prev) => ({ ...prev, medicalHistory: e.target.value }))}
                    rows={2}
                    placeholder="Briefly state any chronic conditions, active medications, or allergies (optional)..."
                    className={`${inputCls} resize-none`}
                  />
                </FormField>
              </>
            )}

            {consultant.category === "LEGAL" && (
              <FormField label="Case Summary &amp; Legal Details" icon={FileText} required span2>
                <textarea
                  value={legalDetails.caseSummary}
                  onChange={(e) => setLegalDetails((prev) => ({ ...prev, caseSummary: e.target.value }))}
                  rows={4}
                  placeholder="Outline the details of the dispute or agreement, including names of involved parties, core dates, and specific legal questions you have..."
                  required
                  className={`${inputCls} resize-none`}
                />
              </FormField>
            )}

            {consultant.category === "IT" && (
              <FormField label="Project Scope &amp; Tech Stack" icon={FileText} required span2>
                <textarea
                  value={itDetails.techStack}
                  onChange={(e) => setItDetails((prev) => ({ ...prev, techStack: e.target.value }))}
                  rows={4}
                  placeholder="Detail your system goals, programming language, cloud platform (e.g. AWS), performance issues, or architectural assistance needed..."
                  required
                  className={`${inputCls} resize-none`}
                />
              </FormField>
            )}

            {consultant.category === "ASTROLOGY" && (
              <>
                <FormField label="Time of Birth" icon={Clock} required>
                  <input
                    type="time"
                    value={astrologyDetails.birthTime}
                    onChange={(e) => setAstrologyDetails((prev) => ({ ...prev, birthTime: e.target.value }))}
                    required
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Place of Birth" icon={MapPin} required>
                  <input
                    type="text"
                    value={astrologyDetails.birthPlace}
                    onChange={(e) => setAstrologyDetails((prev) => ({ ...prev, birthPlace: e.target.value }))}
                    placeholder="City, State, Country (e.g. Mumbai, Maharashtra, India)"
                    required
                    className={inputCls}
                  />
                </FormField>
                <FormField label="Consultation Topic Focus" icon={Tag} required span2>
                  <select
                    value={astrologyDetails.focusArea}
                    onChange={(e) => setAstrologyDetails((prev) => ({ ...prev, focusArea: e.target.value }))}
                    required
                    className={selectCls}
                  >
                    <option value="General">General Horoscope &amp; Future Insights</option>
                    <option value="Career & Business">Career, Business &amp; Finances</option>
                    <option value="Marriage & Kundli">Marriage, Love &amp; Kundli Matching</option>
                    <option value="Health & Remedies">Health, Transit Remedies &amp; Pujas</option>
                  </select>
                </FormField>
              </>
            )}

            {consultant.category === "OTHER" && (
              <FormField label="Brief Overview &amp; Session Goals" icon={FileText} required span2>
                <textarea
                  value={generalDetails.notes}
                  onChange={(e) => setGeneralDetails((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  placeholder="Outline your questions, relevant background details, and what outcomes you hope to achieve in this session..."
                  required
                  className={`${inputCls} resize-none`}
                />
              </FormField>
            )}

            {/* Document Upload Zone */}
            <div className="col-span-1 sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
              <FormField label="Attach Supporting Documents" icon={FilePlus2} span2>
                <MultiFileDropZone
                  files={docFiles}
                  onAdd={addDocFiles}
                  onRemove={removeDocFile}
                />
              </FormField>
            </div>

          </CardContent>
          <CardFooter className="justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
            <Button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || success}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-150 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Requesting Slot...
                </>
              ) : (
                <>
                  Book Consultation
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
