import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { addCreatorComment } from "@/lib/creator-store";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as {
    projectId?: string;
    videoId?: string;
    parentId?: string;
    body?: string;
  };
  if (!body.projectId || !body.videoId || !body.body?.trim()) {
    return NextResponse.json({ error: "projectId, videoId, and body are required." }, { status: 400 });
  }
  const row = await addCreatorComment({
    projectId: body.projectId,
    videoId: body.videoId,
    parentId: body.parentId,
    body: body.body,
    userId: session.user.id,
    authorName: session.user.name || session.user.email || "Member",
  });
  return NextResponse.json({ comment: row });
}

