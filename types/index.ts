// ─── Intake Form ────────────────────────────────────────────────────────────

/** Controls layout + theme. "auto" infers from business description (e.g. plumbing keywords). */
export type SiteTemplateChoice = "auto" | "default" | "plumbing";

export interface IntakeFormData {
  companyName: string;
  businessDescription: string;
  sourceLink?: string;
  importedHeroSlides?: string[];
  importedPortfolioProjects?: string[][];
  importedLogoUrl?: string;
  /** When set, picks the visual template; "auto" uses keyword inference. */
  siteTemplate?: SiteTemplateChoice;
  logoDataUrl?: string; // base64 data URL of uploaded logo
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
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
    portfolioEntries?: {
      projectName: string;
      serviceType: string;
      photos: string[];
      review: string;
      rating: number;
    }[];
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
      | "sourceLink"
      | "importedHeroSlides"
      | "importedPortfolioProjects"
      | "importedLogoUrl"
    >
  >;
  notes?: string[];
}
