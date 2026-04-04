import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProject } from "@/lib/store";
import PreviewShell from "@/components/preview/PreviewShell";
import { siteFaviconIcons } from "@/lib/favicon-metadata";
import { resolveHomePageSeo } from "@/lib/site-seo-metadata";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const resolved = project ? resolveHomePageSeo(project) : null;
  const seoTitle = resolved?.title ?? "Preview";
  const seoDescription = resolved?.description ?? "Generated business website preview.";
  const ogImage = resolved?.ogImage;
  const keywordList = resolved?.keywords
    ? resolved.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
    : undefined;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: keywordList && keywordList.length > 0 ? keywordList : undefined,
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
