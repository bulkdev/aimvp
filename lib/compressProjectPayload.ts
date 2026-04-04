/**
 * Recompresses large raster data URLs before save/import so PATCH bodies stay under platform limits
 * (e.g. Vercel serverless ~4.5MB). Skips SVG, remote URLs, and small strings.
 */
import type { GeneratedSiteContent, IntakeFormData, Project } from "@/types";

/** Tunable knobs for one pass of raster recompression. */
export type RecompressForSaveOptions = {
  /** Skip data URLs shorter than this (chars). */
  minChars: number;
  maxEdge: number;
  quality: number;
};

/** Default pass: compresses many “medium” embedded images that still add up to a huge JSON. */
export const RECOMPRESS_STANDARD: RecompressForSaveOptions = {
  minChars: 10_000,
  maxEdge: 1600,
  quality: 0.78,
};

/** Second pass when the PATCH body is still too large after {@link RECOMPRESS_STANDARD}. */
export const RECOMPRESS_AGGRESSIVE: RecompressForSaveOptions = {
  minChars: 2_500,
  maxEdge: 900,
  quality: 0.62,
};

export async function recompressDataUrlForSave(
  src: string,
  opts: RecompressForSaveOptions = RECOMPRESS_STANDARD
): Promise<string> {
  const t = src.trim();
  if (!t.startsWith("data:image/") || t.startsWith("data:image/svg")) return src;
  if (t.length < opts.minChars) return src;

  try {
    const blob = await fetch(t).then((r) => r.blob());
    const bitmap = await createImageBitmap(blob);
    try {
      let w = bitmap.width;
      let h = bitmap.height;
      const maxDim = Math.max(w, h);
      if (maxDim > opts.maxEdge) {
        const scale = opts.maxEdge / maxDim;
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
      const out = canvas.toDataURL("image/jpeg", opts.quality);
      return out.length < t.length ? out : src;
    } finally {
      bitmap.close();
    }
  } catch {
    return src;
  }
}

async function compressProjectSavePayloadWithOpts(
  payload: {
    intake: IntakeFormData;
    content: GeneratedSiteContent;
    publicSlug: string;
  },
  opts: RecompressForSaveOptions
): Promise<{ intake: IntakeFormData; content: GeneratedSiteContent; publicSlug: string }> {
  const p = JSON.parse(JSON.stringify(payload)) as {
    intake: IntakeFormData;
    content: GeneratedSiteContent;
    publicSlug: string;
  };

  const rc = (s: string) => recompressDataUrlForSave(s, opts);

  if (p.intake.logoDataUrl) {
    p.intake.logoDataUrl = await rc(p.intake.logoDataUrl);
  }
  if (p.intake.navbarLogoDataUrl) {
    p.intake.navbarLogoDataUrl = await rc(p.intake.navbarLogoDataUrl);
  }

  const assets = p.content.assets;
  if (assets) {
    if (assets.heroSlides?.length) {
      assets.heroSlides = await Promise.all(assets.heroSlides.map(rc));
    }
    if (assets.serviceCardImages && typeof assets.serviceCardImages === "object") {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(assets.serviceCardImages)) {
        next[k] = await rc(v);
      }
      assets.serviceCardImages = next;
    }
    if (assets.parallaxSectionBackgrounds && typeof assets.parallaxSectionBackgrounds === "object") {
      const b = assets.parallaxSectionBackgrounds as Record<string, string | undefined>;
      for (const key of Object.keys(b)) {
        const v = b[key];
        if (typeof v === "string" && v) {
          b[key] = await rc(v);
        }
      }
    }
    if (assets.heroParallaxBackgroundUrl) {
      assets.heroParallaxBackgroundUrl = await rc(assets.heroParallaxBackgroundUrl);
    }
    if (assets.faviconDataUrl && assets.faviconDataUrl.length > opts.minChars) {
      assets.faviconDataUrl = await rc(assets.faviconDataUrl);
    }
    if (assets.portfolioEntries?.length) {
      for (const entry of assets.portfolioEntries) {
        if (entry.photos?.length) {
          entry.photos = await Promise.all(entry.photos.map(rc));
        }
      }
    }
    if (assets.portfolioProjects?.length) {
      assets.portfolioProjects = await Promise.all(
        assets.portfolioProjects.map((row) => Promise.all(row.map(rc)))
      );
    }
  }

  return p;
}

export async function compressProjectSavePayload(
  payload: {
    intake: IntakeFormData;
    content: GeneratedSiteContent;
    publicSlug: string;
  },
  tier: "standard" | "aggressive" = "standard"
): Promise<{ intake: IntakeFormData; content: GeneratedSiteContent; publicSlug: string }> {
  const opts = tier === "aggressive" ? RECOMPRESS_AGGRESSIVE : RECOMPRESS_STANDARD;
  return compressProjectSavePayloadWithOpts(payload, opts);
}

export type ProjectSavePatchPayload = {
  intake: IntakeFormData;
  content: GeneratedSiteContent;
  publicSlug: string;
};

/**
 * Under this serialized size, skip recompressing on PATCH (payload already fits typical limits).
 * Keep a margin below ~4.5MB host caps (UTF-16 length ≈ bytes for base64-heavy JSON).
 */
export const PATCH_SKIP_IMAGE_RECOMPRESS_MAX_CHARS = 2_400_000;

/** If still above this after aggressive pass, block save with a clear error (before fetch). */
export const PATCH_BODY_HARD_MAX_CHARS = 4_100_000;

/** Run a second pass when the first pass is still this large (room before hard max). */
const PATCH_RUN_AGGRESSIVE_AFTER_CHARS = 3_400_000;

/**
 * Returns the request body string for PATCH /api/projects/:id. Recompresses embedded images when the
 * JSON is large; runs a second aggressive pass if needed. Many medium-sized data URLs (each under the
 * old 55k threshold) could still overflow the request — standard {@link RECOMPRESS_STANDARD} uses a
 * lower per-image floor so those get compressed too.
 */
export async function stringifyProjectPatchBody(
  payload: ProjectSavePatchPayload
): Promise<{ body: string; imageRecompressed: boolean }> {
  const raw = JSON.stringify(payload);
  if (raw.length <= PATCH_SKIP_IMAGE_RECOMPRESS_MAX_CHARS) {
    return { body: raw, imageRecompressed: false };
  }

  const parsed = JSON.parse(raw) as ProjectSavePatchPayload;
  let data = await compressProjectSavePayload(parsed, "standard");
  let body = JSON.stringify(data);

  if (body.length > PATCH_RUN_AGGRESSIVE_AFTER_CHARS) {
    data = await compressProjectSavePayload(JSON.parse(body) as ProjectSavePatchPayload, "aggressive");
    body = JSON.stringify(data);
  }

  if (body.length > PATCH_BODY_HARD_MAX_CHARS) {
    throw new Error(
      "Save payload is still too large after compressing images. Remove some hero slides, portfolio photos, or service images, then save again."
    );
  }

  return { body, imageRecompressed: true };
}

/** Full project JSON import: shrink embedded images before POST. */
export async function compressImportedProject(project: Project): Promise<Project> {
  const c = await compressProjectSavePayload(
    {
      intake: project.intake,
      content: project.content,
      publicSlug: project.publicSlug ?? "",
    },
    "standard"
  );
  return {
    ...project,
    intake: c.intake,
    content: c.content,
    publicSlug: c.publicSlug || project.publicSlug,
  };
}
