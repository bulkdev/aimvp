import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProject } from "@/lib/store";
import { buildPublishedBasePath, publicPagesEnabled } from "@/lib/seo";
import { creatorAssets } from "@/lib/creator-membership";
import CreatorAccountClient from "@/components/template/creator/pages/CreatorAccountClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreatorAccountById({ params }: { params: Promise<{ id: string }> }) {
  if (!publicPagesEnabled()) notFound();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  if (project.publicSlug?.trim()) redirect(`${buildPublishedBasePath(project)}/account`);
  const cm = creatorAssets(project.content);
  return (
    <main className="min-h-screen bg-[#0b1020] px-6 md:px-12 lg:px-20 py-8">
      <div className="max-w-5xl mx-auto">
        <CreatorAccountClient
          subscriptions={cm.subscriptions.filter((s) => s.userId === session.user.id)}
          watchHistory={cm.watchHistory.filter((w) => w.userId === session.user.id)}
          saved={cm.savedVideos.filter((s) => s.userId === session.user.id)}
          videos={cm.videos}
        />
      </div>
    </main>
  );
}

