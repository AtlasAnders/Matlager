"use client";

import { PackagePlus } from "lucide-react";
import { IKON_KART, STANDARD_IKON } from "@/lib/category-icons";
import { ENHET_LABELS, type HandlelisteEntry, type KategoriModel } from "@/lib/types";

type Gruppe = { kategori: KategoriModel; entries: HandlelisteEntry[] };

type Props = {
  middagsvarerGrupper: Gruppe[];
  middagsvarerNye: HandlelisteEntry[];
  ovrigeGrupper: Gruppe[];
};

function Rad({ entry }: { entry: HandlelisteEntry }) {
  const Ikon = entry.kategori ? IKON_KART[entry.kategori.ikon] ?? STANDARD_IKON : PackagePlus;
  const farge = entry.kategori?.farge ?? "var(--foreground-muted)";

  return (
    <div className="flex w-full items-center gap-3 rounded-2xl bg-surface px-3 py-2.5">
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

function Seksjon({ tittel, grupper, nyeVarer }: { tittel: string; grupper: Gruppe[]; nyeVarer: HandlelisteEntry[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="px-1 text-lg font-bold tracking-tight text-foreground">{tittel}</h1>

      {grupper.map(({ kategori, entries }) => (
        <section key={kategori.id}>
          <GruppeHeader kategori={kategori} />
          <div className="flex flex-col gap-1.5">
            {entries.map((entry) => (
              <Rad key={entry.id} entry={entry} />
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
              <Rad key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function HandlelisteVisning({ middagsvarerGrupper, middagsvarerNye, ovrigeGrupper }: Props) {
  const harMiddagsvarer = middagsvarerGrupper.length > 0 || middagsvarerNye.length > 0;
  const harOvrige = ovrigeGrupper.length > 0;

  return (
    <div className="flex flex-col gap-8">
      {harMiddagsvarer && (
        <Seksjon tittel="Middagsvarer" grupper={middagsvarerGrupper} nyeVarer={middagsvarerNye} />
      )}
      {harOvrige && <Seksjon tittel="Øvrige tomme varer" grupper={ovrigeGrupper} nyeVarer={[]} />}
    </div>
  );
}
