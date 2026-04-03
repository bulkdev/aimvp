import type { IntakeFormData } from "@/types";

/** Combine city + state for titles, hero copy, and labels. Avoids duplicating state if city already ends with ", ST". */
export function formatCityState(city?: string | null, state?: string | null): string {
  const c = city?.trim() || "";
  const st = state?.trim();
  const stNorm = st ? (st.length <= 3 ? st.toUpperCase() : st) : "";

  if (!c && !stNorm) return "";
  if (!c) return stNorm;
  if (!stNorm) return c;

  const escaped = stNorm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`,\\s*${escaped}\\s*$`, "i").test(c)) return c;
  return `${c}, ${stNorm}`;
}

/** Single display line from intake (e.g. "Everett, WA"). */
export function intakeLocationLine(intake?: Pick<IntakeFormData, "city" | "state"> | null): string {
  if (!intake) return "";
  const parts = intakeAddressParts(intake);
  return parts.display;
}

/** Locality + region for schema.org / NAP; `display` for UI strings. */
export function intakeAddressParts(intake: Pick<IntakeFormData, "city" | "state">): {
  locality: string | undefined;
  region: string | undefined;
  display: string;
} {
  const raw = intake.city?.trim() || "";
  const explicitState = intake.state?.trim();

  if (raw.includes(",")) {
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const last = parts[parts.length - 1];
      if (/^[a-z]{2}$/i.test(last) && last.length === 2) {
        const locality = parts.slice(0, -1).join(", ") || undefined;
        const regionFromCity = last.toUpperCase();
        const region = explicitState
          ? explicitState.length <= 3
            ? explicitState.toUpperCase()
            : explicitState
          : regionFromCity;
        return {
          locality,
          region,
          display: formatCityState(locality, region),
        };
      }
    }
  }

  const locality = raw || undefined;
  const region = explicitState
    ? explicitState.length <= 3
      ? explicitState.toUpperCase()
      : explicitState
    : undefined;
  return {
    locality,
    region,
    display: formatCityState(locality, explicitState),
  };
}

/** Area label on landing pages: append state from intake when the area is a bare city name. */
export function formatAreaWithState(areaName: string, intake: Pick<IntakeFormData, "city" | "state">): string {
  const trimmed = areaName.trim();
  if (!trimmed) return intakeLocationLine(intake);
  return formatCityState(trimmed, intake.state);
}

/**
 * Rewrites common location phrases in persisted generated copy so they track the current
 * admin city/state without a full regenerate. Safe to run on any string; no-ops when intake has no location.
 */
export function applyIntakeLocationToCopy(
  text: string,
  intake: Pick<IntakeFormData, "city" | "state"> | null | undefined
): string {
  const line = intakeLocationLine(intake)?.trim();
  if (!line || !text) return text;

  let out = text;

  const rep = (re: RegExp) => {
    out = out.replace(re, (_m, a: string, _b: string, c: string) => `${a}${line}${c}`);
  };

  rep(/(schedule the right technician for )(.+?)( and nearby areas)/gi);
  rep(/(for your home in )(.+?)(\.(?:\s|$|\n))/);
  rep(/(residential and light commercial work across )(.+?)(\. We're\b)/);
  rep(/( and light commercial work across )(.+?)(\. We're\b)/);
  rep(/(to your door in )(.+?)(\. Upfront\b)/);
  rep(/(Serving )(.+?)( and surrounding areas)/i);
  rep(/(across )(.+?)( and nearby communities)/i);
  rep(/(Homeowners across )(.+?)( rely on)/i);
  rep(/( for homeowners and businesses in )(.+?)(\. We're\b)/i);
  rep(/(proudly serving )(.+?)( and the surrounding communities)/i);
  rep(/(help fast in )(.+?)(\.)/);
  out = out.replace(/( · Serving )(.+)$/i, (_m, a: string) => `${a}${line}`);
  out = out.replace(/( — Serving )(.+)$/i, (_m, a: string) => `${a}${line}`);

  return out;
}
