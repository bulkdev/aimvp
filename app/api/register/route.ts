import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/lib/auth-users";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string; name?: string };
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
