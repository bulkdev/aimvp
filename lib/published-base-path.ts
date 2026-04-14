import type { Project } from "@/types";
import { buildPublishedBasePath } from "@/lib/seo";
import { normalizeCustomDomain, parseRequestHost } from "@/lib/custom-domain";

/** On mapped custom domains, render links as root-relative paths (no `/{slug}` prefix). */
export function resolvePublishedBasePathForHost(
  project: Pick<Project, "id" | "publicSlug" | "intake">,
  requestHostRaw: string | null | undefined
): string {
  const requestHost = parseRequestHost(requestHostRaw || "");
  const projectHost = normalizeCustomDomain(project.intake.customDomain || "");
  if (requestHost && projectHost && requestHost === projectHost) {
    return "/";
  }
  return buildPublishedBasePath(project);
}
