"use client";

import { useMemo, useState } from "react";
import type { Project, ServiceItem, SiteTheme, SiteTemplateChoice } from "@/types";

interface Props { project: Project; }

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
  const heading = fonts[Math.floor(Math.random() * fonts.length)];
  const body = fonts[Math.floor(Math.random() * fonts.length)];
  const styles: SiteTheme["style"][] = ["modern", "classic", "bold", "minimal"];
  return {
    primaryColor: randHex(),
    secondaryColor: randHex(),
    accentColor: randHex(),
    fontHeading: heading,
    fontBody: body,
    style: styles[Math.floor(Math.random() * styles.length)],
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Failed to read image"));
    r.readAsDataURL(file);
  });
}

export default function AdminEditor({ project }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string>("");

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
      ? project.content.assets.portfolioEntries.map((p) => ({
          projectName: p.projectName,
          serviceType: p.serviceType,
          review: p.review,
          rating: p.rating,
          photos: p.photos,
        }))
      : [
          {
            projectName: "Project 1",
            serviceType: project.content.services[0]?.title ?? "Service",
            review: "Great work and clear communication from start to finish.",
            rating: 5,
            photos: project.content.assets?.portfolioProjects?.[0] ?? [],
          },
        ]
  );

  const previewUrl = useMemo(() => `/preview/${project.id}`, [project.id]);

  async function onSave() {
    setIsSaving(true);
    setMessage("");
    try {
      const safeServices = services
        .map((s) => ({ ...s, title: s.title.trim(), description: s.description.trim() }))
        .filter((s) => s.title && s.description);

      const payload = {
        intake: {
          ...project.intake,
          companyName,
          siteTemplate,
          customDomain,
          phone,
          city,
          state,
          email,
          address,
        },
        content: {
          ...project.content,
          brandName: companyName,
          theme,
          services: safeServices,
          hero: {
            ...project.content.hero,
            title: heroTitle,
            subtitle: heroSubtitle,
          },
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
            portfolioProjects: projects.map((p) => p.photos).filter((photos) => photos.length > 0),
            portfolioEntries: projects.map((p) => ({
              projectName: p.projectName.trim() || "Project",
              serviceType: p.serviceType.trim() || "Service",
              review: p.review.trim() || "Great service.",
              rating: Math.max(1, Math.min(5, p.rating || 5)),
              photos: p.photos,
            })),
          },
        },
      };

      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save");
      setMessage("Saved. Refresh preview to see updates.");
    } catch {
      setMessage("Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  async function addHeroSlides(files: FileList | null) {
    if (!files?.length) return;
    const urls = await Promise.all(Array.from(files).map(fileToDataUrl));
    setHeroSlides((prev) => [...prev, ...urls]);
  }

  async function setServiceImage(serviceTitle: string, files: FileList | null) {
    if (!files?.[0]) return;
    const dataUrl = await fileToDataUrl(files[0]);
    setServiceImages((prev) => ({ ...prev, [serviceTitle.trim().toLowerCase()]: dataUrl }));
  }

  async function addProjectPhotos(projectIdx: number, files: FileList | null) {
    if (!files?.length) return;
    const urls = await Promise.all(Array.from(files).map(fileToDataUrl));
    setProjects((prev) =>
      prev.map((project, idx) =>
        idx === projectIdx ? { ...project, photos: [...project.photos, ...urls] } : project
      )
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Site Owner Dashboard</h1>
            <p className="text-white/60 text-sm">Customize this generated site for your customer.</p>
          </div>
          <a href={previewUrl} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium">
            Open Preview
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={companyName} onChange={(e)=>setCompanyName(e.target.value)} placeholder="Company name" />
          <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={customDomain} onChange={(e)=>setCustomDomain(e.target.value)} placeholder="Custom domain (e.g. www.business.com)" />
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
          </select>
          <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" />
          <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={city} onChange={(e)=>setCity(e.target.value)} placeholder="City" />
          <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={state} onChange={(e)=>setState(e.target.value)} placeholder="State (e.g. WA)" />
          <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        </div>
        <input className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Address" />

        <input className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={heroTitle} onChange={(e)=>setHeroTitle(e.target.value)} placeholder="Hero title" />
        <textarea className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-24" value={heroSubtitle} onChange={(e)=>setHeroSubtitle(e.target.value)} placeholder="Hero subtitle" />

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Theme & layout</p>
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
              <input
                type="color"
                className="mt-1 h-10 w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1"
                value={theme.primaryColor}
                onChange={(e) => setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))}
              />
            </label>
            <label className="text-xs text-white/70">
              Secondary color
              <input
                type="color"
                className="mt-1 h-10 w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1"
                value={theme.secondaryColor}
                onChange={(e) => setTheme((prev) => ({ ...prev, secondaryColor: e.target.value }))}
              />
            </label>
            <label className="text-xs text-white/70">
              Accent color
              <input
                type="color"
                className="mt-1 h-10 w-full bg-white/5 border border-white/15 rounded-lg px-2 py-1"
                value={theme.accentColor}
                onChange={(e) => setTheme((prev) => ({ ...prev, accentColor: e.target.value }))}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
              value={theme.fontHeading}
              onChange={(e) => setTheme((prev) => ({ ...prev, fontHeading: e.target.value }))}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value} className="text-slate-900">
                  Heading: {font.label}
                </option>
              ))}
            </select>
            <select
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
              value={theme.fontBody}
              onChange={(e) => setTheme((prev) => ({ ...prev, fontBody: e.target.value }))}
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font.value} value={font.value} className="text-slate-900">
                  Body: {font.label}
                </option>
              ))}
            </select>
            <select
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
              value={layoutVariant}
              onChange={(e) => setLayoutVariant(e.target.value as "standard" | "services-first" | "about-first")}
            >
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
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium">Section order (drag to reorder)</p>
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
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Hero slideshow photos</p>
            <input type="file" accept="image/*" multiple onChange={(e) => void addHeroSlides(e.target.files)} className="text-xs" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {heroSlides.map((src, idx) => (
              <div key={`${idx}-${src.slice(0, 20)}`} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Hero ${idx + 1}`} className="h-24 w-full object-cover rounded-lg border border-white/10" />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded"
                  onClick={() => setHeroSlides((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Social links (footer)</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              placeholder="Facebook URL"
            />
            <input
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="Instagram URL"
            />
            <input
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="LinkedIn URL"
            />
            <input
              className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
              value={xUrl}
              onChange={(e) => setXUrl(e.target.value)}
              placeholder="X / Twitter URL"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Reviews section</p>
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
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Areas We Serve</p>
          </div>
          <textarea
            className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-24"
            value={serviceAreasText}
            onChange={(e) => setServiceAreasText(e.target.value)}
            placeholder="One area per line (e.g. Lynn, MA)"
          />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Service groups (text-only section)</p>
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
                  placeholder="Group title (e.g. Plumbing Services)"
                />
                <textarea
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-24"
                  value={group.items.join("\n")}
                  onChange={(e) =>
                    setServiceGroups((prev) =>
                      prev.map((g, i) =>
                        i === groupIdx ? { ...g, items: e.target.value.split("\n") } : g
                      )
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
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Services</p>
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs"
              onClick={() => setServices((prev) => [...prev, { title: "New Service", description: "", icon: "Wrench" }])}
            >
              Add Service
            </button>
          </div>
          <div className="space-y-3">
            {services.map((service, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 border border-white/10 rounded-lg p-3">
                <input
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
                  value={service.title}
                  onChange={(e) =>
                    setServices((prev) => prev.map((s, i) => (i === idx ? { ...s, title: e.target.value } : s)))
                  }
                  placeholder="Service title"
                />
                <input
                  className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 md:col-span-2"
                  value={service.description}
                  onChange={(e) =>
                    setServices((prev) => prev.map((s, i) => (i === idx ? { ...s, description: e.target.value } : s)))
                  }
                  placeholder="Service description"
                />
                <div className="flex gap-2">
                  <input type="file" accept="image/*" onChange={(e) => void setServiceImage(service.title, e.target.files)} className="text-xs w-full" />
                  <button
                    type="button"
                    className="px-2 py-1 rounded bg-red-600/80 hover:bg-red-500 text-xs"
                    onClick={() => setServices((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium">Our work projects</p>
            <button
              type="button"
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs"
              onClick={() =>
                setProjects((prev) => [
                  ...prev,
                  { projectName: "New Project", serviceType: services[0]?.title ?? "Service", review: "", rating: 5, photos: [] },
                ])
              }
            >
              Add Project
            </button>
          </div>

          <div className="space-y-4">
            {projects.map((projectItem, idx) => (
              <div key={idx} className="border border-white/10 rounded-lg p-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
                    value={projectItem.projectName}
                    onChange={(e) =>
                      setProjects((prev) => prev.map((p, i) => (i === idx ? { ...p, projectName: e.target.value } : p)))
                    }
                    placeholder="Project name"
                  />
                  <input
                    className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
                    value={projectItem.serviceType}
                    onChange={(e) =>
                      setProjects((prev) => prev.map((p, i) => (i === idx ? { ...p, serviceType: e.target.value } : p)))
                    }
                    placeholder="Service type"
                  />
                  <select
                    className="bg-white/5 border border-white/15 rounded-lg px-3 py-2"
                    value={String(projectItem.rating)}
                    onChange={(e) =>
                      setProjects((prev) =>
                        prev.map((p, i) => (i === idx ? { ...p, rating: Number(e.target.value) } : p))
                      )
                    }
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r} className="text-slate-900">
                        {r} stars
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-20"
                  value={projectItem.review}
                  onChange={(e) =>
                    setProjects((prev) => prev.map((p, i) => (i === idx ? { ...p, review: e.target.value } : p)))
                  }
                  placeholder="Customer review"
                />
                <div className="flex items-center justify-between">
                  <input type="file" accept="image/*" multiple onChange={(e) => void addProjectPhotos(idx, e.target.files)} className="text-xs" />
                  <button
                    type="button"
                    className="px-2 py-1 rounded bg-red-600/80 hover:bg-red-500 text-xs"
                    onClick={() => setProjects((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    Remove Project
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {projectItem.photos.map((src, photoIdx) => (
                    <div key={`${photoIdx}-${src.slice(0, 20)}`} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Project ${idx + 1} photo ${photoIdx + 1}`} className="h-20 w-full object-cover rounded border border-white/10" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded"
                        onClick={() =>
                          setProjects((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, photos: p.photos.filter((_, j) => j !== photoIdx) } : p
                            )
                          )
                        }
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 hidden">
          <div>
            <p className="text-sm text-white/70 mb-1">Hero slides (one URL per line)</p>
            <textarea className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-44" value="" readOnly />
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">Service card images (`key=url` per line)</p>
            <textarea className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-44" value="" readOnly />
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">Portfolio projects (one row per project, comma-separated URLs)</p>
            <textarea className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-44" value="" readOnly />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onSave}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-sm font-medium"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          {message && <span className="text-sm text-white/70">{message}</span>}
        </div>
      </div>
    </div>
  );
}

