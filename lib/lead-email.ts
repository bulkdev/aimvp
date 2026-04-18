import nodemailer from "nodemailer";

export function isSmtpConfigured(): boolean {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(host && user && pass);
}

function buildTransporter() {
  const host = process.env.SMTP_HOST!.trim();
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.trim();
  const port = Number.parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    ...(port === 587 ? { requireTLS: true } : {}),
  });
}

function formatLeadBody(payload: {
  companyName: string;
  location: string;
  email: string;
  phone: string;
  description: string;
}): string {
  const lines = [
    "New message from the landing page contact form.",
    "",
    `Company: ${payload.companyName}`,
    `Location: ${payload.location || "—"}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "—"}`,
    "",
    "Message:",
    payload.description || "—",
  ];
  return lines.join("\n");
}

/**
 * Sends lead notification via SMTP (e.g. Zoho: smtppro.zoho.com, 465 SSL or 587 TLS).
 * Set SMTP_HOST, SMTP_USER, SMTP_PASS. Optional: SMTP_PORT, LEAD_TO_EMAIL (defaults to SMTP_USER), LEAD_FROM_NAME.
 */
export async function sendLeadEmail(payload: {
  companyName: string;
  location: string;
  email: string;
  phone: string;
  description: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, message: "SMTP is not configured." };
  }

  const to = process.env.LEAD_TO_EMAIL?.trim() || process.env.SMTP_USER!.trim();
  const fromAddr = process.env.LEAD_FROM_EMAIL?.trim() || process.env.SMTP_USER!.trim();
  const fromName = process.env.LEAD_FROM_NAME?.trim() || "Website contact form";

  try {
    const transporter = buildTransporter();
    await transporter.sendMail({
      from: `"${fromName.replace(/"/g, "")}" <${fromAddr}>`,
      to,
      replyTo: payload.email,
      subject: `Contact: ${payload.companyName}`,
      text: formatLeadBody(payload),
    });
    return { ok: true };
  } catch (err) {
    console.error("[lead-email] SMTP send failed:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not send email.",
    };
  }
}

function formatSiteLeadBody(payload: {
  siteLabel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  message: string;
}): string {
  return [
    `New message from a generated site: ${payload.siteLabel}`,
    "",
    `Name: ${payload.firstName} ${payload.lastName}`.trim(),
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "—"}`,
    `Address: ${payload.address || "—"}`,
    `Service: ${payload.serviceType || "—"}`,
    "",
    "Message:",
    payload.message || "—",
  ].join("\n");
}

function formatSiteWaitlistBody(payload: {
  siteLabel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDetails: string;
}): string {
  return [
    `Waitlist signup (booking marked fully booked) — ${payload.siteLabel}`,
    "",
    `Name: ${payload.firstName} ${payload.lastName}`.trim(),
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "—"}`,
    "",
    "Preferred timing / notes:",
    payload.preferredDetails || "—",
  ].join("\n");
}

/** Sends a waitlist request to the site owner’s inbox (from intake email). */
export async function sendSiteWaitlistEmail(payload: {
  to: string;
  siteLabel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDetails: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, message: "SMTP is not configured." };
  }

  const fromAddr = process.env.LEAD_FROM_EMAIL?.trim() || process.env.SMTP_USER!.trim();
  const fromName = process.env.LEAD_FROM_NAME?.trim() || "Website contact form";

  try {
    const transporter = buildTransporter();
    await transporter.sendMail({
      from: `"${fromName.replace(/"/g, "")}" <${fromAddr}>`,
      to: payload.to,
      replyTo: payload.email,
      subject: `Waitlist: ${payload.siteLabel}`,
      text: formatSiteWaitlistBody(payload),
    });
    return { ok: true };
  } catch (err) {
    console.error("[lead-email] waitlist SMTP send failed:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not send email.",
    };
  }
}

function formatStudioBookingOwnerBody(payload: {
  siteLabel: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  locationLabel: string;
  serviceTitle: string;
  stylistName: string;
  whenLabel: string;
  duration: string;
  servicePrice: string;
  depositUsd: string;
  notes: string;
}): string {
  return [
    `New studio booking request — ${payload.siteLabel}`,
    "",
    `Name: ${payload.customerName}`,
    `Email: ${payload.customerEmail}`,
    `Phone: ${payload.customerPhone || "—"}`,
    "",
    `Location: ${payload.locationLabel}`,
    `Service: ${payload.serviceTitle}`,
    `Stylist: ${payload.stylistName}`,
    `Requested time: ${payload.whenLabel}`,
    `Duration: ${payload.duration}`,
    `Service price (display): ${payload.servicePrice}`,
    `Deposit charged / due: ${payload.depositUsd}`,
    "",
    "Notes:",
    payload.notes || "—",
    "",
    "Reminder: confirm in your scheduler and send SMS/email follow-up if Stripe was not used.",
  ].join("\n");
}

