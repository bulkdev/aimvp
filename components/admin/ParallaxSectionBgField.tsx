"use client";

import { useRef } from "react";
import { fileToCompressedDataUrl } from "@/lib/clientImage";
import type { ParallaxSectionScope } from "@/lib/parallaxSettings";

export function ParallaxSectionBgField({
  label,
  value,
  onChange,
  overlayOpacity,
  onOverlayOpacityChange,
  scope,
  onScopeChange,
  onError,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  overlayOpacity: number;
  onOverlayOpacityChange: (next: number) => void;
  scope: ParallaxSectionScope;
  onScopeChange: (next: ParallaxSectionScope) => void;
  onError?: (msg: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="block space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">
      <span className="block font-medium text-white/85">{label}</span>
      <input
        className="mt-0.5 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://… or leave empty"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="rounded bg-white/10 px-2 py-1 text-[11px] hover:bg-white/15"
          onClick={() => fileRef.current?.click()}
        >
          Upload image
        </button>
        {value ? (
          <button type="button" className="text-[11px] text-rose-300 hover:underline" onClick={() => onChange("")}>
            Clear
          </button>
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              onChange(await fileToCompressedDataUrl(f, { maxEdge: 2560, quality: 0.88 }));
            } catch (err) {
              onError?.(err instanceof Error ? err.message : "Could not read image.");
            }
            e.target.value = "";
          }}
        />
      </div>
      {value.trim() ? (
        <div className="max-h-16 overflow-hidden rounded border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-12 w-full object-cover" />
        </div>
      ) : null}

      <label className="block text-[11px] text-white/60">
        Overlay strength (0–100%)
        <input
          type="range"
          min={0}
          max={100}
          className="mt-1 block w-full accent-sky-500"
          value={overlayOpacity}
          onChange={(e) => onOverlayOpacityChange(Number(e.target.value))}
        />
        <span className="text-white/45">{overlayOpacity}%</span>
      </label>

      <label className="block text-[11px] text-white/60">
        Show parallax on
        <select
          className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white"
          value={scope}
          onChange={(e) => onScopeChange(e.target.value as ParallaxSectionScope)}
        >
          <option value="both" className="text-slate-900">
            Home + standalone pages
          </option>
          <option value="home" className="text-slate-900">
            Home page only
          </option>
          <option value="subpage" className="text-slate-900">
            Standalone pages only
          </option>
        </select>
      </label>
    </div>
  );
}
