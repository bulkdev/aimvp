import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { Redis } from "@upstash/redis";
import type { StudioBookingLike } from "@/lib/studio-scheduling";

export type StudioAppointmentRecord = StudioBookingLike & {
  id: string;
  projectId: string;
  stylistId: string | null;
  serviceTitle: string;
  customerEmail: string;
  customerName: string;
  status: "pending_deposit" | "confirmed" | "cancelled";
  createdAt: string;
};

const REDIS_KEY_PREFIX = "studio:appointments:";

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

function appointmentsFsPath(projectId: string): string {
  return path.join(process.cwd(), ".projects", `studio-appts-${projectId}.json`);
}

function readFs(projectId: string): StudioAppointmentRecord[] {
  const p = appointmentsFsPath(projectId);
  if (!fs.existsSync(p)) return [];
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf-8")) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter((x) => x && typeof x === "object") as StudioAppointmentRecord[];
  } catch {
    return [];
  }
}

function writeFs(projectId: string, rows: StudioAppointmentRecord[]): void {
  const dir = path.join(process.cwd(), ".projects");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(appointmentsFsPath(projectId), JSON.stringify(rows, null, 2));
}

export async function listStudioAppointments(projectId: string): Promise<StudioAppointmentRecord[]> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(REDIS_KEY_PREFIX + projectId);
    if (raw == null) return [];
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed) ? (parsed as StudioAppointmentRecord[]) : [];
    } catch {
      return [];
    }
  }
  return readFs(projectId);
}

export async function persistStudioAppointments(projectId: string, rows: StudioAppointmentRecord[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.set(REDIS_KEY_PREFIX + projectId, JSON.stringify(rows));
    return;
  }
  writeFs(projectId, rows);
}

export async function appendStudioAppointment(
  row: Omit<StudioAppointmentRecord, "id" | "createdAt">
): Promise<StudioAppointmentRecord> {
  const full: StudioAppointmentRecord = {
    ...row,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const prev = await listStudioAppointments(row.projectId);
  prev.push(full);
  await persistStudioAppointments(row.projectId, prev);
  return full;
}

export async function updateStudioAppointmentStatus(
  projectId: string,
  appointmentId: string,
  status: StudioAppointmentRecord["status"]
): Promise<StudioAppointmentRecord | null> {
  const rows = await listStudioAppointments(projectId);
  const idx = rows.findIndex((r) => r.id === appointmentId);
  if (idx === -1) return null;
  const next = { ...rows[idx]!, status };
  rows[idx] = next;
  await persistStudioAppointments(projectId, rows);
  return next;
}
