import { cookies } from "next/headers";
import { verifiserToken } from "./tokens";
import { VISITOR_COOKIE, cookieSecret } from "./constants";

/** Reads and verifies the visitor cookie, returning the active lager's id, or null. */
export async function hentAktivLagerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const payload = await verifiserToken(cookieStore.get(VISITOR_COOKIE)?.value, cookieSecret());
  if (!payload || typeof payload.lagerId !== "string") return null;
  return payload.lagerId;
}

export async function kreverAktivLager(): Promise<string> {
  const lagerId = await hentAktivLagerId();
  if (!lagerId) throw new Error("Ingen gyldig tilgang. Gå til /tilgang.");
  return lagerId;
}
