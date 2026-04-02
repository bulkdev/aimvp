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
