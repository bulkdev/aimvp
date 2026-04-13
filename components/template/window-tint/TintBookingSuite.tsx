"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RemoveScroll } from "react-remove-scroll";

type Vehicle = "sedan" | "suv" | "truck" | "sports";
type Film = "none" | "v35" | "v20" | "v5";

const VEHICLE_OPTS: { id: Vehicle; label: string; base: number; sub: string }[] = [
  { id: "sedan", label: "Sedan / coupe", base: 199, sub: "4-door & 2-door cars" },
  { id: "sports", label: "Sports / low profile", base: 249, sub: "Complex curves, tight seals" },
  { id: "suv", label: "SUV / crossover", base: 279, sub: "Expanded glass real estate" },
  { id: "truck", label: "Truck / crew cab", base: 329, sub: "Rear sliders + deep tints" },
];

const FILM_OPTS: { id: Film; label: string; add: number }[] = [
  { id: "none", label: "Consultation only", add: 0 },
  { id: "v35", label: "35% ceramic", add: 89 },
  { id: "v20", label: "20% ceramic", add: 179 },
  { id: "v5", label: "5% privacy", add: 269 },
];

export default function TintBookingSuite({
  open,
  onClose,
  brandName,
  phone,
  email,
}: {
  open: boolean;
  onClose: () => void;
  brandName: string;
  phone?: string;
  email?: string;
}) {
  const [step, setStep] = useState(0);
  const [vehicle, setVehicle] = useState<Vehicle>("sedan");
  const [film, setFilm] = useState<Film>("v35");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("10:00");

  const base = VEHICLE_OPTS.find((v) => v.id === vehicle)?.base ?? 199;
  const add = FILM_OPTS.find((f) => f.id === film)?.add ?? 0;
  const total = base + add;

  const summary = useMemo(
    () => ({
      vehicle: VEHICLE_OPTS.find((v) => v.id === vehicle)?.label,
      film: FILM_OPTS.find((f) => f.id === film)?.label,
      when: dateStr && timeStr ? `${dateStr} · ${timeStr}` : "Pick a slot",
    }),
    [vehicle, film, dateStr, timeStr]
  );

  const resetAndClose = () => {
    setStep(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <RemoveScroll>
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/75 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Book installation"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2rem] border border-white/10 bg-zinc-950/95 shadow-[0_0_80px_-20px_rgba(139,92,246,0.5)] overflow-hidden max-h-[min(92vh,720px)] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-white/[0.06] flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-violet-400/90">Concierge booking</p>
                  <h2 className="text-xl font-bold text-white mt-1" style={{ fontFamily: "var(--font-tint-display)" }}>
                    {brandName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="rounded-full border border-white/15 w-9 h-9 text-zinc-400 hover:text-white hover:bg-white/5 text-lg leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="px-6 py-4 flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                      i <= step ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              <div className="px-6 pb-6 overflow-y-auto flex-1">
                {step === 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-400 mb-4">Select your vehicle class — pricing updates live.</p>
                    {VEHICLE_OPTS.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVehicle(v.id)}
                        className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${
                          vehicle === v.id
                            ? "border-violet-500/50 bg-violet-500/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20"
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="text-white font-medium">{v.label}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{v.sub}</p>
                          </div>
                          <span className="text-white font-mono text-sm shrink-0">${v.base}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-3">
                    <p className="text-sm text-zinc-400 mb-4">Film depth — we&apos;ll validate legality for your state on site.</p>
                    {FILM_OPTS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilm(f.id)}
                        className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${
                          film === f.id
                            ? "border-fuchsia-500/50 bg-fuchsia-500/10"
                            : "border-white/10 bg-white/[0.02] hover:border-white/20"
                        }`}
                      >
                        <div className="flex justify-between gap-2">
                          <p className="text-white font-medium">{f.label}</p>
                          <span className="text-fuchsia-200 font-mono text-sm">{f.add ? `+$${f.add}` : "—"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <p className="text-sm text-zinc-400">Lock a preferred window — we&apos;ll confirm within one business hour.</p>
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">Date</span>
                      <input
                        type="date"
                        value={dateStr}
                        onChange={(e) => setDateStr(e.target.value)}
                        className="mt-2 w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">Time</span>
                      <select
                        value={timeStr}
                        onChange={(e) => setTimeStr(e.target.value)}
                        className="mt-2 w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white"
                      >
                        {["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((t) => (
                          <option key={t} value={t} className="bg-zinc-900">
                            {t}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3 text-sm">
                      <div className="flex justify-between text-zinc-400">
                        <span>Vehicle</span>
                        <span className="text-white text-right">{summary.vehicle}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Film</span>
                        <span className="text-white text-right">{summary.film}</span>
                      </div>
                      <div className="flex justify-between text-zinc-400">
                        <span>Requested slot</span>
                        <span className="text-white text-right">{summary.when}</span>
                      </div>
                      <div className="h-px bg-white/10 my-2" />
                      <div className="flex justify-between items-baseline">
                        <span className="text-zinc-400">Estimate</span>
                        <span className="text-3xl font-bold text-white font-mono">${total}</span>
                      </div>
                      <p className="text-xs text-zinc-500">Final quote after glass inspection. No surprise add-ons.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {phone ? (
                        <a
                          href={`tel:${phone.replace(/\D/g, "")}`}
                          className="flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3.5 text-sm font-semibold text-white"
                        >
                          Call to confirm — {phone}
                        </a>
                      ) : null}
                      {email ? (
                        <a
                          href={`mailto:${email}?subject=${encodeURIComponent(`${brandName} — booking request`)}&body=${encodeURIComponent(
                            `Vehicle: ${summary.vehicle}\nFilm: ${summary.film}\nSlot: ${summary.when}\nEstimate: $${total}\n`
                          )}`}
                          className="flex items-center justify-center rounded-xl border border-white/15 py-3.5 text-sm font-medium text-zinc-200 hover:bg-white/5"
                        >
                          Email this booking
                        </a>
                      ) : null}
                      {!phone && !email ? (
                        <p className="text-center text-sm text-zinc-500">Add a phone or email in your site settings to enable one-tap confirm.</p>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-white/[0.06] flex gap-3">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5"
                  >
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    disabled={step === 2 && (!dateStr || !timeStr)}
                    onClick={() => setStep((s) => Math.min(3, s + 1))}
                    className="flex-[2] rounded-xl bg-white text-zinc-950 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100"
                  >
                    Continue · ${total}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="flex-[2] rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white"
                  >
                    Done
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </RemoveScroll>
      ) : null}
    </AnimatePresence>
  );
}

export function TintBookFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="fixed bottom-6 right-5 z-[90] rounded-full px-7 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_12px_50px_-10px_rgba(139,92,246,0.65)] bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 border border-white/10"
      style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      Book now
    </motion.button>
  );
}
