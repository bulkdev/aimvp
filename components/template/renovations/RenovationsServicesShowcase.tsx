"use client";

import { useRef, type ComponentType } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { intakeLocationLine } from "@/lib/location";

const BG =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=80";

function ServiceIcon({ name }: { name: string }) {
  const Icon = (LucideIcons as unknown as Record<string, ComponentType<{ className?: string; strokeWidth?: number }>>)[
    name
  ];
  if (!Icon) return <LucideIcons.Sparkles className="theme-accent-icon h-7 w-7" strokeWidth={1.25} />;
  return <Icon className="theme-accent-icon h-7 w-7" strokeWidth={1.25} />;
}

export default function RenovationsServicesShowcase({
  content,
  intake,
  parallaxImageUrl,
  parallaxLayerActive = true,
  parallaxOverlayOpacity = 100,
}: {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
  /** From admin “Section parallax”; falls back to built-in stock image when layer is active. */
  parallaxImageUrl?: string;
  /** When false (e.g. scope = subpages only on home), no image layer — solid section bg only. */
  parallaxLayerActive?: boolean;
  /** 0–100: scrim strength over the parallax image */
  parallaxOverlayOpacity?: number;
}) {
  const loc = intakeLocationLine(intake)?.trim();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-18%", "18%"]);
  const scrim = Math.min(100, Math.max(0, parallaxOverlayOpacity)) / 100;
  const bgSrc = parallaxLayerActive ? parallaxImageUrl?.trim() || BG : null;

  return (
    <section ref={sectionRef} id="services" className="relative overflow-hidden bg-[#0c0a09] py-24 md:py-32">
      {bgSrc ? (
        <motion.div className="pointer-events-none absolute inset-0 scale-[1.2]" style={{ y: bgY }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgSrc} alt="" className="h-full w-full object-cover opacity-40" />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#0c0a09] via-[#0c0a09]/90 to-[#0c0a09]"
            style={{ opacity: scrim }}
          />
        </motion.div>
      ) : null}

      <div className="relative z-[1] mx-auto max-w-screen-2xl px-5 md:px-10">
        <div className="mb-14 max-w-2xl">
          <span className="theme-accent-muted text-xs font-semibold uppercase tracking-[0.22em]">Capabilities</span>
          <h2
            className="mt-3 text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold tracking-tight text-white"
            style={{ fontFamily: "var(--h-font)" }}
          >
            Full-service delivery
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-400">
            Structured phases, coordinated trades, and finishes specified for durability — whether you&apos;re updating a
            home or repositioning a commercial space{loc ? ` in ${loc}` : ""}.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {content.services.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="theme-accent-border-hover group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[border-color,transform] duration-300 hover:-translate-y-0.5"
            >
              <div
                className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-50"
                style={{ background: "var(--accent)" }}
              />
              <div className="relative flex gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                  <ServiceIcon name={s.icon} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "var(--h-font)" }}>
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-400">{s.description}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
