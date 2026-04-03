"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMemo, useRef, useState } from "react";
import type { Project, ServiceItem, SiteTheme, SiteTemplateChoice } from "@/types";
import { absoluteUrl, buildPublishedBasePath } from "@/lib/seo";

function initialHeroTaglineLead(project: Project): string {
  const saved = project.content.assets?.heroTaglineLead?.trim();
  if (saved) return saved;
  const parts = project.content.tagline.split("·").map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts.slice(0, -1).join(" · ") : parts[0] || "";
}
import { fileToCompressedDataUrl, fileToFaviconDataUrl } from "@/lib/clientImage";
import type { ParallaxSectionScope } from "@/lib/parallaxSettings";
import { ParallaxSectionBgField } from "@/components/admin/ParallaxSectionBgField";
import SiteLogoEditor from "@/components/admin/SiteLogoEditor";
import GoogleReviewsImportBar from "@/components/admin/GoogleReviewsImportBar";
import ProjectBackupBar from "@/components/admin/ProjectBackupBar";
import {
  normalizePortfolioLayout,
  PORTFOLIO_LAYOUT_OPTIONS,
  type PortfolioLayoutMode,
} from "@/lib/portfolioLayout";
import {
  clampPortfolioHomePreviewCount,
  DEFAULT_PORTFOLIO_HOME_PREVIEW_COUNT,
} from "@/lib/portfolioPreview";

interface Props {
  project: Project;
}

type EditableProject = {
  projectName: string;
  serviceType: string;
  review: string;
  rating: number;
  photos: string[];
};

type ServiceGroup = {
  title: string;
  items: string[];
};

type EditableReview = {
  reviewerName: string;
  rating: number;
  text: string;
  reviewUrl: string;
  reviewAge: string;
  avatarLetter: string;
};

type SiteStatRow = { value: string; label: string };

const DEFAULT_SITE_STATS: SiteStatRow[] = [
  { value: "500+", label: "Projects completed" },
  { value: "4.9", label: "Avg. star rating" },
  { value: "A+", label: "BBB rating" },
  { value: "100%", label: "Licensed & insured" },
  { value: "15+", label: "Years in business" },
];

type ParallaxBgKey =
  | "services"
  | "stats"
  | "portfolio"
  | "about"
  | "faq"
  | "reviews"
  | "cta"
  | "contact"
  | "booking"
  | "payment";

const PARALLAX_BG_LABELS: Record<ParallaxBgKey, string> = {
  services: "Services / capabilities",
  stats: "Stats strip (homepage #stats)",
  portfolio: "Our work / portfolio",
  about: "About",
  faq: "FAQ",
  reviews: "Reviews",
  cta: "CTA banner",
  contact: "Contact",
  booking: "Booking",
  payment: "Payment",
};

function initialParallaxBgs(project: Project): Record<ParallaxBgKey, string> {
  const m = project.content.assets?.parallaxSectionBackgrounds ?? {};
  return {
    services: m.services ?? "",
    stats: m.stats ?? "",
    portfolio: m.portfolio ?? "",
    about: m.about ?? "",
    faq: m.faq ?? "",
    reviews: m.reviews ?? "",
    cta: m.cta ?? "",
    contact: m.contact ?? "",
    booking: m.booking ?? "",
    payment: m.payment ?? "",
  };
}

function initialParallaxSectionOverlays(project: Project): Record<ParallaxBgKey, number> {
  const per = project.content.assets?.parallaxSectionOverlayOpacity ?? {};
  const legacy = project.content.assets?.parallaxOverlayOpacity ?? 100;
  const n = (k: ParallaxBgKey) =>
    Math.min(100, Math.max(0, per[k] ?? legacy));
  return {
    services: n("services"),
    stats: n("stats"),
    portfolio: n("portfolio"),
    about: n("about"),
    faq: n("faq"),
    reviews: n("reviews"),
    cta: n("cta"),
    contact: n("contact"),
    booking: n("booking"),
    payment: n("payment"),
  };
}

function initialParallaxSectionScopes(project: Project): Record<ParallaxBgKey, ParallaxSectionScope> {
  const per = project.content.assets?.parallaxSectionScopes ?? {};
  const legacy = project.content.assets?.parallaxSectionScope ?? "both";
  const s = (k: ParallaxBgKey) => per[k] ?? legacy;
  return {
    services: s("services"),
    stats: s("stats"),
    portfolio: s("portfolio"),
    about: s("about"),
    faq: s("faq"),
    reviews: s("reviews"),
    cta: s("cta"),
    contact: s("contact"),
    booking: s("booking"),
    payment: s("payment"),
  };
}

type SectionKey =
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
  | "contact";

const DEFAULT_SECTION_ORDER: SectionKey[] = [
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
];
const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Hero",
  services: "Services",
  stats: "Stats strip",
  portfolio: "Our Work",
  about: "About",
  booking: "Booking",
  faq: "FAQ",
  reviews: "Reviews",
  cta: "CTA Banner",
  payment: "Payment",
  contact: "Contact",
};

const FONT_OPTIONS = [
  { label: "DM Sans", value: "'DM Sans', system-ui, sans-serif" },
  { label: "Inter", value: "'Inter', system-ui, sans-serif" },
  { label: "Poppins", value: "'Poppins', system-ui, sans-serif" },
  { label: "Montserrat", value: "'Montserrat', system-ui, sans-serif" },
  { label: "Lato", value: "'Lato', system-ui, sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif" },
  { label: "Merriweather", value: "'Merriweather', Georgia, serif" },
  { label: "Oswald", value: "'Oswald', 'Arial Narrow', sans-serif" },
];

const LAYOUT_OPTIONS: Array<{ label: string; value: "standard" | "services-first" | "about-first" }> = [
  { label: "Standard", value: "standard" },
  { label: "Services First", value: "services-first" },
  { label: "About First", value: "about-first" },
];

