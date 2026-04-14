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

/** Meta tags and Facebook often emit `&amp;` in `content` URLs — browsers decode; our fetch must too. */
export function decodeHtmlUrlEntities(value: string): string {
  let s = value;
  s = s.replace(/&amp;/gi, "&").replace(/&#38;/gi, "&");
  s = s.replace(/&quot;/gi, '"').replace(/&#34;/gi, '"');
  s = s.replace(/&#x27;/gi, "'").replace(/&#39;/gi, "'");
  s = s.replace(/&#(\d+);/g, (full, n) => {
    const code = Number(n);
    return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCharCode(code) : full;
  });
  s = s.replace(/&#x([0-9a-f]+);/gi, (full, h) => {
    const code = parseInt(h, 16);
    return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCharCode(code) : full;
  });
  return s.trim();
}

function isFacebookPageHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "facebook.com" || h.endsWith(".facebook.com") || h === "fb.com" || h.endsWith(".fb.com");
}

/** Stable id for a Facebook CDN photo path so we can keep the highest-resolution variant from the HTML. */
function facebookPhotoIdFromCdnUrl(url: string): string {
  const m = url.match(/\/v\/t[\d.]+-\d+\/(\d+_\d+_\d+)_n\./i);
  return m?.[1] ?? url;
}

function facebookCdnResolutionScore(url: string): number {
  const l = url.toLowerCase();
  if (l.includes("t1.30497-1")) return -1;
  if (l.includes("s40x40")) return -1;
  if (l.includes("c81.0.275.275a")) return -1;
  if (l.includes("/emoji/")) return -1;
  if (l.includes("s960x960")) return 120;
  if (l.includes("mx720x960") || l.includes("s720x960")) return 100;
  if (l.includes("dst-jpg_tt6") && !l.includes("s160")) return 88;
  if (l.includes("fb50_s180x540")) return 35;
  if (l.includes("s160x160")) return 25;
  return 40;
}

/**
 * Facebook /photos and profile pages embed many `*.fbcdn.net` URLs in the initial HTML (logged-out).
 * Pick the best resolution per photo; skip stickers/emoji assets.
 */
export function extractFacebookFeedImageUrls(html: string, candidateCap: number): string[] {
  const re =
    /https:\/\/scontent[^"'\\\s<>]*\.fbcdn\.net\/[^"'\\\s<>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\\\s<>]*)?/gi;
  const raw = html.match(re) ?? [];
  const decoded = raw.map((u) => decodeHtmlUrlEntities(u));
  const bestById = new Map<string, { url: string; score: number }>();
  for (const u of decoded) {
    if (!/^https:\/\//i.test(u)) continue;
    const score = facebookCdnResolutionScore(u);
    if (score < 0) continue;
    const id = facebookPhotoIdFromCdnUrl(u);
    const prev = bestById.get(id);
    if (!prev || score > prev.score) bestById.set(id, { url: u, score });
  }
  return [...bestById.values()]
    .sort((a, b) => b.score - a.score)
    .map((x) => x.url)
    .slice(0, candidateCap);
}

/**
 * Ordered unique image URLs from a page — og/twitter first, then `<img>` / `<source srcset>`.
 */
export function extractPortfolioImageUrls(html: string, base: URL, candidateCap: number): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const push = (raw?: string) => {
    if (!raw) return;
    const cleaned = decodeHtmlUrlEntities(raw);
    const abs = toAbsoluteUrl(base, cleaned);
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

  if (isFacebookPageHost(base.hostname)) {
    for (const u of extractFacebookFeedImageUrls(html, candidateCap)) {
      push(u);
    }
  }

  return urls.slice(0, candidateCap);
}
