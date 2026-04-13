import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessProject } from "@/lib/project-access";
import { getProject } from "@/lib/store";
import { creatorAssets } from "@/lib/creator-membership";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const projectId = req.nextUrl.searchParams.get("projectId")?.trim();
  if (!projectId) return NextResponse.json({ error: "Missing projectId." }, { status: 400 });
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (!canAccessProject(project, { id: session.user.id, email: session.user.email || "" })) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const cm = creatorAssets(project.content);
  const totalViews = cm.videos.reduce((sum, v) => sum + v.views, 0);
  const totalEngagement = cm.videos.reduce((sum, v) => sum + v.engagementScore, 0);
  const totalWatchSec = cm.watchHistory.reduce((sum, w) => sum + w.totalWatchSec, 0);
  return NextResponse.json({
    totalViews,
    avgEngagement: cm.videos.length ? Math.round(totalEngagement / cm.videos.length) : 0,
    totalWatchHours: Number((totalWatchSec / 3600).toFixed(1)),
    comments: cm.comments.length,
    activeSubscribers: cm.subscriptions.filter((s) => s.status === "active" || s.status === "trialing").length,
  });
}

