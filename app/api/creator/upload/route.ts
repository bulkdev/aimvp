import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessProject } from "@/lib/project-access";
import { getProject, updateProject } from "@/lib/store";
import { saveCreatorMediaFile } from "@/lib/creator-media";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const form = await req.formData();
  const projectId = String(form.get("projectId") || "").trim();
  const assetType = String(form.get("assetType") || "video").trim();
  const targetId = String(form.get("targetId") || "").trim();
  const file = form.get("file");
  if (!projectId || !targetId || !(file instanceof File)) {
    return NextResponse.json({ error: "projectId, targetId, and file are required." }, { status: 400 });
  }
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (!canAccessProject(project, { id: session.user.id, email: session.user.email || "" })) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { fileName } = await saveCreatorMediaFile(projectId, file);
  const assetUrl = `/api/creator/media?projectId=${encodeURIComponent(projectId)}&file=${encodeURIComponent(fileName)}`;
  const cm = project.content.assets?.creatorMembership;
  if (!cm) return NextResponse.json({ error: "Creator template not configured." }, { status: 400 });

  const videos = [...(cm.videos ?? [])];
  const reels = [...(cm.reels ?? [])];

  if (assetType === "thumbnail") {
    const vidIdx = videos.findIndex((v) => v.id === targetId);
    const reelIdx = reels.findIndex((r) => r.id === targetId);
    if (vidIdx >= 0) videos[vidIdx] = { ...videos[vidIdx], thumbnailUrl: assetUrl };
    if (reelIdx >= 0) reels[reelIdx] = { ...reels[reelIdx], thumbnailUrl: assetUrl };
  } else if (assetType === "reel") {
    const reelIdx = reels.findIndex((r) => r.id === targetId);
    if (reelIdx >= 0) reels[reelIdx] = { ...reels[reelIdx], previewVideoUrl: assetUrl };
  } else {
    const vidIdx = videos.findIndex((v) => v.id === targetId);
    if (vidIdx >= 0) videos[vidIdx] = { ...videos[vidIdx], fullVideoUrl: assetUrl };
  }

  await updateProject(project.id, {
    content: {
      ...project.content,
      assets: {
        ...project.content.assets,
        creatorMembership: {
          ...cm,
          videos,
          reels,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, assetUrl });
}

