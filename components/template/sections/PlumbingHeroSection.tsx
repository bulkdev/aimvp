"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
}

/** Royalty-free stock via Unsplash (editorial / commercial use under Unsplash License). */
const DEFAULT_SLIDES: { src: string; alt: string }[] = [
  {
    src: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1920&q=80",
    alt: "Plumber working on pipes",
  },
  {
    src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=80",
    alt: "Technician with tools",
  },
  {
    src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1920&q=80",
    alt: "Plumbing tools and equipment",
  },
  {
    src: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1920&q=80",
    alt: "Copper pipes and fittings",
  },
];

const ROTATE_MS = 5500;

export default function PlumbingHeroSection({ content, intake }: Props) {
  const { hero, tagline } = content;
  const slides =
    content.assets?.heroSlides && content.assets.heroSlides.length > 0
      ? content.assets.heroSlides.map((src, i) => ({ src, alt: `Hero slide ${i + 1}` }))
      : DEFAULT_SLIDES;
  const [index, setIndex] = useState(0);

  const go = useCallback((i: number) => {
    setIndex(((i % slides.length) + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const t = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, ROTATE_MS);
    return () => window.clearInterval(t);
  }, [slides.length]);

  function handleQuoteSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const contact = document.getElementById("contact");
    if (contact) {
      contact.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <section
      id="hero"
      className="relative min-h-[88vh] flex flex-col overflow-hidden"
      aria-roledescription="carousel"
    >
      {/* Slideshow */}
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            aria-hidden={i !== index}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-out"
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
        {/* Readability overlay — matches common contractor-site hero treatment */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(11,18,32,0.92) 0%, rgba(11,18,32,0.55) 45%, rgba(11,18,32,0.35) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(11,18,32,0.5) 0%, transparent 35%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-1 items-center px-6 md:px-12 lg:px-24 py-20 max-w-screen-xl mx-auto w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-10 items-start">
          <div className="max-w-3xl">
          <span
            className="section-label"
            style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.12em" }}
          >
            {tagline}
          </span>

          <h1
            style={{
              fontFamily: "var(--h-font)",
              fontSize: "clamp(2.35rem, 5vw, 3.75rem)",
              fontWeight: 600,
              color: "#ffffff",
              lineHeight: 1.12,
              marginBottom: "20px",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            {hero.title}
          </h1>

          <p
            style={{
              fontSize: "clamp(1.05rem, 2vw, 1.2rem)",
              color: "rgba(255,255,255,0.78)",
              lineHeight: 1.65,
              marginBottom: "36px",
              maxWidth: "560px",
            }}
          >
            {hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a href="#contact" className="btn-primary">
              {hero.ctaText}
            </a>
            {intake.phone && (
              <a
                href={`tel:${intake.phone.replace(/\s/g, "")}`}
                className="btn-outline"
                style={{
                  borderColor: "rgba(255,255,255,0.45)",
                  color: "#fff",
                }}
              >
                Call {intake.phone}
              </a>
            )}
            {hero.ctaSecondaryText && (
              <a
                href="#services"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-white/75 hover:text-white transition-colors no-underline"
              >
                {hero.ctaSecondaryText}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>

          {(intake.city || intake.phone) && (
            <div
              className="mt-12 pt-8 flex flex-wrap gap-6 border-t border-white/10"
            >
              <div className="flex items-center gap-2 text-sm text-white/55">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-60" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>
                  24/7 emergency service
                  {intake.city ? ` · ${intake.city}` : ""}
                </span>
              </div>
              {intake.phone && (
                <div className="flex items-center gap-2 text-sm text-white/55">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="opacity-60" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l1.84-1.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 15z" />
                  </svg>
                  <span>Licensed &amp; insured</span>
                </div>
              )}
            </div>
          )}
          </div>

          {/* Overlay quote form (desktop right side) */}
          <aside
            className="w-full lg:mt-2 rounded-2xl border border-white/20 bg-[#0b1220]/70 backdrop-blur-md p-5 sm:p-6 shadow-2xl"
            aria-label="Quick quote form"
          >
            <p className="text-[11px] tracking-[0.14em] uppercase text-white/60 font-semibold mb-2">
              Free estimate
            </p>
            <h3
              className="text-white mb-4"
              style={{
                fontFamily: "var(--h-font)",
                fontSize: "clamp(1.25rem, 2vw, 1.7rem)",
                lineHeight: 1.15,
                textTransform: "uppercase",
              }}
            >
              Request a Plumbing Quote
            </h3>

            <form className="space-y-3" onSubmit={handleQuoteSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70"
              />
              <select
                name="service"
                defaultValue=""
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70"
              >
                <option value="" disabled className="text-slate-900">
                  Select service
                </option>
                <option value="emergency" className="text-slate-900">Emergency repair</option>
                <option value="drain" className="text-slate-900">Drain cleaning</option>
                <option value="water-heater" className="text-slate-900">Water heater</option>
                <option value="installation" className="text-slate-900">Fixture installation</option>
              </select>
              <textarea
                name="details"
                rows={3}
                placeholder="Describe the issue"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70"
              />

              <button type="submit" className="btn-primary w-full">
                Get My Quote
              </button>
            </form>

            <p className="text-xs text-white/65 mt-3">
              We will follow up quickly. For urgent issues, call{" "}
              {intake.phone ? (
                <a href={`tel:${intake.phone.replace(/\s/g, "")}`} className="text-white underline underline-offset-2">
                  {intake.phone}
                </a>
              ) : (
                "our team"
              )}
              .
            </p>
          </aside>
        </div>
      </div>

      {/* Slide indicators */}
      <div
        className="relative z-10 pb-8 flex justify-center gap-2"
        role="tablist"
        aria-label="Hero images"
      >
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Show image ${i + 1}: ${slide.alt}`}
            onClick={() => go(i)}
            className="h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            style={{
              width: i === index ? 28 : 8,
              background: i === index ? "var(--accent)" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
