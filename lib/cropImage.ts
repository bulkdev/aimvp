import type { Area } from "react-easy-crop";

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Failed to load image")));
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

/**
 * Renders the crop **frame** at full size, then draws only the part of the source image that falls
 * inside that frame. Letterboxing uses **transparent** pixels for PNG (preserves logo alpha); JPEG
 * uses an opaque fill (default black). Avoids drawImage clipping when the crop extends past the bitmap.
 */
export async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: Area,
  options?: {
    maxEdge?: number;
    mimeType?: "image/png" | "image/jpeg";
    quality?: number;
    /**
     * Letterbox behind the image. PNG defaults to transparent; set e.g. `"#000000"` for a solid bar.
     * JPEG always needs an opaque color — defaults to `"#000000"` when omitted.
     */
    background?: string;
  }
): Promise<string> {
  const image = await loadImage(imageSrc);
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  const maxEdge = options?.maxEdge ?? 512;

  const cx = pixelCrop.x;
  const cy = pixelCrop.y;
  const cw = Math.max(1, pixelCrop.width);
  const ch = Math.max(1, pixelCrop.height);

  const scale = Math.min(1, maxEdge / Math.max(cw, ch, 1));
  const outW = Math.max(1, Math.round(cw * scale));
  const outH = Math.max(1, Math.round(ch * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Canvas not supported");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const mime = options?.mimeType ?? "image/png";
  if (mime === "image/jpeg") {
    ctx.fillStyle = options?.background ?? "#000000";
    ctx.fillRect(0, 0, outW, outH);
  } else {
    const bg = options?.background;
    if (bg && bg !== "transparent") {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, outW, outH);
    } else {
      ctx.clearRect(0, 0, outW, outH);
    }
  }

  // Intersection: crop rectangle ∩ image bitmap (natural coords)
  const sx0 = Math.max(0, Math.floor(cx));
  const sy0 = Math.max(0, Math.floor(cy));
  const sx1 = Math.min(iw, Math.ceil(cx + cw));
  const sy1 = Math.min(ih, Math.ceil(cy + ch));
  const sw = sx1 - sx0;
  const sh = sy1 - sy0;

  if (sw > 0 && sh > 0) {
    const scaleX = outW / cw;
    const scaleY = outH / ch;
    const dx = (sx0 - cx) * scaleX;
    const dy = (sy0 - cy) * scaleY;
    const dw = sw * scaleX;
    const dh = sh * scaleY;
    ctx.drawImage(image, sx0, sy0, sw, sh, dx, dy, dw, dh);
  }

  const q = options?.quality ?? 0.92;
  return mime === "image/jpeg" ? canvas.toDataURL("image/jpeg", q) : canvas.toDataURL("image/png");
}

/**
 * react-easy-crop passes `croppedAreaPercentages` (0–100 of natural width/height) as the first
 * `onCropAreaChange` argument. Its `croppedAreaPixels` output is aspect-adjusted to the crop frame
 * and can clip wide images — use this instead for export.
 */
export function percentCropToPixelRect(
  croppedAreaPercentages: Area,
  naturalWidth: number,
  naturalHeight: number
): Area {
  const nw = naturalWidth;
  const nh = naturalHeight;
  return {
    x: Math.round((croppedAreaPercentages.x / 100) * nw),
    y: Math.round((croppedAreaPercentages.y / 100) * nh),
    width: Math.max(1, Math.round((croppedAreaPercentages.width / 100) * nw)),
    height: Math.max(1, Math.round((croppedAreaPercentages.height / 100) * nh)),
  };
}

/** Uniform scale: entire image, long edge ≤ maxEdge. PNG. No cropping. */
export async function rasterDataUrlToScaledPng(dataUrl: string, maxEdge = 640): Promise<string> {
  const image = await loadImage(dataUrl);
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  const scale = Math.min(1, maxEdge / Math.max(iw, ih, 1));
  const outW = Math.max(1, Math.round(iw * scale));
  const outH = Math.max(1, Math.round(ih * scale));
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) throw new Error("Canvas not supported");
  ctx.clearRect(0, 0, outW, outH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, 0, 0, iw, ih, 0, 0, outW, outH);
  return canvas.toDataURL("image/png");
}
