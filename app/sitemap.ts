import type { MetadataRoute } from "next";
import { listProjects } from "@/lib/store";
import { appBaseUrl, buildAreaUrl, buildPublishedBasePath, buildServiceUrl, publicPagesEnabled, slugify } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = appBaseUrl();
  const items: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
  if (!publicPagesEnabled()) return items;

  const projects = await listProjects();
  for (const project of projects) {
    const base = buildPublishedBasePath(project.id);
    items.push({
      url: `${appUrl}${base}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: "weekly",
      priority: 0.9,
    });

    for (const service of project.content.services.slice(0, 12)) {
      const s = slugify(service.title);
      if (!s) continue;
      items.push({
        url: `${appUrl}${buildServiceUrl(project.id, s)}`,
        lastModified: new Date(project.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const area of (project.content.assets?.serviceAreas || []).slice(0, 20)) {
      const a = slugify(area);
      if (!a) continue;
      items.push({
        url: `${appUrl}${buildAreaUrl(project.id, a)}`,
        lastModified: new Date(project.updatedAt),
        changeFrequency: "weekly",
        priority: 0.75,
      });
    }
  }
  return items;
}
