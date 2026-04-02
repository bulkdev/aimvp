import { NextRequest, NextResponse } from "next/server";
import type { ApiError, EnrichLinkResponse } from "@/types";

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

function toAbsoluteUrl(base: URL, value: string): string | undefined {
  const raw = value.trim();
  if (!raw) return undefined;
  if (raw.startsWith("data:")) return raw;
  try {
    return new URL(raw, base).toString();
  } catch {
    return undefined;
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripNonContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ");
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
  if (lower.startsWith("data:image/gif")) return true; // common 1x1 transparent pixel
  if (/blank|placeholder|spacer|pixel|lazy/i.test(lower)) return true;
  return false;
}

function extractLogoCandidates(html: string, base: URL): string[] {
  const candidates: string[] = [];
  const push = (value?: string) => {
    if (!value) return;
    const abs = toAbsoluteUrl(base, value);
    if (!abs || isLikelyPlaceholderUrl(abs)) return;
    candidates.push(abs);
  };

  // Explicit logo hints in metadata.
  push(extractMetaContent(html, "property", "og:logo"));
  push(extractMetaContent(html, "property", "og:image:logo"));
  push(extractMetaContent(html, "name", "logo"));

  // Highest priority: logo-like images inside header/nav landmarks.
  const headerBlocks = [
    ...Array.from(html.matchAll(/<header\b[^>]*>[\s\S]*?<\/header>/gi)).map((m) => m[0]),
    ...Array.from(html.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi)).map((m) => m[0]),
  ];
  for (const block of headerBlocks) {
    for (const m of block.matchAll(/<img\b[^>]*>/gi)) {
      const tag = m[0];
      const src =
        parseSrcsetFirstUrl(extractTagContent(tag, /\bsrcset=["']([^"']+)["']/i) || "") ||
        parseSrcsetFirstUrl(extractTagContent(tag, /\bdata-srcset=["']([^"']+)["']/i) || "") ||
        extractTagContent(tag, /\bdata-src=["']([^"']+)["']/i) ||
        extractTagContent(tag, /\bsrc=["']([^"']+)["']/i);
      const alt = extractTagContent(tag, /\balt=["']([^"']*)["']/i)?.toLowerCase() || "";
      const cls = extractTagContent(tag, /\bclass=["']([^"']*)["']/i)?.toLowerCase() || "";
      const id = extractTagContent(tag, /\bid=["']([^"']*)["']/i)?.toLowerCase() || "";
      if (/logo|brand|site-?logo/.test(`${alt} ${cls} ${id}`) || src?.toLowerCase().includes("logo")) {
        push(src);
      }
    }
  }

  // Link rel-based logos/icons.
  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    const rel = extractTagContent(tag, /\brel=["']([^"']+)["']/i)?.toLowerCase() || "";
    const href = extractTagContent(tag, /\bhref=["']([^"']+)["']/i);
    if (/logo|icon|apple-touch-icon|mask-icon/.test(rel)) {
      push(href);
    }
  }

  // Image tags that explicitly look like logos.
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src =
      parseSrcsetFirstUrl(extractTagContent(tag, /\bsrcset=["']([^"']+)["']/i) || "") ||
      parseSrcsetFirstUrl(extractTagContent(tag, /\bdata-srcset=["']([^"']+)["']/i) || "") ||
      extractTagContent(tag, /\bdata-src=["']([^"']+)["']/i) ||
      extractTagContent(tag, /\bsrc=["']([^"']+)["']/i);
    const alt = extractTagContent(tag, /\balt=["']([^"']*)["']/i)?.toLowerCase() || "";
    const cls = extractTagContent(tag, /\bclass=["']([^"']*)["']/i)?.toLowerCase() || "";
    const id = extractTagContent(tag, /\bid=["']([^"']*)["']/i)?.toLowerCase() || "";
    if (/logo|brand/.test(`${alt} ${cls} ${id}`)) {
      push(src);
    }
  }

  return Array.from(new Set(candidates)).slice(0, 12);
}

function firstPhone(text: string): string | undefined {
  const normalized = text.replace(/\s+/g, " ");
  const matches = Array.from(normalized.matchAll(/(?:\+?\d[\d().\-\s]{7,}\d)/g)).map((m) => m[0]?.trim());
  for (const raw of matches) {
    if (!raw) continue;
    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(raw)) continue; // date-like
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) continue;
    return raw;
  }
  return undefined;
}

function firstEmail(text: string): string | undefined {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m?.[0];
}

function parseLocalBusinessJsonLd(html: string): {
  name?: string;
  description?: string;
  telephone?: string;
  email?: string;
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  logo?: string;
} {
  const scripts = Array.from(html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))
    .map((m) => m[1]?.trim())
    .filter(Boolean) as string[];

  for (const raw of scripts) {
    try {
      const json = JSON.parse(raw);
      const candidates = Array.isArray(json)
        ? json
        : Array.isArray(json?.["@graph"])
          ? json["@graph"]
          : [json];

      for (const node of candidates) {
        const type = node?.["@type"];
        const types = Array.isArray(type) ? type : [type];
        if (!types.some((t) => typeof t === "string" && /LocalBusiness|Organization|Plumber/i.test(t))) continue;

        const address = node?.address ?? {};
        return {
          name: node?.name,
          description: node?.description,
          telephone: node?.telephone,
          email: node?.email,
          streetAddress: address?.streetAddress,
          addressLocality: address?.addressLocality,
          addressRegion: address?.addressRegion,
          logo: typeof node?.logo === "string" ? node.logo : node?.logo?.url,
        };
      }
    } catch {
      // Ignore invalid JSON-LD block
    }
  }

  return {};
}

