import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { normalizeNap } from "@/lib/seo";
import { publishedNavHref } from "@/lib/published-nav-hrefs";
import { resolveNavbarMenuItems } from "@/lib/navbar-menu";
import { resolveSiteVariant } from "@/lib/siteVariant";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
  publishedBasePath?: string;
}

function SocialIcon({ name }: { name: "Facebook" | "Instagram" | "LinkedIn" | "X" }) {
  if (name === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H8v3h2.6v8h2.9z" />
      </svg>
    );
  }
  if (name === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "LinkedIn") {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3A1.96 1.96 0 1 0 5.3 6.92 1.96 1.96 0 0 0 5.25 3zM20 13.46c0-3.06-1.64-4.48-3.83-4.48a3.3 3.3 0 0 0-2.96 1.63h-.05V8.5H9.78V20h3.38v-5.7c0-1.5.28-2.95 2.14-2.95 1.83 0 1.86 1.71 1.86 3.05V20h3.38v-6.54z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path d="M18.9 3h2.9l-6.3 7.2L23 21h-5.9l-4.6-6.1L7.2 21H4.3l6.7-7.7L1 3h6l4.1 5.5L18.9 3zm-1 16h1.6L6.1 4.9H4.4L17.9 19z" />
    </svg>
  );
}

export default function FooterSection({ content, intake, publishedBasePath }: Props) {
  const year = new Date().getFullYear();
  const nap = normalizeNap(intake);
  const variant = resolveSiteVariant(
    intake.businessDescription ?? "",
    intake.siteTemplate ?? "auto",
    intake.companyName ?? ""
  );
  const menuItems = resolveNavbarMenuItems(content.assets, variant);
  const socialLinks = content.assets?.socialLinks ?? {};
  const socials = [
    { key: "facebook", label: "Facebook", href: socialLinks.facebook },
    { key: "instagram", label: "Instagram", href: socialLinks.instagram },
    { key: "linkedin", label: "LinkedIn", href: socialLinks.linkedin },
    { key: "x", label: "X", href: socialLinks.x },
  ].filter((item) => Boolean(item.href));

  return (
    <footer
      style={{
        background: "var(--primary)",
        color: "rgba(255,255,255,0.6)",
        padding: "56px 0 32px",
      }}
    >
      <div className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "48px",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              {intake.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={intake.logoDataUrl} alt="logo" style={{ height: "32px", objectFit: "contain" }} />
              ) : (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    background: "var(--accent)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "16px",
                  }}
                >
                  {content.brandName.charAt(0)}
                </div>
              )}
              <span
                style={{
                  color: "white",
                  fontFamily: "var(--h-font)",
                  fontWeight: 600,
                  fontSize: "17px",
                }}
              >
                {content.brandName}
              </span>
            </div>
            <p style={{ fontSize: "13px", lineHeight: 1.7, maxWidth: "220px" }}>
              {content.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: "white", fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
              Quick Links
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {menuItems.map((item, idx) => (
                <a
                  key={`${item.hash}-${idx}`}
                  href={publishedNavHref(publishedBasePath, item.hash)}
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", textDecoration: "none", transition: "color 0.2s" }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: "white", fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
              Contact
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              {nap.phone && (
                <a href={`tel:${nap.phone}`} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                  {nap.phone}
                </a>
              )}
              {nap.email && (
                <a href={`mailto:${nap.email}`} style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
                  {nap.email}
                </a>
              )}
              {nap.fullAddress && (
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{nap.fullAddress}</span>
              )}
            </div>
          </div>

          {/* Social */}
          {socials.length > 0 && (
            <div>
              <h4 style={{ color: "white", fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px" }}>
                Follow Us
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {socials.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    title={item.label}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "999px",
                      background: "color-mix(in srgb, var(--accent) 26%, transparent)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      color: "white",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    <SocialIcon name={item.label as "Facebook" | "Instagram" | "LinkedIn" | "X"} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p style={{ fontSize: "13px" }}>
            © {year} {content.brandName}. All rights reserved.
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)" }}>
            Site created by JayWebDesign
          </p>
        </div>
      </div>
    </footer>
  );
}
