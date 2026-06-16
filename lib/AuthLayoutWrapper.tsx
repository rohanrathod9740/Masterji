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
  
    const isPublicRoute =
      pathname === "/" ||
      pathname?.startsWith("/user/login") ||
      pathname?.startsWith("/user/register") ||
      pathname?.startsWith("/client/login") ||
      pathname?.startsWith("/client/register") ||
      pathname?.startsWith("/client/appointment");

    useEffect(() => {
      // Unauthenticated user routing - can only access public routes
      if (!isAuthenticated && !isPublicRoute) {
        router.replace("/user/login");
      }

      // Authenticated user routing — redirect away from user-auth public routes only
      if (isAuthenticated) {
        const isUserAuthRoute =
          pathname?.startsWith("/user/login") ||
          pathname?.startsWith("/user/register");
        if (isUserAuthRoute) {
          router.replace("/tenant/user/dashboard");
        }
      }
    }, [isAuthenticated, isPublicRoute, pathname, router]);
  
    return <>{children}</>;
  }