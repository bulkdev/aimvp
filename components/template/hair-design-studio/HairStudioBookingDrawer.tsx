"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RemoveScroll } from "react-remove-scroll";
import { X, ChevronRight, ChevronLeft, Calendar, MapPin, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ServiceItem } from "@/types";
import { useHairStudio } from "./HairStudioContext";
import { TurnstileField } from "@/components/security/TurnstileField";
import { computeDepositCents, parseStartingPriceUsd } from "@/lib/studio-pricing";
import { isStudioOpenOnDay, parseDateIsoLocal } from "@/lib/studio-scheduling";

const hasTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

type Props = {
  projectId: string;
  services: ServiceItem[];
  bookingFullyBooked?: boolean;
  waitlistNote?: string;
};

type AvailSlot = { timeLabel: string; available: boolean };

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HairStudioBookingDrawer({ projectId, services, bookingFullyBooked, waitlistNote }: Props) {
  const pathname = usePathname();
  const { bookingOpen, closeBooking, locationId, studio, presetService, presetStylistId, setPresetService, setPresetStylistId } =
    useHairStudio();

  const [waitStep, setWaitStep] = useState(false);
  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceItem | null>(null);
  const [stylistId, setStylistId] = useState<string>("");
  const [dateIso, setDateIso] = useState(todayIso());
  const [timeLabel, setTimeLabel] = useState<string>("");
  const [slots, setSlots] = useState<AvailSlot[] | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(hasTurnstile ? null : "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ mode: string; url?: string | null } | null>(null);

  const returnPath = pathname?.startsWith("/") ? pathname : `/${pathname || ""}`;

  useEffect(() => {
    if (bookingOpen) {
      document.body.dataset.hairBookOpen = "1";
      return () => {
        delete document.body.dataset.hairBookOpen;
      };
    }
    delete document.body.dataset.hairBookOpen;
  }, [bookingOpen]);

  useEffect(() => {
    if (!bookingOpen) return;
    setWaitStep(Boolean(bookingFullyBooked));
    setStep(0);
    setError(null);
    setDone(null);
    setTimeLabel("");
    setTurnstileToken(hasTurnstile ? null : "");
    if (presetService) {
      setService(presetService);
      setStep(1);
    } else {
      setService(null);
    }
    if (presetStylistId) {
      setStylistId(presetStylistId);
    } else {
      setStylistId("");
    }
  }, [bookingOpen, bookingFullyBooked, presetService, presetStylistId]);

  const fetchSlots = useCallback(async () => {
    const dt = parseDateIsoLocal(dateIso);
    if (!dt || !isStudioOpenOnDay(dt.getDay())) {
      setSlots([]);
      setSlotsLoading(false);
      return;
    }
    setSlots(null);
    setSlotsLoading(true);
    try {
      const q = new URLSearchParams({
        projectId,
        locationId,
        dateIso,
      });
      if (stylistId.trim()) q.set("stylistId", stylistId.trim());
      const res = await fetch(`/api/studio-availability?${q}`);
      const data = (await res.json()) as { slots?: AvailSlot[]; closed?: boolean };
      if (!res.ok) {
        setSlots(null);
        return;
      }
      setSlots(data.slots ?? []);
    } catch {
      setSlots(null);
    } finally {
      setSlotsLoading(false);
    }
  }, [projectId, locationId, dateIso, stylistId]);

  useEffect(() => {
    if (!bookingOpen || waitStep) return;
    if (step < 2) return;
    void fetchSlots();
  }, [bookingOpen, waitStep, step, fetchSlots]);

  const depositCents = useMemo(() => {
    const usd = service ? parseStartingPriceUsd(service.startingPrice) : null;
    return computeDepositCents({
      serviceUsd: usd,
      depositPercent: studio.depositPercent,
      depositFlatUsd: studio.depositFlatUsd,
    });
  }, [service, studio.depositFlatUsd, studio.depositPercent]);

  const serviceUsd = useMemo(() => (service ? parseStartingPriceUsd(service.startingPrice) : null), [service]);

  const canNext0 = Boolean(service);
  const canNext1 = true;
  const canNext2 = Boolean(
    dateIso &&
      timeLabel &&
      !slotsLoading &&
      slots &&
      slots.some((s) => s.timeLabel === timeLabel && s.available)
  );
  const canSubmit =
    firstName.trim() &&
    lastName.trim() &&
    email.includes("@") &&
    (!hasTurnstile || turnstileToken) &&
    canNext2;

  const submitBooking = async () => {
    if (!service || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/studio-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          locationId,
          serviceTitle: service.title,
          stylistId: stylistId.trim() || undefined,
          dateIso,
          timeLabel,
          notes: notes.trim(),
          turnstileToken: turnstileToken || undefined,
          returnPath,
          website: "",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; mode?: string; checkoutUrl?: string | null };
      if (!res.ok) {
        setError(data.error || "Could not complete booking.");
        setSubmitting(false);
        return;
      }
      setDone({ mode: data.mode || "email", url: data.checkoutUrl });
      setPresetService(null);
      setPresetStylistId(null);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitWaitlist = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.includes("@")) return;
    if (hasTurnstile && !turnstileToken) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/studio-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          preferredDetails: notes.trim(),
          turnstileToken: turnstileToken || undefined,
          website: "",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error || "Could not join waitlist.");
        setSubmitting(false);
        return;
      }
      setDone({ mode: "waitlist" });
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {bookingOpen ? (
      <RemoveScroll>
        <motion.div
          key="hair-booking-scrim"
          className="fixed inset-0 z-[100] flex justify-end bg-black/65 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeBooking}
        >
          <motion.aside
            key="hair-booking-panel"
            className="relative flex h-full w-full max-w-[min(100vw,440px)] flex-col border-l border-white/10 bg-[#0a0a0c] text-zinc-100 shadow-[-24px_0_80px_rgba(0,0,0,0.55)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d4e157]/90">Reserve</p>
                <h2 className="font-[family-name:var(--hs-display)] text-lg font-semibold tracking-tight">
                  {waitStep ? "Join the waitlist" : "Book appointment"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeBooking}
                className="rounded-full border border-white/15 p-2 text-zinc-400 transition hover:border-white/25 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              {done ? (
                <div className="space-y-4 pt-4">
                  <div className="rounded-2xl border border-[#d4e157]/30 bg-[#d4e157]/10 p-5">
                    <p className="font-[family-name:var(--hs-display)] text-xl font-semibold text-white">
                      {done.mode === "waitlist" ? "You are on the list." : "Request received."}
                    </p>
                    <p className="mt-2 text-sm text-zinc-400">
                      {done.mode === "waitlist"
                        ? "We will email you when a chair opens."
                        : "Check your inbox and phone for confirmation. Complete your deposit to lock the time."}
                    </p>
                  </div>
                  {done.url ? (
                    <a
                      href={done.url}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d4e157] py-4 text-sm font-semibold text-black transition hover:brightness-110"
                    >
                      Pay deposit securely
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  ) : null}
                  <button
                    type="button"
                    onClick={closeBooking}
                    className="w-full rounded-2xl border border-white/15 py-3 text-sm text-zinc-300 hover:bg-white/5"
                  >
                    Close
                  </button>
                </div>
              ) : waitStep ? (
                <div className="space-y-5">
                  {waitlistNote ? <p className="text-sm text-zinc-400">{waitlistNote}</p> : null}
                  <Field label="First name" value={firstName} onChange={setFirstName} />
                  <Field label="Last name" value={lastName} onChange={setLastName} />
                  <Field label="Email" type="email" value={email} onChange={setEmail} />
                  <Field label="Phone" value={phone} onChange={setPhone} />
                  <div>
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Preferred styles / timing</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none ring-[#d4e157]/40 focus:ring-2"
                    />
                  </div>
                  <TurnstileField onToken={setTurnstileToken} theme="dark" />
                  {error ? <p className="text-sm text-red-400">{error}</p> : null}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={submitWaitlist}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d4e157] py-4 text-sm font-semibold text-black disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Join waitlist
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex gap-1 rounded-full bg-white/5 p-1">
                    {["Service", "Artist", "Time", "Confirm"].map((lab, i) => (
                      <div
                        key={lab}
                        className={`flex-1 rounded-full px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wide ${
                          i === step ? "bg-[#d4e157] text-black" : i < step ? "text-[#d4e157]" : "text-zinc-500"
                        }`}
                      >
                        {lab}
                      </div>
                    ))}
                  </div>

                  {step === 0 && (
                    <div className="space-y-3">
                      <p className="text-sm text-zinc-400">Choose your service. Filters sync with the main grid.</p>
                      <div className="space-y-2">
                        {services.map((s) => (
                          <button
                            key={s.title}
                            type="button"
                            onClick={() => setService(s)}
                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                              service?.title === s.title
                                ? "border-[#d4e157]/50 bg-[#d4e157]/10"
                                : "border-white/10 hover:border-white/20"
                            }`}
                          >
                            <span className="font-medium">{s.title}</span>
                            <span className="text-xs text-zinc-500">{s.startingPrice || "—"}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="space-y-3">
                      <p className="text-sm text-zinc-400">Pick a specialist or leave open for fastest match.</p>
                      <button
                        type="button"
                        onClick={() => setStylistId("")}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm ${
                          !stylistId ? "border-[#d4e157]/50 bg-[#d4e157]/10" : "border-white/10"
                        }`}
                      >
                        First available · recommended
                      </button>
                      {studio.stylists.map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStylistId(st.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left ${
                            stylistId === st.id ? "border-[#d4e157]/50 bg-[#d4e157]/10" : "border-white/10"
                          }`}
                        >
                          {st.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={st.photoUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                          ) : (
                            <div className="h-11 w-11 rounded-full bg-white/10" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{st.name}</p>
                            <p className="text-xs text-zinc-500">{st.specialty}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
                          <Calendar className="h-3.5 w-3.5" /> Date
                        </label>
                        <input
                          type="date"
                          value={dateIso}
                          min={todayIso()}
                          onChange={(e) => {
                            setDateIso(e.target.value);
                            setTimeLabel("");
                          }}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4e157]/40"
                        />
                      </div>
                      {!isStudioOpenOnDay(parseDateIsoLocal(dateIso)?.getDay() ?? 0) ? (
                        <p className="text-sm text-amber-200/90">Closed that day — try Tue–Sat.</p>
                      ) : null}
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Time</p>
                        {slotsLoading ? (
                          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading live availability…
                          </div>
                        ) : slots ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {slots.map((s) => (
                              <button
                                key={s.timeLabel}
                                type="button"
                                disabled={!s.available}
                                onClick={() => setTimeLabel(s.timeLabel)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                  timeLabel === s.timeLabel
                                    ? "border-[#d4e157] bg-[#d4e157] text-black"
                                    : s.available
                                      ? "border-white/15 hover:border-white/30"
                                      : "cursor-not-allowed border-white/5 text-zinc-600 line-through"
                                }`}
                              >
                                {s.timeLabel}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-sm text-zinc-500">Select a date to load open times.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {step === 3 && service && (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                        <Row icon={<MapPin className="h-4 w-4" />} label="Chair" value={studio.locations.find((l) => l.id === locationId)?.shortLabel || "—"} />
                        <Row icon={<Sparkles className="h-4 w-4" />} label="Service" value={service.title} />
                        <Row
                          icon={<Calendar className="h-4 w-4" />}
                          label="When"
                          value={`${dateIso} · ${timeLabel}`}
                        />
                        <p className="mt-3 text-xs text-zinc-500">
                          Duration <span className="text-zinc-300">{service.duration || "—"}</span> · Est.{" "}
                          <span className="text-zinc-300">{service.startingPrice || "—"}</span>
                        </p>
                      </div>

                      <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                          <div className="text-xs leading-relaxed text-zinc-400">
                            <p className="font-semibold text-emerald-200/90">Deposit to confirm</p>
                            <p className="mt-1">
                              Deposit today:{" "}
                              <strong className="text-white">${(depositCents / 100).toFixed(2)}</strong>
                              {serviceUsd != null ? (
                                <>
                                  {" "}
                                  (service estimate <strong className="text-white">${serviceUsd.toFixed(0)}</strong>)
                                </>
                              ) : null}
                            </p>
                            <p className="mt-2 border-t border-white/10 pt-2 text-[11px] text-zinc-500">
                              {studio.cancellationSummary}
                            </p>
                            <p className="mt-1 text-[11px] text-zinc-500">
                              Late cancel fee: ${studio.lateCancelFeeUsd ?? 35} · No-show: $
                              {studio.noShowFeeUsd ?? 75}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Field label="First name" value={firstName} onChange={setFirstName} />
                      <Field label="Last name" value={lastName} onChange={setLastName} />
                      <Field label="Email" type="email" value={email} onChange={setEmail} />
                      <Field label="Phone (SMS updates)" value={phone} onChange={setPhone} />
                      <div>
                        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Notes</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={3}
                          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4e157]/40"
                        />
                      </div>
                      {hasTurnstile ? <TurnstileField onToken={setTurnstileToken} theme="dark" /> : null}
                      {error ? <p className="text-sm text-red-400">{error}</p> : null}
                    </div>
                  )}
                </>
              )}
            </div>

            {!done && !waitStep ? (
              <footer className="flex gap-2 border-t border-white/10 px-5 py-4">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    className="flex items-center gap-1 rounded-2xl border border-white/15 px-4 py-3 text-sm text-zinc-300"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                ) : (
                  <span />
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    disabled={
                      (step === 0 && !canNext0) ||
                      (step === 1 && !canNext1) ||
                      (step === 2 && (slotsLoading || !canNext2))
                    }
                    onClick={() => {
                      if (step === 2 && (slotsLoading || !canNext2)) return;
                      setStep((s) => Math.min(3, s + 1));
                    }}
                    className="ml-auto flex items-center gap-1 rounded-2xl bg-[#d4e157] px-5 py-3 text-sm font-semibold text-black disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canSubmit || submitting}
                    onClick={submitBooking}
                    className="ml-auto flex items-center gap-2 rounded-2xl bg-[#d4e157] px-5 py-3 text-sm font-semibold text-black disabled:opacity-40"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Confirm & request deposit link
                  </button>
                )}
              </footer>
            ) : null}
          </motion.aside>
        </motion.div>
      </RemoveScroll>
      ) : null}
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4e157]/40"
      />
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-2 py-1.5 text-zinc-300">
      <span className="text-zinc-500">{icon}</span>
      <div>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
        <p className="text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
