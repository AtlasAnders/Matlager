"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { lagToken, verifiserToken } from "./tokens";
import { ADMIN_COOKIE, ADMIN_TTL_MS, adminCode, cookieSecret } from "./constants";
import type { SkjemaResultat } from "./visitor-actions";

export type Tilgangsforesporsel = {
  id: string;
  navn: string;
  melding: string | null;
  status: string;
  generert_kode: string | null;
  opprettet: string;
};

export type Tilgangskode = {
  id: string;
  kode: string;
  navn: string | null;
  aktiv: boolean;
  opprettet: string;
  lager_id: string;
  lager_navn: string;
};

export type Lager = {
  id: string;
  navn: string;
  opprettet: string;
};

/** Enten en eksisterende lager-id, eller navnet på et nytt lager som skal opprettes. */
export type LagerValg = { lagerId: string; nyttLagerNavn?: undefined } | { lagerId?: undefined; nyttLagerNavn: string };

async function erAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const payload = await verifiserToken(cookieStore.get(ADMIN_COOKIE)?.value, cookieSecret());
  return payload !== null;
}

async function kreverAdmin() {
  if (!(await erAdmin())) redirect("/admin");
}

export async function loggInnAdmin(kode: string): Promise<SkjemaResultat> {
  if (kode.trim() !== adminCode()) {
    return { ok: false, feil: "Feil kode" };
  }

  const token = await lagToken({ exp: Date.now() + ADMIN_TTL_MS }, cookieSecret());
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_TTL_MS / 1000,
  });

  redirect("/admin");
}

export async function loggUtAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function hentForesporsler(): Promise<Tilgangsforesporsel[]> {
  await kreverAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_hent_forespoersler", {
    p_admin_kode: adminCode(),
  });
  if (error) throw error;
  return data ?? [];
}

export async function hentKoder(): Promise<Tilgangskode[]> {
  await kreverAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_hent_koder", {
    p_admin_kode: adminCode(),
  });
  if (error) throw error;
  return data ?? [];
}

export async function hentLagre(): Promise<Lager[]> {
  await kreverAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_hent_lagre", {
    p_admin_kode: adminCode(),
  });
  if (error) throw error;
  return data ?? [];
}

export async function godkjennForesporsel(
  id: string,
  kode: string,
  lagerValg: LagerValg
): Promise<SkjemaResultat> {
  await kreverAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_godkjenn_foresporsel", {
    p_admin_kode: adminCode(),
    p_id: id,
    p_kode: kode.trim(),
    p_lager_id: lagerValg.lagerId,
    p_nytt_lager_navn: lagerValg.nyttLagerNavn,
  });
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function avvisForesporsel(id: string): Promise<SkjemaResultat> {
  await kreverAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_avvis_foresporsel", {
    p_admin_kode: adminCode(),
    p_id: id,
  });
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function opprettKode(
  kode: string,
  navn: string,
  lagerValg: LagerValg
): Promise<SkjemaResultat> {
  await kreverAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_opprett_kode", {
    p_admin_kode: adminCode(),
    p_kode: kode.trim(),
    p_navn: navn.trim(),
    p_lager_id: lagerValg.lagerId,
    p_nytt_lager_navn: lagerValg.nyttLagerNavn,
  });
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function tilbakekallKode(id: string): Promise<SkjemaResultat> {
  await kreverAdmin();
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_tilbakekall_kode", {
    p_admin_kode: adminCode(),
    p_id: id,
  });
  if (error) return { ok: false, feil: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function sjekkAdminInnlogget(): Promise<boolean> {
  return erAdmin();
}
