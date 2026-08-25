"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { mapVare } from "@/lib/mappers";
import { kreverAktivLager } from "@/lib/access/session";
import type { Enhet } from "@/lib/types";

function rund(n: number) {
  return Math.round(n * 100) / 100;
}

export type KjopInput = {
  vareId: string | null;
  planIder: string[];
  navn: string;
  kategoriId: string | null;
  kjoptMengde: number;
  enhet: Enhet;
};

/**
 * Kjøper inn en handleliste-rad: legger mengden til en eksisterende vare
 * (eller oppretter en ny), og fjerner middagsplan-radene den stammer fra.
 */
export async function kjopFraHandleliste(input: KjopInput) {
  if (input.kjoptMengde <= 0) throw new Error("Skriv inn en gyldig mengde");

  const lagerId = await kreverAktivLager();
  const supabase = await createClient();

  let vare;
  if (input.vareId) {
    const { data: eksisterende, error: hentError } = await supabase
      .from("vare")
      .select("mengde")
      .eq("id", input.vareId)
      .eq("lager_id", lagerId)
      .single();
    if (hentError) throw hentError;

    const nyMengde = rund(Number(eksisterende.mengde) + input.kjoptMengde);
    const { data, error } = await supabase
      .from("vare")
      .update({ mengde: nyMengde })
      .eq("id", input.vareId)
      .eq("lager_id", lagerId)
      .select("*, kategori(*)")
      .single();
    if (error) throw error;
    vare = mapVare(data);
  } else {
    if (!input.kategoriId) throw new Error("Velg en kategori");
    const { data, error } = await supabase
      .from("vare")
      .insert({
        navn: input.navn,
        kategori_id: input.kategoriId,
        mengde: rund(input.kjoptMengde),
        enhet: input.enhet,
        lager_id: lagerId,
      })
      .select("*, kategori(*)")
      .single();
    if (error) throw error;
    vare = mapVare(data);
  }

  if (input.planIder.length > 0) {
    const { error } = await supabase
      .from("middag_ingrediens")
      .delete()
      .eq("lager_id", lagerId)
      .in("id", input.planIder);
    if (error) throw error;
  }

  revalidatePath("/");
  return vare;
}
