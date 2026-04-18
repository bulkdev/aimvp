/**
 * Optional SMS via Twilio REST. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER (E.164).
 * Fails silently (logs) so sites work without SMS configured.
 */
export async function sendSmsOptional(to: string, body: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  if (!sid || !token || !from || !to.trim()) return;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const form = new URLSearchParams({ From: from, To: to.trim(), Body: body.slice(0, 1400) });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      console.error("[sms] Twilio error:", res.status, t.slice(0, 200));
    }
  } catch (e) {
    console.error("[sms] Twilio request failed:", e);
  }
}
