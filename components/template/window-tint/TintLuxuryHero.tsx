"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TINT_FALLBACK_HERO } from "./tintLuxuryConstants";

function FloatingParticles() {
  const dots = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${(i * 17) % 100}%`,
        top: `${(i * 23) % 100}%`,
        delay: (i % 12) * 0.15,
        dur: 4 + (i % 5),
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute h-px w-8 rounded-full bg-gradient-to-r from-transparent via-violet-400/40 to-transparent"
          style={{ left: d.left, top: d.top }}
          animate={{ opacity: [0.15, 0.55, 0.15], x: [0, 18, -10, 0], y: [0, -22, 8, 0] }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function TintLuxuryHero({
  title,
  subtitle,
  ctaText,
  secondaryCta,
  backgroundVideoUrl,
  posterUrl,
  backgroundImageUrl,
  onPrimaryCta,
  onSecondaryCta,
}: {
  title: string;
  subtitle: string;
  ctaText: string;
  secondaryCta?: string;
  /** mp4/webm URL; optional — if missing, a still image is used. */
  backgroundVideoUrl?: string | null;
  /** Video poster + fallback still while video loads or after error. */
  posterUrl: string;
  /** Ken Burns still when there is no video (or video failed). */
  backgroundImageUrl: string;
  onPrimaryCta: () => void;
  onSecondaryCta: () => void;
}) {
  const [videoFailed, setVideoFailed] = useState(false);
  const words = title.trim().split(/\s+/);

  const showVideo = Boolean(backgroundVideoUrl?.trim()) && !videoFailed;

  useEffect(() => {
    setVideoFailed(false);
  }, [backgroundVideoUrl]);

  return (
    <section
      id="tint-luxury-hero"
      className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden bg-[#030306]"
    >
      <div className="absolute inset-0">
        {showVideo ? (
          <video
            key={backgroundVideoUrl!}
            className="absolute inset-0 h-full w-full object-cover scale-[1.03]"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={posterUrl || TINT_FALLBACK_HERO}
            onError={() => setVideoFailed(true)}
          >
            <source src={backgroundVideoUrl!} />
          </video>
        ) : (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 18, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImageUrl || posterUrl || TINT_FALLBACK_HERO}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              fetchPriority="high"
            />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#030306]/80 via-[#050508]/70 to-[#030306]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-950/50 via-transparent to-cyan-950/30" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <FloatingParticles />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-10 pb-20 md:pb-28 pt-32 md:pt-40 w-full">
        <p
          className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.55em] text-violet-300/90 mb-6"
          style={{ fontFamily: "var(--font-tint-body)" }}
        >
          Precision film · Factory-grade finish
        </p>
        <h1
          className="max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight text-white"
          style={{ fontFamily: "var(--font-tint-display)" }}
        >
          {words.map((w, i) => (
            <span key={`${w}-${i}`} className="inline-block overflow-hidden mr-[0.25em] last:mr-0">
              <motion.span
                className="inline-block bg-gradient-to-br from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent"
                initial={{ y: "100%", rotateX: -22, opacity: 0 }}
                animate={{ y: 0, rotateX: 0, opacity: 1 }}
                transition={{
                  delay: 0.15 + i * 0.07,
                  duration: 0.85,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          className="mt-6 max-w-xl text-base md:text-lg text-zinc-400 leading-relaxed"
          style={{ fontFamily: "var(--font-tint-body)" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.8 }}
        >
          {subtitle}
        </motion.p>
        <motion.div
          className="mt-10 flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.7 }}
        >
          <motion.button
            type="button"
            onClick={onPrimaryCta}
            whileTap={{ scale: 0.98 }}
            className="relative rounded-full px-10 py-4 text-sm font-semibold tracking-wide text-white overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:brightness-110 transition-[filter] duration-300"
          >
            <span className="relative z-10 drop-shadow-[0_0_24px_rgba(139,92,246,0.5)]">{ctaText}</span>
          </motion.button>
          {secondaryCta ? (
            <button
              type="button"
              onClick={onSecondaryCta}
              className="rounded-full border border-white/20 bg-white/[0.04] px-8 py-3.5 text-sm font-medium text-zinc-200 backdrop-blur-md hover:border-violet-400/40 hover:bg-violet-500/10 transition-all duration-300"
            >
              {secondaryCta}
            </button>
          ) : null}
        </motion.div>
      </div>
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#030306] to-transparent z-[5]" />
    </section>
  );
}
