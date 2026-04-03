import { NextResponse } from "next/server";
import { parseDataUrlToBuffer } from "@/lib/data-url";
import { getLandingBranding } from "@/lib/landing-branding";

export async function GET() {
  const { faviconDataUrl } = await getLandingBranding();
  if (!faviconDataUrl?.trim()) {
    return new NextResponse(null, { status: 404 });
  }
  const parsed = parseDataUrlToBuffer(faviconDataUrl);
  if (!parsed) {
    return new NextResponse(null, { status: 404 });
  }
  return new NextResponse(new Uint8Array(parsed.buffer), {
    headers: {
      "Content-Type": parsed.mime || "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
