"use client";

import { useState, useTransition } from "react";
import { KeyRound, Send } from "lucide-react";
import { verifiserKode, sendForesporsel } from "@/lib/access/visitor-actions";

export default function TilgangSkjema() {
  const [kode, setKode] = useState("");
  const [kodeFeil, setKodeFeil] = useState<string | null>(null);
  const [kodePending, startKodeTransition] = useTransition();

  const [visForesporsel, setVisForesporsel] = useState(false);
  const [navn, setNavn] = useState("");
  const [melding, setMelding] = useState("");
  const [foresporselFeil, setForesporselFeil] = useState<string | null>(null);
  const [foresporselSendt, setForesporselSendt] = useState(false);
  const [foresporselPending, startForesporselTransition] = useTransition();

  function handleKodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setKodeFeil(null);
    startKodeTransition(async () => {
      const resultat = await verifiserKode(kode);
      if (!resultat.ok) setKodeFeil(resultat.feil ?? "Noe gikk galt");
    });
  }

  function handleForesporselSubmit(e: React.FormEvent) {
    e.preventDefault();
    setForesporselFeil(null);
    startForesporselTransition(async () => {
      const resultat = await sendForesporsel(navn, melding);
      if (!resultat.ok) {
        setForesporselFeil(resultat.feil ?? "Noe gikk galt");
        return;
      }
      setForesporselSendt(true);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleKodeSubmit} className="flex flex-col gap-3">
        <label htmlFor="kode" className="text-sm font-medium text-foreground-muted">
          Tilgangskode
        </label>
        <div className="flex items-center gap-2">
          <input
            id="kode"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            placeholder="Skriv inn koden din"
            autoFocus
            className="h-12 flex-1 rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        {kodeFeil && <p className="text-sm text-danger">{kodeFeil}</p>}
        <button
          type="submit"
          disabled={kodePending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[15px] font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
        >
          <KeyRound className="h-4.5 w-4.5" />
          Lås opp
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-foreground-muted">eller</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {foresporselSendt ? (
        <p className="rounded-2xl bg-surface px-4 py-3 text-center text-sm text-foreground-muted">
          Forespørsel sendt. Du får beskjed når den er godkjent.
        </p>
      ) : visForesporsel ? (
        <form onSubmit={handleForesporselSubmit} className="flex flex-col gap-3">
          <label htmlFor="navn" className="text-sm font-medium text-foreground-muted">
            Navnet ditt
          </label>
          <input
            id="navn"
            value={navn}
            onChange={(e) => setNavn(e.target.value)}
            placeholder="F.eks. Kari"
            className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          <label htmlFor="melding" className="text-sm font-medium text-foreground-muted">
            Melding (valgfritt)
          </label>
          <input
            id="melding"
            value={melding}
            onChange={(e) => setMelding(e.target.value)}
            placeholder="F.eks. Er sønnen til Anders"
            className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
          {foresporselFeil && <p className="text-sm text-danger">{foresporselFeil}</p>}
          <button
            type="submit"
            disabled={foresporselPending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface text-[15px] font-semibold text-foreground transition-opacity disabled:opacity-60"
          >
            <Send className="h-4.5 w-4.5" />
            Send forespørsel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setVisForesporsel(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface text-[15px] font-medium text-foreground-muted"
        >
          Be om tilgang
        </button>
      )}
    </div>
  );
}
