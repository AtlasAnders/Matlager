"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { IKON_KART, STANDARD_IKON } from "@/lib/category-icons";
import type { KategoriModel } from "@/lib/types";

type Props = {
  kategorier: KategoriModel[];
  valgte: Set<string>;
  onToggle: (id: string) => void;
  onNullstill: () => void;
};

const ANTALL_SYNLIGE = 3;

function Chip({
  kategori,
  aktiv,
  onClick,
}: {
  kategori: KategoriModel;
  aktiv: boolean;
  onClick: () => void;
}) {
  const Ikon = IKON_KART[kategori.ikon] ?? STANDARD_IKON;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktiv}
      className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors"
      style={
        aktiv
          ? { backgroundColor: kategori.farge, borderColor: kategori.farge, color: "#fbf8f2" }
          : { backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }
      }
    >
      <Ikon className="h-3.5 w-3.5" strokeWidth={2.25} />
      {kategori.navn}
    </button>
  );
}

export default function CategoryChips({ kategorier, valgte, onToggle, onNullstill }: Props) {
  const [apen, setApen] = useState(false);
  const synlige = kategorier.slice(0, ANTALL_SYNLIGE);
  const skjulte = kategorier.slice(ANTALL_SYNLIGE);
  const antallSkjulteValgte = skjulte.filter((k) => valgte.has(k.id)).length;

  return (
    <div className="relative px-4 pb-1">
      <div className="flex flex-wrap items-center gap-2">
        {valgte.size > 0 && (
          <button
            type="button"
            onClick={onNullstill}
            className="flex h-9 shrink-0 items-center rounded-full border border-border bg-surface px-3 text-sm font-medium text-foreground-muted"
          >
            Nullstill
          </button>
        )}
        {synlige.map((kategori) => (
          <Chip
            key={kategori.id}
            kategori={kategori}
            aktiv={valgte.has(kategori.id)}
            onClick={() => onToggle(kategori.id)}
          />
        ))}
        {skjulte.length > 0 && (
          <button
            type="button"
            onClick={() => setApen((v) => !v)}
            aria-expanded={apen}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors"
            style={
              antallSkjulteValgte > 0
                ? { backgroundColor: "var(--accent)", borderColor: "var(--accent)", color: "var(--accent-foreground)" }
                : { backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }
            }
          >
            Flere{antallSkjulteValgte > 0 ? ` (${antallSkjulteValgte})` : ""}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${apen ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {apen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setApen(false)} aria-hidden />
          <div className="absolute left-4 right-4 top-full z-40 mt-2 flex flex-wrap gap-2 rounded-2xl border border-border bg-surface-strong p-3 shadow-xl">
            {skjulte.map((kategori) => (
              <Chip
                key={kategori.id}
                kategori={kategori}
                aktiv={valgte.has(kategori.id)}
                onClick={() => onToggle(kategori.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
