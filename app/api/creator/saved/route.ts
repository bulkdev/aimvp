import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { toggleSavedVideo } from "@/lib/creator-store";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as { projectId?: string; videoId?: string };
  if (!body.projectId || !body.videoId) return NextResponse.json({ error: "Missing projectId/videoId." }, { status: 400 });
  await toggleSavedVideo({ projectId: body.projectId, videoId: body.videoId, userId: session.user.id });
  return NextResponse.json({ ok: true });
}

