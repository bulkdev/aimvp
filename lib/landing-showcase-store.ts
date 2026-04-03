/**
 * Persisted list of demo sites for the public marketing homepage portfolio section.
 */

import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import type { ShowcaseSite } from "@/lib/showcase-portfolio";

const STORE_DIR = path.join(process.cwd(), ".projects");
const FILE_NAME = "landing-showcase.json";
const REDIS_KEY = "config:landing-showcase";

let redisSingleton: Redis | null | undefined;

function redisRestConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url?.trim() || !token?.trim()) return null;
  return { url: url.trim(), token: token.trim() };
}

function getRedis(): Redis | null {
  if (redisSingleton !== undefined) return redisSingleton;
  const cfg = redisRestConfig();
  if (!cfg) {
    redisSingleton = null;
    return null;
  }
  redisSingleton = new Redis({ url: cfg.url, token: cfg.token });
  return redisSingleton;
}

function ensureStoreFs() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
}

function parseSitesJson(raw: string): ShowcaseSite[] {
  try {
    const j = JSON.parse(raw) as unknown;
    if (!Array.isArray(j)) return [];
    const out: ShowcaseSite[] = [];
    for (const item of j) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      if (typeof o.label !== "string" || typeof o.projectId !== "string") continue;
      const label = o.label.trim();
      const projectId = o.projectId.trim();
      if (!label || !projectId) continue;
      out.push({ label, projectId });
    }
    return out;
  } catch {
    return [];
  }
}

export function requireWritableLandingShowcase(): void {
  if (process.env.VERCEL === "1" && !getRedis()) {
    throw new Error(
      "Serverless storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN (Vercel Redis/KV) or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
    );
  }
}

export async function readLandingShowcase(): Promise<ShowcaseSite[]> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(REDIS_KEY);
    if (raw == null || raw === "") return [];
    const str = typeof raw === "string" ? raw : JSON.stringify(raw);
    return parseSitesJson(str);
  }
  ensureStoreFs();
  const fp = path.join(STORE_DIR, FILE_NAME);
  if (!fs.existsSync(fp)) return [];
  return parseSitesJson(fs.readFileSync(fp, "utf-8"));
}

export async function writeLandingShowcase(sites: ShowcaseSite[]): Promise<void> {
  requireWritableLandingShowcase();
  const payload = JSON.stringify(sites, null, 2);
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY, payload);
    return;
  }
  ensureStoreFs();
  fs.writeFileSync(path.join(STORE_DIR, FILE_NAME), payload);
}
