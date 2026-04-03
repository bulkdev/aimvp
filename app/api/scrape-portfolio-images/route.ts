import { NextRequest, NextResponse } from "next/server";
import type { ApiError } from "@/types";
import { extractPortfolioImageUrls } from "@/lib/pageImageScrape";

async function fetchImageAsDataUrl(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AIWebsiteBuilder/1.0)",
        Accept: "image/*,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return undefined;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) return undefined;

    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length < 800) return undefined;
    if (bytes.length > 2_500_000) return undefined;

    return `data:${contentType.split(";")[0]};base64,${bytes.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { url?: string; maxImages?: number };
    const rawUrl = body?.url?.trim();
    const maxRaw = Number(body?.maxImages);
    const maxImages = Number.isFinite(maxRaw) ? Math.min(24, Math.max(1, Math.floor(maxRaw))) : 8;

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
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AIWebsiteBuilder/1.0)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json<ApiError>(
        { error: `Could not read this page (${res.status}).` },
        { status: 400 }
      );
    }

    const html = await res.text();
    const candidates = extractPortfolioImageUrls(html, parsed, maxImages * 6);
    const images: string[] = [];

    for (const candidate of candidates) {
      if (images.length >= maxImages) break;
      const dataUrl = await fetchImageAsDataUrl(candidate);
      if (dataUrl) images.push(dataUrl);
    }

    if (images.length === 0) {
      return NextResponse.json<ApiError>(
        { error: "No images could be loaded from this page. Try another URL or upload photos manually." },
        { status: 400 }
      );
    }

    return NextResponse.json({ images });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Request failed.";
    return NextResponse.json<ApiError>({ error: msg }, { status: 500 });
  }
}
