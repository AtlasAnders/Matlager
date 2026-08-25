import type { Database } from "./supabase/database.types";

export type Enhet = Database["public"]["Enums"]["enhet"];

export type KategoriModel = {
  id: string;
  navn: string;
  ikon: string;
  farge: string;
  rekkefolge: number;
};

export type VareMedKategori = {
  id: string;
  navn: string;
  kategoriId: string;
  mengde: number;
  enhet: Enhet;
  sistOppdatert: string;
  kategori: KategoriModel;
  paHandleliste: boolean;
  paHandlelisteMengde: number | null;
};

export type PlanlagtIngrediens = {
  id: string;
  navn: string;
  vareId: string | null;
  mengde: number;
  enhet: Enhet;
  opprettet: string;
};

/** En rad på handlelisten: enten manuelt lagt til uten et spesifikt mål
 * (mengdeAaKjope 0), eller et konkret behov utledet fra middagsplanen
 * (mengdeAaKjope > 0). Rene "tom for"-varer uten plan/manuelt flagg vises
 * i stedet under "Tomt", ikke her. */
export type HandlelisteEntry = {
  id: string;
  navn: string;
  mengdeAaKjope: number;
  enhet: Enhet;
  kategori: KategoriModel | null;
  fraMiddagsplan: boolean;
  /** Finnes fra før i lageret (og skal oppdateres), eller null for en helt ny vare. */
  vareId: string | null;
  /** Middagsplan-radene denne oppføringen stammer fra – slettes når varen kjøpes inn. */
  planIder: string[];
};

export const ENHET_LABELS: Record<Enhet, string> = {
  stk: "stk",
  kg: "kg",
  g: "g",
  l: "l",
  dl: "dl",
  ml: "ml",
  pakke: "pakke",
  boks: "boks",
  pose: "pose",
};

export const ENHET_LISTE = Object.keys(ENHET_LABELS) as Enhet[];
