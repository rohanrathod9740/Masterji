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
          pathname?.startsWith("/user/login") ||
          pathname?.startsWith("/user/register");
        if (!isPublicRoute) {
          router.replace("/user/login");
        }
      }

      // Authenticated user routing — redirect away from public routes only
      if (isAuthenticated) {
        const isPublicRoute =
          pathname === "/" ||
          pathname?.startsWith("/user/login") ||
          pathname?.startsWith("/user/register");
        if (isPublicRoute) {
          router.replace("/tenant/user");
        }
      }
    }, [isAuthenticated, pathname, router]);
  
    return <>{children}</>;
  }