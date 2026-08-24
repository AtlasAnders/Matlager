import type { Tables } from "./supabase/database.types";
import type { KategoriModel, VareMedKategori } from "./types";

type KategoriRow = Tables<"kategori">;
type VareRow = Tables<"vare">;

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
  };
}
