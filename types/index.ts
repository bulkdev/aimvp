// ─── Intake Form ────────────────────────────────────────────────────────────

/** Controls layout + theme. "auto" infers from business description (e.g. plumbing keywords). */
export type SiteTemplateChoice =
  | "auto"
  | "default"
  | "plumbing"
  | "plumbing-split"
  | "plumbing-boxed"
  /** Compact slider hero + glass nav (same trade layout as other plumbing templates) */
  | "plumbing-flow"
  /** Multi-trade HVAC/plumbing style: promo bar, Book Online, trade cards, areas grid */
  | "super-service"
  /** Renovation / GC: parallax sections, particle hero, Instagram-style portfolio grid */
  | "renovations";

export interface IntakeFormData {
  companyName: string;
  businessDescription: string;
  customDomain?: string;
  sourceLink?: string;
  importedHeroSlides?: string[];
  importedPortfolioProjects?: string[][];
  importedLogoUrl?: string;
  /** When set, picks the visual template; "auto" uses keyword inference. */
  siteTemplate?: SiteTemplateChoice;
  logoDataUrl?: string; // base64 data URL of uploaded logo
  /** Optional: used by renovations template navbar only (footer still uses logoDataUrl). */
  navbarLogoDataUrl?: string;
  /** Navbar logo height in px (24–96). Renovations template. */
  navbarLogoHeightPx?: number;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  /** US state/region abbreviation (e.g. WA) — combined with city for display and SEO copy */
  state?: string;
  bookingEnabled: boolean;
  paymentEnabled: boolean;
}

// ─── Generated Website Content ───────────────────────────────────────────────

export interface ServiceItem {
  title: string;
  description: string;
  icon: string; // lucide icon name
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface GeneratedSiteContent {
  brandName: string;
  tagline: string;
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaSecondaryText?: string;
  };
  services: ServiceItem[];
  about: {
    heading: string;
    body: string;
    highlights: string[]; // 3 short bullet highlights
  };
  faqs: FaqItem[];
  contact: {
    heading: string;
    subheading: string;
  };
  assets?: {
    heroSlides?: string[];
    portfolioProjects?: string[][];
    serviceCardImages?: Record<string, string>;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      x?: string;
    };
    openingHours?: string[];
    geo?: {
      latitude?: number;
      longitude?: number;
    };
    manualReviews?: {
      reviewerName: string;
      rating: number;
      text: string;
      reviewUrl?: string;
      reviewAge?: string;
      reviewDate?: string;
      avatarLetter?: string;
    }[];
    sectionOrder?: Array<
      | "hero"
      | "services"
      | "stats"
      | "portfolio"
      | "about"
      | "booking"
      | "faq"
      | "reviews"
      | "cta"
      | "payment"
      | "contact"
    >;
    /**
     * Navbar + footer quick links: display label and section anchor.
     * When unset, the active template uses its built-in default list.
     */
    navbarMenuItems?: Array<{
      label: string;
      hash:
        | "hero"
        | "services"
        | "stats"
        | "work"
        | "about"
        | "faq"
        | "reviews"
        | "contact"
        | "booking"
        | "payment"
        | "cta";
    }>;
    /** Scrolling stats strip (e.g. projects completed, reviews, BBB, insured). */
    siteStats?: { label: string; value: string }[];
    layoutVariant?: "standard" | "services-first" | "about-first";
    designVariants?: {
      navbar?: "standard" | "split-bar" | "boxed";
      heroSlideshow?: "fade" | "zoom" | "slide";
      heroCtaPlacement?: "inline" | "stacked" | "bottom-bar";
      /** Our Work / portfolio: masonry (Pinterest-style), uniform 3-col grid, or single-photo slider. Legacy values normalized at runtime. */
      ourWork?: "masonry" | "grid-3" | "slider" | "cards" | "minimal-grid" | "split-feature";
    };
    serviceGroups?: {
      title: string;
      items: string[];
    }[];
    serviceAreas?: string[];
    portfolioEntries?: {
      projectName: string;
      serviceType: string;
      photos: string[];
      review: string;
      rating: number;
    }[];
    /**
     * Home page portfolio / project feed: max items to show before a blurred “+ See more” tile
     * linking to the full `/work` page (when there are more photos or projects than this count).
     */
    portfolioHomePreviewCount?: number;
    /** Plumbing hero eyebrow: text before " · {location}" (e.g. Licensed plumbers). Location always follows intake city/state when set. */
    heroTaglineLead?: string;
    /** Browser tab / bookmark icon (PNG, ICO, or SVG data URL). Set in site admin. */
    faviconDataUrl?: string;
    /**
     * Home page SEO: browser title, meta description, social share image, optional keywords.
     * Unset fields fall back to generated defaults from business name, location, and services.
     */
    siteSeo?: {
      /** `<title>` / og:title / twitter:title */
      metaTitle?: string;
      /** Meta description (~150–160 characters recommended). */
      metaDescription?: string;
      /** Open Graph / Twitter image (URL or data URL). Falls back to first hero slide or logo. */
      ogImageUrl?: string;
      /** Optional comma-separated keywords (`<meta name="keywords">`). */
      keywords?: string;
    };
    /**
     * Renovations template: full-bleed image behind the parallax hero (URL or data URL).
     * When unset, the default subway-tile pattern is used.
     */
    heroParallaxBackgroundUrl?: string;
    /**
     * Optional parallax background image per section (URL or data URL).
     * Used on the one-page site and on standalone SEO subpages; falls back to hero parallax then a default stock image.
     */
    parallaxSectionBackgrounds?: Partial<
      Record<
        | "services"
        | "stats"
        | "portfolio"
        | "about"
        | "faq"
        | "reviews"
        | "cta"
        | "contact"
        | "booking"
        | "payment",
        string
      >
    >;
    /**
     * 0–100: scrim over the **renovations hero** custom parallax image only.
     * Section strips use `parallaxSectionOverlayOpacity` per key (falling back to this for older projects).
     */
    parallaxOverlayOpacity?: number;
    /** @deprecated Prefer `parallaxSectionScopes` per section; used as fallback when a section has no entry. */
    parallaxSectionScope?: "home" | "subpage" | "both";
    /**
     * Per-section parallax scrim strength (0–100). Missing keys fall back to `parallaxOverlayOpacity`, then 100.
     */
    parallaxSectionOverlayOpacity?: Partial<
      Record<
        | "services"
        | "stats"
        | "portfolio"
        | "about"
        | "faq"
        | "reviews"
        | "cta"
        | "contact"
        | "booking"
        | "payment",
        number
      >
    >;
    /**
     * Per-section: show parallax on home one-pager, standalone SEO pages, or both.
     * Missing keys fall back to `parallaxSectionScope`, then `"both"`.
     */
    parallaxSectionScopes?: Partial<
      Record<
        | "services"
        | "stats"
        | "portfolio"
        | "about"
        | "faq"
        | "reviews"
        | "cta"
        | "contact"
        | "booking"
        | "payment",
        "home" | "subpage" | "both"
      >
    >;
  };
  theme: SiteTheme;
}

