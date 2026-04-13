import type { CreatorVideo } from "@/types";

export default function VideoPlayer({
  video,
  progressPct,
}: {
  video: CreatorVideo;
  progressPct: number;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0e1427] p-4">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        {video.fullVideoUrl ? (
          <video src={video.fullVideoUrl} controls className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/45">Video not uploaded yet</div>
        )}
      </div>
      <h1 className="mt-4 text-2xl text-white font-semibold">{video.title}</h1>
      <p className="mt-1 text-white/70">{video.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {video.tags.map((t) => <span key={t} className="px-2 py-1 rounded bg-white/10 text-white/75 text-xs">#{t}</span>)}
      </div>
      <div className="mt-4">
        <div className="h-2 rounded bg-white/10">
          <div className="h-full rounded bg-violet-400" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-white/60 text-xs mt-1">Watch completion: {Math.round(progressPct)}%</p>
      </div>
    </div>
  );
}

