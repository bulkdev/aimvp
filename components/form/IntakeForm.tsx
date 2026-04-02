"use client";

import React, { useState, useRef, ChangeEvent } from "react";
import type { IntakeFormData, SiteTemplateChoice } from "@/types";

interface Props {
  onSubmit: (data: IntakeFormData) => void;
  isLoading: boolean;
}

const FIELD_CLASS =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400/60 focus:bg-white/8 transition-all text-sm";

const LABEL_CLASS = "block text-white/70 text-sm font-medium mb-1.5";

export default function IntakeForm({ onSubmit, isLoading }: Props) {
  const [form, setForm] = useState<IntakeFormData>({
    companyName: "",
    businessDescription: "",
    customDomain: "",
    sourceLink: "",
    siteTemplate: "auto",
    logoDataUrl: undefined,
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    bookingEnabled: false,
    paymentEnabled: false,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [importLink, setImportLink] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importNote, setImportNote] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof IntakeFormData, string>>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, logoDataUrl: "Logo must be under 4MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
      set("logoDataUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!form.companyName.trim()) newErrors.companyName = "Company name is required.";
    if (!form.businessDescription.trim()) newErrors.businessDescription = "Business description is required.";
    else if (form.businessDescription.trim().length < 20)
      newErrors.businessDescription = "Please write at least 20 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  async function handleImportFromLink() {
    const url = importLink.trim();
    if (!url) {
      setImportNote("Enter a link first.");
      return;
    }
    setIsImporting(true);
    setImportNote("");
    try {
      const res = await fetch("/api/enrich-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportNote(data?.error || "Could not import this link.");
        return;
      }

      const fields = data?.fields ?? {};
      setForm((prev) => ({
        ...prev,
        companyName: fields.companyName || prev.companyName,
        businessDescription: fields.businessDescription || prev.businessDescription,
        phone: fields.phone || prev.phone,
        email: fields.email || prev.email,
        address: fields.address || prev.address,
        city: fields.city || prev.city,
        state: fields.state || prev.state,
        sourceLink: fields.sourceLink || prev.sourceLink,
        importedLogoUrl: fields.importedLogoUrl || prev.importedLogoUrl,
        importedHeroSlides:
          Array.isArray(fields.importedHeroSlides) && fields.importedHeroSlides.length
            ? fields.importedHeroSlides
            : prev.importedHeroSlides,
        importedPortfolioProjects:
          Array.isArray(fields.importedPortfolioProjects) && fields.importedPortfolioProjects.length
            ? fields.importedPortfolioProjects
            : prev.importedPortfolioProjects,
        logoDataUrl: fields.importedLogoUrl || prev.logoDataUrl,
      }));

      if (fields.importedLogoUrl) {
        setLogoPreview(fields.importedLogoUrl);
      }

      const note = Array.isArray(data?.notes) && data.notes.length
        ? data.notes.join(" ")
        : "Imported details from link. Please review and adjust before generating.";
      setImportNote(note);
    } catch {
      setImportNote("Import failed. Try another website link.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-glass rounded-2xl p-6 md:p-8 space-y-6">

      {/* ── Required Fields ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-indigo-400 rounded-full" />
          <h2 className="text-white font-semibold text-base">Business Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className={LABEL_CLASS}>Import Details from Link (optional)</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                className={FIELD_CLASS}
                placeholder="Paste website, Google Business, Instagram, or Facebook link"
                value={importLink}
                onChange={(e) => setImportLink(e.target.value)}
              />
              <button
                type="button"
                onClick={() => void handleImportFromLink()}
                disabled={isImporting}
                className="sm:w-auto w-full bg-white/10 border border-white/20 hover:bg-white/15 text-white text-sm rounded-xl px-4 py-3 disabled:opacity-60"
              >
                {isImporting ? "Importing..." : "Import"}
              </button>
            </div>
            {importNote && <p className="text-white/45 text-xs mt-1.5">{importNote}</p>}
          </div>

          {/* Company Name */}
          <div>
            <label className={LABEL_CLASS}>
              Company Name <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              className={FIELD_CLASS}
              placeholder="e.g. Sunrise Plumbing Co."
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              maxLength={80}
            />
            {errors.companyName && (
              <p className="mt-1 text-red-400 text-xs">{errors.companyName}</p>
            )}
          </div>

          {/* Business Description */}
          <div>
            <label className={LABEL_CLASS}>
              Business Description <span className="text-indigo-400">*</span>
            </label>
            <textarea
              className={`${FIELD_CLASS} resize-none h-28`}
              placeholder="Describe what your business does, who you serve, and what makes you different. The more detail, the better the output."
              value={form.businessDescription}
              onChange={(e) => set("businessDescription", e.target.value)}
              maxLength={800}
            />
            <div className="flex justify-between mt-1">
              {errors.businessDescription ? (
                <p className="text-red-400 text-xs">{errors.businessDescription}</p>
              ) : (
                <span />
              )}
              <span className="text-white/20 text-xs">{form.businessDescription.length}/800</span>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Custom Domain (optional)</label>
            <input
              type="text"
              className={FIELD_CLASS}
              placeholder="www.yourbusiness.com"
              value={form.customDomain || ""}
              onChange={(e) => set("customDomain", e.target.value)}
            />
            <p className="text-white/35 text-xs mt-1.5">
              Used for canonical URLs and SEO metadata when this site is published.
            </p>
          </div>

          <div>
            <label className={LABEL_CLASS}>Site layout</label>
            <select
              className={`${FIELD_CLASS} cursor-pointer`}
              value={form.siteTemplate ?? "auto"}
              onChange={(e) => set("siteTemplate", e.target.value as SiteTemplateChoice)}
            >
              <option value="auto">Auto — pick from description &amp; company name</option>
              <option value="default">General business (gradient hero)</option>
              <option value="plumbing">Plumbing — Classic navbar & hero</option>
              <option value="plumbing-split">Plumbing — Split bar navbar & hero</option>
              <option value="plumbing-boxed">Plumbing — Boxed glass navbar & hero</option>
            </select>
            <p className="text-white/35 text-xs mt-1.5">
              Auto looks for trade keywords (e.g. plumbing in the name). Choose a layout here to force the trade template.
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className={LABEL_CLASS}>Logo (optional)</label>
            <div
              className="relative border border-dashed border-white/20 rounded-xl p-5 flex flex-col items-center gap-3 cursor-pointer hover:border-indigo-400/40 hover:bg-white/5 transition-all group"
              onClick={() => fileRef.current?.click()}
            >
              {logoPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-16 object-contain"
                  />
                  <span className="text-white/40 text-xs">Click to replace</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/10 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/40">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-sm">Drop your logo or click to upload</p>
                    <p className="text-white/30 text-xs mt-0.5">PNG, JPG, SVG up to 4MB</p>
                  </div>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </div>
            {errors.logoDataUrl && (
              <p className="mt-1 text-red-400 text-xs">{errors.logoDataUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Optional Contact Info ────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-purple-400 rounded-full" />
          <h2 className="text-white font-semibold text-base">Contact Details</h2>
          <span className="text-white/30 text-xs ml-1">(optional)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Phone</label>
            <input
              type="tel"
              className={FIELD_CLASS}
              placeholder="(555) 000-0000"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Email</label>
            <input
              type="email"
              className={FIELD_CLASS}
              placeholder="hello@yourbusiness.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>City</label>
              <input
                type="text"
                className={FIELD_CLASS}
                placeholder="Everett"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>State / region</label>
              <input
                type="text"
                className={FIELD_CLASS}
                placeholder="WA"
                value={form.state ?? ""}
                onChange={(e) => set("state", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>Street Address</label>
            <input
              type="text"
              className={FIELD_CLASS}
              placeholder="123 Main St"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Feature Toggles ──────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-emerald-400 rounded-full" />
          <h2 className="text-white font-semibold text-base">Optional Features</h2>
        </div>

        <div className="space-y-3">
          <ToggleRow
            title="Online Booking"
            description="Add a booking section for Calendly or Square Appointments"
            enabled={form.bookingEnabled}
            onChange={(v) => set("bookingEnabled", v)}
            color="indigo"
          />
          <ToggleRow
            title="Online Payments"
            description="Add a payment section for Stripe checkout or payment links"
            enabled={form.paymentEnabled}
            onChange={(v) => set("paymentEnabled", v)}
            color="emerald"
          />
        </div>
      </div>

      {/* ── Submit ───────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 text-base shadow-lg shadow-indigo-900/40"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Generating your website…
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Generate Website
          </>
        )}
      </button>

      {isLoading && (
        <p className="text-center text-white/40 text-xs">
          This usually takes 10–30 seconds. Please do not close the tab.
        </p>
      )}
    </form>
  );
}

// ─── Toggle Row Component ─────────────────────────────────────────────────────

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
  color,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  color: "indigo" | "emerald";
}) {
  const trackBg = enabled
    ? color === "indigo"
      ? "bg-indigo-500"
      : "bg-emerald-500"
    : "bg-white/10";

  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="w-full flex items-start gap-4 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-left"
    >
      {/* Toggle pill */}
      <div
        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 mt-0.5 ${trackBg}`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>

      <div>
        <p className="text-white font-medium text-sm">{title}</p>
        <p className="text-white/40 text-xs mt-0.5">{description}</p>
      </div>
    </button>
  );
}
