"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { mapVare } from "@/lib/mappers";
import type { Enhet } from "@/lib/types";

export type VareInput = {
  navn: string;
  kategoriId: string;
  mengde: number;
  enhet: Enhet;
};

function rund(n: number) {
  return Math.round(n * 100) / 100;
}

export async function opprettVare(input: VareInput) {
  const navn = input.navn.trim();
  if (!navn) throw new Error("Navn er påkrevd");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vare")
    .insert({
      navn,
      kategori_id: input.kategoriId,
      mengde: Math.max(0, rund(input.mengde)),
      enhet: input.enhet,
    })
    .select("*, kategori(*)")
    .single();

  if (error) throw error;
  revalidatePath("/");
  return mapVare(data);
}

export async function oppdaterVare(id: string, input: VareInput) {
  const navn = input.navn.trim();
  if (!navn) throw new Error("Navn er påkrevd");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vare")
    .update({
      navn,
      kategori_id: input.kategoriId,
      mengde: Math.max(0, rund(input.mengde)),
      enhet: input.enhet,
    })
    .eq("id", id)
    .select("*, kategori(*)")
    .single();

  if (error) throw error;
  revalidatePath("/");
  return mapVare(data);
}

export async function slettVare(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("vare").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}

export async function endreMengde(id: string, delta: number) {
  const supabase = await createClient();

  const { data: eksisterende, error: hentError } = await supabase
    .from("vare")
    .select("mengde")
    .eq("id", id)
    .single();
  if (hentError) throw hentError;

  const nyMengde = Math.max(0, rund(Number(eksisterende.mengde) + delta));

  const { data, error } = await supabase
    .from("vare")
    .update({ mengde: nyMengde })
    .eq("id", id)
    .select("*, kategori(*)")
    .single();

  if (error) throw error;
  revalidatePath("/");
  return mapVare(data);
}

export async function settMengde(id: string, mengde: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vare")
    .update({ mengde: Math.max(0, rund(mengde)) })
    .eq("id", id)
    .select("*, kategori(*)")
    .single();

  if (error) throw error;
  revalidatePath("/");
  return mapVare(data);
}
