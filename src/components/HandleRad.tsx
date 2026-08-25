"use client";

import { useState } from "react";
import { Check, ListPlus, PackagePlus } from "lucide-react";
import { IKON_KART, STANDARD_IKON } from "@/lib/category-icons";
import { ENHET_LABELS, type HandlelisteEntry, type KategoriModel } from "@/lib/types";

export type OnKjop = (entry: HandlelisteEntry, kjoptMengde: number, kategoriId: string | null) => Promise<void>;

export function HandleRad({
  entry,
  kategorier,
  onKjop,
  onFlytt,
  visningstype = "handleliste",
}: {
  entry: HandlelisteEntry;
  kategorier: KategoriModel[];
  onKjop: OnKjop;
  onFlytt?: (entry: HandlelisteEntry) => void;
  visningstype?: "handleliste" | "tomt";
}) {
  const Ikon = entry.kategori ? IKON_KART[entry.kategori.ikon] ?? STANDARD_IKON : PackagePlus;
  const farge = entry.kategori?.farge ?? "var(--foreground-muted)";
  const trengerKategori = entry.kategori === null;

  const [kjoptMengde, setKjoptMengde] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function handleKjop() {
    const mengdeTall = parseFloat(kjoptMengde.replace(",", "."));
    if (Number.isNaN(mengdeTall) || mengdeTall <= 0) {
      setFeil("Ugyldig mengde");
      return;
    }
    if (trengerKategori && !kategoriId) {
      setFeil("Velg kategori");
      return;
    }
    setFeil(null);
    setLagrer(true);
    try {
      await onKjop(entry, mengdeTall, trengerKategori ? kategoriId : null);
    } finally {
      setLagrer(false);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-2xl bg-surface px-3 py-2.5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: entry.kategori ? `${entry.kategori.farge}26` : "var(--border)" }}
        >
          <Ikon className="h-5 w-5" style={{ color: farge }} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-foreground">{entry.navn}</p>
          <span className="mt-0.5 inline-block rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
            {visningstype === "tomt"
              ? "Tom for"
              : entry.mengdeAaKjope > 0
                ? `Trenger ${entry.mengdeAaKjope} ${ENHET_LABELS[entry.enhet]}`
                : "Skal handles"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {trengerKategori && (
          <select
            value={kategoriId}
            onChange={(e) => setKategoriId(e.target.value)}
            className="h-10 flex-1 rounded-xl border border-border bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="">Velg kategori</option>
            {kategorier.map((k) => (
              <option key={k.id} value={k.id}>
                {k.navn}
              </option>
            ))}
          </select>
        )}
        <input
          value={kjoptMengde}
          onChange={(e) => setKjoptMengde(e.target.value)}
          inputMode="decimal"
          placeholder={entry.mengdeAaKjope > 0 ? String(entry.mengdeAaKjope) : "Mengde"}
          className={`h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40 ${trengerKategori ? "w-20 shrink-0" : "flex-1"}`}
        />
        <span className="shrink-0 text-xs text-foreground-muted">{ENHET_LABELS[entry.enhet]}</span>
        {visningstype === "tomt" && onFlytt && (
          <button
            type="button"
            onClick={() => onFlytt(entry)}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface-strong px-3 text-sm font-semibold text-foreground"
          >
            <ListPlus className="h-4 w-4" />
            Flytt
          </button>
        )}
        <button
          type="button"
          onClick={handleKjop}
          disabled={lagrer}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 text-sm font-semibold text-accent-foreground disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          Kjøp
        </button>
      </div>
      {feil && <p className="text-xs text-danger">{feil}</p>}
    </div>
  );
}

export function HandleGruppeHeader({ kategori }: { kategori: KategoriModel }) {
  const Ikon = IKON_KART[kategori.ikon] ?? STANDARD_IKON;
  return (
    <div className="mb-2 flex items-center gap-2 px-1">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: kategori.farge }}
      >
        <Ikon className="h-4 w-4 text-surface-strong" strokeWidth={2.25} />
      </div>
      <h2 className="text-[15px] font-semibold text-foreground">{kategori.navn}</h2>
    </div>
  );
}
