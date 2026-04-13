"use client";

import type { CreatorEmote } from "@/types";

export default function EmotePicker({
  emotes,
  onPick,
}: {
  emotes: CreatorEmote[];
  onPick: (code: string) => void;
}) {
  if (emotes.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {emotes.map((e) => (
        <button
          type="button"
          key={e.code}
          onClick={() => onPick(e.code)}
          className="px-2 py-1 rounded border border-white/15 text-white/80 hover:bg-white/10 text-xs"
          title={e.label}
        >
          {e.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.imageUrl} alt={e.label} className="h-4 w-4 inline-block" />
          ) : (
            e.code
          )}
        </button>
      ))}
    </div>
  );
}

