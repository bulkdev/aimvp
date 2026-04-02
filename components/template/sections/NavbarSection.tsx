"use client";

import { type CSSProperties, useEffect, useState } from "react";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
  isPlumbing?: boolean;
  styleVariant?: "standard" | "split-bar" | "boxed";
}

function PhoneIcon({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} style={style} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.78 19.78 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.78 19.78 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.9 8.77a16 16 0 0 0 6 6l1.84-1.84a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function NavbarSection({
  content,
  intake,
  isPlumbing = false,
  styleVariant = "standard",
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const links = ["Services", "Work", "About", "FAQ", "Reviews", "Contact"];
  const cleanedPhone = intake.phone?.replace(/[^\d+]/g, "") || "";
  const hasCallNow = isPlumbing && Boolean(cleanedPhone);
  const phoneIconAttentionStyle: CSSProperties = {
    display: "inline-block",
    transformOrigin: "50% 55%",
    fill: "transparent",
    animation: "phone-attention 8s ease-in-out infinite",
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      const t = window.setTimeout(() => setMenuVisible(false), 220);
      return () => window.clearTimeout(t);
    }
  }, [mobileOpen]);

  function openMenu() {
    setMenuVisible(true);
    window.requestAnimationFrame(() => setMobileOpen(true));
  }

  function closeMenu() {
    setMobileOpen(false);
  }

  const drawerLogoMark = intake.logoDataUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={intake.logoDataUrl}
      alt={`${content.brandName} logo`}
      className="h-9 object-contain shrink-0 max-w-[200px]"
    />
  ) : (
    <div
      style={{ background: "var(--accent)" }}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0"
      aria-hidden
    >
      {content.brandName.charAt(0).toUpperCase()}
    </div>
  );

  const brand = (
    <div className="flex items-center gap-2 min-w-0">
      {intake.logoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={intake.logoDataUrl} alt={`${content.brandName} logo`} className="h-7 sm:h-9 object-contain shrink-0" />
      ) : (
        <div
          style={{ background: "var(--accent)" }}
          className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-lg shrink-0"
        >
          {content.brandName.charAt(0).toUpperCase()}
        </div>
      )}
      <span
        className="text-white font-semibold tracking-tight whitespace-normal break-words text-center min-w-0 max-w-[clamp(96px,32vw,180px)] sm:max-w-[clamp(180px,40vw,420px)]"
        style={{ fontFamily: "var(--h-font)", fontSize: "clamp(0.72rem, 2.4vw, 1.1rem)", lineHeight: 1.02 }}
      >
        {content.brandName}
      </span>
    </div>
  );

  const linksNode = (
    <div className="hidden md:flex items-center gap-6">
      {links.map((link) => (
        <a key={link} href={`#${link.toLowerCase()}`} className="text-white/70 hover:text-white text-sm font-medium transition-colors">
          {link}
        </a>
      ))}
    </div>
  );

  const callCta = hasCallNow ? (
    <a
      href={`tel:${cleanedPhone}`}
      className="inline-flex items-center gap-2 text-white no-underline"
      style={{
        background: "color-mix(in srgb, var(--accent) 84%, #000 16%)",
        border: "1px solid rgba(255,255,255,0.22)",
        padding: "10px 14px",
        borderRadius: "999px",
        fontSize: "14px",
        fontWeight: 700,
        letterSpacing: "0.01em",
        maxWidth: "320px",
      }}
      aria-label={`Call now ${intake.phone}`}
    >
      <PhoneIcon className="w-4 h-4 shrink-0" style={phoneIconAttentionStyle} />
      <span className="hidden lg:inline">Call Now:</span>
      <span className="truncate">{intake.phone}</span>
    </a>
  ) : null;

  return (
    <>
      {styleVariant === "split-bar" ? (
        <header className="sticky top-0 z-40">
          <div
            className="px-6 md:px-12 lg:px-20 py-2 flex items-center justify-between gap-3"
            style={{
              background: "color-mix(in srgb, var(--secondary) 72%, #000 28%)",
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <div className="hidden md:flex items-center gap-2 text-white/80 text-xs">
              <PhoneIcon className="w-3.5 h-3.5" />
              <span>Emergency Service Available</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {callCta}
              <a href="#contact" className="btn-primary hidden sm:inline-block" style={{ padding: "10px 18px", fontSize: "14px" }}>
                {content.hero.ctaText}
              </a>
            </div>
          </div>
          <nav
            className="px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between gap-4"
            style={{
              background: "linear-gradient(90deg, var(--primary) 0%, color-mix(in srgb, var(--secondary) 70%, #000 30%) 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            {brand}
            {linksNode}
            <button
              type="button"
              className="md:hidden text-white/70 hover:text-white shrink-0"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => (mobileOpen ? closeMenu() : openMenu())}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </nav>
        </header>
      ) : styleVariant === "boxed" ? (
        <header className="sticky top-0 z-40 px-3 md:px-6 pt-3">
          <nav
            className="px-4 md:px-6 py-3 flex items-center justify-between gap-4"
            style={{
              background: "rgba(11,18,32,0.82)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: "16px",
              backdropFilter: "blur(10px)",
            }}
          >
            {brand}
            {linksNode}
            <div className="hidden sm:flex items-center gap-2">
              {callCta}
              <a href="#contact" className="btn-primary" style={{ padding: "10px 16px", fontSize: "14px" }}>
                {content.hero.ctaText}
              </a>
            </div>
            <button
              type="button"
              className="md:hidden text-white/70 hover:text-white shrink-0"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => (mobileOpen ? closeMenu() : openMenu())}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </nav>
          {hasCallNow && (
            <a
              href={`tel:${cleanedPhone}`}
              className="md:hidden mt-2 inline-flex items-center justify-center gap-2 text-white no-underline w-full"
              style={{
                background: "color-mix(in srgb, var(--accent) 84%, #000 16%)",
                border: "1px solid rgba(255,255,255,0.22)",
                padding: "10px 12px",
                borderRadius: "12px",
                fontSize: "13px",
                fontWeight: 700,
              }}
              aria-label={`Call now ${intake.phone}`}
            >
              <PhoneIcon className="w-4 h-4" style={phoneIconAttentionStyle} />
              <span className="truncate">Call Now: {intake.phone}</span>
            </a>
          )}
        </header>
      ) : (
        <nav
          className="sticky top-0 z-40 pl-4 pr-2 md:px-12 lg:px-20 py-2.5 md:py-4 flex items-center justify-between gap-3"
          style={{
            background: "var(--primary)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {brand}
          {linksNode}
          <div className="hidden sm:flex items-center gap-3">
            {callCta}
            <a href="#contact" className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
              {content.hero.ctaText}
            </a>
          </div>
          <div className="md:hidden flex items-center gap-2">
            {hasCallNow && (
              <a
                href={`tel:${cleanedPhone}`}
                className="inline-flex items-center gap-1.5 text-white no-underline"
                style={{
                  background: "color-mix(in srgb, var(--accent) 84%, #000 16%)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  padding: "7px 9px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
                aria-label={`Call now ${intake.phone}`}
              >
                <PhoneIcon className="w-3.5 h-3.5" style={phoneIconAttentionStyle} />
                <span>Call Now</span>
              </a>
            )}
            <button
              type="button"
              className="text-white/60 hover:text-white"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => (mobileOpen ? closeMenu() : openMenu())}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </nav>
      )}

      {menuVisible && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 transition-opacity duration-200"
            style={{ background: "rgba(0,0,0,0.55)", opacity: mobileOpen ? 1 : 0 }}
            onClick={closeMenu}
          />
          <div
            className="absolute right-0 top-0 h-full w-[82vw] max-w-[340px] p-6 flex flex-col transition-transform duration-200 ease-out"
            aria-hidden={!mobileOpen}
            style={{
              background: "var(--primary)",
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-6 min-w-0">
              <div className="flex items-center min-w-0">{drawerLogoMark}</div>
              <button
                type="button"
                onClick={closeMenu}
                className="text-white/70 hover:text-white shrink-0"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-white/85 hover:text-white py-2 text-base"
                  onClick={closeMenu}
                >
                  {link}
                </a>
              ))}
            </div>

            {hasCallNow && (
              <a
                href={`tel:${cleanedPhone}`}
                className="mt-6 text-center text-white no-underline inline-flex items-center justify-center gap-2"
                style={{
                  background: "color-mix(in srgb, var(--accent) 84%, #000 16%)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
                onClick={closeMenu}
                aria-label={`Call now ${intake.phone}`}
              >
                <PhoneIcon className="w-4 h-4" style={phoneIconAttentionStyle} />
                <span className="truncate">Call Now: {intake.phone}</span>
              </a>
            )}
            <a
              href="#contact"
              className="btn-primary mt-3 text-center"
              onClick={closeMenu}
            >
              {content.hero.ctaText}
            </a>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes phone-attention {
          0%,
          74%,
          100% {
            transform: scale(1) rotate(0deg);
            fill: transparent;
          }
          77% {
            transform: scale(1.18) rotate(-10deg);
            fill: currentColor;
          }
          80% {
            transform: scale(1.24) rotate(10deg);
            fill: currentColor;
          }
          83% {
            transform: scale(1.2) rotate(-9deg);
            fill: currentColor;
          }
          86% {
            transform: scale(1.16) rotate(8deg);
            fill: currentColor;
          }
          89% {
            transform: scale(1.12) rotate(-6deg);
            fill: currentColor;
          }
          92% {
            transform: scale(1.08) rotate(4deg);
            fill: currentColor;
          }
          95% {
            transform: scale(1.04) rotate(-2deg);
            fill: currentColor;
          }
        }
      `}</style>
    </>
  );
}
