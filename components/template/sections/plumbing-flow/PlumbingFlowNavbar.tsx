"use client";

import { type CSSProperties, useEffect, useState } from "react";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { publishedNavHref, type NavHash } from "@/lib/published-nav-hrefs";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
  publishedBasePath?: string;
}

function navHashFromLabel(label: string): NavHash {
  const k = label.toLowerCase();
  if (k === "stats") return "stats";
  return k as NavHash;
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

/** Floating glass nav for the Plumbing Flow template (dark hero). */
export default function PlumbingFlowNavbar({ content, intake, publishedBasePath }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const links = ["Services", "Stats", "Work", "About", "FAQ", "Reviews", "Contact"];
  const cleanedPhone = intake.phone?.replace(/[^\d+]/g, "") || "";
  const hasCallNow = Boolean(cleanedPhone);

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

  const brand = (
    <a href="#hero" className="flex items-center gap-2 min-w-0 no-underline">
      {intake.logoDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={intake.logoDataUrl} alt="" className="h-8 sm:h-9 object-contain shrink-0" />
      ) : (
        <div
          style={{ background: "var(--accent)" }}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg shrink-0 shadow-lg shadow-cyan-500/20"
          aria-hidden
        >
          {content.brandName.charAt(0).toUpperCase()}
        </div>
      )}
      <span
        className="text-white font-semibold tracking-tight whitespace-normal break-words min-w-0 max-w-[clamp(100px,36vw,200px)] sm:max-w-[320px]"
        style={{ fontFamily: "var(--h-font)", fontSize: "clamp(0.78rem, 2.2vw, 1.05rem)", lineHeight: 1.1 }}
      >
        {content.brandName}
      </span>
    </a>
  );

  const linksNode = (
    <div className="hidden lg:flex items-center gap-5">
      {links.map((link) => (
        <a
          key={link}
          href={publishedNavHref(publishedBasePath, navHashFromLabel(link))}
          className="text-white/75 hover:text-white text-sm font-medium transition-colors no-underline"
        >
          {link}
        </a>
      ))}
    </div>
  );

  const callCta = hasCallNow ? (
    <a
      href={`tel:${cleanedPhone}`}
      className="hidden sm:inline-flex items-center gap-2 text-white no-underline rounded-full"
      style={{
        background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 88%, #000), color-mix(in srgb, var(--accent) 65%, #0891b2))",
        border: "1px solid rgba(103,232,249,0.35)",
        padding: "9px 14px",
        fontSize: "13px",
        fontWeight: 700,
        boxShadow: "0 4px 20px rgba(6,182,212,0.25)",
      }}
      aria-label={`Call now ${intake.phone}`}
    >
      <PhoneIcon className="w-4 h-4 shrink-0" style={phoneIconAttentionStyle} />
      <span className="hidden xl:inline">Call</span>
      <span className="truncate max-w-[140px]">{intake.phone}</span>
    </a>
  ) : null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pt-3 md:pt-4 px-3 md:px-6 pointer-events-none">
        <nav
          className="pointer-events-auto max-w-6xl mx-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-white/15"
          style={{
            background: "linear-gradient(135deg, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.55) 100%)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          {brand}
          {linksNode}
          <div className="flex items-center gap-2 shrink-0">
            {callCta}
            <a
              href={publishedNavHref(publishedBasePath, "contact")}
              className="hidden sm:inline-flex btn-primary no-underline text-center"
              style={{
                padding: "10px 18px",
                fontSize: "14px",
                borderRadius: "999px",
                boxShadow: "0 4px 18px rgba(6,182,212,0.35)",
              }}
            >
              {content.hero.ctaText}
            </a>
            <button
              type="button"
              className="lg:hidden text-white/80 hover:text-white p-2 -mr-1"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => (mobileOpen ? closeMenu() : openMenu())}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </nav>
      </header>

      {menuVisible && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 transition-opacity duration-200"
            style={{ background: "rgba(0,0,0,0.6)", opacity: mobileOpen ? 1 : 0 }}
            onClick={closeMenu}
          />
          <div
            className="absolute right-0 top-0 h-full w-[86vw] max-w-[360px] p-6 flex flex-col transition-transform duration-200 ease-out border-l border-white/10"
            style={{
              background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)",
              transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
            }}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="text-white font-semibold" style={{ fontFamily: "var(--h-font)" }}>
                Menu
              </span>
              <button type="button" className="text-white/70 p-2" aria-label="Close" onClick={closeMenu}>
                <MenuIcon open />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="text-white/90 py-3 border-b border-white/10 no-underline font-medium"
                  onClick={closeMenu}
                >
                  {link}
                </a>
              ))}
            </nav>
            <div className="mt-auto pt-6 flex flex-col gap-3">
              {hasCallNow && (
                <a
                  href={`tel:${cleanedPhone}`}
                  className="btn-primary text-center no-underline"
                  style={{ borderRadius: "12px" }}
                >
                  Call {intake.phone}
                </a>
              )}
              <a
                href={publishedNavHref(publishedBasePath, "contact")}
                className="btn-outline text-center no-underline border-cyan-400/50 text-cyan-100"
                onClick={closeMenu}
              >
                {content.hero.ctaText}
              </a>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
@keyframes phone-attention {
  0%, 74%, 100% { transform: scale(1) rotate(0deg); fill: transparent; }
  77% { transform: scale(1.18) rotate(-10deg); fill: currentColor; }
  80% { transform: scale(1.24) rotate(10deg); fill: currentColor; }
  83% { transform: scale(1.2) rotate(-9deg); fill: currentColor; }
  86% { transform: scale(1.16) rotate(8deg); fill: currentColor; }
  89% { transform: scale(1.12) rotate(-6deg); fill: currentColor; }
  92% { transform: scale(1.08) rotate(4deg); fill: currentColor; }
  95% { transform: scale(1.04) rotate(-2deg); fill: currentColor; }
}
`,
      }}
      />
    </>
  );
}
