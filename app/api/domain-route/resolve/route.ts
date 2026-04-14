import { NextRequest, NextResponse } from "next/server";
import { buildPublishedBasePath } from "@/lib/seo";
import { getProjectByCustomDomain } from "@/lib/store";
import { parseRequestHost } from "@/lib/custom-domain";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const hostParam = req.nextUrl.searchParams.get("host") || "";
  const host = parseRequestHost(hostParam);
  if (!host) return NextResponse.json({ found: false }, { status: 200 });

  const project = await getProjectByCustomDomain(host);
  if (!project) return NextResponse.json({ found: false }, { status: 200 });

  return NextResponse.json(
    {
      found: true,
      projectId: project.id,
      publicSlug: project.publicSlug || null,
      basePath: buildPublishedBasePath(project),
    },
    { status: 200 }
  );
}
