"use client";

import { type FormEvent, useEffect, useState } from "react";
import type { GeneratedSiteContent, IntakeFormData, ServiceItem } from "@/types";
import { applyIntakeLocationToCopy, intakeLocationLine } from "@/lib/location";
import { publishedNavHref, type NavHash } from "@/lib/published-nav-hrefs";

/** Stock imagery — Unsplash License */
const HERO_SLIDES: { src: string; alt: string }[] = [
  {
    src: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1920&q=80",
    alt: "HVAC technician",
  },
  {
    src: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=80",
    alt: "Home service professional",
  },
  {
    src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1920&q=80",
    alt: "Tools and equipment",
  },
];

const ROTATE_MS = 6000;

// ─── Top promo strip ───────────────────────────────────────────────────────────

export function SuperServiceTopBar() {
  return (
    <div
      className="text-center text-sm font-semibold tracking-wide py-2.5 px-4"
      style={{
        background: "linear-gradient(90deg, color-mix(in srgb, var(--accent) 88%, #000) 0%, var(--accent) 50%, color-mix(in srgb, var(--accent) 88%, #000) 100%)",
        color: "#fff",
      }}
    >
      Flexible financing and smart savings — keep your home comfortable and your budget intact.
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

const NAV_LINKS: { label: string; hash: NavHash }[] = [
  { label: "Services", hash: "services" },
  { label: "Stats", hash: "stats" },
  { label: "About", hash: "about" },
  { label: "Reviews", hash: "reviews" },
  { label: "FAQ", hash: "faq" },
  { label: "Contact", hash: "contact" },
];

export function SuperServiceNavbar({
  content,
  intake,
  publishedBasePath,
}: {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
  publishedBasePath?: string;
}) {
  const [open, setOpen] = useState(false);
  const phone = intake.phone?.trim();
  const tel = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className="sticky top-0 z-50 shadow-md border-b"
      style={{ background: "#ffffff", borderColor: "rgba(12,30,61,0.08)" }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between gap-4 h-[72px] md:h-[80px]">
        <a href={publishedNavHref(publishedBasePath, "hero")} className="flex items-center gap-3 min-w-0" onClick={() => setOpen(false)}>
          {intake.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={intake.logoDataUrl} alt="" className="h-9 md:h-11 w-auto object-contain shrink-0" />
          ) : (
            <div
              className="h-10 w-10 md:h-11 md:w-11 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ background: "var(--primary)" }}
            >
              {content.brandName.charAt(0)}
            </div>
          )}
          <span
            className="font-bold text-lg md:text-xl truncate"
            style={{ fontFamily: "var(--h-font)", color: "var(--primary)" }}
          >
            {content.brandName}
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <a
              key={l.hash}
              href={publishedNavHref(publishedBasePath, l.hash)}
              className="text-[15px] font-semibold hover:opacity-80 transition-opacity"
              style={{ color: "var(--primary)" }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          {phone && (
            <a href={tel} className="text-sm font-bold whitespace-nowrap" style={{ color: "var(--primary)" }}>
              {phone}
            </a>
          )}
          <a
            href={publishedNavHref(publishedBasePath, "contact")}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded text-sm font-bold text-white whitespace-nowrap"
            style={{ background: "var(--accent)" }}
          >
            Book Online
          </a>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 rounded-md border border-slate-200"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <MenuIcon open={open} />
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.hash}
              href={publishedNavHref(publishedBasePath, l.hash)}
              className="py-3 font-semibold border-b border-slate-100"
              style={{ color: "var(--primary)" }}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          {phone && (
            <a href={tel} className="py-3 font-bold" style={{ color: "var(--accent)" }}>
              {phone}
            </a>
          )}
          <a
            href={publishedNavHref(publishedBasePath, "contact")}
            className="mt-2 text-center py-3 rounded font-bold text-white"
            style={{ background: "var(--accent)" }}
            onClick={() => setOpen(false)}
          >
            Book Online
          </a>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export function SuperServiceHero({ content, intake }: { content: GeneratedSiteContent; intake: IntakeFormData }) {
  const { hero, tagline } = content;
  const heroSubtitle = applyIntakeLocationToCopy(hero.subtitle, intake);
  const taglineLive = applyIntakeLocationToCopy(tagline, intake);
  const loc = intakeLocationLine(intake);
  const slides =
    content.assets?.heroSlides && content.assets.heroSlides.length > 0
      ? content.assets.heroSlides.map((src, i) => ({ src, alt: `Hero ${i + 1}` }))
      : HERO_SLIDES;
  const [index, setIndex] = useState(0);
  const phone = intake.phone?.trim();
  const tel = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => window.clearInterval(t);
  }, [slides.length]);

  function leadCapture(e: FormEvent) {
    e.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section id="hero" className="relative min-h-[min(92vh,820px)] flex flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            aria-hidden={i !== index}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1000ms]"
            style={{
              opacity: i === index ? 1 : 0,
              objectPosition: "center 35%",
            }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(12,30,61,0.92) 0%, rgba(12,30,61,0.55) 45%, rgba(12,30,61,0.35) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 pb-14 md:pb-20 pt-32 w-full">
        <p className="text-white/90 text-sm md:text-base font-bold uppercase tracking-[0.2em] mb-3">{taglineLive}</p>
        <h1
          className="text-white text-[clamp(1.75rem,5vw,3rem)] font-bold leading-tight max-w-4xl mb-4"
          style={{ fontFamily: "var(--h-font)" }}
        >
          {hero.title}
        </h1>
        <p className="text-white/85 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">{heroSubtitle}</p>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4">
          <a
            href="#contact"
            className="inline-flex justify-center px-8 py-3.5 rounded font-bold text-base text-white shadow-lg"
            style={{ background: "var(--accent)" }}
          >
            {hero.ctaText || "Book Online"}
          </a>
          {phone && (
            <a
              href={tel}
              className="inline-flex justify-center px-8 py-3.5 rounded font-bold text-base border-2 border-white/80 text-white hover:bg-white/10"
            >
              {phone}
            </a>
          )}
        </div>

        <form onSubmit={leadCapture} className="mt-10 max-w-xl flex flex-col sm:flex-row gap-2">
          <label className="sr-only" htmlFor="super-hero-service">
            Service
          </label>
          <select
            id="super-hero-service"
            className="flex-1 rounded px-4 py-3 text-slate-900 font-medium border-0"
            defaultValue=""
          >
            <option value="" disabled>
              Choose a service
            </option>
            {content.services.slice(0, 8).map((s) => (
              <option key={s.title} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
          <button type="submit" className="px-6 py-3 rounded font-bold text-white shrink-0" style={{ background: "var(--accent)" }}>
            Get started
          </button>
        </form>
        {loc && <p className="mt-4 text-white/70 text-sm">Proudly serving {loc} and surrounding areas.</p>}
      </div>
    </section>
  );
}

// ─── Trade service cards (grid) ───────────────────────────────────────────────

export function SuperServiceTradeCards({ content, intake }: { content: GeneratedSiteContent; intake: IntakeFormData }) {
  const loc = intakeLocationLine(intake) || "your area";
  const cards = content.services.slice(0, 4);
  const FALLBACK: ServiceItem[] = [
    { title: "Heating", description: "Furnace and boiler service.", icon: "Flame" },
    { title: "Cooling", description: "AC repairs and tune-ups.", icon: "Snowflake" },
    { title: "Drains", description: "Drain cleaning and sewer help.", icon: "Waves" },
    { title: "Indoor air", description: "Air quality and filtration options.", icon: "Wind" },
  ];
  const padded: ServiceItem[] =
    cards.length >= 4 ? cards : [...cards, ...FALLBACK.slice(0, Math.max(0, 4 - cards.length))];

  return (
    <section id="services" style={{ background: "#f4f6f9", padding: "72px 0 88px" }}>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12">
        <p className="text-center text-sm font-bold uppercase tracking-[0.15em] mb-2" style={{ color: "var(--accent)" }}>
          Our services
        </p>
        <h2
          className="text-center text-[clamp(1.5rem,3.5vw,2.25rem)] font-bold mb-3"
          style={{ fontFamily: "var(--h-font)", color: "var(--primary)" }}
        >
          Reliable home service experts in {loc}
        </h2>
        <p className="text-center text-slate-600 max-w-2xl mx-auto mb-12 text-[15px] leading-relaxed">
          Upfront diagnostics, maintenance options, and same-day scheduling when you need us most.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {padded.map((s, idx) => (
            <article
              key={`${s.title}-${idx}`}
              className="bg-white rounded border border-slate-200/80 shadow-sm flex flex-col p-6 pt-7"
            >
              <h3 className="text-xl font-bold mb-1" style={{ color: "var(--primary)", fontFamily: "var(--h-font)" }}>
                {s.title}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-4">Maintenance plans available</p>
              <div className="rounded-lg px-4 py-3 mb-4 text-center" style={{ background: "color-mix(in srgb, var(--accent) 12%, white)" }}>
                <span className="block text-3xl font-black" style={{ color: "var(--accent)" }}>
                  $89
                </span>
                <span className="text-xs font-semibold text-slate-600">dispatch &amp; same-day priority</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed flex-1 mb-6">{s.description}</p>
              <a
                href="#contact"
                className="inline-flex justify-center py-2.5 rounded font-bold text-sm text-white mt-auto"
                style={{ background: "var(--primary)" }}
              >
                View service
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why us (split) ───────────────────────────────────────────────────────────

export function SuperServiceWhySection({
  content,
  intake,
}: {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
}) {
  const { about } = content;
  const locationLine = intakeLocationLine(intake)?.trim() || "";
  const aboutBody = applyIntakeLocationToCopy(about.body, intake);
  const lines = about.highlights.length ? about.highlights : ["Licensed & insured", "24/7 emergency service", "Respectful technicians"];

  return (
    <section id="about" style={{ background: "#ffffff", padding: "80px 0" }}>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <h2
              className="text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-tight mb-6"
              style={{ fontFamily: "var(--h-font)", color: "var(--primary)" }}
            >
              Why choose us?
            </h2>
            <div className="space-y-2 text-xl md:text-2xl font-bold" style={{ color: "var(--primary)" }}>
              <p>Super friendly.</p>
              <p>Super fast.</p>
              <p>Super professional.</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--primary)" }}>
              {about.heading}
            </h3>
            {locationLine ? (
              <p className="text-sm font-semibold mb-4" style={{ color: "var(--accent)" }}>
                Proudly serving {locationLine}
              </p>
            ) : null}
            <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-line">{aboutBody}</p>
            <ul className="space-y-3">
              {lines.map((line) => (
                <li key={line} className="flex gap-3 items-start text-slate-800 font-medium">
                  <span className="mt-1.5 h-2 w-2 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Membership / care club block ─────────────────────────────────────────────

export function SuperServiceMembership({ contactHref = "#contact" }: { contactHref?: string }) {
  return (
    <section id="cta" style={{ background: "#eef2f7", padding: "72px 0" }}>
      <div className="max-w-screen-lg mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "var(--h-font)", color: "var(--primary)" }}>
          The loyalty plan
        </h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto">
          Priority scheduling, seasonal tune-ups, and member savings — ask us how to enroll when you book your next visit.
        </p>
        <div
          className="inline-block rounded-2xl border-4 p-10 max-w-md mx-auto bg-white shadow-lg"
          style={{ borderColor: "var(--accent)" }}
        >
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">Starting at</p>
          <p className="text-5xl font-black mb-2" style={{ color: "var(--accent)" }}>
            $15<span className="text-2xl font-bold">.99</span>
            <span className="text-lg font-semibold text-slate-600">/mo</span>
          </p>
          <p className="text-slate-600 text-sm mb-8">Plans vary by equipment — we&apos;ll recommend the right fit.</p>
          <a
            href={contactHref}
            className="inline-block w-full py-3 rounded-lg font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            Join today
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Service areas grid ────────────────────────────────────────────────────────

export function SuperServiceAreasGrid({ content }: { content: GeneratedSiteContent }) {
  const areas = (content.assets?.serviceAreas || []).map((a) => a.trim()).filter(Boolean);
  if (areas.length === 0) return null;

  return (
    <section style={{ background: "#0c1e3d", padding: "72px 0" }}>
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12">
        <h2
          className="text-center text-[clamp(1.5rem,3vw,2rem)] font-bold text-white mb-3"
          style={{ fontFamily: "var(--h-font)" }}
        >
          Our service areas
        </h2>
        <p className="text-center text-white/70 mb-12 max-w-xl mx-auto text-sm">
          Neighborhoods and communities we serve — call to confirm coverage at your address.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {areas.map((area) => (
            <div
              key={area}
              className="rounded border border-white/15 bg-white/5 px-4 py-4 text-center text-white font-semibold text-sm"
            >
              {area}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
