"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { intakeLocationLine } from "@/lib/location";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
  slideshowVariant?: "fade" | "zoom" | "slide";
  ctaPlacement?: "inline" | "stacked" | "bottom-bar";
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

export default function PlumbingHeroSection({
  content,
  intake,
  slideshowVariant = "fade",
  ctaPlacement = "inline",
}: Props) {
  const { hero, tagline } = content;
  const loc = intakeLocationLine(intake)?.trim() || "";
  const rawParts = tagline.split("·").map((p) => p.trim()).filter(Boolean);
  const defaultLeadFromTagline =
    rawParts.length > 1 ? rawParts.slice(0, -1).join(" · ") : rawParts[0] || "";
  const taglineLead =
    content.assets?.heroTaglineLead?.trim() || defaultLeadFromTagline;
  const areaFromTagline = rawParts.length > 1 ? rawParts[rawParts.length - 1]! : "";
  const areaDisplay = loc || areaFromTagline;

  /** Location line in eyebrow — 2× the lead size; uses theme accent as-is (no lighten). */
  const locationEyebrowStyle = {
    color: "var(--accent)",
    fontSize: "clamp(1.84rem, 4.2vw, 2.24rem)",
    fontWeight: 800,
    lineHeight: 1.15,
  } as const;
  const slides =
    content.assets?.heroSlides && content.assets.heroSlides.length > 0
      ? content.assets.heroSlides.map((src, i) => ({ src, alt: `Hero slide ${i + 1}` }))
      : DEFAULT_SLIDES;
  const [index, setIndex] = useState(0);
  const [selectedService, setSelectedService] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const go = useCallback((i: number) => {
    setIndex(((i % slides.length) + slides.length) % slides.length);
  }, [slides.length]);

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

  return (
    <section
      id="hero"
      className="relative min-h-[76vh] lg:min-h-[88vh] flex flex-col overflow-hidden"
      style={{ background: "#0b1220" }}
      aria-roledescription="carousel"
    >
      {/* Slideshow */}
      <div className="absolute inset-x-0 top-0 h-[calc(clamp(560px,96svh,1100px)+8px)] lg:inset-0 lg:h-auto">
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
              objectPosition: isMobile ? "center 28%" : "center 22%",
              transform:
                slideshowVariant === "zoom" && i === index
                  ? isMobile
                    ? "scale(1.015)"
                    : "scale(1.06)"
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
        {/* Mobile slider zone: original fade to #0b1220 (slideshow box is shorter than section — white bridge is below) */}
        <div
          className="absolute inset-x-0 bottom-0 lg:hidden pointer-events-none"
          style={{
            bottom: "-10px",
            height: "74%",
            background:
              "linear-gradient(to bottom, rgba(11,18,32,0) 0%, rgba(11,18,32,0.55) 48%, rgba(11,18,32,0.9) 72%, #0b1220 90%, #0b1220 100%)",
            zIndex: 2,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-1 items-start px-6 md:px-12 lg:px-24 pt-20 pb-10 max-w-screen-xl mx-auto w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-8 lg:gap-10 items-start">
          <div className="max-w-3xl">
          <div style={{ marginTop: "calc(96px + 5rem)" }}>
          <span
            className="section-label"
            style={{
              color: "rgba(255,255,255,0.72)",
              letterSpacing: "0.08em",
              fontSize: "clamp(0.78rem, 1.5vw, 0.9rem)",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            {taglineLead && areaDisplay ? (
              <>
                <span>{taglineLead} · </span>
                <span style={locationEyebrowStyle}>{areaDisplay}</span>
              </>
            ) : taglineLead ? (
              <span
                style={{
                  color: "color-mix(in srgb, var(--accent) 82%, #fff 18%)",
                  fontSize: "clamp(0.92rem, 2.1vw, 1.12rem)",
                  fontWeight: 800,
                }}
              >
                {taglineLead}
              </span>
            ) : areaDisplay ? (
              <span style={locationEyebrowStyle}>{areaDisplay}</span>
            ) : (
              <span
                style={{
                  color: "color-mix(in srgb, var(--accent) 82%, #fff 18%)",
                  fontSize: "clamp(0.92rem, 2.1vw, 1.12rem)",
                  fontWeight: 800,
                }}
              >
                {tagline}
              </span>
            )}
          </span>

          <h1
            style={{
              fontFamily: "var(--h-font)",
              fontSize: "clamp(1.95rem, 4.4vw, 3.35rem)",
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
          </div>

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

          {ctaPlacement === "stacked" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-[560px]">
              <a href="#contact" className="btn-primary text-center">
                {hero.ctaText}
              </a>
              {intake.phone && (
                <a
                  href={`tel:${intake.phone.replace(/\s/g, "")}`}
                  className="btn-outline inline-flex items-center justify-center gap-2 text-center"
                  style={{ borderColor: "rgba(255,255,255,0.45)", color: "#fff", display: "inline-flex" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Call {intake.phone}
                </a>
              )}
            </div>
          ) : ctaPlacement === "bottom-bar" ? (
            <div
              className="inline-flex flex-wrap items-center gap-2 rounded-full px-3 py-2 border border-white/20"
              style={{ background: "rgba(11,18,32,0.6)" }}
            >
              <a href="#contact" className="btn-primary" style={{ padding: "10px 18px" }}>
                {hero.ctaText}
              </a>
              {intake.phone && (
                <a href={`tel:${intake.phone.replace(/\s/g, "")}`} className="btn-outline inline-flex items-center gap-2" style={{ padding: "9px 16px", borderColor: "rgba(255,255,255,0.45)", color: "#fff", display: "inline-flex" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {intake.phone}
                </a>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <a href="#contact" className="btn-primary">
                {hero.ctaText}
              </a>
              {intake.phone && (
                <a
                  href={`tel:${intake.phone.replace(/\s/g, "")}`}
                  className="btn-outline inline-flex items-center gap-2"
                  style={{
                    borderColor: "rgba(255,255,255,0.45)",
                    color: "#fff",
                    display: "inline-flex",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.63 2.62a2 2 0 0 1-.45 2.11L8 9.91a16 16 0 0 0 6.09 6.09l1.46-1.29a2 2 0 0 1 2.11-.45c.84.3 1.72.51 2.62.63A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
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
          )}
          </div>

          {/* Quote form: desktop/tablet lg+ only (hidden on mobile — use #contact) */}
          <aside
            className="hidden w-full lg:block lg:mt-2 rounded-2xl border border-white/20 bg-[#0b1220] lg:bg-[#0b1220]/70 lg:backdrop-blur-md p-5 sm:p-6 shadow-2xl"
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
              <input
                type="text"
                name="address"
                placeholder="Service address"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70"
              />
              <select
                name="service"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
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
                <option value="other" className="text-slate-900">Other (custom)</option>
              </select>
              {selectedService === "other" && (
                <input
                  type="text"
                  name="serviceCustom"
                  placeholder="Enter requested service"
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/55 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70"
                />
              )}
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
        className="relative z-10 pb-8 hidden lg:flex justify-center gap-2"
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
