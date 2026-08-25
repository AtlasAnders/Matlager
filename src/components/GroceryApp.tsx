"use client";

import { useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import * as actions from "@/app/actions";
import * as middagsplanActions from "@/app/middagsplan-actions";
import type { Enhet, HandlelisteEntry, KategoriModel, PlanlagtIngrediens, VareMedKategori } from "@/lib/types";
import SearchBar from "./SearchBar";
import CategoryChips from "./CategoryChips";
import CategorySection from "./CategorySection";
import Fab from "./Fab";
import HandlelisteKnapp from "./HandlelisteKnapp";
import HandlelisteVisning from "./HandlelisteVisning";
import MiddagsplanKnapp from "./MiddagsplanKnapp";
import MiddagsplanSheet from "./MiddagsplanSheet";
import ItemSheet, { type SheetTilstand } from "./ItemSheet";

type Props = {
  initialKategorier: KategoriModel[];
  initialVarer: VareMedKategori[];
  initialMiddagsplan: PlanlagtIngrediens[];
};

function rund(n: number) {
  return Math.round(n * 100) / 100;
}

export default function GroceryApp({ initialKategorier, initialVarer, initialMiddagsplan }: Props) {
  const [kategorier] = useState<KategoriModel[]>(initialKategorier);
  const [varer, setVarer] = useState<VareMedKategori[]>(initialVarer);
  const [middagsplan, setMiddagsplan] = useState<PlanlagtIngrediens[]>(initialMiddagsplan);
  const [sok, setSok] = useState("");
  const [valgteKategorier, setValgteKategorier] = useState<Set<string>>(new Set());
  const [visKunTomme, setVisKunTomme] = useState(false);
  const [middagsplanApen, setMiddagsplanApen] = useState(false);
  const [sheet, setSheet] = useState<SheetTilstand>({
    apen: false,
    modus: "legg-til",
    token: 0,
  });

  const filtrerteVarer = useMemo(() => {
    const sokLav = sok.trim().toLowerCase();
    return varer.filter((v) => {
      const matcherSok = sokLav === "" || v.navn.toLowerCase().includes(sokLav);
      const matcherKategori = valgteKategorier.size === 0 || valgteKategorier.has(v.kategoriId);
      return matcherSok && matcherKategori;
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

  // Handleliste: tomme varer, pluss det middagsplanen sier mangler utover det du har.
  const handlelisteEntries = useMemo(() => {
    const map = new Map<string, HandlelisteEntry>();

    for (const v of varer) {
      if (v.mengde <= 0) {
        map.set(v.id, { id: v.id, navn: v.navn, mengdeAaKjope: 0, enhet: v.enhet, kategori: v.kategori });
      }
    }

    for (const rad of middagsplan) {
      if (rad.vareId) {
        const vare = varer.find((v) => v.id === rad.vareId);
        if (!vare) continue;
        const mangler = Math.max(0, rund(rad.mengde - vare.mengde));
        if (mangler > 0) {
          map.set(vare.id, { id: vare.id, navn: vare.navn, mengdeAaKjope: mangler, enhet: rad.enhet, kategori: vare.kategori });
        }
      } else {
        map.set(`plan-${rad.id}`, {
          id: `plan-${rad.id}`,
          navn: rad.navn,
          mengdeAaKjope: rad.mengde,
          enhet: rad.enhet,
          kategori: null,
        });
      }
    }

    return Array.from(map.values());
  }, [varer, middagsplan]);

  const filtrerteHandlelisteEntries = useMemo(() => {
    const sokLav = sok.trim().toLowerCase();
    return handlelisteEntries.filter((e) => {
      const matcherSok = sokLav === "" || e.navn.toLowerCase().includes(sokLav);
      const matcherKategori =
        valgteKategorier.size === 0 || (e.kategori !== null && valgteKategorier.has(e.kategori.id));
      return matcherSok && matcherKategori;
    });
  }, [handlelisteEntries, sok, valgteKategorier]);

  const handlelisteGrupper = useMemo(() => {
    return kategorier
      .map((kategori) => ({
        kategori,
        entries: filtrerteHandlelisteEntries
          .filter((e) => e.kategori?.id === kategori.id)
          .sort((a, b) => a.navn.localeCompare(b.navn, "no")),
      }))
      .filter((gruppe) => gruppe.entries.length > 0);
  }, [kategorier, filtrerteHandlelisteEntries]);

  const nyeVarerPaHandleliste = useMemo(
    () =>
      filtrerteHandlelisteEntries
        .filter((e) => e.kategori === null)
        .sort((a, b) => a.navn.localeCompare(b.navn, "no")),
    [filtrerteHandlelisteEntries]
  );

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

  function apneLeggTil() {
    setSheet((prev) => ({ apen: true, modus: "legg-til", vare: undefined, token: prev.token + 1 }));
  }

  function apneRediger(vare: VareMedKategori) {
    setSheet((prev) => ({ apen: true, modus: "rediger", vare, token: prev.token + 1 }));
  }

  function lukkSheet() {
    setSheet((prev) => ({ ...prev, apen: false }));
  }

  async function handleLagre(data: { navn: string; kategoriId: string; mengde: number; enhet: Enhet }) {
    if (sheet.modus === "legg-til") {
      const ny = await actions.opprettVare(data);
      setVarer((prev) => [...prev, ny]);
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

  const visHandleliste = visKunTomme;
  const listeErTom = visHandleliste
    ? handlelisteGrupper.length === 0 && nyeVarerPaHandleliste.length === 0
    : grupper.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      <header className="safe-top sticky top-0 z-20 flex flex-col gap-3 bg-background/95 pb-3 pt-4 backdrop-blur-sm">
        <h1 className="px-4 text-2xl font-semibold tracking-tight text-foreground">Dagligvarer</h1>
        <div className="px-4">
          <SearchBar verdi={sok} onEndre={setSok} />
        </div>
        <div className="flex gap-2 px-4">
          <HandlelisteKnapp
            aktiv={visKunTomme}
            antallTomme={handlelisteEntries.length}
            onToggle={() => setVisKunTomme((v) => !v)}
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
                : visHandleliste
                  ? "Ingenting er tomt for akkurat nå"
                  : "Fant ingen varer som matcher"}
            </p>
          </div>
        ) : visHandleliste ? (
          <HandlelisteVisning grupper={handlelisteGrupper} nyeVarer={nyeVarerPaHandleliste} />
        ) : (
          grupper.map(({ kategori, varer: varerIKategori }) => (
            <CategorySection
              key={kategori.id}
              kategori={kategori}
              varer={varerIKategori}
              onEndreMengde={handleEndreMengde}
              onSettMengde={handleSettMengde}
              onApneVare={apneRediger}
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
