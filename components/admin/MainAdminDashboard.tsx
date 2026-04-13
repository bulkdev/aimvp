"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ShowcaseSite } from "@/lib/showcase-portfolio";
import { fileToFaviconDataUrl } from "@/lib/clientImage";

type SiteRow = {
  id: string;
  brandName: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string | null;
  ownerEmail: string | null;
  publicSlug: string | null;
  status: string;
};

export default function MainAdminDashboard() {
  const [sites, setSites] = useState<SiteRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [assignForId, setAssignForId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [assignMsg, setAssignMsg] = useState<string | null>(null);
  const [assignErr, setAssignErr] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [dupErr, setDupErr] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const [portfolioSites, setPortfolioSites] = useState<ShowcaseSite[]>([]);
  const [portfolioErr, setPortfolioErr] = useState<string | null>(null);
  const [portfolioSaveErr, setPortfolioSaveErr] = useState<string | null>(null);
  const [portfolioSaving, setPortfolioSaving] = useState(false);

  const [landingFavicon, setLandingFavicon] = useState<string | null>(null);
  const [landingFaviconSaving, setLandingFaviconSaving] = useState(false);
  const [landingFaviconMsg, setLandingFaviconMsg] = useState<string | null>(null);
  const [landingFaviconErr, setLandingFaviconErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    setPortfolioErr(null);
    setLoading(true);
    try {
      const [sitesRes, showcaseRes, brandingRes] = await Promise.all([
        fetch("/api/admin/sites", { credentials: "include" }),
        fetch("/api/admin/showcase", { credentials: "include" }),
        fetch("/api/admin/landing-branding", { credentials: "include" }),
      ]);
      const sitesData = await sitesRes.json();
      const showcaseData = await showcaseRes.json();
      if (brandingRes.ok) {
        const b = await brandingRes.json();
        setLandingFavicon(typeof b.branding?.faviconDataUrl === "string" ? b.branding.faviconDataUrl : null);
      } else {
        setLandingFavicon(null);
      }
      if (!sitesRes.ok) {
        throw new Error(sitesData.error || "Failed to load sites.");
      }
      if (!showcaseRes.ok) {
        setPortfolioErr(showcaseData.error || "Failed to load homepage portfolio.");
        setPortfolioSites([]);
      } else {
        setPortfolioSites(Array.isArray(showcaseData.sites) ? showcaseData.sites : []);
      }
      setSites(sitesData.sites ?? []);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function saveLandingFavicon(next: string | null) {
    setLandingFaviconSaving(true);
    setLandingFaviconErr(null);
    setLandingFaviconMsg(null);
    try {
      const res = await fetch("/api/admin/landing-branding", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faviconDataUrl: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed.");
      }
      setLandingFavicon(
        typeof data.branding?.faviconDataUrl === "string" ? data.branding.faviconDataUrl : null
      );
      setLandingFaviconMsg("Favicon saved. Hard-refresh the marketing homepage to see the tab icon.");
    } catch (e) {
      setLandingFaviconErr(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setLandingFaviconSaving(false);
    }
  }

  function movePortfolioEntry(index: number, dir: -1 | 1) {
    setPortfolioSites((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      const tmp = next[index]!;
      next[index] = next[j]!;
      next[j] = tmp;
      return next;
    });
  }

  async function savePortfolio() {
    setPortfolioSaveErr(null);
    setPortfolioSaving(true);
    try {
      const res = await fetch("/api/admin/showcase", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sites: portfolioSites }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed.");
      }
      setPortfolioSites(Array.isArray(data.sites) ? data.sites : portfolioSites);
    } catch (e) {
      setPortfolioSaveErr(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setPortfolioSaving(false);
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const valid = new Set(sites.map((s) => s.id));
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (valid.has(id)) next.add(id);
      }
      return next.size === prev.size && [...next].every((id) => prev.has(id)) ? prev : next;
    });
  }, [sites]);

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = selectedIds.size > 0 && selectedIds.size < sites.length;
  }, [selectedIds, sites.length]);

  async function submitAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignForId) return;
    setAssignErr(null);
    setAssignMsg(null);
    setAssigning(true);
    try {
      const res = await fetch(`/api/admin/sites/${assignForId}/owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password: password || undefined,
          name: name.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Assign failed.");
      }
      setAssignMsg(`Owner set to ${data.ownerEmail}`);
      setPassword("");
      setAssignForId(null);
      setEmail("");
      setName("");
      await load();
    } catch (err) {
      setAssignErr(err instanceof Error ? err.message : "Assign failed.");
    } finally {
      setAssigning(false);
    }
  }

  async function duplicateSite(projectId: string) {
    setDupErr(null);
    setDuplicatingId(projectId);
    try {
      const res = await fetch(`/api/admin/sites/${encodeURIComponent(projectId)}/duplicate`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Duplicate failed.");
      }
      await load();
      const newId = data.project?.id as string | undefined;
      if (newId && typeof window !== "undefined") {
        window.location.href = `/admin/${newId}`;
      }
    } catch (e) {
      setDupErr(e instanceof Error ? e.message : "Duplicate failed.");
    } finally {
      setDuplicatingId(null);
    }
  }

  async function deleteSite(projectId: string, brandName: string) {
    if (
      !window.confirm(
        `Delete “${brandName}”? This permanently removes the site and its public URL. This cannot be undone.`
      )
    ) {
      return;
    }
    setDeleteErr(null);
    setDeletingId(projectId);
    try {
      const res = await fetch(`/api/admin/sites/${encodeURIComponent(projectId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Delete failed.");
      }
      await load();
    } catch (e) {
      setDeleteErr(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  function selectAllSites() {
    setSelectedIds(new Set(sites.map((s) => s.id)));
  }

  function clearSiteSelection() {
    setSelectedIds(new Set());
  }

  function toggleSiteSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAllRows() {
    if (sites.length === 0) return;
    if (selectedIds.size === sites.length) clearSiteSelection();
    else selectAllSites();
  }

  async function deleteSelectedSites() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Permanently delete ${ids.length} site(s)? This removes each site and its public URL. This cannot be undone.`
      )
    ) {
      return;
    }
    setDeleteErr(null);
    setBulkDeleting(true);
    try {
      for (const id of ids) {
        const res = await fetch(`/api/admin/sites/${encodeURIComponent(id)}`, {
          method: "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || `Failed to delete site ${id}.`);
        }
      }
      setSelectedIds(new Set());
      await load();
    } catch (e) {
      setDeleteErr(e instanceof Error ? e.message : "Delete failed.");
      await load();
    } finally {
      setBulkDeleting(false);
    }
  }

  const allSelected = sites.length > 0 && selectedIds.size === sites.length;
  const selectionBlocked = bulkDeleting || deletingId !== null;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Main admin — all sites</h1>
            <p className="text-white/60 text-sm mt-1">
              Manage every project. Assign owner accounts so clients can sign in to their dashboard.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/generate"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-sm font-medium shadow-lg shadow-indigo-900/30"
            >
              Generate new site
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-sm font-medium"
            >
              Home
            </Link>
          </div>
        </div>

        {loadError && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-sm">{loadError}</div>
        )}
        {dupErr && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-sm">{dupErr}</div>
        )}
        {deleteErr && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-sm">{deleteErr}</div>
        )}

        {!loading && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Marketing homepage favicon</h2>
              <p className="text-sm text-white/55 mt-1">
                Tab icon for the public landing page (<code className="text-white/80">/</code>). PNG, JPG, SVG, or ICO.
                Shown after save when visitors load the homepage.
              </p>
            </div>
            {landingFaviconErr && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-400/30 text-red-200 text-sm">
                {landingFaviconErr}
              </div>
            )}
            {landingFaviconMsg && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/25 text-emerald-100 text-sm">
                {landingFaviconMsg}
              </div>
            )}
            <div className="flex flex-wrap items-end gap-4">
              {landingFavicon ? (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={landingFavicon} alt="" className="w-12 h-12 rounded object-contain bg-white" />
                  <div className="flex flex-wrap gap-2">
                    <label className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm cursor-pointer">
                      Replace
                      <input
                        type="file"
                        accept="image/*,.ico"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try {
                            const url = await fileToFaviconDataUrl(f);
                            setLandingFavicon(url);
                            await saveLandingFavicon(url);
                          } catch (err) {
                            setLandingFaviconErr(err instanceof Error ? err.message : "Invalid file.");
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      disabled={landingFaviconSaving}
                      onClick={() => void saveLandingFavicon(null)}
                      className="px-3 py-2 rounded-lg border border-white/20 text-sm hover:bg-white/10 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm cursor-pointer inline-block">
                  Upload favicon
                  <input
                    type="file"
                    accept="image/*,.ico"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      try {
                        const url = await fileToFaviconDataUrl(f);
                        setLandingFavicon(url);
                        await saveLandingFavicon(url);
                      } catch (err) {
                        setLandingFaviconErr(err instanceof Error ? err.message : "Invalid file.");
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </section>
        )}

        {!loading && (
          <section className="rounded-2xl border border-indigo-400/20 bg-indigo-500/[0.07] p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Homepage portfolio</h2>
              <p className="text-sm text-white/55 mt-1 max-w-3xl">
                Choose which generated sites appear as the phone + desktop iframe demos on the public homepage. Set the
                pill label for each (e.g. Plumbing, Barber). Order matches the tab order on the home page.
              </p>
            </div>
            {portfolioErr && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-400/25 text-amber-100 text-sm">
                {portfolioErr}
              </div>
            )}
            {portfolioSaveErr && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-400/30 text-red-200 text-sm">
                {portfolioSaveErr}
              </div>
            )}
            <div className="space-y-3">
              {portfolioSites.map((entry, index) => {
                const siteMeta = sites.find((s) => s.id === entry.projectId);
                return (
                  <div
                    key={entry.projectId}
                    className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <label className="flex-1 min-w-[140px]">
                      <span className="text-[10px] uppercase tracking-wider text-white/45 block mb-1">Pill label</span>
                      <input
                        type="text"
                        value={entry.label}
                        onChange={(e) => {
                          const v = e.target.value;
                          setPortfolioSites((prev) =>
                            prev.map((p, i) => (i === index ? { ...p, label: v } : p))
                          );
                        }}
                        className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm"
                      />
                    </label>
                    <div className="flex-1 min-w-[180px] text-sm">
                      <span className="text-[10px] uppercase tracking-wider text-white/45 block mb-1">Site</span>
                      <span className="text-white/85">{siteMeta?.brandName ?? "Unknown site"}</span>
                      <code className="block text-[10px] text-white/35 font-mono mt-0.5">{entry.projectId}</code>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => movePortfolioEntry(index, -1)}
                        className="px-2 py-1.5 rounded-lg border border-white/15 text-xs hover:bg-white/10 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={index >= portfolioSites.length - 1}
                        onClick={() => movePortfolioEntry(index, 1)}
                        className="px-2 py-1.5 rounded-lg border border-white/15 text-xs hover:bg-white/10 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPortfolioSites((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="px-2 py-1.5 rounded-lg border border-red-400/30 text-red-200/90 text-xs hover:bg-red-500/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
              {portfolioSites.length === 0 && (
                <p className="text-sm text-white/45">No sites selected yet — add one below.</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end pt-1">
              <label className="flex-1 max-w-md">
                <span className="text-[10px] uppercase tracking-wider text-white/45 block mb-1">Add site</span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const id = e.target.value;
                    e.target.value = "";
                    if (!id) return;
                    const site = sites.find((s) => s.id === id);
                    if (!site) return;
                    if (portfolioSites.some((p) => p.projectId === id)) return;
                    setPortfolioSites((prev) => [
                      ...prev,
                      { projectId: id, label: site.brandName.slice(0, 80) },
                    ]);
                  }}
                  className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm"
                >
                  <option value="">Choose a site…</option>
                  {sites
                    .filter((s) => !portfolioSites.some((p) => p.projectId === s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.brandName}
                      </option>
                    ))}
                </select>
              </label>
              <button
                type="button"
                disabled={portfolioSaving}
                onClick={() => void savePortfolio()}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-50 shrink-0"
              >
                {portfolioSaving ? "Saving…" : "Save homepage portfolio"}
              </button>
            </div>
          </section>
        )}

        {loading ? (
          <p className="text-white/50 text-sm">Loading sites…</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            {sites.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
                <button
                  type="button"
                  disabled={selectionBlocked}
                  onClick={selectAllSites}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-xs font-medium hover:bg-white/10 disabled:opacity-50"
                >
                  Select all
                </button>
                <button
                  type="button"
                  disabled={selectedIds.size === 0 || selectionBlocked}
                  onClick={() => void deleteSelectedSites()}
                  className="px-3 py-1.5 rounded-lg border border-red-400/40 text-red-200/90 text-xs font-medium hover:bg-red-500/15 disabled:opacity-50"
                >
                  {bulkDeleting
                    ? "Deleting…"
                    : `Delete selected${selectedIds.size ? ` (${selectedIds.size})` : ""}`}
                </button>
              </div>
            )}
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="pl-4 pr-2 py-3 w-10">
                    <span className="sr-only">Select row</span>
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allSelected}
                      disabled={sites.length === 0 || selectionBlocked}
                      onChange={toggleSelectAllRows}
                      className="rounded border-white/30 bg-white/10 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                      aria-label={allSelected ? "Deselect all sites" : "Select all sites"}
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Business</th>
                  <th className="px-4 py-3 font-medium">Owner</th>
                  <th className="px-4 py-3 font-medium">Public URL</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="pl-4 pr-2 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(s.id)}
                        disabled={selectionBlocked}
                        onChange={() => toggleSiteSelected(s.id)}
                        className="rounded border-white/30 bg-white/10 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 mt-1"
                        aria-label={`Select ${s.brandName}`}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{s.brandName}</div>
                      <div className="text-xs text-white/40 font-mono mt-0.5">{s.id}</div>
                    </td>
                    <td className="px-4 py-3 text-white/80">
                      {s.ownerEmail || <span className="text-amber-200/90">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {s.publicSlug ? (
                        <code className="text-xs bg-white/10 px-2 py-0.5 rounded">/{s.publicSlug}</code>
                      ) : (
                        <span className="text-white/35">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                      {new Date(s.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/preview/${s.id}`}
                          className="px-2.5 py-1 rounded border border-white/15 text-xs hover:bg-white/10"
                        >
                          Preview
                        </Link>
                        <Link
                          href={`/admin/${s.id}`}
                          className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={duplicatingId === s.id || bulkDeleting}
                          onClick={() => void duplicateSite(s.id)}
                          className="px-2.5 py-1 rounded border border-white/20 text-white/90 text-xs hover:bg-white/10 disabled:opacity-50"
                        >
                          {duplicatingId === s.id ? "Duplicating…" : "Duplicate"}
                        </button>
                        <button
                          type="button"
                          disabled={bulkDeleting}
                          onClick={() => {
                            setAssignForId(s.id);
                            setEmail(s.ownerEmail || "");
                            setPassword("");
                            setName("");
                            setAssignErr(null);
                            setAssignMsg(null);
                          }}
                          className="px-2.5 py-1 rounded border border-amber-400/40 text-amber-100 text-xs hover:bg-amber-500/10 disabled:opacity-50"
                        >
                          Assign owner
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === s.id || bulkDeleting}
                          onClick={() => void deleteSite(s.id, s.brandName)}
                          className="px-2.5 py-1 rounded border border-red-400/35 text-red-200/90 text-xs hover:bg-red-500/15 disabled:opacity-50"
                        >
                          {deletingId === s.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sites.length === 0 && !loadError && (
              <p className="p-8 text-center text-white/45 text-sm">No sites yet.</p>
            )}
          </div>
        )}

        {assignMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-100 text-sm">{assignMsg}</div>
        )}
      </div>

      {assignForId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-label="Assign owner"
          onClick={() => setAssignForId(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white mb-1">Assign site owner</h2>
            <p className="text-xs text-white/55 mb-4">
              If the email already has an account, only email is required. Otherwise set a password (min 8 characters) to
              create the account and assign ownership.
            </p>
            <form onSubmit={submitAssign} className="space-y-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Client email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Name (optional, new accounts only)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Password (required only for new accounts)</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters if creating account"
                  className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white text-sm placeholder:text-white/30"
                />
              </div>
              {assignErr && <p className="text-sm text-red-300">{assignErr}</p>}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAssignForId(null)}
                  className="px-4 py-2 rounded-lg border border-white/20 text-sm hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium disabled:opacity-50"
                >
                  {assigning ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
