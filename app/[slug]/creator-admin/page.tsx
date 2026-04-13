import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProjectByPublicSlug } from "@/lib/store";
import { canAccessProject } from "@/lib/project-access";
import { creatorAssets } from "@/lib/creator-membership";
import { isReservedPublicSlug, publicPagesEnabled } from "@/lib/seo";
import CreatorAdminClient from "@/components/template/creator/pages/CreatorAdminClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreatorAdminBySlug({ params }: { params: Promise<{ slug: string }> }) {
  if (!publicPagesEnabled()) notFound();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { slug } = await params;
  if (isReservedPublicSlug(slug)) notFound();
  const project = await getProjectByPublicSlug(slug);
  if (!project) notFound();
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

