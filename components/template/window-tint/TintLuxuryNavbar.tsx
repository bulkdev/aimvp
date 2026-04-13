"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#tint-luxury-hero", label: "Experience" },
  { href: "#tint-simulator", label: "Simulator" },
  { href: "#tint-spectral", label: "Films" },
  { href: "#tint-transform", label: "Results" },
  { href: "#tint-trust", label: "Proof" },
  { href: "#tint-faq", label: "FAQ" },
];

export default function TintLuxuryNavbar({
  brandName,
  onBook,
}: {
  brandName: string;
  onBook: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-[80] px-4 md:px-8 py-3 md:py-4 transition-[background,backdrop-filter,border-color] duration-500",
        scrolled
          ? "bg-zinc-950/55 backdrop-blur-2xl border-b border-white/[0.08]"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        <a
          href="#tint-luxury-hero"
          className="font-semibold tracking-tight text-white text-lg md:text-xl shrink-0"
          style={{ fontFamily: "var(--font-tint-display)" }}
        >
          {brandName}
        </a>
        <div className="hidden lg:flex items-center gap-1 rounded-full border border-white/[0.1] bg-black/20 px-2 py-1 backdrop-blur-xl">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
            >
              {l.label}
            </a>
          ))}
        </div>
        <button
          type="button"
          onClick={onBook}
          className="group relative overflow-hidden rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-zinc-950 bg-gradient-to-r from-zinc-100 via-white to-zinc-200 shadow-[0_0_40px_rgba(139,92,246,0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="relative z-10">Book</span>
          <span
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.65) 50%, transparent 80%)",
              transform: "translateX(-30%)",
            }}
          />
        </button>
      </nav>
    </motion.header>
  );
}
