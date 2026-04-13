"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { TINT_TRUST_WORDMARKS } from "./tintLuxuryConstants";

function parseStat(val: string): { num: number; decimals: number; suffix: string } {
  const cleaned = val.replace(/,/g, "").trim();
  const m = cleaned.match(/^([\d.]+)(.*)$/);
  if (!m) return { num: 0, decimals: 0, suffix: val };
  const numStr = m[1]!;
  const suffix = m[2] ?? "";
  const decimals = numStr.includes(".") ? numStr.split(".")[1]!.length : 0;
  return { num: parseFloat(numStr), decimals, suffix };
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const { num, decimals, suffix } = parseStat(value);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const dur = 2000;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - (1 - t) ** 3;
      setDisplay(num * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, num]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString();

  return (
    <div ref={ref} className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-xl">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-600/15 blur-2xl" />
      <p
        className="text-4xl md:text-5xl font-bold text-white tracking-tight tabular-nums"
        style={{ fontFamily: "var(--font-tint-display)" }}
      >
        {formatted}
        <span className="text-violet-400">{suffix}</span>
      </p>
      <p className="mt-2 text-sm text-zinc-500 uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-tint-body)" }}>
        {label}
      </p>
    </div>
  );
}

export default function TintTrustBridge({
  stats,
}: {
  stats: { label: string; value: string }[];
}) {
  const FALLBACK = [
    { value: "2.4K+", label: "Panels treated" },
    { value: "4.9", label: "Star average" },
    { value: "12+", label: "Years dialed in" },
    { value: "100%", label: "Satisfaction focus" },
  ];
  const padded = stats.slice(0, 4);
  for (let i = padded.length; i < 4; i++) padded.push(FALLBACK[i]!);

  return (
    <section id="tint-trust" className="relative py-24 md:py-32 px-5 md:px-10 bg-[#030306] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(59,130,246,0.12),transparent)]" />
      <div className="mx-auto max-w-7xl relative z-10">
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-14 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.75 }}
        >
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-blue-400/90 mb-4">
              Trust architecture
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-tint-display)" }}
            >
              Numbers that track like a dyno pull — steady, real, repeatable.
            </h2>
          </div>
          <p className="text-zinc-500 text-sm max-w-sm" style={{ fontFamily: "var(--font-tint-body)" }}>
            We obsess over dust, slip solution ratios, and shrink tactics so your glass reads expensive from every angle.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
          {padded.map((s, i) => (
            <AnimatedStat key={`${s.label}-${i}`} value={s.value} label={s.label} />
          ))}
        </div>

        <motion.div
          className="flex flex-wrap justify-center gap-3 md:gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {TINT_TRUST_WORDMARKS.map((brand, i) => (
            <motion.span
              key={brand}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.04 * i }}
              className="px-5 py-2.5 rounded-full border border-white/[0.1] bg-gradient-to-b from-white/[0.07] to-transparent text-xs font-semibold tracking-[0.25em] text-zinc-400 uppercase"
            >
              {brand}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
