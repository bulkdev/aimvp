import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import SiteTemplate from "@/components/template/SiteTemplate";
import { getProject } from "@/lib/store";
import { buildPublishedBasePath, publicPagesEnabled } from "@/lib/seo";
import { buildSubpageMetadata } from "@/lib/subpage-metadata";
import { isSubpagePathSegment, pathSegmentToSection } from "@/lib/published-subpages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string; section: string }>;
}

export default async function PublishedSubpageById({ params }: Props) {
  if (!publicPagesEnabled()) notFound();
  const { id, section } = await params;
  if (!isSubpagePathSegment(section)) notFound();
  const project = await getProject(id);
  if (!project) notFound();
  if (project.publicSlug?.trim()) {
    redirect(`${buildPublishedBasePath(project)}/${section}`);
  }

  const key = pathSegmentToSection(section);
  if (key === "booking" && !project.intake.bookingEnabled) notFound();
  if (key === "payment" && !project.intake.paymentEnabled) notFound();
  const session = await auth();

  return (
    <SiteTemplate
      project={project}
      subpage={key}
      publishedBasePath={buildPublishedBasePath(project)}
      viewerUserId={session?.user?.id}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, section } = await params;
  if (!isSubpagePathSegment(section)) return {};
  const project = await getProject(id);
  if (!project) return {};
  if (project.publicSlug?.trim()) return {};

  if (pathSegmentToSection(section) === "booking" && !project.intake.bookingEnabled) return {};
  if (pathSegmentToSection(section) === "payment" && !project.intake.paymentEnabled) return {};

  return buildSubpageMetadata(project, section);
}
