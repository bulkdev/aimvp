"use client";

import { useMemo, useRef, useState } from "react";
import type { Project, ServiceItem, SiteTheme, SiteTemplateChoice } from "@/types";

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

type SectionKey = "hero" | "services" | "portfolio" | "about" | "booking" | "faq" | "reviews" | "cta" | "payment" | "contact";

const DEFAULT_SECTION_ORDER: SectionKey[] = ["hero", "services", "portfolio", "about", "booking", "faq", "reviews", "cta", "payment", "contact"];
const SECTION_LABELS: Record<SectionKey, string> = {
  hero: "Hero",
  services: "Services",
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

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function OwnerDashboard({ project }: Props) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeService, setActiveService] = useState<number | null>(null);
  const [activeProject, setActiveProject] = useState<number | null>(null);

  const [companyName, setCompanyName] = useState(project.intake.companyName);
  const [siteTemplate, setSiteTemplate] = useState<SiteTemplateChoice>(project.intake.siteTemplate ?? "auto");
  const [customDomain, setCustomDomain] = useState(project.intake.customDomain ?? "");
  const [phone, setPhone] = useState(project.intake.phone ?? "");
  const [city, setCity] = useState(project.intake.city ?? "");
  const [state, setState] = useState(project.intake.state ?? "");
  const [email, setEmail] = useState(project.intake.email ?? "");
  const [address, setAddress] = useState(project.intake.address ?? "");
  const [heroTitle, setHeroTitle] = useState(project.content.hero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(project.content.hero.subtitle);
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
  const [ourWorkVariant, setOurWorkVariant] = useState<"cards" | "minimal-grid" | "split-feature">(
    project.content.assets?.designVariants?.ourWork ?? "cards"
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
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(
    (() => {
      const saved = ((project.content.assets?.sectionOrder as SectionKey[] | undefined) ?? []).filter((k) =>
        DEFAULT_SECTION_ORDER.includes(k)
      );
      return [...saved, ...DEFAULT_SECTION_ORDER.filter((k) => !saved.includes(k))];
    })()
  );
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

  const previewUrl = useMemo(() => `/preview/${project.id}`, [project.id]);

  async function addHeroFiles(files: FileList | null) {
    if (!files?.length) return;
    const urls = await Promise.all(Array.from(files).map(fileToDataUrl));
    setHeroSlides((prev) => [...prev, ...urls]);
  }

  async function setServicePhoto(serviceTitle: string, files: FileList | null) {
    if (!files?.[0]) return;
    const url = await fileToDataUrl(files[0]);
    setServiceImages((prev) => ({ ...prev, [serviceTitle.trim().toLowerCase()]: url }));
  }

  async function addProjectPhotos(projectIdx: number, files: FileList | null) {
    if (!files?.length) return;
    const urls = await Promise.all(Array.from(files).map(fileToDataUrl));
    setProjects((prev) => prev.map((p, i) => (i === projectIdx ? { ...p, photos: [...p.photos, ...urls] } : p)));
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        intake: { ...project.intake, companyName, siteTemplate, customDomain, phone, city, state, email, address },
        content: {
          ...project.content,
          brandName: companyName,
          theme,
          services,
          hero: { ...project.content.hero, title: heroTitle, subtitle: heroSubtitle },
          assets: {
            ...project.content.assets,
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
          },
        },
      };
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");
      setMsg("Saved successfully.");
    } catch {
      setMsg("Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const editingService = activeService !== null ? services[activeService] : null;
  const editingProject = activeProject !== null ? projects[activeProject] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-7">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
            <p className="text-white/60 text-sm">Click cards to edit. No code needed.</p>
          </div>
          <a href={previewUrl} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium">Open Preview</a>
        </div>

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
              <option value="super-service" className="text-slate-900">Template: Super Service — HVAC/plumbing</option>
            </select>
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={state} onChange={(e) => setState(e.target.value)} placeholder="State (e.g. WA)" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          </div>
          <input className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-medium">Section order (drag to reorder)</h2>
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
                className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-sm flex items-center justify-between cursor-move"
              >
                <span>{SECTION_LABELS[key]}</span>
                <span className="text-white/40">::</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/50">Navbar and Footer stay fixed. Disabled sections (booking/payment toggles) are skipped automatically.</p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-medium">Hero</h2>
          <input className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Hero title" />
          <textarea className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-24" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} placeholder="Hero subtitle" />
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
                const works: Array<"cards" | "minimal-grid" | "split-feature"> = ["cards", "minimal-grid", "split-feature"];
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
            <select className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={ourWorkVariant} onChange={(e) => setOurWorkVariant(e.target.value as "cards" | "minimal-grid" | "split-feature")}>
              <option value="cards" className="text-slate-900">Our Work: Cards</option>
              <option value="minimal-grid" className="text-slate-900">Our Work: Minimal grid</option>
              <option value="split-feature" className="text-slate-900">Our Work: Split feature</option>
            </select>
          </div>
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

        <div className="flex items-center gap-3">
          <button type="button" disabled={saving} onClick={save} className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-sm font-medium">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {msg && <span className="text-sm text-white/70">{msg}</span>}
        </div>
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

