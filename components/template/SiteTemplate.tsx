import React from "react";
import type { Project } from "@/types";
import { buildThemeCssVars } from "@/lib/utils";
import { resolveSiteVariant } from "@/lib/siteVariant";
import { normalizeNap } from "@/lib/seo";
import NavbarSection from "./sections/NavbarSection";
import HeroSection from "./sections/HeroSection";
import PlumbingHeroSection from "./sections/PlumbingHeroSection";
import PlumbingFlowHeroSection from "./sections/plumbing-flow/PlumbingFlowHeroSection";
import PlumbingFlowNavbar from "./sections/plumbing-flow/PlumbingFlowNavbar";
import ServicesSection from "./sections/ServicesSection";
import PortfolioSection from "./sections/PortfolioSection";
import AboutSection from "./sections/AboutSection";
import FaqSection from "./sections/FaqSection";
import ContactSection from "./sections/ContactSection";
import BookingSection from "./sections/BookingSection";
import PaymentSection from "./sections/PaymentSection";
import FooterSection from "./sections/FooterSection";
import CtaBanner from "./sections/CtaBanner";
import GoogleReviewsSection from "./sections/GoogleReviewsSection";
import {
  SuperServiceTopBar,
  SuperServiceNavbar,
  SuperServiceHero,
  SuperServiceTradeCards,
  SuperServiceWhySection,
  SuperServiceMembership,
  SuperServiceAreasGrid,
} from "./sections/SuperServiceSections";
import SeoAnalytics from "@/components/seo/SeoAnalytics";
import ScrollReveal from "./ScrollReveal";

interface Props {
  project: Project;
}

