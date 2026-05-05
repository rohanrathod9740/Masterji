"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { SectionCard } from "@/components/ui/section-card";
import { getErrorMessage } from "@/lib/utils";
import { getSession, login } from "@/services/authService";

const inputClassName =
  "h-12 w-full rounded-2xl border border-stone-200 bg-[#fcfbf8] px-4 text-sm text-stone-900 outline-none transition focus:border-[#163c39] focus:ring-2 focus:ring-[#163c39]/10";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      const session = await getSession();

      if (!isMounted) {
        return;
      }

      if (session) {
        router.replace("/people");
        return;
      }

      setIsLoadingSession(false);
    }

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ identifier, password });
      const nextPath = searchParams.get("next");
      router.replace(nextPath && nextPath.startsWith("/") ? nextPath : "/people");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoadingSession) {
    return <LoadingState fullscreen label="Loading sign-in..." />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.06fr_0.94fr]">
        <section className="relative overflow-hidden rounded-[36px] bg-[#101917] px-7 py-8 text-[#f8f5ef] shadow-[0_28px_80px_-40px_rgba(16,25,23,0.72)] sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.2),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.16),transparent_34%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                Review people, update context, and keep interactions easy to revisit.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#cbd3cf]">
                The interface is tuned for day-to-day use: fast access to people,
                clean timelines, and backend-backed authentication that stays simple.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                  Access
                </p>
                <p className="mt-2 text-lg font-semibold">Private workspace</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                  Records
                </p>
                <p className="mt-2 text-lg font-semibold">People + notes</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                  Timeline
                </p>
                <p className="mt-2 text-lg font-semibold">Context that lasts</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                <p className="text-sm font-semibold text-white">Focused directory</p>
                <p className="mt-2 text-sm leading-6 text-[#cbd3cf]">
                  Search, filter, and open each profile without fighting clutter or weak contrast.
                </p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5">
                <p className="text-sm font-semibold text-white">Actionable profiles</p>
                <p className="mt-2 text-sm leading-6 text-[#cbd3cf]">
                  Keep relationship notes and recent interactions visible where they matter.
                </p>
              </div>
            </div>
          </div>
        </section>

        <SectionCard className="self-center p-7 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
                Sign In
              </p>
              <h2 className="text-3xl font-semibold text-stone-950">
                Open the Masterji workspace
              </h2>
              <p className="text-sm leading-6 text-stone-600">
                Use the same email or phone and password accepted by the backend.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Email or phone</span>
                <input
                  className={inputClassName}
                  placeholder="you@example.com or +91..."
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-stone-700">
                <span>Password</span>
                <input
                  className={inputClassName}
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <Button fullWidth type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="text-sm text-stone-600">
              New here?{" "}
              <Link href="/signup" className="font-semibold text-teal-700">
                Create an account
              </Link>
            </p>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState fullscreen label="Loading sign-in..." />}>
      <LoginPageContent />
    </Suspense>
  );
}
