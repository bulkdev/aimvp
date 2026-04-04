import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import SiteTemplate from "@/components/template/SiteTemplate";
import { getProject } from "@/lib/store";
import { absoluteUrl, buildPublishedBasePath, publicPagesEnabled } from "@/lib/seo";
import { siteFaviconIcons } from "@/lib/favicon-metadata";
import { resolveHomePageSeo } from "@/lib/site-seo-metadata";

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
  if (project.publicSlug?.trim()) {
    redirect(buildPublishedBasePath(project));
  }
  return <SiteTemplate project={project} publishedBasePath={buildPublishedBasePath(project)} />;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return {};
  const { title, description, ogImage, keywords } = resolveHomePageSeo(project);
  const keywordList = keywords
    ? keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;
  const canonical = absoluteUrl(buildPublishedBasePath(project));
  return {
    title: { absolute: title },
    description,
    keywords: keywordList && keywordList.length > 0 ? keywordList : undefined,
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
