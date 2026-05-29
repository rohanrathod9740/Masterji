"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GlobalSearchBar } from "../GlobalSearchBar";

const Header = () => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.refresh();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full max-w-screen border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Desktop layout ── */}
        <div className="hidden sm:block">
          {/* Row 1: Logo + nav actions */}
          <div className="flex h-14 items-center justify-between">
            <Link
              href="/"
              className="shrink-0 text-xl font-bold tracking-tight"
            >
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ayushman.
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/app"
                className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Row 2: Search bar */}
          <div className="pb-3 border-t border-gray-100 pt-3">
            <GlobalSearchBar />
          </div>
        </div>

        {/* ── Mobile layout ── */}
        <div className="sm:hidden">
          {/* Row 1: Logo + hamburger */}
          <div className="flex h-14 items-center justify-between">
            <Link
              href="/"
              className="shrink-0 text-lg font-bold tracking-tight"
            >
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ayushman.
              </span>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Row 2 (always visible): Search bar */}
          <div className="pb-3 border-t border-gray-100 pt-3">
            <GlobalSearchBar />
          </div>

          {/* Row 3 (collapsible): Nav links */}
          {isMobileMenuOpen && (
            <nav className="pb-4 space-y-2 border-t border-gray-100 pt-3">
              <Link
                href="/app"
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </nav>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;