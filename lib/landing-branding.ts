import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const REDIS_KEY = "settings:landingBranding";
const LOCAL_FILE = path.join(process.cwd(), ".data", "landing-branding.json");

export type LandingBranding = {
  faviconDataUrl?: string | null;
};

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url?.trim() || !token?.trim()) return null;
  return new Redis({ url: url.trim(), token: token.trim() });
}

function readLocal(): LandingBranding {
  try {
    if (!fs.existsSync(LOCAL_FILE)) return {};
    const raw = fs.readFileSync(LOCAL_FILE, "utf-8");
    return JSON.parse(raw) as LandingBranding;
  } catch {
    return {};
  }
}

function writeLocal(data: LandingBranding): void {
  const dir = path.dirname(LOCAL_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(data), "utf-8");
}

export async function getLandingBranding(): Promise<LandingBranding> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(REDIS_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as LandingBranding;
    } catch {
      return {};
    }
  }
  return readLocal();
}

export async function setLandingBranding(next: LandingBranding): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, JSON.stringify(next));
    return;
  }
  writeLocal(next);
}
