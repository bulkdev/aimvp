import { useEffect, useState } from "react";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";

interface Props {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
}

export default function NavbarSection({ content, intake }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const links = ["Services", "About", "FAQ", "Contact"];

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

  return (
    <>
      <nav
        style={{
          background: "var(--primary)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
        className="sticky top-0 z-40 px-6 md:px-12 lg:px-20 py-4 flex items-center justify-between"
      >
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          {intake.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={intake.logoDataUrl}
              alt={`${content.brandName} logo`}
              className="h-9 object-contain"
            />
          ) : (
            <div
              style={{ background: "var(--accent)" }}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            >
              {content.brandName.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className="text-white font-semibold text-lg tracking-tight"
            style={{ fontFamily: "var(--h-font)" }}
          >
            {content.brandName}
          </span>
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <a href="#contact" className="btn-primary hidden sm:inline-block" style={{ padding: "10px 20px", fontSize: "14px" }}>
          {content.hero.ctaText}
        </a>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden text-white/60 hover:text-white"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => (mobileOpen ? closeMenu() : openMenu())}
        >
          {mobileOpen ? (
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
          )}
        </button>
      </nav>

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
            <div className="flex items-center justify-between mb-6">
              <span className="text-white font-semibold" style={{ fontFamily: "var(--h-font)" }}>
                Menu
              </span>
              <button
                type="button"
                onClick={closeMenu}
                className="text-white/70 hover:text-white"
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

            <a
              href="#contact"
              className="btn-primary mt-6 text-center"
              onClick={closeMenu}
            >
              {content.hero.ctaText}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
