import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { intakeLocationLine } from "@/lib/location";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
}

export default function AboutSection({ content, intake }: Props) {
  const { about } = content;
  const locationLine = intakeLocationLine(intake)?.trim() || "";

  return (
    <section id="about" style={{ background: "#ffffff", padding: "96px 0" }}>
      <div className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "64px",
            alignItems: "center",
          }}
        >
          {/* Text content */}
          <div>
            <span className="section-label">Our Story</span>
            <h2
              style={{
                fontFamily: "var(--h-font)",
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                fontWeight: 700,
                color: "var(--primary)",
                marginBottom: "8px",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {about.heading}
            </h2>
            <div className="accent-bar" />

            {locationLine ? (
              <p
                style={{
                  color: "var(--accent)",
                  fontSize: "0.98rem",
                  fontWeight: 600,
                  marginBottom: "18px",
                  letterSpacing: "0.02em",
                }}
              >
                Proudly serving {locationLine}
              </p>
            ) : null}

            {about.body.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                style={{
                  color: "#374151",
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  marginBottom: i < about.body.split("\n\n").length - 1 ? "16px" : "0",
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Highlights card */}
          <div
            style={{
              background: `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)`,
              borderRadius: "20px",
              padding: "40px",
              color: "white",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--h-font)",
                fontSize: "1.4rem",
                fontWeight: 600,
                marginBottom: "28px",
                color: "white",
              }}
            >
              Why Choose Us
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {about.highlights.map((highlight, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div
                    style={{
                      flexShrink: 0,
                      width: "28px",
                      height: "28px",
                      background: "var(--accent)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "2px",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                    {highlight}
                  </p>
                </div>
              ))}
            </div>

            {/* Decorative circle */}
            <div
              style={{
                marginTop: "36px",
                paddingTop: "28px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  background: "var(--accent)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.87a19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "2px" }}>
                  Ready to get started?
                </p>
                <a
                  href="#contact"
                  style={{
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Contact Us Today →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
