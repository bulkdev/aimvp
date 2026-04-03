"use client";

import { useRef, useState } from "react";
import { readResponseJson } from "@/lib/readResponseJson";
import { compressImportedProject, recompressDataUrlForSave } from "@/lib/compressProjectPayload";
import {
  BLOB_TOKEN_PREFIX,
  isBlobsFile,
  splitProjectForExport,
  type ProjectBlobsFile,
} from "@/lib/projectExportSplit";
import type { Project } from "@/types";

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

type ParsedImport =
  | { kind: "full"; project: Project }
  | { kind: "split"; core: Project; blobsFile: ProjectBlobsFile };

/** Same as single-file import: allow `{ project: { … } }` or raw project at root. */
function unwrapProjectPayload(parsed: unknown): unknown {
  if (parsed && typeof parsed === "object" && "project" in parsed && !Array.isArray(parsed)) {
    const inner = (parsed as { project?: unknown }).project;
    return inner ?? parsed;
  }
  return parsed;
}

async function parseImportFiles(files: File[]): Promise<ParsedImport> {
  if (files.length === 1) {
    const text = await files[0].text();
    const parsed = JSON.parse(text) as unknown;
    const raw = unwrapProjectPayload(parsed);
    return { kind: "full", project: raw as Project };
  }
  if (files.length === 2) {
    const texts = await Promise.all(files.map((f) => f.text()));
    const parsed = texts.map((t) => unwrapProjectPayload(JSON.parse(t) as unknown));
    let core: Project | null = null;
    let blobsFile: ProjectBlobsFile | null = null;
    for (const p of parsed) {
      if (isBlobsFile(p)) blobsFile = p;
      else if (p && typeof p === "object" && "id" in (p as object) && "intake" in (p as object)) {
        core = p as Project;
      }
    }
    if (!core || !blobsFile) {
      throw new Error(
        "Two-file import: select both site-backup-…-core.json and site-backup-…-blobs.json (Ctrl+click or Shift+click)."
      );
    }
    return { kind: "split", core, blobsFile };
  }
  throw new Error("Use one full backup .json, or exactly two files (core + blobs).");
}

/** Target ~900k chars per merge request JSON (under typical 4.5MB limits). */
const MERGE_CHUNK_CHAR_BUDGET = 900_000;

export default function ProjectBackupBar({ projectId }: { projectId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function downloadBackup() {
    setMsg(null);
    setBusy("export");
    try {
      const res = await fetch(`/api/projects/${projectId}`, { credentials: "include" });
      const data = await readResponseJson<{ project?: unknown; error?: string }>(res);
      if (!res.ok) throw new Error(data.error || "Could not load project.");
      const project = data.project as Project;
      if (!project) throw new Error("Invalid project payload.");

      const { core, blobsFile } = splitProjectForExport(project);
      triggerDownload(JSON.stringify(core, null, 2), `site-backup-${projectId}-core.json`);
      await new Promise((r) => setTimeout(r, 450));
      triggerDownload(JSON.stringify(blobsFile, null, 2), `site-backup-${projectId}-blobs.json`);

      const n = blobsFile.blobs.length;
      setMsg({
        kind: "ok",
        text:
          n > 0
            ? `Downloaded 2 files: core (settings/copy) + blobs (${n} image chunk${n === 1 ? "" : "s"}). Import selects both files together — large sites upload in steps automatically.`
            : "Downloaded 2 files (no large embedded images — blobs file is empty).",
      });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Export failed." });
    } finally {
      setBusy(null);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const files = input.files?.length ? Array.from(input.files) : [];
    if (files.length === 0) {
      setMsg({ kind: "err", text: "No files selected." });
      return;
    }
    setMsg({ kind: "ok", text: `Reading ${files.length} file(s)…` });
    setBusy("import");
    try {
      const parsed = await parseImportFiles(files);

      if (parsed.kind === "full") {
        if (JSON.stringify(parsed.project).includes(BLOB_TOKEN_PREFIX)) {
          throw new Error(
            "This file lists image placeholders only. Import the matching …-blobs.json as well (select both files)."
          );
        }
        const project = await compressImportedProject(parsed.project);
        const res = await fetch("/api/projects/import", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project }),
        });
        const data = await readResponseJson<{ project?: { id: string }; error?: string; details?: string }>(res);
        if (!res.ok) {
          throw new Error(data.details ? `${data.error} (${data.details})` : data.error || "Import failed.");
        }
        const id = data.project?.id;
        if (id && id !== projectId) {
          window.location.assign(`/admin/${id}`);
          return;
        }
        window.location.reload();
        return;
      }

      const { core, blobsFile } = parsed;
      const compressedBlobs = await Promise.all(blobsFile.blobs.map((b) => recompressDataUrlForSave(b)));

      const importRes = await fetch("/api/projects/import", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: core }),
      });
      const importData = await readResponseJson<{ project?: { id: string }; error?: string; details?: string }>(
        importRes
      );
      if (!importRes.ok) {
        throw new Error(
          importData.details ? `${importData.error} (${importData.details})` : importData.error || "Import failed."
        );
      }

      const pid = core.id;
      let start = 0;
      let batch = 1;

      while (start < compressedBlobs.length) {
        const chunk: string[] = [];
        let size = 0;
        for (let i = start; i < compressedBlobs.length; i++) {
          const b = compressedBlobs[i]!;
          const overhead = 40;
          if (chunk.length > 0 && size + b.length + overhead > MERGE_CHUNK_CHAR_BUDGET) break;
          chunk.push(b);
          size += b.length + overhead;
        }

        setMsg({
          kind: "ok",
          text: `Uploading image data (batch ${batch})…`,
        });

        const mergeRes = await fetch(`/api/projects/${encodeURIComponent(pid)}/merge-blobs`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ startIndex: start, blobs: chunk }),
        });
        const mergeData = await readResponseJson<{ error?: string; details?: string }>(mergeRes);
        if (!mergeRes.ok) {
          throw new Error(
            mergeData.details ? `${mergeData.error} (${mergeData.details})` : mergeData.error || "Merge failed."
          );
        }
        start += chunk.length;
        batch += 1;
      }

      const id = importData.project?.id;
      if (id && id !== projectId) {
        window.location.assign(`/admin/${id}`);
        return;
      }
      window.location.reload();
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Invalid JSON or import failed." });
    } finally {
      setBusy(null);
      // Reset after reads finish so the same files can be chosen again; avoids clearing before
      // snapshot (live FileList) and avoids any browser quirks with stale input state.
      input.value = "";
    }
  }

  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Backup &amp; restore</h2>
          <p className="text-xs text-white/50 mt-1 max-w-xl">
            <strong className="text-white/70">Download</strong> splits the site into a small <strong className="text-white/70">core</strong> file and a <strong className="text-white/70">blobs</strong> file with large images.{" "}
            <strong className="text-white/70">Import</strong> uploads core first, then merges images in batches so requests stay under host limits. Select <strong className="text-white/70">both</strong> JSON files together. Older
            single-file backups still work.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void downloadBackup()}
            className="px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-xs font-medium disabled:opacity-50"
          >
            {busy === "export" ? "Preparing…" : "Download backup (2 files)"}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => fileRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-semibold disabled:opacity-50"
          >
            {busy === "import" ? "Importing…" : "Import backup…"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            multiple
            className="hidden"
            onChange={(ev) => void onFile(ev)}
          />
        </div>
      </div>
      {msg ? (
        <p className={`text-xs ${msg.kind === "ok" ? "text-emerald-300/95" : "text-red-300/95"}`}>{msg.text}</p>
      ) : null}
    </section>
  );
}
