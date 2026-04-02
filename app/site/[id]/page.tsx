import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteTemplate from "@/components/template/SiteTemplate";
import { getProject } from "@/lib/store";
import { absoluteUrl, publicPagesEnabled } from "@/lib/seo";
import { intakeLocationLine } from "@/lib/location";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PublishedSitePage({ params }: Props) {
  if (!publicPagesEnabled()) notFound();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <SiteTemplate project={project} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return {};
  const locationLine = intakeLocationLine(project.intake);
  const firstService = project.content.services[0]?.title || "Local Services";
  const title = locationLine
    ? `${firstService} in ${locationLine} | ${project.content.brandName}`
    : `${project.content.brandName} | ${firstService}`;
  const description = `${project.content.brandName} offers ${firstService.toLowerCase()}${locationLine ? ` in ${locationLine}` : ""}. Call today for fast, reliable service.`;
  const canonical = absoluteUrl(`/site/${id}`);
  const ogImage = project.content.assets?.heroSlides?.[0] || project.intake.logoDataUrl || undefined;
  return {
    title,
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
  };
}
