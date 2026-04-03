/** Section keys used by SiteTemplate (matches internal ordering). */
export type SiteSectionKey =
  | "hero"
  | "services"
  | "stats"
  | "portfolio"
  | "about"
  | "booking"
  | "faq"
  | "reviews"
  | "cta"
  | "payment"
  | "contact";

/** Sections allowed as standalone `/slug/...` SEO pages (not hero; stats is in-page only at `#stats`). */
export type PublishedSubpageSection = Exclude<SiteSectionKey, "hero" | "stats">;

/** URL path segments for standalone SEO subpages (hero is always on `/` only). */
export const SUBPAGE_PATH_SEGMENTS = [
  "services",
  "work",
  "about",
  "booking",
  "faq",
  "reviews",
  "cta",
  "payment",
  "contact",
] as const;

export type SubpagePathSegment = (typeof SUBPAGE_PATH_SEGMENTS)[number];

const SEGMENT_TO_SECTION: Record<SubpagePathSegment, PublishedSubpageSection> = {
  services: "services",
  work: "portfolio",
  about: "about",
  booking: "booking",
  faq: "faq",
  reviews: "reviews",
  cta: "cta",
  payment: "payment",
  contact: "contact",
};

const SECTION_TO_SEGMENT: Partial<Record<SiteSectionKey, SubpagePathSegment>> = {
  services: "services",
  portfolio: "work",
  about: "about",
  booking: "booking",
  faq: "faq",
  reviews: "reviews",
  cta: "cta",
  payment: "payment",
  contact: "contact",
};

export function isSubpagePathSegment(s: string): s is SubpagePathSegment {
  return (SUBPAGE_PATH_SEGMENTS as readonly string[]).includes(s);
}

export function pathSegmentToSection(segment: SubpagePathSegment): PublishedSubpageSection;
export function pathSegmentToSection(segment: string): PublishedSubpageSection | null;
export function pathSegmentToSection(segment: string): PublishedSubpageSection | null {
  if (!isSubpagePathSegment(segment)) return null;
  return SEGMENT_TO_SECTION[segment];
}

export function sectionToSubpagePathSegment(key: SiteSectionKey): SubpagePathSegment | null {
  return SECTION_TO_SEGMENT[key] ?? null;
}
