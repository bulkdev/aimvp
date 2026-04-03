"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { intakeLocationLine } from "@/lib/location";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
  slideshowVariant?: "fade" | "zoom" | "slide";
}

/** Same stock set as {@link PlumbingHeroSection}. */
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

function SlideDots({
  slides,
  index,
  go,
  className = "",
}: {
  slides: { src: string; alt: string }[];
  index: number;
  go: (i: number) => void;
  /** Full layout classes (include flex / hidden as needed) */
  className?: string;
}) {
  return (
    <div className={className} role="tablist" aria-label="Hero images">
      {slides.map((slide, i) => (
        <button
          key={slide.src}
          type="button"
          role="tab"
          aria-selected={i === index}
          aria-label={`Show image ${i + 1}`}
          onClick={() => go(i)}
          className="h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          style={{
            width: i === index ? 22 : 6,
            background: i === index ? "var(--accent)" : "rgba(255,255,255,0.35)",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Plumbing Flow template: compact slider hero + glass nav.
 * Mobile: extra scrim on slides, dots above CTAs so the footer strip is not crowded.
 * Desktop: tall enough hero that the quote card never scrolls internally.
 */
export default function PlumbingFlowHeroSection({
  content,
  intake,
  slideshowVariant = "fade",
}: Props) {
  const { hero, tagline } = content;
  const [selectedService, setSelectedService] = useState("");
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const loc = intakeLocationLine(intake)?.trim() || "";
  const rawParts = tagline.split("·").map((p) => p.trim()).filter(Boolean);
  const defaultLeadFromTagline =
    rawParts.length > 1 ? rawParts.slice(0, -1).join(" · ") : rawParts[0] || "";
  const taglineLead = content.assets?.heroTaglineLead?.trim() || defaultLeadFromTagline;
  const areaFromTagline = rawParts.length > 1 ? rawParts[rawParts.length - 1]! : "";
  const areaDisplay = loc || areaFromTagline;

  const locationEyebrowStyle = {
    fontFamily: "var(--h-font)",
    color: "var(--accent)",
    fontSize: "clamp(1rem, 2.4vw, 1.35rem)",
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  } as const;

  const slides =
    content.assets?.heroSlides && content.assets.heroSlides.length > 0
      ? content.assets.heroSlides.map((src, i) => ({ src, alt: `Hero slide ${i + 1}` }))
      : DEFAULT_SLIDES;

  const go = useCallback(
    (i: number) => {
      setIndex(((i % slides.length) + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("lead_submit", {
          detail: { form: "hero_quote", section: "hero" },
        })
      );
    }
    const contact = document.getElementById("contact");
    if (contact) {
      contact.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const scrollToServices = useCallback(() => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <section
      id="hero"
      className="relative flex flex-col overflow-hidden lg:min-h-[640px]"
      style={{
        background: "#0b1220",
      }}
      aria-roledescription="carousel"
    >
      {/* Slideshow */}
      <div className="absolute inset-0 min-h-[100%] lg:min-h-0">
        {slides.map((slide, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            aria-hidden={i !== index}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-out bg-[#0b1220]"
            style={{
              opacity: i === index ? 1 : 0,
              objectPosition: isMobile ? "center 28%" : "center 24%",
              transform:
                slideshowVariant === "zoom" && i === index
                  ? isMobile
                    ? "scale(1.02)"
                    : "scale(1.05)"
                  : slideshowVariant === "slide"
                    ? `translateX(${(i - index) * 8}%)`
                    : "scale(1)",
              transition:
                slideshowVariant === "slide"
                  ? "opacity 700ms ease-out, transform 700ms ease-out"
                  : "opacity 900ms ease-out, transform 1800ms ease-out",
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(11,18,32,0.94) 0%, rgba(11,18,32,0.62) 48%, rgba(11,18,32,0.4) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(11,18,32,0.55) 0%, transparent 40%)",
          }}
        />
        {/* Mobile: darken busy marketing slides (text/logos on imagery) */}
        <div
          className="absolute inset-0 pointer-events-none lg:hidden"
          style={{
            background: "linear-gradient(to bottom, rgba(11,18,32,0.72) 0%, rgba(11,18,32,0.5) 45%, rgba(11,18,32,0.78) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-5 md:px-10 lg:px-14 pt-[5.25rem] pb-6 max-lg:pb-10 max-w-screen-2xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 lg:items-start">
          <div className="lg:col-span-7 min-w-0 flex flex-col justify-center max-lg:gap-0">
            <div className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 mb-3 w-fit border border-white/15 bg-white/5 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/50 opacity-50" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/90" />
              </span>
              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/80">
                {areaDisplay || "Your area"}
              </span>
            </div>

            <p className="mb-1.5 text-white/90" style={locationEyebrowStyle}>
              {taglineLead}
              {areaDisplay ? (
                <>
                  {" "}
                  <span className="text-white/45">·</span> {areaDisplay}
                </>
              ) : null}
            </p>

            <h1
              className="text-white mb-2.5"
              style={{
                fontFamily: "var(--h-font)",
                fontSize: "clamp(1.35rem, 3.2vw, 2.15rem)",
                fontWeight: 700,
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                textShadow: "0 2px 24px rgba(0,0,0,0.5)",
              }}
            >
              {hero.title}
            </h1>

            <p
              className="text-sm md:text-[0.95rem] mb-4 max-w-xl max-lg:mb-3"
              style={{ color: "rgba(226,232,240,0.92)", lineHeight: 1.55 }}
            >
              {hero.subtitle}
            </p>

            {/* Dots above CTAs on mobile — avoids overlap with buttons + “Services” */}
            <SlideDots slides={slides} index={index} go={go} className="flex justify-center gap-1.5 mb-4 lg:hidden" />

            <div className="flex flex-wrap gap-2 mb-4">
              <a
                href="#contact"
                className="btn-primary inline-flex items-center justify-center gap-2 no-underline rounded-full px-5 py-2.5 text-sm"
                style={{ boxShadow: "0 4px 18px rgba(0,0,0,0.25)" }}
              >
                {hero.ctaText}
              </a>
              {intake.phone && (
                <a
                  href={`tel:${intake.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/30 text-white text-sm font-semibold px-4 py-2 no-underline hover:bg-white/10 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {intake.phone}
                </a>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 max-w-md max-lg:mb-2">
              {[
                { k: "24/7", d: "Emergency" },
                { k: "Licensed", d: "& insured" },
                { k: "Same-day", d: "Available" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="rounded-lg border border-white/10 bg-black/30 px-2 py-2 text-center backdrop-blur-sm"
                >
                  <div className="text-white font-bold text-xs tracking-wide">{row.k}</div>
                  <div className="text-[10px] text-white/55 leading-tight">{row.d}</div>
                </div>
              ))}
            </div>
          </div>

          <aside
            className="hidden lg:flex lg:col-span-5 flex-col rounded-xl border border-white/20 bg-[#0b1220]/80 backdrop-blur-md p-4 shadow-xl overflow-visible shrink-0"
            aria-label="Quick quote form"
          >
            <p className="text-[10px] tracking-[0.12em] uppercase text-white/55 font-semibold mb-1">Free estimate</p>
            <h3
              className="text-white mb-2.5"
              style={{
                fontFamily: "var(--h-font)",
                fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
                lineHeight: 1.15,
              }}
            >
              Request a quote
            </h3>

            <form className="space-y-1.5" onSubmit={handleQuoteSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70"
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70"
              />
              <select
                name="service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                required
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70"
              >
                <option value="" disabled className="text-slate-900">
                  Service
                </option>
                <option value="emergency" className="text-slate-900">
                  Emergency
                </option>
                <option value="drain" className="text-slate-900">
                  Drains
                </option>
                <option value="water-heater" className="text-slate-900">
                  Water heater
                </option>
                <option value="other" className="text-slate-900">
                  Other
                </option>
              </select>
              {selectedService === "other" && (
                <input
                  type="text"
                  name="serviceCustom"
                  placeholder="Describe"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70"
                />
              )}
              <textarea
                name="details"
                rows={2}
                placeholder="Brief details"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70 resize-none leading-snug"
              />
              <button type="submit" className="btn-primary w-full py-2 text-sm rounded-lg font-semibold mt-0.5">
                Get my quote
              </button>
            </form>
          </aside>
        </div>
      </div>

      {/* Desktop: dots centered under hero row */}
      <SlideDots
        slides={slides}
        index={index}
        go={go}
        className="hidden lg:flex justify-center gap-1.5 relative z-10 pb-4 pt-0"
      />

      <button
        type="button"
        onClick={scrollToServices}
        className="relative z-10 mx-auto mt-2 max-lg:mt-6 mb-6 max-lg:mb-8 flex items-center gap-2 text-white/65 hover:text-white/90 text-[10px] font-semibold tracking-[0.16em] uppercase bg-transparent border-0 cursor-pointer"
      >
        Services
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}
