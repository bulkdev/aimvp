import { NextResponse } from "next/server";
import type { ShowcaseSite } from "@/lib/showcase-portfolio";
import { getShowcaseSitesFromEnv } from "@/lib/showcase-portfolio";
import { readLandingShowcase } from "@/lib/landing-showcase-store";
import { buildPortfolioEmbedPathForProjectId } from "@/lib/portfolio-embed";

async function withEmbedUrls(sites: ShowcaseSite[]) {
  return Promise.all(
    sites.map(async (s) => ({
      ...s,
      embedUrl: await buildPortfolioEmbedPathForProjectId(s.projectId),
    }))
  );
}

/** Public: ordered list for the marketing homepage portfolio iframes (published URLs, not preview). */
export async function GET() {
  const stored = await readLandingShowcase();
  if (stored.length > 0) {
    return NextResponse.json({ sites: await withEmbedUrls(stored) });
  }
  const fromEnv = getShowcaseSitesFromEnv();
  return NextResponse.json({ sites: await withEmbedUrls(fromEnv) });
}
