import { NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import {
  sendStudioBookingCustomerEmail,
  sendStudioBookingOwnerEmail,
} from "@/lib/lead-email";
import { rateLimitAllow } from "@/lib/rate-limit";
import { getClientIpFromRequest } from "@/lib/client-ip";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { resolveSiteVariant } from "@/lib/siteVariant";
import { computeDepositCents, parseStartingPriceUsd } from "@/lib/studio-pricing";
import { sendSmsOptional } from "@/lib/sms-optional";
import { getStripe } from "@/lib/stripe";
import { bookingSlotConflicts } from "@/lib/studio-scheduling";
import { appendStudioAppointment, listStudioAppointments } from "@/lib/studio-appointment-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimStr(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export async function POST(req: Request) {
  const ip = getClientIpFromRequest(req);
  const rl = await rateLimitAllow(`studio:${ip}`, "siteLead");
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

  const variant = resolveSiteVariant(
    project.intake.businessDescription,
    project.intake.siteTemplate ?? "auto",
    project.intake.companyName
  );
  if (variant !== "hairDesignStudio") {
    return NextResponse.json({ error: "Booking is not enabled for this template." }, { status: 400 });
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
  const locationId = trimStr(b.locationId, 80);
  const serviceTitle = trimStr(b.serviceTitle, 200);
  const stylistId = trimStr(b.stylistId, 80);
  const dateIso = trimStr(b.dateIso, 32);
  const timeLabel = trimStr(b.timeLabel, 40);
  const notes = trimStr(b.notes, 4000);
  const rawReturn = trimStr(b.returnPath, 400) || `/site/${projectId}`;
  const returnPath = rawReturn.startsWith("/") ? rawReturn : `/${rawReturn}`;

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!locationId || !serviceTitle || !dateIso || !timeLabel) {
    return NextResponse.json({ error: "Location, service, date, and time are required." }, { status: 400 });
  }

  const cfg = project.content.assets?.hairDesignStudio;
  const loc = cfg?.locations?.find((l) => l.id === locationId);
  if (!loc) {
    return NextResponse.json({ error: "Invalid location." }, { status: 400 });
  }

  const stylist = stylistId
    ? cfg?.stylists?.find((s) => s.id === stylistId)
    : undefined;
  if (stylistId && !stylist) {
    return NextResponse.json({ error: "Invalid stylist." }, { status: 400 });
  }

  const serviceMeta = project.content.services.find((s) => s.title.trim() === serviceTitle);
  if (!serviceMeta) {
    return NextResponse.json({ error: "Invalid service." }, { status: 400 });
  }

  const existingAppts = await listStudioAppointments(projectId);
  if (
    bookingSlotConflicts(existingAppts, {
      locationId,
      dateIso,
      timeLabel,
      stylistId: stylistId || "",
    })
  ) {
    return NextResponse.json(
      { error: "That time was just taken. Pick another slot or stylist." },
      { status: 409 }
    );
  }

  const siteLabel = project.content.brandName?.trim() || project.intake.companyName || "Studio";
  const customerName = `${firstName} ${lastName}`.trim();
  const whenLabel = `${dateIso} · ${timeLabel}`;
  const serviceUsd = parseStartingPriceUsd(serviceMeta.startingPrice);
  const depositCents = computeDepositCents({
    serviceUsd,
    depositPercent: cfg?.depositPercent,
    depositFlatUsd: cfg?.depositFlatUsd,
  });
  const depositUsd = `$${(depositCents / 100).toFixed(2)}`;
  const servicePrice = serviceMeta.startingPrice?.trim() || "—";
  const duration = serviceMeta.duration?.trim() || "—";
  const stylistName = stylist?.name?.trim() || "Any available artist";

  const ownerPayload = {
    to,
    siteLabel,
    customerName,
    customerEmail: email,
    customerPhone: phone,
    locationLabel: `${loc.name} — ${loc.address}`,
    serviceTitle,
    stylistName,
    whenLabel,
    duration,
    servicePrice,
    depositUsd,
    notes,
  };

  const ownerSent = await sendStudioBookingOwnerEmail(ownerPayload);
  if (!ownerSent.ok) {
    return NextResponse.json(
      { error: "Could not submit booking. Email is not configured on the server." },
      { status: 503 }
    );
  }

  try {
    await appendStudioAppointment({
      projectId,
      locationId,
      dateIso,
      timeLabel,
      stylistId: stylistId || null,
      serviceTitle,
      customerEmail: email,
      customerName,
      status: "pending_deposit",
    });
  } catch (e) {
    console.error("[studio-booking] persist appointment failed:", e);
  }

  const custSent = await sendStudioBookingCustomerEmail({
    to: email,
    siteLabel,
    customerName,
    locationLabel: loc.shortLabel || loc.name,
    serviceTitle,
    stylistName,
    whenLabel,
    depositUsd,
  });
  if (!custSent.ok) {
    console.warn("[studio-booking] owner notified but guest confirmation failed");
  }

  const smsBody = `${siteLabel}: Received your request for ${whenLabel}. Deposit ${depositUsd}. We will confirm shortly.`;
  if (phone) {
    await sendSmsOptional(phone, smsBody);
  }

  let checkoutUrl: string | undefined;
  try {
    const stripe = getStripe();
    const origin = new URL(req.url).origin;
    const successUrl = new URL(`${returnPath}?booking=success`, origin).toString();
    const cancelUrl = new URL(`${returnPath}?booking=cancel`, origin).toString();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${siteLabel} — booking deposit`,
              description: `${serviceTitle} · ${whenLabel}`,
            },
            unit_amount: depositCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        projectId,
        template: "hairDesignStudio",
        locationId,
        serviceTitle: serviceTitle.slice(0, 120),
        stylistId: stylistId || "",
        dateIso,
        timeLabel,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    checkoutUrl = session.url ?? undefined;
  } catch {
    /* Stripe optional */
  }

  return NextResponse.json({
    ok: true,
    mode: checkoutUrl ? "stripe" : "email",
    checkoutUrl: checkoutUrl ?? null,
  });
}
