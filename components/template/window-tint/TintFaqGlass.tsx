"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { FaqItem } from "@/types";

export default function TintFaqGlass({ faqs }: { faqs: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const list = faqs.slice(0, 6);

  if (list.length === 0) return null;

  return (
    <section id="tint-faq" className="relative py-24 md:py-32 px-5 md:px-10 bg-[#050508]">
      <div className="mx-auto max-w-3xl">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.45em] text-violet-400/90 mb-4">FAQ</p>
          <h2
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ fontFamily: "var(--font-tint-display)" }}
          >
            Straight answers — no film industry jargon wall.
          </h2>
        </motion.div>
        <div className="space-y-3">
          {list.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-white font-medium pr-4" style={{ fontFamily: "var(--font-tint-display)" }}>
                    {f.question}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    className="text-violet-400 text-xl shrink-0"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p
                        className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/[0.05] pt-3"
                        style={{ fontFamily: "var(--font-tint-body)" }}
                      >
                        {f.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
