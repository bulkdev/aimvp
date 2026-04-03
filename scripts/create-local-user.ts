/**
 * One-off / local helper: create a credentials user (file or Redis store).
 * Usage: npx tsx scripts/create-local-user.ts you@example.com
 */

import { randomBytes } from "crypto";
import { createUser, getUserByEmail } from "../lib/auth-users";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email?.includes("@")) {
    console.error("Usage: npx tsx scripts/create-local-user.ts <email>");
    process.exit(1);
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    // eslint-disable-next-line no-console -- CLI output
    console.log(JSON.stringify({ ok: true, created: false, message: "User already exists." }));
    return;
  }

  const password = `${randomBytes(18).toString("base64url")}Aa1`;
  await createUser({ email, password });
  // eslint-disable-next-line no-console -- CLI output
  console.log(JSON.stringify({ ok: true, created: true, email, password }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
