"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Full-bleed parallax image behind standalone SEO subpage content.
 * When `imageUrl` is empty, renders children only (no fallback image).
 */
export default function SubpageParallaxBackdrop({
  imageUrl,
  overlayOpacity = 100,
  children,
}: {
  imageUrl?: string;
  /** 0–100 scrim strength over the image */
  overlayOpacity?: number;
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-14%", "14%"]);
  const trimmed = imageUrl?.trim();
  const scrim = Math.min(100, Math.max(0, overlayOpacity)) / 100;

  if (!trimmed) {
    return <div className="relative">{children}</div>;
  }

  return (
    <div ref={wrapRef} className="relative overflow-hidden">
      <motion.div
        className="pointer-events-none absolute inset-0 z-0 scale-[1.12]"
        style={{ y }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={trimmed} alt="" className="h-full min-h-full w-full object-cover opacity-[0.22]" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-white/92 via-white/88 to-white/95"
          style={{ opacity: scrim }}
        />
      </motion.div>
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
