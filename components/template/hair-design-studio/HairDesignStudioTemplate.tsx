"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { MapPin, Star, ArrowUpRight, Sparkles, Instagram } from "lucide-react";
import type { HairDesignStudioStylist, Project, ServiceItem } from "@/types";
import { buildThemeCssVars } from "@/lib/utils";
import { ensureHairDesignStudioConfig } from "@/lib/hair-design-studio-config";
import { firstHeroStillFromSlides, firstHeroVideoFromSlides } from "@/components/template/window-tint/tintLuxuryConstants";
import { HairStudioProvider, useHairStudio } from "./HairStudioContext";
import HairStudioBookingDrawer from "./HairStudioBookingDrawer";
import { isStudioOpenOnDay, parseDateIsoLocal } from "@/lib/studio-scheduling";

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@400;500;600;700;800&display=swap";

const FILTER_LABELS = ["All", "Dreads", "Braids", "Twists", "Cuts", "Coloring"] as const;

const DEMO_HAIR_VIDEO =
  "https://videos.pexels.com/video-files/3991979/3991979-hd_1920_1080_25fps.mp4";

type Props = { project: Project; publishedBasePath?: string };

export default function HairDesignStudioTemplate({ project, publishedBasePath }: Props) {
  const { content, intake } = project;
  const studio = useMemo(() => ensureHairDesignStudioConfig(content, intake), [content, intake]);
  const initialLoc = studio.locations[0]?.id ?? "studio-a";

  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    const id = "hair-studio-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = FONT_LINK;
      document.head.appendChild(link);
    }
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  const cssVars = buildThemeCssVars(content.theme);

  return (
    <HairStudioProvider studio={studio} initialLocationId={initialLoc}>
      <div
        className="hair-studio-root min-h-screen antialiased selection:bg-[#d4e157]/35 selection:text-black"
        style={
          {
            ...cssVars,
            "--hs-display": "'Syne', system-ui, sans-serif",
            "--hs-body": "'DM Sans', system-ui, sans-serif",
            background: "#050506",
            color: "#e4e4e7",
            fontFamily: "var(--hs-body)",
          } as React.CSSProperties
        }
      >
        <HairStudioChrome project={project} publishedBasePath={publishedBasePath} />
        <HairStudioBookingDrawer
          projectId={project.id}
          services={content.services}
          bookingFullyBooked={content.assets?.bookingFullyBooked}
          waitlistNote={content.assets?.bookingWaitlistNote}
        />
      </div>
    </HairStudioProvider>
  );
}

