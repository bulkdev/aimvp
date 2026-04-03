/**
 * Live portfolio previews on the marketing homepage (phone + desktop iframes).
 * Configure sites from **Admin → All sites** → “Homepage portfolio” (stored in Redis / `.projects/`).
 *
 * Optional fallback: set `NEXT_PUBLIC_SHOWCASE_SITES` to a JSON array when no admin config exists.
 */

export type ShowcaseSite = { label: string; projectId: string };

export const SHOWCASE_SITE_DEFAULTS: ShowcaseSite[] = [
  { label: "Plumbing", projectId: "" },
  { label: "Barber", projectId: "" },
  { label: "Restaurant", projectId: "" },
];

function parseEnvJson(): ShowcaseSite[] | null {
  const raw = process.env.NEXT_PUBLIC_SHOWCASE_SITES?.trim();
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return null;
    const out: ShowcaseSite[] = [];
    for (const item of j) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      if (typeof o.label !== "string" || typeof o.projectId !== "string") continue;
      out.push({ label: o.label.trim(), projectId: o.projectId.trim() });
    }
    return out.length > 0 ? out : null;
  } catch {
    return null;
  }
}

/** Env-only fallback (used when admin has not saved any showcase yet). */
export function getShowcaseSitesFromEnv(): ShowcaseSite[] {
  const env = parseEnvJson();
  if (!env) return [];
  return env.filter((s) => s.projectId.length > 0);
}
