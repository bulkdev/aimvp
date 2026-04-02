"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

const MOBILE_MAX = "(max-width: 1023px)";

interface Props {
  children: ReactNode;
  /** Extra delay after entering view (stagger) */
  delayMs?: number;
  /** Hero / first screen: slightly subtler motion */
  variant?: "default" | "hero";
  className?: string;
}

/**
 * Scroll-triggered reveal on mobile only: scale + lift with slight overshoot.
 * Desktop: no animation (avoids blank first paint).
 * Respects `prefers-reduced-motion`.
 */
export default function ScrollReveal({ children, delayMs = 0, variant = "default", className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  /** When false, render as static block (desktop / reduced motion). */
  const [animate, setAnimate] = useState(false);
  const [revealed, setRevealed] = useState(true);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia(MOBILE_MAX).matches;

    if (!mobile || reduced) {
      setAnimate(false);
      setRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el) {
      setAnimate(false);
      setRevealed(true);
      return;
    }

    setAnimate(true);

    const vh = window.innerHeight || 0;
    const pad = 32;
    const measure = () => {
      const r = el.getBoundingClientRect();
      return r.top < vh - pad && r.bottom > pad;
    };

    if (measure()) {
      setRevealed(true);
      return;
    }

    setRevealed(false);

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0, rootMargin: "80px 0px 120px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const translate = variant === "hero" ? "28px" : "44px";
  const scaleFrom = variant === "hero" ? 0.97 : 0.92;

  const show = !animate || revealed;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        width: "100%",
        opacity: show ? 1 : 0,
        transform: show ? "translate3d(0,0,0) scale(1)" : `translate3d(0, ${translate}, 0) scale(${scaleFrom})`,
        transformOrigin: "50% 80%",
        transitionProperty: animate ? "opacity, transform" : "none",
        transitionDuration: animate && revealed ? "0.88s" : "0s",
        transitionDelay: animate && revealed ? `${delayMs}ms` : "0ms",
        transitionTimingFunction: animate && revealed ? "cubic-bezier(0.22, 1.45, 0.36, 1)" : "ease-out",
        willChange: animate && !revealed ? "opacity, transform" : "auto",
      }}
    >
      {children}
    </div>
  );
}
