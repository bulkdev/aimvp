"use client";

import { useMemo, useState } from "react";
import type { CreatorComment, CreatorEmote, CreatorReaction, CreatorVideo } from "@/types";
import VideoPlayer from "@/components/template/creator/VideoPlayer";
import CommentThread from "@/components/template/creator/CommentThread";
import EmotePicker from "@/components/template/creator/EmotePicker";

export default function CreatorVideoPageClient({
  projectId,
  video,
  progressPct,
  commentsInitial,
  reactionsInitial,
  emotes,
}: {
  projectId: string;
  video: CreatorVideo;
  progressPct: number;
  commentsInitial: CreatorComment[];
  reactionsInitial: CreatorReaction[];
  emotes: CreatorEmote[];
}) {
  const [body, setBody] = useState("");
  const [comments, setComments] = useState(commentsInitial);
  const [reactions, setReactions] = useState(reactionsInitial);
  const videoComments = useMemo(() => comments.filter((c) => c.videoId === video.id), [comments, video.id]);
  const videoReactions = useMemo(() => reactions.filter((r) => r.videoId === video.id || r.commentId), [reactions, video.id]);

  async function postComment() {
    if (!body.trim()) return;
    const res = await fetch("/api/creator/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, videoId: video.id, body }),
    });
    const data = await res.json();
    if (res.ok && data.comment) {
      setComments((prev) => [...prev, data.comment]);
      setBody("");
    }
  }

  async function reactVideo(code: string) {
    const res = await fetch("/api/creator/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, videoId: video.id, emoteCode: code }),
    });
    const data = await res.json();
    if (res.ok && data.reaction) setReactions((prev) => [...prev, data.reaction]);
  }

  return (
    <div className="space-y-6">
      <VideoPlayer video={video} progressPct={progressPct} />
      <div className="rounded-xl border border-white/10 bg-[#0e1427] p-4 space-y-3">
        <h2 className="text-white font-semibold">Comments</h2>
        <EmotePicker emotes={emotes} onPick={reactVideo} />
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-white"
            placeholder="Add a comment..."
          />
          <button type="button" onClick={postComment} className="btn-primary !px-4 !py-2">Post</button>
        </div>
        <CommentThread comments={videoComments} reactions={videoReactions} />
      </div>
    </div>
  );
}

