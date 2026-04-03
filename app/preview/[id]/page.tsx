import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject } from "@/lib/store";
import { intakeLocationLine } from "@/lib/location";
import PreviewShell from "@/components/preview/PreviewShell";
import { siteFaviconIcons } from "@/lib/favicon-metadata";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return <PreviewShell project={project} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  const rawDomain = project?.intake?.customDomain?.trim() || "";
  const canonical = rawDomain
    ? rawDomain.startsWith("http://") || rawDomain.startsWith("https://")
      ? rawDomain
      : `https://${rawDomain}`
    : undefined;
  const locationLine = project?.intake ? intakeLocationLine(project.intake) : "";
  const primaryService =
    project?.content?.assets?.serviceGroups?.[0]?.items?.[0] ||
    project?.content?.services?.[0]?.title ||
    "Local Services";
  const seoTitle = project
    ? locationLine
      ? `${primaryService} in ${locationLine} | ${project.content.brandName}`
      : `${project.content.brandName} | ${primaryService}`
    : "Preview";
  const seoDescription = project
    ? `${project.content.brandName} offers ${primaryService.toLowerCase()}${locationLine ? ` in ${locationLine}` : ""}. Fast response, trusted workmanship, and easy scheduling.`
    : "Generated business website preview.";
  const ogImage =
    project?.content?.assets?.heroSlides?.[0] ||
    project?.intake?.logoDataUrl ||
    undefined;

  return {
    title: seoTitle,
    description: seoDescription,
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: "website",
      url: canonical,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: `${project?.content.brandName || "Business"} website preview` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    ...(siteFaviconIcons(project ?? undefined) ?? {}),
  };
}
