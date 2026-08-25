"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { mapPlanlagtIngrediens } from "@/lib/mappers";
import { kreverAktivLager } from "@/lib/access/session";
import type { Enhet } from "@/lib/types";

export type PlanlagtIngrediensInput = {
  navn: string;
  vareId: string | null;
  mengde: number;
  enhet: Enhet;
};

function rund(n: number) {
  return Math.round(n * 100) / 100;
}

export async function leggTilIngrediens(input: PlanlagtIngrediensInput) {
  const navn = input.navn.trim();
  if (!navn) throw new Error("Navn er påkrevd");

  const lagerId = await kreverAktivLager();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("middag_ingrediens")
    .insert({
      navn,
      vare_id: input.vareId,
      mengde: Math.max(0, rund(input.mengde)),
      enhet: input.enhet,
      lager_id: lagerId,
    })
    .select("*")
    .single();

  if (error) throw error;
  revalidatePath("/");
  return mapPlanlagtIngrediens(data);
}

export async function slettIngrediens(id: string) {
  const lagerId = await kreverAktivLager();
  const supabase = await createClient();
  const { error } = await supabase
    .from("middag_ingrediens")
    .delete()
    .eq("id", id)
    .eq("lager_id", lagerId);
  if (error) throw error;
  revalidatePath("/");
}

export async function oppdaterIngrediensMengde(id: string, mengde: number) {
  const lagerId = await kreverAktivLager();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("middag_ingrediens")
    .update({ mengde: Math.max(0, rund(mengde)) })
    .eq("id", id)
    .eq("lager_id", lagerId)
    .select("*")
    .single();

  if (error) throw error;
  revalidatePath("/");
  return mapPlanlagtIngrediens(data);
}
