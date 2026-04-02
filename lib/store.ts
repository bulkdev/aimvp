/**
 * Simple file-based project store for development.
 *
 * To swap for Postgres/Supabase:
 * 1. Replace the read/write calls below with your DB client queries
 * 2. Keep the same function signatures — nothing else needs to change
 * 3. The `Project` type drives the schema
 */

import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { Project, IntakeFormData, GeneratedSiteContent } from "@/types";

const STORE_DIR = path.join(process.cwd(), ".projects");
const INDEX_FILE = path.join(STORE_DIR, "index.json");

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
  if (!fs.existsSync(INDEX_FILE)) {
    fs.writeFileSync(INDEX_FILE, JSON.stringify([], null, 2));
  }
}

function readIndex(): string[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8")) as string[];
}

function writeIndex(ids: string[]) {
  fs.writeFileSync(INDEX_FILE, JSON.stringify(ids, null, 2));
}

function projectPath(id: string): string {
  return path.join(STORE_DIR, `${id}.json`);
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createProject(
  intake: IntakeFormData,
  content: GeneratedSiteContent
): Promise<Project> {
  const now = new Date().toISOString();
  const project: Project = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    intake,
    content,
    status: "draft",
  };

  ensureStore();
  fs.writeFileSync(projectPath(project.id), JSON.stringify(project, null, 2));

  const index = readIndex();
  index.unshift(project.id);
  writeIndex(index);

  return project;
}

export async function getProject(id: string): Promise<Project | null> {
  const filePath = projectPath(id);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as Project;
}

export async function listProjects(): Promise<Project[]> {
  const ids = readIndex();
  const projects: Project[] = [];
  for (const id of ids) {
    const p = await getProject(id);
    if (p) projects.push(p);
  }
  return projects;
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, "intake" | "content" | "status">>
): Promise<Project | null> {
  const existing = await getProject(id);
  if (!existing) return null;

  const updated: Project = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(projectPath(id), JSON.stringify(updated, null, 2));
  return updated;
}
