import type { VareModel } from "@/generated/prisma/models/Vare";
import type { KategoriModel } from "@/generated/prisma/models/Kategori";
import { Enhet } from "@/generated/prisma/enums";

export type { Enhet };

export type VareMedKategori = VareModel & { kategori: KategoriModel };
export type { KategoriModel };

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
