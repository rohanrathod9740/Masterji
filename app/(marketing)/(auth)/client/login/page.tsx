"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const slides = [
  {
    title: "Healthcare Professionals",
    subtitle: "Access your appointments and documents with ease.",
    image: "/assets/doctor.jpeg",
  },
  {
    title: "Legal Experts",
    subtitle: "Stay on top of your case updates and consultations.",
    image: "/assets/law.jpeg",
  },
  {
    title: "IT Consultants",
    subtitle: "Manage your engagements and track deliverables.",
    image: "/assets/it.jpeg",
  },
];

type LoginMethod = "email" | "phone";

export default function ClientLoginPage() {
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentSlide((p) => (p + 1) % slides.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setApiError(null);
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);
    setFieldErrors({});

    if (!formData.password.trim()) {
      setFieldErrors({ password: "Password is required" });
      return;
    }

    if (loginMethod === "email" && !formData.email.trim()) {
      setFieldErrors({ email: "Email is required" });
      return;
    }

    if (loginMethod === "phone" && !formData.phone.trim()) {
      setFieldErrors({ phone: "Phone is required" });
      return;
    }

    setIsLoading(true);

    // Build payload matching loginClientSchema keys exactly.
    // Only send the field for the active method — the other key is
    // omitted (not just empty) so `.refine` validates correctly and
    // the unused field's regex/email check is never triggered.
    const payload: Record<string, string> =
      loginMethod === "email"
        ? { email: formData.email.trim().toLowerCase(), password: formData.password }
        : { phone: formData.phone.trim(), password: formData.password };

    try {
      const res = await fetch("/api/client/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setApiError(json.message ?? "Login failed. Please try again.");
        return;
      }

      router.push("/tenant/client");
    } catch {
      setApiError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800 text-sm";

  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[30%_60%]">
        {/* ── Left: Image carousel ─────────────────────────────────────── */}
        <div className="relative hidden lg:block overflow-hidden">
          {slides.map((item, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                priority={index === 0}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/80 via-indigo-900/50 to-transparent" />
              <div className="absolute bottom-16 left-12 max-w-lg text-white">
                <h2 className="mb-4 text-3xl font-bold">{item.title}</h2>
                <p className="text-lg text-gray-200">{item.subtitle}</p>
              </div>
            </div>
          ))}

          <div className="absolute bottom-8 left-12 z-10 flex gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-3 rounded-full transition-all ${
                  currentSlide === idx ? "w-8 bg-white" : "w-3 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Right: Login form ─────────────────────────────────────────── */}
        <div className="flex items-center justify-center bg-white p-6">
          <div className="w-full max-w-md">
            <Link
            href="/"
            aria-label="home">
            <span className="bg-linear-to-r select-none font-bold text-4xl from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ayushman.
            </span>
            </Link>

            <h2 className="mt-2 mb-1 text-xl font-bold">Client Login</h2>
            <p className="mb-6 text-gray-600 text-sm">
              Welcome back! Sign in to view your appointments and documents.
            </p>

            <Card className="p-6">
              {apiError && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {apiError}
                </div>
              )}

              <div className="mb-5 flex rounded-md overflow-hidden border border-gray-300">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("email");
                    setFieldErrors({});
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    loginMethod === "email"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("phone");
                    setFieldErrors({});
                  }}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    loginMethod === "phone"
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Phone
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {loginMethod === "email" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="client-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      required
                      autoComplete="email"
                      className={inputCls}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="client-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                      autoComplete="tel"
                      className={inputCls}
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="client-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className={inputCls}
                  />
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  id="client-login-submit"
                  disabled={isLoading}
                  className="w-full font-medium py-2 px-4 rounded-md transition"
                >
                  {isLoading ? "Signing in…" : "Sign In"}
                </Button>
              </form>
            </Card>

            <p className="mt-4 text-center text-sm text-gray-600">
              New here?{" "}
              <a
                href="/client/onboard"
                className="font-bold hover:underline text-indigo-600"
              >
                New Client? Register Here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}