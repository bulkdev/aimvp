/**
 * Project persistence: Upstash Redis on Vercel/serverless, file-based `.projects/` locally.
 *
 * Env (any one pair works):
 * - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (Upstash / local)
 * - KV_REST_API_URL + KV_REST_API_TOKEN (Vercel KV / Redis integration — what the dashboard injects)
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Redis } from "@upstash/redis";
import type { Project, IntakeFormData, GeneratedSiteContent } from "@/types";
import { isValidCustomerPublicSlug, normalizePublicSlug } from "@/lib/seo";

const INDEX_KEY = "project:index";

const STORE_DIR = path.join(process.cwd(), ".projects");
const INDEX_FILE = path.join(STORE_DIR, "index.json");
const SLUG_INDEX_FILE = path.join(STORE_DIR, "slug-index.json");

function slugRedisKey(normalizedSlug: string): string {
  return `project:slug:${normalizedSlug}`;
}

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

function requireWritableStorage(): void {
  if (process.env.VERCEL === "1" && !getRedis()) {
    throw new Error(
      "Serverless storage is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN (Vercel Redis/KV) or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN."
    );
  }
}

function ensureStoreFs() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
  if (!fs.existsSync(INDEX_FILE)) {
    fs.writeFileSync(INDEX_FILE, JSON.stringify([], null, 2));
  }
}

function readIndexFs(): string[] {
  ensureStoreFs();
  return JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8")) as string[];
}

function writeIndexFs(ids: string[]) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(ids, null, 2));
}

function projectPath(id: string): string {
  return path.join(STORE_DIR, `${id}.json`);
}

// ─── Redis ───────────────────────────────────────────────────────────────────

async function createProjectRedis(
  intake: IntakeFormData,
  content: GeneratedSiteContent,
  options?: { ownerId?: string }
): Promise<Project> {
  const redis = getRedis()!;
  const now = new Date().toISOString();
  const project: Project = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    intake,
    content,
    status: "draft",
    ...(options?.ownerId ? { ownerId: options.ownerId } : {}),
  };
  await redis.set(`project:${project.id}`, JSON.stringify(project));
  await redis.lpush(INDEX_KEY, project.id);
  return project;
}

async function getProjectRedis(id: string): Promise<Project | null> {
  const redis = getRedis()!;
  const raw = await redis.get<string>(`project:${id}`);
  if (raw == null) return null;
  return typeof raw === "string" ? (JSON.parse(raw) as Project) : (raw as unknown as Project);
}

async function listProjectsRedis(): Promise<Project[]> {
  const redis = getRedis()!;
  const ids = await redis.lrange<string>(INDEX_KEY, 0, -1);
  const projects: Project[] = [];
  for (const id of ids) {
    const p = await getProjectRedis(id);
    if (p) projects.push(p);
  }
  return projects;
}

async function getOwnerIdForSlugRedis(normalizedSlug: string): Promise<string | null> {
  const redis = getRedis()!;
  const v = await redis.get<string>(slugRedisKey(normalizedSlug));
  if (v == null) return null;
  return typeof v === "string" ? v : String(v);
}

async function syncSlugIndexRedis(before: Project, after: Project): Promise<void> {
  const redis = getRedis()!;
  const oldS = before.publicSlug?.trim().toLowerCase();
  const newS = after.publicSlug?.trim().toLowerCase();
  if (oldS === newS) return;
  if (oldS) await redis.del(slugRedisKey(oldS));
  if (newS) await redis.set(slugRedisKey(newS), after.id);
}

function readSlugIndexFs(): Record<string, string> {
  ensureStoreFs();
  if (!fs.existsSync(SLUG_INDEX_FILE)) return {};
  return JSON.parse(fs.readFileSync(SLUG_INDEX_FILE, "utf-8")) as Record<string, string>;
}

function writeSlugIndexFs(index: Record<string, string>): void {
  fs.writeFileSync(SLUG_INDEX_FILE, JSON.stringify(index, null, 2));
}

function getOwnerIdForSlugFs(normalizedSlug: string): string | null {
  return readSlugIndexFs()[normalizedSlug] ?? null;
}

function syncSlugIndexFs(before: Project, after: Project): void {
  const idx = { ...readSlugIndexFs() };
  const oldS = before.publicSlug?.trim().toLowerCase();
  const newS = after.publicSlug?.trim().toLowerCase();
  if (oldS === newS) return;
  if (oldS) delete idx[oldS];
  if (newS) idx[newS] = after.id;
  writeSlugIndexFs(idx);
}

async function getOwnerIdForSlug(normalizedSlug: string): Promise<string | null> {
  const redis = getRedis();
  if (redis) return getOwnerIdForSlugRedis(normalizedSlug);
  return getOwnerIdForSlugFs(normalizedSlug);
}

async function syncSlugIndex(before: Project, after: Project): Promise<void> {
  const redis = getRedis();
  if (redis) await syncSlugIndexRedis(before, after);
  else syncSlugIndexFs(before, after);
}

async function updateProjectRedis(
  id: string,
  updates: Partial<Pick<Project, "intake" | "content" | "status" | "publicSlug" | "ownerId">>
): Promise<Project | null> {
  const existing = await getProjectRedis(id);
  if (!existing) return null;

  let nextOwnerId = existing.ownerId;
  if (Object.prototype.hasOwnProperty.call(updates, "ownerId")) {
    const v = updates.ownerId;
    nextOwnerId = v == null || (typeof v === "string" && !v.trim()) ? undefined : v;
  }

  let nextPublicSlug = existing.publicSlug;
  if (Object.prototype.hasOwnProperty.call(updates, "publicSlug")) {
    const raw = updates.publicSlug;
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      nextPublicSlug = undefined;
    } else if (typeof raw === "string") {
      const n = normalizePublicSlug(raw);
      if (!isValidCustomerPublicSlug(n)) {
        throw new Error(
          "Invalid or reserved URL slug. Use 2–80 characters: lowercase letters, numbers, and hyphens (e.g. bro-plumbing)."
        );
      }
      nextPublicSlug = n;
    }
  }

  const oldN = existing.publicSlug?.trim().toLowerCase();
  const newN = nextPublicSlug?.trim().toLowerCase();
  if (newN && newN !== oldN) {
    const owner = await getOwnerIdForSlug(newN);
    if (owner && owner !== id) {
      throw new Error("That URL slug is already in use by another site.");
    }
  }

  const updated: Project = {
    ...existing,
    ...updates,
    publicSlug: nextPublicSlug,
    ownerId: nextOwnerId,
    updatedAt: new Date().toISOString(),
  };
  await syncSlugIndex(existing, updated);
  await redisSetProject(updated);
  return updated;
}

async function redisSetProject(project: Project): Promise<void> {
  const redis = getRedis()!;
  await redis.set(`project:${project.id}`, JSON.stringify(project));
}

// ─── File system (local dev) ─────────────────────────────────────────────────

export async function createProject(
  intake: IntakeFormData,
  content: GeneratedSiteContent,
  options?: { ownerId?: string }
): Promise<Project> {
  requireWritableStorage();
  const redis = getRedis();
  if (redis) {
    return createProjectRedis(intake, content, options);
  }

  const now = new Date().toISOString();
  const project: Project = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    intake,
    content,
    status: "draft",
    ...(options?.ownerId ? { ownerId: options.ownerId } : {}),
  };

  ensureStoreFs();
  fs.writeFileSync(projectPath(project.id), JSON.stringify(project, null, 2));

  const index = readIndexFs();
  index.unshift(project.id);
  writeIndexFs(index);

  return project;
}

export async function getProject(id: string): Promise<Project | null> {
  requireWritableStorage();
  const redis = getRedis();
  if (redis) {
    return getProjectRedis(id);
  }

  const filePath = projectPath(id);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Project;
}

export async function listProjects(): Promise<Project[]> {
  requireWritableStorage();
  const redis = getRedis();
  if (redis) {
    return listProjectsRedis();
  }

  const ids = readIndexFs();
  const projects: Project[] = [];
  for (const id of ids) {
    const p = await getProject(id);
    if (p) projects.push(p);
  }
  return projects;
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, "intake" | "content" | "status" | "publicSlug" | "ownerId">>
): Promise<Project | null> {
  requireWritableStorage();
  const redis = getRedis();
  if (redis) {
    return updateProjectRedis(id, updates);
  }

  const existing = await getProject(id);
  if (!existing) return null;

  let nextOwnerId = existing.ownerId;
  if (Object.prototype.hasOwnProperty.call(updates, "ownerId")) {
    const v = updates.ownerId;
    nextOwnerId = v == null || (typeof v === "string" && !v.trim()) ? undefined : v;
  }

  let nextPublicSlug = existing.publicSlug;
  if (Object.prototype.hasOwnProperty.call(updates, "publicSlug")) {
    const raw = updates.publicSlug;
    if (raw == null || (typeof raw === "string" && !raw.trim())) {
      nextPublicSlug = undefined;
    } else if (typeof raw === "string") {
      const n = normalizePublicSlug(raw);
      if (!isValidCustomerPublicSlug(n)) {
        throw new Error(
          "Invalid or reserved URL slug. Use 2–80 characters: lowercase letters, numbers, and hyphens (e.g. bro-plumbing)."
        );
      }
      nextPublicSlug = n;
    }
  }

  const oldN = existing.publicSlug?.trim().toLowerCase();
  const newN = nextPublicSlug?.trim().toLowerCase();
  if (newN && newN !== oldN) {
    const owner = await getOwnerIdForSlug(newN);
    if (owner && owner !== id) {
      throw new Error("That URL slug is already in use by another site.");
    }
  }

  const updated: Project = {
    ...existing,
    ...updates,
    publicSlug: nextPublicSlug,
    ownerId: nextOwnerId,
    updatedAt: new Date().toISOString(),
  };
  await syncSlugIndex(existing, updated);
  fs.writeFileSync(projectPath(id), JSON.stringify(updated, null, 2));
  return updated;
}

/** Resolve a published site by short URL segment (`/{slug}`). */
export async function getProjectByPublicSlug(slug: string): Promise<Project | null> {
  const normalized = normalizePublicSlug(slug);
  if (!normalized || !isValidCustomerPublicSlug(normalized)) return null;
  requireWritableStorage();
  const id = await getOwnerIdForSlug(normalized);
  if (!id) return null;
  return getProject(id);
}
