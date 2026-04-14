import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getClientIpFromNextRequest } from "@/lib/client-ip";
import { rateLimitAllow } from "@/lib/rate-limit";
import { isAppHost, parseRequestHost } from "@/lib/custom-domain";

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

  const path = req.nextUrl.pathname;
  const isPublicAsset =
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/robots.txt") ||
    path.startsWith("/sitemap") ||
    path.startsWith("/manifest") ||
    path.startsWith("/icon") ||
    path.startsWith("/opengraph-image") ||
    path.startsWith("/twitter-image");
  const skipRewrite =
    isPublicAsset ||
    path.startsWith("/api/") ||
    path.startsWith("/admin") ||
    path.startsWith("/login") ||
    path.startsWith("/register");

  if (!skipRewrite) {
    const requestHost = parseRequestHost(req.headers.get("x-forwarded-host") || req.headers.get("host") || "");
    if (requestHost && !isAppHost(requestHost)) {
      try {
        const resolveUrl = new URL("/api/domain-route/resolve", req.nextUrl.origin);
        resolveUrl.searchParams.set("host", requestHost);
        const resolved = await fetch(resolveUrl.toString(), {
          headers: { Accept: "application/json" },
        });
        if (resolved.ok) {
          const data = (await resolved.json()) as { found?: boolean; basePath?: string };
          const basePath = typeof data.basePath === "string" ? data.basePath.trim() : "";
          if (data.found && basePath) {
            const alreadyRouted = path === basePath || path.startsWith(`${basePath}/`);
            if (!alreadyRouted) {
              const rewritePath = `${basePath}${path === "/" ? "" : path}`;
              const nextUrl = req.nextUrl.clone();
              nextUrl.pathname = rewritePath;
              return NextResponse.rewrite(nextUrl);
            }
          }
        }
      } catch {
        // fail open to normal app routing
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
