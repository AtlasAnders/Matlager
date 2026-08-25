"use client";

import { useState } from "react";
import { Check, PackagePlus } from "lucide-react";
import { IKON_KART, STANDARD_IKON } from "@/lib/category-icons";
import { ENHET_LABELS, type HandlelisteEntry, type KategoriModel } from "@/lib/types";

type Gruppe = { kategori: KategoriModel; entries: HandlelisteEntry[] };

type Props = {
  middagsvarerGrupper: Gruppe[];
  middagsvarerNye: HandlelisteEntry[];
  ovrigeGrupper: Gruppe[];
  kategorier: KategoriModel[];
  onKjop: (entry: HandlelisteEntry, kjoptMengde: number, kategoriId: string | null) => Promise<void>;
};

function Rad({
  entry,
  kategorier,
  onKjop,
}: {
  entry: HandlelisteEntry;
  kategorier: KategoriModel[];
  onKjop: (entry: HandlelisteEntry, kjoptMengde: number, kategoriId: string | null) => Promise<void>;
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
          {entry.mengdeAaKjope > 0 ? (
            <span className="mt-0.5 inline-block rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
              Trenger {entry.mengdeAaKjope} {ENHET_LABELS[entry.enhet]}
            </span>
          ) : (
            <span className="mt-0.5 inline-block rounded-full bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger">
              Tom for
            </span>
          )}
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

function GruppeHeader({ kategori }: { kategori: KategoriModel }) {
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

function Seksjon({
  tittel,
  grupper,
  nyeVarer,
  kategorier,
  onKjop,
}: {
  tittel: string;
  grupper: Gruppe[];
  nyeVarer: HandlelisteEntry[];
  kategorier: KategoriModel[];
  onKjop: Props["onKjop"];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="px-1 text-lg font-bold tracking-tight text-foreground">{tittel}</h1>

      {grupper.map(({ kategori, entries }) => (
        <section key={kategori.id}>
          <GruppeHeader kategori={kategori} />
          <div className="flex flex-col gap-1.5">
            {entries.map((entry) => (
              <Rad key={entry.id} entry={entry} kategorier={kategorier} onKjop={onKjop} />
            ))}
          </div>
        </section>
      ))}

      {nyeVarer.length > 0 && (
        <section>
          <div className="mb-2 flex items-center gap-2 px-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground-muted">
              <PackagePlus className="h-4 w-4 text-surface-strong" strokeWidth={2.25} />
            </div>
            <h2 className="text-[15px] font-semibold text-foreground">Nytt å handle</h2>
          </div>
          <div className="flex flex-col gap-1.5">
            {nyeVarer.map((entry) => (
              <Rad key={entry.id} entry={entry} kategorier={kategorier} onKjop={onKjop} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function HandlelisteVisning({
  middagsvarerGrupper,
  middagsvarerNye,
  ovrigeGrupper,
  kategorier,
  onKjop,
}: Props) {
  const harMiddagsvarer = middagsvarerGrupper.length > 0 || middagsvarerNye.length > 0;
  const harOvrige = ovrigeGrupper.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {harMiddagsvarer && (
        <Seksjon
          tittel="Middagsvarer"
          grupper={middagsvarerGrupper}
          nyeVarer={middagsvarerNye}
          kategorier={kategorier}
          onKjop={onKjop}
        />
      )}
      {harOvrige && (
        <Seksjon
          tittel="Øvrige tomme varer"
          grupper={ovrigeGrupper}
          nyeVarer={[]}
          kategorier={kategorier}
          onKjop={onKjop}
        />
      )}
    </div>
  );
}
