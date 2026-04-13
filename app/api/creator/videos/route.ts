import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProject } from "@/lib/store";
import { listCreatorVideos, type CreatorSort } from "@/lib/creator-store";
import { isActiveSubscriber } from "@/lib/creator-membership";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId")?.trim();
  if (!projectId) return NextResponse.json({ error: "Missing projectId." }, { status: 400 });
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  const session = await auth();
  const isMember = isActiveSubscriber(project, session?.user?.id);
  const search = req.nextUrl.searchParams.get("search") || "";
  const category = req.nextUrl.searchParams.get("category") || "";
  const sort = (req.nextUrl.searchParams.get("sort") as CreatorSort) || "newest";
  const cursor = Number(req.nextUrl.searchParams.get("cursor") || "0");
  const limit = Number(req.nextUrl.searchParams.get("limit") || "12");
  const { items, nextCursor } = listCreatorVideos(project, {
    includeMembers: isMember,
    search,
    category,
    sort,
    cursor,
    limit,
  });
  return NextResponse.json({ items, nextCursor, isMember });
}

