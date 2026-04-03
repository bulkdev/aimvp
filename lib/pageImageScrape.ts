/**
 * Extract candidate image URLs from arbitrary HTML (gallery pages, project pages, etc.).
 */

function extractTagContent(html: string, pattern: RegExp): string | undefined {
  const m = html.match(pattern);
  return m?.[1]?.trim();
}

function extractMetaContent(html: string, attr: "property" | "name", key: string): string | undefined {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const attrMatch = tag.match(new RegExp(`${attr}\\s*=\\s*["']${key}["']`, "i"));
    if (!attrMatch) continue;
    const contentMatch = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i);
    if (contentMatch?.[1]) return contentMatch[1].trim();
  }
  return undefined;
}

export function toAbsoluteUrl(base: URL, value: string): string | undefined {
  const raw = value.trim();
  if (!raw) return undefined;
  if (raw.startsWith("data:")) return raw;
  try {
    return new URL(raw, base).toString();
  } catch {
    return undefined;
  }
}

function parseSrcsetFirstUrl(srcset: string): string | undefined {
  const first = srcset
    .split(",")
    .map((part) => part.trim())
    .find(Boolean);
  if (!first) return undefined;
  return first.split(/\s+/)[0]?.trim();
}

function isLikelyPlaceholderUrl(u: string): boolean {
  const lower = u.toLowerCase();
  if (lower.startsWith("data:image/gif")) return true;
  if (/blank|placeholder|spacer|pixel|lazy|tracking|beacon/i.test(lower)) return true;
  return false;
}

function skipBadImageUrl(u: string): boolean {
  const lower = u.toLowerCase();
  if (!/^https?:\/\//.test(lower)) return true;
  if (/sprite|favicon|icon-?\d|apple-touch|logo\.(svg|png)\b|avatar|emoji|gravatar|pixel\.gif/i.test(lower))
    return true;
  if (/\.svg(\?|$)/i.test(lower)) return true;
  return false;
}

/**
 * Ordered unique image URLs from a page — og/twitter first, then `<img>` / `<source srcset>`.
 */
export function extractPortfolioImageUrls(html: string, base: URL, candidateCap: number): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const push = (raw?: string) => {
    if (!raw) return;
    const abs = toAbsoluteUrl(base, raw);
    if (!abs || isLikelyPlaceholderUrl(abs) || skipBadImageUrl(abs)) return;
    if (seen.has(abs)) return;
    seen.add(abs);
    urls.push(abs);
  };

  push(extractMetaContent(html, "property", "og:image"));
  push(extractMetaContent(html, "name", "twitter:image"));
  push(extractMetaContent(html, "property", "og:image:secure_url"));

  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = extractTagContent(tag, /\brel=["']([^"']+)["']/i)?.toLowerCase() || "";
    if (!/image_src|preload.*image/i.test(rel)) continue;
    push(extractTagContent(tag, /\bhref=["']([^"']+)["']/i));
  }

  for (const m of html.matchAll(/<source\b[^>]*>/gi)) {
    const tag = m[0];
    const srcset = extractTagContent(tag, /\bsrcset=["']([^"']+)["']/i);
    push(parseSrcsetFirstUrl(srcset || ""));
  }

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const srcset = extractTagContent(tag, /\bsrcset=["']([^"']+)["']/i);
    const dataSrcset = extractTagContent(tag, /\bdata-srcset=["']([^"']+)["']/i);
    const dataSrc = extractTagContent(tag, /\bdata-src=["']([^"']+)["']/i);
    const src = extractTagContent(tag, /\bsrc=["']([^"']+)["']/i);
    const preferred =
      parseSrcsetFirstUrl(srcset || "") ||
      parseSrcsetFirstUrl(dataSrcset || "") ||
      dataSrc ||
      src;
    push(preferred);
  }

  return urls.slice(0, candidateCap);
}
