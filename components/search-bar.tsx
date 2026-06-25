"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import type { SymbolMatch } from "@/lib/market/types";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolMatch[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced search against /api/search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setResults(data.results ?? []);
        setActive(0);
        setOpen(true);
      } catch {
        // aborted or failed; ignore
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(symbol: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/stocks/${symbol}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) {
      if (e.key === "Enter" && query.trim()) go(query.trim().toUpperCase());
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active].symbol);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search stocks (e.g. AAPL)"
        aria-label="Search stocks"
        className="h-9 w-full rounded-full border border-border bg-card pl-9 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}

      {open && (
        <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {loading ? "Searching…" : "No matches"}
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.symbol}
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r.symbol)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm",
                  i === active ? "bg-muted" : "hover:bg-muted/60",
                )}
              >
                <span className="font-semibold">{r.symbol}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {r.description}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
