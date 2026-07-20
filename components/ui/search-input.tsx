"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ISearchInputProps {
  /** Fired with the debounced term — the caller refetches from the server. */
  onSearch: (term: string) => void;
  placeholder: string;
  clearLabel: string;
  /** Milliseconds of quiet before searching. */
  delay?: number;
  className?: string;
}

/**
 * Debounced search box.
 *
 * The debounce isn't cosmetic: every list this feeds is server-filtered and
 * paginated, so searching per keystroke would fire a request per character and
 * let an earlier, slower response land after a later one — showing results for
 * a prefix of what the seller typed.
 */
export default function SearchInput({
  onSearch,
  placeholder,
  clearLabel,
  delay = 350,
  className,
}: ISearchInputProps) {
  const [term, setTerm] = useState("");

  // Held in a ref so changing the handler identity doesn't restart the timer
  // mid-type. Synced in an effect rather than during render — writing a ref
  // while rendering is what `react-hooks/refs` forbids, and the timer below
  // only reads it after a commit anyway.
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Skips the mount pass: firing an empty search on first render would double
  // up with the page's own initial fetch.
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const timer = setTimeout(() => onSearchRef.current(term), delay);
    return () => clearTimeout(timer);
  }, [term, delay]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={term}
        placeholder={placeholder}
        onChange={(e) => setTerm(e.target.value)}
        className="pl-8 pr-8"
      />
      {term && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => setTerm("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
