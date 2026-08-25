"use client";

import { useState, useTransition } from "react";
import { Check, X, LogOut, Copy, Ban } from "lucide-react";
import {
  godkjennForesporsel,
  avvisForesporsel,
  opprettKode,
  tilbakekallKode,
  loggUtAdmin,
  type Tilgangsforesporsel,
  type Tilgangskode,
  type Lager,
  type LagerValg,
} from "@/lib/access/admin-actions";

type Props = {
  initialForesporsler: Tilgangsforesporsel[];
  initialKoder: Tilgangskode[];
  initialLagre: Lager[];
};

function formaterDato(iso: string) {
  return new Date(iso).toLocaleString("no", { dateStyle: "short", timeStyle: "short" });
}

/** Velg et eksisterende lager, eller skriv inn navn på et nytt. */
function LagerFelt({
  lagre,
  lagerId,
  onLagerIdChange,
  nyttNavn,
  onNyttNavnChange,
}: {
  lagre: Lager[];
  lagerId: string;
  onLagerIdChange: (v: string) => void;
  nyttNavn: string;
  onNyttNavnChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <select
        value={lagerId}
        onChange={(e) => onLagerIdChange(e.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        {lagre.map((l) => (
          <option key={l.id} value={l.id}>
            {l.navn}
          </option>
        ))}
        <option value="__nytt__">+ Nytt kjøkken/lager</option>
      </select>
      {lagerId === "__nytt__" && (
        <input
          value={nyttNavn}
          onChange={(e) => onNyttNavnChange(e.target.value)}
          placeholder="Navn på nytt kjøkken"
          className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      )}
    </div>
  );
}

export default function AdminDashboard({ initialForesporsler, initialKoder, initialLagre }: Props) {
  const [foresporsler, setForesporsler] = useState(initialForesporsler);
  const [koder, setKoder] = useState(initialKoder);
  const [lagre, setLagre] = useState(initialLagre);
  const [pending, startTransition] = useTransition();

  const ventende = foresporsler.filter((f) => f.status === "ny");
  const historikk = foresporsler.filter((f) => f.status !== "ny");

  const [godkjennApen, setGodkjennApen] = useState<string | null>(null);
  const [godkjennKode, setGodkjennKode] = useState("");
  const [godkjennLagerId, setGodkjennLagerId] = useState(lagre[0]?.id ?? "__nytt__");
  const [godkjennNyttNavn, setGodkjennNyttNavn] = useState("");
  const [godkjennFeil, setGodkjennFeil] = useState<string | null>(null);

  const [nyKode, setNyKode] = useState("");
  const [nyKodeNavn, setNyKodeNavn] = useState("");
  const [nyKodeLagerId, setNyKodeLagerId] = useState(lagre[0]?.id ?? "__nytt__");
  const [nyKodeNyttNavn, setNyKodeNyttNavn] = useState("");
  const [nyKodeFeil, setNyKodeFeil] = useState<string | null>(null);

  function tilLagerValg(lagerId: string, nyttNavn: string): LagerValg | null {
    if (lagerId === "__nytt__") {
      if (!nyttNavn.trim()) return null;
      return { nyttLagerNavn: nyttNavn.trim() };
    }
    return { lagerId };
  }

  function apneGodkjenning(id: string) {
    setGodkjennApen(id);
    setGodkjennKode("");
    setGodkjennLagerId(lagre[0]?.id ?? "__nytt__");
    setGodkjennNyttNavn("");
    setGodkjennFeil(null);
  }

  function handleGodkjenn(e: React.FormEvent, foresporsel: Tilgangsforesporsel) {
    e.preventDefault();
    const lagerValg = tilLagerValg(godkjennLagerId, godkjennNyttNavn);
    if (!godkjennKode.trim()) {
      setGodkjennFeil("Skriv inn en kode");
      return;
    }
    if (!lagerValg) {
      setGodkjennFeil("Velg et kjøkken eller skriv navn på et nytt");
      return;
    }
    setGodkjennFeil(null);
    startTransition(async () => {
      const resultat = await godkjennForesporsel(foresporsel.id, godkjennKode, lagerValg);
      if (!resultat.ok) {
        setGodkjennFeil(resultat.feil ?? "Noe gikk galt");
        return;
      }
      const brukteKode = godkjennKode.trim();
      setForesporsler((prev) =>
        prev.map((f) => (f.id === foresporsel.id ? { ...f, status: "godkjent", generert_kode: brukteKode } : f))
      );
      let visLagerId = godkjennLagerId;
      let visLagerNavn = lagre.find((l) => l.id === godkjennLagerId)?.navn ?? "";
      if (godkjennLagerId === "__nytt__") {
        visLagerId = crypto.randomUUID();
        visLagerNavn = godkjennNyttNavn.trim();
        setLagre((prev) => [...prev, { id: visLagerId, navn: visLagerNavn, opprettet: new Date().toISOString() }]);
      }
      setKoder((prev) => [
        {
          id: crypto.randomUUID(),
          kode: brukteKode,
          navn: foresporsel.navn,
          aktiv: true,
          opprettet: new Date().toISOString(),
          lager_id: visLagerId,
          lager_navn: visLagerNavn,
        },
        ...prev,
      ]);
      setGodkjennApen(null);
    });
  }

  function handleAvvis(id: string) {
    startTransition(async () => {
      const resultat = await avvisForesporsel(id);
      if (resultat.ok) {
        setForesporsler((prev) => prev.map((f) => (f.id === id ? { ...f, status: "avvist" } : f)));
      }
    });
  }

  function handleOpprettKode(e: React.FormEvent) {
    e.preventDefault();
    const lagerValg = tilLagerValg(nyKodeLagerId, nyKodeNyttNavn);
    if (!nyKode.trim()) {
      setNyKodeFeil("Skriv inn en kode");
      return;
    }
    if (!lagerValg) {
      setNyKodeFeil("Velg et kjøkken eller skriv navn på et nytt");
      return;
    }
    setNyKodeFeil(null);
    startTransition(async () => {
      const resultat = await opprettKode(nyKode, nyKodeNavn, lagerValg);
      if (!resultat.ok) {
        setNyKodeFeil(resultat.feil ?? "Noe gikk galt");
        return;
      }
      const brukteKode = nyKode.trim();
      let visLagerId = nyKodeLagerId;
      let visLagerNavn = lagre.find((l) => l.id === nyKodeLagerId)?.navn ?? "";
      if (nyKodeLagerId === "__nytt__") {
        visLagerId = crypto.randomUUID();
        visLagerNavn = nyKodeNyttNavn.trim();
        setLagre((prev) => [...prev, { id: visLagerId, navn: visLagerNavn, opprettet: new Date().toISOString() }]);
      }
      setKoder((prev) => [
        {
          id: crypto.randomUUID(),
          kode: brukteKode,
          navn: nyKodeNavn.trim() || null,
          aktiv: true,
          opprettet: new Date().toISOString(),
          lager_id: visLagerId,
          lager_navn: visLagerNavn,
        },
        ...prev,
      ]);
      setNyKode("");
      setNyKodeNavn("");
      setNyKodeNyttNavn("");
    });
  }

  function handleTilbakekall(id: string) {
    startTransition(async () => {
      const resultat = await tilbakekallKode(id);
      if (resultat.ok) {
        setKoder((prev) => prev.map((k) => (k.id === id ? { ...k, aktiv: false } : k)));
      }
    });
  }

  async function kopier(tekst: string) {
    try {
      await navigator.clipboard.writeText(tekst);
    } catch {
      // Utilgjengelig utklippstavle (f.eks. usikker kontekst) — ikke kritisk.
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Admin</h1>
        <form action={loggUtAdmin}>
          <button
            type="submit"
            className="flex h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-medium text-foreground-muted"
          >
            <LogOut className="h-4 w-4" />
            Logg ut
          </button>
        </form>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-foreground">
          Ventende forespørsler {ventende.length > 0 && `(${ventende.length})`}
        </h2>
        {ventende.length === 0 ? (
          <p className="text-sm text-foreground-muted">Ingen ventende forespørsler.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {ventende.map((f) => (
              <div key={f.id} className="rounded-2xl bg-surface px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-medium text-foreground">{f.navn}</p>
                    {f.melding && <p className="truncate text-sm text-foreground-muted">{f.melding}</p>}
                    <p className="text-xs text-foreground-muted">{formaterDato(f.opprettet)}</p>
                  </div>
                  {godkjennApen !== f.id && (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => apneGodkjenning(f.id)}
                        aria-label={`Godkjenn ${f.navn}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground disabled:opacity-60"
                      >
                        <Check className="h-4.5 w-4.5" />
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleAvvis(f.id)}
                        aria-label={`Avvis ${f.navn}`}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-danger/30 text-danger disabled:opacity-60"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </>
                  )}
                </div>

                {godkjennApen === f.id && (
                  <form onSubmit={(e) => handleGodkjenn(e, f)} className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                    <label className="text-sm font-medium text-foreground-muted">Kode {f.navn} skal bruke</label>
                    <input
                      value={godkjennKode}
                      onChange={(e) => setGodkjennKode(e.target.value)}
                      autoFocus
                      placeholder="F.eks. 131224"
                      className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                    <label className="text-sm font-medium text-foreground-muted">Kjøkken</label>
                    <LagerFelt
                      lagre={lagre}
                      lagerId={godkjennLagerId}
                      onLagerIdChange={setGodkjennLagerId}
                      nyttNavn={godkjennNyttNavn}
                      onNyttNavnChange={setGodkjennNyttNavn}
                    />
                    {godkjennFeil && <p className="text-sm text-danger">{godkjennFeil}</p>}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={pending}
                        className="h-11 flex-1 rounded-2xl bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-60"
                      >
                        Bekreft godkjenning
                      </button>
                      <button
                        type="button"
                        onClick={() => setGodkjennApen(null)}
                        className="h-11 rounded-2xl border border-border px-4 text-sm font-medium text-foreground-muted"
                      >
                        Avbryt
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-foreground">Opprett kode manuelt</h2>
        <form onSubmit={handleOpprettKode} className="flex flex-col gap-2 rounded-2xl bg-surface p-4">
          <label className="text-sm font-medium text-foreground-muted">Kode</label>
          <input
            value={nyKode}
            onChange={(e) => setNyKode(e.target.value)}
            placeholder="F.eks. 131224"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <label className="text-sm font-medium text-foreground-muted">Navn/merkelapp (valgfritt)</label>
          <input
            value={nyKodeNavn}
            onChange={(e) => setNyKodeNavn(e.target.value)}
            placeholder="F.eks. Kari"
            className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <label className="text-sm font-medium text-foreground-muted">Kjøkken</label>
          <LagerFelt
            lagre={lagre}
            lagerId={nyKodeLagerId}
            onLagerIdChange={setNyKodeLagerId}
            nyttNavn={nyKodeNyttNavn}
            onNyttNavnChange={setNyKodeNyttNavn}
          />
          {nyKodeFeil && <p className="text-sm text-danger">{nyKodeFeil}</p>}
          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-2xl bg-accent text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            Opprett
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-foreground">Aktive koder</h2>
        {koder.filter((k) => k.aktiv).length === 0 ? (
          <p className="text-sm text-foreground-muted">Ingen aktive koder.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {koder
              .filter((k) => k.aktiv)
              .map((k) => (
                <div key={k.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold tracking-widest text-foreground">{k.kode}</p>
                      <button
                        type="button"
                        onClick={() => kopier(k.kode)}
                        aria-label={`Kopier ${k.kode}`}
                        className="text-foreground-muted"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="truncate text-sm text-foreground-muted">
                      {k.navn ?? "Uten merkelapp"} · {k.lager_navn}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleTilbakekall(k.id)}
                    aria-label={`Tilbakekall kode for ${k.navn ?? k.kode}`}
                    className="flex h-10 items-center gap-1.5 rounded-full border border-danger/30 px-3 text-sm font-medium text-danger disabled:opacity-60"
                  >
                    <Ban className="h-4 w-4" />
                    Tilbakekall
                  </button>
                </div>
              ))}
          </div>
        )}
      </section>

      {historikk.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-semibold text-foreground">Historikk</h2>
          <div className="flex flex-col gap-2">
            {historikk.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3 opacity-70">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-foreground">{f.navn}</p>
                  <p className="text-xs text-foreground-muted">{formaterDato(f.opprettet)}</p>
                </div>
                <span className="text-sm text-foreground-muted">
                  {f.status === "godkjent" ? `Godkjent (${f.generert_kode})` : "Avvist"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
