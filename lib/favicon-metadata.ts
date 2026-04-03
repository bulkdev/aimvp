import type { Metadata } from "next";
import type { Project } from "@/types";
import { absoluteUrl } from "@/lib/seo";
import { getLandingBranding } from "@/lib/landing-branding";

/** Icons for generated/preview customer sites when a favicon is uploaded in the admin editor. */
export function siteFaviconIcons(project: Project | null | undefined): Pick<Metadata, "icons"> | undefined {
  if (!project?.content.assets?.faviconDataUrl?.trim()) return undefined;
  const url = absoluteUrl(`/api/public/site-favicon?projectId=${encodeURIComponent(project.id)}`);
  return {
    icons: {
      icon: [{ url }],
      apple: [{ url }],
    },
  };
}

/** Icons for the marketing homepage when set in the main admin dashboard. */
export async function landingFaviconIcons(): Promise<Pick<Metadata, "icons"> | undefined> {
  const b = await getLandingBranding();
  if (!b.faviconDataUrl?.trim()) return undefined;
  const url = absoluteUrl("/api/public/landing-favicon");
  return {
    icons: {
      icon: [{ url }],
      apple: [{ url }],
    },
  };
}
