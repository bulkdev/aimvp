import type { NextRequest } from "next/server";

/** Best-effort client IP from proxies (Vercel, Cloudflare). */
export function getClientIpFromHeaders(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip");
  if (real?.trim()) return real.trim();
  return "0.0.0.0";
}

export function getClientIpFromRequest(req: Request): string {
  return getClientIpFromHeaders(req.headers);
}

export function getClientIpFromNextRequest(req: NextRequest): string {
  return getClientIpFromHeaders(req.headers);
}
