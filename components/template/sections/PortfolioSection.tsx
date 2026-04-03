"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { GeneratedSiteContent } from "@/types";
import { normalizePortfolioLayout, type PortfolioLayoutMode } from "@/lib/portfolioLayout";
import { clampPortfolioHomePreviewCount } from "@/lib/portfolioPreview";
import { publishedNavHref } from "@/lib/published-nav-hrefs";
import PortfolioLightbox from "./PortfolioLightbox";

interface Props {
  content: GeneratedSiteContent;
  /** Saved as `designVariants.ourWork` — legacy values are normalized. */
  styleVariant?: string;
  /** Published site base path for `/work` link; preview uses `#work`. */
  publishedBasePath?: string;
  /** `/slug/work` standalone page: show all projects / slides (no home preview cap). */
  standalonePortfolioPage?: boolean;
}

const DEFAULT_PROJECT_GALLERIES: string[][] = [
  [
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1400&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1400&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1581578021269-4819f2e6d697?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1607400201889-565b1ee75cfc?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=80",
  ],
];

const MASONRY_HEIGHTS = [260, 340, 290, 380, 270, 360];

type Card = {
  serviceType: string;
  review: string;
  photos: string[];
  rating: number;
  projectName: string;
};

function shortReview(serviceTitle: string): string {
  const lower = serviceTitle.toLowerCase();
  if (lower.includes("emergency")) return "They arrived fast, fixed the issue in one visit, and left everything clean.";
  if (lower.includes("drain")) return "Drain is flowing perfectly now. Great communication and fair pricing.";
  if (lower.includes("install")) return "Install was clean and code-compliant. Professional team start to finish.";
  return "Excellent workmanship and clear updates throughout the whole job.";
}

function PortfolioCard({
  item,
  layout,
  minHeight,
  onOpen,
}: {
  item: Card;
  layout: PortfolioLayoutMode;
  minHeight: number;
  onOpen: () => void;
}) {
  const isGrid = layout === "grid-3";
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        position: "relative",
        width: "100%",
        minHeight,
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: isGrid ? "0 4px 16px rgba(0,0,0,0.12)" : "0 8px 32px rgba(0,0,0,0.18)",
        border: isGrid ? "1px solid rgba(15,23,42,0.08)" : "1px solid rgba(255,255,255,0.2)",
        textAlign: "left",
      }}
      className="group transition-transform duration-200 hover:-translate-y-1"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.photos[0]}
        alt={`${item.serviceType} project`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isGrid
            ? "linear-gradient(180deg, rgba(11,18,32,0.06) 35%, rgba(11,18,32,0.62) 100%)"
            : "linear-gradient(180deg, rgba(11,18,32,0.12) 35%, rgba(11,18,32,0.84) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          minHeight,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px",
        }}
      >
        <span
          style={{
            alignSelf: "flex-start",
            background: "color-mix(in srgb, var(--accent) 86%, #000 14%)",
            color: "white",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            borderRadius: "999px",
            padding: "7px 12px",
          }}
        >
          {item.serviceType}
        </span>

        <div
          style={{
            background: "rgba(11,18,32,0.65)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "14px",
            padding: "14px",
            backdropFilter: "blur(3px)",
          }}
        >
          <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
            {Array.from({ length: item.rating }).map((_, idx) => (
              <span key={idx} style={{ color: "var(--accent)", fontSize: "14px", lineHeight: 1 }}>
                ★
              </span>
            ))}
          </div>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.92)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            &ldquo;{item.review}&rdquo;
          </p>
        </div>
      </div>
    </button>
  );
}

