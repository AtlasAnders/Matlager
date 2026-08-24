"use client";

import { Minus, Plus } from "lucide-react";
import { IKON_KART, STANDARD_IKON } from "@/lib/category-icons";
import { ENHET_LABELS, type VareMedKategori } from "@/lib/types";

type Props = {
  vare: VareMedKategori;
  onEndreMengde: (id: string, delta: number) => void;
  onSettMengde: (id: string, mengde: number) => void;
  onApne: (vare: VareMedKategori) => void;
};

export default function ItemRow({ vare, onEndreMengde, onSettMengde, onApne }: Props) {
  const Ikon = IKON_KART[vare.kategori.ikon] ?? STANDARD_IKON;
  const tomForVare = vare.mengde <= 0;

  function lagreInput(e: React.FocusEvent<HTMLInputElement>) {
    const tallverdi = parseFloat(e.target.value.replace(",", "."));
    if (!Number.isNaN(tallverdi) && tallverdi !== vare.mengde) {
      onSettMengde(vare.id, tallverdi);
    } else {
      e.target.value = String(vare.mengde);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onApne(vare)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onApne(vare);
      }}
      className="flex w-full items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 text-left transition-colors active:bg-surface-strong"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${vare.kategori.farge}26` }}
      >
        <Ikon className="h-5 w-5" style={{ color: vare.kategori.farge }} strokeWidth={2} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-foreground">{vare.navn}</p>
        {tomForVare ? (
          <span className="mt-0.5 inline-block rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
            Tom for
          </span>
        ) : (
          <p className="mt-0.5 text-xs text-foreground-muted">{vare.kategori.navn}</p>
        )}
      </div>

      <div
        className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-surface-strong p-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label={`Reduser mengde for ${vare.navn}`}
          onClick={() => onEndreMengde(vare.id, -1)}
          disabled={vare.mengde <= 0}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors active:bg-background disabled:opacity-30"
        >
          <Minus className="h-4 w-4" />
        </button>

        <input
          key={vare.mengde}
          defaultValue={vare.mengde}
          onBlur={lagreInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          inputMode="decimal"
          aria-label={`Mengde for ${vare.navn}`}
          className="w-12 shrink-0 bg-transparent text-center text-sm font-medium text-foreground tabular-nums focus:outline-none"
        />
        <span className="w-8 shrink-0 text-center text-xs text-foreground-muted">
          {ENHET_LABELS[vare.enhet]}
        </span>

        <button
          type="button"
          aria-label={`Øk mengde for ${vare.navn}`}
          onClick={() => onEndreMengde(vare.id, 1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors active:bg-background"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
