import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isMainAdminEmail } from "@/lib/admin-env";
import { getLandingBranding, setLandingBranding } from "@/lib/landing-branding";

const MAX_FAVICON_CHARS = 400_000;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !isMainAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const branding = await getLandingBranding();
  return NextResponse.json({ branding });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !isMainAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const b = body as { faviconDataUrl?: string | null };
  const faviconDataUrl =
    b.faviconDataUrl === null || b.faviconDataUrl === undefined
      ? null
      : typeof b.faviconDataUrl === "string"
        ? b.faviconDataUrl.trim() || null
        : null;

  if (faviconDataUrl && faviconDataUrl.length > MAX_FAVICON_CHARS) {
    return NextResponse.json({ error: "Favicon is too large. Use a smaller image." }, { status: 400 });
  }
  if (faviconDataUrl && !faviconDataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "Favicon must be an image data URL." }, { status: 400 });
  }

  await setLandingBranding({ faviconDataUrl });
  const branding = await getLandingBranding();
  return NextResponse.json({ ok: true, branding });
}
