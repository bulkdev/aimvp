"use client";

import { ShieldCheck, CreditCard, Bell } from "lucide-react";
import { useHairStudio } from "./HairStudioContext";

export default function HairStudioPolicies() {
  const { studio } = useHairStudio();

  return (
    <section id="hds-policies" className="relative py-20 bg-[#050506] border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1400px] px-4 md:px-10">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8">
            <CreditCard className="w-8 h-8 text-[#d4e157]" aria-hidden />
            <h3 className="mt-4 text-lg font-semibold text-[#f4f1ea]" style={{ fontFamily: "var(--font-hds-display)" }}>
              Deposits &amp; checkout
            </h3>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
              Card checkout uses Stripe-style hosting when your builder has{" "}
              <code className="text-zinc-400">STRIPE_SECRET_KEY</code> set. Otherwise your request is emailed to the studio and
              deposit is collected manually — you still get SMS/email confirmations when SMTP and optional Twilio are configured.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8">
            <ShieldCheck className="w-8 h-8 text-[#d4e157]" aria-hidden />
            <h3 className="mt-4 text-lg font-semibold text-[#f4f1ea]" style={{ fontFamily: "var(--font-hds-display)" }}>
              Cancellation &amp; no-shows
            </h3>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{studio.cancellationSummary}</p>
            <ul className="mt-4 text-xs text-zinc-600 space-y-1">
              <li>Late cancellation fee: ${studio.lateCancelFeeUsd ?? 35}</li>
              <li>No-show fee: ${studio.noShowFeeUsd ?? 75}</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8">
            <Bell className="w-8 h-8 text-[#d4e157]" aria-hidden />
            <h3 className="mt-4 text-lg font-semibold text-[#f4f1ea]" style={{ fontFamily: "var(--font-hds-display)" }}>
              Reminders
            </h3>
            <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
              Email confirmations send immediately when SMTP is live. SMS uses Twilio when{" "}
              <code className="text-zinc-400">TWILIO_*</code> env vars are set. Automated reminder cadence can be layered with your
              scheduler or a cron worker — the template surfaces the policy copy so guests know what to expect.
            </p>
          </div>
        </div>

        {studio.loyaltyBlurb ? (
          <p className="mt-12 text-center text-sm text-[#d4e157]/90 max-w-2xl mx-auto">{studio.loyaltyBlurb}</p>
        ) : null}
      </div>
    </section>
  );
}
