import type { NavHash } from "@/lib/published-nav-hrefs";
import { resolveSiteVariant, type SiteTemplateVariant } from "@/lib/siteVariant";
import type { GeneratedSiteContent, Project } from "@/types";

export type NavMenuItem = { label: string; hash: NavHash };

/** Default plumbing / classic one-pager nav (matches previous hardcoded navbar). */
export const DEFAULT_PLUMBING_NAV_MENU_ITEMS: NavMenuItem[] = [
  { label: "Services", hash: "services" },
  { label: "Stats", hash: "stats" },
  { label: "Work", hash: "work" },
  { label: "About", hash: "about" },
  { label: "FAQ", hash: "faq" },
  { label: "Reviews", hash: "reviews" },
  { label: "Contact", hash: "contact" },
];

export const DEFAULT_SUPER_SERVICE_NAV_MENU_ITEMS: NavMenuItem[] = [
  { label: "Services", hash: "services" },
  { label: "Stats", hash: "stats" },
  { label: "About", hash: "about" },
  { label: "Reviews", hash: "reviews" },
  { label: "FAQ", hash: "faq" },
  { label: "Contact", hash: "contact" },
];

export const DEFAULT_RENOVATIONS_NAV_MENU_ITEMS: NavMenuItem[] = [
  { label: "Our services", hash: "services" },
  { label: "Results", hash: "stats" },
  { label: "Portfolio", hash: "work" },
  { label: "Our story", hash: "about" },
  { label: "FAQ", hash: "faq" },
  { label: "Contact", hash: "contact" },
];

const VALID_HASHES: ReadonlySet<NavHash> = new Set([
  "hero",
  "services",
  "stats",
  "work",
  "about",
  "faq",
  "reviews",
  "contact",
  "booking",
  "payment",
  "cta",
]);

export const NAV_MENU_HASH_OPTIONS: { value: NavHash; label: string }[] = [
  { value: "hero", label: "Hero (top)" },
  { value: "services", label: "Services" },
  { value: "stats", label: "Stats" },
  { value: "work", label: "Work / portfolio" },
  { value: "about", label: "About" },
  { value: "faq", label: "FAQ" },
  { value: "reviews", label: "Reviews" },
  { value: "contact", label: "Contact" },
  { value: "booking", label: "Booking" },
  { value: "payment", label: "Payment" },
  { value: "cta", label: "CTA banner" },
];

export function navbarMenuFallbackForVariant(variant: SiteTemplateVariant): NavMenuItem[] {
  switch (variant) {
    case "renovations":
      return DEFAULT_RENOVATIONS_NAV_MENU_ITEMS;
    case "superService":
      return DEFAULT_SUPER_SERVICE_NAV_MENU_ITEMS;
    default:
      return DEFAULT_PLUMBING_NAV_MENU_ITEMS;
  }
}

export function normalizeNavbarMenuItems(
  raw: Array<{ label: string; hash: string }> | undefined
): NavMenuItem[] {
  if (!raw?.length) return [];
  return raw
    .map((row) => ({
      label: (row.label ?? "").trim(),
      hash: row.hash as NavHash,
    }))
    .filter((row) => row.label && VALID_HASHES.has(row.hash));
}

export function resolveNavbarMenuItems(
  assets: GeneratedSiteContent["assets"] | undefined,
  variant: SiteTemplateVariant
): NavMenuItem[] {
  const normalized = normalizeNavbarMenuItems(assets?.navbarMenuItems);
  if (normalized.length > 0) return normalized;
  return navbarMenuFallbackForVariant(variant);
}

export function initialNavbarMenuItemsFromProject(project: Project): NavMenuItem[] {
  const saved = normalizeNavbarMenuItems(project.content.assets?.navbarMenuItems);
  if (saved.length > 0) return saved;
  const v = resolveSiteVariant(
    project.intake.businessDescription,
    project.intake.siteTemplate ?? "auto",
    project.intake.companyName
  );
  return [...navbarMenuFallbackForVariant(v)];
}
