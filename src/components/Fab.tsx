"use client";

import { Plus } from "lucide-react";

type Props = {
  onClick: () => void;
};

export default function Fab({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Legg til vare"
      className="safe-bottom fixed bottom-6 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-black/20 transition-transform active:scale-95"
    >
      <Plus className="h-7 w-7" strokeWidth={2.25} />
    </button>
  );
}
