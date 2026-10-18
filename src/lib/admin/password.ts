import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * גיבוב סיסמאות עם scrypt (מובנה ב-Node — בלי תלות חיצונית).
 * פורמט: `scrypt$N$salt$hash` (base64url), כדי שאפשר יהיה להחמיר בעתיד.
 */
const N = 16384;
const KEYLEN = 64;

function derive(password: string, salt: Buffer, n: number) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, KEYLEN, { N: n, r: 8, p: 1 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N);
  return `scrypt$${N}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, n, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !n || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const key = await derive(password, Buffer.from(salt, "base64url"), Number(n));
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** סיסמה זמנית קריאה (בלי תווים מבלבלים), למשתמש חדש / איפוס. */
export function temporaryPassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(14);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export const PASSWORD_MIN = 10;
