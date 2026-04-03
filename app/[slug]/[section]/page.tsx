import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteTemplate from "@/components/template/SiteTemplate";
import { getProjectByPublicSlug } from "@/lib/store";
import { buildPublishedBasePath, isReservedPublicSlug, publicPagesEnabled } from "@/lib/seo";
import { buildSubpageMetadata } from "@/lib/subpage-metadata";
import { isSubpagePathSegment, pathSegmentToSection, type SubpagePathSegment } from "@/lib/published-subpages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string; section: string }>;
}

export default async function PublishedSubpageBySlug({ params }: Props) {
  if (!publicPagesEnabled()) notFound();
  const { slug, section } = await params;
  if (isReservedPublicSlug(slug)) notFound();
  if (!isSubpagePathSegment(section)) notFound();
  const project = await getProjectByPublicSlug(slug);
  if (!project) notFound();

  const key = pathSegmentToSection(section);
  if (key === "booking" && !project.intake.bookingEnabled) notFound();
  if (key === "payment" && !project.intake.paymentEnabled) notFound();

  return (
    <SiteTemplate
      project={project}
      subpage={key}
      publishedBasePath={buildPublishedBasePath(project)}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, section } = await params;
  if (isReservedPublicSlug(slug)) return {};
  if (!isSubpagePathSegment(section)) return {};
  const project = await getProjectByPublicSlug(slug);
  if (!project) return {};

  if (pathSegmentToSection(section) === "booking" && !project.intake.bookingEnabled) return {};
  if (pathSegmentToSection(section) === "payment" && !project.intake.paymentEnabled) return {};

  return buildSubpageMetadata(project, section);
}
