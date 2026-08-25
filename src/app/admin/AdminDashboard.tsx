"use client";

import { useState, useTransition } from "react";
import { Check, X, LogOut, Copy, Ban, Plus } from "lucide-react";
import {
  godkjennForesporsel,
  avvisForesporsel,
  opprettKode,
  tilbakekallKode,
  loggUtAdmin,
  type Tilgangsforesporsel,
  type Tilgangskode,
} from "@/lib/access/admin-actions";

type Props = {
  initialForesporsler: Tilgangsforesporsel[];
  initialKoder: Tilgangskode[];
};

function formaterDato(iso: string) {
  return new Date(iso).toLocaleString("no", { dateStyle: "short", timeStyle: "short" });
}

export default function AdminDashboard({ initialForesporsler, initialKoder }: Props) {
  const [foresporsler, setForesporsler] = useState(initialForesporsler);
  const [koder, setKoder] = useState(initialKoder);
  const [nyKodeNavn, setNyKodeNavn] = useState("");
  const [sistGenererteKode, setSistGenererteKode] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ventende = foresporsler.filter((f) => f.status === "ny");
  const historikk = foresporsler.filter((f) => f.status !== "ny");

  function handleGodkjenn(id: string) {
    startTransition(async () => {
      const resultat = await godkjennForesporsel(id);
      if (resultat.ok && resultat.kode) {
        setSistGenererteKode(resultat.kode);
        setForesporsler((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: "godkjent", generert_kode: resultat.kode! } : f))
        );
        setKoder((prev) => [
          { id: crypto.randomUUID(), kode: resultat.kode!, navn: foresporsler.find((f) => f.id === id)?.navn ?? null, aktiv: true, opprettet: new Date().toISOString() },
          ...prev,
        ]);
      }
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
    startTransition(async () => {
      const resultat = await opprettKode(nyKodeNavn);
      if (resultat.ok && resultat.kode) {
        setSistGenererteKode(resultat.kode);
        setKoder((prev) => [
          { id: crypto.randomUUID(), kode: resultat.kode!, navn: nyKodeNavn.trim() || null, aktiv: true, opprettet: new Date().toISOString() },
          ...prev,
        ]);
        setNyKodeNavn("");
      }
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

      {sistGenererteKode && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-accent/15 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Ny kode generert</p>
            <p className="text-lg font-semibold tracking-widest text-foreground">{sistGenererteKode}</p>
          </div>
          <button
            type="button"
            onClick={() => kopier(sistGenererteKode)}
            className="flex h-10 items-center gap-1.5 rounded-full bg-accent px-3 text-sm font-medium text-accent-foreground"
          >
            <Copy className="h-4 w-4" />
            Kopier
          </button>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-foreground">
          Ventende forespørsler {ventende.length > 0 && `(${ventende.length})`}
        </h2>
        {ventende.length === 0 ? (
          <p className="text-sm text-foreground-muted">Ingen ventende forespørsler.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {ventende.map((f) => (
              <div key={f.id} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-foreground">{f.navn}</p>
                  {f.melding && <p className="truncate text-sm text-foreground-muted">{f.melding}</p>}
                  <p className="text-xs text-foreground-muted">{formaterDato(f.opprettet)}</p>
                </div>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleGodkjenn(f.id)}
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
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-[15px] font-semibold text-foreground">Opprett kode manuelt</h2>
        <form onSubmit={handleOpprettKode} className="flex items-center gap-2">
          <input
            value={nyKodeNavn}
            onChange={(e) => setNyKodeNavn(e.target.value)}
            placeholder="Navn/merkelapp (valgfritt)"
            className="h-11 flex-1 rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="submit"
            disabled={pending}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
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
                    <p className="text-[15px] font-semibold tracking-widest text-foreground">{k.kode}</p>
                    <p className="truncate text-sm text-foreground-muted">{k.navn ?? "Uten merkelapp"}</p>
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
