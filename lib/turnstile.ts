import { getClientIpFromRequest } from "@/lib/client-ip";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

/**
 * Verifies a Turnstile token server-side.
 * When `TURNSTILE_SECRET_KEY` is unset, returns `true` (local dev without keys).
 */
export async function verifyTurnstileToken(token: string | undefined, request: Request): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) return true;

  const t = typeof token === "string" ? token.trim() : "";
  if (!t) return false;

  const ip = getClientIpFromRequest(request);

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", t);
    if (ip && ip !== "0.0.0.0") body.set("remoteip", ip);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!data.success) {
      console.warn("[turnstile] verify failed:", data["error-codes"]);
    }
    return Boolean(data.success);
  } catch (e) {
    console.error("[turnstile] verify error:", e);
    return false;
  }
}
