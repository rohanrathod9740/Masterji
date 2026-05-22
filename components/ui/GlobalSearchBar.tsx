"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface SearchResult {
  id: string;
  name: string;
  type: "person" | "case" | "commitment" | "interaction";
  subtitle?: string;
  category?: string;
  status?: string;
}

interface GroupedResults {
  people: SearchResult[];
  cases: SearchResult[];
  commitments: SearchResult[];
  interactions: SearchResult[];
}

export function GlobalSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [groupedResults, setGroupedResults] = useState<GroupedResults>({
    people: [],
    cases: [],
    commitments: [],
    interactions: [],
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (query.trim().length === 0) {
        setResults([]);
        setGroupedResults({ people: [], cases: [], commitments: [], interactions: [] });
        setIsOpen(false);
        return;
      }

      if (query.trim().length < 2) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        const allResults = data.results || [];
        setResults(allResults);

        // Group results by type
        const grouped: GroupedResults = {
          people: allResults.filter((r: SearchResult) => r.type === "person"),
          cases: allResults.filter((r: SearchResult) => r.type === "case"),
          commitments: allResults.filter((r: SearchResult) => r.type === "commitment"),
          interactions: allResults.filter((r: SearchResult) => r.type === "interaction"),
        };
        setGroupedResults(grouped);
        setIsOpen(allResults.length > 0);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
        setGroupedResults({ people: [], cases: [], commitments: [], interactions: [] });
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

  const handleResultClick = (result: SearchResult) => {
    let route = "";
    switch (result.type) {
      case "person":
        route = `/app/people/${result.id}`;
        break;
      case "case":
        route = `/app/cases/${result.id}`;
        break;
      case "commitment":
        route = `/app/commitments`;
        break;
      case "interaction":
        route = `/app/interactions/${result.id}/edit`;
        break;
    }

    setQuery("");
    setIsOpen(false);
    setResults([]);
    if (route) router.push(route);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "person":
        return "👤";
      case "case":
        return "📋";
      case "commitment":
        return "✅";
      case "interaction":
        return "💬";
      default:
        return "🔍";
    }
  };

  const renderResultSection = (title: string, items: SearchResult[]) => {
    if (items.length === 0) return null;

    return (
      <div key={title} className="border-t border-gray-100">
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
          {title}
        </div>
        {items.map((result) => (
          <button
            key={`${result.type}-${result.id}`}
            onClick={() => handleResultClick(result)}
            className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">{getTypeIcon(result.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{result.name}</div>
                {result.subtitle && (
                  <div className="text-xs text-gray-600 mt-1 truncate">{result.subtitle}</div>
                )}
                {result.status && (
                  <div className="text-xs mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        result.status === "done"
                          ? "bg-green-100 text-green-800"
                          : result.status === "pending" || result.status === "active"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="bg-white rounded-lg border border-gray-200 flex items-center gap-2.5 px-3.5 py-2.5 shadow-sm hover:border-gray-300 transition-colors">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search whatever you remember.."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && results.length > 0 && setIsOpen(true)}
          className="flex-1 text-sm bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
        />
        {isLoading && (
          <div className="shrink-0">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden overflow-y-auto">
          {groupedResults.people.length > 0 &&
            renderResultSection("People", groupedResults.people)}
          {groupedResults.cases.length > 0 &&
            renderResultSection("Cases", groupedResults.cases)}
          {groupedResults.commitments.length > 0 &&
            renderResultSection("Commitments", groupedResults.commitments)}
          {groupedResults.interactions.length > 0 &&
            renderResultSection("Interactions", groupedResults.interactions)}
        </div>
      )}

      {/* No results message */}
      {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-8 text-center">
          <div className="text-gray-500 text-sm">No results found for &quot;{query}&quot;</div>
        </div>
      )}
    </div>
  );
}
