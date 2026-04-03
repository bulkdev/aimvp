import type { Project } from "@/types";
import { publicPagesEnabled } from "@/lib/seo";
import { getProject } from "@/lib/store";

/**
 * URL to embed in marketing portfolio iframes — published site only (no preview chrome).
 * Prefer `/{publicSlug}`, else `/site/{id}` when public pages are enabled; otherwise preview fallback.
 */
export function buildPortfolioEmbedPath(project: Project): string {
  if (!publicPagesEnabled()) {
    return `/preview/${encodeURIComponent(project.id)}`;
  }
  const slug = project.publicSlug?.trim();
  if (slug) {
    return `/${encodeURIComponent(slug)}`;
  }
  return `/site/${encodeURIComponent(project.id)}`;
}

export async function buildPortfolioEmbedPathForProjectId(projectId: string): Promise<string> {
  const p = await getProject(projectId);
  if (!p) return `/preview/${encodeURIComponent(projectId)}`;
  return buildPortfolioEmbedPath(p);
}
