"use client";

import { ShoppingCart } from "lucide-react";

type Props = {
  aktiv: boolean;
  antallTomme: number;
  onToggle: () => void;
};

export default function HandlelisteKnapp({ aktiv, antallTomme, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={aktiv}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border text-[15px] font-medium transition-colors"
      style={
        aktiv
          ? { backgroundColor: "var(--danger)", borderColor: "var(--danger)", color: "var(--danger-foreground)" }
          : { backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }
      }
    >
      <ShoppingCart className="h-4.5 w-4.5" />
      {aktiv ? "Vis alle varer" : "Handleliste"}
      {!aktiv && antallTomme > 0 && (
        <span
          className="flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold"
          style={{ backgroundColor: "var(--danger)", color: "var(--danger-foreground)" }}
        >
          {antallTomme}
        </span>
      )}
    </button>
  );
}
