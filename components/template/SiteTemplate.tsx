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
import StatsSection from "./sections/StatsSection";
import SubpageParallaxBackdrop from "./SubpageParallaxBackdrop";
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
import RenovationsNavbar from "./renovations/RenovationsNavbar";
import RenovationsHero from "./renovations/RenovationsHero";
import RenovationsServicesShowcase from "./renovations/RenovationsServicesShowcase";
import RenovationsInstagramFeed from "./renovations/RenovationsInstagramFeed";
import RenovationsParallaxBand from "./renovations/RenovationsParallaxBand";
import CreatorMembershipTemplate from "./creator/CreatorMembershipTemplate";
import WindowTintLuxuryTemplate from "./window-tint/WindowTintLuxuryTemplate";
import HairDesignStudioTemplate from "./hair-design-studio/HairDesignStudioTemplate";
import { isActiveSubscriber } from "@/lib/creator-membership";
import type { PublishedSubpageSection, SiteSectionKey } from "@/lib/published-subpages";
import { publishedNavHref } from "@/lib/published-nav-hrefs";
import {
  normalizeParallaxOverlayOpacity,
  overlayOpacityForSection,
  parallaxLayerAllowedForKey,
  sectionParallaxImageForContext,
} from "@/lib/parallaxSettings";

interface Props {
  project: Project;
  /** Published SEO: render only this section (navbar + footer still shown). */
  subpage?: PublishedSubpageSection;
  /** Set on live published routes so nav/footer use `/slug/...` instead of `#` anchors. */
  publishedBasePath?: string;
  /** Optional logged-in user id for personalized template rendering. */
  viewerUserId?: string;
}

