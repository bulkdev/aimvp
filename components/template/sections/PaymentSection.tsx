import type { GeneratedSiteContent } from "@/types";

interface Props {
  content: GeneratedSiteContent;
}

/**
 * Payment section — designed for Stripe Payment Link or Checkout embed.
 *
 * To activate Stripe:
 * 1. Create a Payment Link in your Stripe Dashboard
 * 2. Add NEXT_PUBLIC_STRIPE_PAYMENT_LINK to .env.local
 * 3. Replace the CTA button href below with:
 *    href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
 *
 * For Stripe Checkout (server-side):
 * - Create an API route at /api/checkout that calls stripe.checkout.sessions.create()
 * - Point the Pay Now button to that route
 */
export default function PaymentSection(props: Props) {
  void props.content;

  return (
    <section id="payment" style={{ background: "#f8f9fc", padding: "96px 0" }}>
      <div className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto">
        <div className="text-center mb-12">
          <span className="section-label">Payments</span>
          <h2
            style={{
              fontFamily: "var(--h-font)",
              fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Secure Online Payments
          </h2>
          <div className="accent-bar" style={{ margin: "16px auto 0" }} />
        </div>

        <div
          style={{
            maxWidth: "640px",
            margin: "0 auto",
            background: "white",
            borderRadius: "20px",
            padding: "48px 40px",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            textAlign: "center",
          }}
        >
          {/* Payment icons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "28px" }}>
            {["Visa", "MC", "Amex", "Stripe"].map((card) => (
              <div
                key={card}
                style={{
                  width: "52px",
                  height: "32px",
                  background: "#f3f4f6",
                  borderRadius: "6px",
                  border: "1px solid rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "8px",
                  fontWeight: 700,
                  color: "#6b7280",
                  letterSpacing: "0.05em",
                }}
              >
                {card}
              </div>
            ))}
          </div>

          <h3
            style={{
              fontFamily: "var(--h-font)",
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "var(--primary)",
              marginBottom: "12px",
            }}
          >
            Pay Your Invoice Online
          </h3>
          <p style={{ color: "#6b7280", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "28px" }}>
            We accept all major credit cards through our secure Stripe-powered payment system.
            You&apos;ll receive an email confirmation and receipt immediately.
          </p>

          {/* Security badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              marginBottom: "28px",
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "🔒", text: "256-bit SSL" },
              { icon: "✓", text: "PCI Compliant" },
              { icon: "⚡", text: "Instant Receipt" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b7280" }}>
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* CTA — swap href for real Stripe Payment Link */}
          <a
            href="#contact"
            className="btn-primary"
            style={{ display: "inline-block", width: "100%", textAlign: "center" }}
          >
            Pay Now via Stripe
          </a>

          <p style={{ marginTop: "14px", fontSize: "12px", color: "#9ca3af" }}>
            Powered by Stripe — your payment info is never stored on our servers.
          </p>
        </div>
      </div>
    </section>
  );
}