function HairStudioChrome({ project, publishedBasePath }: Props) {
  const { content, intake } = project;
  const { openBooking, locationId, setLocationId, setPresetService, setPresetStylistId, studio } = useHairStudio();
  const { scrollYProgress } = useScroll();
  const [navSolid, setNavSolid] = useState(false);
  const [filter, setFilter] = useState<string>("All");
  const [stylistFocus, setStylistFocus] = useState<HairDesignStudioStylist | null>(null);
  const [profileDate, setProfileDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroVideo =
    content.assets?.tintHeroVideoUrl?.trim() || firstHeroVideoFromSlides(content.assets?.heroSlides) || DEMO_HAIR_VIDEO;
  const heroPoster =
    content.assets?.tintHeroVideoPosterUrl?.trim() ||
    firstHeroStillFromSlides(content.assets?.heroSlides) ||
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=85";

  const filteredServices = useMemo(() => {
    if (filter === "All") return content.services;
    const f = filter.toLowerCase();
    return content.services.filter((s) => {
      const c = (s.category || "").toLowerCase();
      const t = s.title.toLowerCase();
      return c.includes(f) || t.includes(f);
    });
  }, [content.services, filter]);

  const manualReviews = (content.assets?.manualReviews || []).filter((r) => r.reviewerName?.trim() && r.text?.trim());

  const galleryUrls = useMemo(() => {
    const out: string[] = [];
    for (const pair of studio.beforeAfterPairs || []) {
      if (pair.afterUrl?.trim()) out.push(pair.afterUrl.trim());
      if (pair.beforeUrl?.trim()) out.push(pair.beforeUrl.trim());
    }
    for (const row of content.assets?.portfolioProjects || []) {
      for (const u of row) {
        if (u?.trim()) out.push(u.trim());
      }
    }
    return Array.from(new Set(out)).slice(0, 24);
  }, [studio.beforeAfterPairs, content.assets?.portfolioProjects]);

  const popular = useMemo(() => {
    const base = [...content.services];
    return base.slice(0, 5).map((s, i) => ({ service: s, heat: 94 - i * 4 }));
  }, [content.services]);

  const aiPick = useMemo(() => {
    const cat = filteredServices[0]?.category || "Braids";
    return content.services.filter((s) => (s.category || "").toLowerCase().includes(cat.toLowerCase())).slice(0, 3);
  }, [content.services, filteredServices]);

  const hash = (h: string) => (publishedBasePath ? `${publishedBasePath}${h}` : h);

  return (
    <>
      <motion.div
        className="fixed left-0 top-0 z-[90] h-[2px] w-full origin-left bg-[#d4e157]"
        style={{ scaleX: scrollYProgress }}
      />

      <header
        className={`fixed left-0 right-0 top-0 z-[80] transition-colors duration-300 ${
          navSolid ? "border-b border-white/10 bg-[#050506]/85 backdrop-blur-xl" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 md:px-8">
          <a href={hash("#hair-hero")} className="group flex items-center gap-3">
            {intake.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={intake.logoDataUrl} alt="" className="h-9 w-auto opacity-90 transition group-hover:opacity-100" />
            ) : (
              <span className="font-[family-name:var(--hs-display)] text-lg font-bold tracking-tight text-white">
                {content.brandName}
              </span>
            )}
          </a>

          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 md:flex">
            {[
              ["Work", "#hair-work"],
              ["Services", "#hair-services"],
              ["Artists", "#hair-stylists"],
              ["Studios", "#hair-locations"],
              ["Stories", "#hair-reviews"],
            ].map(([label, id]) => (
              <a key={id} href={hash(id)} className="transition hover:text-[#d4e157]">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-white/15 bg-white/5 p-0.5 sm:flex">
              {studio.locations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setLocationId(loc.id)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                    locationId === loc.id ? "bg-[#d4e157] text-black" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {loc.shortLabel}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={openBooking}
              className="rounded-full bg-[#d4e157] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(212,225,87,0.35)] transition hover:brightness-110"
            >
              Book
            </button>
          </div>
        </div>
      </header>

      <main>
        <section id="hair-hero" className="relative min-h-[100svh] overflow-hidden">
          <div className="absolute inset-0">
            <video
              className="h-full w-full object-cover opacity-90"
              autoPlay
              muted
              loop
              playsInline
              poster={heroPoster}
              src={heroVideo}
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#050506] via-[#070708]/75 to-[#050506]/20"
              style={{ clipPath: "polygon(0 0, 100% 0, 100% 72%, 0 100%)" }}
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(212,225,87,0.12),transparent_50%)]" />
          </div>

          <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-4 pb-24 pt-28 md:flex-row md:items-end md:justify-between md:px-8 md:pb-20">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d4e157]">
                <Sparkles className="h-3 w-3" /> {content.tagline}
              </p>
              <h1 className="font-[family-name:var(--hs-display)] text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[0.95] tracking-tight text-white">
                {content.hero.title}
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-zinc-400 md:text-lg">{content.hero.subtitle}</p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={openBooking}
                  className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-[#d4e157]"
                >
                  Book appointment
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                <a
                  href={hash("#hair-services")}
                  className="rounded-full border border-white/20 px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition hover:border-[#d4e157]/50 hover:text-[#d4e157]"
                >
                  Browse services
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.65 }}
              className="mt-14 w-full max-w-sm md:mt-0"
            >
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Active chair</p>
                <p className="mt-2 font-[family-name:var(--hs-display)] text-xl font-semibold text-white">
                  {studio.locations.find((l) => l.id === locationId)?.name}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  {studio.locations.find((l) => l.id === locationId)?.address}
                </p>
                <div className="mt-4 flex gap-2 sm:hidden">
                  {studio.locations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setLocationId(loc.id)}
                      className={`flex-1 rounded-xl border px-2 py-2 text-[10px] font-bold uppercase ${
                        locationId === loc.id ? "border-[#d4e157] bg-[#d4e157]/15 text-[#d4e157]" : "border-white/10"
                      }`}
                    >
                      {loc.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 overflow-hidden border-t border-white/5 bg-[#050506]/90 py-3 backdrop-blur-sm">
            <div className="hs-marquee flex w-max gap-16 text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-500">
              <span className="shrink-0">
                Dreads · Braids · Twists · Cuts · Color · Precision · Hygiene-first · Urban luxury ·
              </span>
              <span className="shrink-0" aria-hidden>
                Dreads · Braids · Twists · Cuts · Color · Precision · Hygiene-first · Urban luxury ·
              </span>
            </div>
          </div>
          <style>{`
            @keyframes hs-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .hs-marquee {
              animation: hs-marquee 24s linear infinite;
            }
          `}</style>
        </section>

        <section id="hair-work" className="relative border-t border-white/5 bg-[#080809] px-4 py-20 md:px-8">
          <div className="mx-auto max-w-[1400px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4e157]">Popular right now</p>
                <h2 className="mt-2 font-[family-name:var(--hs-display)] text-3xl font-bold text-white md:text-4xl">
                  Trending styles
                </h2>
              </div>
              <p className="max-w-md text-sm text-zinc-500">
                Momentum from the chair — the looks clients are booking most this month at {content.brandName}.
              </p>
            </motion.div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {popular.map(({ service, heat }, i) => (
                <motion.button
                  key={service.title}
                  type="button"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    setPresetService(service);
                    openBooking();
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-5 text-left transition hover:border-[#d4e157]/40"
                >
                  <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-[#d4e157]">
                    {heat}% booked
                  </div>
                  <p className="font-[family-name:var(--hs-display)] text-lg font-semibold text-white">{service.title}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-zinc-500">{service.description}</p>
                  <p className="mt-4 text-sm font-semibold text-[#d4e157]">{service.startingPrice || "Request quote"}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        <section id="hair-services" className="border-t border-white/5 bg-[#050506] px-4 py-24 md:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <div className="lg:w-72 lg:shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4e157]">Menu</p>
                <h2 className="mt-2 font-[family-name:var(--hs-display)] text-3xl font-bold text-white">Services</h2>
                <p className="mt-4 text-sm text-zinc-500">Filter by lane. Every card shows honest timing and floor pricing.</p>
                <div className="mt-8 flex flex-wrap gap-2">
                  {FILTER_LABELS.map((lab) => (
                    <button
                      key={lab}
                      type="button"
                      onClick={() => setFilter(lab)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition ${
                        filter === lab
                          ? "border-[#d4e157] bg-[#d4e157] text-black"
                          : "border-white/10 text-zinc-400 hover:border-white/25"
                      }`}
                    >
                      {lab}
                    </button>
                  ))}
                </div>

                <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Suggested for you</p>
                  <p className="mt-1 text-xs text-zinc-400">Based on your filter — swap lane to refresh picks.</p>
                  <ul className="mt-4 space-y-3">
                    {aiPick.map((s) => (
                      <li key={s.title}>
                        <button
                          type="button"
                          onClick={() => {
                            setPresetService(s);
                            openBooking();
                          }}
                          className="flex w-full items-center justify-between gap-2 text-left text-sm text-white transition hover:text-[#d4e157]"
                        >
                          <span>{s.title}</span>
                          <ArrowUpRight className="h-4 w-4 shrink-0 opacity-50" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid flex-1 gap-5 sm:grid-cols-2">
                {filteredServices.map((s, i) => (
                  <motion.article
                    key={s.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 4) * 0.05 }}
                    whileHover={{ rotate: i % 2 === 0 ? 0.4 : -0.4 }}
                    className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0f] ${
                      i % 3 === 0 ? "sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-0" : ""
                    }`}
                  >
                    <div className="relative aspect-[16/10] sm:aspect-auto sm:min-h-[220px]">
                      <ServiceImage service={s} cardImages={content.assets?.serviceCardImages} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
 <span className="absolute left-4 top-4 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#d4e157]">
                        {(s.category || "Signature").toUpperCase()}
                      </span>
                    </div>
                    <div className="p-6 sm:flex sm:flex-col sm:justify-center">
                      <h3 className="font-[family-name:var(--hs-display)] text-xl font-semibold text-white">{s.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm text-zinc-400">{s.description}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                        <span className="rounded-md bg-white/5 px-2 py-1 text-zinc-300">{s.duration || "—"}</span>
                        <span className="font-semibold text-white">{s.startingPrice || "Custom"}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPresetService(s);
                          openBooking();
                        }}
                        className="mt-6 w-full rounded-xl bg-[#d4e157] py-3 text-xs font-bold uppercase tracking-wider text-black transition hover:brightness-110 sm:w-auto sm:px-8"
                      >
                        Book now
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="hair-stylists" className="border-t border-white/5 bg-[#080809] px-4 py-24 md:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4e157]">The roster</p>
              <h2 className="mt-2 font-[family-name:var(--hs-display)] text-3xl font-bold text-white md:text-4xl">Artists</h2>
              <p className="mt-4 text-zinc-500">Specialists, not generalists. Tap in for portfolio and live openings.</p>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-12 md:grid-rows-2">
              {studio.stylists.map((st, i) => {
                const span =
                  i === 0 ? "md:col-span-7 md:row-span-2" : i === 1 ? "md:col-span-5" : "md:col-span-5";
                return (
                  <motion.button
                    key={st.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      setStylistFocus(st);
                      setProfileDate(todayIso());
                    }}
                    className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c0f] text-left ${span}`}
                  >
                    <div className={i === 0 ? "grid h-full md:grid-cols-2" : "flex h-full flex-col sm:flex-row"}>
                      <div className={`relative overflow-hidden bg-zinc-900 ${i === 0 ? "min-h-[280px] md:min-h-full" : "aspect-[4/5] sm:aspect-auto sm:w-2/5"}`}>
                        {st.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={st.photoUrl} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="h-full w-full bg-zinc-800" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r" />
                      </div>
                      <div className="flex flex-1 flex-col justify-center p-6">
                        <div className="flex items-center gap-1 text-[#d4e157]">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-bold">{st.rating.toFixed(2)}</span>
                        </div>
                        <h3 className="mt-2 font-[family-name:var(--hs-display)] text-2xl font-bold text-white">{st.name}</h3>
                        <p className="mt-1 text-sm font-medium text-zinc-400">{st.specialty}</p>
                        <p className="mt-3 line-clamp-3 text-sm text-zinc-500">{st.bio}</p>
                        <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d4e157]">
                          Profile & book <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        <section id="hair-locations" className="border-t border-white/5 bg-[#050506] px-4 py-24 md:px-8">
          <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4e157]">Studios</p>
              <h2 className="mt-2 font-[family-name:var(--hs-display)] text-3xl font-bold text-white">Two doors. Same standard.</h2>
              <div className="mt-10 space-y-6">
                {studio.locations.map((loc) => (
                  <div
                    key={loc.id}
                    className={`rounded-2xl border p-6 transition ${
                      locationId === loc.id ? "border-[#d4e157]/50 bg-[#d4e157]/5" : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-[family-name:var(--hs-display)] text-xl font-semibold text-white">{loc.name}</h3>
                        <p className="mt-2 flex items-start gap-2 text-sm text-zinc-400">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#d4e157]" />
                          {loc.address}
                        </p>
                        <ul className="mt-3 text-sm text-zinc-500">
                          {loc.hours.map((h) => (
                            <li key={h}>{h}</li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type="button"
                        onClick={() => setLocationId(loc.id)}
                        className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white hover:border-[#d4e157]/50"
                      >
                        Set active
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:sticky lg:top-28 lg:self-start">
              {studio.locations.map((loc) => (
                <div
                  key={loc.id}
                  className={`mb-6 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 ${locationId === loc.id ? "ring-1 ring-[#d4e157]/40" : "opacity-70"}`}
                >
                  {loc.mapEmbedUrl?.trim() ? (
                    <iframe title={loc.name} src={loc.mapEmbedUrl.trim()} className="aspect-square w-full grayscale contrast-125 sm:aspect-video" loading="lazy" />
                  ) : (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex aspect-video w-full items-center justify-center bg-zinc-800 text-sm text-zinc-400 underline"
                    >
                      Open in Maps — {loc.shortLabel}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="hair-gallery" className="border-t border-white/5 bg-[#080809] px-2 py-20 md:px-4">
          <div className="mx-auto max-w-[1400px] px-2 md:px-4">
            <div className="flex flex-col justify-between gap-6 px-2 md:flex-row md:items-end md:px-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4e157]">Receipts</p>
                <h2 className="mt-2 font-[family-name:var(--hs-display)] text-3xl font-bold text-white">Before / after</h2>
              </div>
              <p className="max-w-md text-sm text-zinc-500">Real texture, real lighting — an IG-ready grid without the template look.</p>
            </div>
            <div className="mt-10 columns-2 gap-2 sm:columns-3 md:gap-3 lg:columns-4">
              {galleryUrls.map((url, i) => (
                <motion.div
                  key={`${url}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: (i % 8) * 0.03 }}
                  className="mb-2 break-inside-avoid overflow-hidden rounded-xl md:mb-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full object-cover transition duration-500 hover:scale-105 hover:brightness-110" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {studio.socialVideoEmbeds && studio.socialVideoEmbeds.length > 0 ? (
          <section className="border-t border-white/5 bg-[#050506] px-4 py-20 md:px-8">
            <div className="mx-auto max-w-[1400px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4e157]">Social</p>
              <h2 className="mt-2 font-[family-name:var(--hs-display)] text-2xl font-bold text-white">Clips & reels</h2>
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                {studio.socialVideoEmbeds.map((raw, i) => (
                  <SocialEmbed key={i} url={raw} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section id="hair-reviews" className="border-t border-white/5 bg-[#080809] px-4 py-24 md:px-8">
          <div className="mx-auto max-w-[1400px]">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4e157]">Proof</p>
            <h2 className="mt-2 font-[family-name:var(--hs-display)] text-3xl font-bold text-white">Client stories</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {manualReviews.length ? (
                manualReviews.map((r, i) => (
                  <motion.blockquote
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-transparent p-8"
                  >
                    <div className="flex gap-1 text-[#d4e157]">
                      {Array.from({ length: Math.min(5, r.rating || 5) }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 text-lg leading-relaxed text-white">&ldquo;{r.text.trim()}&rdquo;</p>
                    <footer className="mt-6 text-sm font-semibold text-zinc-500">— {r.reviewerName.trim()}</footer>
                  </motion.blockquote>
                ))
              ) : (
                <p className="text-zinc-500">Reviews can be added from your site dashboard.</p>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 bg-[#050506] px-4 py-16 md:px-8">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#d4e157]/10 via-transparent to-transparent p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4e157]">Members</p>
              <h3 className="mt-2 font-[family-name:var(--hs-display)] text-2xl font-bold text-white">Loyalty lane</h3>
              <p className="mt-3 max-w-xl text-sm text-zinc-400">{studio.loyaltyBlurb}</p>
            </div>
            <button
              type="button"
              onClick={openBooking}
              className="shrink-0 rounded-full bg-white px-8 py-4 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#d4e157]"
            >
              Book your next visit
            </button>
          </div>
        </section>

        <section className="border-t border-white/5 bg-[#080809] px-4 py-20 md:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#d4e157]">Deposits & policies</p>
                <h3 className="mt-2 font-[family-name:var(--hs-display)] text-2xl font-bold text-white">Transparent checkout</h3>
                <p className="mt-4 text-sm text-zinc-500">{studio.cancellationSummary}</p>
                <ul className="mt-6 space-y-2 text-sm text-zinc-400">
                  <li>Late cancellation fee: ${studio.lateCancelFeeUsd ?? 35}</li>
                  <li>No-show fee: ${studio.noShowFeeUsd ?? 75}</li>
                  <li>Deposit holds your chair — card checkout via Stripe when enabled.</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0c0c0f] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
                <div className="flex items-center gap-3 border-b border-white/10 pb-6">
                  <div className="h-10 w-10 rounded-full bg-[#d4e157]/20" />
                  <div>
                    <p className="text-sm font-semibold text-white">Secure deposit</p>
                    <p className="text-xs text-zinc-500">Encrypted payment · PCI-aware flow</p>
                  </div>
                </div>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between text-zinc-400">
                    <span>Service estimate</span>
                    <span className="text-white">Per your selection</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Deposit due today</span>
                    <span className="font-semibold text-[#d4e157]">Max of {studio.depositPercent ?? 25}% or ${studio.depositFlatUsd ?? 35}</span>
                  </div>
                  <p className="rounded-xl bg-white/5 p-4 text-xs text-zinc-500">
                    You will receive email and SMS confirmations after submitting. Reminder messages can be sent from the studio
                    dashboard when scheduling automation is connected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 bg-[#050506] px-4 py-12 md:px-8">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-[family-name:var(--hs-display)] text-xl font-bold text-white">{content.brandName}</p>
              <p className="mt-2 text-sm text-zinc-500">{content.contact.subheading}</p>
            </div>
            <div className="flex flex-wrap gap-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <a href={hash("#hair-services")} className="hover:text-[#d4e157]">
                Services
              </a>
              <a href={hash("#hair-stylists")} className="hover:text-[#d4e157]">
                Artists
              </a>
              <a href={hash("#hair-locations")} className="hover:text-[#d4e157]">
                Locations
              </a>
              {content.assets?.socialLinks?.instagram ? (
                <a
                  href={content.assets.socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-[#d4e157]"
                >
                  <Instagram className="h-4 w-4" /> IG
                </a>
              ) : null}
            </div>
          </div>
        </footer>
      </main>

      <button
        type="button"
        onClick={openBooking}
        className="fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[#d4e157]/40 bg-[#d4e157] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[0_12px_40px_rgba(212,225,87,0.35)] transition hover:scale-[1.02] hover:brightness-110"
        style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        Book appointment
 <ArrowUpRight className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {stylistFocus ? (
          <StylistProfileModal
            stylist={stylistFocus}
            projectId={project.id}
            locationId={locationId}
            dateIso={profileDate}
            onDateChange={setProfileDate}
            onClose={() => setStylistFocus(null)}
            onBook={() => {
              setPresetStylistId(stylistFocus.id);
              setStylistFocus(null);
              openBooking();
            }}
            services={content.services}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ServiceImage({
  service,
  cardImages,
}: {
  service: ServiceItem;
  cardImages?: Record<string, string>;
}) {
  const cat = (service.category || service.title).toLowerCase();
  const custom = cardImages?.[service.title]?.trim();
  let u =
    custom ||
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80";
  if (!custom) {
    if (cat.includes("dread") || cat.includes("loc"))
      u =
        "https://images.unsplash.com/photo-1634449571010-023e75b36796?auto=format&fit=crop&w=1200&q=80";
    else if (cat.includes("braid"))
      u = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80";
    else if (cat.includes("twist"))
      u = "https://images.unsplash.com/photo-1503951914875-452162b0e3e1?auto=format&fit=crop&w=1200&q=80";
    else if (cat.includes("cut") || cat.includes("barber"))
      u = "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=1200&q=80";
    else if (cat.includes("color"))
      u = "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80";
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={u} alt="" className="h-full w-full object-cover" />
  );
}

function SocialEmbed({ url }: { url: string }) {
  const u = url.trim();
  if (!u) return null;
  if (u.includes("youtube.com") || u.includes("youtu.be")) {
    const id = u.includes("youtu.be/") ? u.split("youtu.be/")[1]?.split(/[?&]/)[0] : new URL(u).searchParams.get("v");
    if (!id) return null;
    return (
      <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
        <iframe
          title="Video"
          src={`https://www.youtube.com/embed/${id}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
      <iframe title="Clip" src={u} className="h-full w-full" allow="autoplay; clipboard-write" />
    </div>
  );
}

function StylistProfileModal({
  stylist,
  projectId,
  locationId,
  dateIso,
  onDateChange,
  onClose,
  onBook,
  services,
}: {
  stylist: HairDesignStudioStylist;
  projectId: string;
  locationId: string;
  dateIso: string;
  onDateChange: (iso: string) => void;
  onClose: () => void;
  onBook: () => void;
  services: ServiceItem[];
}) {
  const [slots, setSlots] = useState<{ timeLabel: string; available: boolean }[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dt = parseDateIsoLocal(dateIso);
    if (!dt || !isStudioOpenOnDay(dt.getDay())) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const q = new URLSearchParams({ projectId, locationId, dateIso, stylistId: stylist.id });
    fetch(`/api/studio-availability?${q}`)
      .then((r) => r.json())
      .then((data: { slots?: { timeLabel: string; available: boolean }[] }) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, locationId, dateIso, stylist.id]);

  const offered = services.filter((s) => stylist.serviceTitles?.includes(s.title));

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 p-4 backdrop-blur-md sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 24, opacity: 0 }}
        transition={{ type: "spring", damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#0a0a0c] shadow-2xl"
      >
        <div className="grid gap-0 md:grid-cols-5">
          <div className="relative min-h-[200px] md:col-span-2 md:min-h-[360px]">
            {stylist.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={stylist.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-zinc-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r" />
          </div>
          <div className="p-6 md:col-span-3 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-[family-name:var(--hs-display)] text-2xl font-bold text-white">{stylist.name}</h3>
                <p className="text-sm text-[#d4e157]">{stylist.specialty}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-400">
                Close
              </button>
            </div>
            <p className="mt-4 text-sm text-zinc-400">{stylist.bio}</p>

            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Portfolio</p>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {(stylist.portfolioUrls || []).map((u, i) => (
                  <div key={i} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
                {!stylist.portfolioUrls?.length ? <p className="text-xs text-zinc-600">Portfolio updating.</p> : null}
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Services they offer</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {offered.map((s) => (
                  <li key={s.title} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                    {s.title}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Availability snapshot</p>
              <input
                type="date"
                value={dateIso}
                min={todayIso()}
                onChange={(e) => onDateChange(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
              />
              {loading ? (
                <p className="mt-3 text-xs text-zinc-500">Loading slots…</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(slots || []).map((s) => (
                    <span
                      key={s.timeLabel}
                      className={`rounded-full border px-2 py-1 text-[11px] ${
                        s.available ? "border-emerald-500/40 text-emerald-200" : "border-white/5 text-zinc-600 line-through"
                      }`}
                    >
                      {s.timeLabel}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onBook}
              className="mt-8 w-full rounded-2xl bg-[#d4e157] py-4 text-xs font-bold uppercase tracking-wider text-black"
            >
              Book with {stylist.name.split(" ")[0]}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
