"use client";

import { motion } from "framer-motion";
import type { GeneratedSiteContent } from "@/types";
import { useHairStudio } from "./HairStudioContext";

export default function HairStudioGallery({ content }: { content: GeneratedSiteContent }) {
  const { studio } = useHairStudio();
  const flat =
    content.assets?.portfolioProjects?.flat().filter(Boolean) ||
    studio.beforeAfterPairs?.flatMap((p) => [p.beforeUrl, p.afterUrl]) ||
    [];

  const tiles = flat.length > 0 ? flat.slice(0, 18) : ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800"];

  return (
    <section id="hds-gallery" className="relative py-24 md:py-28 bg-[#050506] overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10 mb-12">
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#d4e157]/90">Results</p>
        <h2
          className="mt-3 text-3xl md:text-5xl font-semibold text-[#f4f1ea]"
          style={{ fontFamily: "var(--font-hds-display)" }}
        >
          Before / after &amp; feed energy
        </h2>
        <p className="mt-3 text-zinc-500 max-w-lg">
          A living wall of transformations — pull to refresh energy, not stock salon clichés.
        </p>
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-3 px-4 md:px-6 [column-fill:_balance]">
        {tiles.map((src, i) => (
          <motion.figure
            key={`${src}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: (i % 8) * 0.04 }}
            className="mb-3 break-inside-avoid rounded-2xl overflow-hidden border border-white/[0.06] bg-zinc-900"
          >
            <img src={src} alt="" className="w-full object-cover hover:scale-[1.02] transition-transform duration-700" loading="lazy" />
          </motion.figure>
        ))}
      </div>

      {studio.socialVideoEmbeds && studio.socialVideoEmbeds.length > 0 ? (
        <div className="mx-auto max-w-[1400px] px-4 md:px-10 mt-16 grid gap-6 sm:grid-cols-2">
          {studio.socialVideoEmbeds.map((src, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video">
              <iframe src={src} title={`Social clip ${i + 1}`} className="w-full h-full border-0" allow="autoplay; encrypted-media" />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
