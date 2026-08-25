export const VISITOR_COOKIE = "dv_tilgang";
export const VISITOR_TTL_MS = 1000 * 60 * 60 * 24 * 180; // 180 dager

export const ADMIN_COOKIE = "dv_admin";
export const ADMIN_TTL_MS = 1000 * 60 * 60 * 12; // 12 timer

export function cookieSecret(): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) throw new Error("COOKIE_SECRET er ikke satt");
  return secret;
}

export function adminCode(): string {
  const code = process.env.ADMIN_CODE;
  if (!code) throw new Error("ADMIN_CODE er ikke satt");
  return code;
}
