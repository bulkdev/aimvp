import { NextRequest, NextResponse } from "next/server";
import { parseDataUrlToBuffer } from "@/lib/data-url";
import { getProject } from "@/lib/store";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId")?.trim();
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId." }, { status: 400 });
  }
  const project = await getProject(projectId);
  const dataUrl = project?.content.assets?.faviconDataUrl?.trim();
  if (!dataUrl) {
    return new NextResponse(null, { status: 404 });
  }
  const parsed = parseDataUrlToBuffer(dataUrl);
  if (!parsed) {
    return new NextResponse(null, { status: 404 });
  }
  return new NextResponse(new Uint8Array(parsed.buffer), {
    headers: {
      "Content-Type": parsed.mime || "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
