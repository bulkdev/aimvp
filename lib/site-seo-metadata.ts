import type { Project } from "@/types";
import { intakeLocationLine } from "@/lib/location";

/** Default `<title>` when `assets.siteSeo.metaTitle` is not set. */
export function defaultHomeSeoTitle(project: Project): string {
  const { content, intake } = project;
  const locationLine = intakeLocationLine(intake);
  const primaryService =
    content.assets?.serviceGroups?.[0]?.items?.[0] || content.services?.[0]?.title || "Local Services";
  if (locationLine) {
    return `${primaryService} in ${locationLine} | ${content.brandName}`;
  }
  return `${content.brandName} | ${primaryService}`;
}

/** Default meta description when `assets.siteSeo.metaDescription` is not set. */
export function defaultHomeSeoDescription(project: Project): string {
  const { content, intake } = project;
  const locationLine = intakeLocationLine(intake);
  const firstService = content.services[0]?.title || "Local Services";
  return `${content.brandName} offers ${firstService.toLowerCase()}${locationLine ? ` in ${locationLine}` : ""}. Call today for fast, reliable service.`;
}

export function defaultHomeOgImage(project: Project): string | undefined {
  return project.content.assets?.heroSlides?.[0] || project.intake.logoDataUrl || undefined;
}

export type ResolvedHomeSeo = {
  title: string;
  description: string;
  ogImage?: string;
  /** Comma-separated; omit from tags when empty. */
  keywords?: string;
};

/**
 * Home page (preview, `/slug`, `/site/id`) — browser title, description, OG/Twitter image, optional keywords.
 */
export function resolveHomePageSeo(project: Project): ResolvedHomeSeo {
  const seo = project.content.assets?.siteSeo;
  const title = seo?.metaTitle?.trim() || defaultHomeSeoTitle(project);
  const description = seo?.metaDescription?.trim() || defaultHomeSeoDescription(project);
  const ogImage = seo?.ogImageUrl?.trim() || defaultHomeOgImage(project);
  const kw = seo?.keywords?.trim();
  const keywords = kw ? kw : undefined;
  return { title, description, ogImage, keywords };
}
