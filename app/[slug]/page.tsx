import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteTemplate from "@/components/template/SiteTemplate";
import { getProjectByPublicSlug } from "@/lib/store";
import { absoluteUrl, buildPublishedBasePath, isReservedPublicSlug, publicPagesEnabled } from "@/lib/seo";
import { intakeLocationLine } from "@/lib/location";
import { siteFaviconIcons } from "@/lib/favicon-metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CustomerSlugPage({ params }: Props) {
  if (!publicPagesEnabled()) notFound();
  const { slug } = await params;
  if (isReservedPublicSlug(slug)) notFound();
  const project = await getProjectByPublicSlug(slug);
  if (!project) notFound();
  return <SiteTemplate project={project} publishedBasePath={buildPublishedBasePath(project)} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedPublicSlug(slug)) return {};
  const project = await getProjectByPublicSlug(slug);
  if (!project) return {};
  const locationLine = intakeLocationLine(project.intake);
  const firstService = project.content.services[0]?.title || "Local Services";
  const title = locationLine
    ? `${firstService} in ${locationLine} | ${project.content.brandName}`
    : `${project.content.brandName} | ${firstService}`;
  const description = `${project.content.brandName} offers ${firstService.toLowerCase()}${locationLine ? ` in ${locationLine}` : ""}. Call today for fast, reliable service.`;
  const canonical = absoluteUrl(`/${slug}`);
  const ogImage = project.content.assets?.heroSlides?.[0] || project.intake.logoDataUrl || undefined;
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
      images: ogImage ? [{ url: ogImage, alt: `${project.content.brandName} service` }] : undefined,
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
