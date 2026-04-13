import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProject } from "@/lib/store";
import { buildPublishedBasePath, publicPagesEnabled } from "@/lib/seo";
import { canAccessProject } from "@/lib/project-access";
import { creatorAssets } from "@/lib/creator-membership";
import CreatorAdminClient from "@/components/template/creator/pages/CreatorAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreatorAdminById({ params }: { params: Promise<{ id: string }> }) {
  if (!publicPagesEnabled()) notFound();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  if (project.publicSlug?.trim()) redirect(`${buildPublishedBasePath(project)}/creator-admin`);
  if (!canAccessProject(project, { id: session.user.id, email: session.user.email || "" })) notFound();
  const cm = creatorAssets(project.content);
  return (
    <main className="min-h-screen bg-[#0b1020] px-6 md:px-12 lg:px-20 py-8">
      <div className="max-w-5xl mx-auto">
        <CreatorAdminClient projectId={project.id} videos={cm.videos} reels={cm.reels} />
      </div>
    </main>
  );
}

