import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessProject } from "@/lib/project-access";
import { getProject, updateProject } from "@/lib/store";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as {
    projectId?: string;
    commentId?: string;
    action?: "highlight" | "remove";
  };
  if (!body.projectId || !body.commentId || !body.action) {
    return NextResponse.json({ error: "projectId, commentId, action required." }, { status: 400 });
  }
  const project = await getProject(body.projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (!canAccessProject(project, { id: session.user.id, email: session.user.email || "" })) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const cm = project.content.assets?.creatorMembership;
  if (!cm) return NextResponse.json({ error: "Creator mode missing." }, { status: 400 });
  const comments = [...(cm.comments ?? [])];
  const idx = comments.findIndex((c) => c.id === body.commentId);
  if (idx === -1) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  if (body.action === "remove") comments.splice(idx, 1);
  else comments[idx] = { ...comments[idx], highlightedByCreator: !comments[idx].highlightedByCreator };
  await updateProject(project.id, {
    content: {
      ...project.content,
      assets: { ...project.content.assets, creatorMembership: { ...cm, comments } },
    },
  });
  return NextResponse.json({ ok: true });
}

