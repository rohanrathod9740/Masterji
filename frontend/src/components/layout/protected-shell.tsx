"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/ui/loading-state";
import { getSession } from "@/services/authService";
import type { AuthSession } from "@/types/auth";

type ProtectedShellProps = {
  children: React.ReactNode;
};

export function ProtectedShell({ children }: ProtectedShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null | undefined>(undefined);

  const redirectToLogin = useEffectEvent((nextPath: string) => {
    const nextTarget = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    router.replace(`/login${nextTarget}`);
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const nextSession = await getSession();

      if (!isMounted) {
        return;
      }

      if (!nextSession) {
        setSession(null);
        redirectToLogin(pathname ?? "");
        return;
      }

      setSession(nextSession);
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (!session) {
    return <LoadingState fullscreen label="Opening your workspace..." />;
  }

  return <AppShell session={session}>{children}</AppShell>;
}
