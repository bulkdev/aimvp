import type { CreatorComment, CreatorReaction } from "@/types";

function reactionsForComment(reactions: CreatorReaction[], commentId: string) {
  const map = new Map<string, number>();
  reactions
    .filter((r) => r.commentId === commentId)
    .forEach((r) => map.set(r.emoteCode, (map.get(r.emoteCode) || 0) + 1));
  return [...map.entries()];
}

export default function CommentThread({
  comments,
  reactions,
}: {
  comments: CreatorComment[];
  reactions: CreatorReaction[];
}) {
  const roots = comments.filter((c) => !c.parentId);
  const children = comments.filter((c) => c.parentId);

  return (
    <div className="space-y-3">
      {roots.map((c) => (
        <div key={c.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="text-sm text-white/90">
            <span className={`font-semibold ${c.isCreator ? "text-violet-300" : "text-white"}`}>
              {c.authorName || "Member"}
            </span>{" "}
            {c.highlightedByCreator ? <span className="text-[10px] uppercase tracking-wide text-cyan-300">Creator Pick</span> : null}
          </p>
          <p className="text-white/75 mt-1 text-sm">{c.body}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            {reactionsForComment(reactions, c.id).map(([code, count]) => (
              <span key={`${c.id}-${code}`} className="text-xs px-2 py-1 rounded bg-white/10 text-white/70">
                {code} {count}
              </span>
            ))}
          </div>
          <div className="mt-3 pl-4 border-l border-white/10 space-y-2">
            {children.filter((x) => x.parentId === c.id).map((child) => (
              <div key={child.id}>
                <p className="text-xs text-white/85">
                  <span className={`font-semibold ${child.isCreator ? "text-violet-300" : "text-white"}`}>
                    {child.authorName || "Member"}
                  </span>{" "}
                  {child.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

