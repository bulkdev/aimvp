"use client";

import React, { useState } from "react";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { normalizeNap } from "@/lib/seo";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
}

export default function ContactSection({ content, intake }: Props) {
  const [sent, setSent] = useState(false);
  const nap = normalizeNap(intake);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production: POST to a form handler or Netlify/Resend/EmailJS
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("lead_submit", {
          detail: { form: "contact", section: "contact" },
        })
      );
    }
    setSent(true);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "15px",
    color: "#111827",
    background: "#ffffff",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "var(--b-font)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "6px",
  };

  return (
    <section id="contact" style={{ background: "#ffffff", padding: "96px 0" }}>
      <div className="px-6 md:px-12 lg:px-24 max-w-screen-xl mx-auto">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "64px",
            alignItems: "start",
          }}
        >
          {/* Left: info */}
          <div>
            <span className="section-label">Contact</span>
            <h2
              style={{
                fontFamily: "var(--h-font)",
                fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
                fontWeight: 700,
                color: "var(--primary)",
                marginBottom: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              {content.contact.heading}
            </h2>
            <div className="accent-bar" />
            <p style={{ color: "#4b5563", fontSize: "1rem", lineHeight: 1.7, marginBottom: "32px" }}>
              {content.contact.subheading}
            </p>

            {/* Contact details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {nap.phone && (
                <ContactRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 1.2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.77a16 16 0 006 6l1.84-1.84a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  }
                  label="Phone"
                  value={<a href={`tel:${nap.phone}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{nap.phone}</a>}
                />
              )}
              {nap.email && (
                <ContactRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  }
                  label="Email"
                  value={<a href={`mailto:${nap.email}`} style={{ color: "var(--accent)", textDecoration: "none" }}>{nap.email}</a>}
                />
              )}
              {nap.fullAddress && (
                <ContactRow
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  }
                  label="Location"
                  value={nap.fullAddress}
                />
              )}
            </div>
          </div>

          {/* Right: form */}
          <div
            style={{
              background: "#f8f9fc",
              borderRadius: "20px",
              padding: "36px",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {sent ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ fontFamily: "var(--h-font)", fontSize: "1.3rem", color: "var(--primary)", marginBottom: "8px" }}>
                  Message Sent!
                </h3>
                <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                  Thank you for reaching out. We&apos;ll get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input type="text" placeholder="Jane" style={inputStyle} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input type="text" placeholder="Smith" style={inputStyle} required />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" placeholder="jane@example.com" style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Phone (optional)</label>
                  <input type="tel" placeholder="(555) 000-0000" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Address</label>
                  <input type="text" name="address" placeholder="123 Main St, City, State" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Service Type</label>
                  <input type="text" name="serviceType" placeholder="e.g. Drain cleaning, Water heater repair" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea
                    placeholder="Tell us about your project or question…"
                    style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ textAlign: "center", width: "100%" }}
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          background: "color-mix(in srgb, var(--accent) 10%, transparent)",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "var(--accent)",
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "2px", fontWeight: 500 }}>{label}</p>
        <div style={{ fontSize: "15px", color: "#1f2937", fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}
