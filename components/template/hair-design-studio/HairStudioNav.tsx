"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useHairStudio } from "./HairStudioContext";

const LINKS = [
  { href: "#hds-hero", label: "Home" },
  { href: "#hds-services", label: "Services" },
  { href: "#hds-artists", label: "Artists" },
  { href: "#hds-gallery", label: "Results" },
  { href: "#hds-locations", label: "Studios" },
  { href: "#hds-proof", label: "Reviews" },
];

export default function HairStudioNav({ brandName }: { brandName: string }) {
  const { openBooking, studio, locationId, setLocationId } = useHairStudio();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-[90] px-4 md:px-10 py-3 md:py-4 transition-all duration-500",
        scrolled
          ? "bg-[#060607]/72 backdrop-blur-2xl border-b border-white/[0.07]"
          : "bg-gradient-to-b from-black/80 via-black/20 to-transparent border-b border-transparent"
      )}
    >
      <nav className="mx-auto max-w-[1400px] flex items-center justify-between gap-4">
        <a
          href="#hds-hero"
          className="text-lg md:text-xl font-semibold tracking-tight text-[#f4f1ea] shrink-0"
          style={{ fontFamily: "var(--font-hds-display)" }}
        >
          {brandName}
        </a>

        <div className="hidden xl:flex items-center gap-1 rounded-full border border-white/[0.08] bg-black/25 px-1.5 py-1">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500 hover:text-white rounded-full hover:bg-white/[0.06] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex rounded-full border border-white/10 bg-black/40 p-0.5">
            {studio.locations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setLocationId(loc.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.18em] transition-all",
                  locationId === loc.id
                    ? "bg-[#f4f1ea] text-zinc-950 shadow-[0_0_24px_rgba(212,225,87,0.25)]"
                    : "text-zinc-500 hover:text-zinc-200"
                )}
              >
                {loc.shortLabel}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={openBooking}
            className="relative overflow-hidden rounded-full px-4 md:px-6 py-2.5 text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-950 bg-[#f4f1ea] hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_40px_rgba(212,225,87,0.35)]"
          >
            Book
          </button>
        </div>
      </nav>
    </motion.header>
  );
}
