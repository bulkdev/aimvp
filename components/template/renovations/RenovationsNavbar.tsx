"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { GeneratedSiteContent, IntakeFormData } from "@/types";
import { publishedNavHref } from "@/lib/published-nav-hrefs";
import { resolveNavbarMenuItems } from "@/lib/navbar-menu";
import { resolveSiteVariant } from "@/lib/siteVariant";

/** Subway tile — grid tint follows admin accent; base wash follows primary */
export function renoParallaxTileStyle(): CSSProperties {
  return {
    backgroundColor: "color-mix(in srgb, var(--primary) 5%, #f6f5f3)",
    backgroundImage: `
      linear-gradient(to right, color-mix(in srgb, var(--accent) 22%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in srgb, var(--accent) 22%, transparent) 1px, transparent 1px)
    `,
    backgroundSize: "26px 26px",
  };
}

function clampNavLogoHeight(px?: number): number {
  const n = typeof px === "number" && Number.isFinite(px) ? px : 40;
  return Math.min(96, Math.max(24, Math.round(n)));
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default function RenovationsNavbar({
  content,
  intake,
  publishedBasePath,
}: {
  content: GeneratedSiteContent;
  intake: IntakeFormData;
  publishedBasePath?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [promoOpen, setPromoOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  /** Navbar logos are often huge data URLs; defer img to client so SSR + first paint match (avoids hydration mismatch). */
  const [navLogoReady, setNavLogoReady] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileNavOpen) {
      setDrawerMounted(true);
      let cancelled = false;
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setDrawerVisible(true);
        });
      });
      return () => {
        cancelled = true;
        cancelAnimationFrame(id);
      };
    }
    setDrawerVisible(false);
    const t = window.setTimeout(() => setDrawerMounted(false), 320);
    return () => clearTimeout(t);
  }, [mobileNavOpen]);

  useEffect(() => {
    document.body.style.overflow = drawerMounted ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerMounted]);

  useEffect(() => {
    if (!drawerMounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerMounted]);

  useEffect(() => {
    setNavLogoReady(true);
  }, []);

  useLayoutEffect(() => {
    const el = shellRef.current;
    if (!el || typeof document === "undefined") return;
    const setVar = () => {
      document.documentElement.style.setProperty("--reno-header-h", `${el.offsetHeight}px`);
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--reno-header-h");
    };
  }, [promoOpen]);

  const phone = intake.phone?.replace(/\s/g, "");
  const navLogoUrl = intake.navbarLogoDataUrl?.trim();
  const navLogoH = clampNavLogoHeight(intake.navbarLogoHeightPx);
  const showNavLogoImg = navLogoReady && !!navLogoUrl;
  const variant = resolveSiteVariant(
    intake.businessDescription ?? "",
    intake.siteTemplate ?? "auto",
    intake.companyName ?? ""
  );
  const links = resolveNavbarMenuItems(content.assets, variant);

  return (
    <div ref={shellRef} className="fixed left-0 right-0 top-0 z-[60]">
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          promoOpen ? "max-h-[min(40vh,14rem)] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!promoOpen}
      >
        <div
          className="relative min-h-11 py-2 pl-10 pr-12 text-[10px] font-semibold uppercase leading-snug tracking-[0.12em] text-white sm:py-2.5 sm:text-[11px] md:pl-16 md:pr-14"
          style={{ backgroundColor: "var(--accent)" }}
        >
          <p className="text-center leading-snug">
            Now offering: tailored property maintenance services{" "}
            <a
              href={publishedNavHref(publishedBasePath, "services")}
              className="inline underline decoration-white/40 underline-offset-2 hover:decoration-white"
            >
              Learn more
            </a>
          </p>
          <button
            type="button"
            className="absolute right-1.5 top-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded text-lg leading-none text-white/90 hover:bg-white/10 sm:right-2 sm:top-1/2 sm:-translate-y-1/2 md:right-4"
            onClick={() => setPromoOpen(false)}
            aria-label="Close announcement"
          >
            ×
          </button>
        </div>
      </div>

      <header
        className={`border-b transition-[background-color,box-shadow,border-color,backdrop-filter] duration-300 ${
          scrolled
            ? "border-black/10 bg-white shadow-sm shadow-black/5"
            : "border-transparent bg-transparent shadow-none"
        }`}
      >
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-5 md:px-10">
          <a href={publishedNavHref(publishedBasePath, "hero")} className="group flex min-w-0 items-center gap-2">
            {showNavLogoImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={navLogoUrl}
                alt=""
                className="w-auto max-w-[min(220px,55vw)] shrink-0 object-contain object-left"
                style={{ height: navLogoH }}
              />
            ) : (
              <span
                className="block truncate text-base font-bold uppercase tracking-tight md:text-lg"
                style={{ fontFamily: "var(--b-font)", color: "var(--accent)" }}
              >
                {content.brandName}
              </span>
            )}
          </a>

          <nav className="hidden items-center gap-6 lg:flex xl:gap-8" aria-label="Primary">
            {links.map((l, idx) => (
              <a
                key={`${l.hash}-${idx}`}
                href={publishedNavHref(publishedBasePath, l.hash)}
                className="text-[11px] font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-70"
                style={{ color: "var(--accent)" }}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3 md:gap-3">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="hidden rounded-md border border-current/20 px-3 py-2 text-xs font-semibold sm:inline-flex"
                style={{ color: "var(--accent)" }}
              >
                Call
              </a>
            ) : null}
            <a
              href={publishedNavHref(publishedBasePath, "contact")}
              className="rounded-md px-3 py-2.5 text-xs font-bold text-white shadow-md transition-[filter] hover:brightness-110 sm:px-4 md:px-5 md:text-sm"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Get a quote
            </a>
            <button
              type="button"
              className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-md lg:hidden sm:-mr-1"
              style={{ color: "var(--accent)" }}
              aria-expanded={mobileNavOpen}
              aria-controls="reno-mobile-nav"
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              <MenuIcon open={mobileNavOpen} />
            </button>
          </div>
        </div>
      </header>

      {drawerMounted && (
        <div
          className={`fixed inset-0 z-[70] lg:hidden transition-opacity duration-300 ease-out ${
            drawerVisible ? "opacity-100" : "opacity-0"
          }`}
          id="reno-mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          aria-hidden={!drawerVisible}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Close menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            className={`absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-black/10 bg-white shadow-xl transition-transform duration-300 ease-out will-change-transform ${
              drawerVisible ? "translate-x-0" : "translate-x-full"
            }`}
            style={{ paddingTop: "var(--reno-header-h, 72px)" }}
          >
            <div className="flex flex-1 flex-col gap-0 overflow-y-auto px-5 py-4">
              {links.map((l, idx) => (
                <a
                  key={`${l.hash}-${idx}`}
                  href={publishedNavHref(publishedBasePath, l.hash)}
                  className="border-b border-neutral-200 py-3.5 text-[13px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: "var(--accent)" }}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {l.label}
                </a>
              ))}
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="mt-4 inline-flex items-center justify-center rounded-md border border-current/25 px-4 py-3 text-sm font-semibold"
                  style={{ color: "var(--accent)" }}
                  onClick={() => setMobileNavOpen(false)}
                >
                  Call
                </a>
              ) : null}
              <a
                href={publishedNavHref(publishedBasePath, "contact")}
                className="mt-3 inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-bold text-white"
                style={{ backgroundColor: "var(--accent)" }}
                onClick={() => setMobileNavOpen(false)}
              >
                Get a quote
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