function formatStudioBookingCustomerBody(payload: {
  siteLabel: string;
  customerName: string;
  locationLabel: string;
  serviceTitle: string;
  stylistName: string;
  whenLabel: string;
  depositUsd: string;
}): string {
  return [
    `Hi ${payload.customerName},`,
    "",
    `Thanks for booking with ${payload.siteLabel}. Here is what we received:`,
    "",
    `Location: ${payload.locationLabel}`,
    `Service: ${payload.serviceTitle}`,
    `Stylist: ${payload.stylistName}`,
    `Requested time: ${payload.whenLabel}`,
    `Deposit: ${payload.depositUsd}`,
    "",
    "We will confirm your appointment shortly. If you need to reschedule, reply to this email or call the studio.",
    "",
    "—",
    payload.siteLabel,
  ].join("\n");
}

/** Owner notification for hair-studio (or similar) booking flow. */
export async function sendStudioBookingOwnerEmail(payload: {
  to: string;
  siteLabel: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  locationLabel: string;
  serviceTitle: string;
  stylistName: string;
  whenLabel: string;
  duration: string;
  servicePrice: string;
  depositUsd: string;
  notes: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, message: "SMTP is not configured." };
  }

  const fromAddr = process.env.LEAD_FROM_EMAIL?.trim() || process.env.SMTP_USER!.trim();
  const fromName = process.env.LEAD_FROM_NAME?.trim() || "Studio booking";

  try {
    const transporter = buildTransporter();
    await transporter.sendMail({
      from: `"${fromName.replace(/"/g, "")}" <${fromAddr}>`,
      to: payload.to,
      replyTo: payload.customerEmail,
      subject: `Booking: ${payload.siteLabel} — ${payload.customerName}`,
      text: formatStudioBookingOwnerBody(payload),
    });
    return { ok: true };
  } catch (err) {
    console.error("[lead-email] studio booking owner SMTP failed:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not send email.",
    };
  }
}

/** Guest confirmation email (same SMTP path). */
export async function sendStudioBookingCustomerEmail(payload: {
  to: string;
  siteLabel: string;
  customerName: string;
  locationLabel: string;
  serviceTitle: string;
  stylistName: string;
  whenLabel: string;
  depositUsd: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, message: "SMTP is not configured." };
  }

  const fromAddr = process.env.LEAD_FROM_EMAIL?.trim() || process.env.SMTP_USER!.trim();
  const fromName = process.env.LEAD_FROM_NAME?.trim() || "Studio booking";

  try {
    const transporter = buildTransporter();
    await transporter.sendMail({
      from: `"${fromName.replace(/"/g, "")}" <${fromAddr}>`,
      to: payload.to,
      subject: `Your appointment request — ${payload.siteLabel}`,
      text: formatStudioBookingCustomerBody(payload),
    });
    return { ok: true };
  } catch (err) {
    console.error("[lead-email] studio booking customer SMTP failed:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not send email.",
    };
  }
}

function formatStudioWaitlistBody(payload: {
  siteLabel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDetails: string;
}): string {
  return [
    `Waitlist — ${payload.siteLabel} (studio)`,
    "",
    `Name: ${payload.firstName} ${payload.lastName}`.trim(),
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || "—"}`,
    "",
    "Preferred timing / service:",
    payload.preferredDetails || "—",
  ].join("\n");
}

export async function sendStudioWaitlistEmail(payload: {
  to: string;
  siteLabel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDetails: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, message: "SMTP is not configured." };
  }

  const fromAddr = process.env.LEAD_FROM_EMAIL?.trim() || process.env.SMTP_USER!.trim();
  const fromName = process.env.LEAD_FROM_NAME?.trim() || "Studio waitlist";

  try {
    const transporter = buildTransporter();
    await transporter.sendMail({
      from: `"${fromName.replace(/"/g, "")}" <${fromAddr}>`,
      to: payload.to,
      replyTo: payload.email,
      subject: `Waitlist: ${payload.siteLabel}`,
      text: formatStudioWaitlistBody(payload),
    });
    return { ok: true };
  } catch (err) {
    console.error("[lead-email] studio waitlist SMTP failed:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not send email.",
    };
  }
}

/** Sends a visitor message to the site owner’s inbox (from intake email). */
export async function sendSiteLeadEmail(payload: {
  to: string;
  siteLabel: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  serviceType: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isSmtpConfigured()) {
    return { ok: false, message: "SMTP is not configured." };
  }

  const fromAddr = process.env.LEAD_FROM_EMAIL?.trim() || process.env.SMTP_USER!.trim();
  const fromName = process.env.LEAD_FROM_NAME?.trim() || "Website contact form";

  try {
    const transporter = buildTransporter();
    await transporter.sendMail({
      from: `"${fromName.replace(/"/g, "")}" <${fromAddr}>`,
      to: payload.to,
      replyTo: payload.email,
      subject: `Website lead: ${payload.siteLabel}`,
      text: formatSiteLeadBody(payload),
    });
    return { ok: true };
  } catch (err) {
    console.error("[lead-email] site SMTP send failed:", err);
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Could not send email.",
    };
  }
}
