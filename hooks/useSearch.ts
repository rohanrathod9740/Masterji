import { useState, useCallback, useRef } from "react";

interface SearchResult {
  id: string;
  name: string;
  type: "person" | "case" | "commitment" | "interaction";
  subtitle?: string;
  category?: string;
  status?: string;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback(async (query: string, debounceMs: number = 300) => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Reset if query is empty
    if (query.trim().length === 0) {
      setResults([]);
      setError(null);
      return;
    }

    // Set minimum query length
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    // Debounce the search
    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
}
