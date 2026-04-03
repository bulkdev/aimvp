import type { Metadata } from "next";
import type { Project } from "@/types";
import { absoluteUrl } from "@/lib/seo";
import { getLandingBranding } from "@/lib/landing-branding";

/** Icons for generated/preview customer sites when a favicon is uploaded in the admin editor. */
export function siteFaviconIcons(project: Project | null | undefined): Pick<Metadata, "icons"> | undefined {
  if (!project?.content.assets?.faviconDataUrl?.trim()) return undefined;
  const v = encodeURIComponent(project.updatedAt || project.id);
  const url = absoluteUrl(
    `/api/public/site-favicon?projectId=${encodeURIComponent(project.id)}&v=${v}`
  );
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
  const v = b.faviconRev ?? 0;
  const url = absoluteUrl(`/api/public/landing-favicon?v=${v}`);
  return {
    icons: {
      icon: [{ url }],
      apple: [{ url }],
    },
  };
}
