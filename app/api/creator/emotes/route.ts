import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { canAccessProject } from "@/lib/project-access";
import { getProject, updateProject } from "@/lib/store";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as {
    projectId?: string;
    code?: string;
    label?: string;
    imageUrl?: string;
  };
  if (!body.projectId || !body.code?.trim() || !body.label?.trim()) {
    return NextResponse.json({ error: "projectId, code, label required." }, { status: 400 });
  }
  const project = await getProject(body.projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (!canAccessProject(project, { id: session.user.id, email: session.user.email || "" })) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const cm = project.content.assets?.creatorMembership;
  if (!cm) return NextResponse.json({ error: "Creator mode missing." }, { status: 400 });
  const emotes = [...(cm.emotes ?? [])].filter((e) => e.code !== body.code);
  emotes.push({ code: body.code.trim(), label: body.label.trim(), imageUrl: body.imageUrl?.trim() || undefined });
  await updateProject(project.id, {
    content: {
      ...project.content,
      assets: { ...project.content.assets, creatorMembership: { ...cm, emotes } },
    },
  });
  return NextResponse.json({ ok: true });
}

