/**
 * Recompresses large raster data URLs before save/import so PATCH bodies stay under platform limits
 * (e.g. Vercel serverless ~4.5MB). Skips SVG, remote URLs, and small strings.
 */
import type { GeneratedSiteContent, IntakeFormData, Project } from "@/types";

const MIN_CHARS_TO_COMPRESS = 55_000;
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.78;

export async function recompressDataUrlForSave(src: string): Promise<string> {
  const t = src.trim();
  if (!t.startsWith("data:image/") || t.startsWith("data:image/svg")) return src;
  if (t.length < MIN_CHARS_TO_COMPRESS) return src;

  try {
    const blob = await fetch(t).then((r) => r.blob());
    const bitmap = await createImageBitmap(blob);
    try {
      let w = bitmap.width;
      let h = bitmap.height;
      const maxDim = Math.max(w, h);
      if (maxDim > MAX_EDGE) {
        const scale = MAX_EDGE / maxDim;
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return src;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bitmap, 0, 0, w, h);
      const out = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
      return out.length < t.length ? out : src;
    } finally {
      bitmap.close();
    }
  } catch {
    return src;
  }
}

export async function compressProjectSavePayload(payload: {
  intake: IntakeFormData;
  content: GeneratedSiteContent;
  publicSlug: string;
}): Promise<{ intake: IntakeFormData; content: GeneratedSiteContent; publicSlug: string }> {
  const p = JSON.parse(JSON.stringify(payload)) as {
    intake: IntakeFormData;
    content: GeneratedSiteContent;
    publicSlug: string;
  };

  if (p.intake.logoDataUrl) {
    p.intake.logoDataUrl = await recompressDataUrlForSave(p.intake.logoDataUrl);
  }
  if (p.intake.navbarLogoDataUrl) {
    p.intake.navbarLogoDataUrl = await recompressDataUrlForSave(p.intake.navbarLogoDataUrl);
  }

  const assets = p.content.assets;
  if (assets) {
    if (assets.heroSlides?.length) {
      assets.heroSlides = await Promise.all(assets.heroSlides.map(recompressDataUrlForSave));
    }
    if (assets.serviceCardImages && typeof assets.serviceCardImages === "object") {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(assets.serviceCardImages)) {
        next[k] = await recompressDataUrlForSave(v);
      }
      assets.serviceCardImages = next;
    }
    if (assets.parallaxSectionBackgrounds && typeof assets.parallaxSectionBackgrounds === "object") {
      const b = assets.parallaxSectionBackgrounds as Record<string, string | undefined>;
      for (const key of Object.keys(b)) {
        const v = b[key];
        if (typeof v === "string" && v) {
          b[key] = await recompressDataUrlForSave(v);
        }
      }
    }
    if (assets.heroParallaxBackgroundUrl) {
      assets.heroParallaxBackgroundUrl = await recompressDataUrlForSave(assets.heroParallaxBackgroundUrl);
    }
    if (assets.faviconDataUrl && assets.faviconDataUrl.length > MIN_CHARS_TO_COMPRESS) {
      assets.faviconDataUrl = await recompressDataUrlForSave(assets.faviconDataUrl);
    }
    if (assets.portfolioEntries?.length) {
      for (const entry of assets.portfolioEntries) {
        if (entry.photos?.length) {
          entry.photos = await Promise.all(entry.photos.map(recompressDataUrlForSave));
        }
      }
    }
    if (assets.portfolioProjects?.length) {
      assets.portfolioProjects = await Promise.all(
        assets.portfolioProjects.map((row) => Promise.all(row.map(recompressDataUrlForSave)))
      );
    }
  }

  return p;
}

/** Full project JSON import: shrink embedded images before POST. */
export async function compressImportedProject(project: Project): Promise<Project> {
  const c = await compressProjectSavePayload({
    intake: project.intake,
    content: project.content,
    publicSlug: project.publicSlug ?? "",
  });
  return {
    ...project,
    intake: c.intake,
    content: c.content,
    publicSlug: c.publicSlug || project.publicSlug,
  };
}
