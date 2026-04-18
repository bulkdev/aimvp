"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  CalendarDays,
  Camera,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  MapPin,
  RefreshCw,
  Save,
  Scissors,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import type {
  HairDesignStudioConfig,
  HairDesignStudioLocation,
  HairDesignStudioStylist,
  Project,
  ServiceItem,
} from "@/types";
import { absoluteUrl, buildPublishedBasePath } from "@/lib/seo";
import { ensureHairDesignStudioConfig } from "@/lib/hair-design-studio-config";
import { fileToCompressedDataUrl } from "@/lib/clientImage";
import { readResponseJson } from "@/lib/readResponseJson";
import { stringifyProjectPatchBody } from "@/lib/compressProjectPayload";
import type { StudioAppointmentRecord } from "@/lib/studio-appointment-store";

type Tab = "overview" | "bookings" | "studios" | "services" | "reviews" | "site";

type EditableReview = {
  reviewerName: string;
  rating: number;
  text: string;
};

interface Props {
  project: Project;
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HairStudioOwnerDashboard({ project }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [brandName, setBrandName] = useState(project.content.brandName || project.intake.companyName);
  const [tagline, setTagline] = useState(project.content.tagline);
  const [heroTitle, setHeroTitle] = useState(project.content.hero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(project.content.hero.subtitle);
  const [heroCta, setHeroCta] = useState(project.content.hero.ctaText);
  const [email, setEmail] = useState(project.intake.email ?? "");
  const [phone, setPhone] = useState(project.intake.phone ?? "");
  const [address, setAddress] = useState(project.intake.address ?? "");
  const [city, setCity] = useState(project.intake.city ?? "");
  const [state, setState] = useState(project.intake.state ?? "");
  const [customDomain, setCustomDomain] = useState(project.intake.customDomain ?? "");
  const [publicSlug, setPublicSlug] = useState(project.publicSlug ?? "");
  const [bookingEnabled, setBookingEnabled] = useState(project.intake.bookingEnabled);
  const [paymentEnabled, setPaymentEnabled] = useState(project.intake.paymentEnabled);
  const [bookingFullyBooked, setBookingFullyBooked] = useState(project.content.assets?.bookingFullyBooked ?? false);
  const [bookingWaitlistNote, setBookingWaitlistNote] = useState(project.content.assets?.bookingWaitlistNote ?? "");
  const [logoDataUrl, setLogoDataUrl] = useState(project.intake.logoDataUrl ?? "");
  const [heroSlides, setHeroSlides] = useState<string[]>(project.content.assets?.heroSlides ?? []);
  const [heroVideoUrl, setHeroVideoUrl] = useState(project.content.assets?.tintHeroVideoUrl ?? "");
  const [heroPosterUrl, setHeroPosterUrl] = useState(project.content.assets?.tintHeroVideoPosterUrl ?? "");
  const [services, setServices] = useState<ServiceItem[]>(project.content.services);
  const [serviceCardImages, setServiceCardImages] = useState<Record<string, string>>(
    project.content.assets?.serviceCardImages ?? {}
  );
  const [instagramUrl, setInstagramUrl] = useState(project.content.assets?.socialLinks?.instagram ?? "");
  const [hair, setHair] = useState<HairDesignStudioConfig>(() =>
    ensureHairDesignStudioConfig(project.content, project.intake)
  );
  const [manualReviews, setManualReviews] = useState<EditableReview[]>(
    (project.content.assets?.manualReviews ?? []).map((r) => ({
      reviewerName: r.reviewerName || "",
      rating: r.rating || 5,
      text: r.text || "",
    }))
  );
  const [siteSeoTitle, setSiteSeoTitle] = useState(project.content.assets?.siteSeo?.metaTitle ?? "");
  const [siteSeoDesc, setSiteSeoDesc] = useState(project.content.assets?.siteSeo?.metaDescription ?? "");

  const [appointments, setAppointments] = useState<StudioAppointmentRecord[]>([]);
  const [apptsLoading, setApptsLoading] = useState(false);
  const [apptActionId, setApptActionId] = useState<string | null>(null);

  const previewUrl = `/preview/${project.id}`;
  const customerSiteUrl = useMemo(() => {
    const path = buildPublishedBasePath({ id: project.id, publicSlug: publicSlug.trim() || undefined });
    return absoluteUrl(path);
  }, [project.id, publicSlug]);

  const loadAppointments = useCallback(async () => {
    setApptsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/studio-appointments`, { credentials: "include" });
      const data = (await res.json()) as { appointments?: StudioAppointmentRecord[]; error?: string };
      if (res.ok) setAppointments(data.appointments ?? []);
    } finally {
      setApptsLoading(false);
    }
  }, [project.id]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const kpis = useMemo(() => {
    const t = todayIso();
    const active = appointments.filter((a) => a.status !== "cancelled");
    const upcoming = active.filter((a) => a.dateIso >= t).length;
    const pendingDeposit = active.filter((a) => a.status === "pending_deposit").length;
    return { upcoming, pendingDeposit, total: active.length };
  }, [appointments]);

  async function patchAppointment(id: string, status: "confirmed" | "cancelled") {
    setApptActionId(id);
    try {
      const res = await fetch(`/api/projects/${project.id}/studio-appointments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ appointmentId: id, status }),
      });
      if (!res.ok) {
        const err = await readResponseJson<{ error?: string }>(res);
        setMsg(err?.error || "Could not update booking.");
        return;
      }
      await loadAppointments();
      setMsg(status === "cancelled" ? "Booking released." : "Marked as confirmed.");
    } finally {
      setApptActionId(null);
    }
  }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      const {
        faviconDataUrl: _fav,
        tintHeroVideoUrl: _omitVideo,
        tintHeroVideoPosterUrl: _omitPoster,
        hairDesignStudio: _omitHairPrev,
        bookingWaitlistNote: _omitWlPrev,
        ...assetRest
      } = project.content.assets ?? {};
      void _fav;
      void _omitVideo;
      void _omitPoster;
      void _omitHairPrev;
      void _omitWlPrev;
      const nextIntake = {
        ...project.intake,
        companyName: brandName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        customDomain: customDomain.trim() || undefined,
        bookingEnabled,
        paymentEnabled,
        siteTemplate: "hair-design-studio" as const,
      };
      if (logoDataUrl.trim()) nextIntake.logoDataUrl = logoDataUrl.trim();
      else delete nextIntake.logoDataUrl;

      const hairPayload: HairDesignStudioConfig = {
        ...hair,
        locations: hair.locations.map((loc) => ({ ...loc })),
        stylists: hair.stylists.map((s) => ({
          ...s,
          serviceTitles: [...s.serviceTitles],
          portfolioUrls: s.portfolioUrls ? [...s.portfolioUrls] : undefined,
        })),
        beforeAfterPairs: hair.beforeAfterPairs?.map((p) => ({ ...p })),
        socialVideoEmbeds: hair.socialVideoEmbeds?.filter((u) => u.trim()),
      };

      const payload = {
        intake: nextIntake,
        content: {
          ...project.content,
          brandName: brandName.trim(),
          tagline: tagline.trim(),
          hero: {
            ...project.content.hero,
            title: heroTitle.trim(),
            subtitle: heroSubtitle.trim(),
            ctaText: heroCta.trim() || "Book appointment",
          },
          services: services.map((s) => ({
            title: s.title.trim(),
            description: s.description.trim(),
            icon: s.icon.trim() || "Sparkles",
            category: s.category?.trim(),
            startingPrice: s.startingPrice?.trim(),
            duration: s.duration?.trim(),
          })),
          assets: {
            ...assetRest,
            hairDesignStudio: hairPayload,
            heroSlides,
            ...(heroVideoUrl.trim() ? { tintHeroVideoUrl: heroVideoUrl.trim() } : {}),
            ...(heroPosterUrl.trim() ? { tintHeroVideoPosterUrl: heroPosterUrl.trim() } : {}),
            serviceCardImages,
            socialLinks: {
              ...project.content.assets?.socialLinks,
              instagram: instagramUrl.trim(),
            },
            manualReviews: manualReviews
              .map((r) => ({
                reviewerName: r.reviewerName.trim(),
                rating: Math.max(1, Math.min(5, r.rating)),
                text: r.text.trim(),
              }))
              .filter((r) => r.reviewerName && r.text),
            bookingFullyBooked,
            ...(bookingWaitlistNote.trim() ? { bookingWaitlistNote: bookingWaitlistNote.trim() } : {}),
            siteSeo: (() => {
              const metaTitle = siteSeoTitle.trim();
              const metaDescription = siteSeoDesc.trim();
              if (!metaTitle && !metaDescription) return project.content.assets?.siteSeo;
              return {
                ...project.content.assets?.siteSeo,
                ...(metaTitle ? { metaTitle } : {}),
                ...(metaDescription ? { metaDescription } : {}),
              };
            })(),
          },
        },
        publicSlug: publicSlug.trim(),
      };

      const { body } = await stringifyProjectPatchBody(payload);
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 413) throw new Error("Payload too large — shrink images.");
        const errBody = await readResponseJson<{ error?: string }>(res);
        throw new Error(errBody?.error || "Save failed.");
      }
      setMsg("Saved.");
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <Sparkles className="h-4 w-4" /> },
    { id: "bookings", label: "Bookings", icon: <CalendarDays className="h-4 w-4" /> },
    { id: "studios", label: "Studios & team", icon: <Users className="h-4 w-4" /> },
    { id: "services", label: "Services & hero", icon: <Scissors className="h-4 w-4" /> },
    { id: "reviews", label: "Reviews & waitlist", icon: <Star className="h-4 w-4" /> },
    { id: "site", label: "Site & domain", icon: <Wrench className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050506]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4e157]">Studio desk</p>
            <h1 className="truncate font-[family-name:var(--font-syne,system-ui)] text-lg font-semibold tracking-tight md:text-xl">
              {brandName || "Your studio"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {session?.user?.isMainAdmin ? (
              <Link
                href="/admin"
                className="rounded-lg border border-[#d4e157]/40 px-3 py-2 text-xs font-medium text-[#d4e157] hover:bg-[#d4e157]/10"
              >
                All sites
              </Link>
            ) : null}
            <Link
              href={`/admin/${project.id}?full=1`}
              className="rounded-lg border border-white/15 px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-white"
            >
              Full editor
            </Link>
            <a
              href={previewUrl}
              className="rounded-lg bg-[#d4e157] px-3 py-2 text-xs font-semibold text-black hover:brightness-110"
            >
              Preview
            </a>
            <a
              href={customerSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs hover:bg-white/5"
            >
              Live site <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        {msg ? (
          <p className="border-t border-white/5 px-4 py-2 text-center text-xs text-zinc-400 md:px-8">{msg}</p>
        ) : null}
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-0 md:gap-8 md:px-8 md:py-8">
        <aside className="hidden w-52 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  tab === t.id ? "bg-[#d4e157] text-black" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col md:rounded-2xl md:border md:border-white/10 md:bg-[#0a0a0c]">
          <div className="flex gap-1 overflow-x-auto border-b border-white/10 p-2 md:hidden">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${
                  tab === t.id ? "bg-[#d4e157] text-black" : "text-zinc-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-4 md:p-8">
            {tab === "overview" && (
              <OverviewPanel
                kpis={kpis}
                appointments={appointments}
                hair={hair}
                onRefresh={loadAppointments}
                apptsLoading={apptsLoading}
              />
            )}
            {tab === "bookings" && (
              <BookingsPanel
                appointments={appointments}
                hair={hair}
                loading={apptsLoading}
                onRefresh={loadAppointments}
                actionId={apptActionId}
                onPatch={patchAppointment}
              />
            )}
            {tab === "studios" && (
              <StudiosPanel hair={hair} setHair={setHair} serviceTitles={services.map((s) => s.title).filter(Boolean)} />
            )}
            {tab === "services" && (
              <ServicesPanel
                services={services}
                setServices={setServices}
                serviceCardImages={serviceCardImages}
                setServiceCardImages={setServiceCardImages}
                heroTitle={heroTitle}
                setHeroTitle={setHeroTitle}
                heroSubtitle={heroSubtitle}
                setHeroSubtitle={setHeroSubtitle}
                heroCta={heroCta}
                setHeroCta={setHeroCta}
                tagline={tagline}
                setTagline={setTagline}
                heroSlides={heroSlides}
                setHeroSlides={setHeroSlides}
                heroVideoUrl={heroVideoUrl}
                setHeroVideoUrl={setHeroVideoUrl}
                heroPosterUrl={heroPosterUrl}
                setHeroPosterUrl={setHeroPosterUrl}
                hair={hair}
                setHair={setHair}
              />
            )}
            {tab === "reviews" && (
              <ReviewsPanel
                manualReviews={manualReviews}
                setManualReviews={setManualReviews}
                bookingFullyBooked={bookingFullyBooked}
                setBookingFullyBooked={setBookingFullyBooked}
                bookingWaitlistNote={bookingWaitlistNote}
                setBookingWaitlistNote={setBookingWaitlistNote}
                instagramUrl={instagramUrl}
                setInstagramUrl={setInstagramUrl}
              />
            )}
            {tab === "site" && (
              <SitePanel
                brandName={brandName}
                setBrandName={setBrandName}
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
                address={address}
                setAddress={setAddress}
                city={city}
                setCity={setCity}
                state={state}
                setState={setState}
                customDomain={customDomain}
                setCustomDomain={setCustomDomain}
                publicSlug={publicSlug}
                setPublicSlug={setPublicSlug}
                logoDataUrl={logoDataUrl}
                setLogoDataUrl={setLogoDataUrl}
                bookingEnabled={bookingEnabled}
                setBookingEnabled={setBookingEnabled}
                paymentEnabled={paymentEnabled}
                setPaymentEnabled={setPaymentEnabled}
                siteSeoTitle={siteSeoTitle}
                setSiteSeoTitle={setSiteSeoTitle}
                siteSeoDesc={siteSeoDesc}
                setSiteSeoDesc={setSiteSeoDesc}
              />
            )}
          </div>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700&display=swap');
      `}</style>
    </div>
  );
}

function OverviewPanel({
  kpis,
  appointments,
  hair,
  onRefresh,
  apptsLoading,
}: {
  kpis: { upcoming: number; pendingDeposit: number; total: number };
  appointments: StudioAppointmentRecord[];
  hair: HairDesignStudioConfig;
  onRefresh: () => void;
  apptsLoading: boolean;
}) {
  const recent = appointments.slice(0, 6);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-syne,system-ui)] text-2xl font-bold text-white">Today at a glance</h2>
        <p className="mt-1 text-sm text-zinc-500">Built for owners who live in the booking flow.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Upcoming (scheduled forward)" value={String(kpis.upcoming)} hint="Non-cancelled" />
        <KpiCard label="Awaiting deposit" value={String(kpis.pendingDeposit)} hint="Follow up in email" />
        <KpiCard label="Active requests" value={String(kpis.total)} hint="All statuses" />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <ClipboardList className="h-4 w-4 text-[#d4e157]" /> Recent requests
          </h3>
          <button
            type="button"
            onClick={onRefresh}
            disabled={apptsLoading}
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-zinc-400 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${apptsLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
        <ul className="mt-4 divide-y divide-white/5">
          {recent.length === 0 ? (
            <li className="py-6 text-center text-sm text-zinc-500">No bookings yet — they appear here when guests submit.</li>
          ) : (
            recent.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <div>
                  <p className="font-medium text-white">
                    {a.dateIso} · {a.timeLabel}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {a.serviceTitle} · {lookupStylist(hair, a.stylistId)} · {a.customerName}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    a.status === "cancelled"
                      ? "bg-zinc-800 text-zinc-500"
                      : a.status === "confirmed"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-amber-500/20 text-amber-200"
                  }`}
                >
                  {a.status.replace("_", " ")}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-5">
      <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-[11px] text-zinc-600">{hint}</p>
    </div>
  );
}

function BookingsPanel({
  appointments,
  hair,
  loading,
  onRefresh,
  actionId,
  onPatch,
}: {
  appointments: StudioAppointmentRecord[];
  hair: HairDesignStudioConfig;
  loading: boolean;
  onRefresh: () => void;
  actionId: string | null;
  onPatch: (id: string, s: "confirmed" | "cancelled") => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-syne,system-ui)] text-2xl font-bold text-white">Bookings</h2>
          <p className="text-sm text-zinc-500">Release a slot by cancelling. Confirm when deposit clears.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Sync
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Artist</th>
              <th className="px-4 py-3">Chair</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                  No rows yet.
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white">
                    {a.dateIso}
                    <br />
                    <span className="text-zinc-500">{a.timeLabel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">{a.customerName}</div>
                    <div className="text-xs text-zinc-500">{a.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{a.serviceTitle}</td>
                  <td className="px-4 py-3 text-zinc-300">{lookupStylist(hair, a.stylistId)}</td>
                  <td className="px-4 py-3 text-zinc-300">{lookupLocation(hair, a.locationId)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs uppercase text-zinc-400">{a.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {a.status === "cancelled" ? (
                      <span className="text-xs text-zinc-600">—</span>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={actionId === a.id || a.status === "confirmed"}
                          onClick={() => onPatch(a.id, "confirmed")}
                          className="rounded-lg bg-emerald-600/90 px-2 py-1 text-xs font-medium text-white disabled:opacity-40"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          disabled={actionId === a.id}
                          onClick={() => onPatch(a.id, "cancelled")}
                          className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudiosPanel({
  hair,
  setHair,
  serviceTitles,
}: {
  hair: HairDesignStudioConfig;
  setHair: Dispatch<SetStateAction<HairDesignStudioConfig>>;
  serviceTitles: string[];
}) {
  function updateLocation(i: number, patch: Partial<HairDesignStudioLocation>) {
    setHair((h) => {
      const locations = [...h.locations];
      locations[i] = { ...locations[i]!, ...patch };
      return { ...h, locations };
    });
  }

  function updateStylist(i: number, patch: Partial<HairDesignStudioStylist>) {
    setHair((h) => {
      const stylists = [...h.stylists];
      stylists[i] = { ...stylists[i]!, ...patch };
      return { ...h, stylists };
    });
  }

  function addStylist() {
    setHair((h) => ({
      ...h,
      stylists: [
        ...h.stylists,
        {
          id: crypto.randomUUID(),
          name: "New stylist",
          specialty: "Specialty",
          rating: 5,
          bio: "",
          serviceTitles: [],
          portfolioUrls: [],
        },
      ],
    }));
  }

  function removeStylist(i: number) {
    setHair((h) => ({ ...h, stylists: h.stylists.filter((_, j) => j !== i) }));
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[family-name:var(--font-syne,system-ui)] text-2xl font-bold text-white">Studios</h2>
        <p className="mt-1 text-sm text-zinc-500">Addresses and maps power the location toggle on your public site.</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {hair.locations.map((loc, i) => (
            <div key={loc.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-center gap-2 text-[#d4e157]">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Location {i + 1}</span>
              </div>
              <Field label="Display name" value={loc.name} onChange={(v) => updateLocation(i, { name: v })} className="mt-4" />
              <Field label="Short label (toggle)" value={loc.shortLabel} onChange={(v) => updateLocation(i, { shortLabel: v })} />
              <Field label="Address" value={loc.address} onChange={(v) => updateLocation(i, { address: v })} />
              <Field label="Map embed URL" value={loc.mapEmbedUrl ?? ""} onChange={(v) => updateLocation(i, { mapEmbedUrl: v })} />
              <Field label="Phone" value={loc.phone ?? ""} onChange={(v) => updateLocation(i, { phone: v })} />
              <div className="mt-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Hours (one per line)</label>
                <textarea
                  value={loc.hours.join("\n")}
                  onChange={(e) =>
                    updateLocation(i, {
                      hours: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
                    })
                  }
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4e157]/30"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-syne,system-ui)] text-2xl font-bold text-white">Team</h2>
            <p className="text-sm text-zinc-500">Roster cards, booking presets, and portfolio strips.</p>
          </div>
          <button type="button" onClick={addStylist} className="rounded-xl bg-[#d4e157] px-4 py-2 text-xs font-bold text-black">
            Add stylist
          </button>
        </div>
        <div className="mt-6 space-y-6">
          {hair.stylists.map((st, i) => (
            <div key={st.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-xs font-mono text-zinc-600">ID: {st.id}</p>
                <button type="button" onClick={() => removeStylist(i)} className="text-xs text-red-400 hover:underline">
                  Remove
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Name" value={st.name} onChange={(v) => updateStylist(i, { name: v })} />
                <Field label="Specialty" value={st.specialty} onChange={(v) => updateStylist(i, { specialty: v })} />
                <Field
                  label="Rating"
                  value={String(st.rating)}
                  onChange={(v) => updateStylist(i, { rating: Math.min(5, Math.max(0, Number.parseFloat(v) || 0)) })}
                />
                <Field label="Photo URL" value={st.photoUrl ?? ""} onChange={(v) => updateStylist(i, { photoUrl: v })} />
              </div>
              <div className="mt-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Bio</label>
                <textarea
                  value={st.bio ?? ""}
                  onChange={(e) => updateStylist(i, { bio: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Portfolio image URLs (one per line)</label>
                <textarea
                  value={(st.portfolioUrls ?? []).join("\n")}
                  onChange={(e) =>
                    updateStylist(i, {
                      portfolioUrls: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
                    })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Services this artist offers</p>
                <p className="mt-0.5 text-[11px] text-zinc-600">Match titles from the Services tab.</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {serviceTitles.map((title) => (
                    <label key={title} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs">
                      <input
                        type="checkbox"
                        checked={st.serviceTitles.includes(title)}
                        onChange={(e) => {
                          const on = e.target.checked;
                          setHair((h) => {
                            const stylists = [...h.stylists];
                            const cur = stylists[i]!;
                            const nextTitles = on
                              ? [...new Set([...cur.serviceTitles, title])]
                              : cur.serviceTitles.filter((t) => t !== title);
                            stylists[i] = { ...cur, serviceTitles: nextTitles };
                            return { ...h, stylists };
                          });
                        }}
                        className="rounded border-white/20"
                      />
                      {title}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <h3 className="text-sm font-semibold text-amber-200">Deposits & fees</h3>
        <p className="mt-1 text-xs text-zinc-500">Shown on the public checkout step before guests pay.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Deposit % (of service estimate)"
            value={String(hair.depositPercent ?? 25)}
            onChange={(v) =>
              setHair((h) => ({ ...h, depositPercent: Math.min(100, Math.max(0, Number.parseInt(v, 10) || 0)) }))
            }
          />
          <Field
            label="Minimum deposit ($)"
            value={String(hair.depositFlatUsd ?? 35)}
            onChange={(v) => setHair((h) => ({ ...h, depositFlatUsd: Math.max(0, Number.parseFloat(v) || 0) }))}
          />
          <Field
            label="Late cancel fee ($)"
            value={String(hair.lateCancelFeeUsd ?? 35)}
            onChange={(v) => setHair((h) => ({ ...h, lateCancelFeeUsd: Math.max(0, Number.parseFloat(v) || 0) }))}
          />
          <Field
            label="No-show fee ($)"
            value={String(hair.noShowFeeUsd ?? 75)}
            onChange={(v) => setHair((h) => ({ ...h, noShowFeeUsd: Math.max(0, Number.parseFloat(v) || 0) }))}
          />
        </div>
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Cancellation policy (short)</label>
          <textarea
            value={hair.cancellationSummary ?? ""}
            onChange={(e) => setHair((h) => ({ ...h, cancellationSummary: e.target.value }))}
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Loyalty / repeat guest note</label>
          <textarea
            value={hair.loyaltyBlurb ?? ""}
            onChange={(e) => setHair((h) => ({ ...h, loyaltyBlurb: e.target.value }))}
            rows={2}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
      </section>
    </div>
  );
}

function ServicesPanel({
  services,
  setServices,
  serviceCardImages,
  setServiceCardImages,
  heroTitle,
  setHeroTitle,
  heroSubtitle,
  setHeroSubtitle,
  heroCta,
  setHeroCta,
  tagline,
  setTagline,
  heroSlides,
  setHeroSlides,
  heroVideoUrl,
  setHeroVideoUrl,
  heroPosterUrl,
  setHeroPosterUrl,
  hair,
  setHair,
}: {
  services: ServiceItem[];
  setServices: Dispatch<SetStateAction<ServiceItem[]>>;
  serviceCardImages: Record<string, string>;
  setServiceCardImages: Dispatch<SetStateAction<Record<string, string>>>;
  heroTitle: string;
  setHeroTitle: (v: string) => void;
  heroSubtitle: string;
  setHeroSubtitle: (v: string) => void;
  heroCta: string;
  setHeroCta: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  heroSlides: string[];
  setHeroSlides: Dispatch<SetStateAction<string[]>>;
  heroVideoUrl: string;
  setHeroVideoUrl: (v: string) => void;
  heroPosterUrl: string;
  setHeroPosterUrl: (v: string) => void;
  hair: HairDesignStudioConfig;
  setHair: Dispatch<SetStateAction<HairDesignStudioConfig>>;
}) {
  async function onServicePhoto(title: string, files: FileList | null) {
    if (!files?.[0]) return;
    const url = await fileToCompressedDataUrl(files[0]);
    setServiceCardImages((prev) => ({ ...prev, [title.trim().toLowerCase()]: url }));
  }

  function updateService(i: number, patch: Partial<ServiceItem>) {
    setServices((prev) => {
      const next = [...prev];
      next[i] = { ...next[i]!, ...patch };
      return next;
    });
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-[family-name:var(--font-syne,system-ui)] text-2xl font-bold text-white">Hero & motion</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Tagline (eyebrow)" value={tagline} onChange={setTagline} />
          <Field label="Primary CTA label" value={heroCta} onChange={setHeroCta} />
          <div className="md:col-span-2">
            <Field label="Headline" value={heroTitle} onChange={setHeroTitle} />
          </div>
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Subtitle</label>
            <textarea
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
            />
          </div>
          <Field label="Hero video URL (mp4/webm)" value={heroVideoUrl} onChange={setHeroVideoUrl} />
          <Field label="Video poster / fallback image" value={heroPosterUrl} onChange={setHeroPosterUrl} />
        </div>
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Hero slides / stills (one URL per line)</label>
          <textarea
            value={heroSlides.join("\n")}
            onChange={(e) =>
              setHeroSlides(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean))
            }
            rows={4}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm font-mono text-xs"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Services</h2>
        <p className="text-sm text-zinc-500">Titles should match what stylists offer in the Team tab.</p>
        <div className="mt-6 space-y-6">
          {services.map((s, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Title" value={s.title} onChange={(v) => updateService(i, { title: v })} />
                <Field label="Category (Dreads, Braids, …)" value={s.category ?? ""} onChange={(v) => updateService(i, { category: v })} />
                <Field label="Starting price" value={s.startingPrice ?? ""} onChange={(v) => updateService(i, { startingPrice: v })} />
                <Field label="Duration" value={s.duration ?? ""} onChange={(v) => updateService(i, { duration: v })} />
                <Field label="Lucide icon name" value={s.icon} onChange={(v) => updateService(i, { icon: v })} />
              </div>
              <div className="mt-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Description</label>
                <textarea
                  value={s.description}
                  onChange={(e) => updateService(i, { description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs hover:bg-white/5">
                  <Camera className="h-4 w-4 text-[#d4e157]" />
                  Card photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onServicePhoto(s.title, e.target.files)}
                  />
                </label>
                {serviceCardImages[s.title.trim().toLowerCase()] ? (
                  <span className="text-xs text-emerald-400">Image attached — save to persist</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-white">Gallery sources</h2>
        <p className="text-sm text-zinc-500">Before/after pairs and embeddable reels on the public site.</p>
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Social / reel embed URLs (one per line)</label>
          <textarea
            value={(hair.socialVideoEmbeds ?? []).join("\n")}
            onChange={(e) =>
              setHair((h) => ({
                ...h,
                socialVideoEmbeds: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean),
              }))
            }
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-6 space-y-4">
          {(hair.beforeAfterPairs ?? []).map((pair, i) => (
            <div key={i} className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
              <Field
                label="Before URL"
                value={pair.beforeUrl}
                onChange={(v) =>
                  setHair((h) => {
                    const pairs = [...(h.beforeAfterPairs ?? [])];
                    pairs[i] = { ...pairs[i]!, beforeUrl: v };
                    return { ...h, beforeAfterPairs: pairs };
                  })
                }
                className="min-w-[200px] flex-1"
              />
              <Field
                label="After URL"
                value={pair.afterUrl}
                onChange={(v) =>
                  setHair((h) => {
                    const pairs = [...(h.beforeAfterPairs ?? [])];
                    pairs[i] = { ...pairs[i]!, afterUrl: v };
                    return { ...h, beforeAfterPairs: pairs };
                  })
                }
                className="min-w-[200px] flex-1"
              />
              <button
                type="button"
                className="self-end text-xs text-red-400"
                onClick={() =>
                  setHair((h) => ({
                    ...h,
                    beforeAfterPairs: (h.beforeAfterPairs ?? []).filter((_, j) => j !== i),
                  }))
                }
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setHair((h) => ({
                ...h,
                beforeAfterPairs: [...(h.beforeAfterPairs ?? []), { beforeUrl: "", afterUrl: "" }],
              }))
            }
            className="text-sm font-medium text-[#d4e157] hover:underline"
          >
            + Add before/after pair
          </button>
        </div>
      </section>
    </div>
  );
}

function ReviewsPanel({
  manualReviews,
  setManualReviews,
  bookingFullyBooked,
  setBookingFullyBooked,
  bookingWaitlistNote,
  setBookingWaitlistNote,
  instagramUrl,
  setInstagramUrl,
}: {
  manualReviews: EditableReview[];
  setManualReviews: Dispatch<SetStateAction<EditableReview[]>>;
  bookingFullyBooked: boolean;
  setBookingFullyBooked: (v: boolean) => void;
  bookingWaitlistNote: string;
  setBookingWaitlistNote: (v: string) => void;
  instagramUrl: string;
  setInstagramUrl: (v: string) => void;
}) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-[family-name:var(--font-syne,system-ui)] text-2xl font-bold text-white">Testimonials</h2>
        <button
          type="button"
          onClick={() => setManualReviews((r) => [...r, { reviewerName: "", rating: 5, text: "" }])}
          className="mt-4 text-sm font-medium text-[#d4e157] hover:underline"
        >
          + Add review
        </button>
        <div className="mt-4 space-y-4">
          {manualReviews.map((rev, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Name" value={rev.reviewerName} onChange={(v) => setManualReviews((rows) => rows.map((x, j) => (j === i ? { ...x, reviewerName: v } : x)))} />
                <Field
                  label="Stars (1–5)"
                  value={String(rev.rating)}
                  onChange={(v) =>
                    setManualReviews((rows) =>
                      rows.map((x, j) => (j === i ? { ...x, rating: Math.min(5, Math.max(1, Number.parseInt(v, 10) || 5)) } : x))
                    )
                  }
                />
                <button
                  type="button"
                  className="self-end text-xs text-red-400 md:justify-self-end"
                  onClick={() => setManualReviews((rows) => rows.filter((_, j) => j !== i))}
                >
                  Remove
                </button>
              </div>
              <textarea
                value={rev.text}
                onChange={(e) => setManualReviews((rows) => rows.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
                rows={3}
                placeholder="Quote"
                className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold text-white">Waitlist mode</h3>
        <p className="mt-1 text-xs text-zinc-500">When fully booked, the site booking drawer becomes a waitlist form.</p>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={bookingFullyBooked} onChange={(e) => setBookingFullyBooked(e.target.checked)} className="rounded border-white/20" />
          Show waitlist instead of booking
        </label>
        <div className="mt-4">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Note above waitlist</label>
          <textarea
            value={bookingWaitlistNote}
            onChange={(e) => setBookingWaitlistNote(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
        </div>
      </section>
      <Field label="Instagram URL" value={instagramUrl} onChange={setInstagramUrl} />
    </div>
  );
}

function SitePanel({
  brandName,
  setBrandName,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  city,
  setCity,
  state,
  setState,
  customDomain,
  setCustomDomain,
  publicSlug,
  setPublicSlug,
  logoDataUrl,
  setLogoDataUrl,
  bookingEnabled,
  setBookingEnabled,
  paymentEnabled,
  setPaymentEnabled,
  siteSeoTitle,
  setSiteSeoTitle,
  siteSeoDesc,
  setSiteSeoDesc,
}: {
  brandName: string;
  setBrandName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  state: string;
  setState: (v: string) => void;
  customDomain: string;
  setCustomDomain: (v: string) => void;
  publicSlug: string;
  setPublicSlug: (v: string) => void;
  logoDataUrl: string;
  setLogoDataUrl: (v: string) => void;
  bookingEnabled: boolean;
  setBookingEnabled: (v: boolean) => void;
  paymentEnabled: boolean;
  setPaymentEnabled: (v: boolean) => void;
  siteSeoTitle: string;
  setSiteSeoTitle: (v: string) => void;
  siteSeoDesc: string;
  setSiteSeoDesc: (v: string) => void;
}) {
  async function onLogo(f: FileList | null) {
    if (!f?.[0]) return;
    setLogoDataUrl(await fileToCompressedDataUrl(f[0]));
  }

  return (
    <div className="space-y-8">
      <h2 className="font-[family-name:var(--font-syne,system-ui)] text-2xl font-bold text-white">Site & domain</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Brand name" value={brandName} onChange={setBrandName} />
        <Field label="Public slug" value={publicSlug} onChange={setPublicSlug} />
        <Field label="Email (notifications)" value={email} onChange={setEmail} />
        <Field label="Phone" value={phone} onChange={setPhone} />
        <Field label="Address" value={address} onChange={setAddress} />
        <Field label="City" value={city} onChange={setCity} />
        <Field label="State / region" value={state} onChange={setState} />
        <div className="md:col-span-2">
          <Field label="Custom domain" value={customDomain} onChange={setCustomDomain} />
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-sm font-medium text-white">Logo</p>
        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs hover:bg-white/5">
          Upload          <input type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files)} />
        </label>
        {logoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoDataUrl} alt="" className="mt-4 h-14 w-auto object-contain" />
        ) : null}
      </div>
      <div className="flex flex-wrap gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={bookingEnabled} onChange={(e) => setBookingEnabled(e.target.checked)} />
          Booking enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={paymentEnabled} onChange={(e) => setPaymentEnabled(e.target.checked)} />
          Payment section enabled
        </label>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white">SEO</h3>
        <div className="mt-4 grid gap-4">
          <Field label="Meta title" value={siteSeoTitle} onChange={setSiteSeoTitle} />
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Meta description</label>
            <textarea
              value={siteSeoDesc}
              onChange={(e) => setSiteSeoDesc(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
      <p className="flex items-start gap-2 text-xs text-zinc-500">
        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#d4e157]" />
        Template is locked to <strong className="text-zinc-300">Hair design studio</strong> for this dashboard. Use Full editor to change template.
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#d4e157]/30"
      />
    </div>
  );
}

function lookupStylist(hair: HairDesignStudioConfig, id: string | null | undefined): string {
  if (!id?.trim()) return "Any available";
  return hair.stylists.find((s) => s.id === id)?.name ?? id;
}

function lookupLocation(hair: HairDesignStudioConfig, id: string): string {
  return hair.locations.find((l) => l.id === id)?.shortLabel ?? id;
}
