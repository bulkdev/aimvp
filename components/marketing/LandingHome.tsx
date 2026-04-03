"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
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
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
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
      {/* Ambient mesh + grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div style={{ y: bgY, opacity: meshOpacity }} className="absolute inset-0 landing-mesh" />
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

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#030712]/75 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-[1px] shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full rounded-[11px] bg-[#0a0f1c] flex items-center justify-center text-sm font-bold tracking-tight">
                <span className="bg-gradient-to-r from-indigo-300 to-fuchsia-400 bg-clip-text text-transparent">AI</span>
              </div>
            </div>
            <span className="font-semibold tracking-tight text-white/95 group-hover:text-white transition-colors">
              SiteGen<span className="text-indigo-400">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-white/55">
            <a href="#craft" className="hover:text-white transition-colors">
              Craft
            </a>
            <a href="#stack" className="hover:text-white transition-colors">
              Stack
            </a>
            <a href="#motion" className="hover:text-white transition-colors">
              Motion
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
                <Link
                  href="/login"
                  className="text-sm text-white/70 hover:text-white px-3 py-2"
                >
                  Account
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-white/70 hover:text-white px-2 py-2">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-white text-slate-900 hover:bg-white/90 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
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
                Web design · engineered
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-[clamp(2.5rem,7vw,4.75rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-white"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Interfaces that
              <br />
              <span className="bg-gradient-to-r from-indigo-200 via-white to-fuchsia-300 bg-clip-text text-transparent">
                feel alive.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light"
            >
              Precision layout, motion systems, and depth — the same discipline we bring to client work, packaged for
              teams who ship fast without looking generic.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <a
                href="#craft"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-900/40 hover:shadow-indigo-800/50 hover:scale-[1.02] transition-all"
              >
                Explore the work
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#stack"
                className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-medium border border-white/15 text-white/85 hover:bg-white/5 transition-colors"
              >
                Technical depth
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 3D browser mock */}
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
                    yoursite.app/preview
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 p-5 min-h-[200px]">
                  <div className="col-span-2 rounded-xl bg-gradient-to-br from-indigo-500/25 via-violet-600/15 to-fuchsia-600/10 border border-white/10 p-6 flex flex-col justify-end landing-hero-shimmer">
                    <div className="h-2 w-24 bg-white/20 rounded mb-3" />
                    <div className="h-2 w-40 bg-white/10 rounded mb-2" />
                    <div className="h-2 w-32 bg-white/10 rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-16 rounded-lg bg-white/5 border border-white/5" />
                    <div className="h-16 rounded-lg bg-white/5 border border-white/5" />
                    <div className="h-16 rounded-lg bg-gradient-to-br from-indigo-500/30 to-transparent border border-indigo-400/20" />
                  </div>
                </div>
              </div>
            </div>
            {/* Glow under card */}
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

      {/* Marquee */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.02] py-6 overflow-hidden">
        <motion.div
          className="flex gap-16 whitespace-nowrap text-sm text-white/40 font-medium"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        >
          {Array(2)
            .fill([
              "Design systems",
              "Motion specs",
              "Responsive depth",
              "Accessibility",
              "Performance",
              "Brand polish",
              "Component libraries",
              "Prototype → ship",
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

      {/* Bento */}
      <section id="craft" className="relative z-10 py-28 px-5 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Craft, not templates
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Layered glass, calibrated motion, and spatial hierarchy — the details users feel before they read a word.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {[
            {
              title: "Spatial UI",
              body: "Depth cues, parallax layers, and light that behaves like physical materials.",
              accent: "from-cyan-500/20 to-transparent",
            },
            {
              title: "Motion language",
              body: "Staggered reveals, spring physics, and scroll-linked storytelling — never random easing.",
              accent: "from-violet-500/20 to-transparent",
            },
            {
              title: "Live surfaces",
              body: "Glass panels, gradient meshes, and grids that respond to pointer and scroll.",
              accent: "from-fuchsia-500/20 to-transparent",
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-white mb-3">{card.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{card.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Parallax strip */}
      <section id="motion" className="relative z-10 py-8">
        <div className="relative h-[min(70vh,560px)] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 scale-110"
            style={{
              background:
                "linear-gradient(135deg, rgba(79,70,229,0.35) 0%, rgba(15,23,42,0.95) 45%, rgba(190,24,93,0.2) 100%)",
            }}
            initial={{ scale: 1.15 }}
            whileInView={{ scale: 1.05 }}
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
            <p className="text-indigo-200/80 text-sm font-medium tracking-widest uppercase mb-4">Motion design</p>
            <p
              className="text-3xl md:text-5xl font-semibold text-white leading-tight"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Every transition earns its place.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats + stack */}
      <section id="stack" className="relative z-10 py-24 px-5 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2
              className="text-3xl md:text-4xl font-semibold text-white mb-6"
              style={{ fontFamily: "var(--font-display), Georgia, serif" }}
            >
              Built for velocity
              <br />
              <span className="text-indigo-400/90">without sacrificing soul.</span>
            </h2>
            <p className="text-slate-400 mb-10 leading-relaxed">
              Modern stacks, typed components, and deployment pipelines — so your team spends time on differentiation,
              not glue code.
            </p>
            <div className="grid grid-cols-3 gap-6">
              {[
                { n: 60, suffix: "+", label: "FPS feel" },
                { n: 3, suffix: "D", label: "Depth layers" },
                { n: 100, suffix: "%", label: "Responsive" },
              ].map((s) => (
                <div key={s.label} className="text-center sm:text-left">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tabular-nums">
                    <AnimatedCounter value={s.n} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, rotateX: 8 }}
            whileInView={{ opacity: 1, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-8 space-y-4"
            style={{ transformStyle: "preserve-3d" }}
          >
            {["Next.js App Router", "Tailwind CSS", "Framer Motion", "Edge-ready APIs", "Auth & sessions"].map(
              (tech, i) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <span className="text-white/90">{tech}</span>
                  <span className="text-xs text-emerald-400/90 font-mono">● ready</span>
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-5">
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
              Ready when you are.
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Create an account to manage your presence, or sign in to continue. Site generation is available to your
              studio team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex justify-center rounded-xl px-8 py-3.5 text-sm font-semibold bg-white text-slate-900 hover:bg-white/90 transition-colors"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex justify-center rounded-xl px-8 py-3.5 text-sm font-medium border border-white/20 text-white hover:bg-white/5 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t border-white/5 py-12 px-5 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} SiteGen AI · Crafted interface design</p>
      </footer>
    </div>
  );
}
