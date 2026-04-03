import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { applyIntakeLocationToCopy } from "@/lib/location";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
}

export default function CtaBanner({ content, intake }: Props) {
  const contactSubheading = applyIntakeLocationToCopy(content.contact.subheading, intake);
  return (
    <section
      style={{
        background: `linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, var(--primary)) 100%)`,
        padding: "72px 0",
      }}
    >
      <div
        className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto"
        style={{ textAlign: "center" }}
      >
        <h2
          style={{
            fontFamily: "var(--h-font)",
            fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
            fontWeight: 700,
            color: "white",
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}
        >
          {content.contact.heading}
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.80)",
            fontSize: "1.1rem",
            marginBottom: "36px",
            maxWidth: "520px",
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          {contactSubheading}
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#contact"
            style={{
              background: "white",
              color: "var(--accent)",
              padding: "14px 36px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "none",
              transition: "all 0.2s",
              display: "inline-block",
            }}
          >
            {content.hero.ctaText}
          </a>
          {intake.phone && (
            <a
              href={`tel:${intake.phone}`}
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "white",
                padding: "14px 36px",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.3)",
                display: "inline-block",
                transition: "all 0.2s",
              }}
            >
              Call {intake.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
