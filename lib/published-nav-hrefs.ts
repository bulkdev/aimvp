import type { Project } from "@/types";
import { buildPublishedBasePath } from "@/lib/seo";
import type { SubpagePathSegment } from "@/lib/published-subpages";

/** Lowercase hash targets used in nav/footer (matches section ids / anchors). */
export type NavHash =
  | "hero"
  | "services"
  | "stats"
  | "work"
  | "about"
  | "faq"
  | "reviews"
  | "contact"
  | "booking"
  | "payment"
  | "cta";

const HASH_TO_SEGMENT: Record<NavHash, SubpagePathSegment | null> = {
  hero: null,
  services: "services",
  stats: null,
  work: "work",
  about: "about",
  faq: "faq",
  reviews: "reviews",
  contact: "contact",
  booking: "booking",
  payment: "payment",
  cta: "cta",
};

/**
 * When `publishedBasePath` is set (published site), return a path URL; otherwise in-page `#hash` for preview.
 * Stats (and hashes with no path segment) always use the main URL + hash — there is no `/slug/stats` page.
 */
export function publishedNavHref(publishedBasePath: string | undefined, hash: NavHash): string {
  if (!publishedBasePath) {
    return `#${hash}`;
  }
  if (hash === "hero") {
    return publishedBasePath;
  }
  const segment = HASH_TO_SEGMENT[hash];
  if (!segment) {
    return `${publishedBasePath}#${hash}`;
  }
  return `${publishedBasePath}/${segment}`;
}

export function publishedNavHrefFromProject(project: Pick<Project, "id" | "publicSlug">, hash: NavHash): string {
  return publishedNavHref(buildPublishedBasePath(project), hash);
}
