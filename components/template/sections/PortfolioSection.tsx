"use client";

import { useEffect, useState } from "react";
import type { GeneratedSiteContent } from "@/types";

interface Props {
  content: GeneratedSiteContent;
}

const DEFAULT_PROJECT_GALLERIES: string[][] = [
  [
    "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1400&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1400&q=80",
  ],
  [
    "https://images.unsplash.com/photo-1581578021269-4819f2e6d697?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1607400201889-565b1ee75cfc?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=80",
  ],
];

function shortReview(serviceTitle: string): string {
  const lower = serviceTitle.toLowerCase();
  if (lower.includes("emergency")) return "They arrived fast, fixed the issue in one visit, and left everything clean.";
  if (lower.includes("drain")) return "Drain is flowing perfectly now. Great communication and fair pricing.";
  if (lower.includes("install")) return "Install was clean and code-compliant. Professional team start to finish.";
  return "Excellent workmanship and clear updates throughout the whole job.";
}

export default function PortfolioSection({ content }: Props) {
  const [activeProjectIdx, setActiveProjectIdx] = useState<number | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  const configuredCards = (content.assets?.portfolioEntries ?? []).filter(
    (entry) => entry.photos && entry.photos.length > 0
  );

  const projectGalleries =
    content.assets?.portfolioProjects && content.assets.portfolioProjects.length > 0
      ? content.assets.portfolioProjects
      : DEFAULT_PROJECT_GALLERIES;

  const cards =
    configuredCards.length > 0
      ? configuredCards.map((entry) => ({
          serviceType: entry.serviceType,
          review: entry.review,
          photos: entry.photos,
          rating: Math.max(1, Math.min(5, entry.rating || 5)),
          projectName: entry.projectName,
        }))
      : content.services.slice(0, 3).map((service, i) => ({
          serviceType: service.title,
          review: shortReview(service.title),
          photos: projectGalleries[i % projectGalleries.length],
          rating: 5,
          projectName: `${service.title} project`,
        }));

  const activeProject = activeProjectIdx !== null ? cards[activeProjectIdx] : null;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!activeProject) return;
      if (e.key === "Escape") {
        setActiveProjectIdx(null);
      } else if (e.key === "ArrowRight") {
        setActiveSlideIdx((v) => (v + 1) % activeProject.photos.length);
      } else if (e.key === "ArrowLeft") {
        setActiveSlideIdx((v) => (v - 1 + activeProject.photos.length) % activeProject.photos.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProject]);

  return (
    <section id="work" style={{ background: "#ffffff", padding: "96px 0" }}>
      <div className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto">
        <div className="text-center mb-16">
          <span className="section-label">Proof In The Work</span>
          <h2
            style={{
              fontFamily: "var(--h-font)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.75rem)",
              fontWeight: 700,
              color: "var(--primary)",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Our Work
          </h2>
          <div className="accent-bar" style={{ margin: "0 auto 0" }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {cards.map((item, i) => (
            <button
              key={`${item.serviceType}-${i}`}
              type="button"
              onClick={() => {
                setActiveProjectIdx(i);
                setActiveSlideIdx(0);
              }}
              style={{
                position: "relative",
                minHeight: "360px",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                border: "1px solid rgba(255,255,255,0.2)",
                textAlign: "left",
              }}
              className="group transition-transform duration-200 hover:-translate-y-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.photos[0]}
                alt={`${item.serviceType} project`}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(11,18,32,0.12) 35%, rgba(11,18,32,0.84) 100%)",
                }}
              />

              <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "20px" }}>
                <span
                  style={{
                    alignSelf: "flex-start",
                    background: "color-mix(in srgb, var(--accent) 86%, #000 14%)",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderRadius: "999px",
                    padding: "7px 12px",
                  }}
                >
                  {item.serviceType}
                </span>
                <span
                  style={{
                    alignSelf: "flex-end",
                    color: "rgba(255,255,255,0.88)",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                  }}
                >
                  View project photos
                </span>

                <div
                  style={{
                    background: "rgba(11,18,32,0.65)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: "14px",
                    padding: "14px",
                    backdropFilter: "blur(3px)",
                  }}
                >
                  <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                    {Array.from({ length: item.rating }).map((_, idx) => (
                      <span key={idx} style={{ color: "#fbbf24", fontSize: "14px", lineHeight: 1 }}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.92)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                    &ldquo;{item.review}&rdquo;
                  </p>
                  <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.72)", fontSize: "0.78rem" }}>
                    {item.projectName}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeProject.serviceType} project photos`}
          onClick={() => setActiveProjectIdx(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(2,6,23,0.82)",
            zIndex: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(980px, 100%)",
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "#0b1220",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ position: "relative", height: "min(70vh, 560px)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeProject.photos[activeSlideIdx]}
                alt={`${activeProject.serviceType} project photo ${activeSlideIdx + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />

              <button
                type="button"
                onClick={() => setActiveProjectIdx(null)}
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  width: 36,
                  height: 36,
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(2,6,23,0.62)",
                  color: "#fff",
                  fontSize: 20,
                  lineHeight: 1,
                }}
                aria-label="Close slideshow"
              >
                ×
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveSlideIdx((v) => (v - 1 + activeProject.photos.length) % activeProject.photos.length)
                }
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 40,
                  height: 40,
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(2,6,23,0.62)",
                  color: "#fff",
                }}
                aria-label="Previous photo"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={() => setActiveSlideIdx((v) => (v + 1) % activeProject.photos.length)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 40,
                  height: 40,
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  background: "rgba(2,6,23,0.62)",
                  color: "#fff",
                }}
                aria-label="Next photo"
              >
                ›
              </button>
            </div>

            <div style={{ padding: "14px 16px 16px", background: "#0b1220" }}>
              <div style={{ color: "#fff", fontWeight: 600, marginBottom: "10px" }}>
                {activeProject.projectName}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {activeProject.photos.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to photo ${idx + 1}`}
                    onClick={() => setActiveSlideIdx(idx)}
                    style={{
                      width: idx === activeSlideIdx ? 26 : 10,
                      height: 10,
                      borderRadius: "999px",
                      border: "none",
                      background: idx === activeSlideIdx ? "var(--accent)" : "rgba(255,255,255,0.35)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

