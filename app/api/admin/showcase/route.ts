import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isMainAdminEmail } from "@/lib/admin-env";
import { getProject } from "@/lib/store";
import type { ShowcaseSite } from "@/lib/showcase-portfolio";
import { readLandingShowcase, writeLandingShowcase } from "@/lib/landing-showcase-store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email || !isMainAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const sites = await readLandingShowcase();
  return NextResponse.json({ sites });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.email || !isMainAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const raw = body as { sites?: unknown };
  if (!Array.isArray(raw.sites)) {
    return NextResponse.json({ error: "Expected { sites: [...] }." }, { status: 400 });
  }

  if (raw.sites.length > 12) {
    return NextResponse.json({ error: "At most 12 portfolio entries." }, { status: 400 });
  }

  const seen = new Set<string>();
  const cleaned: ShowcaseSite[] = [];

  for (const item of raw.sites) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.label !== "string" || typeof o.projectId !== "string") continue;
    const label = o.label.trim().slice(0, 80);
    const projectId = o.projectId.trim();
    if (!label || !projectId) continue;
    if (seen.has(projectId)) {
      return NextResponse.json({ error: "Duplicate project in list." }, { status: 400 });
    }
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: `Unknown project id: ${projectId}` }, { status: 400 });
    }
    seen.add(projectId);
    cleaned.push({ label, projectId });
  }

  try {
    await writeLandingShowcase(cleaned);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Save failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sites: cleaned });
}
