  "use client";
  
  import { useEffect } from "react";
  import { useRouter, usePathname } from "next/navigation";
  
  type Props = {
    children: React.ReactNode;
    isAuthenticated: boolean;
  };
  
  export default function AuthLayoutWrapper({ children, isAuthenticated }: Props) {
    const router = useRouter();
    const pathname = usePathname();
  
    useEffect(() => {
      // Unauthenticated user routing - can only access /, /login, /register
      if (!isAuthenticated) {
        const isPublicRoute =
          pathname === "/" ||
          pathname?.startsWith("/login") ||
          pathname?.startsWith("/register");

        if (!isPublicRoute) {
          router.replace("/login");
        }
      }

      // Authenticated user routing - can only access /app and /app/* routes
      if (isAuthenticated) {
        const isProtectedRoute = pathname?.startsWith("/app");

        if (!isProtectedRoute) {
          router.replace("/app");
        }
      }
    }, [isAuthenticated, pathname, router]);
  
    return <>{children}</>;
  }