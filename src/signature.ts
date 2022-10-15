import { base64decode, base64encode } from "./deps.ts";

const algorithm = { name: "HMAC", hash: "SHA-256" };
const encoder = new TextEncoder();

export function importKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    algorithm,
    false,
    ["sign", "verify"],
  );
}

export async function sign(key: CryptoKey, data: string) {
  const signature = await crypto.subtle.sign(
    algorithm.name,
    key,
    encoder.encode(data),
  );

  return base64encode(signature);
}

/**
 * @param key
 * @param signature - The base64url encoded signature to verify
 * @param data
 * @returns
 */
export function verify(key: CryptoKey, signature: string, data: string) {
  return crypto.subtle.verify(
    algorithm.name,
    key,
    base64decode(signature),
    encoder.encode(data),
  );
}
