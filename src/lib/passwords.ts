import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const HASH_VERSION = 'scryptv1';
const KEY_LENGTH = 64;

export function isPasswordHash(value: string) {
  return value.startsWith(`${HASH_VERSION}$`);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${HASH_VERSION}$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedValue: string) {
  if (!storedValue) return false;

  if (!isPasswordHash(storedValue)) {
    return storedValue === password;
  }

  const [, salt, expected] = storedValue.split('$');
  if (!salt || !expected) return false;

  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  const expectedBuffer = Buffer.from(expected, 'hex');

  if (derivedKey.length !== expectedBuffer.length) return false;
  return timingSafeEqual(derivedKey, expectedBuffer);
}
