"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { GeneratedSiteContent } from "@/types";

interface Props {
  content: GeneratedSiteContent;
}

/** Google brand–adjacent hues (blue / red / green / orange); all work with white initials at ~12px. */
const GOOGLE_REVIEW_AVATAR_BACKGROUNDS = [
  "#4285F4",
  "#1967D2",
  "#1A73E8",
  "#669DF6",
  "#EA4335",
  "#D93025",
  "#C5221F",
  "#34A853",
  "#137333",
  "#0D652D",
  "#F29900",
  "#E37400",
] as const;

/** Stable “random” color per reviewer so SSR and duplicated carousel slides match. */
function googleReviewAvatarBackground(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  const idx = Math.abs(h) % GOOGLE_REVIEW_AVATAR_BACKGROUNDS.length;
  return GOOGLE_REVIEW_AVATAR_BACKGROUNDS[idx]!;
}

const DEFAULT_REVIEWS = [
  {
    reviewerName: "Stacey L.",
    rating: 5,
    text: "Fast response, clear pricing, and clean work. They fixed our leak the same day.",
    reviewAge: "3 months ago",
    reviewUrl: "#",
    avatarLetter: "S",
  },
  {
    reviewerName: "Mildred M.",
    rating: 5,
    text: "Professional and friendly team. They explained everything and got our water heater running quickly.",
    reviewAge: "4 months ago",
    reviewUrl: "#",
    avatarLetter: "M",
  },
  {
    reviewerName: "Will R.",
    rating: 5,
    text: "Quick diagnosis and excellent repair. Highly recommend for plumbing and heating work.",
    reviewAge: "5 months ago",
    reviewUrl: "#",
    avatarLetter: "W",
  },
];

function GoogleGIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 533.5 544.3" aria-hidden="true">
      <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.5-37.3-4.7-55.7H272v105.5h147.1c-6.1 33.9-25 63.8-52.8 83.8v69h85.3c50-46.1 81.9-114.1 81.9-202.6z" />
      <path fill="#34A853" d="M272 544.3c73.9 0 136-24.4 181.4-66.3l-85.3-69c-23.7 16.1-54 25.2-96.1 25.2-73.8 0-136.4-49.8-158.8-116.8H25v73.4c46.5 92.5 142.1 153.5 247 153.5z" />
      <path fill="#FBBC04" d="M113.2 317.4c-11.7-34.8-11.7-72.3 0-107.1V136.9H25c-41.1 82-41.1 178.5 0 260.5l88.2-80z" />
      <path fill="#EA4335" d="M272 107.7c43.5-.7 85.6 15.7 117.7 45.9l87.7-87.7C432.6 24.3 370.4-.1 272 0 167.1 0 71.5 61 25 153.5l88.2 73.4C135.6 157.5 198.2 107.7 272 107.7z" />
    </svg>
  );
}

function StorefrontIcon({ size = 46 }: { size?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "999px",
        background: "#ffffff",
        border: "1px solid #dbeafe",
        boxShadow: "0 2px 5px rgba(0,0,0,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/gmblogo.svg" alt="" width={Math.floor(size * 0.66)} height={Math.floor(size * 0.66)} />
    </div>
  );
}

const DESKTOP_GAP_PX = 12;

function reviewLinkHref(url?: string): string | undefined {
  const u = url?.trim();
  if (!u || u === "#") return undefined;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return undefined;
}

