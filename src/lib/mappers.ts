import type { Tables } from "./supabase/database.types";
import type { KategoriModel, PlanlagtIngrediens, VareMedKategori } from "./types";

type KategoriRow = Tables<"kategori">;
type VareRow = Tables<"vare">;
type MiddagIngrediensRow = Tables<"middag_ingrediens">;

export function mapKategori(row: KategoriRow): KategoriModel {
  return {
    id: row.id,
    navn: row.navn,
    ikon: row.ikon,
    farge: row.farge,
    rekkefolge: row.rekkefolge,
  };
}

export function mapVare(row: VareRow & { kategori: KategoriRow }): VareMedKategori {
  return {
    id: row.id,
    navn: row.navn,
    kategoriId: row.kategori_id,
    mengde: Number(row.mengde),
    enhet: row.enhet,
    sistOppdatert: row.sist_oppdatert,
    kategori: mapKategori(row.kategori),
    paHandleliste: row.pa_handleliste,
    paHandlelisteMengde: row.pa_handleliste_mengde === null ? null : Number(row.pa_handleliste_mengde),
  };
}

export function mapPlanlagtIngrediens(row: MiddagIngrediensRow): PlanlagtIngrediens {
  return {
    id: row.id,
    navn: row.navn,
    vareId: row.vare_id,
    mengde: Number(row.mengde),
    enhet: row.enhet,
    opprettet: row.opprettet,
  };
}
