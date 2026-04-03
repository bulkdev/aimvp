import type { Metadata } from "next";
import type { Project } from "@/types";
import { absoluteUrl, buildSubpageUrl } from "@/lib/seo";
import { intakeLocationLine } from "@/lib/location";
import { siteFaviconIcons } from "@/lib/favicon-metadata";
import type { SubpagePathSegment } from "@/lib/published-subpages";

function firstSentence(text: string, maxLen = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1).trim()}…`;
}

export function buildSubpageMetadata(project: Project, segment: SubpagePathSegment): Metadata {
  const { content, intake } = project;
  const brand = content.brandName;
  const locationLine = intakeLocationLine(intake);
  const locSuffix = locationLine ? ` in ${locationLine}` : "";

  const titles: Record<SubpagePathSegment, string> = {
    services: `Services${locSuffix} | ${brand}`,
    work: `Our Work & Portfolio | ${brand}`,
    about: `About Us | ${brand}`,
    booking: `Book Online | ${brand}`,
    faq: `FAQ | ${brand}`,
    reviews: `Reviews | ${brand}`,
    cta: `${brand} — Get Started`,
    payment: `Payment Options | ${brand}`,
    contact: `Contact | ${brand}`,
  };

  const descriptions: Record<SubpagePathSegment, string> = {
    services: firstSentence(
      `${brand} offers professional services${locSuffix}. Browse what we do and request a quote.`
    ),
    work: firstSentence(
      content.tagline
        ? `${brand} — ${content.tagline}`
        : `See completed projects and craftsmanship from ${brand}${locSuffix}.`
    ),
    about: firstSentence(content.about?.body || `${brand} — trusted local professionals${locSuffix}.`),
    booking: firstSentence(`Schedule service with ${brand}${locSuffix}.`),
    faq: firstSentence(`Common questions about ${brand}'s services${locSuffix}.`),
    reviews: firstSentence(`Customer reviews and ratings for ${brand}${locSuffix}.`),
    cta: firstSentence(content.contact?.subheading || `Reach out to ${brand}${locSuffix}.`),
    payment: firstSentence(`Payment and billing options at ${brand}.`),
    contact: firstSentence(
      `${brand} — ${content.contact?.subheading || `Contact us${locSuffix} for a fast response.`}`
    ),
  };

  const title = titles[segment];
  const description = descriptions[segment];
  const canonical = absoluteUrl(buildSubpageUrl(project, segment));
  const ogImage = content.assets?.heroSlides?.[0] || intake.logoDataUrl || undefined;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: ogImage ? [{ url: ogImage, alt: `${brand}` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    ...(siteFaviconIcons(project) ?? {}),
  };
}
