import type { CreatorSavedVideo, CreatorSubscription, CreatorVideo, CreatorWatchHistory } from "@/types";

export default function CreatorAccountClient({
  subscriptions,
  watchHistory,
  saved,
  videos,
}: {
  subscriptions: CreatorSubscription[];
  watchHistory: CreatorWatchHistory[];
  saved: CreatorSavedVideo[];
  videos: CreatorVideo[];
}) {
  const active = subscriptions.find((s) => s.status === "active" || s.status === "trialing");
  const savedVideos = videos.filter((v) => saved.some((s) => s.videoId === v.id));
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h1 className="text-white font-semibold text-xl">Account</h1>
        <p className="text-white/70 mt-1">
          Membership status:{" "}
          <span className={active ? "text-emerald-300" : "text-amber-300"}>{active ? active.status : "No active membership"}</span>
        </p>
      </section>
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-white font-semibold">Watch history</h2>
        <div className="mt-2 space-y-2">
          {watchHistory.map((w) => {
            const v = videos.find((x) => x.id === w.videoId);
            return (
              <div key={w.id} className="text-sm text-white/75 flex justify-between">
                <span>{v?.title || w.videoId}</span>
                <span>{Math.round(w.progressPct)}%</span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-white font-semibold">Saved videos</h2>
        <ul className="mt-2 space-y-1 text-white/75">
          {savedVideos.map((v) => <li key={v.id}>• {v.title}</li>)}
        </ul>
      </section>
    </div>
  );
}

