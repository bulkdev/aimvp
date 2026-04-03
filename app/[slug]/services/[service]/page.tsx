import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteTemplate from "@/components/template/SiteTemplate";
import { getProjectByPublicSlug } from "@/lib/store";
import { absoluteUrl, isReservedPublicSlug, publicPagesEnabled, slugify } from "@/lib/seo";
import { intakeLocationLine } from "@/lib/location";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string; service: string }>;
}

export default async function SlugServiceLandingPage({ params }: Props) {
  if (!publicPagesEnabled()) notFound();
  const { slug, service } = await params;
  if (isReservedPublicSlug(slug)) notFound();
  const project = await getProjectByPublicSlug(slug);
  if (!project) notFound();
  const serviceItem = project.content.services.find((s) => slugify(s.title) === service) || project.content.services[0];
  if (!serviceItem) notFound();
  const locationLine = intakeLocationLine(project.intake);

  return (
    <>
      <section style={{ background: "#eef2ff", padding: "28px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto" }}>
          <p style={{ margin: 0, color: "#4338ca", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Service Page
          </p>
          <h1 style={{ margin: "8px 0", fontSize: "clamp(1.5rem, 3.5vw, 2.35rem)", color: "#111827" }}>
            {serviceItem.title}
            {locationLine ? ` in ${locationLine}` : ""}
          </h1>
          <p style={{ margin: 0, color: "#374151", lineHeight: 1.7 }}>
            {project.content.brandName} specializes in {serviceItem.title.toLowerCase()}
            {locationLine ? ` across ${locationLine} and nearby areas.` : " with fast response times and trusted workmanship."}
          </p>
        </div>
      </section>
      <SiteTemplate project={project} />
    </>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, service } = await params;
  if (isReservedPublicSlug(slug)) return {};
  const project = await getProjectByPublicSlug(slug);
  if (!project) return {};
  const serviceItem = project.content.services.find((s) => slugify(s.title) === service) || project.content.services[0];
  if (!serviceItem) return {};
  const locationLine = intakeLocationLine(project.intake);
  const title = locationLine
    ? `${serviceItem.title} in ${locationLine} | ${project.content.brandName}`
    : `${serviceItem.title} | ${project.content.brandName}`;
  const description = `${project.content.brandName} provides ${serviceItem.title.toLowerCase()}${locationLine ? ` in ${locationLine}` : ""}. Licensed team, transparent pricing, and quick scheduling.`;
  const canonical = absoluteUrl(`/${slug}/services/${service}`);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, type: "website", url: canonical },
    twitter: { card: "summary_large_image", title, description },
  };
}
