const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/** Signs a JSON payload as `<payload>.<signature>`, both base64url. */
export async function lagToken(payload: Record<string, unknown>, secret: string) {
  const payloadPart = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadPart));
  return `${payloadPart}.${toBase64Url(signature)}`;
}

/** Verifies signature and (if present) `exp` expiry. Returns the payload, or null. */
export async function verifiserToken(
  token: string | undefined,
  secret: string
): Promise<Record<string, unknown> | null> {
  if (!token) return null;
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) return null;

  try {
    const key = await hmacKey(secret);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signaturePart),
      encoder.encode(payloadPart)
    );
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(fromBase64Url(payloadPart)));
    if (typeof payload.exp === "number" && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