// ─── Theme / Branding ────────────────────────────────────────────────────────

export interface SiteTheme {
  primaryColor: string;   // hex, e.g. "#1e40af"
  secondaryColor: string; // hex
  accentColor: string;    // hex
  fontHeading: string;    // CSS font-family value
  fontBody: string;
  style: "modern" | "classic" | "bold" | "minimal";
}

// ─── Project (Persistence) ───────────────────────────────────────────────────

export interface Project {
  id: string;
  createdAt: string;       // ISO date string
  updatedAt: string;
  intake: IntakeFormData;
  content: GeneratedSiteContent;
  status: "draft" | "published";
  /** Short public path segment: `/{publicSlug}` instead of `/site/{uuid}`. Lowercase, hyphenated, unique. */
  publicSlug?: string;
  /** Set when the project is created by a logged-in user; gates admin/API access. */
  ownerId?: string;
}

// ─── API Payloads ────────────────────────────────────────────────────────────

export interface GenerateRequest {
  intake: IntakeFormData;
}

export interface GenerateResponse {
  projectId: string;
  content: GeneratedSiteContent;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface EnrichLinkResponse {
  fields: Partial<
    Pick<
      IntakeFormData,
      | "companyName"
      | "businessDescription"
      | "phone"
      | "email"
      | "address"
      | "city"
      | "state"
      | "sourceLink"
      | "importedHeroSlides"
      | "importedPortfolioProjects"
      | "importedLogoUrl"
    >
  >;
  notes?: string[];
}

/** POST /api/google-reviews — import reviews from a Google Maps / Business URL (Places API). */
export type GoogleReviewsImportResponse = {
  reviews: NonNullable<NonNullable<GeneratedSiteContent["assets"]>["manualReviews"]>;
  placeName?: string;
  googleMapsUri?: string;
  notes?: string[];
};
