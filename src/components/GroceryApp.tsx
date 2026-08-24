"use client";

import { useMemo, useState } from "react";
import { PackageSearch } from "lucide-react";
import * as actions from "@/app/actions";
import type { Enhet, KategoriModel, VareMedKategori } from "@/lib/types";
import SearchBar from "./SearchBar";
import CategoryChips from "./CategoryChips";
import CategorySection from "./CategorySection";
import Fab from "./Fab";
import ItemSheet, { type SheetTilstand } from "./ItemSheet";

type Props = {
  initialKategorier: KategoriModel[];
  initialVarer: VareMedKategori[];
};

export default function GroceryApp({ initialKategorier, initialVarer }: Props) {
  const [kategorier] = useState<KategoriModel[]>(initialKategorier);
  const [varer, setVarer] = useState<VareMedKategori[]>(initialVarer);
  const [sok, setSok] = useState("");
  const [valgteKategorier, setValgteKategorier] = useState<Set<string>>(new Set());
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

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col">
      <header className="safe-top sticky top-0 z-20 flex flex-col gap-3 bg-background/95 pb-3 pt-4 backdrop-blur-sm">
        <h1 className="px-4 text-2xl font-semibold tracking-tight text-foreground">Dagligvarer</h1>
        <div className="px-4">
          <SearchBar verdi={sok} onEndre={setSok} />
        </div>
        <CategoryChips
          kategorier={kategorier}
          valgte={valgteKategorier}
          onToggle={toggleKategori}
          onNullstill={() => setValgteKategorier(new Set())}
        />
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 pb-28 pt-2">
        {grupper.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <PackageSearch className="h-10 w-10 text-foreground-muted" strokeWidth={1.5} />
            <p className="text-sm text-foreground-muted">
              {varer.length === 0 ? "Ingen varer registrert ennå" : "Fant ingen varer som matcher"}
            </p>
          </div>
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
    </div>
  );
}
