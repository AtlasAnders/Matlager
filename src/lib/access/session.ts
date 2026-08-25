import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifiserToken } from "./tokens";
import { VISITOR_COOKIE, cookieSecret } from "./constants";

/** Reads and verifies the visitor cookie, returning the active lager's id, or null. */
export async function hentAktivLagerId(): Promise<string | null> {
  const cookieStore = await cookies();
  const payload = await verifiserToken(cookieStore.get(VISITOR_COOKIE)?.value, cookieSecret());
  if (!payload || typeof payload.lagerId !== "string") return null;
  return payload.lagerId;
}

/**
 * proxy.ts already blocks requests without a valid lagerId, but redirect
 * here too as a safety net (e.g. an older-format cookie slipping through)
 * instead of throwing an unhandled error that crashes the page.
 */
export async function kreverAktivLager(): Promise<string> {
  const lagerId = await hentAktivLagerId();
  if (!lagerId) redirect("/tilgang");
  return lagerId;
}
