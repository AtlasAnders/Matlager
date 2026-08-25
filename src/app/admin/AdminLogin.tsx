"use client";

import { useState, useTransition } from "react";
import { LogIn } from "lucide-react";
import { loggInnAdmin } from "@/lib/access/admin-actions";

export default function AdminLogin() {
  const [kode, setKode] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);
    startTransition(async () => {
      const resultat = await loggInnAdmin(kode);
      if (!resultat.ok) setFeil(resultat.feil ?? "Noe gikk galt");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="admin-kode" className="text-sm font-medium text-foreground-muted">
        Admin-kode
      </label>
      <input
        id="admin-kode"
        type="password"
        value={kode}
        onChange={(e) => setKode(e.target.value)}
        autoFocus
        className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      {feil && <p className="text-sm text-danger">{feil}</p>}
      <button
        type="submit"
        disabled={pending}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-accent text-[15px] font-semibold text-accent-foreground transition-opacity disabled:opacity-60"
      >
        <LogIn className="h-4.5 w-4.5" />
        Logg inn
      </button>
    </form>
  );
}
