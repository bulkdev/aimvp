"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TINT_FALLBACK_HERO, TINT_VLT_STYLES, type TintVltKey } from "./tintLuxuryConstants";

const ORDER: TintVltKey[] = ["none", "v35", "v20", "v5"];

export default function TintSimulatorSection({ carImageUrl }: { carImageUrl: string }) {
  const [level, setLevel] = useState<TintVltKey>("v35");
  const cfg = TINT_VLT_STYLES[level];
  const src = carImageUrl || TINT_FALLBACK_HERO;

  return (
    <section
      id="tint-simulator"
      className="relative py-24 md:py-32 px-5 md:px-10 bg-[#050508] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(109,40,217,0.22),transparent)]" />
      <div className="mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-14 md:mb-20"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-violet-400/90 mb-4">
            Interactive lab
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-tint-display)" }}
          >
            See the film before we cut a single inch.
          </h2>
          <p className="mt-4 text-zinc-500 text-sm md:text-base" style={{ fontFamily: "var(--font-tint-body)" }}>
            Dial through VLT presets. Watch how cabin privacy and glare control shift in real time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-center">
          <motion.div
            className="relative aspect-[16/10] rounded-[2rem] overflow-hidden border border-white/[0.1] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_120px_-40px_rgba(109,40,217,0.45)]"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <motion.div
              className="absolute inset-0 bg-black pointer-events-none"
              animate={{ opacity: cfg.overlay }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.div
              className="absolute inset-0 pointer-events-none mix-blend-soft-light"
              animate={{ opacity: 0.35 + cfg.overlay * 0.4 }}
              style={{
                background: `linear-gradient(135deg, ${cfg.sheen}, transparent 50%, rgba(0,0,0,0.25))`,
              }}
              transition={{ duration: 0.65 }}
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#030306]/90 via-transparent to-transparent" />
            <AnimatePresence mode="wait">
              <motion.div
                key={level}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="absolute bottom-6 left-6 right-6 flex justify-between items-end"
              >
                <div>
                  <p className="text-white/50 text-[10px] uppercase tracking-[0.35em] mb-1">Active preset</p>
                  <p className="text-white text-xl font-semibold" style={{ fontFamily: "var(--font-tint-display)" }}>
                    {cfg.label}
                  </p>
                  <p className="text-zinc-400 text-sm mt-0.5">{cfg.sub}</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-xl px-4 py-3 text-right">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500">Glare reduction</p>
                  <p className="text-violet-300 font-mono text-lg">
                    {level === "none" ? "—" : level === "v35" ? "High" : level === "v20" ? "Max" : "Extreme"}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="flex flex-col gap-3">
            {ORDER.map((key) => {
              const c = TINT_VLT_STYLES[key];
              const active = level === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLevel(key)}
                  className={`group relative text-left rounded-2xl border px-5 py-4 transition-all duration-300 ${
                    active
                      ? "border-violet-500/50 bg-violet-500/10 shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)]"
                      : "border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-white font-medium" style={{ fontFamily: "var(--font-tint-display)" }}>
                        {c.label}
                      </p>
                      <p className="text-zinc-500 text-xs mt-0.5">{c.sub}</p>
                    </div>
                    <span
                      className={`h-2.5 w-2.5 rounded-full shrink-0 transition-all ${
                        active ? "bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.9)]" : "bg-zinc-600 group-hover:bg-zinc-500"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
