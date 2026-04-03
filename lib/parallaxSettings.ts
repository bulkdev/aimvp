import type { GeneratedSiteContent } from "@/types";
import type { SiteSectionKey } from "@/lib/published-subpages";

export type ParallaxSectionScope = "home" | "subpage" | "both";

type ParallaxSectionKey = Exclude<SiteSectionKey, "hero">;

/** 0–100: opacity multiplier for dark/light scrims over parallax images. Omitted = 100 (legacy). */
export function normalizeParallaxOverlayOpacity(raw: number | undefined | null): number {
  if (raw == null || Number.isNaN(raw)) return 100;
  return Math.min(100, Math.max(0, Math.round(raw)));
}

/**
 * Scrim strength for a content section (stats, services, …).
 * Per-key value → if any per-section map exists, missing keys default to 100 → else legacy `parallaxOverlayOpacity` (pre–per-section sites) → 100.
 */
export function overlayOpacityForSection(
  assets: GeneratedSiteContent["assets"],
  key: ParallaxSectionKey
): number {
  const map = assets?.parallaxSectionOverlayOpacity;
  const per = map?.[key];
  if (per != null && !Number.isNaN(per)) return normalizeParallaxOverlayOpacity(per);
  if (map != null && Object.keys(map).length > 0) return 100;
  const legacyGlobal = assets?.parallaxOverlayOpacity;
  return normalizeParallaxOverlayOpacity(legacyGlobal ?? 100);
}

/** Whether parallax for this section may appear on home vs subpage. */
export function parallaxLayerAllowedForKey(
  assets: GeneratedSiteContent["assets"],
  key: ParallaxSectionKey,
  isSubpage: boolean
): boolean {
  const map = assets?.parallaxSectionScopes;
  const scope: ParallaxSectionScope =
    map?.[key] ??
    (map != null && Object.keys(map).length > 0 ? "both" : assets?.parallaxSectionScope) ??
    "both";
  if (isSubpage && scope === "home") return false;
  if (!isSubpage && scope === "subpage") return false;
  return true;
}

/**
 * Resolved background image for a section (custom map → hero parallax → undefined).
 * Does not apply scope; use `sectionParallaxImageForContext` for that.
 */
export function sectionParallaxImageUrl(
  assets: GeneratedSiteContent["assets"],
  key: SiteSectionKey
): string | undefined {
  if (key === "hero") return undefined;
  const map = assets?.parallaxSectionBackgrounds;
  const fromMap =
    key === "services"
      ? map?.services
      : key === "stats"
        ? map?.stats
        : key === "portfolio"
          ? map?.portfolio
          : key === "about"
            ? map?.about
            : key === "faq"
              ? map?.faq
              : key === "reviews"
                ? map?.reviews
                : key === "cta"
                  ? map?.cta
                  : key === "contact"
                    ? map?.contact
                    : key === "booking"
                      ? map?.booking
                      : key === "payment"
                        ? map?.payment
                        : undefined;
  const trimmed = fromMap?.trim();
  const hero = assets?.heroParallaxBackgroundUrl?.trim();
  return trimmed || hero || undefined;
}

/** URL when parallax is allowed for this section in this context; otherwise undefined (no layer, no stock fallback). */
export function sectionParallaxImageForContext(
  assets: GeneratedSiteContent["assets"],
  key: SiteSectionKey,
  isSubpage: boolean
): string | undefined {
  if (key === "hero") return undefined;
  if (!parallaxLayerAllowedForKey(assets, key, isSubpage)) return undefined;
  return sectionParallaxImageUrl(assets, key);
}