function extractImageCandidates(html: string, base: URL): string[] {
  const urls: string[] = [];
  const push = (u?: string) => {
    if (!u) return;
    if (!/^https?:|^data:/.test(u)) return;
    if (isLikelyPlaceholderUrl(u)) return;
    urls.push(u);
  };

  const ogImage = extractMetaContent(html, "property", "og:image");
  push(toAbsoluteUrl(base, ogImage || ""));

  const twitterImage = extractMetaContent(html, "name", "twitter:image");
  push(toAbsoluteUrl(base, twitterImage || ""));

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const srcset = extractTagContent(tag, /\bsrcset=["']([^"']+)["']/i);
    const dataSrcset = extractTagContent(tag, /\bdata-srcset=["']([^"']+)["']/i);
    const dataSrc = extractTagContent(tag, /\bdata-src=["']([^"']+)["']/i);
    const src = extractTagContent(tag, /\bsrc=["']([^"']+)["']/i);

    // Prefer richer lazy-load sources over placeholder src values.
    const preferred =
      parseSrcsetFirstUrl(srcset || "") ||
      parseSrcsetFirstUrl(dataSrcset || "") ||
      dataSrc ||
      src;
    push(toAbsoluteUrl(base, preferred || ""));
  }

  const unique = Array.from(new Set(urls));
  return unique.filter((u) => !/sprite|icon|avatar|favicon/i.test(u)).slice(0, 16);
}

async function fetchImageAsDataUrl(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SiteGenAI/1.0; +https://example.com)",
        Accept: "image/*",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return undefined;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return undefined;

    const bytes = Buffer.from(await res.arrayBuffer());
    // Skip tiny tracker pixels / transparent placeholders.
    if (bytes.length < 1024) return undefined;
    // Keep payloads reasonable for intake payload size.
    if (bytes.length > 2_000_000) return undefined;

    return `data:${contentType};base64,${bytes.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string };
    const rawUrl = body?.url?.trim();
    if (!rawUrl) {
      return NextResponse.json<ApiError>({ error: "URL is required." }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      return NextResponse.json<ApiError>({ error: "Please enter a valid URL." }, { status: 400 });
    }
    if (!/^https?:$/.test(parsed.protocol)) {
      return NextResponse.json<ApiError>({ error: "Only http/https links are supported." }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SiteGenAI/1.0; +https://example.com)",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json<ApiError>(
        { error: `Could not read this page (${res.status}). Try another link.` },
        { status: 400 }
      );
    }

    const html = await res.text();
    const plainText = stripNonContent(html);
    const localBiz = parseLocalBusinessJsonLd(html);
    const candidates = extractImageCandidates(html, parsed);
    const logoCandidates = extractLogoCandidates(html, parsed);

    const title =
      extractTagContent(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      extractTagContent(html, /<title[^>]*>([^<]+)<\/title>/i);
    const description =
      extractTagContent(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      extractTagContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

    const telHrefPhone = extractTagContent(html, /<a[^>]+href=["']tel:([^"']+)["']/i)?.replace(/[%20\s]/g, "");
    const phone = localBiz.telephone || telHrefPhone || firstPhone(plainText);
    const email = localBiz.email || firstEmail(plainText);
    const address = localBiz.streetAddress;
    const city = localBiz.addressLocality;
    const state = localBiz.addressRegion;
    const logoUrl =
      toAbsoluteUrl(parsed, localBiz.logo || "") ||
      logoCandidates[0] ||
      "";
    const [logoDataUrl, ...imageDataUrls] = await Promise.all(
      [logoUrl, ...candidates.slice(0, 12)].map(async (u) => (u ? fetchImageAsDataUrl(u) : undefined))
    );
    const validImageDataUrls = imageDataUrls.filter(Boolean) as string[];
    const heroSlides = validImageDataUrls.slice(0, 4);
    const portfolioImages = validImageDataUrls.slice(4, 13);
    const importedPortfolioProjects =
      portfolioImages.length > 0
        ? [portfolioImages.slice(0, 3), portfolioImages.slice(3, 6), portfolioImages.slice(6, 9)].filter(
            (g) => g.length > 0
          )
        : [];

    const fields: EnrichLinkResponse["fields"] = {
      sourceLink: parsed.toString(),
      companyName: decodeHtmlEntities(localBiz.name || title || ""),
      businessDescription: decodeHtmlEntities(localBiz.description || description || ""),
      phone: phone || "",
      email: email || "",
      address: address || "",
      city: city || "",
      state: state || "",
      importedLogoUrl: logoDataUrl || "",
      importedHeroSlides: heroSlides,
      importedPortfolioProjects,
    };

    const notes: string[] = [];
    if (!fields.companyName && !fields.businessDescription) {
      notes.push("Could not reliably detect business details. Try a main website URL.");
    }
    if (/instagram\.com|facebook\.com|maps\.google\./i.test(parsed.hostname)) {
      notes.push("Some social/profile pages limit scraping. You may need to fill missing fields manually.");
    }
    if (!fields.importedLogoUrl) {
      notes.push("Could not confidently detect a usable logo from this link.");
    }
    if (heroSlides.length === 0 && importedPortfolioProjects.length === 0) {
      notes.push("No embeddable images were found from this page. You can upload images manually.");
    }

    return NextResponse.json<EnrichLinkResponse>({ fields, notes });
  } catch (err) {
    return NextResponse.json<ApiError>(
      { error: "Failed to import details from link.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

