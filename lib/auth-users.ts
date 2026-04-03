/**
 * App users for Credentials auth — stored alongside projects (Redis or `.projects/users/`).
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Redis } from "@upstash/redis";
import { hashPassword } from "@/lib/password";

export interface AuthUserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: string;
}

const USERS_DIR_NAME = "users";
const EMAIL_INDEX = "email-index.json";

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

const STORE_DIR = path.join(process.cwd(), ".projects");
const usersDir = () => path.join(STORE_DIR, USERS_DIR_NAME);
const emailIndexPath = () => path.join(usersDir(), EMAIL_INDEX);

function ensureUsersFs() {
  if (!fs.existsSync(usersDir())) {
    fs.mkdirSync(usersDir(), { recursive: true });
  }
  if (!fs.existsSync(emailIndexPath())) {
    fs.writeFileSync(emailIndexPath(), JSON.stringify({}, null, 2));
  }
}

function userPath(id: string): string {
  return path.join(usersDir(), `${id}.json`);
}

function readEmailIndexFs(): Record<string, string> {
  ensureUsersFs();
  return JSON.parse(fs.readFileSync(emailIndexPath(), "utf-8")) as Record<string, string>;
}

function writeEmailIndexFs(index: Record<string, string>) {
  fs.writeFileSync(emailIndexPath(), JSON.stringify(index, null, 2));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function getUserRedis(id: string): Promise<AuthUserRecord | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get<string>(`user:${id}`);
  if (raw == null) return null;
  return typeof raw === "string" ? (JSON.parse(raw) as AuthUserRecord) : (raw as unknown as AuthUserRecord);
}

async function getUserIdByEmailRedis(email: string): Promise<string | null> {
  const redis = getRedis();
  if (!redis) return null;
  const id = await redis.get<string>(`user:email:${normalizeEmail(email)}`);
  return id ? String(id) : null;
}

export async function getUserById(id: string): Promise<AuthUserRecord | null> {
  const redis = getRedis();
  if (redis) {
    return getUserRedis(id);
  }
  ensureUsersFs();
  const p = userPath(id);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf-8")) as AuthUserRecord;
}

export async function getUserByEmail(email: string): Promise<AuthUserRecord | null> {
  const norm = normalizeEmail(email);
  const redis = getRedis();
  if (redis) {
    const id = await getUserIdByEmailRedis(norm);
    if (!id) return null;
    return getUserRedis(id);
  }
  ensureUsersFs();
  const idx = readEmailIndexFs();
  const id = idx[norm];
  if (!id) return null;
  return getUserById(id);
}

export async function createUser(input: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthUserRecord> {
  const email = normalizeEmail(input.email);
  if (!email.includes("@")) {
    throw new Error("Invalid email.");
  }
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(input.password);
  const user: AuthUserRecord = {
    id,
    email,
    passwordHash,
    name: input.name?.trim() || undefined,
    createdAt: now,
  };

  const redis = getRedis();
  if (redis) {
    await redis.set(`user:${id}`, JSON.stringify(user));
    await redis.set(`user:email:${email}`, id);
    return user;
  }

  ensureUsersFs();
  const idx = readEmailIndexFs();
  if (idx[email]) {
    throw new Error("An account with this email already exists.");
  }
  idx[email] = id;
  writeEmailIndexFs(idx);
  fs.writeFileSync(userPath(id), JSON.stringify(user, null, 2));
  return user;
}
