import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { auth } from "@/auth";
import SiteTemplate from "@/components/template/SiteTemplate";
import { getProjectByPublicSlug } from "@/lib/store";
import { absoluteUrl, isReservedPublicSlug, publicPagesEnabled } from "@/lib/seo";
import { resolvePublishedBasePathForHost } from "@/lib/published-base-path";
import { siteFaviconIcons } from "@/lib/favicon-metadata";
import { resolveHomePageSeo } from "@/lib/site-seo-metadata";

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
  const h = await headers();
  const publishedBasePath = resolvePublishedBasePathForHost(
    project,
    h.get("x-forwarded-host") || h.get("host")
  );
  const session = await auth();
  return (
    <SiteTemplate
      project={project}
      publishedBasePath={publishedBasePath}
      viewerUserId={session?.user?.id}
    />
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedPublicSlug(slug)) return {};
  const project = await getProjectByPublicSlug(slug);
  if (!project) return {};
  const { title, description, ogImage, keywords } = resolveHomePageSeo(project);
  const keywordList = keywords
    ? keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;
  const canonical = absoluteUrl(`/${slug}`);
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
