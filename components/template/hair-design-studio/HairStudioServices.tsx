"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { GeneratedSiteContent } from "@/types";
import { cn } from "@/lib/utils";
import { useHairStudio } from "./HairStudioContext";

function hashPick<T>(arr: T[], seed: string): T[] {
  if (arr.length <= 3) return arr;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const idx = [h % arr.length, (h >> 3) % arr.length, (h >> 7) % arr.length];
  const out: T[] = [];
  for (const i of idx) {
    if (!out.includes(arr[i]!)) out.push(arr[i]!);
  }
  return out.slice(0, 3);
}

export default function HairStudioServices({ content }: { content: GeneratedSiteContent }) {
  const { openBooking, setPresetService, studio, locationId } = useHairStudio();
  const categories = useMemo(() => {
    const c = new Set<string>();
    for (const s of content.services) {
      const cat = s.category?.trim() || s.title;
      c.add(cat);
    }
    return ["All", ...[...c]];
  }, [content.services]);

  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? content.services
      : content.services.filter((s) => (s.category?.trim() || s.title) === filter);

  const popular = useMemo(
    () => hashPick(content.services, content.brandName + locationId),
    [content.services, content.brandName, locationId]
  );

  const suggestFor = (title: string) => {
    const others = content.services.filter((s) => s.title !== title);
    return hashPick(others, title).slice(0, 2);
  };

  return (
    <section id="hds-services" className="relative py-24 md:py-32 bg-[#080809]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="mx-auto max-w-[1400px] px-4 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#d4e157]/90">Service menu</p>
        <h2
          className="mt-3 text-3xl md:text-5xl font-semibold text-[#f4f1ea] max-w-2xl"
          style={{ fontFamily: "var(--font-hds-display)" }}
        >
          Choose your lane — filters keep the wall tight.
        </h2>
        <p className="mt-4 text-zinc-500 max-w-xl">
          Every card shows honest duration and a floor price. Lock the chair with a deposit at checkout.
        </p>

        <div className="mt-12 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Trending now</p>
              <p className="text-lg text-[#f4f1ea] mt-2 font-medium">Popular styles this month</p>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 md:pb-0">
              {popular.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => {
                    setPresetService(s);
                    openBooking();
                  }}
                  className="shrink-0 rounded-2xl border border-[#d4e157]/25 bg-[#d4e157]/5 px-4 py-3 text-left hover:border-[#d4e157]/50 transition-colors"
                >
                  <p className="text-xs text-[#d4e157] uppercase tracking-widest">Hot</p>
                  <p className="text-sm text-[#f4f1ea] mt-1 whitespace-nowrap">{s.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className={cn(
                "rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.18em] border transition-all",
                filter === c
                  ? "border-[#d4e157]/60 bg-[#d4e157]/15 text-[#f4f1ea]"
                  : "border-white/10 text-zinc-500 hover:text-zinc-200 hover:border-white/20"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-3xl border border-white/[0.08] bg-[#0c0c0e] overflow-hidden hover:border-[#d4e157]/25 transition-colors"
            >
              <div className="aspect-[4/3] bg-zinc-900 relative overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90 group-hover:scale-105 transition-transform duration-700"
                  style={{
                    backgroundImage: `url(${
                      studio.beforeAfterPairs?.length
                        ? studio.beforeAfterPairs[i % studio.beforeAfterPairs.length]!.afterUrl
                        : "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
                    })`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.25em] px-3 py-1 rounded-full bg-black/55 text-[#d4e157] border border-white/10">
                  {s.category || s.title}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#f4f1ea]" style={{ fontFamily: "var(--font-hds-display)" }}>
                  {s.title}
                </h3>
                <p className="mt-3 text-sm text-zinc-500 leading-relaxed line-clamp-3">{s.description}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-xs text-zinc-400">
                  <span className="rounded-lg border border-white/10 px-2 py-1">{s.startingPrice || "Consult"}</span>
                  <span className="rounded-lg border border-white/10 px-2 py-1">{s.duration || "Duration on consult"}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestFor(s.title).map((o) => (
                    <span
                      key={o.title}
                      className="text-[10px] uppercase tracking-wider text-zinc-600 border border-white/5 rounded-full px-2 py-0.5"
                    >
                      + {o.title}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPresetService(s);
                    openBooking();
                  }}
                  className="mt-6 w-full rounded-2xl py-3 text-xs font-semibold uppercase tracking-[0.2em] bg-[#f4f1ea] text-zinc-950 hover:bg-white transition-colors"
                >
                  Book now
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
