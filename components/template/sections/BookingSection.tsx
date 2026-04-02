import type { GeneratedSiteContent } from "@/types";

interface Props {
  content: GeneratedSiteContent;
}

/**
 * Booking section — designed for Calendly or Square Appointments embed.
 *
 * To activate Calendly:
 * 1. Add NEXT_PUBLIC_CALENDLY_URL to .env.local
 * 2. Replace the placeholder div below with:
 *    <div className="calendly-inline-widget" data-url={process.env.NEXT_PUBLIC_CALENDLY_URL} style={{minWidth:"320px",height:"700px"}} />
 *    and load the Calendly widget script in layout.tsx
 *
 * To activate Square Appointments:
 * 1. Add NEXT_PUBLIC_SQUARE_BOOKING_URL to .env.local
 * 2. Embed an <iframe> pointing to your Square booking page URL
 */
export default function BookingSection(props: Props) {
  void props.content;

  return (
    <section id="booking" style={{ background: "#ffffff", padding: "96px 0" }}>
      <div className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-label">Schedule</span>
          <h2
            style={{
              fontFamily: "var(--h-font)",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Book an Appointment
          </h2>
          <div className="accent-bar" style={{ margin: "16px auto 0" }} />
        </div>

        {/* Embed placeholder */}
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            border: "2px dashed color-mix(in srgb, var(--accent) 30%, transparent)",
            borderRadius: "20px",
            padding: "64px 40px",
            textAlign: "center",
            background: "color-mix(in srgb, var(--accent) 4%, transparent)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "color-mix(in srgb, var(--accent) 12%, transparent)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          <h3
            style={{
              fontFamily: "var(--h-font)",
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "var(--primary)",
              marginBottom: "10px",
            }}
          >
            Online Booking Coming Soon
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.95rem", marginBottom: "24px", lineHeight: 1.6 }}>
            We&apos;re setting up our online scheduling system. In the meantime,
            give us a call or send a message and we&apos;ll get you booked in.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" className="btn-primary" style={{ fontSize: "14px", padding: "11px 24px" }}>
              Contact to Book
            </a>
            <span
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid rgba(0,0,0,0.1)",
                fontSize: "12px",
                color: "#9ca3af",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Calendly / Square embed goes here
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
