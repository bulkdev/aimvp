"use client";

import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { useHairStudio } from "./HairStudioContext";

export default function HairStudioLocations() {
  const { studio, locationId, setLocationId } = useHairStudio();

  return (
    <section id="hds-locations" className="relative py-24 md:py-32 bg-[#080809]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10">
        <p className="text-[11px] uppercase tracking-[0.4em] text-[#d4e157]/90">Studios</p>
        <h2
          className="mt-3 text-3xl md:text-5xl font-semibold text-[#f4f1ea] max-w-xl"
          style={{ fontFamily: "var(--font-hds-display)" }}
        >
          Two doors. Same standard.
        </h2>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {studio.locations.map((loc, i) => (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-3xl border overflow-hidden flex flex-col ${
                locationId === loc.id ? "border-[#d4e157]/40 bg-[#d4e157]/[0.04]" : "border-white/[0.08] bg-[#0c0c0e]"
              }`}
            >
              <div className="aspect-[21/9] bg-zinc-900 relative">
                {loc.mapEmbedUrl ? (
                  <iframe title={`Map ${loc.name}`} src={loc.mapEmbedUrl} className="absolute inset-0 w-full h-full border-0 grayscale-[30%]" />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-zinc-600 text-sm px-6 text-center"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 20%, rgba(212,225,87,0.08), transparent 45%), linear-gradient(145deg,#111,#050506)",
                    }}
                  >
                    Map embed URL can be added in site admin. Address below links out to maps.
                  </div>
                )}
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#d4e157]">{loc.shortLabel}</p>
                    <h3 className="text-2xl font-semibold text-[#f4f1ea] mt-2" style={{ fontFamily: "var(--font-hds-display)" }}>
                      {loc.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationId(loc.id)}
                    className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-300 hover:border-[#d4e157]/50"
                  >
                    Set active
                  </button>
                </div>
                <p className="mt-4 flex items-start gap-2 text-zinc-400 text-sm">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#d4e157]" aria-hidden />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white underline-offset-4 hover:underline"
                  >
                    {loc.address}
                  </a>
                </p>
                <ul className="mt-4 space-y-2">
                  {loc.hours.map((h) => (
                    <li key={h} className="flex items-center gap-2 text-sm text-zinc-500">
                      <Clock className="w-4 h-4 text-zinc-600" aria-hidden />
                      {h}
                    </li>
                  ))}
                </ul>
                {loc.phone ? (
                  <a href={`tel:${loc.phone.replace(/\D/g, "")}`} className="mt-6 text-sm text-[#d4e157] hover:underline">
                    {loc.phone}
                  </a>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
