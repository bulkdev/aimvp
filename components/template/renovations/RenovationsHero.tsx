"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { applyIntakeLocationToCopy, intakeLocationLine } from "@/lib/location";
import { renoParallaxTileStyle } from "./RenovationsNavbar";

const DEFAULT_SLIDES: { src: string; alt: string }[] = [
  {
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    alt: "Modern home interior",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    alt: "Kitchen renovation",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753190-acf35178c2c0?auto=format&fit=crop&w=1600&q=85",
    alt: "Living space",
  },
  {
    src: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1600&q=85",
    alt: "Bathroom detail",
  },
];

const ROTATE_MS = 6000;

export default function RenovationsHero({
  content,
  intake,
  parallaxOverlayOpacity = 100,
}: {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
  /** 0–100: scrim strength over the custom hero parallax image */
  parallaxOverlayOpacity?: number;
}) {
  const { hero } = content;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  /** Strong parallax: tile layer moves faster than viewport scroll */
  const tileY = useTransform(scrollYProgress, [0, 1], ["0%", "68%"]);
  const tileScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);

  const slides =
    content.assets?.heroSlides && content.assets.heroSlides.length > 0
      ? content.assets.heroSlides.map((src, i) => ({ src, alt: `Project ${i + 1}` }))
      : DEFAULT_SLIDES;

  const [index, setIndex] = useState(0);
  const go = useCallback(
    (i: number) => {
      setIndex(((i % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [slides.length]);

  const subtitle = applyIntakeLocationToCopy(hero.subtitle, intake);
  const loc = intakeLocationLine(intake)?.trim();
  const parallaxBgUrl = content.assets?.heroParallaxBackgroundUrl?.trim();
  const scrim = Math.min(100, Math.max(0, parallaxOverlayOpacity)) / 100;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[min(100svh,960px)] overflow-hidden"
      style={{
        paddingTop: "calc(var(--reno-header-h, 120px) + 0.25rem)",
        backgroundColor: "color-mix(in srgb, var(--primary) 4%, #f5f4f2)",
      }}
    >
      {/* Parallax background — custom image (admin) or default subway tile */}
      <motion.div
        className="pointer-events-none absolute -left-[5%] -top-[18%] h-[135%] w-[110%] will-change-transform"
        style={{ y: tileY, scale: tileScale }}
        aria-hidden
      >
        <div className="relative h-full w-full overflow-hidden">
          {parallaxBgUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={parallaxBgUrl} alt="" className="h-full w-full object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background: "color-mix(in srgb, var(--secondary) 12%, white 88%)",
                  opacity: scrim,
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, color-mix(in srgb, white 28%, transparent), color-mix(in srgb, var(--primary) 8%, white 92%) 55%, color-mix(in srgb, var(--primary) 14%, white 86%))",
                  opacity: scrim,
                }}
              />
            </>
          ) : (
            <div className="h-full w-full" style={renoParallaxTileStyle()} />
          )}
        </div>
      </motion.div>

      <div className="relative z-[1] mx-auto max-w-screen-2xl px-4 pb-16 pt-0 md:px-8 md:pb-24 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-0 lg:grid-cols-12 lg:grid-rows-1">
          {/* Slider — first on mobile (full width); columns 5–12 on lg */}
          <div className="relative z-0 min-h-[min(52vh,420px)] w-full lg:col-[5/13] lg:row-start-1 lg:min-h-[min(72vh,640px)] lg:-ml-12">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:aspect-[3/4] lg:aspect-auto lg:h-full lg:min-h-[520px]">
              {slides.map((slide, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-out ${
                    i === index ? "z-[1] opacity-100" : "z-0 opacity-0"
                  }`}
                />
              ))}
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/25 via-transparent to-transparent" />

              {/* Dots: top on mobile so the overlapping card doesn’t hide them; bottom on lg */}
              <div className="absolute left-0 right-0 top-4 z-[3] flex justify-center gap-2 lg:bottom-4 lg:top-auto">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => go(i)}
                    className={`h-2 w-2 rounded-full transition-[transform,background] ${
                      i === index ? "scale-125 bg-white" : "bg-white/45 hover:bg-white/70"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* White editorial card — overlaps slider bottom on mobile; left overlap on lg */}
          <div className="relative z-30 -mt-14 mx-3 sm:mx-4 lg:col-[1/6] lg:row-start-1 lg:mx-0 lg:-mt-0 lg:-mr-10 lg:self-center xl:-mr-12">
            <div className="mx-auto max-w-xl bg-white p-8 shadow-[0_25px_80px_rgba(0,0,0,0.12)] md:p-10 lg:mx-0 xl:p-12">
              <h1
                className="text-center text-[clamp(1.35rem,3.2vw,2.15rem)] font-bold uppercase leading-[1.2] tracking-[0.04em] md:tracking-[0.06em]"
                style={{ fontFamily: "var(--b-font)", color: "var(--accent)" }}
              >
                {hero.title}
              </h1>
              <p className="mt-5 text-center text-[15px] leading-relaxed text-neutral-800 md:text-base">
                {loc ? (
                  <>
                    <span className="block text-neutral-600">Building improvements based in</span>
                    <span className="mt-1 block font-semibold text-neutral-900">{loc}</span>
                  </>
                ) : null}
                <span className={`block ${loc ? "mt-4 border-t border-neutral-200 pt-4" : ""}`}>{subtitle}</span>
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <a
                  href="#contact"
                  className="inline-flex min-w-[10rem] items-center justify-center rounded-md px-6 py-3 text-sm font-bold text-white shadow-md transition-[filter] hover:brightness-110"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  {hero.ctaText}
                </a>
                {hero.ctaSecondaryText ? (
                  <a
                    href="#work"
                    className="inline-flex min-w-[10rem] items-center justify-center rounded-md border-2 px-6 py-3 text-sm font-semibold transition-colors hover:bg-neutral-50"
                    style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                  >
                    {hero.ctaSecondaryText}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
