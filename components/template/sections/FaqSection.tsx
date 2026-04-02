"use client";

import { useState } from "react";
import type { GeneratedSiteContent } from "@/types";

interface Props {
  content: GeneratedSiteContent;
}

export default function FaqSection({ content }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" style={{ background: "#f8f9fc", padding: "96px 0" }}>
      <div className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto">
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          {/* Header */}
          <div className="text-center mb-14">
            <span className="section-label">Common Questions</span>
            <h2
              style={{
                fontFamily: "var(--h-font)",
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 700,
                color: "var(--primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Frequently Asked Questions
            </h2>
            <div className="accent-bar" style={{ margin: "16px auto 0" }} />
          </div>

          {/* Accordion */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {content.faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    border: `1px solid ${isOpen ? "color-mix(in srgb, var(--accent) 30%, transparent)" : "rgba(0,0,0,0.06)"}`,
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                    boxShadow: isOpen ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "20px 24px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      gap: "16px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--h-font)",
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: isOpen ? "var(--accent)" : "var(--primary)",
                        lineHeight: 1.4,
                        transition: "color 0.2s",
                      }}
                    >
                      {faq.question}
                    </span>
                    <div
                      style={{
                        flexShrink: 0,
                        width: "28px",
                        height: "28px",
                        background: isOpen
                          ? "var(--accent)"
                          : "rgba(0,0,0,0.06)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isOpen ? "white" : "#6b7280"}
                        strokeWidth="2.5"
                        style={{
                          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: "0 24px 20px",
                        borderTop: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <p
                        style={{
                          paddingTop: "16px",
                          color: "#4b5563",
                          fontSize: "0.95rem",
                          lineHeight: 1.7,
                        }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
