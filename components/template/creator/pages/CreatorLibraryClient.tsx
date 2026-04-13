"use client";

import { useEffect, useMemo, useState } from "react";
import type { CreatorVideo } from "@/types";
import FilterBar, { type VideoSortMode } from "@/components/template/creator/FilterBar";
import VideoCard from "@/components/template/creator/VideoCard";

export default function CreatorLibraryClient({
  projectId,
  categories,
}: {
  projectId: string;
  categories: string[];
}) {
  const [rows, setRows] = useState<CreatorVideo[]>([]);
  const [requestCursor, setRequestCursor] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | null>(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<VideoSortMode>("newest");
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => new URLSearchParams({
    projectId,
    search,
    category,
    sort,
    cursor: String(requestCursor),
    limit: "12",
  }).toString(), [projectId, search, category, sort, requestCursor]);

  useEffect(() => {
    setRows([]);
    setRequestCursor(0);
    setNextCursor(0);
  }, [search, category, sort]);

  useEffect(() => {
    let cancelled = false;
    if (nextCursor === null) return;
    setLoading(true);
    fetch(`/api/creator/videos?${query}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setRows((prev) => (requestCursor === 0 ? d.items : [...prev, ...d.items]));
        setNextCursor(d.nextCursor);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, requestCursor, nextCursor]);

  return (
    <div>
      <FilterBar
        search={search}
        category={category}
        categories={categories}
        sort={sort}
        onSearch={setSearch}
        onCategory={setCategory}
        onSort={setSort}
      />
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.map((v) => (
          <a key={v.id} href={`video/${v.id}`} className="no-underline">
            <VideoCard video={v} />
          </a>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        {nextCursor !== null ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (nextCursor !== null) setRequestCursor(nextCursor);
            }}
            className="rounded-lg border border-white/15 px-4 py-2 text-white/80 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        ) : (
          <p className="text-white/50 text-sm">You reached the end.</p>
        )}
      </div>
    </div>
  );
}

