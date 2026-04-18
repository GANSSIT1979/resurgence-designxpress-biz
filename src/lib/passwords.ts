import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string) {
  if (!stored) return false;

  if (!stored.startsWith("scrypt:")) {
    return false;
  }

  const [, salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;

  const derived = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(expectedHex, "hex");

  if (derived.length !== expected.length) return false;

  return timingSafeEqual(derived, expected);
}
