import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { updateWatchProgress } from "@/lib/creator-store";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = (await req.json()) as {
    projectId?: string;
    videoId?: string;
    progressPct?: number;
    watchSecDelta?: number;
  };
  if (!body.projectId || !body.videoId) {
    return NextResponse.json({ error: "projectId and videoId are required." }, { status: 400 });
  }
  await updateWatchProgress({
    projectId: body.projectId,
    userId: session.user.id,
    videoId: body.videoId,
    progressPct: Number(body.progressPct || 0),
    watchSecDelta: Number(body.watchSecDelta || 0),
  });
  return NextResponse.json({ ok: true });
}

