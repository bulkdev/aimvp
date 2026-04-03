import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listProjects } from "@/lib/store";
import { appBaseUrl, publicPagesEnabled } from "@/lib/seo";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const projects = await listProjects();
  const base = appBaseUrl();
  const checks = {
    publicPagesEnabled: publicPagesEnabled(),
    appUrlConfigured: !!process.env.NEXT_PUBLIC_APP_URL,
    appUrlLooksProduction: !base.includes("localhost"),
    googleVerificationConfigured: !!process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    gaConfigured: !!process.env.NEXT_PUBLIC_GA_ID,
    projectCount: projects.length,
    projectsWithServiceAreas: projects.filter((p) => (p.content.assets?.serviceAreas?.length || 0) > 0).length,
    projectsWithManualReviews: projects.filter((p) => (p.content.assets?.manualReviews?.length || 0) > 0).length,
  };

  const warnings: string[] = [];
  if (!checks.publicPagesEnabled) warnings.push("Public SEO routes are disabled (NEXT_PUBLIC_ENABLE_PUBLIC_PAGES=false). Remove or set to true to serve /site and sitemap.");
  if (!checks.appUrlConfigured) warnings.push("NEXT_PUBLIC_APP_URL is missing.");
  if (!checks.appUrlLooksProduction) warnings.push("NEXT_PUBLIC_APP_URL appears non-production.");
  if (!checks.googleVerificationConfigured) warnings.push("Google Search Console verification token missing.");
  if (checks.projectCount === 0) warnings.push("No projects found in store.");

  return NextResponse.json({ checks, warnings });
}
