import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Failed to load image")));
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

/** Renders the cropped region to a data URL; downscales so logos stay small for API payloads. */
export async function getCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: Area,
  options?: { maxEdge?: number; mimeType?: "image/png" | "image/jpeg"; quality?: number }
): Promise<string> {
  const image = await loadImage(imageSrc);
  const maxEdge = options?.maxEdge ?? 512;
  const { width, height } = pixelCrop;
  const scale = Math.min(1, maxEdge / Math.max(width, height, 1));
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, outW, outH);
  const mime = options?.mimeType ?? "image/png";
  const q = options?.quality ?? 0.92;
  return mime === "image/jpeg" ? canvas.toDataURL("image/jpeg", q) : canvas.toDataURL("image/png");
}
