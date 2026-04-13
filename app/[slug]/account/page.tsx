import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getProjectByPublicSlug } from "@/lib/store";
import { creatorAssets } from "@/lib/creator-membership";
import { isReservedPublicSlug, publicPagesEnabled } from "@/lib/seo";
import CreatorAccountClient from "@/components/template/creator/pages/CreatorAccountClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreatorAccountBySlug({ params }: { params: Promise<{ slug: string }> }) {
  if (!publicPagesEnabled()) notFound();
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { slug } = await params;
  if (isReservedPublicSlug(slug)) notFound();
  const project = await getProjectByPublicSlug(slug);
  if (!project) notFound();
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

