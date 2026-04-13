import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getProjectByPublicSlug } from "@/lib/store";
import { creatorAssets, isActiveSubscriber } from "@/lib/creator-membership";
import { isReservedPublicSlug, publicPagesEnabled } from "@/lib/seo";
import CreatorVideoPageClient from "@/components/template/creator/pages/CreatorVideoPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreatorVideoBySlug({
  params,
}: {
  params: Promise<{ slug: string; videoId: string }>;
}) {
  if (!publicPagesEnabled()) notFound();
  const { slug, videoId } = await params;
  if (isReservedPublicSlug(slug)) notFound();
  const project = await getProjectByPublicSlug(slug);
  if (!project) notFound();
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

