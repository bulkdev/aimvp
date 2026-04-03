import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import SiteTemplate from "@/components/template/SiteTemplate";
import { getProject } from "@/lib/store";
import { absoluteUrl, buildPublishedBasePath, publicPagesEnabled, slugify } from "@/lib/seo";
import { formatAreaWithState, intakeLocationLine } from "@/lib/location";
import { siteFaviconIcons } from "@/lib/favicon-metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string; area: string }>;
}

export default async function AreaLandingPage({ params }: Props) {
  if (!publicPagesEnabled()) notFound();
  const { id, area } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  if (project.publicSlug?.trim()) {
    redirect(`${buildPublishedBasePath(project)}/areas/${area}`);
  }
  const serviceAreas = project.content.assets?.serviceAreas ?? [];
  const matched = serviceAreas.find((a) => slugify(a) === area);
  const areaName = matched
    ? formatAreaWithState(matched, project.intake)
    : intakeLocationLine(project.intake);
  if (!areaName) notFound();

  return (
    <>
      <section style={{ background: "#ecfeff", padding: "28px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <p style={{ margin: 0, color: "#0f766e", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Service Area
          </p>
          <h1 style={{ margin: "8px 0", fontSize: "clamp(1.5rem, 3.5vw, 2.35rem)", color: "#111827" }}>
            Plumbing and Heating Services in {areaName}
          </h1>
          <p style={{ margin: 0, color: "#374151", lineHeight: 1.7 }}>
            {project.content.brandName} serves {areaName} with emergency plumbing, repairs, installations, and maintenance
            backed by local expertise.
          </p>
        </div>
      </section>
      <SiteTemplate project={project} publishedBasePath={buildPublishedBasePath(project)} />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, area } = await params;
  const project = await getProject(id);
  if (!project) return {};
  const serviceAreas = project.content.assets?.serviceAreas ?? [];
  const matched = serviceAreas.find((a) => slugify(a) === area);
  const areaName = matched
    ? formatAreaWithState(matched, project.intake)
    : intakeLocationLine(project.intake);
  if (!areaName) return {};
  const primaryService = project.content.services[0]?.title || "Plumbing Services";
  const title = `${primaryService} in ${areaName} | ${project.content.brandName}`;
  const description = `${project.content.brandName} provides ${primaryService.toLowerCase()} in ${areaName}. Fast response, quality workmanship, and trusted local service.`;
  const canonical = absoluteUrl(`${buildPublishedBasePath(project)}/areas/${area}`);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "website", url: canonical },
    twitter: { card: "summary_large_image", title, description },
    ...(siteFaviconIcons(project) ?? {}),
  };
}
