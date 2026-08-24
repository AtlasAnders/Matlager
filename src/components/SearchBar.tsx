"use client";

import { Search, X } from "lucide-react";

type Props = {
  verdi: string;
  onEndre: (verdi: string) => void;
};

export default function SearchBar({ verdi, onEndre }: Props) {
  return (
    <div className="relative flex items-center">
      <Search className="pointer-events-none absolute left-3.5 h-4.5 w-4.5 text-foreground-muted" />
      <input
        value={verdi}
        onChange={(e) => onEndre(e.target.value)}
        type="text"
        inputMode="search"
        placeholder="Søk etter vare..."
        aria-label="Søk etter vare"
        className="h-11 w-full rounded-2xl border border-border bg-surface pl-10 pr-10 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {verdi && (
        <button
          type="button"
          onClick={() => onEndre("")}
          aria-label="Tøm søk"
          className="absolute right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-border text-foreground-muted"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
