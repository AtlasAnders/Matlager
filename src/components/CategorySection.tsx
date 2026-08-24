"use client";

import { IKON_KART, STANDARD_IKON } from "@/lib/category-icons";
import type { KategoriModel, VareMedKategori } from "@/lib/types";
import ItemRow from "./ItemRow";

type Props = {
  kategori: KategoriModel;
  varer: VareMedKategori[];
  onEndreMengde: (id: string, delta: number) => void;
  onSettMengde: (id: string, mengde: number) => void;
  onApneVare: (vare: VareMedKategori) => void;
};

export default function CategorySection({
  kategori,
  varer,
  onEndreMengde,
  onSettMengde,
  onApneVare,
}: Props) {
  const Ikon = IKON_KART[kategori.ikon] ?? STANDARD_IKON;
  const antallTomme = varer.filter((v) => v.mengde <= 0).length;

  return (
    <section>
      <div className="mb-2 flex items-center gap-2 px-1">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: kategori.farge }}
        >
          <Ikon className="h-4 w-4 text-surface-strong" strokeWidth={2.25} />
        </div>
        <h2 className="text-[15px] font-semibold text-foreground">{kategori.navn}</h2>
        <span className="text-xs text-foreground-muted">
          {varer.length} {varer.length === 1 ? "vare" : "varer"}
          {antallTomme > 0 ? ` · ${antallTomme} tom for` : ""}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        {varer.map((vare) => (
          <ItemRow
            key={vare.id}
            vare={vare}
            onEndreMengde={onEndreMengde}
            onSettMengde={onSettMengde}
            onApne={onApneVare}
          />
        ))}
      </div>
    </section>
  );
}
