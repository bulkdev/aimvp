import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { creatorMediaPath } from "@/lib/creator-media";
import { getProject } from "@/lib/store";
import { isActiveSubscriber } from "@/lib/creator-membership";

function guessType(file: string): string {
  const f = file.toLowerCase();
  if (f.endsWith(".mp4")) return "video/mp4";
  if (f.endsWith(".webm")) return "video/webm";
  if (f.endsWith(".mov")) return "video/quicktime";
  if (f.endsWith(".jpg") || f.endsWith(".jpeg")) return "image/jpeg";
  if (f.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId")?.trim();
  const file = req.nextUrl.searchParams.get("file")?.trim();
  if (!projectId || !file) return NextResponse.json({ error: "Missing projectId/file." }, { status: 400 });
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const cm = project.content.assets?.creatorMembership;
  const session = await auth();
  const isMember = isActiveSubscriber(project, session?.user?.id);
  const requestedUrl = `/api/creator/media?projectId=${encodeURIComponent(projectId)}&file=${encodeURIComponent(file)}`;
  const isProtected = (cm?.videos ?? []).some(
    (v) => v.visibility === "member" && (v.fullVideoUrl === requestedUrl || v.thumbnailUrl === requestedUrl)
  );
  if (isProtected && !isMember) {
    return NextResponse.json({ error: "Subscription required." }, { status: 402 });
  }

  const p = creatorMediaPath(projectId, file);
  if (!fs.existsSync(p)) return NextResponse.json({ error: "File not found." }, { status: 404 });
  const buf = fs.readFileSync(p);
  return new NextResponse(buf, {
    headers: {
      "content-type": guessType(file),
      "cache-control": "public, max-age=3600",
    },
  });
}

