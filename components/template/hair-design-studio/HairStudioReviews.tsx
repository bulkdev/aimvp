"use client";

import { motion } from "framer-motion";
import type { GeneratedSiteContent } from "@/types";
import { Star } from "lucide-react";

export default function HairStudioReviews({ content }: { content: GeneratedSiteContent }) {
  const reviews = (content.assets?.manualReviews || []).filter((r) => r.reviewerName?.trim() && r.text?.trim());

  if (reviews.length === 0) return null;

  return (
    <section id="hds-proof" className="relative py-24 md:py-32 bg-[#080809]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#d4e157]/90">Proof</p>
        <h2
          className="mt-3 text-3xl md:text-5xl font-semibold text-[#f4f1ea] max-w-xl"
          style={{ fontFamily: "var(--font-hds-display)" }}
        >
          Clients who do not do filler feedback.
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.blockquote
              key={r.reviewerName + i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="rounded-3xl border border-white/[0.07] bg-[#0c0c0e] p-8 flex flex-col"
            >
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-4 h-4 ${j < Math.round(r.rating || 5) ? "fill-current" : "text-zinc-700"}`}
                    aria-hidden
                  />
                ))}
              </div>
              <p className="mt-5 text-zinc-300 leading-relaxed">&ldquo;{r.text.trim()}&rdquo;</p>
              <footer className="mt-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#d4e157]/20 text-[#d4e157] flex items-center justify-center text-sm font-semibold">
                  {(r.avatarLetter || r.reviewerName[0] || "?").toUpperCase()}
                </span>
                <div>
                  <cite className="not-italic text-[#f4f1ea] font-medium">{r.reviewerName.trim()}</cite>
                  {r.reviewAge ? <p className="text-xs text-zinc-600 mt-0.5">{r.reviewAge}</p> : null}
                </div>
              </footer>
            </motion.blockquote>
          ))}
        </div>

        <p className="mt-12 text-xs text-zinc-600 max-w-2xl">
          Short-form reels can be embedded in the gallery block when you add social clip URLs in your site configuration.
        </p>
      </div>
    </section>
  );
}
