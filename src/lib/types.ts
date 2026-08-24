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
