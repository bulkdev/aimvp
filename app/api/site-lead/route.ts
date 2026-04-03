import { NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import { sendSiteLeadEmail } from "@/lib/lead-email";
import { rateLimitAllow } from "@/lib/rate-limit";
import { getClientIpFromRequest } from "@/lib/client-ip";
import { verifyTurnstileToken } from "@/lib/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimStr(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export async function POST(req: Request) {
  const ip = getClientIpFromRequest(req);
  const rl = await rateLimitAllow(`site:${ip}`, "siteLead");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
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

  const b = body as Record<string, unknown>;

  if (typeof b.website === "string" && b.website.trim() !== "") {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ ok: true });
  }

  if (!(await verifyTurnstileToken(typeof b.turnstileToken === "string" ? b.turnstileToken : undefined, req))) {
    return NextResponse.json({ error: "Captcha verification failed." }, { status: 400 });
  }

  const projectId = trimStr(b.projectId, 80);
  if (!projectId) {
    return NextResponse.json({ error: "Missing site reference." }, { status: 400 });
  }

  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const to = project.intake.email?.trim();
  if (!to || !EMAIL_RE.test(to)) {
    return NextResponse.json(
      { error: "This site does not have a valid contact email configured." },
      { status: 400 }
    );
  }

  const firstName = trimStr(b.firstName, 120);
  const lastName = trimStr(b.lastName, 120);
  const email = trimStr(b.email, 320);
  const phone = trimStr(b.phone, 50);
  const address = trimStr(b.address, 500);
  const serviceType = trimStr(b.serviceType, 300);
  const message = trimStr(b.message, 8000);

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const siteLabel = project.content.brandName?.trim() || project.intake.companyName || "Your site";

  const sent = await sendSiteLeadEmail({
    to,
    siteLabel,
    firstName,
    lastName,
    email,
    phone,
    address,
    serviceType,
    message,
  });

  if (!sent.ok) {
    return NextResponse.json(
      { error: "Could not send your message. Please try again later." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true });
}
