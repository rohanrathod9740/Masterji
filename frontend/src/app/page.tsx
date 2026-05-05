"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LoadingState } from "@/components/ui/loading-state";
import { getSession } from "@/services/authService";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    async function resolveHomeRoute() {
      const session = await getSession();

      if (!isMounted) {
        return;
      }

      router.replace(session ? "/people" : "/login");
    }

    void resolveHomeRoute();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return <LoadingState fullscreen label="Checking your session..." />;
}
