"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
// import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

const Header = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      // Use router.replace instead of refresh+push to avoid race conditions
      router.refresh();
      // router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        

        {/* Logo */}
        <Link
          href="/"
          className="relative text-xl font-semibold tracking-tight text-black"
        >
          <span className="bg-gradient-to-r from-black to-gray-500 bg-clip-text text-transparent">
            Ayushman
          </span>
          <span className="text-black">.</span>
        </Link>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/app"
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-black hover:bg-gray-300 transition-colors"
          >
            Home
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;