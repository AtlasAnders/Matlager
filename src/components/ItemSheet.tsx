"use client";

import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { IKON_KART, STANDARD_IKON } from "@/lib/category-icons";
import { ENHET_LABELS, ENHET_LISTE, type Enhet, type KategoriModel, type VareMedKategori } from "@/lib/types";

export type SheetTilstand = {
  apen: boolean;
  modus: "legg-til" | "rediger";
  vare?: VareMedKategori;
  token: number;
};

type Props = {
  tilstand: SheetTilstand;
  kategorier: KategoriModel[];
  onLukk: () => void;
  onLagre: (data: { navn: string; kategoriId: string; mengde: number; enhet: Enhet }) => Promise<void>;
  onSlett: (id: string) => Promise<void>;
};

export default function ItemSheet({ tilstand, kategorier, onLukk, onSlett, onLagre }: Props) {
  useEffect(() => {
    document.body.style.overflow = tilstand.apen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [tilstand.apen]);

  return (
    <>
      <div
        onClick={onLukk}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          tilstand.apen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-surface-strong shadow-2xl transition-transform duration-300 ${
          tilstand.apen ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!tilstand.apen}
      >
        <SkjemaInnhold
          key={tilstand.token}
          modus={tilstand.modus}
          vare={tilstand.vare}
          kategorier={kategorier}
          onLukk={onLukk}
          onLagre={onLagre}
          onSlett={onSlett}
        />
      </div>
    </>
  );
}

function SkjemaInnhold({
  modus,
  vare,
  kategorier,
  onLukk,
  onLagre,
  onSlett,
}: {
  modus: "legg-til" | "rediger";
  vare?: VareMedKategori;
  kategorier: KategoriModel[];
  onLukk: () => void;
  onLagre: (data: { navn: string; kategoriId: string; mengde: number; enhet: Enhet }) => Promise<void>;
  onSlett: (id: string) => Promise<void>;
}) {
  const [navn, setNavn] = useState(vare?.navn ?? "");
  const [kategoriId, setKategoriId] = useState(vare?.kategoriId ?? "");
  const [mengde, setMengde] = useState(vare ? String(vare.mengde) : "");
  const [enhet, setEnhet] = useState<Enhet>(vare?.enhet ?? "stk");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!navn.trim()) {
      setFeil("Skriv inn et navn på varen");
      return;
    }
    if (!kategoriId) {
      setFeil("Velg en kategori");
      return;
    }
    const mengdeTall = parseFloat(mengde.replace(",", "."));
    if (Number.isNaN(mengdeTall) || mengdeTall < 0) {
      setFeil("Skriv inn en gyldig mengde");
      return;
    }

    setFeil(null);
    setLagrer(true);
    try {
      await onLagre({ navn, kategoriId, mengde: mengdeTall, enhet });
    } finally {
      setLagrer(false);
    }
  }

  async function handleSlett() {
    if (!vare) return;
    setLagrer(true);
    try {
      await onSlett(vare.id);
    } finally {
      setLagrer(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 pb-6 pt-3">
      <div className="flex items-center justify-between">
        <div className="mx-auto h-1.5 w-10 rounded-full bg-border" />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {modus === "legg-til" ? "Legg til vare" : "Rediger vare"}
        </h2>
        <button
          type="button"
          onClick={onLukk}
          aria-label="Lukk"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground-muted"
        >
          <X className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="vare-navn" className="text-sm font-medium text-foreground-muted">
          Navn
        </label>
        <input
          id="vare-navn"
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
          autoFocus
          placeholder="F.eks. Havregryn"
          className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-foreground-muted">Kategori</span>
        <div className="grid grid-cols-2 gap-2">
          {kategorier.map((kategori) => {
            const Ikon = IKON_KART[kategori.ikon] ?? STANDARD_IKON;
            const valgt = kategori.id === kategoriId;
            return (
              <button
                key={kategori.id}
                type="button"
                onClick={() => setKategoriId(kategori.id)}
                aria-pressed={valgt}
                className="flex h-12 items-center gap-2 rounded-2xl border px-3 text-left text-sm font-medium transition-colors"
                style={{
                  borderColor: valgt ? kategori.farge : "var(--border)",
                  backgroundColor: valgt ? `${kategori.farge}1F` : "var(--background)",
                  color: "var(--foreground)",
                }}
              >
                <Ikon className="h-4 w-4 shrink-0" style={{ color: kategori.farge }} />
                <span className="truncate">{kategori.navn}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="vare-mengde" className="text-sm font-medium text-foreground-muted">
            Mengde
          </label>
          <input
            id="vare-mengde"
            value={mengde}
            onChange={(e) => setMengde(e.target.value)}
            inputMode="decimal"
            placeholder="0"
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div className="flex flex-[1.4] flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground-muted">Enhet</span>
          <div className="no-scrollbar flex h-12 items-center gap-1.5 overflow-x-auto rounded-2xl border border-border bg-background px-2">
            {ENHET_LISTE.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEnhet(e)}
                className={`h-9 shrink-0 rounded-xl px-3 text-sm font-medium transition-colors ${
                  enhet === e
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground-muted"
                }`}
              >
                {ENHET_LABELS[e]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {feil && <p className="text-sm text-danger">{feil}</p>}

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={lagrer}
          className="h-12 w-full rounded-2xl bg-accent text-[15px] font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
        >
          {modus === "legg-til" ? "Legg til" : "Lagre endringer"}
        </button>
        {modus === "rediger" && vare && (
          <button
            type="button"
            onClick={handleSlett}
            disabled={lagrer}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-danger/30 text-[15px] font-medium text-danger transition-opacity disabled:opacity-60"
          >
            <Trash2 className="h-4.5 w-4.5" />
            Slett vare
          </button>
        )}
      </div>
    </form>
  );
}
