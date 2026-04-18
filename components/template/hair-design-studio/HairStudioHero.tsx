"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useHairStudio } from "./HairStudioContext";
import { firstHeroStillFromSlides, firstHeroVideoFromSlides } from "../window-tint/tintLuxuryConstants";

const FALLBACK_POSTER =
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=2400&q=85";

export default function HairStudioHero({
  title,
  subtitle,
  ctaText,
  secondaryCta,
  heroSlides,
  tintHeroVideoUrl,
  tintHeroVideoPosterUrl,
}: {
  title: string;
  subtitle: string;
  ctaText: string;
  secondaryCta?: string;
  heroSlides?: string[];
  tintHeroVideoUrl?: string;
  tintHeroVideoPosterUrl?: string;
}) {
  const reduceMotion = useReducedMotion();
  const { openBooking, studio, locationId, setLocationId } = useHairStudio();
  const activeLoc = studio.locations.find((l) => l.id === locationId) ?? studio.locations[0]!;

  const video = tintHeroVideoUrl?.trim() || firstHeroVideoFromSlides(heroSlides) || null;
  const poster =
    tintHeroVideoPosterUrl?.trim() || firstHeroStillFromSlides(heroSlides) || FALLBACK_POSTER;

  return (
    <section id="hds-hero" className="relative min-h-[100dvh] flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        {video ? (
          <video
            className="absolute inset-0 h-full w-full object-cover scale-[1.02]"
            autoPlay
            muted
            loop
            playsInline
            poster={poster}
            src={video}
          />
        ) : (
          <motion.div
            className="absolute inset-0 h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${poster})` }}
            animate={reduceMotion ? undefined : { scale: [1, 1.05] }}
            transition={reduceMotion ? undefined : { duration: 22, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050506] via-[#070708]/88 to-[#0a0a0c]/55" />
        <div className="absolute inset-0 mix-blend-soft-light bg-[radial-gradient(ellipse_at_20%_0%,rgba(212,225,87,0.12),transparent_50%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 md:px-10 pb-16 md:pb-24 pt-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[11px] uppercase tracking-[0.45em] text-[#d4e157]/90 mb-4"
        >
          {activeLoc.shortLabel} studio · {activeLoc.address.split(",")[0]}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-[18ch] text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.95] text-[#f4f1ea]"
          style={{ fontFamily: "var(--font-hds-display)" }}
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mt-6 max-w-xl text-base md:text-lg text-zinc-400 leading-relaxed"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <button
            type="button"
            onClick={openBooking}
            className="rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] bg-[#d4e157] text-zinc-950 hover:brightness-110 transition-all shadow-[0_0_48px_rgba(212,225,87,0.35)]"
          >
            {ctaText}
          </button>
          {secondaryCta ? (
            <a
              href="#hds-services"
              className="rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] border border-white/20 text-[#f4f1ea] hover:bg-white/5 transition-colors"
            >
              {secondaryCta}
            </a>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-14 flex flex-wrap gap-2"
        >
          {studio.locations.map((loc) => (
            <button
              key={loc.id}
              type="button"
              onClick={() => setLocationId(loc.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                locationId === loc.id
                  ? "border-[#d4e157]/50 bg-[#d4e157]/10"
                  : "border-white/10 bg-black/30 hover:border-white/20"
              }`}
            >
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{loc.shortLabel}</p>
              <p className="text-sm text-[#f4f1ea] mt-1 font-medium">{loc.name}</p>
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
