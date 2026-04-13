import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getProjectByPublicSlug } from "@/lib/store";
import { isReservedPublicSlug, publicPagesEnabled } from "@/lib/seo";
import { creatorAssets, isActiveSubscriber } from "@/lib/creator-membership";
import CreatorLibraryClient from "@/components/template/creator/pages/CreatorLibraryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CreatorLibraryBySlug({ params }: { params: Promise<{ slug: string }> }) {
  if (!publicPagesEnabled()) notFound();
  const { slug } = await params;
  if (isReservedPublicSlug(slug)) notFound();
  const project = await getProjectByPublicSlug(slug);
  if (!project) notFound();
  const cm = creatorAssets(project.content);
  const session = await auth();
  if (!isActiveSubscriber(project, session?.user?.id)) notFound();
  return (
    <main className="min-h-screen bg-[#0b1020] px-6 md:px-12 lg:px-20 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-3xl font-semibold">Video Library</h1>
        <p className="text-white/65 mt-2">Member-only content for {cm.creatorName}</p>
        <div className="mt-6">
          <CreatorLibraryClient projectId={project.id} categories={cm.categories} />
        </div>
      </div>
    </main>
  );
}

