"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const IMG =
  "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?auto=format&fit=crop&w=2400&q=82";

/** Full-bleed parallax strip — use between major sections for visual rhythm. */
export default function RenovationsParallaxBand({
  parallaxOverlayOpacity = 100,
}: {
  /** 0–100: dark gradient scrim over the image */
  parallaxOverlayOpacity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const scrim = Math.min(100, Math.max(0, parallaxOverlayOpacity)) / 100;

  return (
    <div ref={ref} className="relative h-[min(52vh,520px)] overflow-hidden">
      <motion.div className="absolute inset-0 scale-125" style={{ y }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IMG} alt="" className="h-full w-full object-cover" />
      </motion.div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0c0a09]/90 via-[#0c0a09]/55 to-transparent"
        style={{ opacity: scrim }}
      />
      <div className="relative z-[1] flex h-full max-w-screen-xl items-center px-6 md:px-12 lg:px-16">
        <blockquote className="max-w-lg">
          <p className="theme-accent-muted text-xs font-semibold uppercase tracking-[0.25em]">On every job site</p>
          <p
            className="mt-4 text-[clamp(1.35rem,2.8vw,2rem)] font-medium leading-snug text-white"
            style={{ fontFamily: "var(--h-font)" }}
          >
            Precision isn&apos;t a phase — it&apos;s how we protect your schedule, your space, and your investment.
          </p>
        </blockquote>
      </div>
    </div>
  );
}
