import type { Project } from "@/types";

/** Embedded in core JSON instead of huge data URLs — unlikely in user copy. */
export const BLOB_TOKEN_PREFIX = "__SITEGEN_BLOB__:";

export type ProjectBlobsFile = {
  version: 1;
  /** For project id (redundant but helps user match files). */
  projectId?: string;
  blobs: string[];
};

function isLargeDataImage(s: string): boolean {
  return s.startsWith("data:image/") && s.length > 400;
}

/** Replace large data:image/* strings with tokens; collect blobs in order. */
export function splitProjectForExport(project: Project): { core: Project; blobsFile: ProjectBlobsFile } {
  const blobs: string[] = [];

  function walk(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "string") {
      if (isLargeDataImage(obj)) {
        const i = blobs.length;
        blobs.push(obj);
        return `${BLOB_TOKEN_PREFIX}${i}`;
      }
      return obj;
    }
    if (Array.isArray(obj)) return obj.map(walk);
    if (typeof obj === "object") {
      const o = obj as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(o)) {
        out[k] = walk(o[k]);
      }
      return out;
    }
    return obj;
  }

  const core = walk(JSON.parse(JSON.stringify(project))) as Project;
  return {
    core,
    blobsFile: { version: 1, projectId: project.id, blobs },
  };
}

/** Restore tokens from blobs file (must match export order). */
export function mergeProjectBlobParts(core: Project, blobsFile: ProjectBlobsFile): Project {
  return mergeBlobSlice(core, 0, blobsFile.blobs);
}

/** Replace only tokens in [startIndex, startIndex + blobs.length). Used for chunked upload. */
export function mergeBlobSlice(core: Project, startIndex: number, blobs: string[]): Project {
  const end = startIndex + blobs.length;
  function walk(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "string") {
      if (obj.startsWith(BLOB_TOKEN_PREFIX)) {
        const i = Number(obj.slice(BLOB_TOKEN_PREFIX.length));
        if (!Number.isFinite(i)) return obj;
        if (i >= startIndex && i < end) {
          return blobs[i - startIndex]!;
        }
        return obj;
      }
      return obj;
    }
    if (Array.isArray(obj)) return obj.map(walk);
    if (typeof obj === "object") {
      const o = obj as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(o)) {
        out[k] = walk(o[k]);
      }
      return out;
    }
    return obj;
  }
  return walk(JSON.parse(JSON.stringify(core))) as Project;
}

export function isBlobsFile(x: unknown): x is ProjectBlobsFile {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return o.version === 1 && Array.isArray(o.blobs) && o.blobs.every((b) => typeof b === "string");
}
