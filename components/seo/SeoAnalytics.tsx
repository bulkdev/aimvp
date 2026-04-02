"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export default function SeoAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    const pagePath = pathname || "/";
    if (window.gtag) {
      window.gtag("event", "page_view", { page_path: pagePath });
    } else if (window.dataLayer) {
      window.dataLayer.push({ event: "page_view", page_path: pagePath });
    }
  }, [pathname]);

  useEffect(() => {
    const onLead = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, unknown>>).detail || {};
      if (window.gtag) {
        window.gtag("event", "generate_lead", { ...detail });
      } else if (window.dataLayer) {
        window.dataLayer.push({ event: "generate_lead", ...detail });
      }
    };
    window.addEventListener("lead_submit", onLead as EventListener);
    return () => window.removeEventListener("lead_submit", onLead as EventListener);
  }, []);

  return null;
}
