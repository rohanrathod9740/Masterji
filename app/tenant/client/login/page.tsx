"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  const [formData, setFormData] = useState({
    clientEmail: "",
    clientPhone: "",
    clientPassword: "",
  });

  // Auto-advance slides
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
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);

    const payload: Record<string, string> = {
      clientPassword: formData.clientPassword,
    };

    if (loginMethod === "email") {
      payload.clientEmail = formData.clientEmail;
    } else {
      payload.clientPhone = formData.clientPhone;
    }

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

      // Cookie is set by the API — navigate to dashboard
      router.push("/tenant/client/dashboard");
    } catch {
      setApiError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

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

          {/* Slide indicators */}
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
            <span className="bg-linear-to-r select-none font-bold text-4xl from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ayushman.
            </span>

            <h2 className="mt-2 mb-1 text-xl font-bold">Client Login</h2>
            <p className="mb-6 text-gray-600 text-sm">
              Welcome back! Sign in to view your appointments and documents.
            </p>

            <Card className="p-6">
              {/* Error banner */}
              {apiError && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {apiError}
                </div>
              )}

              {/* Login method toggle */}
              <div className="mb-5 flex rounded-md overflow-hidden border border-gray-300">
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
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
                  onClick={() => setLoginMethod("phone")}
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
                {/* Email or Phone */}
                {loginMethod === "email" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="client-email"
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      placeholder="jane@example.com"
                      required
                      autoComplete="email"
                      className={inputCls}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="client-phone"
                      type="tel"
                      name="clientPhone"
                      value={formData.clientPhone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      required
                      autoComplete="tel"
                      className={inputCls}
                    />
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="client-password"
                    type="password"
                    name="clientPassword"
                    value={formData.clientPassword}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className={inputCls}
                  />
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
                href="/tenant/client/create/appointment"
                className="font-bold hover:underline text-indigo-600"
              >
                Book your first appointment
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
