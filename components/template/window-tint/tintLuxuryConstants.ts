/** Match video URLs in hero slides (or validate pasted links). */
export const TINT_VIDEO_EXT_RE = /\.(mp4|webm|ogg)(\?.*)?$/i;

export function firstHeroVideoFromSlides(slides?: string[]): string | undefined {
  for (const raw of slides ?? []) {
    const u = raw?.trim();
    if (u && TINT_VIDEO_EXT_RE.test(u)) return u;
  }
  return undefined;
}

export function firstHeroStillFromSlides(slides?: string[]): string | undefined {
  for (const raw of slides ?? []) {
    const u = raw?.trim();
    if (u && !TINT_VIDEO_EXT_RE.test(u)) return u;
  }
  return undefined;
}

/** Fallback imagery when the project has no hero slides / portfolio rows. */
export const TINT_FALLBACK_HERO =
  "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=2400&q=85";

export const TINT_FALLBACK_SECOND =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2400&q=85";

/** Typographic “marque” brands — no official logos (wordmarks only). */
export const TINT_TRUST_WORDMARKS = ["BMW", "Mercedes‑Benz", "Audi", "Porsche", "Tesla", "Lexus"] as const;

export type TintVltKey = "none" | "v35" | "v20" | "v5";

/** Visual darkness overlay alpha (not literal VLT physics). */
export const TINT_VLT_STYLES: Record<
  TintVltKey,
  { label: string; sub: string; overlay: number; sheen: string }
> = {
  none: { label: "Factory glass", sub: "No film", overlay: 0, sheen: "rgba(255,255,255,0.12)" },
  v35: { label: "35% VLT", sub: "Balanced daily driver", overlay: 0.38, sheen: "rgba(147,197,255,0.08)" },
  v20: { label: "20% VLT", sub: "Privacy + clarity", overlay: 0.58, sheen: "rgba(180,170,255,0.1)" },
  v5: { label: "5% VLT", sub: "Maximum privacy", overlay: 0.82, sheen: "rgba(120,100,255,0.14)" },
};