export default function SiteTemplate({ project, subpage, publishedBasePath, viewerUserId }: Props) {
  const { content, intake } = project;
  const isSubpage = Boolean(subpage);
  const heroParallaxOverlayPct = normalizeParallaxOverlayOpacity(content.assets?.parallaxOverlayOpacity);
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
              ? "grid-3"
              : plumbingPreset === "boxed"
                ? "masonry"
                : "masonry"),
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
  const defaultOrderFromLayout: SiteSectionKey[] =
    layoutVariant === "about-first"
      ? ["hero", "about", "services", "stats", "portfolio", "booking", "faq", "reviews", "cta", "payment", "contact"]
      : layoutVariant === "services-first"
        ? ["hero", "services", "stats", "portfolio", "about", "booking", "faq", "reviews", "cta", "payment", "contact"]
        : ["hero", "services", "stats", "portfolio", "about", "booking", "faq", "reviews", "cta", "payment", "contact"];
  const rawOrder = content.assets?.sectionOrder as SiteSectionKey[] | undefined;
  const allowedSet = new Set<SiteSectionKey>([
    "hero",
    "services",
    "stats",
    "portfolio",
    "about",
    "booking",
    "faq",
    "reviews",
    "cta",
    "payment",
    "contact",
  ]);
  const normalizedOrder: SiteSectionKey[] =
    rawOrder && rawOrder.length > 0 ? rawOrder.filter((k) => allowedSet.has(k)) : defaultOrderFromLayout;
  const sectionMap: Record<SiteSectionKey, React.ReactNode> = {
    hero:
      variant === "renovations" ? (
        <RenovationsHero content={content} intake={intake} parallaxOverlayOpacity={heroParallaxOverlayPct} />
      ) : variant === "superService" ? (
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
    stats: (
      <StatsSection
        content={content}
        siteVariant={variant}
        parallaxImageUrl={sectionParallaxImageForContext(content.assets, "stats", isSubpage)}
        parallaxOverlayOpacity={overlayOpacityForSection(content.assets, "stats")}
      />
    ),
    services:
      variant === "renovations" ? (
        <RenovationsServicesShowcase
          content={content}
          intake={intake}
          parallaxImageUrl={sectionParallaxImageForContext(content.assets, "services", isSubpage)}
          parallaxLayerActive={parallaxLayerAllowedForKey(content.assets, "services", isSubpage)}
          parallaxOverlayOpacity={overlayOpacityForSection(content.assets, "services")}
          layout={content.assets?.designVariants?.renovationsServices ?? "editorial-icons"}
        />
      ) : variant === "superService" ? (
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
    portfolio:
      variant === "renovations" ? (
        <div>
          <RenovationsInstagramFeed
            content={content}
            layoutMode={effectiveDesign?.ourWork}
            publishedBasePath={publishedBasePath}
            standalonePortfolioPage={subpage === "portfolio"}
          />
          <RenovationsParallaxBand
            parallaxOverlayOpacity={overlayOpacityForSection(content.assets, "portfolio")}
          />
        </div>
      ) : (
        <PortfolioSection
          content={content}
          styleVariant={effectiveDesign?.ourWork ?? "masonry"}
          publishedBasePath={publishedBasePath}
          standalonePortfolioPage={subpage === "portfolio"}
        />
      ),
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
        <SuperServiceMembership contactHref={publishedNavHref(publishedBasePath, "contact")} />
      ) : (
        <CtaBanner content={content} intake={intake} contactHref={publishedNavHref(publishedBasePath, "contact")} />
      ),
    payment: intake.paymentEnabled ? <PaymentSection content={content} /> : null,
    contact: <ContactSection content={content} intake={intake} projectId={project.id} />,
  };
  const effectiveOrder: SiteSectionKey[] = subpage ? [subpage] : normalizedOrder;
  /** SEO subpages: append Our Story + contact after the main section (skip duplicates). */
  const standaloneAboutTrail = Boolean(subpage && subpage !== "about");
  const standaloneContactTrail = Boolean(subpage && subpage !== "contact");
  const subpageTrailCount =
    (standaloneAboutTrail ? 1 : 0) + (standaloneContactTrail ? 1 : 0);
  const chatHref = publishedNavHref(publishedBasePath, "contact");
  return (
    <div
      style={{ ...(cssVars as React.CSSProperties), position: "relative" }}
      className={`preview-root${variant === "windowTintLuxury" ? " preview-root--window-tint-luxury" : ""}${variant === "hairDesignStudio" ? " preview-root--hair-design-studio" : ""}`}
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

        /* Admin theme on dark / editorial blocks (replaces hardcoded amber/yellow) */
        .preview-root .theme-accent-muted {
          color: color-mix(in srgb, var(--accent) 72%, white);
        }
        .preview-root .theme-accent-icon {
          color: var(--accent);
          opacity: 0.95;
        }
        .preview-root .theme-accent-border-hover:hover {
          border-color: color-mix(in srgb, var(--accent) 40%, rgba(255, 255, 255, 0.12)) !important;
        }
        .preview-root .theme-accent-gradient-badge {
          background: linear-gradient(
            135deg,
            var(--accent),
            color-mix(in srgb, var(--accent) 50%, var(--secondary))
          );
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

        .preview-root--window-tint-luxury {
          background: #030306 !important;
          color: #e4e4e7;
        }

        .preview-root--hair-design-studio {
          background: #050506 !important;
          color: #e4e4e7;
        }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      {variant === "creatorMembership" ? (
        <CreatorMembershipTemplate
          project={project}
          publishedBasePath={publishedBasePath}
          isSubscriber={isActiveSubscriber(project, viewerUserId)}
        />
      ) : variant === "windowTintLuxury" ? (
        <WindowTintLuxuryTemplate project={project} />
      ) : variant === "hairDesignStudio" ? (
        <HairDesignStudioTemplate project={project} publishedBasePath={publishedBasePath} />
      ) : (
        <>
          {variant === "renovations" ? (
            <RenovationsNavbar content={content} intake={intake} publishedBasePath={publishedBasePath} />
          ) : variant === "superService" ? (
            <>
              <SuperServiceTopBar />
              <SuperServiceNavbar content={content} intake={intake} publishedBasePath={publishedBasePath} />
            </>
          ) : variant === "plumbing" && plumbingPreset === "flow" ? (
            <PlumbingFlowNavbar content={content} intake={intake} publishedBasePath={publishedBasePath} />
          ) : (
            <NavbarSection
              content={content}
              intake={intake}
              isPlumbing={variant === "plumbing"}
              styleVariant={effectiveDesign?.navbar ?? "standard"}
              publishedBasePath={publishedBasePath}
            />
          )}
          {effectiveOrder.map((key, i) => {
            const node = sectionMap[key];
            if (node == null) return null;
            const inner =
              subpage && key !== "hero" ? (
                parallaxLayerAllowedForKey(content.assets, key, true) ? (
                  <SubpageParallaxBackdrop
                    imageUrl={sectionParallaxImageForContext(content.assets, key, true)}
                    overlayOpacity={overlayOpacityForSection(content.assets, key)}
                  >
                    {node}
                  </SubpageParallaxBackdrop>
                ) : (
                  node
                )
              ) : (
                node
              );
            return (
              <ScrollReveal key={key} delayMs={i * 65} variant={key === "hero" ? "hero" : "default"}>
                {inner}
              </ScrollReveal>
            );
          })}
          {standaloneAboutTrail ? (
            <ScrollReveal delayMs={effectiveOrder.length * 65} variant="default">
              {variant === "superService" ? (
                <SuperServiceWhySection content={content} intake={intake} />
              ) : (
                <AboutSection content={content} intake={intake} />
              )}
            </ScrollReveal>
          ) : null}
          {standaloneContactTrail ? (
            <ScrollReveal
              delayMs={(effectiveOrder.length + (standaloneAboutTrail ? 1 : 0)) * 65}
              variant="default"
            >
              <ContactSection content={content} intake={intake} projectId={project.id} />
            </ScrollReveal>
          ) : null}
          {variant === "superService" && !subpage && (
            <ScrollReveal delayMs={normalizedOrder.length * 65}>
              <SuperServiceAreasGrid content={content} />
            </ScrollReveal>
          )}
          <ScrollReveal
            delayMs={
              (effectiveOrder.length +
                (variant === "superService" && !subpage ? 1 : 0) +
                subpageTrailCount) *
              65
            }
          >
            <FooterSection content={content} intake={intake} publishedBasePath={publishedBasePath} />
          </ScrollReveal>
        </>
      )}
      {variant !== "windowTintLuxury" && variant !== "hairDesignStudio" ? (
        <a href={chatHref} className="chat-fab" aria-label="Open chat/contact">
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
      ) : null}
    </div>
  );
}
