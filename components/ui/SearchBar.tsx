"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface SearchResult {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type?: string;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(data.results && data.results.length > 0);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (personId: string) => {
    setQuery("");
    setIsOpen(false);
    setResults([]);
    router.push(`/app/people/${personId}`);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="bg-white rounded-lg border border-gray-100 flex items-center gap-2.5 px-3.5 py-2">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
          className="flex-1 text-sm bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
        />
        {isLoading && (
          <div className="flex-shrink-0">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg z-50">
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="font-semibold text-gray-900 text-sm">{result.name}</div>
                {result.email || result.phone ? (
                  <div className="text-xs text-gray-600 mt-1">
                    {result.email || result.phone}
                  </div>
                ) : null}
                {result.type && (
                  <div className="text-xs text-gray-500 mt-1 capitalize">{result.type}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {isOpen && query.trim().length > 0 && results.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg z-50 p-4 text-center">
          <p className="text-gray-600 text-sm">No people found matching `${query}`</p>
        </div>
      )}
    </div>
  );
}
