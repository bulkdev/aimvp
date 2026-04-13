"use client";

import { motion } from "framer-motion";

export default function TintLuxuryContact({
  heading,
  subheading,
  phone,
  email,
  cityLine,
}: {
  heading: string;
  subheading: string;
  phone?: string;
  email?: string;
  cityLine?: string;
}) {
  return (
    <section id="tint-contact" className="relative py-20 md:py-28 px-5 md:px-10 bg-[#030306] border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-tint-display)" }}
          >
            {heading}
          </h2>
          <p className="mt-4 text-zinc-400 max-w-md" style={{ fontFamily: "var(--font-tint-body)" }}>
            {subheading}
          </p>
          {cityLine ? (
            <p className="mt-6 text-sm uppercase tracking-[0.25em] text-violet-400/80">{cityLine}</p>
          ) : null}
        </motion.div>
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {phone ? (
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="flex-1 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-5 hover:border-violet-500/40 hover:bg-violet-500/5 transition-all"
            >
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Call</p>
              <p className="text-lg text-white font-medium mt-1">{phone}</p>
            </a>
          ) : null}
          {email ? (
            <a
              href={`mailto:${email}`}
              className="flex-1 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-5 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/5 transition-all"
            >
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Email</p>
              <p className="text-lg text-white font-medium mt-1 break-all">{email}</p>
            </a>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
