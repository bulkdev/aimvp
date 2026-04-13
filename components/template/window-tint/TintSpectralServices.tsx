"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { ServiceItem } from "@/types";

const DEFAULT_PRICE = ["From $289", "From $149", "From $89", "From $429"];

function SpectralCard({
  service,
  priceLabel,
  index,
  onBook,
}: {
  service: ServiceItem;
  priceLabel: string;
  index: number;
  onBook: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 260, damping: 24 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 260, damping: 24 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative perspective-[1200px] group"
    >
      <div
        className="relative h-full min-h-[280px] rounded-[1.75rem] border border-white/[0.08] bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-black overflow-hidden p-8 shadow-[0_40px_100px_-50px_rgba(0,0,0,0.9)] transition-shadow duration-500 group-hover:shadow-[0_50px_120px_-40px_rgba(109,40,217,0.35)]"
        style={{ transform: "translateZ(0)" }}
      >
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-600/20 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.07] via-transparent to-violet-500/10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-violet-400/80 mb-4">0{index + 1}</p>
        <h3
          className="text-2xl font-bold text-white tracking-tight"
          style={{ fontFamily: "var(--font-tint-display)" }}
        >
          {service.title}
        </h3>
        <p
          className="mt-4 text-zinc-400 text-sm leading-relaxed line-clamp-4 group-hover:text-zinc-300 transition-colors"
          style={{ fontFamily: "var(--font-tint-body)" }}
        >
          {service.description}
        </p>

        <div className="absolute bottom-8 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
          <button
            type="button"
            onClick={onBook}
            className="w-full flex items-center justify-between gap-3 pt-4 border-t border-white/10 text-left hover:border-violet-500/30 transition-colors"
          >
            <span className="text-xl font-semibold text-white font-mono tracking-tight">{priceLabel}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-300">Book →</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const PAD_SERVICES: ServiceItem[] = [
  {
    title: "Full vehicle film",
    description: "Computer-cut patterns, contamination-controlled bay, and glass prep that rivals factory finish.",
    icon: "Car",
  },
  {
    title: "Partial coverage",
    description: "Rear privacy packages, matched factory aesthetics, and clean edge work on complex curves.",
    icon: "Layers",
  },
  {
    title: "Windshield strip",
    description: "Legal brow bands that kill dash glare without sacrificing forward vision.",
    icon: "Sun",
  },
  {
    title: "Ceramic IR upgrade",
    description: "Nano-ceramic stacks that reject heat and UV while staying neutral on the glass.",
    icon: "Zap",
  },
];

export default function TintSpectralServices({
  services,
  onBook,
}: {
  services: ServiceItem[];
  onBook: () => void;
}) {
  const merged = services.slice(0, 4);
  for (let i = merged.length; i < 4; i++) merged.push(PAD_SERVICES[i]!);
  const list = merged;

  return (
    <section id="tint-spectral" className="relative py-24 md:py-32 px-5 md:px-10 bg-[#030306]">
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[min(100%,72rem)] h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="max-w-2xl mb-16 md:mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-fuchsia-400/90 mb-4">
            Spectral lineup
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-tint-display)" }}
          >
            Installations engineered like OEM — only darker, cooler, sharper.
          </h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
          {list.map((s, i) => (
            <SpectralCard
              key={`${s.title}-${i}`}
              service={s}
              priceLabel={DEFAULT_PRICE[i] ?? "Quote"}
              index={i}
              onBook={onBook}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
