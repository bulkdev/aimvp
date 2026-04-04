"use client";

import { useState } from "react";
import type { GoogleReviewsImportResponse } from "@/types";
import { readResponseJson } from "@/lib/readResponseJson";

type ReviewRow = {
  reviewerName: string;
  rating: number;
  text: string;
  reviewUrl: string;
  reviewAge: string;
  avatarLetter: string;
};

export default function GoogleReviewsImportBar({
  onImported,
}: {
  onImported: (reviews: ReviewRow[], meta: { placeName?: string; notes?: string[] }) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function runImport() {
    setMessage(null);
    const trimmed = url.trim();
    if (!trimmed) {
      setMessage({ kind: "err", text: "Paste a Google Maps link first." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/google-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await readResponseJson<GoogleReviewsImportResponse & { error?: string; details?: string }>(res);
      if (!res.ok) {
        throw new Error(data.details ? `${data.error} (${data.details})` : data.error || "Import failed.");
      }
      const rows: ReviewRow[] = data.reviews.map((r) => ({
        reviewerName: r.reviewerName || "Reviewer",
        rating: Math.max(1, Math.min(5, Number(r.rating) || 5)),
        text: r.text || "",
        reviewUrl: r.reviewUrl?.trim() || "",
        reviewAge: r.reviewAge?.trim() || "",
        avatarLetter: (r.avatarLetter || r.reviewerName?.charAt(0) || "R").slice(0, 1).toUpperCase(),
      }));
      onImported(rows, { placeName: data.placeName, notes: data.notes });
      const extra = data.notes?.length ? ` ${data.notes.join(" ")}` : "";
      setMessage({
        kind: "ok",
        text:
          rows.length === 0
            ? `No reviews returned for ${data.placeName || "this place"}.${extra}`
            : `Imported ${rows.length} review${rows.length === 1 ? "" : "s"}${data.placeName ? ` — ${data.placeName}` : ""}.${extra}`,
      });
    } catch (e) {
      setMessage({ kind: "err", text: e instanceof Error ? e.message : "Import failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
      <p className="text-[11px] text-white/55 leading-snug">
        Paste your public Google Maps or Business Profile link. Requires{" "}
        <code className="text-white/70">GOOGLE_PLACES_API_KEY</code> and Places API (New) on the server.         Google only
        exposes up to <strong className="text-white/70">five</strong> reviews per place on this API—there is no second
        batch or pagination. Imports are ordered <strong className="text-white/70">newest first</strong> when times are
        available. Use <strong className="text-white/70">Add Review</strong> for any additional quotes.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <input
          className="flex-1 bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://maps.google.com/... or maps.app.goo.gl/..."
          disabled={loading}
        />
        <button
          type="button"
          disabled={loading}
          className="shrink-0 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold"
          onClick={() => void runImport()}
        >
          {loading ? "Importing…" : "Import from Google"}
        </button>
      </div>
      {message ? (
        <p className={`text-xs ${message.kind === "ok" ? "text-emerald-300/95" : "text-red-300/95"}`}>{message.text}</p>
      ) : null}
    </div>
  );
}