export default function GoogleReviewsSection({ content }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);
  const desktopViewportRef = useRef<HTMLDivElement>(null);
  const [desktopCardWidth, setDesktopCardWidth] = useState(188);
  const [desktopStride, setDesktopStride] = useState(200);

  const reviews = (content.assets?.manualReviews?.length ? content.assets.manualReviews : DEFAULT_REVIEWS)
    .filter((r) => r.text?.trim())
    .slice(0, 12);

  const desktopTrackReviews = useMemo(() => [...reviews, ...reviews], [reviews]);

  useLayoutEffect(() => {
    function measure() {
      const node = desktopViewportRef.current;
      if (!node) return;
      const w = node.getBoundingClientRect().width;
      if (w <= 0) return;
      const inner = (w - 2 * DESKTOP_GAP_PX) / 3;
      const cardWidth = Math.max(140, inner);
      setDesktopCardWidth(cardWidth);
      setDesktopStride(cardWidth + DESKTOP_GAP_PX);
    }

    measure();
    const node = desktopViewportRef.current;
    if (!node) return;
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const id = window.setInterval(() => {
      setSlideIndex((idx) => (idx + 1) % reviews.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [reviews.length]);

  if (reviews.length === 0) return null;

  const avg = reviews.reduce((sum, r) => sum + Math.max(1, Math.min(5, r.rating || 5)), 0) / reviews.length;

  function prevMobile() {
    setSlideIndex((idx) => (idx <= 0 ? reviews.length - 1 : idx - 1));
  }

  function nextMobile() {
    setSlideIndex((idx) => (idx >= reviews.length - 1 ? 0 : idx + 1));
  }

  return (
    <section id="reviews" style={{ background: "#ffffff", padding: "28px 0 36px" }}>
      <div className="px-4 md:px-8 lg:px-14 max-w-screen-2xl mx-auto w-full">
        <div className="hidden md:flex gap-3 pb-2 items-stretch w-full min-w-0">
          <div
            className="shrink-0"
            style={{
              width: "min(260px, 30vw)",
              minWidth: "200px",
              minHeight: "220px",
              background: "transparent",
              border: "none",
              borderRadius: "2px",
              padding: "14px 12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <StorefrontIcon size={34} />
              <p style={{ margin: 0, color: "#334155", fontWeight: 700, fontSize: "1rem" }}>{content.brandName}</p>
            </div>
            <p style={{ margin: "4px 0 0", color: "#f59e0b", fontWeight: 700, fontSize: "1.05rem" }}>
              {avg.toFixed(1)} {"★".repeat(5)}
            </p>
            <p style={{ margin: "4px 0 2px", color: "#5b6470", fontSize: "0.9rem" }}>Based on {reviews.length} reviews</p>
            <p style={{ margin: 0, color: "#5b6470", fontSize: "0.83rem", fontWeight: 600 }}>
              powered by{" "}
              <span style={{ color: "#4285F4" }}>G</span>
              <span style={{ color: "#EA4335" }}>o</span>
              <span style={{ color: "#FBBC04" }}>o</span>
              <span style={{ color: "#4285F4" }}>g</span>
              <span style={{ color: "#34A853" }}>l</span>
              <span style={{ color: "#EA4335" }}>e</span>
            </p>
            <a
              href={reviews.find((r) => r.reviewUrl && r.reviewUrl !== "#")?.reviewUrl || "#"}
              target="_blank"
              rel="noreferrer"
              style={{
                marginTop: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "999px",
                background: "#2563eb",
                color: "#fff",
                padding: "5px 10px",
                fontSize: "0.75rem",
                fontWeight: 700,
                textDecoration: "none",
                width: "fit-content",
              }}
            >
              review us on <GoogleGIcon size={12} />
            </a>
          </div>

          <div ref={desktopViewportRef} className="flex-1 min-w-0 overflow-hidden">
            <div
              style={{
                display: "flex",
                gap: DESKTOP_GAP_PX,
                transform: `translateX(-${(slideIndex % reviews.length) * desktopStride}px)`,
                transition: "transform 480ms ease",
                willChange: "transform",
              }}
            >
              {desktopTrackReviews.map((r, i) => {
                const rating = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
                const reviewHref = reviewLinkHref(r.reviewUrl);
                const avatarBg = googleReviewAvatarBackground(
                  `${r.reviewerName || ""}|${r.avatarLetter || ""}|${r.reviewAge || ""}`
                );
                const headerRow = (
                  <>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "999px",
                        background: avatarBg,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        flexShrink: 0,
                      }}
                    >
                      {(r.avatarLetter || r.reviewerName?.charAt(0) || "R").toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p
                        style={{
                          margin: 0,
                          color: "#1f2937",
                          fontWeight: 700,
                          fontSize: "0.86rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {r.reviewerName}
                      </p>
                      <p style={{ margin: 0, color: "#6b7280", fontSize: "0.74rem" }}>{r.reviewAge || ""}</p>
                    </div>
                    <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                      <GoogleGIcon />
                    </div>
                  </>
                );
                return (
                  <article
                    key={`${r.reviewerName}-${i}`}
                    style={{
                      flex: `0 0 ${desktopCardWidth}px`,
                      width: desktopCardWidth,
                      minHeight: "220px",
                      background: "#f7f8fa",
                      border: "1px solid #d9e0e8",
                      borderRadius: "2px",
                      padding: "10px 10px 12px",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {reviewHref ? (
                      <a
                        href={reviewHref}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "6px",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        {headerRow}
                      </a>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>{headerRow}</div>
                    )}
                    <p style={{ margin: "0 0 6px", color: "#f59e0b", fontSize: "0.8rem", letterSpacing: "0.04em" }}>
                      {"★".repeat(rating)}
                    </p>
                    <p style={{ margin: 0, color: "#1f2937", fontSize: "0.88rem", lineHeight: 1.45 }}>{r.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>

        <div className="md:hidden">
          <div
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "0",
              padding: "14px 14px 10px",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <StorefrontIcon />
              <p style={{ margin: 0, color: "#1f2937", fontWeight: 700, fontSize: "1.02rem", lineHeight: 1.2 }}>{content.brandName}</p>
            </div>
            <p style={{ margin: "8px 0 0", color: "#ef8a23", fontWeight: 700, fontSize: "1.02rem", lineHeight: 1 }}>
              {avg.toFixed(1)} {"★".repeat(5)}
            </p>
            <p style={{ margin: "6px 0 6px", color: "#374151", fontSize: "0.73rem" }}>Based on {reviews.length} reviews</p>
            <p style={{ margin: 0, color: "#4b5563", fontSize: "0.95rem", lineHeight: 1, fontWeight: 700 }}>
              powered by{" "}
              <span style={{ fontSize: "0.95rem" }}>
                <span style={{ color: "#4285F4" }}>G</span>
                <span style={{ color: "#EA4335" }}>o</span>
                <span style={{ color: "#FBBC04" }}>o</span>
                <span style={{ color: "#4285F4" }}>g</span>
                <span style={{ color: "#34A853" }}>l</span>
                <span style={{ color: "#EA4335" }}>e</span>
              </span>
            </p>
            <a
              href={reviews.find((r) => r.reviewUrl && r.reviewUrl !== "#")?.reviewUrl || "#"}
              target="_blank"
              rel="noreferrer"
              style={{
                marginTop: "10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "999px",
                background: "#3b82f6",
                color: "#fff",
                padding: "8px 14px",
                fontSize: "0.9rem",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 2px 4px rgba(59,130,246,0.4)",
              }}
            >
              review us on <GoogleGIcon size={16} />
            </a>
          </div>

          <div style={{ position: "relative", padding: "0 22px" }}>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  display: "flex",
                  transform: `translateX(-${(slideIndex % reviews.length) * 100}%)`,
                  transition: "transform 480ms ease",
                  willChange: "transform",
                }}
              >
                {reviews.map((review, idx) => {
                  const mobileHref = reviewLinkHref(review.reviewUrl);
                  const mobileAvatarBg = googleReviewAvatarBackground(
                    `${review.reviewerName || ""}|${review.avatarLetter || ""}|${review.reviewAge || ""}`
                  );
                  const mobileHeader = (
                    <>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "999px",
                          background: mobileAvatarBg,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.84rem",
                          flexShrink: 0,
                        }}
                      >
                        {(review.avatarLetter || review.reviewerName?.charAt(0) || "R").toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, color: "#1d4ed8", fontWeight: 700, fontSize: "0.94rem" }}>{review.reviewerName}</p>
                        <p style={{ margin: 0, color: "#4b5563", fontSize: "0.78rem" }}>{review.reviewAge || ""}</p>
                      </div>
                      <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                        <GoogleGIcon />
                      </div>
                    </>
                  );
                  return (
                    <article
                      key={`${review.reviewerName}-${idx}`}
                      style={{
                        minWidth: "100%",
                        background: "#f1f1f3",
                        border: "1px solid #d6d6d9",
                        borderRadius: "0",
                        padding: "14px 12px",
                      }}
                    >
                      {mobileHref ? (
                        <a
                          href={mobileHref}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "7px",
                            textDecoration: "none",
                            color: "inherit",
                          }}
                        >
                          {mobileHeader}
                        </a>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>{mobileHeader}</div>
                      )}
                      <p style={{ margin: "0 0 8px", color: "#ef8a23", fontSize: "1.05rem", letterSpacing: "0.04em" }}>
                        {"★".repeat(Math.max(1, Math.min(5, Math.round(review.rating || 5))))}
                      </p>
                      <p style={{ margin: 0, color: "#1f2937", fontSize: "0.98rem", lineHeight: 1.55 }}>{review.text}</p>
                    </article>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={prevMobile}
              style={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: "31px",
                height: "31px",
                borderRadius: "999px",
                border: "1px solid #cfd3d8",
                background: "#ececec",
                color: "#6b7280",
                fontSize: "1rem",
              }}
              aria-label="Previous review"
            >
              {"‹"}
            </button>
            <button
              type="button"
              onClick={nextMobile}
              style={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                width: "31px",
                height: "31px",
                borderRadius: "999px",
                border: "1px solid #cfd3d8",
                background: "#ececec",
                color: "#6b7280",
                fontSize: "1rem",
              }}
              aria-label="Next review"
            >
              {"›"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
