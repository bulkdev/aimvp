import type { CreatorVideo } from "@/types";

export default function VideoCard({
  video,
  progressPct = 0,
  watched = false,
}: {
  video: CreatorVideo;
  progressPct?: number;
  watched?: boolean;
}) {
  const mins = Math.floor(video.durationSec / 60);
  const secs = String(video.durationSec % 60).padStart(2, "0");
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="relative">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnailUrl} alt={video.title} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-gradient-to-br from-violet-500/20 to-cyan-500/20" />
        )}
        <span className="absolute right-2 bottom-2 text-xs bg-black/70 text-white rounded px-2 py-1">{mins}:{secs}</span>
      </div>
      <div className="p-3">
        <p className="text-white font-medium line-clamp-2">{video.title}</p>
        <div className="mt-1 text-xs text-white/60 flex items-center justify-between">
          <span>{video.views.toLocaleString()} views</span>
          <span>{watched ? "Watched ✓" : `${Math.round(progressPct)}% watched`}</span>
        </div>
        <div className="mt-2 h-1.5 bg-white/10 rounded">
          <div className="h-full rounded bg-violet-400" style={{ width: `${Math.max(0, Math.min(100, progressPct))}%` }} />
        </div>
      </div>
    </article>
  );
}

