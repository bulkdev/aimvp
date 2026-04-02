"use client";

import { useMemo, useRef, useState } from "react";
import type { Project, ServiceItem } from "@/types";

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
  const [phone, setPhone] = useState(project.intake.phone ?? "");
  const [city, setCity] = useState(project.intake.city ?? "");
  const [email, setEmail] = useState(project.intake.email ?? "");
  const [address, setAddress] = useState(project.intake.address ?? "");
  const [heroTitle, setHeroTitle] = useState(project.content.hero.title);
  const [heroSubtitle, setHeroSubtitle] = useState(project.content.hero.subtitle);
  const [heroSlides, setHeroSlides] = useState<string[]>(project.content.assets?.heroSlides ?? []);
  const [services, setServices] = useState<ServiceItem[]>(project.content.services);
  const [serviceImages, setServiceImages] = useState<Record<string, string>>(project.content.assets?.serviceCardImages ?? {});
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
        intake: { ...project.intake, companyName, phone, city, email, address },
        content: {
          ...project.content,
          brandName: companyName,
          services,
          hero: { ...project.content.hero, title: heroTitle, subtitle: heroSubtitle },
          assets: {
            ...project.content.assets,
            heroSlides,
            serviceCardImages: serviceImages,
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
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City / area" />
            <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          </div>
          <input className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
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