function randHex(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;
}

function randomTheme(): SiteTheme {
  const fonts = FONT_OPTIONS.map((f) => f.value);
  const styles: SiteTheme["style"][] = ["modern", "classic", "bold", "minimal"];
  return {
    primaryColor: randHex(),
    secondaryColor: randHex(),
    accentColor: randHex(),
    fontHeading: fonts[Math.floor(Math.random() * fonts.length)],
    fontBody: fonts[Math.floor(Math.random() * fonts.length)],
    style: styles[Math.floor(Math.random() * styles.length)],
  };
}

export default function OwnerDashboard({ project }: Props) {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeService, setActiveService] = useState<number | null>(null);
  const [activeProject, setActiveProject] = useState<number | null>(null);

  const [companyName, setCompanyName] = useState(project.intake.companyName);
  const [siteTemplate, setSiteTemplate] = useState<SiteTemplateChoice>(project.intake.siteTemplate ?? "auto");
  const [customDomain, setCustomDomain] = useState(project.intake.customDomain ?? "");
  const [publicSlug, setPublicSlug] = useState(project.publicSlug ?? "");
  const [phone, setPhone] = useState(project.intake.phone ?? "");
  const [city, setCity] = useState(project.intake.city ?? "");
  const [state, setState] = useState(project.intake.state ?? "");
  const [email, setEmail] = useState(project.intake.email ?? "");
  const [address, setAddress] = useState(project.intake.address ?? "");
  const [logoDataUrl, setLogoDataUrl] = useState(project.intake.logoDataUrl ?? "");
  const [navbarLogoDataUrl, setNavbarLogoDataUrl] = useState(project.intake.navbarLogoDataUrl ?? "");
  const [navbarLogoHeightPx, setNavbarLogoHeightPx] = useState(project.intake.navbarLogoHeightPx ?? 40);
  const [heroParallaxBackgroundUrl, setHeroParallaxBackgroundUrl] = useState(
    project.content.assets?.heroParallaxBackgroundUrl ?? ""
  );
  const parallaxUploadRef = useRef<HTMLInputElement>(null);
  const [heroTitle, setHeroTitle] = useState(project.content.hero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(project.content.hero.subtitle);
  const [heroTaglineLead, setHeroTaglineLead] = useState(() => initialHeroTaglineLead(project));
  const [heroSlides, setHeroSlides] = useState<string[]>(project.content.assets?.heroSlides ?? []);
  const [theme, setTheme] = useState<SiteTheme>(project.content.theme);
  const [layoutVariant, setLayoutVariant] = useState<"standard" | "services-first" | "about-first">(
    project.content.assets?.layoutVariant ?? "standard"
  );
  const [navbarVariant, setNavbarVariant] = useState<"standard" | "split-bar" | "boxed">(
    project.content.assets?.designVariants?.navbar ?? "standard"
  );
  const [heroSlideshowVariant, setHeroSlideshowVariant] = useState<"fade" | "zoom" | "slide">(
    project.content.assets?.designVariants?.heroSlideshow ?? "fade"
  );
  const [heroCtaPlacement, setHeroCtaPlacement] = useState<"inline" | "stacked" | "bottom-bar">(
    project.content.assets?.designVariants?.heroCtaPlacement ?? "inline"
  );
  const [ourWorkVariant, setOurWorkVariant] = useState<PortfolioLayoutMode>(() =>
    normalizePortfolioLayout(project.content.assets?.designVariants?.ourWork)
  );
  const [portfolioHomePreviewCount, setPortfolioHomePreviewCount] = useState(
    () => project.content.assets?.portfolioHomePreviewCount ?? DEFAULT_PORTFOLIO_HOME_PREVIEW_COUNT
  );
  const [services, setServices] = useState<ServiceItem[]>(project.content.services);
  const [serviceImages, setServiceImages] = useState<Record<string, string>>(project.content.assets?.serviceCardImages ?? {});
  const [facebookUrl, setFacebookUrl] = useState(project.content.assets?.socialLinks?.facebook ?? "");
  const [instagramUrl, setInstagramUrl] = useState(project.content.assets?.socialLinks?.instagram ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(project.content.assets?.socialLinks?.linkedin ?? "");
  const [xUrl, setXUrl] = useState(project.content.assets?.socialLinks?.x ?? "");
  const [manualReviews, setManualReviews] = useState<EditableReview[]>(
    project.content.assets?.manualReviews?.length
      ? project.content.assets.manualReviews.map((r) => ({
          reviewerName: r.reviewerName || "",
          rating: r.rating || 5,
          text: r.text || "",
          reviewUrl: r.reviewUrl || "",
          reviewAge: r.reviewAge || "",
          avatarLetter: r.avatarLetter || "",
        }))
      : [
          {
            reviewerName: "Stacey L.",
            rating: 5,
            text: "Fast response, clear pricing, and clean work.",
            reviewUrl: "",
            reviewAge: "3 months ago",
            avatarLetter: "S",
          },
        ]
  );
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(() => {
    const saved = ((project.content.assets?.sectionOrder as SectionKey[] | undefined) ?? []).filter((k) =>
      DEFAULT_SECTION_ORDER.includes(k)
    );
    return saved.length > 0 ? saved : [...DEFAULT_SECTION_ORDER];
  });
  const [siteStats, setSiteStats] = useState<SiteStatRow[]>(
    project.content.assets?.siteStats?.length
      ? project.content.assets.siteStats.map((s) => ({ value: s.value || "", label: s.label || "" }))
      : [...DEFAULT_SITE_STATS]
  );
  const [parallaxSectionBgs, setParallaxSectionBgs] = useState<Record<ParallaxBgKey, string>>(() =>
    initialParallaxBgs(project)
  );
  const [parallaxOverlayOpacity, setParallaxOverlayOpacity] = useState(() =>
    Math.min(100, Math.max(0, project.content.assets?.parallaxOverlayOpacity ?? 100))
  );
  const [parallaxSectionOverlays, setParallaxSectionOverlays] = useState<Record<ParallaxBgKey, number>>(() =>
    initialParallaxSectionOverlays(project)
  );
  const [parallaxSectionScopes, setParallaxSectionScopes] = useState<
    Record<ParallaxBgKey, ParallaxSectionScope>
  >(() => initialParallaxSectionScopes(project));
  const [draggingSection, setDraggingSection] = useState<SectionKey | null>(null);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>(
    project.content.assets?.serviceGroups?.length
      ? project.content.assets.serviceGroups
      : [
          {
            title: "Plumbing Services",
            items: [
              "Residential Plumbing",
              "Water Heater",
              "Repiping & Pipe Repair",
              "Drain Cleaning",
              "Sewer Repair",
              "Sump Pumps",
              "Water Filtration",
              "Leak Detection",
            ],
          },
          {
            title: "Heating Services",
            items: [
              "Boilers",
              "Heating Maintenance",
              "Oil-to-Gas Conversion",
              "Commercial Heating",
              "Carbon Monoxide Testing",
            ],
          },
        ]
  );
  const [serviceAreasText, setServiceAreasText] = useState(
    (project.content.assets?.serviceAreas ?? []).join("\n")
  );
  const [projects, setProjects] = useState<EditableProject[]>(
    project.content.assets?.portfolioEntries?.length
      ? project.content.assets.portfolioEntries.map((p) => ({ ...p }))
      : []
  );
  const heroUploadRef = useRef<HTMLInputElement>(null);
  const serviceUploadRef = useRef<HTMLInputElement>(null);
  const projectUploadRef = useRef<HTMLInputElement>(null);
  const faviconUploadRef = useRef<HTMLInputElement>(null);

  const [faviconDataUrl, setFaviconDataUrl] = useState(project.content.assets?.faviconDataUrl ?? "");

  const previewUrl = useMemo(() => `/preview/${project.id}`, [project.id]);
  const customerSiteUrl = useMemo(() => {
    const path = buildPublishedBasePath({ id: project.id, publicSlug: publicSlug.trim() || undefined });
    return absoluteUrl(path);
  }, [project.id, publicSlug]);

  async function addHeroFiles(files: FileList | null) {
    if (!files?.length) return;
    const urls = await Promise.all(Array.from(files).map((f) => fileToCompressedDataUrl(f)));
    setHeroSlides((prev) => [...prev, ...urls]);
  }

  async function setServicePhoto(serviceTitle: string, files: FileList | null) {
    if (!files?.[0]) return;
    const url = await fileToCompressedDataUrl(files[0]);
    setServiceImages((prev) => ({ ...prev, [serviceTitle.trim().toLowerCase()]: url }));
  }

  async function addProjectPhotos(projectIdx: number, files: FileList | null) {
    if (!files?.length) return;
    const urls = await Promise.all(Array.from(files).map((f) => fileToCompressedDataUrl(f)));
    setProjects((prev) => prev.map((p, i) => (i === projectIdx ? { ...p, photos: [...p.photos, ...urls] } : p)));
  }

  const [portfolioScrapeUrl, setPortfolioScrapeUrl] = useState("");
  const [portfolioScrapeMax, setPortfolioScrapeMax] = useState(8);
  const [portfolioScraping, setPortfolioScraping] = useState(false);

  async function runPortfolioScrapeFromUrl() {
    if (activeProject === null) return;
    if (!portfolioScrapeUrl.trim()) {
      setMsg("Enter a page URL to scrape images from.");
      return;
    }
    setPortfolioScraping(true);
    setMsg("");
    try {
      const res = await fetch("/api/scrape-portfolio-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: portfolioScrapeUrl.trim(), maxImages: portfolioScrapeMax }),
      });
      const data = (await res.json()) as { error?: string; images?: string[] };
      if (!res.ok) throw new Error(data?.error || "Could not scrape images.");
      const images = data.images ?? [];
      setProjects((prev) =>
        prev.map((p, i) => (i === activeProject ? { ...p, photos: [...p.photos, ...images] } : p))
      );
      setMsg(`Added ${images.length} image(s). Save to persist.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Scrape failed.");
    } finally {
      setPortfolioScraping(false);
    }
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const { faviconDataUrl: _prevFav, ...assetRest } = project.content.assets ?? {};
      void _prevFav;
      const nextIntake = { ...project.intake, companyName, siteTemplate, customDomain, phone, city, state, email, address };
      const logoTrim = logoDataUrl.trim();
      if (logoTrim) nextIntake.logoDataUrl = logoTrim;
      else delete nextIntake.logoDataUrl;

      const navLogoTrim = navbarLogoDataUrl.trim();
      if (navLogoTrim) nextIntake.navbarLogoDataUrl = navLogoTrim;
      else delete nextIntake.navbarLogoDataUrl;
      nextIntake.navbarLogoHeightPx = Math.min(96, Math.max(24, Math.round(Number(navbarLogoHeightPx) || 40)));

      const payload = {
        intake: nextIntake,
        content: {
          ...project.content,
          brandName: companyName,
          theme,
          services,
          hero: { ...project.content.hero, title: heroTitle, subtitle: heroSubtitle },
          assets: {
            ...assetRest,
            heroTaglineLead: heroTaglineLead.trim(),
            heroSlides,
            serviceCardImages: serviceImages,
            socialLinks: {
              facebook: facebookUrl.trim(),
              instagram: instagramUrl.trim(),
              linkedin: linkedinUrl.trim(),
              x: xUrl.trim(),
            },
            manualReviews: manualReviews
              .map((r) => ({
                reviewerName: r.reviewerName.trim(),
                rating: Math.max(1, Math.min(5, r.rating || 5)),
                text: r.text.trim(),
                reviewUrl: r.reviewUrl.trim(),
                reviewAge: r.reviewAge.trim(),
                avatarLetter: (r.avatarLetter || r.reviewerName.charAt(0)).trim().charAt(0).toUpperCase(),
              }))
              .filter((r) => r.reviewerName && r.text),
            sectionOrder,
            siteStats: siteStats
              .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
              .filter((s) => s.value && s.label),
            parallaxSectionBackgrounds: (() => {
              const o: Partial<Record<ParallaxBgKey, string>> = {};
              (Object.keys(parallaxSectionBgs) as ParallaxBgKey[]).forEach((k) => {
                const v = parallaxSectionBgs[k].trim();
                if (v) o[k] = v;
              });
              return Object.keys(o).length > 0 ? o : undefined;
            })(),
            parallaxOverlayOpacity: parallaxOverlayOpacity,
            parallaxSectionOverlayOpacity: (() => {
              const o: Partial<Record<ParallaxBgKey, number>> = {};
              (Object.keys(parallaxSectionOverlays) as ParallaxBgKey[]).forEach((k) => {
                const v = parallaxSectionOverlays[k];
                if (v !== 100) o[k] = v;
              });
              return Object.keys(o).length > 0 ? o : undefined;
            })(),
            parallaxSectionScopes: (() => {
              const o: Partial<Record<ParallaxBgKey, ParallaxSectionScope>> = {};
              (Object.keys(parallaxSectionScopes) as ParallaxBgKey[]).forEach((k) => {
                const v = parallaxSectionScopes[k];
                if (v !== "both") o[k] = v;
              });
              return Object.keys(o).length > 0 ? o : undefined;
            })(),
            layoutVariant,
            designVariants: {
              navbar: navbarVariant,
              heroSlideshow: heroSlideshowVariant,
              heroCtaPlacement,
              ourWork: ourWorkVariant,
            },
            serviceGroups: serviceGroups
              .map((g) => ({
                title: g.title.trim(),
                items: g.items.map((item) => item.trim()).filter(Boolean),
              }))
              .filter((g) => g.title && g.items.length > 0),
            serviceAreas: serviceAreasText
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
            portfolioEntries: projects,
            portfolioProjects: projects.map((p) => p.photos),
            ...(faviconDataUrl.trim() ? { faviconDataUrl: faviconDataUrl.trim() } : {}),
            heroParallaxBackgroundUrl: heroParallaxBackgroundUrl.trim() || undefined,
            portfolioHomePreviewCount: clampPortfolioHomePreviewCount(portfolioHomePreviewCount),
          },
        },
        publicSlug: publicSlug.trim(),
      };
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        if (res.status === 413) throw new Error("Payload too large — use fewer or smaller images.");
        const errJson = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errJson?.error || "Failed");
      }
      setMsg("Saved successfully.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const editingService = activeService !== null ? services[activeService] : null;
  const editingProject = activeProject !== null ? projects[activeProject] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-10 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-semibold truncate">Owner Dashboard</h1>
            <p className="text-white/55 text-xs hidden sm:block">Click cards to edit. No code needed.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            {session?.user?.isMainAdmin ? (
              <Link
                href="/admin"
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-amber-400/40 text-amber-100 hover:bg-amber-500/10 text-xs md:text-sm font-medium"
              >
                All sites
              </Link>
            ) : null}
            <a
              href={previewUrl}
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs md:text-sm font-medium"
            >
              Open Preview
            </a>
            <a
              href={customerSiteUrl}
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-white/20 hover:bg-white/10 text-xs md:text-sm font-medium"
            >
              Open public site
            </a>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="px-4 py-1.5 md:px-5 md:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-xs md:text-sm font-medium shrink-0"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {msg ? (
              <span className="text-xs md:text-sm text-white/70 max-w-[200px] md:max-w-xs truncate" title={msg}>
                {msg}
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-7">
        <ProjectBackupBar projectId={project.id} />

        <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-medium">Business info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="Custom domain (e.g. www.business.com)" />
            <select
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
              value={siteTemplate}
              onChange={(e) => setSiteTemplate(e.target.value as SiteTemplateChoice)}
            >
              <option value="auto" className="text-slate-900">Template: Auto</option>
              <option value="default" className="text-slate-900">Template: Default</option>
              <option value="plumbing" className="text-slate-900">Template: Plumbing — Classic nav & hero</option>
              <option value="plumbing-split" className="text-slate-900">Template: Plumbing — Split bar nav & hero</option>
              <option value="plumbing-boxed" className="text-slate-900">Template: Plumbing — Boxed glass nav & hero</option>
              <option value="plumbing-flow" className="text-slate-900">Template: Plumbing — Flow (compact slider + glass nav)</option>
              <option value="super-service" className="text-slate-900">Template: Super Service — HVAC/plumbing</option>
              <option value="renovations" className="text-slate-900">Template: Renovations — Parallax, particles, portfolio</option>
            </select>
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={state} onChange={(e) => setState(e.target.value)} placeholder="State (e.g. WA)" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          </div>
          <input className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
          <div className="space-y-1">
            <input
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2"
              value={publicSlug}
              onChange={(e) => setPublicSlug(e.target.value)}
              placeholder="Short public URL slug (e.g. bro-plumbing) — empty = long /site/… link"
            />
            <p className="text-xs text-white/55">
              Customer link:{" "}
              <a href={customerSiteUrl} className="text-sky-400 hover:underline" target="_blank" rel="noreferrer">
                {customerSiteUrl}
              </a>
            </p>
          </div>
        </section>

        <SiteLogoEditor
          value={logoDataUrl || undefined}
          onChange={(next) => setLogoDataUrl(next ?? "")}
          brandLabel={companyName || "Site"}
          onError={setMsg}
        />

        {siteTemplate === "renovations" ? (
          <section className="rounded-xl border border-emerald-500/25 bg-emerald-950/20 p-4 space-y-4">
            <h2 className="text-sm font-medium text-emerald-100">Renovations template — top bar & parallax</h2>
            <SiteLogoEditor
              value={navbarLogoDataUrl || undefined}
              onChange={(next) => setNavbarLogoDataUrl(next ?? "")}
              brandLabel={`${companyName || "Site"} navbar`}
              onError={setMsg}
              heading="Navbar logo (renovations only)"
              description="Optional. Separate from the site logo used in the footer. Shown in the fixed top bar."
            />
            <label className="block text-xs text-white/70">
              Navbar logo height (px, 24–96)
              <input
                type="number"
                min={24}
                max={96}
                className="mt-1 w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2"
                value={navbarLogoHeightPx}
                onChange={(e) => setNavbarLogoHeightPx(Number(e.target.value))}
              />
            </label>
            <div>
              <p className="text-xs text-white/60 mb-2">Hero parallax background (optional)</p>
              <p className="text-[11px] text-white/40 mb-2">
                Replaces the default subway-tile pattern behind the hero. URL or upload.
              </p>
              <input
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm mb-2"
                value={heroParallaxBackgroundUrl}
                onChange={(e) => setHeroParallaxBackgroundUrl(e.target.value)}
                placeholder="https://… or leave empty for tile pattern"
              />
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs"
                  onClick={() => parallaxUploadRef.current?.click()}
                >
                  Upload image
                </button>
                {heroParallaxBackgroundUrl ? (
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-white/20 text-xs text-rose-300"
                    onClick={() => setHeroParallaxBackgroundUrl("")}
                  >
                    Clear parallax image
                  </button>
                ) : null}
                <input
                  ref={parallaxUploadRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      setHeroParallaxBackgroundUrl(await fileToCompressedDataUrl(f, { maxEdge: 2560, quality: 0.88 }));
                    } catch (err) {
                      setMsg(err instanceof Error ? err.message : "Could not read image.");
                    }
                    e.target.value = "";
                  }}
                />
              </div>
              {heroParallaxBackgroundUrl ? (
                <div className="mt-3 rounded-lg overflow-hidden border border-white/10 max-h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroParallaxBackgroundUrl} alt="" className="w-full h-auto object-cover object-center max-h-32" />
                </div>
              ) : null}
              <label className="mt-3 block text-xs text-white/70">
                Hero parallax overlay strength (0–100%)
                <input
                  type="range"
                  min={0}
                  max={100}
                  className="mt-1 block w-full accent-sky-500"
                  value={parallaxOverlayOpacity}
                  onChange={(e) => setParallaxOverlayOpacity(Number(e.target.value))}
                />
                <span className="text-white/50">{parallaxOverlayOpacity}%</span>
              </label>
            </div>
          </section>
        ) : null}

        <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-medium">Site favicon (browser tab)</h2>
          <p className="text-xs text-white/50">
            Shown on preview, public URL, and service area pages. PNG, JPG, SVG, or ICO — kept small for fast loads.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {faviconDataUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={faviconDataUrl} alt="" className="w-12 h-12 rounded object-contain bg-white border border-white/10" />
                <button
                  type="button"
                  onClick={() => faviconUploadRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => setFaviconDataUrl("")}
                  className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs text-rose-300"
                >
                  Remove
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => faviconUploadRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs"
              >
                Upload favicon
              </button>
            )}
            <input
              ref={faviconUploadRef}
              type="file"
              accept="image/*,.ico"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  setFaviconDataUrl(await fileToFaviconDataUrl(f));
                } catch (err) {
                  setMsg(err instanceof Error ? err.message : "Invalid favicon file.");
                }
                e.target.value = "";
              }}
            />
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium">Sections on site (drag to reorder)</h2>
            <button
              type="button"
              className="text-xs text-sky-300 hover:underline"
              onClick={() => setSectionOrder([...DEFAULT_SECTION_ORDER])}
            >
              Reset to default list
            </button>
          </div>
          <div className="space-y-2">
            {sectionOrder.map((key) => (
              <div
                key={key}
                draggable
                onDragStart={() => setDraggingSection(key)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (!draggingSection || draggingSection === key) return;
                  setSectionOrder((prev) => {
                    const next = [...prev];
                    const from = next.indexOf(draggingSection);
                    const to = next.indexOf(key);
                    if (from === -1 || to === -1) return prev;
                    next.splice(from, 1);
                    next.splice(to, 0, draggingSection);
                    return next;
                  });
                  setDraggingSection(null);
                }}
                onDragEnd={() => setDraggingSection(null)}
                className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-sm flex items-center justify-between gap-2 cursor-move"
              >
                <span>{SECTION_LABELS[key]}</span>
                <span className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={key === "hero"}
                    title={key === "hero" ? "Hero cannot be removed" : "Remove section from page"}
                    className="text-xs text-rose-300 hover:underline disabled:opacity-30 disabled:no-underline"
                    onClick={() => key !== "hero" && setSectionOrder((prev) => prev.filter((k) => k !== key))}
                  >
                    Remove
                  </button>
                  <span className="text-white/40">::</span>
                </span>
              </div>
            ))}
          </div>
          {DEFAULT_SECTION_ORDER.some((k) => !sectionOrder.includes(k)) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {DEFAULT_SECTION_ORDER.filter((k) => !sectionOrder.includes(k)).map((k) => (
                <button
                  key={k}
                  type="button"
                  className="text-xs rounded-md border border-white/20 bg-white/5 px-2 py-1 hover:bg-white/10"
                  onClick={() => setSectionOrder((prev) => [...prev, k])}
                >
                  + {SECTION_LABELS[k]}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-white/50">
            Removed sections no longer appear on the live site. Booking/Payment still respect intake toggles.
          </p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-medium">Scrolling stats strip</h2>
          <p className="text-xs text-white/50">Shown when the &quot;Stats strip&quot; section is enabled.</p>
          <div className="space-y-2">
            {siteStats.map((row, idx) => (
              <div key={idx} className="flex flex-wrap gap-2 items-center">
                <input
                  className="bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm w-24"
                  value={row.value}
                  onChange={(e) =>
                    setSiteStats((prev) => prev.map((r, i) => (i === idx ? { ...r, value: e.target.value } : r)))
                  }
                  placeholder="500+"
                />
                <input
                  className="flex-1 min-w-[140px] bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm"
                  value={row.label}
                  onChange={(e) =>
                    setSiteStats((prev) => prev.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r)))
                  }
                  placeholder="Projects completed"
                />
                <button
                  type="button"
                  className="text-xs text-rose-300"
                  onClick={() => setSiteStats((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-xs text-sky-300 hover:underline"
              onClick={() => setSiteStats((prev) => [...prev, { value: "", label: "" }])}
            >
              + Add stat
            </button>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-medium">Section parallax backgrounds</h2>
          <p className="text-xs text-white/50">
            Per section: image, overlay strength, and home vs standalone pages. Empty images use the hero parallax image,
            then defaults. Stats use <span className="text-white/70">#stats</span> on the homepage — no /stats page.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(Object.keys(PARALLAX_BG_LABELS) as ParallaxBgKey[]).map((key) => (
              <ParallaxSectionBgField
                key={key}
                label={PARALLAX_BG_LABELS[key]}
                value={parallaxSectionBgs[key]}
                onChange={(next) => setParallaxSectionBgs((prev) => ({ ...prev, [key]: next }))}
                overlayOpacity={parallaxSectionOverlays[key]}
                onOverlayOpacityChange={(next) =>
                  setParallaxSectionOverlays((prev) => ({ ...prev, [key]: next }))
                }
                scope={parallaxSectionScopes[key]}
                onScopeChange={(next) => setParallaxSectionScopes((prev) => ({ ...prev, [key]: next }))}
                onError={setMsg}
              />
            ))}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-medium">Hero</h2>
          <input className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Hero title" />
          <textarea className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-24" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Hero subtitle" />
          <input
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2"
            value={heroTaglineLead}
            onChange={(e) => setHeroTaglineLead(e.target.value)}
            placeholder="Hero tagline lead (e.g. Licensed plumbers — before city/state)"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Slideshow photos</span>
            <div>
              <input
                ref={heroUploadRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => void addHeroFiles(e.target.files)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => heroUploadRef.current?.click()}
                className="px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-xs font-medium"
              >
                Add Images
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {heroSlides.map((src, idx) => (
              <button key={idx} type="button" className="relative" onClick={() => setHeroSlides((prev) => prev.filter((_, i) => i !== idx))}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Hero ${idx + 1}`} className="h-24 w-full object-cover rounded-lg border border-white/10" />
                <span className="absolute top-1 right-1 bg-black/70 text-[10px] px-1 rounded">Remove</span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Theme & layout</h2>
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs"
              onClick={() => {
                setTheme(randomTheme());
                const layouts = LAYOUT_OPTIONS.map((o) => o.value);
                setLayoutVariant(layouts[Math.floor(Math.random() * layouts.length)]);
                const navs: Array<"standard" | "split-bar" | "boxed"> = ["standard", "split-bar", "boxed"];
                const slides: Array<"fade" | "zoom" | "slide"> = ["fade", "zoom", "slide"];
                const ctas: Array<"inline" | "stacked" | "bottom-bar"> = ["inline", "stacked", "bottom-bar"];
                const works: PortfolioLayoutMode[] = ["masonry", "grid-3", "slider"];
                setNavbarVariant(navs[Math.floor(Math.random() * navs.length)]);
                setHeroSlideshowVariant(slides[Math.floor(Math.random() * slides.length)]);
                setHeroCtaPlacement(ctas[Math.floor(Math.random() * ctas.length)]);
                setOurWorkVariant(works[Math.floor(Math.random() * works.length)]);
              }}
            >
              Randomize style
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-xs text-white/70">
              Primary color
              <input type="color" className="mt-1 h-10 w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1" value={theme.primaryColor} onChange={(e) => setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))} />
            </label>
            <label className="text-xs text-white/70">
              Secondary color
              <input type="color" className="mt-1 h-10 w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1" value={theme.secondaryColor} onChange={(e) => setTheme((prev) => ({ ...prev, secondaryColor: e.target.value }))} />
            </label>
            <label className="text-xs text-white/70">
              Accent color
              <input type="color" className="mt-1 h-10 w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1" value={theme.accentColor} onChange={(e) => setTheme((prev) => ({ ...prev, accentColor: e.target.value }))} />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={theme.fontHeading} onChange={(e) => setTheme((prev) => ({ ...prev, fontHeading: e.target.value }))}>
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value} className="text-slate-900">
                  Heading: {font.label}
                </option>
              ))}
            </select>
            <select className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={theme.fontBody} onChange={(e) => setTheme((prev) => ({ ...prev, fontBody: e.target.value }))}>
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value} className="text-slate-900">
                  Body: {font.label}
                </option>
              ))}
            </select>
            <select className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={layoutVariant} onChange={(e) => setLayoutVariant(e.target.value as "standard" | "services-first" | "about-first")}>
              {LAYOUT_OPTIONS.map((layout) => (
                <option key={layout.value} value={layout.value} className="text-slate-900">
                  Layout: {layout.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <select className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={navbarVariant} onChange={(e) => setNavbarVariant(e.target.value as "standard" | "split-bar" | "boxed")}>
              <option value="standard" className="text-slate-900">Navbar: Standard</option>
              <option value="split-bar" className="text-slate-900">Navbar: Split bar</option>
              <option value="boxed" className="text-slate-900">Navbar: Boxed glass</option>
            </select>
            <select className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={heroSlideshowVariant} onChange={(e) => setHeroSlideshowVariant(e.target.value as "fade" | "zoom" | "slide")}>
              <option value="fade" className="text-slate-900">Slideshow: Fade</option>
              <option value="zoom" className="text-slate-900">Slideshow: Zoom</option>
              <option value="slide" className="text-slate-900">Slideshow: Slide</option>
            </select>
            <select className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={heroCtaPlacement} onChange={(e) => setHeroCtaPlacement(e.target.value as "inline" | "stacked" | "bottom-bar")}>
              <option value="inline" className="text-slate-900">Hero CTA: Inline</option>
              <option value="stacked" className="text-slate-900">Hero CTA: Stacked</option>
              <option value="bottom-bar" className="text-slate-900">Hero CTA: Bottom bar</option>
            </select>
            <select
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
              value={ourWorkVariant}
              onChange={(e) => setOurWorkVariant(e.target.value as PortfolioLayoutMode)}
            >
              {PORTFOLIO_LAYOUT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="text-slate-900">
                  Our Work: {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-[11px] text-white/60">
              <span>Photos / projects to show on home (before blurred “See more”)</span>
              <input
                type="number"
                min={1}
                max={48}
                className="w-24 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white"
                value={portfolioHomePreviewCount}
                onChange={(e) =>
                  setPortfolioHomePreviewCount(
                    Math.min(48, Math.max(1, Math.round(Number(e.target.value) || DEFAULT_PORTFOLIO_HOME_PREVIEW_COUNT)))
                  )
                }
              />
            </label>
          </div>
          <p className="mt-1 text-[11px] text-white/45">
            Our Work: masonry columns, 3-column grid, or one-photo slider — matches preview and published site. Extra
            items link to the full portfolio page.
          </p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-medium">Social links (footer)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="Facebook URL" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="Instagram URL" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="LinkedIn URL" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={xUrl} onChange={(e) => setXUrl(e.target.value)} placeholder="X / Twitter URL" />
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Reviews section</h2>
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs"
              onClick={() =>
                setManualReviews((prev) => [
                  ...prev,
                  { reviewerName: "New Reviewer", rating: 5, text: "", reviewUrl: "", reviewAge: "", avatarLetter: "R" },
                ])
              }
            >
              Add Review
            </button>
          </div>
          <GoogleReviewsImportBar
            onImported={(rows) => setManualReviews((prev) => [...prev, ...rows])}
          />
          <div className="space-y-3">
            {manualReviews.map((review, idx) => (
              <div key={idx} className="border border-white/10 rounded-lg p-3 grid grid-cols-1 md:grid-cols-6 gap-2">
                <input
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 md:col-span-2"
                  value={review.reviewerName}
                  onChange={(e) => setManualReviews((prev) => prev.map((r, i) => (i === idx ? { ...r, reviewerName: e.target.value } : r)))}
                  placeholder="Reviewer name"
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  step={0.5}
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
                  value={String(review.rating)}
                  onChange={(e) => setManualReviews((prev) => prev.map((r, i) => (i === idx ? { ...r, rating: Number(e.target.value) } : r)))}
                  placeholder="Rating"
                />
                <input
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
                  value={review.reviewAge}
                  onChange={(e) => setManualReviews((prev) => prev.map((r, i) => (i === idx ? { ...r, reviewAge: e.target.value } : r)))}
                  placeholder="Age (e.g. 3 months ago)"
                />
                <input
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
                  value={review.avatarLetter}
                  onChange={(e) => setManualReviews((prev) => prev.map((r, i) => (i === idx ? { ...r, avatarLetter: e.target.value } : r)))}
                  placeholder="Avatar letter"
                />
                <button
                  type="button"
                  className="px-2 py-1 rounded bg-red-600/80 hover:bg-red-500 text-xs"
                  onClick={() => setManualReviews((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
                <textarea
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 md:col-span-4 h-20"
                  value={review.text}
                  onChange={(e) => setManualReviews((prev) => prev.map((r, i) => (i === idx ? { ...r, text: e.target.value } : r)))}
                  placeholder="Review text"
                />
                <input
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 md:col-span-2"
                  value={review.reviewUrl}
                  onChange={(e) => setManualReviews((prev) => prev.map((r, i) => (i === idx ? { ...r, reviewUrl: e.target.value } : r)))}
                  placeholder="Original review URL"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Areas We Serve</h2>
          </div>
          <textarea
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-24"
            value={serviceAreasText}
            onChange={(e) => setServiceAreasText(e.target.value)}
            placeholder="One area per line"
          />
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Service groups (text-only section)</h2>
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs"
              onClick={() =>
                setServiceGroups((prev) => [...prev, { title: "New Service Group", items: ["New Service"] }])
              }
            >
              Add Group
            </button>
          </div>
          <div className="space-y-3">
            {serviceGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="border border-white/10 rounded-lg p-3 space-y-2">
                <input
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2"
                  value={group.title}
                  onChange={(e) =>
                    setServiceGroups((prev) =>
                      prev.map((g, i) => (i === groupIdx ? { ...g, title: e.target.value } : g))
                    )
                  }
                  placeholder="Group title"
                />
                <textarea
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-24"
                  value={group.items.join("\n")}
                  onChange={(e) =>
                    setServiceGroups((prev) =>
                      prev.map((g, i) => (i === groupIdx ? { ...g, items: e.target.value.split("\n") } : g))
                    )
                  }
                  placeholder="One service per line"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-2 py-1 rounded bg-red-600/80 hover:bg-red-500 text-xs"
                    onClick={() => setServiceGroups((prev) => prev.filter((_, i) => i !== groupIdx))}
                  >
                    Remove Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Services</h2>
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs"
              onClick={() => {
                setServices((prev) => [...prev, { title: "New Service", description: "", icon: "Wrench" }]);
                setActiveService(services.length);
              }}
            >
              Add Service
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {services.map((s, idx) => (
              <button key={idx} type="button" onClick={() => setActiveService(idx)} className="relative rounded-xl overflow-hidden border border-white/15 hover:border-white/35 transition-all text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={serviceImages[s.title.trim().toLowerCase()] || "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=80"} alt={s.title} className="h-44 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/10" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-xs text-white/75 line-clamp-2">{s.description || "Click to edit"}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Our work projects</h2>
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs"
              onClick={() =>
                setProjects((prev) => [...prev, { projectName: "New Project", serviceType: services[0]?.title ?? "Service", review: "", rating: 5, photos: [] }])
              }
            >
              Add Project
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((p, idx) => (
              <button key={idx} type="button" onClick={() => setActiveProject(idx)} className="relative h-64 rounded-xl overflow-hidden border border-white/15 hover:border-white/35 transition-all text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.photos[0] || "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=80"} alt={p.projectName} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/20" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-semibold">{p.projectName}</p>
                  <p className="text-xs text-white/80">{p.serviceType}</p>
                  <p className="text-xs text-white/70 line-clamp-2 mt-1">{p.review || "Click to edit review/photos"}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {editingService && activeService !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/60" onClick={() => setActiveService(null)} />
          <div className="relative w-full max-w-xl bg-slate-900 border border-white/15 rounded-xl p-4 space-y-3">
            <h3 className="text-lg font-semibold">Edit Service</h3>
            <input className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={editingService.title} onChange={(e) => setServices((prev) => prev.map((s, i) => (i === activeService ? { ...s, title: e.target.value } : s)))} />
            <textarea className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-24" value={editingService.description} onChange={(e) => setServices((prev) => prev.map((s, i) => (i === activeService ? { ...s, description: e.target.value } : s)))} />
            <div className="flex items-center justify-between">
              <div>
                <input
                  ref={serviceUploadRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => void setServicePhoto(editingService.title, e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => serviceUploadRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-xs font-medium"
                >
                  Add Image
                </button>
              </div>
              <button type="button" className="px-3 py-1.5 rounded bg-red-600/80 hover:bg-red-500 text-xs" onClick={() => { setServices((prev) => prev.filter((_, i) => i !== activeService)); setActiveService(null); }}>Remove</button>
            </div>
            <div className="flex justify-end">
              <button type="button" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm" onClick={() => setActiveService(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {editingProject && activeProject !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-black/60" onClick={() => setActiveProject(null)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/15 rounded-xl p-4 space-y-3 max-h-[85vh] overflow-auto">
            <h3 className="text-lg font-semibold">Edit Project</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={editingProject.projectName} onChange={(e) => setProjects((prev) => prev.map((p, i) => (i === activeProject ? { ...p, projectName: e.target.value } : p)))} />
              <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={editingProject.serviceType} onChange={(e) => setProjects((prev) => prev.map((p, i) => (i === activeProject ? { ...p, serviceType: e.target.value } : p)))} />
              <select className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={String(editingProject.rating)} onChange={(e) => setProjects((prev) => prev.map((p, i) => (i === activeProject ? { ...p, rating: Number(e.target.value) } : p)))}>
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r} className="text-slate-900">{r} stars</option>)}
              </select>
            </div>
            <textarea className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-24" value={editingProject.review} onChange={(e) => setProjects((prev) => prev.map((p, i) => (i === activeProject ? { ...p, review: e.target.value } : p)))} />
            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2">
              <p className="text-xs text-white/60">Import images from a web page</p>
              <input
                className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-sm"
                placeholder="https://example.com/gallery-or-project-page"
                value={portfolioScrapeUrl}
                onChange={(e) => setPortfolioScrapeUrl(e.target.value)}
              />
              <div className="flex flex-wrap items-end gap-3">
                <label className="text-xs text-white/60">
                  Max images
                  <input
                    type="number"
                    min={1}
                    max={24}
                    className="mt-1 block w-24 bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm"
                    value={portfolioScrapeMax}
                    onChange={(e) =>
                      setPortfolioScrapeMax(Math.min(24, Math.max(1, Number(e.target.value) || 8)))
                    }
                  />
                </label>
                <button
                  type="button"
                  disabled={portfolioScraping}
                  onClick={() => void runPortfolioScrapeFromUrl()}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-xs font-medium"
                >
                  {portfolioScraping ? "Scraping…" : "Scrape images"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <input
                  ref={projectUploadRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => void addProjectPhotos(activeProject, e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => projectUploadRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-xs font-medium"
                >
                  Add Images
                </button>
              </div>
              <button type="button" className="px-3 py-1.5 rounded bg-red-600/80 hover:bg-red-500 text-xs" onClick={() => { setProjects((prev) => prev.filter((_, i) => i !== activeProject)); setActiveProject(null); }}>Remove Project</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {editingProject.photos.map((src, photoIdx) => (
                <div key={photoIdx} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Project ${photoIdx + 1}`} className="h-20 w-full object-cover rounded border border-white/10" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded"
                    onClick={() =>
                      setProjects((prev) =>
                        prev.map((p, i) =>
                          i === activeProject ? { ...p, photos: p.photos.filter((_, j) => j !== photoIdx) } : p
                        )
                      )
                    }
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button type="button" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-sm" onClick={() => setActiveProject(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

