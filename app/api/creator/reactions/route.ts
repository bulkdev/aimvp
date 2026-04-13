import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { addReaction } from "@/lib/creator-store";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as {
    projectId?: string;
    emoteCode?: string;
    commentId?: string;
    videoId?: string;
  };
  if (!body.projectId || !body.emoteCode) {
    return NextResponse.json({ error: "projectId and emoteCode are required." }, { status: 400 });
  }
  const reaction = await addReaction({
    projectId: body.projectId,
    userId: session.user.id,
    emoteCode: body.emoteCode,
    commentId: body.commentId,
    videoId: body.videoId,
  });
  return NextResponse.json({ reaction });
}

