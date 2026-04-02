import { NextRequest, NextResponse } from "next/server";
import type { ApiError, EnrichLinkResponse } from "@/types";

function extractTagContent(html: string, pattern: RegExp): string | undefined {
  const m = html.match(pattern);
  return m?.[1]?.trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function firstPhone(text: string): string | undefined {
  const m = text.match(/(\+?\d[\d()\-\s]{7,}\d)/);
  return m?.[1]?.trim();
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
        };
      }
    } catch {
      // Ignore invalid JSON-LD block
    }
  }

  return {};
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
    const localBiz = parseLocalBusinessJsonLd(html);

    const title =
      extractTagContent(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      extractTagContent(html, /<title[^>]*>([^<]+)<\/title>/i);
    const description =
      extractTagContent(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      extractTagContent(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);

    const phone = localBiz.telephone || firstPhone(html);
    const email = localBiz.email || firstEmail(html);
    const address = localBiz.streetAddress;
    const city = localBiz.addressLocality;

    const fields: EnrichLinkResponse["fields"] = {
      sourceLink: parsed.toString(),
      companyName: decodeHtmlEntities(localBiz.name || title || ""),
      businessDescription: decodeHtmlEntities(localBiz.description || description || ""),
      phone: phone || "",
      email: email || "",
      address: address || "",
      city: city || "",
    };

    const notes: string[] = [];
    if (!fields.companyName && !fields.businessDescription) {
      notes.push("Could not reliably detect business details. Try a main website URL.");
    }
    if (/instagram\.com|facebook\.com|maps\.google\./i.test(parsed.hostname)) {
      notes.push("Some social/profile pages limit scraping. You may need to fill missing fields manually.");
    }

    return NextResponse.json<EnrichLinkResponse>({ fields, notes });
  } catch (err) {
    return NextResponse.json<ApiError>(
      { error: "Failed to import details from link.", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

