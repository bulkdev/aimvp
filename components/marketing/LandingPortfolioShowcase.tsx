"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ShowcaseSite } from "@/lib/showcase-portfolio";
import {
  IphonePortfolioFrame,
  MacbookPortfolioFrame,
} from "@/components/marketing/PortfolioDeviceFrames";

type ShowcaseEntry = ShowcaseSite & { embedUrl?: string };

const DESKTOP_DOC_W = 1440;
const DESKTOP_DOC_H = 900;

const MOBILE_DOC_W = 390;
const MOBILE_DOC_H = 844;

function ScaledDesktopFrame({ src, title }: { src: string; title: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [frameW, setFrameW] = useState(640);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setFrameW(Math.max(1, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = frameW / DESKTOP_DOC_W;
  const frameH = DESKTOP_DOC_H * scale;

  return (
    <div ref={wrapRef} className="relative h-full w-full min-h-[120px] overflow-hidden rounded-[10px] bg-[#0a0f1c]">
      <div className="relative w-full" style={{ height: frameH }}>
        <iframe
          src={src}
          title={title}
          className="absolute left-0 top-0 border-0 bg-white"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{
            width: DESKTOP_DOC_W,
            height: DESKTOP_DOC_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}

function PhoneScaledIframe({ src, title }: { src: string; title: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(200);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setW(Math.max(1, el.clientWidth));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = w / MOBILE_DOC_W;
  const h = MOBILE_DOC_H * scale;

  return (
    <div ref={wrapRef} className="relative h-full w-full min-h-[120px] overflow-hidden">
      <div className="relative w-full" style={{ height: h }}>
        <iframe
          src={src}
          title={title}
          className="absolute left-0 top-0 border-0 bg-white"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{
            width: MOBILE_DOC_W,
            height: MOBILE_DOC_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}

const FALLBACK_CARDS = [
  {
    title: "Trade & home services",
    niche: "Plumbing · HVAC · electrical",
    blurb: "Emergency-first layouts, service areas, and phone CTAs that turn searches into booked jobs.",
    gradient: "from-cyan-500/30 to-slate-900/80",
  },
  {
    title: "Local retail & shops",
    niche: "Boutiques · specialty stores",
    blurb: "Hours, directions, and product stories that make first-time visitors confident to walk in.",
    gradient: "from-violet-500/25 to-slate-900/80",
  },
  {
    title: "Professional services",
    niche: "Consulting · legal · finance",
    blurb: "Credibility-first pages: clear expertise, trust signals, and easy contact for high-intent leads.",
    gradient: "from-indigo-500/30 to-slate-900/80",
  },
  {
    title: "Contractors & builders",
    niche: "Remodel · roofing · landscaping",
    blurb: "Project galleries, reviews, and quote flows built around how homeowners actually decide.",
    gradient: "from-amber-500/20 to-slate-900/80",
  },
  {
    title: "Food & hospitality",
    niche: "Restaurants · cafés · catering",
    blurb: "Menus, reservations, and mobile-friendly paths from Google Maps to your table.",
    gradient: "from-rose-500/25 to-slate-900/80",
  },
  {
    title: "Health & wellness",
    niche: "Clinics · fitness · spas",
    blurb: "Appointment-focused UX, insurance and location clarity, and review-friendly structure.",
    gradient: "from-emerald-500/25 to-slate-900/80",
  },
];

const laptopEnter = {
  initial: {
    opacity: 0,
    scale: 0.82,
    y: 90,
    rotateZ: -4,
    filter: "blur(16px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateZ: 0,
    filter: "blur(0px)",
  },
  transition: {
    type: "spring" as const,
    stiffness: 320,
    damping: 22,
    mass: 0.72,
  },
};

const phoneEnter = {
  initial: {
    opacity: 0,
    scale: 0.82,
    y: 90,
    rotateZ: 5,
    filter: "blur(16px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateZ: 0,
    filter: "blur(0px)",
  },
  transition: {
    type: "spring" as const,
    stiffness: 320,
    damping: 22,
    mass: 0.72,
    delay: 0.1,
  },
};

export default function LandingPortfolioShowcase() {
  const [sites, setSites] = useState<ShowcaseEntry[]>([]);
  const [fetchState, setFetchState] = useState<"loading" | "ok" | "error">("loading");
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/showcase-sites");
        const data = (await res.json()) as { sites?: ShowcaseEntry[] };
        if (cancelled) return;
        if (!res.ok) {
          setFetchState("error");
          return;
        }
        setSites(Array.isArray(data.sites) ? data.sites : []);
        setFetchState("ok");
      } catch {
        if (!cancelled) setFetchState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelected(0);
  }, [sites]);

  if (fetchState === "loading") {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="flex flex-wrap justify-center gap-2">
          <div className="h-10 w-24 rounded-full bg-white/10" />
          <div className="h-10 w-28 rounded-full bg-white/10" />
          <div className="h-10 w-32 rounded-full bg-white/10" />
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
          <div className="w-full max-w-[640px] aspect-[16/10] rounded-lg bg-white/[0.06]" />
          <div className="rounded-[2.35rem] border-[11px] border-white/10 bg-white/[0.06] w-[220px] h-[476px]" />
        </div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/5 px-5 py-4 text-left text-sm text-amber-100/90 max-w-2xl mx-auto">
          <p className="font-medium text-amber-200/95 mb-1">
            {fetchState === "error" ? "Could not load portfolio config" : "Live demos not configured"}
          </p>
          <p className="text-amber-100/70 leading-relaxed">
            {fetchState === "error" ? (
              "Refresh the page or try again later."
            ) : (
              <>
                In <span className="text-white/90">Admin → All sites</span>, use{" "}
                <span className="text-white/90">Homepage portfolio</span> to choose which sites appear here, or set{" "}
                <code className="text-xs bg-white/10 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SHOWCASE_SITES</code> as a
                fallback.
              </>
            )}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FALLBACK_CARDS.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className="group rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02] flex flex-col"
            >
              <div className={`h-36 bg-gradient-to-br ${item.gradient} relative`} aria-hidden>
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(3,7,18,0.85))]" />
                <span className="absolute bottom-3 left-4 text-xs font-medium text-white/90 uppercase tracking-wider">
                  {item.niche}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">{item.blurb}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    );
  }

  const safeIndex = Math.min(selected, sites.length - 1);
  const current = sites[safeIndex];
  const embedSrc =
    current.embedUrl ?? `/preview/${encodeURIComponent(current.projectId)}`;

  return (
    <div className="space-y-10">
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="Example industries"
      >
        {sites.map((site, i) => {
          const isActive = i === safeIndex;
          return (
            <button
              key={`${site.label}-${site.projectId}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              id={`showcase-tab-${i}`}
              aria-controls="showcase-devices"
              onClick={() => setSelected(i)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
                isActive
                  ? "bg-white text-slate-900 border-white shadow-lg shadow-indigo-500/20"
                  : "bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {site.label}
            </button>
          );
        })}
      </div>

      <div
        id="showcase-devices"
        role="tabpanel"
        aria-labelledby={`showcase-tab-${safeIndex}`}
        className="relative flex flex-col items-center justify-end gap-12 lg:flex-row lg:items-end lg:justify-center lg:gap-2 xl:gap-6 [perspective:1200px]"
      >
        {/* Laptop */}
        <motion.div
          key={`laptop-${current.projectId}-${safeIndex}`}
          className="relative z-0 w-full max-w-[720px] order-3 lg:order-1 lg:translate-x-1 xl:translate-x-3"
          style={{ transformStyle: "preserve-3d" }}
          {...laptopEnter}
        >
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 hidden lg:block">
            Desktop
          </p>
          <div className="drop-shadow-[0_40px_70px_rgba(0,0,0,0.5)]">
            <MacbookPortfolioFrame>
              <ScaledDesktopFrame src={embedSrc} title={`${current.label} — desktop`} />
            </MacbookPortfolioFrame>
          </div>
        </motion.div>

        {/* Phone */}
        <motion.div
          key={`phone-${current.projectId}-${safeIndex}`}
          className="relative z-10 order-2 lg:order-2 lg:-mb-1 xl:mb-0 lg:-translate-x-4 xl:-translate-x-8"
          style={{ transformStyle: "preserve-3d" }}
          {...phoneEnter}
        >
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3">Mobile</p>
          <IphonePortfolioFrame>
            <PhoneScaledIframe src={embedSrc} title={`${current.label} — mobile`} />
          </IphonePortfolioFrame>
        </motion.div>
      </div>
    </div>
  );
}
