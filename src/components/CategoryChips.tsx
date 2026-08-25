"use client";

import { IKON_KART, STANDARD_IKON } from "@/lib/category-icons";
import type { KategoriModel } from "@/lib/types";

type Props = {
  kategorier: KategoriModel[];
  valgte: Set<string>;
  onToggle: (id: string) => void;
  onNullstill: () => void;
};

export default function CategoryChips({ kategorier, valgte, onToggle, onNullstill }: Props) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-1">
      {valgte.size > 0 && (
        <button
          type="button"
          onClick={onNullstill}
          className="flex h-9 shrink-0 items-center rounded-full border border-border bg-surface px-3 text-sm font-medium text-foreground-muted"
        >
          Nullstill
        </button>
      )}
      {kategorier.map((kategori) => {
        const Ikon = IKON_KART[kategori.ikon] ?? STANDARD_IKON;
        const aktiv = valgte.has(kategori.id);
        return (
          <button
            key={kategori.id}
            type="button"
            onClick={() => onToggle(kategori.id)}
            aria-pressed={aktiv}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors"
            style={
              aktiv
                ? {
                    backgroundColor: kategori.farge,
                    borderColor: kategori.farge,
                    color: "#fbf8f2",
                  }
                : {
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }
            }
          >
            <Ikon className="h-3.5 w-3.5" strokeWidth={2.25} />
            {kategori.navn}
          </button>
        );
      })}
    </div>
  );
}
