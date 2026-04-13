"use client";

import type { ChangeEvent } from "react";

export type VideoSortMode = "newest" | "oldest" | "most-viewed" | "most-engagement";

export default function FilterBar({
  search,
  category,
  categories,
  sort,
  onSearch,
  onCategory,
  onSort,
}: {
  search: string;
  category: string;
  categories: string[];
  sort: VideoSortMode;
  onSearch: (v: string) => void;
  onCategory: (v: string) => void;
  onSort: (v: VideoSortMode) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] mb-5">
      <input
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
        placeholder="Search videos..."
        className="rounded-lg border border-white/15 bg-white/[0.04] text-white px-3 py-2"
      />
      <select
        value={category}
        onChange={(e) => onCategory(e.target.value)}
        className="rounded-lg border border-white/15 bg-[#11172b] text-white px-3 py-2"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option value={c} key={c}>{c}</option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(e) => onSort(e.target.value as VideoSortMode)}
        className="rounded-lg border border-white/15 bg-[#11172b] text-white px-3 py-2"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="most-viewed">Most viewed</option>
        <option value="most-engagement">Most engagement</option>
      </select>
    </div>
  );
}

