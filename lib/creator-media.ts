import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const ROOT = path.join(process.cwd(), ".creator-media");

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export function creatorProjectMediaDir(projectId: string): string {
  const dir = path.join(ROOT, projectId);
  ensureDir(dir);
  return dir;
}

export async function saveCreatorMediaFile(projectId: string, file: File): Promise<{ fileName: string; absolutePath: string }> {
  const ext = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : "bin";
  const safeExt = ext && /^[a-z0-9]{1,8}$/.test(ext) ? ext : "bin";
  const fileName = `${Date.now()}-${randomUUID()}.${safeExt}`;
  const dir = creatorProjectMediaDir(projectId);
  const absolutePath = path.join(dir, fileName);
  const ab = await file.arrayBuffer();
  fs.writeFileSync(absolutePath, Buffer.from(ab));
  return { fileName, absolutePath };
}

export function creatorMediaPath(projectId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "");
  return path.join(creatorProjectMediaDir(projectId), safe);
}

