import { notFound, redirect } from "next/navigation";
import { getProject } from "@/lib/store";
import { creatorAssets } from "@/lib/creator-membership";
import { buildPublishedBasePath, publicPagesEnabled } from "@/lib/seo";
import ReelCard from "@/components/template/creator/ReelCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreatorReelsById({ params }: { params: Promise<{ id: string }> }) {
  if (!publicPagesEnabled()) notFound();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  if (project.publicSlug?.trim()) redirect(`${buildPublishedBasePath(project)}/reels`);
  const cm = creatorAssets(project.content);
  return (
    <main className="min-h-screen bg-[#0b1020] px-4 py-6 md:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-white text-2xl font-semibold mb-4">Reels</h1>
        <div className="space-y-4">
          {cm.reels.map((r) => <ReelCard key={r.id} reel={r} />)}
        </div>
      </div>
    </main>
  );
}

