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
      // If user is not authenticated and trying to access protected routes
      if (!isAuthenticated && !pathname?.startsWith("/login") && !pathname?.startsWith("/        register")) {
        router.push("/login");
        return;
      }
  
 2    // If user is authenticated and trying to access login
      if (isAuthenticated && pathname === "/login") {
        router.push("/");
      }
    }, [isAuthenticated, pathname, router]);
  
    return <>{children}</>;
  }