export default function SiteTemplate({ project }: Props) {
  const { content, intake } = project;
  const cssVars = buildThemeCssVars(content.theme);
  const design = content.assets?.designVariants;
  const variant = resolveSiteVariant(
    intake.businessDescription,
    intake.siteTemplate ?? "auto",
    intake.companyName
  );
  const canonicalUrl = intake.customDomain
    ? intake.customDomain.startsWith("http://") || intake.customDomain.startsWith("https://")
      ? intake.customDomain
      : `https://${intake.customDomain}`
    : undefined;
  const plumbingPreset =
    intake.siteTemplate === "plumbing-split"
      ? "split"
      : intake.siteTemplate === "plumbing-boxed"
        ? "boxed"
        : intake.siteTemplate === "plumbing-flow"
          ? "flow"
          : "classic";
  const presetLayoutVariant =
    plumbingPreset === "split"
      ? "services-first"
      : plumbingPreset === "boxed"
        ? "about-first"
        : plumbingPreset === "flow"
          ? "services-first"
          : "standard";
  const layoutVariant =
    variant === "plumbing"
      ? content.assets?.layoutVariant ?? presetLayoutVariant
      : content.assets?.layoutVariant ?? "standard";
  const effectiveDesign =
    variant === "plumbing"
      ? {
          navbar:
            design?.navbar ??
            (plumbingPreset === "split"
              ? "split-bar"
              : plumbingPreset === "boxed"
                ? "boxed"
                : "standard"),
          heroSlideshow:
            design?.heroSlideshow ??
            (plumbingPreset === "split"
              ? "slide"
              : plumbingPreset === "boxed"
                ? "zoom"
                : "fade"),
          heroCtaPlacement:
            design?.heroCtaPlacement ??
            (plumbingPreset === "split"
              ? "bottom-bar"
              : plumbingPreset === "boxed"
                ? "stacked"
                : "inline"),
          ourWork:
            design?.ourWork ??
            (plumbingPreset === "split"
              ? "minimal-grid"
              : plumbingPreset === "boxed"
                ? "split-feature"
                : "cards"),
        }
      : design;
  const nap = normalizeNap(intake);
  const manualReviews = (content.assets?.manualReviews || []).filter((r) => r.reviewerName?.trim() && r.text?.trim());
  const aggregateRating =
    manualReviews.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: (manualReviews.reduce((sum, r) => sum + Math.max(1, Math.min(5, r.rating || 5)), 0) / manualReviews.length).toFixed(1),
          reviewCount: manualReviews.length,
        }
      : undefined;
  const reviewEntities =
    manualReviews.length > 0
      ? manualReviews.map((r) => ({
          "@type": "Review",
          author: { "@type": "Person", name: r.reviewerName.trim() },
          reviewRating: { "@type": "Rating", ratingValue: Math.max(1, Math.min(5, r.rating || 5)), bestRating: 5 },
          reviewBody: r.text.trim(),
          datePublished: r.reviewDate || undefined,
        }))
      : undefined;
  const serviceCatalog = content.services
    .map((s) => s.title.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((serviceName) => ({
      "@type": "Service",
      name: serviceName,
      areaServed: (content.assets?.serviceAreas || []).slice(0, 20),
      provider: {
        "@type": variant === "plumbing" ? "Plumber" : "LocalBusiness",
        name: content.brandName,
      },
    }));
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": variant === "plumbing" ? "Plumber" : "LocalBusiness",
    name: content.brandName,
    description: intake.businessDescription || content.hero.subtitle,
    url: canonicalUrl,
    telephone: nap.phone,
    email: nap.email,
    address:
      nap.streetAddress || nap.city
        ? {
            "@type": "PostalAddress",
            streetAddress: nap.streetAddress || undefined,
            addressLocality: nap.addressLocality || undefined,
            addressRegion: nap.addressRegion || undefined,
          }
        : undefined,
    geo:
      typeof content.assets?.geo?.latitude === "number" && typeof content.assets?.geo?.longitude === "number"
        ? {
            "@type": "GeoCoordinates",
            latitude: content.assets.geo.latitude,
            longitude: content.assets.geo.longitude,
          }
        : undefined,
    openingHoursSpecification:
      content.assets?.openingHours?.length
        ? content.assets.openingHours.map((entry) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: entry.split(" ").slice(0, -1).join(" "),
            opens: entry.includes("-") ? entry.split("-")[0]?.trim() : undefined,
            closes: entry.includes("-") ? entry.split("-")[1]?.trim() : undefined,
          }))
        : undefined,
    areaServed: (content.assets?.serviceAreas || []).map((area) => ({
      "@type": "City",
      name: area,
    })),
    priceRange: "$$",
    aggregateRating,
    review: reviewEntities,
    hasOfferCatalog: serviceCatalog.length
      ? {
          "@type": "OfferCatalog",
          name: "Services",
          itemListElement: serviceCatalog,
        }
      : undefined,
    sameAs: Object.values(content.assets?.socialLinks || {}).filter(Boolean),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: content.brandName,
    url: canonicalUrl,
  };
  type SectionKey =
    | "hero"
    | "services"
    | "portfolio"
    | "about"
    | "booking"
    | "faq"
    | "reviews"
    | "cta"
    | "payment"
    | "contact";
  const defaultOrderFromLayout: SectionKey[] =
    layoutVariant === "about-first"
      ? ["hero", "about", "services", "portfolio", "booking", "faq", "reviews", "cta", "payment", "contact"]
      : layoutVariant === "services-first"
        ? ["hero", "services", "portfolio", "about", "booking", "faq", "reviews", "cta", "payment", "contact"]
        : ["hero", "services", "portfolio", "about", "booking", "faq", "reviews", "cta", "payment", "contact"];
  const rawOrder = (content.assets?.sectionOrder as SectionKey[] | undefined) ?? defaultOrderFromLayout;
  const allowedSet = new Set<SectionKey>(["hero", "services", "portfolio", "about", "booking", "faq", "reviews", "cta", "payment", "contact"]);
  const normalizedOrder: SectionKey[] = [
    ...rawOrder.filter((k) => allowedSet.has(k)),
    ...defaultOrderFromLayout.filter((k) => !rawOrder.includes(k)),
  ];
  const sectionMap: Record<SectionKey, React.ReactNode> = {
    hero:
      variant === "superService" ? (
        <SuperServiceHero content={content} intake={intake} />
      ) : variant === "plumbing" && plumbingPreset === "flow" ? (
        <PlumbingFlowHeroSection
          content={content}
          intake={intake}
          slideshowVariant={effectiveDesign?.heroSlideshow ?? "fade"}
        />
      ) : variant === "plumbing" ? (
        <PlumbingHeroSection
          content={content}
          intake={intake}
          slideshowVariant={effectiveDesign?.heroSlideshow ?? "fade"}
          ctaPlacement={effectiveDesign?.heroCtaPlacement ?? "inline"}
        />
      ) : (
        <HeroSection content={content} intake={intake} />
      ),
    services:
      variant === "superService" ? (
        <SuperServiceTradeCards content={content} intake={intake} />
      ) : (
        <ServicesSection
          content={content}
          intake={intake}
          isPlumbing={variant === "plumbing"}
          plumbingFlow={variant === "plumbing" && plumbingPreset === "flow"}
          linkProject={project}
        />
      ),
    portfolio: <PortfolioSection content={content} styleVariant={effectiveDesign?.ourWork ?? "cards"} />,
    about:
      variant === "superService" ? (
        <SuperServiceWhySection content={content} intake={intake} />
      ) : (
        <AboutSection content={content} intake={intake} />
      ),
    booking: intake.bookingEnabled ? <BookingSection content={content} /> : null,
    faq: <FaqSection content={content} />,
    reviews: <GoogleReviewsSection content={content} />,
    cta:
      variant === "superService" ? (
        <SuperServiceMembership />
      ) : (
        <CtaBanner content={content} intake={intake} />
      ),
    payment: intake.paymentEnabled ? <PaymentSection content={content} /> : null,
    contact: <ContactSection content={content} intake={intake} projectId={project.id} />,
  };
  return (
    <div
      style={{ ...(cssVars as React.CSSProperties), position: "relative" }}
      className="preview-root"
    >
      <SeoAnalytics />
      {/* Google Fonts for the selected theme */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Lato:wght@300;400;700&family=Oswald:wght@400;500;600&family=Nunito:wght@400;600;700&family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&display=swap');

        .preview-root {
          --primary: var(--color-primary, #0f172a);
          --secondary: var(--color-secondary, #1e3a5f);
          --accent: var(--color-accent, #3b82f6);
          --h-font: var(--font-heading, 'Playfair Display', Georgia, serif);
          --b-font: var(--font-body, 'DM Sans', system-ui, sans-serif);

          font-family: var(--b-font);
          color: #1a1a2a;
          background: #ffffff;
        }

        .preview-root h1,
        .preview-root h2,
        .preview-root h3,
        .preview-root h4 {
          font-family: var(--h-font);
        }

        .btn-primary {
          background: var(--accent);
          color: white;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          display: inline-block;
          transition: all 0.2s;
          text-decoration: none;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }

        .btn-outline {
          background: transparent;
          color: var(--accent);
          padding: 13px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          display: inline-block;
          transition: all 0.2s;
          text-decoration: none;
          border: 2px solid var(--accent);
          cursor: pointer;
        }
        .btn-outline:hover { background: var(--accent); color: white; }

        .section-label {
          font-family: var(--b-font);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          display: block;
          margin-bottom: 12px;
        }

        .accent-bar {
          width: 48px;
          height: 3px;
          background: var(--accent);
          border-radius: 2px;
          margin: 16px 0 24px;
        }

        .chat-fab {
          position: fixed;
          right: 16px;
          bottom: max(16px, env(safe-area-inset-bottom));
          width: 56px;
          height: 56px;
          border-radius: 999px;
          border: 0;
          background: var(--accent);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.28);
          z-index: 70;
          text-decoration: none;
          transition: transform 150ms ease, filter 150ms ease;
        }

        .chat-fab:hover {
          transform: translateY(-1px) scale(1.03);
          filter: brightness(1.05);
        }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <>
        {variant === "superService" ? (
          <>
            <SuperServiceTopBar />
            <SuperServiceNavbar content={content} intake={intake} />
          </>
        ) : variant === "plumbing" && plumbingPreset === "flow" ? (
          <PlumbingFlowNavbar content={content} intake={intake} />
        ) : (
          <NavbarSection
            content={content}
            intake={intake}
            isPlumbing={variant === "plumbing"}
            styleVariant={effectiveDesign?.navbar ?? "standard"}
          />
        )}
        {normalizedOrder.map((key, i) => {
          const node = sectionMap[key];
          if (node == null) return null;
          return (
            <ScrollReveal key={key} delayMs={i * 65} variant={key === "hero" ? "hero" : "default"}>
              {node}
            </ScrollReveal>
          );
        })}
        {variant === "superService" && (
          <ScrollReveal delayMs={normalizedOrder.length * 65}>
            <SuperServiceAreasGrid content={content} />
          </ScrollReveal>
        )}
        <ScrollReveal delayMs={(normalizedOrder.length + (variant === "superService" ? 1 : 0)) * 65}>
          <FooterSection content={content} intake={intake} />
        </ScrollReveal>
      </>
      <a href="#contact" className="chat-fab" aria-label="Open chat/contact">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 9.5h10M7 13h6m-7 7l-3 1.5L4.5 18H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}
