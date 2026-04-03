"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LandingContactForm } from "@/components/marketing/LandingContactForm";
import LandingPortfolioShowcase from "@/components/marketing/LandingPortfolioShowcase";
import { MARKETING_REGION_LABEL, MARKETING_SERVICE_CITIES } from "@/lib/marketing-seo";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useInView,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Magnetic3DCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 24 });
  const springY = useSpring(y, { stiffness: 260, damping: 24 });

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      x.set(px * 18);
      y.set(py * -14);
    },
    [x, y]
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: springY, rotateY: springX, transformStyle: "preserve-3d" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.floor(eased * value));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function LandingHome() {
  const { data: session, status } = useSession();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  // Parallax on opacity only — translating the mesh on Y caused a faint band at the top / under the nav
  const meshOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.35]);
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const isMainAdmin = Boolean(session?.user && "isMainAdmin" in session.user && session.user.isMainAdmin);

  return (
    <div className="landing-root min-h-screen bg-[#030712] text-white overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div style={{ opacity: meshOpacity }} className="absolute inset-0 landing-mesh min-h-full" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black, transparent)",
          }}
        />
        <motion.div
          className="absolute w-[min(90vw,720px)] h-[min(90vw,720px)] rounded-full left-1/2 top-[18%] -translate-x-1/2 blur-[100px] opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 65%)",
            x: mouse.x * 0.6,
            y: mouse.y * 0.6,
          }}
        />
        <motion.div
          className="absolute w-[min(70vw,520px)] h-[min(70vw,520px)] rounded-full right-[-10%] top-[40%] blur-[90px] opacity-30"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.45) 0%, transparent 70%)",
            x: mouse.x * -0.4,
            y: mouse.y * -0.3,
          }}
        />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 h-16 overflow-hidden border-b border-white/[0.06] bg-[#030712]/92 backdrop-blur-xl [contain:paint]">
        <div className="max-w-6xl mx-auto px-5 h-full flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-[1px] shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full rounded-[11px] bg-[#0a0f1c] flex items-center justify-center text-xs font-bold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">J</span>
              </div>
            </div>
            <span className="font-semibold tracking-tight text-white/95 group-hover:text-white transition-colors">
              Website by <span className="text-indigo-400">Jay</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7 text-sm text-white/55">
            <a href="#results" className="hover:text-white transition-colors">
              Results
            </a>
            <a href="#portfolio" className="hover:text-white transition-colors">
              Work
            </a>
            <a href="#seo" className="hover:text-white transition-colors">
              SEO
            </a>
            <a href="#service" className="hover:text-white transition-colors">
              Why Jay
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {status === "loading" ? (
              <span className="text-white/30 text-sm">…</span>
            ) : session?.user ? (
              <>
                {isMainAdmin && (
                  <Link
                    href="/admin"
                    className="hidden sm:inline-flex text-xs font-medium px-3 py-2 rounded-lg border border-amber-400/30 text-amber-200/95 hover:bg-amber-500/10 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link href="/login" className="text-sm text-white/70 hover:text-white px-3 py-2">
                  Account
                </Link>
              </>
            ) : (
              <a
                href="#contact"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-white text-slate-900 hover:bg-white/90 transition-colors"
              >
                Let&apos;s talk
              </a>
            )}
          </div>
        </div>
      </header>

      <section ref={heroRef} className="relative z-10 min-h-[100dvh] flex flex-col justify-center pt-24 pb-20 px-5">
        <motion.div style={{ y: headlineY }} className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.12 } },
              hidden: {},
            }}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} custom={0} className="inline-flex">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium tracking-wide text-indigo-200/90 uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                Websites for small businesses · by Jay
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-[clamp(2.35rem,6.5vw,4.5rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-white"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Your next customer
              <br />
              <span className="bg-gradient-to-r from-indigo-200 via-white to-fuchsia-300 bg-clip-text text-transparent">
                is already searching online.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light"
            >
              I&apos;m <strong className="text-slate-200 font-medium">Jay</strong> — I build fast, professional sites for
              local and small businesses: clear messaging, strong SEO foundations, and support where you talk to a real
              person (me), not a call center.
            </motion.p>

            <motion.p
              variants={fadeInUp}
              custom={3}
              className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed"
            >
              <span className="text-slate-400">Service area — </span>
              {MARKETING_REGION_LABEL}: {MARKETING_SERVICE_CITIES.join(", ")}, and nearby Massachusetts communities.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              custom={4}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <a
                href="#portfolio"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-900/40 hover:shadow-indigo-800/50 hover:scale-[1.02] transition-all"
              >
                See industries I serve
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#results"
                className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-medium border border-white/15 text-white/85 hover:bg-white/5 transition-colors"
              >
                Sales &amp; lead results
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="max-w-4xl mx-auto mt-16 md:mt-24 perspective-[1200px] px-2">
          <Magnetic3DCard className="relative mx-auto max-w-3xl">
            <div
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-1 shadow-2xl shadow-black/60"
              style={{ transform: "translateZ(24px)" }}
            >
              <div className="rounded-[14px] bg-[#0c1222]/95 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex-1 mx-4 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center px-3 text-xs text-white/35">
                    yourbusiness.com — built by Jay
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 p-5 min-h-[200px]">
                  <div className="col-span-2 rounded-xl bg-gradient-to-br from-indigo-500/25 via-violet-600/15 to-fuchsia-600/10 border border-white/10 p-6 flex flex-col justify-end landing-hero-shimmer">
                    <p className="text-xs text-indigo-200/80 mb-2 uppercase tracking-wider">Local SEO preview</p>
                    <div className="h-2 w-28 bg-white/20 rounded mb-3" />
                    <div className="h-2 w-40 bg-white/10 rounded mb-2" />
                    <div className="h-2 w-32 bg-white/10 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-16 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] text-white/30">
                      Call now
                    </div>
                    <div className="h-16 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] text-white/30">
                      Reviews
                    </div>
                    <div className="h-16 rounded-lg bg-gradient-to-br from-indigo-500/30 to-transparent border border-indigo-400/20 flex items-center justify-center text-[10px] text-emerald-400/80">
                      Map pack ready
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="absolute -inset-4 rounded-3xl bg-gradient-to-t from-indigo-600/20 to-transparent blur-2xl -z-10 opacity-60"
              style={{ transform: "translateZ(-40px)" }}
            />
          </Magnetic3DCard>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex justify-center mt-16"
        >
          <div className="flex flex-col items-center gap-2 text-white/35 text-xs uppercase tracking-[0.25em]">
            <span>Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-2"
            >
              <div className="w-1 h-1.5 rounded-full bg-white/50" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-6 overflow-hidden">
        <motion.div
          className="flex gap-16 whitespace-nowrap text-sm text-white/40 font-medium"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        >
          {Array(2)
            .fill([
              "Local SEO",
              "Google-friendly structure",
              "Fast page loads",
              "Mobile-first",
              "Clear calls-to-action",
              "Personal support from Jay",
              "Conversion-focused copy",
              "Ongoing help when you need it",
            ])
            .flat()
            .map((label, i) => (
              <span key={i} className="flex items-center gap-16">
                <span>{label}</span>
                <span className="text-indigo-500/50">◆</span>
              </span>
            ))}
        </motion.div>
      </section>

      {/* Results / sales impact */}
      <section id="results" className="relative z-10 py-28 px-5 max-w-6xl mx-auto scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="text-indigo-300/90 text-sm font-medium tracking-widest uppercase mb-3">
            Real outcomes for real businesses
          </p>
          <h2
            className="text-3xl md:text-[2.75rem] font-semibold tracking-tight text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            More visibility → more conversations →{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              more revenue
            </span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
            You care about calls, bookings, and quotes — not buzzwords. Here&apos;s what similar small businesses report
            after upgrading from outdated or DIY sites.
          </p>
        </motion.div>

        <div className="relative mb-16 md:mb-20">
          <div
            className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-indigo-500/35 via-fuchsia-500/15 to-transparent opacity-90 blur-sm pointer-events-none"
            aria-hidden
          />
          <div className="relative rounded-[26px] border border-white/10 bg-gradient-to-b from-[#0c1220] via-[#080d18] to-[#030712] p-6 sm:p-10 md:p-12 shadow-[0_0_80px_-20px_rgba(99,102,241,0.35)] overflow-hidden">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(90%,520px)] h-32 bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none"
              aria-hidden
            />
            <p className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-indigo-200/85 mb-10 md:mb-12">
              Numbers owners ask about first
            </p>
            <div className="grid sm:grid-cols-3 gap-10 sm:gap-6 md:gap-8">
              {[
                {
                  n: 40,
                  suffix: "%",
                  hook: "More qualified leads",
                  label: "Typical lift in serious inquiries",
                  note: "After launch + local SEO tune-up — fewer tire-kickers, more real opportunities.",
                  icon: (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M3 17l6-6 4 4 8-8"
                        stroke="url(#g1)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M14 8h6v6" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="g1" x1="3" y1="17" x2="21" y2="5" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#a5b4fc" />
                          <stop offset="1" stopColor="#c4b5fd" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ),
                },
                {
                  n: 2,
                  suffix: "×",
                  hook: "Higher inquiry volume",
                  label: "Versus old or DIY sites",
                  note: "Clear offers + easy contact paths turn browsers into calls and form fills.",
                  icon: (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M22 12h-4l-3 9L9 3l-3 9H2"
                        stroke="url(#g2)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient id="g2" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#fbbf24" />
                          <stop offset="1" stopColor="#f472b6" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ),
                },
                {
                  n: 90,
                  suffix: "%",
                  hook: "Mobile traffic covered",
                  label: "Built for phones first",
                  note: "Most local searches happen on mobile — fast, readable, thumb-friendly CTAs.",
                  icon: (
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <rect
                        x="5"
                        y="2"
                        width="14"
                        height="20"
                        rx="2"
                        stroke="url(#g3)"
                        strokeWidth="2"
                      />
                      <path d="M12 18h.01" stroke="url(#g3)" strokeWidth="2" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="g3" x1="5" y1="2" x2="19" y2="22" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#34d399" />
                          <stop offset="1" stopColor="#22d3ee" />
                        </linearGradient>
                      </defs>
                    </svg>
                  ),
                },
              ].map((s, idx) => (
                <motion.div
                  key={s.hook}
                  initial={{ opacity: 0, y: 28, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: idx * 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="relative text-center sm:text-left flex flex-col items-center sm:items-stretch"
                >
                  <div className="flex justify-center sm:justify-start mb-4 opacity-90">{s.icon}</div>
                  <div
                    className="text-[clamp(3.25rem,8vw,4.75rem)] leading-none font-bold tabular-nums tracking-tight mb-3"
                    style={{ fontFamily: "var(--font-display), Georgia, serif" }}
                  >
                    <span className="bg-gradient-to-b from-white via-white to-indigo-200/90 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(129,140,248,0.35)]">
                      <AnimatedCounter value={s.n} suffix={s.suffix} />
                    </span>
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-white mb-1">{s.hook}</p>
                  <p className="text-xs font-medium uppercase tracking-wider text-indigo-300/80 mb-4">{s.label}</p>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
                    {s.note}
                  </p>
                  {idx < 2 && (
                    <div
                      className="hidden sm:block absolute top-8 -right-3 md:-right-4 w-px h-[calc(100%-2rem)] bg-gradient-to-b from-transparent via-white/15 to-transparent"
                      aria-hidden
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              quote:
                "We started getting real quote requests from the website within weeks. Jay actually listened to how we work.",
              name: "Owner",
              biz: "Regional home services company",
            },
            {
              quote:
                "Customers finally say they found us on Google and understood our services before they called. That wasn’t happening with our old site.",
              name: "Manager",
              biz: "Local specialty retail",
            },
          ].map((t, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8 text-left"
            >
              <p className="text-slate-200 leading-relaxed mb-6 text-lg">&ldquo;{t.quote}&rdquo;</p>
              <footer className="text-sm text-slate-500">
                <span className="text-white/80">{t.name}</span> · {t.biz}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="relative z-10 py-24 px-5 max-w-7xl mx-auto scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-indigo-300/90 text-sm font-medium tracking-widest uppercase mb-3">Portfolio</p>
          <h2
            className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Built for owners who wear a lot of hats
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From trades to storefronts — each build balances your brand, your local market, and the actions you want
            customers to take.
          </p>
        </motion.div>

        <LandingPortfolioShowcase />
      </section>

      {/* SEO */}
      <section id="seo" className="relative z-10 py-24 px-5 max-w-6xl mx-auto scroll-mt-24">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-indigo-300/90 text-sm font-medium tracking-widest uppercase mb-3">SEO &amp; Google</p>
            <h2
              className="text-3xl md:text-4xl font-semibold text-white mb-6"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Found where your customers already look
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8">
              Pretty isn&apos;t enough — your site needs clean structure, fast load times, and content that matches what
              people type into search. I bake in technical SEO basics: semantic headings, meta descriptions, sitemap
              readiness, and performance that helps Core Web Vitals — so you&apos;re not starting from zero when you
              invest in local rankings.
            </p>
            <ul className="space-y-4">
              {[
                "Page titles & descriptions tuned for your services and city",
                "Schema-friendly layout for business info, hours, and reviews",
                "Speed-focused delivery — slow sites lose leads and rank",
                "Content hierarchy that reinforces what you want to rank for",
              ].map((line) => (
                <li key={line} className="flex gap-3 text-slate-300 text-sm">
                  <span className="text-emerald-400/90 mt-0.5" aria-hidden>
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 lg:p-10"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Why this matters for small business</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Big agencies sell retainers. I focus on a site that earns trust the second someone lands on it — because
              for local businesses, the homepage often <em>is</em> the first impression of your whole company.
            </p>
            <div className="rounded-xl bg-indigo-500/10 border border-indigo-400/20 p-5 text-sm text-indigo-100/90">
              &ldquo;If Google can&apos;t understand your pages, customers won&apos;t either. I build both for people and
              for search — without stuffing keywords or looking spammy.&rdquo;
              <div className="mt-3 text-indigo-300/80 font-medium">— Jay</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service / Why Jay */}
      <section id="service" className="relative z-10 py-8 scroll-mt-24">
        <div className="relative h-[min(56vh,480px)] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 scale-110"
            style={{
              background:
                "linear-gradient(135deg, rgba(79,70,229,0.35) 0%, rgba(15,23,42,0.95) 45%, rgba(190,24,93,0.2) 100%)",
            }}
            initial={{ scale: 1.12 }}
            whileInView={{ scale: 1.04 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 1.2 }}
          />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 60 L60 0 M-15 15 L15 -15 M45 75 L75 45\' stroke=\'rgba(255,255,255,0.04)\' stroke-width=\'1\'/%3E%3C/svg%3E')]" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 text-center px-6 max-w-3xl"
          >
            <p className="text-indigo-200/80 text-sm font-medium tracking-widest uppercase mb-4">Customer service</p>
            <p
              className="text-3xl md:text-4xl font-semibold text-white leading-tight mb-4"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              You get Jay — not a revolving ticket queue.
            </p>
            <p className="text-slate-300/90 text-lg">
              Clear updates, straight answers, and someone who cares whether your business actually grows.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-5 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Responsive & honest",
              body: "I reply in plain language, set realistic timelines, and flag what will move the needle for your shop or service area.",
            },
            {
              title: "Revisions that make sense",
              body: "Your feedback shapes the launch. We tighten copy, imagery, and CTAs until it feels like your business — not a generic theme.",
            },
            {
              title: "After launch",
              body: "Need a seasonal promo, new service, or photo swap? I'm here for long-term relationships, not one-off handoffs.",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
            >
              <h3 className="text-lg font-semibold text-white mb-3">{card.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="contact" className="relative z-10 py-24 px-5 scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-950/80 to-slate-950/90 p-12 md:p-16 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
          <div className="relative z-10">
            <h2
              className="text-2xl md:text-3xl font-semibold text-white mb-4"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Let&apos;s talk about your business
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Tell me a bit about your company and how to reach you. I work primarily with small and local businesses
              who want a site that performs — and a partner who picks up the phone.
            </p>
            <LandingContactForm />
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-12 px-5 text-center text-sm text-slate-500">
        <p className="text-white/70 font-medium mb-1">Website by Jay</p>
        <p className="max-w-lg mx-auto leading-relaxed">
          © {new Date().getFullYear()} Jay · Web design &amp; SEO for the North Shore of Massachusetts &amp; Greater
          Boston — Lynn, Salem, Peabody, Revere, Chelsea, Everett, Saugus, Boston &amp; nearby.
        </p>
      </footer>
    </div>
  );
}
