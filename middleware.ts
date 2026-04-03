import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getClientIpFromNextRequest } from "@/lib/client-ip";
import { rateLimitAllow } from "@/lib/rate-limit";

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/auth") && req.method === "POST") {
    const ip = getClientIpFromNextRequest(req);
    const { allowed } = await rateLimitAllow(`auth:${ip}`, "auth");
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }
  }

  if (req.nextUrl.pathname.startsWith("/admin")) {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    // Must match Auth.js secure cookie names on HTTPS (__Secure-authjs.session-token).
    const secureCookie = req.nextUrl.protocol === "https:";
    const token = await getToken({
      req,
      secret,
      secureCookie,
    });
    if (!token) {
      const login = new URL("/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", `${req.nextUrl.pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/auth/:path*"],
};
