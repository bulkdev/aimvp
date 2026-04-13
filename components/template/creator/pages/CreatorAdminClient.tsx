"use client";

import { useState } from "react";
import type { CreatorReel, CreatorVideo } from "@/types";

async function upload(projectId: string, targetId: string, assetType: "video" | "reel" | "thumbnail", file: File) {
  const form = new FormData();
  form.set("projectId", projectId);
  form.set("targetId", targetId);
  form.set("assetType", assetType);
  form.set("file", file);
  const res = await fetch("/api/creator/upload", { method: "POST", body: form });
  return res.json();
}

export default function CreatorAdminClient({
  projectId,
  videos,
  reels,
}: {
  projectId: string;
  videos: CreatorVideo[];
  reels: CreatorReel[];
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-5">
      <h1 className="text-white text-2xl font-semibold">Creator Admin</h1>
      <p className="text-white/60">Upload full videos, reels, and thumbnails.</p>
      {message ? <p className="text-sm text-cyan-300">{message}</p> : null}

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-white font-semibold">Videos</h2>
        <div className="mt-3 space-y-3">
          {videos.map((v) => (
            <div key={v.id} className="rounded-lg border border-white/10 p-3">
              <p className="text-white/80 text-sm">{v.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <label className="text-xs text-white/70">
                  Full video
                  <input type="file" accept="video/*" className="block mt-1" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const data = await upload(projectId, v.id, "video", f);
                    setMessage(data.assetUrl ? `Uploaded: ${data.assetUrl}` : data.error || "Upload failed.");
                  }} />
                </label>
                <label className="text-xs text-white/70">
                  Thumbnail
                  <input type="file" accept="image/*" className="block mt-1" onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const data = await upload(projectId, v.id, "thumbnail", f);
                    setMessage(data.assetUrl ? `Uploaded: ${data.assetUrl}` : data.error || "Upload failed.");
                  }} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-white font-semibold">Reels</h2>
        <div className="mt-3 space-y-3">
          {reels.map((r) => (
            <div key={r.id} className="rounded-lg border border-white/10 p-3">
              <p className="text-white/80 text-sm">{r.title}</p>
              <label className="text-xs text-white/70 mt-2 block">
                Reel preview
                <input type="file" accept="video/*" className="block mt-1" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const data = await upload(projectId, r.id, "reel", f);
                  setMessage(data.assetUrl ? `Uploaded: ${data.assetUrl}` : data.error || "Upload failed.");
                }} />
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

