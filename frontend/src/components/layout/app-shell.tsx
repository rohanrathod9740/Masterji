"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button, buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logout } from "@/services/authService";
import type { AuthSession } from "@/types/auth";

const navigationItems = [
  { href: "/people", label: "People" },
  { href: "/people/new", label: "Add Person" },
];

type AppShellProps = {
  session: AuthSession;
  children: React.ReactNode;
};

export function AppShell({ session, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-30 mb-6 rounded-[34px] border border-stone-200/80 bg-white/88 px-5 py-4 shadow-[0_24px_60px_-38px_rgba(35,32,28,0.28)] backdrop-blur">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <Link href="/people" className="inline-flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#163c39] text-sm font-bold text-[#f8f5ef] shadow-[0_14px_30px_-20px_rgba(22,60,57,0.7)]">
                M
              </span>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-stone-950">Masterji</p>
                <p className="text-sm text-stone-600">
                  People memory workspace for relationships and follow-ups
                </p>
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-2 rounded-2xl bg-stone-100/80 p-1.5">
              {navigationItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-white text-stone-950 shadow-sm"
                        : "text-stone-600 hover:bg-white/75 hover:text-stone-950",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl bg-stone-100/85 px-4 py-3 text-sm">
                <p className="font-semibold text-stone-900">{session.user.name}</p>
                <p className="text-stone-500">
                  {session.user.email || session.user.phone || "Signed in"}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Signing out..." : "Sign out"}
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <Link
        href="/people/new"
        className={cn(
          buttonClasses({ variant: "primary" }),
          "fixed bottom-6 right-6 z-20 hidden shadow-[0_22px_50px_-28px_rgba(22,60,57,0.85)] sm:inline-flex",
        )}
      >
        Quick Add
      </Link>
    </div>
  );
}
