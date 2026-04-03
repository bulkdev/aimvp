"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import type { GeneratedSiteContent } from "@/types";
import { normalizePortfolioLayout } from "@/lib/portfolioLayout";
import { clampPortfolioHomePreviewCount } from "@/lib/portfolioPreview";
import { publishedNavHref } from "@/lib/published-nav-hrefs";
import PortfolioLightbox from "@/components/template/sections/PortfolioLightbox";

const DEFAULT_GALLERIES: string[][] = [
  [
    "https://images.unsplash.com/photo-1600566753190-acf35178c2c0?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=900&q=82",
  ],
  [
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfe1?auto=format&fit=crop&w=900&q=82",
  ],
  [
    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=82",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0746e?auto=format&fit=crop&w=900&q=82",
  ],
];

/** Rotating aspects for feed tiles (masonry layout). */
const MASONRY_ASPECTS = ["aspect-[4/5]", "aspect-[3/4]", "aspect-square", "aspect-[5/4]", "aspect-[3/4]", "aspect-[4/5]"];

function useMasonryColumnCount(): number {
  const [n, setN] = useState(2);
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1024) setN(4);
      else if (w >= 640) setN(3);
      else setN(2);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return n;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function RenovationsInstagramFeed({
  content,
  layoutMode: layoutModeProp,
  publishedBasePath,
  standalonePortfolioPage = false,
}: {
  content: GeneratedSiteContent;
  layoutMode?: string;
  /** When set, “See more” links to `/slug/work` instead of `#work`. */
  publishedBasePath?: string;
  /** `/slug/work` standalone SEO page: show every photo, no preview cap or “See more” UI. */
  standalonePortfolioPage?: boolean;
}) {
  const layout = normalizePortfolioLayout(layoutModeProp ?? content.assets?.designVariants?.ourWork);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [sliderIdx, setSliderIdx] = useState(0);

  const social = content.assets?.socialLinks;
  const hasSocial =
    Boolean(social?.facebook?.trim()) ||
    Boolean(social?.instagram?.trim()) ||
    Boolean(social?.linkedin?.trim()) ||
    Boolean(social?.x?.trim());

  const configured = (content.assets?.portfolioEntries ?? []).filter((e) => e.photos?.length);
  const galleries =
    content.assets?.portfolioProjects && content.assets.portfolioProjects.length > 0
      ? content.assets.portfolioProjects
      : DEFAULT_GALLERIES;

  const tiles: { src: string }[] =
    configured.length > 0
      ? configured.flatMap((e) => e.photos.map((src) => ({ src })))
      : galleries.flatMap((g) => g.map((src) => ({ src })));

  const allTiles = tiles.slice(0, 200);
  const previewLimit = clampPortfolioHomePreviewCount(content.assets?.portfolioHomePreviewCount);
  const hasOverflow = !standalonePortfolioPage && allTiles.length > previewLimit;
  const sharpTiles = hasOverflow ? allTiles.slice(0, previewLimit - 1) : allTiles;
  const teaserSrc = hasOverflow ? allTiles[previewLimit - 1]?.src : null;

  const sliderTiles = hasOverflow ? allTiles.slice(0, previewLimit - 1) : allTiles;
  const workHref = publishedNavHref(publishedBasePath, "work");

  const allPhotoUrls = allTiles.map((t) => t.src);

  const masonryColumnCount = useMasonryColumnCount();

  type MasonryEntry =
    | { kind: "photo"; tile: { src: string }; index: number; aspectClass: string }
    | { kind: "teaser"; src: string; aspectClass: string };

  /** Round-robin into columns — no height balancing. */
  const masonryColumns = useMemo(() => {
    const entries: MasonryEntry[] = sharpTiles.map((tile, i) => ({
      kind: "photo" as const,
      tile,
      index: i,
      aspectClass: MASONRY_ASPECTS[i % MASONRY_ASPECTS.length],
    }));
    if (teaserSrc) {
      entries.push({ kind: "teaser", src: teaserSrc, aspectClass: "aspect-square" });
    }
    const n = masonryColumnCount;
    const cols: MasonryEntry[][] = Array.from({ length: n }, () => []);
    entries.forEach((entry, i) => {
      cols[i % n].push(entry);
    });
    return cols;
  }, [sharpTiles, teaserSrc, masonryColumnCount]);

  useEffect(() => {
    setSliderIdx(0);
  }, [sliderTiles.length, layout]);

  useEffect(() => {
    if (sliderIdx >= sliderTiles.length) setSliderIdx(0);
  }, [sliderIdx, sliderTiles.length]);

  useEffect(() => {
    if (layout !== "slider" || sliderTiles.length === 0) return;
    function onKey(e: KeyboardEvent) {
      if (lightboxIndex === null) {
        if (e.key === "ArrowRight") setSliderIdx((v) => (v + 1) % sliderTiles.length);
        if (e.key === "ArrowLeft") setSliderIdx((v) => (v - 1 + sliderTiles.length) % sliderTiles.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layout, sliderTiles.length, lightboxIndex]);

  const current = sliderTiles[sliderIdx];

  return (
    <section id="work" className="bg-stone-50 py-20 md:py-28">
      <div className="mx-auto max-w-screen-2xl px-5 md:px-10">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h2
              className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold tracking-tight text-stone-900"
              style={{ fontFamily: "var(--h-font)" }}
            >
              Project feed
            </h2>
            {!standalonePortfolioPage ? (
              <Link
                href={workHref}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-stone-50"
              >
                See more
                <span aria-hidden className="translate-y-px">
                  →
                </span>
              </Link>
            ) : null}
          </div>
          {hasSocial ? (
            <div className="flex flex-wrap items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm shadow-sm">
              <span className="font-semibold text-stone-800">Follow Us</span>
              <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
                {social?.facebook?.trim() ? (
                  <a
                    href={social.facebook.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-600 transition hover:text-[#1877F2]"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" strokeWidth={1.75} />
                  </a>
                ) : null}
                {social?.instagram?.trim() ? (
                  <a
                    href={social.instagram.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-600 transition hover:text-pink-600"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" strokeWidth={1.75} />
                  </a>
                ) : null}
                {social?.linkedin?.trim() ? (
                  <a
                    href={social.linkedin.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-600 transition hover:text-[#0A66C2]"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" strokeWidth={1.75} />
                  </a>
                ) : null}
                {social?.x?.trim() ? (
                  <a
                    href={social.x.trim()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-600 transition hover:text-stone-900"
                    aria-label="X"
                  >
                    <XIcon className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {allTiles.length === 0 ? (
          <p className="text-center text-stone-500">Add portfolio photos in the site editor.</p>
        ) : layout === "slider" ? (
          <div className="relative mx-auto max-w-4xl">
            <div className="relative min-h-[min(70vh,560px)] w-full overflow-hidden rounded-xl bg-stone-200 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current?.src}
                alt=""
                className="h-full min-h-[min(70vh,560px)] w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSliderIdx((v) => (v - 1 + sliderTiles.length) % sliderTiles.length)}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-xl text-white backdrop-blur-sm"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => setSliderIdx((v) => (v + 1) % sliderTiles.length)}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-xl text-white backdrop-blur-sm"
                aria-label="Next"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex(sliderIdx)}
                className="absolute bottom-3 right-3 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-stone-900 shadow-md"
              >
                Expand
              </button>
            </div>
            <p className="mt-3 text-center text-sm text-stone-500">
              {sliderIdx + 1} / {sliderTiles.length}
              {hasOverflow ? (
                <span className="text-stone-400">
                  {" "}
                  · {allTiles.length} total
                </span>
              ) : null}
            </p>
            {hasOverflow ? (
              <p className="mt-2 text-center">
                <Link href={workHref} className="text-sm font-semibold text-[var(--accent)] hover:underline">
                  See all photos →
                </Link>
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {sliderTiles.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setSliderIdx(i)}
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: i === sliderIdx ? 28 : 8,
                    background: i === sliderIdx ? "var(--accent)" : "rgba(0,0,0,0.2)",
                  }}
                />
              ))}
            </div>
          </div>
        ) : layout === "grid-3" ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-3">
            {sharpTiles.map((tile, i) => (
              <button
                key={`${tile.src}-${i}`}
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="group relative aspect-square overflow-hidden rounded-md bg-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.src}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            ))}
            {teaserSrc ? (
              <Link
                href={workHref}
                className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-stone-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={teaserSrc}
                  alt=""
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl brightness-75"
                />
                <div className="absolute inset-0 bg-stone-900/35" />
                <span className="relative z-[1] text-center text-lg font-bold tracking-tight text-white drop-shadow-md">
                  + See more
                </span>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="flex gap-2 md:gap-3">
            {masonryColumns.map((col, colIdx) => (
              <div key={colIdx} className="flex min-w-0 flex-1 flex-col gap-2">
                {col.map((entry) =>
                  entry.kind === "photo" ? (
                    <button
                      key={`${entry.tile.src}-${entry.index}`}
                      type="button"
                      onClick={() => setLightboxIndex(entry.index)}
                      className={`group relative w-full overflow-hidden rounded-md bg-stone-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${entry.aspectClass}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.tile.src}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        View
                      </div>
                    </button>
                  ) : (
                    <Link
                      key="feed-teaser"
                      href={workHref}
                      className={`group relative block w-full overflow-hidden rounded-md bg-stone-300 ${entry.aspectClass}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.src}
                        alt=""
                        className="h-full w-full scale-110 object-cover blur-xl brightness-75"
                      />
                      <div className="absolute inset-0 bg-stone-900/35" />
                      <span className="absolute inset-0 flex items-center justify-center text-center text-lg font-bold tracking-tight text-white drop-shadow-md">
                        + See more
                      </span>
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIndex !== null && allPhotoUrls.length > 0 ? (
        <PortfolioLightbox
          photos={allPhotoUrls}
          serviceType="Project feed"
          initialSlide={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </section>
  );
}
