import type { CreatorReel } from "@/types";

export default function ReelCard({ reel }: { reel: CreatorReel }) {
  return (
    <article className="snap-start min-w-[260px] max-w-[260px] rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
      <div className="aspect-[9/16] bg-black/50 flex items-center justify-center">
        {reel.previewVideoUrl ? (
          <video src={reel.previewVideoUrl} className="h-full w-full object-cover" muted playsInline controls />
        ) : (
          <div className="text-white/50 text-sm">Preview clip</div>
        )}
      </div>
      <div className="p-3">
        <p className="text-white text-sm font-medium line-clamp-2">{reel.title}</p>
        <a href="#pricing" className="mt-2 inline-block text-violet-300 text-sm hover:text-violet-200">Unlock full video</a>
      </div>
    </article>
  );
}

