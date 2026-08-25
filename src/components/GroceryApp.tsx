"use client";

import { useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import * as actions from "@/app/actions";
import * as middagsplanActions from "@/app/middagsplan-actions";
import { kjopFraHandleliste, type KjopInput } from "@/app/handleliste-actions";
import type { Enhet, HandlelisteEntry, KategoriModel, PlanlagtIngrediens, VareMedKategori } from "@/lib/types";
import SearchBar from "./SearchBar";
import CategoryChips from "./CategoryChips";
import CategorySection from "./CategorySection";
import Fab from "./Fab";
import HandlelisteKnapp from "./HandlelisteKnapp";
import HandlelisteVisning from "./HandlelisteVisning";
import TomtKnapp from "./TomtKnapp";
import TomtVisning from "./TomtVisning";
import MiddagsplanKnapp from "./MiddagsplanKnapp";
import MiddagsplanSheet from "./MiddagsplanSheet";
import ItemSheet, { type SheetTilstand } from "./ItemSheet";

type Props = {
  initialKategorier: KategoriModel[];
  initialVarer: VareMedKategori[];
  initialMiddagsplan: PlanlagtIngrediens[];
};

type Visning = "alle" | "handleliste" | "tomt";

function rund(n: number) {
  return Math.round(n * 100) / 100;
}

export default function GroceryApp({ initialKategorier, initialVarer, initialMiddagsplan }: Props) {
  const [kategorier] = useState<KategoriModel[]>(initialKategorier);
  const [varer, setVarer] = useState<VareMedKategori[]>(initialVarer);
  const [middagsplan, setMiddagsplan] = useState<PlanlagtIngrediens[]>(initialMiddagsplan);
  const [sok, setSok] = useState("");
  const [valgteKategorier, setValgteKategorier] = useState<Set<string>>(new Set());
  const [visning, setVisning] = useState<Visning>("alle");
  const [middagsplanApen, setMiddagsplanApen] = useState(false);
  const [sheet, setSheet] = useState<SheetTilstand>({
    apen: false,
    modus: "legg-til",
    token: 0,
  });

  // Tomme varer (mengde <= 0) vises kun under "Tomt", ikke i den vanlige oversikten.
  const filtrerteVarer = useMemo(() => {
    const sokLav = sok.trim().toLowerCase();
    return varer.filter((v) => {
      const matcherSok = sokLav === "" || v.navn.toLowerCase().includes(sokLav);
      const matcherKategori = valgteKategorier.size === 0 || valgteKategorier.has(v.kategoriId);
      return matcherSok && matcherKategori && v.mengde > 0;
    });
  }, [varer, sok, valgteKategorier]);

  const grupper = useMemo(() => {
    return kategorier
      .map((kategori) => ({
        kategori,
        varer: filtrerteVarer
          .filter((v) => v.kategoriId === kategori.id)
          .sort((a, b) => a.navn.localeCompare(b.navn, "no")),
      }))
      .filter((gruppe) => gruppe.varer.length > 0);
  }, [kategorier, filtrerteVarer]);

  // Tomt: varer som rett og slett har gått tom (mengde <= 0) – ren lagerstatus,
  // uavhengig av handleliste/middagsplan.
  const tomtEntries = useMemo<HandlelisteEntry[]>(
    () =>
      varer
        .filter((v) => v.mengde <= 0)
        .map((v) => ({
          id: v.id,
          navn: v.navn,
          mengdeAaKjope: 0,
          enhet: v.enhet,
          kategori: v.kategori,
          fraMiddagsplan: false,
          vareId: v.id,
          planIder: [],
        })),
    [varer]
  );

  // Handleliste: det middagsplanen sier mangler utover det du har, pluss varer du
  // manuelt har lagt til med "Legg til i handleliste". Flere middagsplan-rader mot
  // samme vare (f.eks. to middager som begge trenger pasta) summeres. Et manuelt
  // flagg overstyres av et konkret planbehov for samme vare (mer nyttig info).
  const handlelisteEntries = useMemo(() => {
    const manuelt = new Map<string, HandlelisteEntry>();
    for (const v of varer) {
      if (v.paHandleliste) {
        manuelt.set(v.id, {
          id: v.id,
          navn: v.navn,
          mengdeAaKjope: v.paHandlelisteMengde ?? 0,
          enhet: v.enhet,
          kategori: v.kategori,
          fraMiddagsplan: false,
          vareId: v.id,
          planIder: [],
        });
      }
    }

    const planPerVare = new Map<string, PlanlagtIngrediens[]>();
    for (const rad of middagsplan) {
      if (!rad.vareId) continue;
      const liste = planPerVare.get(rad.vareId) ?? [];
      liste.push(rad);
      planPerVare.set(rad.vareId, liste);
    }

    const fraPlan = new Map<string, HandlelisteEntry>();
    for (const [vareId, rader] of planPerVare) {
      const vare = varer.find((v) => v.id === vareId);
      if (!vare) continue;
      const totaltBehov = rader.reduce((sum, r) => sum + r.mengde, 0);
      const mangler = Math.max(0, rund(totaltBehov - vare.mengde));
      if (mangler > 0) {
        fraPlan.set(vare.id, {
          id: vare.id,
          navn: vare.navn,
          mengdeAaKjope: mangler,
          enhet: vare.enhet,
          kategori: vare.kategori,
          fraMiddagsplan: true,
          vareId: vare.id,
          planIder: rader.map((r) => r.id),
        });
      }
    }
    for (const rad of middagsplan) {
      if (rad.vareId) continue;
      fraPlan.set(`plan-${rad.id}`, {
        id: `plan-${rad.id}`,
        navn: rad.navn,
        mengdeAaKjope: rad.mengde,
        enhet: rad.enhet,
        kategori: null,
        fraMiddagsplan: true,
        vareId: null,
        planIder: [rad.id],
      });
    }

    const samlet = new Map(manuelt);
    for (const [id, entry] of fraPlan) samlet.set(id, entry);
    return Array.from(samlet.values());
  }, [varer, middagsplan]);

  function grupperEtterKategori(entries: HandlelisteEntry[]) {
    return kategorier
      .map((kategori) => ({
        kategori,
        entries: entries
          .filter((e) => e.kategori?.id === kategori.id)
          .sort((a, b) => a.navn.localeCompare(b.navn, "no")),
      }))
      .filter((gruppe) => gruppe.entries.length > 0);
  }

  function filtrer(entries: HandlelisteEntry[]) {
    const sokLav = sok.trim().toLowerCase();
    return entries.filter((e) => {
      const matcherSok = sokLav === "" || e.navn.toLowerCase().includes(sokLav);
      const matcherKategori =
        valgteKategorier.size === 0 || (e.kategori !== null && valgteKategorier.has(e.kategori.id));
      return matcherSok && matcherKategori;
    });
  }

  const filtrerteHandlelisteEntries = filtrer(handlelisteEntries);
  const filtrerteTomtEntries = filtrer(tomtEntries);

  const middagsvarer = filtrerteHandlelisteEntries.filter((e) => e.fraMiddagsplan);
  const manueltLagtTil = filtrerteHandlelisteEntries.filter((e) => !e.fraMiddagsplan);

  const middagsvarerGrupper = grupperEtterKategori(middagsvarer);
  const middagsvarerNye = middagsvarer
    .filter((e) => e.kategori === null)
    .sort((a, b) => a.navn.localeCompare(b.navn, "no"));
  const manueltGrupper = grupperEtterKategori(manueltLagtTil);
  const manueltNye = manueltLagtTil
    .filter((e) => e.kategori === null)
    .sort((a, b) => a.navn.localeCompare(b.navn, "no"));

  const tomtGrupper = grupperEtterKategori(filtrerteTomtEntries);

  function toggleKategori(id: string) {
    setValgteKategorier((prev) => {
      const neste = new Set(prev);
      if (neste.has(id)) neste.delete(id);
      else neste.add(id);
      return neste;
    });
  }

  async function handleEndreMengde(id: string, delta: number) {
    const forrige = varer;
    setVarer((prev) =>
      prev.map((v) => (v.id === id ? { ...v, mengde: Math.max(0, v.mengde + delta) } : v))
    );
    try {
      const oppdatert = await actions.endreMengde(id, delta);
      setVarer((prev) => prev.map((v) => (v.id === id ? oppdatert : v)));
    } catch {
      setVarer(forrige);
    }
  }

  async function handleSettMengde(id: string, mengde: number) {
    const forrige = varer;
    const trygMengde = Math.max(0, mengde);
    setVarer((prev) => prev.map((v) => (v.id === id ? { ...v, mengde: trygMengde } : v)));
    try {
      const oppdatert = await actions.settMengde(id, trygMengde);
      setVarer((prev) => prev.map((v) => (v.id === id ? oppdatert : v)));
    } catch {
      setVarer(forrige);
    }
  }

  async function handleTogglePaHandleliste(id: string, verdi: boolean, mengde: number | null = null) {
    const forrige = varer;
    const nyMengde = verdi ? mengde : null;
    setVarer((prev) =>
      prev.map((v) => (v.id === id ? { ...v, paHandleliste: verdi, paHandlelisteMengde: nyMengde } : v))
    );
    try {
      const oppdatert = await actions.settPaHandleliste(id, verdi, nyMengde);
      setVarer((prev) => prev.map((v) => (v.id === id ? oppdatert : v)));
    } catch {
      setVarer(forrige);
    }
  }

  function handleFlyttTilHandleliste(entry: HandlelisteEntry, mengde: number) {
    if (entry.vareId) handleTogglePaHandleliste(entry.vareId, true, mengde > 0 ? mengde : null);
  }

  function handleFjernFraHandleliste(entry: HandlelisteEntry) {
    if (entry.fraMiddagsplan) {
      for (const id of entry.planIder) handleSlettIngrediens(id);
    } else if (entry.vareId) {
      handleTogglePaHandleliste(entry.vareId, false);
    }
  }

  function apneLeggTil() {
    setSheet((prev) => ({
      apen: true,
      modus: "legg-til",
      vare: undefined,
      tilHandleliste: visning === "handleliste",
      token: prev.token + 1,
    }));
  }

  function apneRediger(vare: VareMedKategori) {
    setSheet((prev) => ({ apen: true, modus: "rediger", vare, token: prev.token + 1 }));
  }

  function lukkSheet() {
    setSheet((prev) => ({ ...prev, apen: false }));
  }

  async function handleLagre(data: { navn: string; kategoriId: string; mengde: number; enhet: Enhet }) {
    if (sheet.modus === "legg-til") {
      if (sheet.tilHandleliste) {
        const ny = await actions.opprettVare({ ...data, mengde: 0 });
        const flagget = await actions.settPaHandleliste(ny.id, true, data.mengde > 0 ? data.mengde : null);
        setVarer((prev) => [...prev, flagget]);
      } else {
        const ny = await actions.opprettVare(data);
        setVarer((prev) => [...prev, ny]);
      }
    } else if (sheet.vare) {
      const oppdatert = await actions.oppdaterVare(sheet.vare.id, data);
      setVarer((prev) => prev.map((v) => (v.id === oppdatert.id ? oppdatert : v)));
    }
    lukkSheet();
  }

  async function handleSlett(id: string) {
    await actions.slettVare(id);
    setVarer((prev) => prev.filter((v) => v.id !== id));
    lukkSheet();
  }

  async function handleLeggTilIngrediens(data: { navn: string; vareId: string | null; mengde: number; enhet: Enhet }) {
    const ny = await middagsplanActions.leggTilIngrediens(data);
    setMiddagsplan((prev) => [...prev, ny]);
  }

  async function handleSlettIngrediens(id: string) {
    await middagsplanActions.slettIngrediens(id);
    setMiddagsplan((prev) => prev.filter((rad) => rad.id !== id));
  }

  async function handleKjop(entry: HandlelisteEntry, kjoptMengde: number, kategoriId: string | null) {
    const input: KjopInput = {
      vareId: entry.vareId,
      planIder: entry.planIder,
      navn: entry.navn,
      kategoriId: entry.kategori?.id ?? kategoriId,
      kjoptMengde,
      enhet: entry.enhet,
    };
    const vare = await kjopFraHandleliste(input);

    setVarer((prev) => (prev.some((v) => v.id === vare.id) ? prev.map((v) => (v.id === vare.id ? vare : v)) : [...prev, vare]));
    if (entry.planIder.length > 0) {
      setMiddagsplan((prev) => prev.filter((rad) => !entry.planIder.includes(rad.id)));
    }
  }

  const listeErTom =
    visning === "handleliste"
      ? middagsvarerGrupper.length === 0 && middagsvarerNye.length === 0 && manueltGrupper.length === 0
      : visning === "tomt"
        ? tomtGrupper.length === 0
        : grupper.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      <header className="safe-top sticky top-0 z-20 flex flex-col gap-3 bg-background/95 pb-3 pt-4 backdrop-blur-sm">
        <h1 className="px-4 text-2xl font-semibold tracking-tight text-foreground">Dagligvarer</h1>
        <div className="px-4">
          <SearchBar verdi={sok} onEndre={setSok} />
        </div>
        <div className="flex flex-wrap gap-2 px-4">
          <HandlelisteKnapp
            aktiv={visning === "handleliste"}
            antallTomme={handlelisteEntries.length}
            onToggle={() => setVisning((v) => (v === "handleliste" ? "alle" : "handleliste"))}
          />
          <TomtKnapp
            aktiv={visning === "tomt"}
            antall={tomtEntries.length}
            onToggle={() => setVisning((v) => (v === "tomt" ? "alle" : "tomt"))}
          />
          <MiddagsplanKnapp antall={middagsplan.length} onClick={() => setMiddagsplanApen(true)} />
        </div>
        <CategoryChips
          kategorier={kategorier}
          valgte={valgteKategorier}
          onToggle={toggleKategori}
          onNullstill={() => setValgteKategorier(new Set())}
        />
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 pb-28 pt-2">
        {listeErTom ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <PackageSearch className="h-10 w-10 text-foreground-muted" strokeWidth={1.5} />
            <p className="text-sm text-foreground-muted">
              {varer.length === 0
                ? "Ingen varer registrert ennå"
                : visning === "handleliste"
                  ? "Ingenting på handlelisten akkurat nå"
                  : visning === "tomt"
                    ? "Ingenting er tomt for akkurat nå"
                    : "Fant ingen varer som matcher"}
            </p>
          </div>
        ) : visning === "handleliste" ? (
          <HandlelisteVisning
            middagsvarerGrupper={middagsvarerGrupper}
            middagsvarerNye={middagsvarerNye}
            manueltGrupper={manueltGrupper}
            manueltNye={manueltNye}
            kategorier={kategorier}
            onKjop={handleKjop}
            onFjern={handleFjernFraHandleliste}
          />
        ) : visning === "tomt" ? (
          <TomtVisning
            grupper={tomtGrupper}
            kategorier={kategorier}
            onKjop={handleKjop}
            onFlytt={handleFlyttTilHandleliste}
          />
        ) : (
          grupper.map(({ kategori, varer: varerIKategori }) => (
            <CategorySection
              key={kategori.id}
              kategori={kategori}
              varer={varerIKategori}
              onEndreMengde={handleEndreMengde}
              onSettMengde={handleSettMengde}
              onApneVare={apneRediger}
              onTogglePaHandleliste={handleTogglePaHandleliste}
            />
          ))
        )}
      </main>

      <Fab onClick={apneLeggTil} />

      <ItemSheet
        tilstand={sheet}
        kategorier={kategorier}
        onLukk={lukkSheet}
        onLagre={handleLagre}
        onSlett={handleSlett}
      />

      <MiddagsplanSheet
        apen={middagsplanApen}
        varer={varer}
        middagsplan={middagsplan}
        onLukk={() => setMiddagsplanApen(false)}
        onLeggTil={handleLeggTilIngrediens}
        onSlett={handleSlettIngrediens}
      />
    </div>
  );
}
