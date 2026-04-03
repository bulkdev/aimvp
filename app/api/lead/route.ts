import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const LEADS_KEY = "landing:leads";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url?.trim() || !token?.trim()) return null;
  return new Redis({ url: url.trim(), token: token.trim() });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimStr(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export async function POST(req: Request) {
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
  const companyName = trimStr(b.companyName, 200);
  const location = trimStr(b.location, 300);
  const email = trimStr(b.email, 320);
  const phone = trimStr(b.phone, 50);
  const description = trimStr(b.description, 8000);

  if (!companyName) {
    return NextResponse.json({ error: "Company name is required." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const record = {
    id: randomUUID(),
    companyName,
    location,
    email,
    phone,
    description,
    createdAt: new Date().toISOString(),
  };

  const redis = getRedis();
  if (redis) {
    try {
      await redis.lpush(LEADS_KEY, JSON.stringify(record));
    } catch {
      return NextResponse.json({ error: "Could not save your message. Try again later." }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  }

  if (process.env.NODE_ENV === "development") {
    try {
      const dir = path.join(process.cwd(), ".data");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.appendFileSync(path.join(dir, "landing-leads.jsonl"), `${JSON.stringify(record)}\n`);
    } catch {
      return NextResponse.json({ error: "Could not save locally." }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json(
    { error: "Leads inbox is not configured. Please try again later." },
    { status: 503 }
  );
}
