/** Comma-separated bootstrap / main-admin emails (`ADMIN_EMAILS`). */

export function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS || "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isMainAdminEmail(email: string | null | undefined): boolean {
  if (!email?.trim()) return false;
  return parseAdminEmails().has(email.trim().toLowerCase());
}
