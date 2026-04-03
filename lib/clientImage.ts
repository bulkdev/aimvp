/**
 * Browser-side image compression for admin uploads.
 * Keeps PATCH /api/projects payloads under typical platform limits (e.g. Vercel ~4.5MB).
 */

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
}

/**
 * Resize (max edge) and encode as JPEG. SVG and non-raster types pass through unchanged.
 */
export async function fileToCompressedDataUrl(
  file: File,
  options?: { maxEdge?: number; quality?: number; skipBelowBytes?: number }
): Promise<string> {
  const maxEdge = options?.maxEdge ?? 1920;
  const quality = options?.quality ?? 0.85;
  const skipBelow = options?.skipBelowBytes ?? 120_000;

  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return readFileAsDataUrl(file);
  }

  if (file.size <= skipBelow && file.type !== "image/png") {
    return readFileAsDataUrl(file);
  }

  try {
    const bitmap = await createImageBitmap(file);
    try {
      let w = bitmap.width;
      let h = bitmap.height;
      if (w > maxEdge || h > maxEdge) {
        const scale = maxEdge / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return readFileAsDataUrl(file);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bitmap, 0, 0, w, h);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      if (dataUrl.length > file.size * 1.1 && file.size < 500_000) {
        return readFileAsDataUrl(file);
      }
      return dataUrl;
    } finally {
      bitmap.close();
    }
  } catch {
    return readFileAsDataUrl(file);
  }
}

/** Small PNG/SVG data URL for tab icons (max 64px raster; SVG passes through). */
export async function fileToFaviconDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }
  if (file.type === "image/svg+xml") {
    return readFileAsDataUrl(file);
  }
  try {
    const bitmap = await createImageBitmap(file);
    try {
      const max = 64;
      let w = bitmap.width;
      let h = bitmap.height;
      const scale = max / Math.max(w, h, 1);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return readFileAsDataUrl(file);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL("image/png");
    } finally {
      bitmap.close();
    }
  } catch {
    return readFileAsDataUrl(file);
  }
}
