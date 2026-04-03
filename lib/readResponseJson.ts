/**
 * Parse fetch Response bodies that are usually JSON but may be plain text or HTML
 * when a proxy/CDN returns 413/502 (avoids SyntaxError: Unexpected token …).
 */
export async function readResponseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) {
    return {} as T;
  }
  const first = trimmed[0];
  if (first !== "{" && first !== "[") {
    if (res.status === 413 || /entity too large|payload too large|request too large|body too large/i.test(trimmed)) {
      throw new Error("Request too large — use fewer or smaller images, then try again.");
    }
    throw new Error(trimmed.slice(0, 280) || `Server error (${res.status}).`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(trimmed.slice(0, 280) || "Invalid JSON from server.");
  }
}
