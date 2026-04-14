"use client";

import { useRef, type ComponentType, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import * as LucideIcons from "lucide-react";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { intakeLocationLine } from "@/lib/location";

const BG =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2400&q=80";

const SERVICE_IMAGE_FALLBACKS: string[] = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1600566753190-acf35178c2c0?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=82",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1200&q=82",
];

function ServiceIcon({ name }: { name: string }) {
  const Icon = (LucideIcons as unknown as Record<string, ComponentType<{ className?: string; strokeWidth?: number }>>)[
    name
  ];
  if (!Icon) return <LucideIcons.Sparkles className="theme-accent-icon h-7 w-7" strokeWidth={1.25} />;
  return <Icon className="theme-accent-icon h-7 w-7" strokeWidth={1.25} />;
}

function serviceCardImageUrl(
  title: string,
  index: number,
  map: Record<string, string> | undefined
): string {
  const t = title.trim();
  const lower = t.toLowerCase();
  const fromMap = map?.[lower] || map?.[t];
  if (fromMap?.trim()) return fromMap.trim();
  return SERVICE_IMAGE_FALLBACKS[index % SERVICE_IMAGE_FALLBACKS.length];
}

const sectionShellStyle: CSSProperties = {
  backgroundColor: "var(--primary)",
};

const parallaxScrimStyle = (scrim: number): CSSProperties => ({
  background: `linear-gradient(to bottom, var(--primary) 0%, color-mix(in srgb, var(--primary) 92%, transparent) 45%, var(--primary) 100%)`,
  opacity: scrim,
});

export default function RenovationsServicesShowcase({
  content,
  intake,
  parallaxImageUrl,
  parallaxLayerActive = true,
  parallaxOverlayOpacity = 100,
  layout = "editorial-icons",
}: {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
  /** From admin “Section parallax”; falls back to built-in stock image when layer is active. */
  parallaxImageUrl?: string;
  /** When false (e.g. scope = subpages only on home), no image layer — solid section bg only. */
  parallaxLayerActive?: boolean;
  /** 0–100: scrim strength over the parallax image */
  parallaxOverlayOpacity?: number;
  /** From admin design variants (renovations template). */
  layout?: "editorial-icons" | "image-pill-grid";
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
  const serviceImages = content.assets?.serviceCardImages;

  return (
    <section ref={sectionRef} id="services" className="relative overflow-hidden py-24 md:py-32" style={sectionShellStyle}>
      {bgSrc ? (
        <motion.div className="pointer-events-none absolute inset-0 scale-[1.2]" style={{ y: bgY }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bgSrc} alt="" className="h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0" style={parallaxScrimStyle(scrim)} />
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
          <p
            className="mt-4 text-base leading-relaxed"
            style={{ color: "color-mix(in srgb, white 58%, var(--secondary) 42%)" }}
          >
            Structured phases, coordinated trades, and finishes specified for durability — whether you&apos;re updating a
            home or repositioning a commercial space{loc ? ` in ${loc}` : ""}.
          </p>
        </div>

        {layout === "image-pill-grid" ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {content.services.map((s, i) => (
              <motion.article
                key={s.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.1] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={serviceCardImageUrl(s.title, i, serviceImages)}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, color-mix(in srgb, var(--primary) 88%, transparent) 0%, transparent 55%)",
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-5 pt-16">
                    <div
                      className="max-w-[min(100%,28rem)] rounded-full border border-white/25 px-5 py-2.5 text-center shadow-lg backdrop-blur-md"
                      style={{
                        fontFamily: "var(--h-font)",
                        background: "color-mix(in srgb, var(--accent) 90%, black)",
                        color: "white",
                        boxShadow: `0 12px 40px color-mix(in srgb, var(--accent) 35%, transparent)`,
                      }}
                    >
                      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] md:text-[0.95rem]">{s.title}</h3>
                    </div>
                  </div>
                </div>
                {s.description?.trim() ? (
                  <p
                    className="border-t border-white/[0.08] px-5 py-4 text-sm leading-relaxed md:px-6"
                    style={{
                      color: "color-mix(in srgb, white 62%, var(--secondary) 38%)",
                      background: "color-mix(in srgb, var(--primary) 72%, black)",
                    }}
                  >
                    {s.description}
                  </p>
                ) : null}
              </motion.article>
            ))}
          </div>
        ) : (
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
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-white/10"
                    style={{ background: "color-mix(in srgb, var(--primary) 40%, black 60%)" }}
                  >
                    <ServiceIcon name={s.icon} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "var(--h-font)" }}>
                      {s.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed"
                      style={{ color: "color-mix(in srgb, white 58%, var(--secondary) 42%)" }}
                    >
                      {s.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