export default function PortfolioSection({
  content,
  styleVariant,
  publishedBasePath,
  standalonePortfolioPage = false,
}: Props) {
  const layout = normalizePortfolioLayout(styleVariant);
  const [activeProjectIdx, setActiveProjectIdx] = useState<number | null>(null);
  const [lightboxInitialSlide, setLightboxInitialSlide] = useState(0);
  const [sliderIdx, setSliderIdx] = useState(0);
  const previewLimit = clampPortfolioHomePreviewCount(content.assets?.portfolioHomePreviewCount);
  const workHref = publishedNavHref(publishedBasePath, "work");

  const configuredCards = (content.assets?.portfolioEntries ?? []).filter(
    (entry) => entry.photos && entry.photos.length > 0
  );

  const projectGalleries =
    content.assets?.portfolioProjects && content.assets.portfolioProjects.length > 0
      ? content.assets.portfolioProjects
      : DEFAULT_PROJECT_GALLERIES;

  const cards: Card[] =
    configuredCards.length > 0
      ? configuredCards.map((entry) => ({
          serviceType: entry.serviceType,
          review: entry.review,
          photos: entry.photos,
          rating: Math.max(1, Math.min(5, entry.rating || 5)),
          projectName: entry.projectName,
        }))
      : content.services.slice(0, 3).map((service, i) => ({
          serviceType: service.title,
          review: shortReview(service.title),
          photos: projectGalleries[i % projectGalleries.length],
          rating: 5,
          projectName: `${service.title} project`,
        }));

  const sliderSlides = cards.flatMap((item, pi) =>
    item.photos.map((src, ph) => ({ src, pi, ph, item }))
  );
  const sliderOverflow = !standalonePortfolioPage && sliderSlides.length > previewLimit;
  const sliderSlidesVisible = sliderOverflow ? sliderSlides.slice(0, previewLimit - 1) : sliderSlides;

  const projectOverflow = !standalonePortfolioPage && cards.length > previewLimit;
  const visibleCards = projectOverflow ? cards.slice(0, previewLimit - 1) : cards;
  const teaserProject = projectOverflow ? cards[previewLimit - 1] : null;

  const activeProject = activeProjectIdx !== null ? cards[activeProjectIdx] : null;

  useEffect(() => {
    setSliderIdx(0);
  }, [cards.length, layout]);

  useEffect(() => {
    if (sliderIdx >= sliderSlidesVisible.length) setSliderIdx(0);
  }, [sliderIdx, sliderSlidesVisible.length]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (layout === "slider" && sliderSlidesVisible.length > 0 && activeProjectIdx === null) {
        if (e.key === "ArrowRight") {
          setSliderIdx((v) => (v + 1) % sliderSlidesVisible.length);
        } else if (e.key === "ArrowLeft") {
          setSliderIdx((v) => (v - 1 + sliderSlidesVisible.length) % sliderSlidesVisible.length);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProjectIdx, layout, sliderSlidesVisible.length]);

  function openModal(projectIndex: number, slideIndex: number) {
    setLightboxInitialSlide(slideIndex);
    setActiveProjectIdx(projectIndex);
  }

  const currentSlide = sliderSlidesVisible[sliderIdx];

  return (
    <section id="work" style={{ background: "#ffffff", padding: "96px 0" }}>
      <div className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <span className="section-label">Proof In The Work</span>
          <h2
            style={{
              fontFamily: "var(--h-font)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
              fontWeight: 700,
              color: "var(--primary)",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Our Work
          </h2>
          <div className="accent-bar" style={{ margin: "0 auto 0" }} />
        </div>

        {layout === "slider" ? (
          sliderSlidesVisible.length === 0 ? (
            <p className="text-center text-slate-500">Add portfolio photos in the site editor.</p>
          ) : (
            <div className="relative mx-auto max-w-4xl">
              <div
                className="relative w-full overflow-hidden rounded-2xl bg-slate-100 shadow-xl"
                style={{ minHeight: "min(72vh, 560px)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentSlide.src}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ minHeight: "min(72vh, 560px)" }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setSliderIdx((v) => (v - 1 + sliderSlidesVisible.length) % sliderSlidesVisible.length)
                  }
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-slate-900/55 text-xl text-white backdrop-blur-sm hover:bg-slate-900/75"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => setSliderIdx((v) => (v + 1) % sliderSlidesVisible.length)}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-slate-900/55 text-xl text-white backdrop-blur-sm hover:bg-slate-900/75"
                  aria-label="Next photo"
                >
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => openModal(currentSlide.pi, currentSlide.ph)}
                  className="absolute bottom-3 right-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-md hover:bg-white"
                >
                  Open gallery
                </button>
              </div>
              <p className="mt-4 text-center font-semibold text-slate-800">{currentSlide.item.projectName}</p>
              <p className="text-center text-sm text-slate-500">
                {sliderIdx + 1} / {sliderSlidesVisible.length} · {currentSlide.item.serviceType}
                {sliderOverflow ? (
                  <span className="text-slate-400"> · {sliderSlides.length} photos total</span>
                ) : null}
              </p>
              {sliderOverflow ? (
                <p className="mt-2 text-center">
                  <Link href={workHref} className="text-sm font-semibold text-[var(--accent)] hover:underline">
                    See full portfolio →
                  </Link>
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {sliderSlidesVisible.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Photo ${i + 1}`}
                    onClick={() => setSliderIdx(i)}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: i === sliderIdx ? 28 : 8,
                      background: i === sliderIdx ? "var(--accent)" : "rgba(15,23,42,0.25)",
                    }}
                  />
                ))}
              </div>
            </div>
          )
        ) : layout === "grid-3" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCards.map((item, i) => (
              <PortfolioCard
                key={`${item.serviceType}-${i}`}
                item={item}
                layout={layout}
                minHeight={280}
                onOpen={() => openModal(i, 0)}
              />
            ))}
            {teaserProject ? (
              <Link
                href={workHref}
                className="group relative block min-h-[280px] overflow-hidden rounded-[18px] border border-slate-200/80 shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={teaserProject.photos[0]}
                  alt=""
                  className="absolute inset-0 h-full w-full scale-105 object-cover blur-2xl brightness-90"
                />
                <div className="absolute inset-0 bg-slate-900/40" />
                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white drop-shadow">
                  + See more
                </span>
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="columns-1 gap-x-4 sm:columns-2 lg:columns-3">
            {visibleCards.map((item, i) => (
              <div key={`${item.serviceType}-${i}`} className="mb-4 break-inside-avoid">
                <PortfolioCard
                  item={item}
                  layout={layout}
                  minHeight={MASONRY_HEIGHTS[i % MASONRY_HEIGHTS.length]}
                  onOpen={() => openModal(i, 0)}
                />
              </div>
            ))}
            {teaserProject ? (
              <div className="mb-4 break-inside-avoid">
                <Link
                  href={workHref}
                  className="group relative block w-full overflow-hidden rounded-[18px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
                  style={{ minHeight: MASONRY_HEIGHTS[visibleCards.length % MASONRY_HEIGHTS.length] }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={teaserProject.photos[0]}
                    alt=""
                    className="absolute inset-0 h-full w-full scale-105 object-cover blur-2xl brightness-90"
                  />
                  <div className="absolute inset-0 bg-slate-900/40" />
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white drop-shadow">
                    + See more
                  </span>
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {activeProject && (
        <PortfolioLightbox
          photos={activeProject.photos}
          serviceType={activeProject.serviceType}
          initialSlide={lightboxInitialSlide}
          onClose={() => setActiveProjectIdx(null)}
        />
      )}
    </section>
  );
}
