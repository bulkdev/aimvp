"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { GeneratedSiteContent } from "@/types";
import type { SiteTemplateVariant } from "@/lib/siteVariant";

const DEFAULT_STATS: { label: string; value: string }[] = [
  { value: "500+", label: "Projects completed" },
  { value: "4.9", label: "Avg. star rating" },
  { value: "A+", label: "BBB rating" },
  { value: "100%", label: "Licensed & insured" },
  { value: "15+", label: "Years in business" },
];

export default function StatsSection({
  content,
  siteVariant,
  parallaxImageUrl,
  parallaxOverlayOpacity = 100,
}: {
  content: GeneratedSiteContent;
  siteVariant: SiteTemplateVariant;
  /** Optional parallax layer behind the ticker (admin). */
  parallaxImageUrl?: string;
  /** 0–100: scrim strength over the parallax image */
  parallaxOverlayOpacity?: number;
}) {
  const items = (content.assets?.siteStats?.length ? content.assets.siteStats : DEFAULT_STATS).filter(
    (s) => s.label?.trim() && s.value?.trim()
  );
  const dark = siteVariant === "renovations";
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  if (items.length === 0) return null;

  const showParallax = Boolean(parallaxImageUrl?.trim());
  const scrim = Math.min(100, Math.max(0, parallaxOverlayOpacity)) / 100;

  const statCells = (dupKey: number) => (
    <div className="flex w-max gap-0" aria-hidden={dupKey === 1 ? true : undefined}>
      {items.map((s, i) => (
        <div
          key={`${dupKey}-${s.label}-${i}`}
          className={`flex shrink-0 items-center gap-3 border-r px-8 py-2 last:border-r-0 md:px-12 md:py-3 ${
            dark ? "border-white/10 bg-transparent" : "border-black/[0.06] bg-transparent"
          }`}
          style={
            dark
              ? {
                  borderLeftWidth: 3,
                  borderLeftColor: "color-mix(in srgb, var(--accent) 55%, transparent)",
                  borderRightColor: "rgba(255,255,255,0.08)",
                }
              : {
                  borderLeftWidth: 3,
                  borderLeftColor: "color-mix(in srgb, var(--accent) 70%, var(--primary) 30%)",
                }
          }
        >
          <p
            className="text-[clamp(1.35rem,3.5vw,2.35rem)] font-bold tabular-nums leading-none tracking-tight"
            style={{
              fontFamily: "var(--h-font)",
              color: dark ? "color-mix(in srgb, var(--accent) 88%, white)" : "var(--accent)",
            }}
          >
            {s.value}
          </p>
          <p
            className={`max-w-[8.5rem] text-[10px] font-semibold uppercase leading-snug tracking-[0.14em] md:max-w-[10rem] md:text-[11px] ${
              dark ? "text-stone-400" : "text-slate-600"
            }`}
          >
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <section
      ref={sectionRef}
      id="stats"
      className={
        dark
          ? "relative overflow-hidden border-y border-white/[0.07] bg-[#0c0a09] py-10 md:py-12"
          : "relative overflow-hidden border-y border-black/[0.06] bg-slate-50 py-10 md:py-12"
      }
      style={{
        boxShadow: dark
          ? "inset 0 1px 0 0 color-mix(in srgb, var(--accent) 35%, transparent)"
          : "inset 0 1px 0 0 color-mix(in srgb, var(--accent) 25%, transparent)",
      }}
    >
      {showParallax && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 scale-110 opacity-50"
          style={{ y: bgY }}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={parallaxImageUrl!.trim()} alt="" className="h-full min-h-full w-full object-cover" />
          <div
            className={`absolute inset-0 ${dark ? "bg-gradient-to-b from-[#0c0a09]/95 via-[#0c0a09]/88 to-[#0c0a09]/95" : "bg-gradient-to-b from-white/90 via-white/85 to-slate-50/95"}`}
            style={{ opacity: scrim }}
          />
        </motion.div>
      )}

      {!showParallax && !dark && (
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(105deg, transparent 0%, color-mix(in srgb, var(--accent) 18%, transparent) 45%, transparent 90%)`,
          }}
        />
      )}
      {!showParallax && dark && (
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            background: `radial-gradient(ellipse 90% 60% at 50% 40%, color-mix(in srgb, var(--accent) 28%, transparent), transparent 65%)`,
          }}
        />
      )}

      <div className="relative z-[1]">
        <p
          className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.26em] md:text-[11px]"
          style={{
            color: dark ? "color-mix(in srgb, var(--accent) 78%, white)" : "var(--accent)",
            textDecoration: "underline",
            textDecorationColor: "color-mix(in srgb, var(--accent) 45%, transparent)",
            textUnderlineOffset: "6px",
          }}
        >
          By the numbers
        </p>
        <div className="relative overflow-hidden">
          <div className="animate-stats-marquee flex w-max">
            {statCells(0)}
            {statCells(1)}
          </div>
        </div>
      </div>
    </section>
  );
}
