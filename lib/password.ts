import { pbkdf2, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const pbkdf2Async = promisify(pbkdf2);
const ITERATIONS = 120_000;
const KEYLEN = 64;
const DIGEST = "sha512";

/** Format: pbkdf2$<salt_hex>$<hash_hex> */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await pbkdf2Async(plain, salt, ITERATIONS, KEYLEN, DIGEST)) as Buffer;
  return `pbkdf2$${salt}$${hash.toString("hex")}`;
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "pbkdf2") return false;
  const [, salt, hashHex] = parts;
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = (await pbkdf2Async(plain, salt, ITERATIONS, KEYLEN, DIGEST)) as Buffer;
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
