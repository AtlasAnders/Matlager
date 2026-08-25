"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
import { IKON_KART, STANDARD_IKON } from "@/lib/category-icons";
import {
  ENHET_LABELS,
  ENHET_LISTE,
  type Enhet,
  type PlanlagtIngrediens,
  type VareMedKategori,
} from "@/lib/types";

type Props = {
  apen: boolean;
  varer: VareMedKategori[];
  middagsplan: PlanlagtIngrediens[];
  onLukk: () => void;
  onLeggTil: (data: { navn: string; vareId: string | null; mengde: number; enhet: Enhet }) => Promise<void>;
  onSlett: (id: string) => Promise<void>;
};

export default function MiddagsplanSheet({ apen, varer, middagsplan, onLukk, onLeggTil, onSlett }: Props) {
  const [sok, setSok] = useState("");
  const [valgtVare, setValgtVare] = useState<VareMedKategori | null>(null);
  const [leggerTilNy, setLeggerTilNy] = useState(false);
  const [mengde, setMengde] = useState("");
  const [enhet, setEnhet] = useState<Enhet>("stk");
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const treff = useMemo(() => {
    const sokLav = sok.trim().toLowerCase();
    if (sokLav === "") return [];
    return varer.filter((v) => v.navn.toLowerCase().includes(sokLav)).slice(0, 6);
  }, [varer, sok]);

  function nullstillValg() {
    setValgtVare(null);
    setLeggerTilNy(false);
    setMengde("");
    setEnhet("stk");
    setFeil(null);
  }

  function velgVare(vare: VareMedKategori) {
    setValgtVare(vare);
    setLeggerTilNy(false);
    setMengde("");
    setEnhet(vare.enhet);
    setFeil(null);
  }

  function velgNyVare() {
    setValgtVare(null);
    setLeggerTilNy(true);
    setMengde("");
    setEnhet("stk");
    setFeil(null);
  }

  async function handleLeggTil() {
    const mengdeTall = parseFloat(mengde.replace(",", "."));
    if (Number.isNaN(mengdeTall) || mengdeTall <= 0) {
      setFeil("Skriv inn en gyldig mengde");
      return;
    }
    const navn = valgtVare ? valgtVare.navn : sok.trim();
    if (!navn) {
      setFeil("Skriv inn et navn");
      return;
    }

    setFeil(null);
    setLagrer(true);
    try {
      await onLeggTil({ navn, vareId: valgtVare?.id ?? null, mengde: mengdeTall, enhet });
      setSok("");
      nullstillValg();
    } finally {
      setLagrer(false);
    }
  }

  async function handleSlett(id: string) {
    setLagrer(true);
    try {
      await onSlett(id);
    } finally {
      setLagrer(false);
    }
  }

  const visSkjema = valgtVare !== null || leggerTilNy;

  return (
    <>
      <div
        onClick={onLukk}
        aria-hidden
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          apen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-surface-strong shadow-2xl transition-transform duration-300 ${
          apen ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!apen}
      >
        <div className="flex flex-col gap-5 px-5 pb-6 pt-3">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-border" />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Planlegg middager</h2>
            <button
              type="button"
              onClick={onLukk}
              aria-label="Lukk"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground-muted"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-3.5 h-4.5 w-4.5 text-foreground-muted" />
              <input
                value={sok}
                onChange={(e) => {
                  setSok(e.target.value);
                  nullstillValg();
                }}
                placeholder="Søk etter ingrediens..."
                className="h-11 w-full rounded-2xl border border-border bg-background pl-10 pr-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
              />
            </div>

            {sok.trim() !== "" && !visSkjema && (
              <div className="flex flex-col gap-1.5">
                {treff.map((vare) => {
                  const Ikon = IKON_KART[vare.kategori.ikon] ?? STANDARD_IKON;
                  return (
                    <button
                      key={vare.id}
                      type="button"
                      onClick={() => velgVare(vare)}
                      className="flex items-center gap-3 rounded-2xl bg-background px-3 py-2.5 text-left"
                    >
                      <Ikon className="h-4.5 w-4.5 shrink-0" style={{ color: vare.kategori.farge }} />
                      <span className="min-w-0 flex-1 truncate text-[15px] text-foreground">{vare.navn}</span>
                      <span className="shrink-0 text-xs text-foreground-muted">
                        {vare.mengde} {ENHET_LABELS[vare.enhet]} på lager
                      </span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={velgNyVare}
                  className="flex items-center gap-2 rounded-2xl border border-dashed border-border px-3 py-2.5 text-left text-[15px] text-foreground-muted"
                >
                  <Plus className="h-4.5 w-4.5 shrink-0" />
                  Legg til «{sok.trim()}» som ny vare
                </button>
              </div>
            )}

            {visSkjema && (
              <div className="flex flex-col gap-2 rounded-2xl bg-background p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[15px] font-medium text-foreground">
                    {valgtVare ? valgtVare.navn : sok.trim()}
                  </p>
                  <button type="button" onClick={nullstillValg} className="text-sm text-foreground-muted">
                    Avbryt
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    value={mengde}
                    onChange={(e) => setMengde(e.target.value)}
                    inputMode="decimal"
                    autoFocus
                    placeholder="Mengde du trenger"
                    className="h-11 flex-1 rounded-2xl border border-border bg-surface-strong px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  {valgtVare ? (
                    <span className="flex h-11 items-center rounded-2xl border border-border bg-surface-strong px-4 text-sm text-foreground-muted">
                      {ENHET_LABELS[valgtVare.enhet]}
                    </span>
                  ) : (
                    <div className="no-scrollbar flex h-11 items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-surface-strong px-2">
                      {ENHET_LISTE.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setEnhet(e)}
                          className={`h-8 shrink-0 rounded-xl px-2.5 text-sm font-medium transition-colors ${
                            enhet === e ? "bg-accent text-accent-foreground" : "text-foreground-muted"
                          }`}
                        >
                          {ENHET_LABELS[e]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {feil && <p className="text-sm text-danger">{feil}</p>}
                <button
                  type="button"
                  onClick={handleLeggTil}
                  disabled={lagrer}
                  className="h-11 w-full rounded-2xl bg-accent text-[15px] font-semibold text-accent-foreground disabled:opacity-60"
                >
                  Legg til i planen
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground-muted">
              {middagsplan.length === 0 ? "Ingenting planlagt ennå" : `Planlagt (${middagsplan.length})`}
            </span>
            {middagsplan.map((rad) => {
              const knyttetVare = varer.find((v) => v.id === rad.vareId);
              return (
                <div key={rad.id} className="flex items-center gap-3 rounded-2xl bg-background px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] text-foreground">{rad.navn}</p>
                    <p className="text-xs text-foreground-muted">
                      Trenger {rad.mengde} {ENHET_LABELS[rad.enhet]}
                      {knyttetVare ? ` · har ${knyttetVare.mengde} ${ENHET_LABELS[knyttetVare.enhet]}` : " · ny vare"}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={lagrer}
                    onClick={() => handleSlett(rad.id)}
                    aria-label={`Fjern ${rad.navn} fra planen`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground-muted disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
