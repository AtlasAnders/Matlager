"use client";

import { PackageX } from "lucide-react";

type Props = {
  aktiv: boolean;
  antall: number;
  onToggle: () => void;
};

export default function TomtKnapp({ aktiv, antall, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={aktiv}
      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border text-[15px] font-medium transition-colors"
      style={
        aktiv
          ? { backgroundColor: "var(--foreground-muted)", borderColor: "var(--foreground-muted)", color: "var(--surface-strong)" }
          : { backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }
      }
    >
      <PackageX className="h-4.5 w-4.5" />
      Tomt
      {!aktiv && antall > 0 && (
        <span
          className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold"
          style={{ backgroundColor: "var(--foreground-muted)", color: "var(--surface-strong)" }}
        >
          {antall}
        </span>
      )}
    </button>
  );
}
