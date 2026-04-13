"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TINT_FALLBACK_HERO, TINT_FALLBACK_SECOND } from "./tintLuxuryConstants";

export default function TintBeforeAfter({
  beforeSrc,
  afterSrc,
  realPhotoPair,
}: {
  beforeSrc: string;
  afterSrc: string;
  /** True when using dedicated before/after uploads — show images with minimal grading. */
  realPhotoPair?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(52);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - r.left, 0), r.width);
    setPct(Math.round((x / r.width) * 100));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    setFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const b = beforeSrc || TINT_FALLBACK_SECOND;
  const a = afterSrc || TINT_FALLBACK_HERO;

  return (
    <section id="tint-transform" className="relative py-24 md:py-32 px-5 md:px-10 bg-[#08080c]">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75 }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-cyan-400/90 mb-4">
            Optical proof
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-tint-display)" }}
          >
            Drag the light. Feel the cabin transform.
          </h2>
        </motion.div>

        <motion.div
          ref={wrapRef}
          className="relative aspect-[16/9] max-h-[min(70vh,560px)] mx-auto rounded-[2rem] overflow-hidden border border-white/[0.1] cursor-ew-resize select-none touch-none shadow-[0_50px_120px_-50px_rgba(6,182,212,0.25)]"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              !realPhotoPair && "brightness-110 saturate-110"
            )}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div
              className={cn(
                "absolute inset-0 mix-blend-multiply",
                realPhotoPair ? "bg-black/15" : "bg-black/45"
              )}
            />
            {!realPhotoPair ? (
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/25 via-transparent to-cyan-500/15 mix-blend-overlay" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-900/10 via-transparent to-cyan-500/8 mix-blend-overlay pointer-events-none" />
            )}
          </div>
          {/* Reflection streak */}
          <div
            className="pointer-events-none absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-white/70 to-transparent opacity-80"
            style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
          />
          <div
            className="absolute top-0 bottom-0 w-14 flex items-center justify-center"
            style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
          >
            <div className="h-16 w-16 rounded-full border border-white/25 bg-black/50 backdrop-blur-xl flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              <span className="text-white text-xs font-bold tracking-tighter">⟷</span>
            </div>
          </div>
          <div className="pointer-events-none absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] uppercase tracking-widest text-zinc-300">
            Before
          </div>
          <div className="pointer-events-none absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-[10px] uppercase tracking-widest text-violet-200">
            After film
          </div>
        </motion.div>
      </div>
    </section>
  );
}
