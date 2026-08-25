"use client";

import { UtensilsCrossed } from "lucide-react";

type Props = {
  antall: number;
  onClick: () => void;
};

export default function MiddagsplanKnapp({ antall, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-surface text-[15px] font-medium text-foreground"
    >
      <UtensilsCrossed className="h-4.5 w-4.5" />
      Planlegg middager
      {antall > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-accent-foreground">
          {antall}
        </span>
      )}
    </button>
  );
}
