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
