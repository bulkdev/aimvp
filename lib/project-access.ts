import type { Project } from "@/types";
import { listProjects } from "@/lib/store";
import { parseAdminEmails } from "@/lib/admin-env";

export { isMainAdminEmail, parseAdminEmails } from "@/lib/admin-env";

export function canAccessProject(
  project: Project,
  user: { id: string; email: string } | null | undefined
): boolean {
  if (!user?.id) return false;
  if (project.ownerId && project.ownerId === user.id) return true;
  if (!project.ownerId && user.email && parseAdminEmails().has(user.email.toLowerCase())) {
    return true;
  }
  return false;
}

export async function listProjectsForSessionUser(
  user: { id: string; email: string } | null | undefined
): Promise<Project[]> {
  if (!user?.id) return [];
  const all = await listProjects();
  return all.filter((p) => canAccessProject(p, user));
}
