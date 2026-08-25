"use client";

import { HandleRad, HandleGruppeHeader, type OnKjop } from "./HandleRad";
import type { HandlelisteEntry, KategoriModel } from "@/lib/types";

type Gruppe = { kategori: KategoriModel; entries: HandlelisteEntry[] };

type Props = {
  grupper: Gruppe[];
  kategorier: KategoriModel[];
  onKjop: OnKjop;
  onFlytt: (entry: HandlelisteEntry, mengde: number) => void;
};

export default function TomtVisning({ grupper, kategorier, onKjop, onFlytt }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {grupper.map(({ kategori, entries }) => (
        <section key={kategori.id}>
          <HandleGruppeHeader kategori={kategori} />
          <div className="flex flex-col gap-1.5">
            {entries.map((entry) => (
              <HandleRad
                key={entry.id}
                entry={entry}
                kategorier={kategorier}
                onKjop={onKjop}
                onFlytt={onFlytt}
                visningstype="tomt"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
