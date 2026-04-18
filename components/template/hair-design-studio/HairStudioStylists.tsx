"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RemoveScroll } from "react-remove-scroll";
import type { GeneratedSiteContent, HairDesignStudioStylist } from "@/types";
import { Star } from "lucide-react";
import { useHairStudio } from "./HairStudioContext";
import { studioSlotsForDay } from "./hairStudioSlots";

export default function HairStudioStylists({
  content,
  projectId,
}: {
  content: GeneratedSiteContent;
  projectId: string;
}) {
  const { studio, openBooking, setPresetStylistId, setPresetService } = useHairStudio();
  const [profile, setProfile] = useState<HairDesignStudioStylist | null>(null);

  const weekFake = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <section id="hds-artists" className="relative py-24 md:py-32 bg-[#050506]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#d4e157]/90">Roster</p>
        <h2
          className="mt-3 text-3xl md:text-5xl font-semibold text-[#f4f1ea] max-w-xl"
          style={{ fontFamily: "var(--font-hds-display)" }}
        >
          Artists, not assembly line.
        </h2>
        <p className="mt-4 text-zinc-500 max-w-xl">
          Tap a profile for portfolio and the services they sign. Ratings are aggregated from in-studio feedback.
        </p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {studio.stylists.map((s, i) => (
            <motion.button
              key={s.id}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setProfile(s)}
              className="text-left rounded-3xl border border-white/[0.08] bg-[#0b0b0d] overflow-hidden hover:border-[#d4e157]/30 transition-all group"
            >
              <div className="aspect-[3/4] relative">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-[1.03] transition-transform duration-500"
                  style={{
                    backgroundImage: `url(${s.photoUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&w=900"})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#d4e157]">{s.specialty}</p>
                  <p className="text-xl font-semibold text-white mt-1" style={{ fontFamily: "var(--font-hds-display)" }}>
                    {s.name}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-amber-400 text-sm">
                    <Star className="w-4 h-4 fill-current" aria-hidden />
                    <span>{s.rating.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Profile</span>
                <span className="text-xs text-[#f4f1ea]">View & book →</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {profile ? (
          <RemoveScroll>
            <motion.div
              className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-8 bg-black/80 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfile(null)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`${profile.name} profile`}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                className="w-full sm:max-w-3xl rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 bg-[#09090b] max-h-[min(92vh,880px)] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative h-48 sm:h-56 shrink-0">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${profile.photoUrl || ""})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent" />
                  <button
                    type="button"
                    onClick={() => setProfile(null)}
                    className="absolute top-4 right-4 rounded-full border border-white/20 w-10 h-10 text-white hover:bg-white/10"
                    aria-label="Close profile"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-4 left-6 right-6">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4e157]">{profile.specialty}</p>
                    <h3 className="text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-hds-display)" }}>
                      {profile.name}
                    </h3>
                  </div>
                </div>
                <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8">
                  <p className="text-zinc-400 leading-relaxed">{profile.bio}</p>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Services they sign</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.serviceTitles.map((t) => (
                        <span key={t} className="rounded-full border border-white/10 px-3 py-1 text-xs text-[#f4f1ea]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Portfolio</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(profile.portfolioUrls || []).slice(0, 6).map((u, idx) => (
                        <div
                          key={idx}
                          className="aspect-square rounded-xl bg-cover bg-center border border-white/10"
                          style={{ backgroundImage: `url(${u})` }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3">Sample availability grid</p>
                    <p className="text-xs text-zinc-600 mb-4">
                      Live grid syncs after deposit. Shown: illustrative open blocks for the next studio week.
                    </p>
                    <div className="grid grid-cols-6 gap-2">
                      {weekFake.map((d, idx) => {
                        const slots = studioSlotsForDay(
                          projectId,
                          `2026-06-${String(10 + idx).padStart(2, "0")}`,
                          studio.locations[0]!.id
                        );
                        const open = slots.length > 8;
                        return (
                          <div key={d} className="rounded-xl border border-white/10 p-3 text-center">
                            <p className="text-[10px] text-zinc-500">{d}</p>
                            <p className={`text-xs mt-2 ${open ? "text-emerald-400" : "text-amber-400"}`}>
                              {open ? "Open" : "Limited"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPresetStylistId(profile.id);
                      const firstSvc = content.services.find((x) => profile.serviceTitles.includes(x.title));
                      if (firstSvc) setPresetService(firstSvc);
                      setProfile(null);
                      openBooking();
                    }}
                    className="w-full rounded-2xl py-4 text-xs font-semibold uppercase tracking-[0.2em] bg-[#d4e157] text-zinc-950"
                  >
                    Book with {profile.name.split(" ")[0]}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </RemoveScroll>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
