"use client";

import { useMemo, useState } from "react";
import type { CreatorComment, CreatorReaction, CreatorVideo } from "@/types";
import VideoCard from "@/components/template/creator/VideoCard";

type SortPill = "newest" | "oldest" | "most-viewed" | "top-rated";

function likesForComment(reactions: CreatorReaction[], commentId: string): number {
  return reactions.filter((r) => r.commentId === commentId).length;
}

export default function CreatorHomeFeedClient({
  videos,
  comments,
  reactions,
  isSubscriber,
  basePath,
}: {
  videos: CreatorVideo[];
  comments: CreatorComment[];
  reactions: CreatorReaction[];
  isSubscriber: boolean;
  basePath: string;
}) {
  const [sort, setSort] = useState<SortPill>("newest");

  const popularVideos = useMemo(
    () => [...videos].sort((a, b) => b.views - a.views).slice(0, 12),
    [videos]
  );

  const topComments = useMemo(() => {
    const ranked = [...comments]
      .map((c) => ({ comment: c, likes: likesForComment(reactions, c.id) }))
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 12);
    return ranked;
  }, [comments, reactions]);

  const sortedAll = useMemo(() => {
    const rows = [...videos];
    if (sort === "oldest") rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    else if (sort === "most-viewed") rows.sort((a, b) => b.views - a.views);
    else if (sort === "top-rated") rows.sort((a, b) => b.engagementScore - a.engagementScore);
    else rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return rows;
  }, [videos, sort]);

  return (
    <main className="min-h-screen bg-[#0b1020] text-white px-4 md:px-8 lg:px-12 pb-28 pt-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <section>
          <h2 className="text-xl md:text-2xl font-semibold">Popular videos 🔥</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
            {popularVideos.map((v) => (
              <a
                key={v.id}
                href={`${basePath}/video/${v.id}`}
                className="snap-start min-w-[280px] max-w-[280px] no-underline"
              >
                <VideoCard video={v} />
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl md:text-2xl font-semibold">Top comments</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1">
            {topComments.map(({ comment, likes }) => {
              const video = videos.find((v) => v.id === comment.videoId);
              return (
                <a
                  key={comment.id}
                  href={`${basePath}/video/${comment.videoId}`}
                  className="snap-start min-w-[320px] max-w-[320px] no-underline"
                >
                  <article className="relative rounded-xl overflow-hidden border border-white/10 h-56">
                    {video?.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20" />
                    )}
                    <div className="absolute inset-0 bg-black/50 p-4 flex flex-col justify-end">
                      <p className="text-white text-sm line-clamp-3">&ldquo;{comment.body}&rdquo;</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-white/75">
                        <span>{comment.authorName || "Member"}</span>
                        <span>❤️ {likes}</span>
                      </div>
                    </div>
                  </article>
                </a>
              );
            })}
          </div>
        </section>

        {isSubscriber ? (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold">Member home</h2>
            <p className="text-white/70 mt-2">Your premium feed is unlocked. Jump into any full video below.</p>
          </section>
        ) : null}

        <section>
          <h2 className="text-xl md:text-2xl font-semibold">All videos</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["newest", "oldest", "most-viewed", "top-rated"] as const).map((pill) => (
              <button
                key={pill}
                type="button"
                onClick={() => setSort(pill)}
                className={`px-3 py-1.5 rounded-full text-sm border transition ${
                  sort === pill
                    ? "bg-violet-500/30 border-violet-300/60 text-white"
                    : "bg-white/[0.03] border-white/15 text-white/75 hover:bg-white/[0.08]"
                }`}
              >
                {pill === "most-viewed" ? "Most viewed" : pill === "top-rated" ? "Top rated" : pill[0].toUpperCase() + pill.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {sortedAll.map((v) => (
              <a key={v.id} href={`${basePath}/video/${v.id}`} className="no-underline">
                <VideoCard video={v} />
              </a>
            ))}
          </div>
        </section>
      </div>

      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[min(680px,calc(100%-1rem))]">
        <div className="rounded-2xl border border-white/15 bg-[#0e1427]/95 backdrop-blur px-4 py-2 flex items-center justify-around">
          <a href={`${basePath}/reels`} className="text-white/80 hover:text-white text-sm font-medium">Reels</a>
          <a href={basePath} className="text-white text-sm font-semibold">Home</a>
          <a href={`${basePath}/account`} className="text-white/80 hover:text-white text-sm font-medium">Profile</a>
        </div>
      </nav>
    </main>
  );
}

