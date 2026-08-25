"use client";

import { PackagePlus } from "lucide-react";
import { HandleRad, HandleGruppeHeader, type OnKjop } from "./HandleRad";
import type { HandlelisteEntry, KategoriModel } from "@/lib/types";

type Gruppe = { kategori: KategoriModel; entries: HandlelisteEntry[] };

type Props = {
  middagsvarerGrupper: Gruppe[];
  middagsvarerNye: HandlelisteEntry[];
  manueltGrupper: Gruppe[];
  manueltNye: HandlelisteEntry[];
  kategorier: KategoriModel[];
  onKjop: OnKjop;
};

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
  onKjop: OnKjop;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="px-1 text-lg font-bold tracking-tight text-foreground">{tittel}</h1>

      {grupper.map(({ kategori, entries }) => (
        <section key={kategori.id}>
          <HandleGruppeHeader kategori={kategori} />
          <div className="flex flex-col gap-1.5">
            {entries.map((entry) => (
              <HandleRad key={entry.id} entry={entry} kategorier={kategorier} onKjop={onKjop} />
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
              <HandleRad key={entry.id} entry={entry} kategorier={kategorier} onKjop={onKjop} />
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
  manueltGrupper,
  manueltNye,
  kategorier,
  onKjop,
}: Props) {
  const harMiddagsvarer = middagsvarerGrupper.length > 0 || middagsvarerNye.length > 0;
  const harManuelt = manueltGrupper.length > 0 || manueltNye.length > 0;

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
      {harManuelt && (
        <Seksjon
          tittel="Lagt til manuelt"
          grupper={manueltGrupper}
          nyeVarer={manueltNye}
          kategorier={kategorier}
          onKjop={onKjop}
        />
      )}
    </div>
  );
}
