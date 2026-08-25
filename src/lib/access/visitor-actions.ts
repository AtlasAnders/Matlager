"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { lagToken } from "./tokens";
import { VISITOR_COOKIE, VISITOR_TTL_MS, cookieSecret } from "./constants";

export type SkjemaResultat = { ok: boolean; feil?: string };

export async function verifiserKode(kode: string): Promise<SkjemaResultat> {
  const trimmet = kode.trim();
  if (!trimmet) return { ok: false, feil: "Skriv inn en tilgangskode" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("sjekk_tilgangskode", { p_kode: trimmet });

  if (error) return { ok: false, feil: "Noe gikk galt, prøv igjen" };
  if (!data) return { ok: false, feil: "Feil kode" };

  const token = await lagToken({ exp: Date.now() + VISITOR_TTL_MS }, cookieSecret());
  const cookieStore = await cookies();
  cookieStore.set(VISITOR_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_TTL_MS / 1000,
  });

  redirect("/");
}

export async function sendForesporsel(navn: string, melding: string): Promise<SkjemaResultat> {
  if (!navn.trim()) return { ok: false, feil: "Skriv inn navnet ditt" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("send_tilgangsforesporsel", {
    p_navn: navn.trim(),
    p_melding: melding.trim() || undefined,
  });

  if (error) return { ok: false, feil: "Noe gikk galt, prøv igjen" };
  return { ok: true };
}
