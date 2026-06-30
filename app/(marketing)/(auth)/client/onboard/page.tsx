"use client";

import React, { useState, useEffect } from "react";
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
  User as UserIcon,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldAlert,
  Globe,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// ── Styling constants ──────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 hover:border-slate-300";

const selectCls =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer";

// ── Helper component: Form Field Wrapper ───────────────────────────────────
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

// ── Onboarding Page ─────────────────────────────────────────────────────────
export default function ClientOnboardingPage() {
  const router = useRouter();

  // ── States ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [client, setClient] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    timezone: "Asia/Kolkata",
    preferredLanguage: "English",
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthResult | null>(null);
  
  // Minor logic states
  const [isMinor, setIsMinor] = useState(false);
  const [guardian, setGuardian] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [guardianConsent, setGuardianConsent] = useState(false);

  // ── Calculate Minor Status ───────────────────────────────────────────────
  useEffect(() => {
    if (!client.dob) {
      setIsMinor(false);
      return;
    }
    const today = new Date();
    const birthDate = new Date(client.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    setIsMinor(age < 18);
  }, [client.dob]);

  // ── Change Handlers ──────────────────────────────────────────────────────
  function handleClientChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setClient((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  }

  function handleGuardianChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setGuardian((prev) => ({ ...prev, [name]: value }));
  }

  // ── Form Validation & Submission ──────────────────────────────────────────
  function validateForm() {
    if (!client.name || !client.email || !client.phone || !client.password || !client.dob || !client.gender) {
      alert("Please fill in all required fields.");
      return false;
    }
    if (isMinor) {
      if (!guardian.name || !guardian.phone || !guardian.email) {
        alert("Parent/Guardian details are required for minor accounts.");
        return false;
      }
      if (!guardianConsent) {
        alert("Guardian consent must be checked.");
        return false;
      }
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const payload = {
        fullName: client.name.trim(),
        email: client.email.trim(),
        phone: client.phone.trim(),
        password: client.password,
        dob: client.dob ? new Date(client.dob).toISOString() : undefined,
        gender: client.gender,
        preferredLanguage: client.preferredLanguage || undefined,
        address: client.address.trim() || undefined,
        city: client.city.trim() || undefined,
        state: client.state.trim() || undefined,
        country: client.country.trim() || undefined,
        timezone: client.timezone,
        isMinor: isMinor,
        ...(isMinor && {
          guardianName: guardian.name.trim(),
          guardianPhone: guardian.phone.trim(),
          guardianEmail: guardian.email.trim(),
        }),
      };

      const res = await fetch("/api/client/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setApiError(json.message ?? "Registration failed. Please try again.");
        return;
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push("/tenant/client");
      }, 2500);
    } catch (err) {
      console.error(err);
      setApiError("Network error. Please check your internet connection.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Password strength styling helpers ──────────────────────────────────────
  const strengthColour =
    !passwordStrength ? "bg-slate-200"
    : passwordStrength.strength === "weak" ? "bg-rose-500"
    : passwordStrength.strength === "good" ? "bg-amber-400"
    : "bg-emerald-500";

  const strengthLabel =
    !passwordStrength ? ""
    : passwordStrength.strength === "weak" ? "Weak"
    : passwordStrength.strength === "good" ? "Good"
    : "Strong";

  const strengthTextCls =
    !passwordStrength ? ""
    : passwordStrength.strength === "weak" ? "text-rose-500"
    : passwordStrength.strength === "good" ? "text-amber-500"
    : "text-emerald-600";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background decoration */}
      <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-indigo-50/70 via-slate-50/50 to-transparent" />

      <div className="mx-auto max-w-3xl px-4 pt-12 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" aria-label="home" className="group">
            <span className="select-none inline-block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent transition-all duration-300 group-hover:scale-105">
              Ayushman.
            </span>
          </Link>
        </div>

        {/* Title bar */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Create Client Account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign up today to discover experts, schedule sessions, and track advice seamlessly.
            </p>
          </div>
          <Link
            href="/client/login"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600"
          >
            Existing client? Sign in
            <ArrowRight className="size-4 text-indigo-500" />
          </Link>
        </div>

        {/* Banners */}
        {apiError && (
          <div role="alert" className="mb-8 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-500" />
            <span>{apiError}</span>
          </div>
        )}
        {success && (
          <div role="status" className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 shadow-sm">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <div>
              <p className="font-semibold text-emerald-800">Account registered successfully!</p>
              <p className="mt-0.5 text-xs text-emerald-600">Redirecting to your dashboard... Please wait.</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-violet-50/30 border-b border-slate-100 py-5">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">✓</span>
                Onboarding Details
              </CardTitle>
              <CardDescription>Fill out the profile details below to complete registration</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
              
              <FormField label="Full Name" icon={UserIcon} required>
                <input
                  type="text"
                  name="name"
                  value={client.name}
                  onChange={handleClientChange}
                  placeholder="E.g., Jane Doe"
                  required
                  className={inputCls}
                />
              </FormField>

              <FormField label="Date of Birth" icon={CalendarDays} required>
                <input
                  type="date"
                  name="dob"
                  value={client.dob}
                  onChange={handleClientChange}
                  required
                  className={inputCls}
                />
              </FormField>

              <FormField label="Gender" icon={UserIcon} required>
                <select
                  name="gender"
                  value={client.gender}
                  onChange={handleClientChange}
                  required
                  className={selectCls}
                >
                  <option value="" disabled>Select gender...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>

              <FormField label="Preferred Language" icon={Globe}>
                <input
                  type="text"
                  name="preferredLanguage"
                  value={client.preferredLanguage}
                  onChange={handleClientChange}
                  placeholder="E.g., English, Hindi, Spanish"
                  className={inputCls}
                />
              </FormField>

              <FormField label="Email Address" icon={Mail} required>
                <input
                  type="email"
                  name="email"
                  value={client.email}
                  onChange={handleClientChange}
                  placeholder="jane@example.com"
                  required
                  className={inputCls}
                />
              </FormField>

              <FormField label="Contact Number" icon={Phone} required>
                <input
                  type="tel"
                  name="phone"
                  value={client.phone}
                  onChange={handleClientChange}
                  placeholder="E.g., +91 98765 43210"
                  required
                  className={inputCls}
                />
              </FormField>

              {/* Password */}
              <FormField label="Account Password" icon={Lock} required span2>
                <input
                  type="password"
                  name="password"
                  value={client.password}
                  onChange={handleClientChange}
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
                  className={inputCls}
                />
                {client.password && passwordStrength && (
                  <div className="mt-1.5 space-y-1">
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
                    <p className={`text-xs font-semibold ${strengthTextCls}`}>
                      Password: {strengthLabel}
                    </p>
                  </div>
                )}
              </FormField>

              {/* Minor parent/guardian details */}
              {isMinor && (
                <div className="col-span-1 sm:col-span-2 border border-amber-200 bg-amber-50/50 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="size-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-800">Parent / Guardian Consent Required</h4>
                      <p className="text-xs text-amber-700 mt-0.5">Since you are under 18, please provide guardian information and check the consent box below.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField label="Guardian Full Name" required>
                      <input
                        type="text"
                        name="name"
                        value={guardian.name}
                        onChange={handleGuardianChange}
                        placeholder="Parent Name"
                        required
                        className={inputCls}
                      />
                    </FormField>
                    <FormField label="Guardian Contact" required>
                      <input
                        type="tel"
                        name="phone"
                        value={guardian.phone}
                        onChange={handleGuardianChange}
                        placeholder="Guardian Phone"
                        required
                        className={inputCls}
                      />
                    </FormField>
                    <FormField label="Guardian Email" required>
                      <input
                        type="email"
                        name="email"
                        value={guardian.email}
                        onChange={handleGuardianChange}
                        placeholder="guardian@example.com"
                        required
                        className={inputCls}
                      />
                    </FormField>
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none border-t border-amber-100 pt-3">
                    <input
                      type="checkbox"
                      checked={guardianConsent}
                      onChange={(e) => setGuardianConsent(e.target.checked)}
                      className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 size-4 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-amber-800">
                      I confirm that my parent or guardian consents to my registration and timeline access on this platform.
                    </span>
                  </label>
                </div>
              )}

              {/* Location details */}
              <div className="col-span-1 sm:col-span-2 border-t border-slate-100 pt-4 mt-2">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Location Details</h3>
              </div>

              <FormField label="Office / Home Address" icon={MapPin} span2>
                <input
                  type="text"
                  name="address"
                  value={client.address}
                  onChange={handleClientChange}
                  placeholder="Street Address, Area"
                  className={inputCls}
                />
              </FormField>

              <FormField label="City" icon={MapPin}>
                <input
                  type="text"
                  name="city"
                  value={client.city}
                  onChange={handleClientChange}
                  placeholder="City"
                  className={inputCls}
                />
              </FormField>

              <FormField label="State" icon={MapPin}>
                <input
                  type="text"
                  name="state"
                  value={client.state}
                  onChange={handleClientChange}
                  placeholder="State"
                  className={inputCls}
                />
              </FormField>

              <FormField label="Country" icon={MapPin}>
                <input
                  type="text"
                  name="country"
                  value={client.country}
                  onChange={handleClientChange}
                  placeholder="Country"
                  className={inputCls}
                />
              </FormField>

              <FormField label="Timezone" icon={Clock}>
                <select
                  name="timezone"
                  value={client.timezone}
                  onChange={handleClientChange}
                  className={selectCls}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                </select>
              </FormField>

            </CardContent>
            <CardFooter className="justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={submitting || success}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-150 transition-all hover:opacity-90 hover:shadow-lg disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    Register Account
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>

      </div>
    </div>
  );
}
