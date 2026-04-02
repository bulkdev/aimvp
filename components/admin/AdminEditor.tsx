"use client";

import { useMemo, useState } from "react";
import type { Project, ServiceItem } from "@/types";

interface Props { project: Project; }

type EditableProject = {
  projectName: string;
  serviceType: string;
  review: string;
  rating: number;
  photos: string[];
};

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
          phone,
          city,
          email,
          address,
        },
        content: {
          ...project.content,
          brandName: companyName,
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
          <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" />
          <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={city} onChange={(e)=>setCity(e.target.value)} placeholder="City/Area" />
          <input className="bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
        </div>
        <input className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Address" />

        <input className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2" value={heroTitle} onChange={(e)=>setHeroTitle(e.target.value)} placeholder="Hero title" />
        <textarea className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2 h-24" value={heroSubtitle} onChange={(e)=>setHeroSubtitle(e.target.value)} placeholder="Hero subtitle" />

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

