import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { applyIntakeLocationToCopy, intakeLocationLine } from "@/lib/location";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
}

export default function HeroSection({ content, intake }: Props) {
  const { hero, tagline } = content;
  const locationLine = intakeLocationLine(intake);
  const heroSubtitle = applyIntakeLocationToCopy(hero.subtitle, intake);

  return (
    <section
      id="hero"
      style={{
        background: `linear-gradient(135deg, var(--primary) 0%, var(--secondary) 60%, color-mix(in srgb, var(--secondary) 80%, var(--accent)) 100%)`,
        minHeight: "88vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background elements */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-20%", right: "-10%",
          width: "600px", height: "600px",
          background: "var(--accent)",
          opacity: 0.07,
          borderRadius: "50%",
          filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "5%",
          width: "400px", height: "400px",
          background: "var(--accent)",
          opacity: 0.05,
          borderRadius: "50%",
          filter: "blur(60px)",
        }} />
        {/* Grid pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative z-10 px-6 md:px-12 lg:px-24 py-20 max-w-screen-xl mx-auto w-full">
        <div className="max-w-3xl">
          <div style={{ marginTop: "108px" }}>
            {/* Eyebrow */}
            <span className="section-label" style={{ color: "rgba(255,255,255,0.55)" }}>
              {tagline}
            </span>

            {/* Main headline */}
            <h1
              style={{
                fontFamily: "var(--h-font)",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.15,
                marginTop: "24px",
                marginBottom: "24px",
                letterSpacing: "-0.02em",
              }}
            >
              {hero.title}
            </h1>
          </div>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
              color: "rgba(255,255,255,0.70)",
              lineHeight: 1.7,
              marginBottom: "40px",
              maxWidth: "560px",
            }}
          >
            {heroSubtitle}
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <a href="#contact" className="btn-primary">
              {hero.ctaText}
            </a>
            {hero.ctaSecondaryText && (
              <a
                href="#services"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "15px",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
              >
                {hero.ctaSecondaryText}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>

          {/* Trust badges */}
          {(intake.phone || locationLine) && (
            <div style={{
              marginTop: "56px",
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "32px",
            }}>
              {locationLine && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px" }}>
                    Serving {locationLine}
                  </span>
                </div>
              )}
              {intake.phone && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6 6l1.84-1.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 15z" />
                  </svg>
                  <a href={`tel:${intake.phone}`} style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", textDecoration: "none" }}>
                    {intake.phone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
