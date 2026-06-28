"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { checkPasswordStrength, type PasswordStrengthResult } from "@/lib/passwordStrength";
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
  User,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Tag,
  Clock,
  Video,
  FileText,
  FilePlus2,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  X,
} from "lucide-react";
import Link from "next/link";

// ── Enum values ────────────────────────────────────────────────────────────
const CLIENT_TYPES = [
  { value: "strategy_consulting",        label: "Strategy Consulting" },
  { value: "operations_consulting",      label: "Operations Consulting" },
  { value: "it_consulting",              label: "IT Consulting" },
  { value: "marketing_consulting",       label: "Marketing Consulting" },
  { value: "human_resources_consulting", label: "HR Consulting" },
  { value: "other",                      label: "Other" },
];

const MEETING_MODES = [
  { value: "office_meet", label: "🏢  Office Meeting" },
  { value: "online_meet", label: "💻  Online Meeting" },
  { value: "other",       label: "📍  Other" },
];

// ── Shared field styles ────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 hover:border-slate-300";

const selectCls =
  "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100 cursor-pointer";

// ── File helpers ──────────────────────────────────────────────────────────
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED       = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

function formatBytes(b: number) {
  if (b < 1024)        return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Field wrapper ──────────────────────────────────────────────────────────
function Field({
  label, icon: Icon, children, required, span2, span1,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  required?: boolean;
  span2?: boolean;
  span1?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${span2 ? "sm:col-span-2" : span1 ? "sm:col-span-1" : ""}`}>
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {Icon && <Icon className="size-3.5 text-indigo-400" aria-hidden />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── File Drop Zone ────────────────────────────────────────────────────────
function MultiFileDropZone({
  files, onAdd, onRemove,
}: {
  files: File[];
  onAdd: (f: File[]) => void;
  onRemove: (i: number) => void;
}) {
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSizeError(null);
    const picked    = Array.from(e.target.files ?? []);
    const oversized = picked.filter((f) => f.size > MAX_FILE_BYTES);
    if (oversized.length > 0) {
      setSizeError(
        `${oversized.map((f) => f.name).join(", ")} exceed${oversized.length === 1 ? "s" : ""} the 10 MB limit and were skipped.`
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
        className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 transition-all hover:border-indigo-300 hover:bg-indigo-50/50"
      >
        <div className="grid size-10 place-items-center rounded-xl bg-white shadow-sm shadow-slate-200 transition-transform group-hover:scale-110">
          <FilePlus2 className="size-5 text-indigo-500" />
        </div>
        <div className="text-center">
          <p className="font-medium text-slate-700">Click to add documents</p>
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
        <p className="flex items-start gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-100">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {sizeError}
        </p>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs"
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
                className="grid size-5 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-100 hover:text-red-500"
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

// ── Section card header accent ────────────────────────────────────────────
function SectionCardHeader({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 [--card-spacing:0]">
      <div className="flex items-center gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm font-bold text-white">
          {step}
        </div>
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-white/10 text-white">
            <Icon className="size-4" />
          </span>
          <div>
            <CardTitle className="font-semibold text-white leading-tight">{title}</CardTitle>
            <CardDescription className="text-xs text-indigo-200">{description}</CardDescription>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ClientOnboardingPage() {
  const [client, setClient] = useState({
    name: "", email: "", password: "", phone: "",
    dob: "", address: "", companyName: "", type: "", tags: "",
  });

  const [appt, setAppt] = useState({
    appointmentDate: "", appointmentTime: "",
    meetingMode: "office_meet", purpose: "",
  });

  const [submitting,       setSubmitting]       = useState(false);
  const [apiError,         setApiError]         = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  const [successId,        setSuccessId]        = useState<string | null>(null);
  const [docFiles,         setDocFiles]         = useState<File[]>([]);
  const router = useRouter();

  function addDocFiles(newFiles: File[]) {
    setDocFiles((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}`));
      return [...prev, ...newFiles.filter((f) => !seen.has(`${f.name}-${f.size}`))];
    });
  }

  function removeDocFile(index: number) {
    setDocFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleClientChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
    if (name === "password") setPasswordStrength(checkPasswordStrength(value));
  }

  function handleApptChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setAppt((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    setSuccessId(null);
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(client).forEach(([k, v]) => fd.append(k, v));
      Object.entries(appt).forEach(([k, v]) => fd.append(k, v));
      docFiles.forEach((f) => fd.append("doc", f));

      const res  = await fetch("/api/client/appointment", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setApiError(json.message ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccessId(json.data.client.id);
      setTimeout(() => router.push("/tenant/client"), 2000);
    } catch {
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Password strength colours
  const strengthColour =
    !passwordStrength ? "bg-slate-200"
    : passwordStrength.strength === "weak"   ? "bg-red-500"
    : passwordStrength.strength === "good"   ? "bg-amber-400"
    : "bg-emerald-500";

  const strengthLabel =
    !passwordStrength ? ""
    : passwordStrength.strength === "weak"   ? "Weak"
    : passwordStrength.strength === "good"   ? "Good"
    : "Strong";

  const strengthTextCls =
    !passwordStrength ? ""
    : passwordStrength.strength === "weak"   ? "text-red-500"
    : passwordStrength.strength === "good"   ? "text-amber-500"
    : "text-emerald-600";

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="mx-auto max-w-6xl px-4 pt-10 lg:px-8 mb-5 mt-2">

        <div className="absolute inset-x-0 top-3 flex justify-center">
          <Link href="/" aria-label="home">
            <span className="select-none inline-block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              Ayushman.
            </span>
          </Link>
        </div>

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between mt-4">
          <div>

            <h1 className="text-2xl font-bold text-slate-800">
              Register &amp; Book Appointment
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Complete the form below to onboard yourself onto our platform.
            </p>
          </div>
          <a
            href="/client/login"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 shadow-sm transition-all hover:bg-indigo-50 hover:shadow-md sm:mt-0"
          >
            Existing client? Sign in
            <ArrowRight className="size-3.5" />
          </a>
        </div>

        {/* ── Banners ──────────────────────────────────────────────────── */}
        {apiError && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
            <span>{apiError}</span>
          </div>
        )}
        {successId && (
          <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>Client created successfully! Redirecting to dashboard…</span>
          </div>
        )}

        {/* ── Two-column layout ─────────────────────────────────────────── */}
        <div className="flex gap-8 lg:items-start">

          {/* Sticky sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <Card className="sticky top-8">
              <CardContent className="p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">Steps</p>
                <ol className="flex flex-col gap-3">
                  {[
                    { n: 1, label: "Sign Up",   icon: User },
                    { n: 2, label: "Choose Consultant",   icon: User },
                    { n: 3, label: "Book an Appointment",       icon: CalendarDays },
                  ].map(({ n, label, icon: Icon }) => (
                    <li key={n} className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm">
                        {n}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <Icon className="size-3.5 text-indigo-400" />
                        {label}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white">
                  <p className="text-xs font-semibold">Need help?</p>
                  <p className="mt-1 text-xs text-indigo-200 leading-relaxed">
                    All fields marked <span className="text-red-300">*</span> are required. Attach relevant documents for a faster session.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 space-y-6" noValidate>

            {/* ── Card 1: Client Details ─────────────────────────────── */}
            <Card>
              <SectionCardHeader
                step={1}
                icon={User}
                title="Client Details"
                description="Personal & contact information"
              />
              <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Field label="Name" icon={User} required>
                  <input
                    id="client-name"
                    type="text"
                    name="name"
                    value={client.name}
                    onChange={handleClientChange}
                    placeholder="Full Name"
                    required
                    className={inputCls}
                  />
                </Field>

                <Field label="Date of Birth" icon={CalendarDays} required>
                  <input
                    id="client-dob"
                    type="date"
                    name="dob"
                    value={client.dob}
                    onChange={handleClientChange}
                    required
                    className={inputCls}
                  />
                </Field>

                <Field label="Email" icon={Mail} required>
                  <input
                    id="client-email"
                    type="email"
                    name="email"
                    value={client.email}
                    onChange={handleClientChange}
                    placeholder="jane@example.com"
                    required
                    className={inputCls}
                  />
                </Field>

                <Field label="Contact Number" icon={Phone} required>
                  <input
                    id="client-phone"
                    type="tel"
                    name="phone"
                    value={client.phone}
                    onChange={handleClientChange}
                    placeholder="+91 98765 43210"
                    required
                    className={inputCls}
                  />
                </Field>

                <Field label="Company / Organisation" icon={Briefcase}>
                  <input
                    id="client-company"
                    type="text"
                    name="companyName"
                    value={client.companyName}
                    onChange={handleClientChange}
                    placeholder="Acme Corp (optional)"
                    className={inputCls}
                  />
                </Field>
                <Field label="Office / Home Address" icon={MapPin} required span2>
                  <input
                    id="client-address"
                    type="text"
                    name="address"
                    value={client.address}
                    onChange={handleClientChange}
                    placeholder="123 Main St, City"
                    required
                    className={inputCls}
                  />
                </Field>

                {/* Password */}
                <Field label="Password" icon={Lock} required span2>
                  <input
                    id="client-password"
                    type="password"
                    name="password"
                    value={client.password}
                    onChange={handleClientChange}
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
                    className={inputCls}
                  />
                  {/* Strength meter */}
                  {client.password && passwordStrength && (
                    <div className="mt-1 space-y-1.5">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              i < passwordStrength.score ? strengthColour : "bg-slate-100"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${strengthTextCls}`}>
                        Password strength: {strengthLabel}
                      </p>
                    </div>
                  )}
                </Field>
              </CardContent>
              <CardFooter className="justify-between border-t border-slate-100 px-6 py-4 [.border-t]:pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
                >
                  ← Cancel
                </button>

                <Button
                  type="submit"
                  disabled={submitting || !!successId}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a8 8 0 11-8 8z" />
                      </svg>
                      Saving…
                    </>
                  ) : (
                    <>
                     SignUp 
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* ── Card 2: Appointment ───────────────────────────────── */}
            <Card>
              <SectionCardHeader
                step={2}
                icon={CalendarDays}
                title="Create Appointment"
                description="Schedule the client's first session"
              />
              <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-2 pt-4">
                <Field label="Appointment Date" icon={CalendarDays} required>
                  <input
                    id="appt-date"
                    type="date"
                    name="appointmentDate"
                    value={appt.appointmentDate}
                    onChange={handleApptChange}
                    required
                    className={inputCls}
                  />
                </Field>

                <Field label="Appointment Time" icon={Clock} required>
                  <input
                    id="appt-time"
                    type="time"
                    name="appointmentTime"
                    value={appt.appointmentTime}
                    onChange={handleApptChange}
                    required
                    className={inputCls}
                  />
                </Field>

                <Field label="Meeting Mode" icon={Video} required span1>
                  <div className="grid grid-cols-3 gap-2">
                    {MEETING_MODES.map((m) => (
                      <label
                        key={m.value}
                        className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-xs font-medium transition-all ${
                          appt.meetingMode === m.value
                            ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="meetingMode"
                          value={m.value}
                          checked={appt.meetingMode === m.value}
                          onChange={handleApptChange}
                          className="sr-only"
                        />
                        {m.label}
                      </label>
                    ))}
                  </div>
                </Field>

                <Field label="Purpose / Notes" icon={FileText} span1>
                  <textarea
                    id="appt-purpose"
                    name="purpose"
                    value={appt.purpose}
                    onChange={handleApptChange}
                    rows={3}
                    placeholder="Brief description of the appointment goal…"
                    className={`${inputCls} resize-none`}
                  />
                </Field>

                <Field label="Supporting Documents" icon={FilePlus2} span2>
                  <MultiFileDropZone
                    files={docFiles}
                    onAdd={addDocFiles}
                    onRemove={removeDocFile}
                  />
                </Field>
              </CardContent>
            </Card>

          </form>
        </div>
      </div>
    </div>
  );
}
