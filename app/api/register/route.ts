import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/auth-users";
import { rateLimitAllow } from "@/lib/rate-limit";
import { getClientIpFromNextRequest } from "@/lib/client-ip";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  const ip = getClientIpFromNextRequest(req);
  const rl = await rateLimitAllow(`reg:${ip}`, "register");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many registration attempts. Try again later." }, { status: 429 });
  }

  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      name?: string;
      website?: string;
      turnstileToken?: string;
    };

    if (typeof body.website === "string" && body.website.trim() !== "") {
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json({ ok: true });
    }

    if (!(await verifyTurnstileToken(body.turnstileToken, req))) {
      return NextResponse.json({ error: "Captcha verification failed." }, { status: 400 });
    }

    const email = body.email?.trim();
    const password = body.password ?? "";
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    await createUser({ email, password, name: body.name });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
