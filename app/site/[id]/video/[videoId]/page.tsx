import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProject } from "@/lib/store";
import { creatorAssets, isActiveSubscriber } from "@/lib/creator-membership";
import { buildPublishedBasePath, publicPagesEnabled } from "@/lib/seo";
import CreatorVideoPageClient from "@/components/template/creator/pages/CreatorVideoPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreatorVideoById({
  params,
}: {
  params: Promise<{ id: string; videoId: string }>;
}) {
  if (!publicPagesEnabled()) notFound();
  const { id, videoId } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  if (project.publicSlug?.trim()) redirect(`${buildPublishedBasePath(project)}/video/${videoId}`);
  const cm = creatorAssets(project.content);
  const video = cm.videos.find((v) => v.id === videoId);
  if (!video) notFound();
  const session = await auth();
  const isMember = isActiveSubscriber(project, session?.user?.id);
  if (video.visibility === "member" && !isMember) notFound();
  const progress = (cm.watchHistory.find((w) => w.userId === session?.user?.id && w.videoId === video.id)?.progressPct ?? 0);
  return (
    <main className="min-h-screen bg-[#0b1020] px-6 md:px-12 lg:px-20 py-8">
      <div className="max-w-5xl mx-auto">
        <CreatorVideoPageClient
          projectId={project.id}
          video={video}
          progressPct={progress}
          commentsInitial={cm.comments}
          reactionsInitial={cm.reactions}
          emotes={cm.emotes}
        />
      </div>
    </main>
  );
}

