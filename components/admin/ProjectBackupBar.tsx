"use client";

import { useRef, useState } from "react";

export default function ProjectBackupBar({ projectId }: { projectId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function downloadBackup() {
    setMsg(null);
    setBusy("export");
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = (await res.json()) as { project?: unknown; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not load project.");
      const blob = new Blob([JSON.stringify(data.project, null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `site-backup-${projectId}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      setMsg({ kind: "ok", text: "Backup downloaded (saved copy from server)." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Export failed." });
    } finally {
      setBusy(null);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg(null);
    setBusy("import");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const project = (parsed as { project?: unknown }).project ?? parsed;
      const res = await fetch("/api/projects/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project }),
      });
      const data = (await res.json()) as { project?: { id: string }; error?: string; details?: string };
      if (!res.ok) {
        throw new Error(data.details ? `${data.error} (${data.details})` : data.error || "Import failed.");
      }
      const id = data.project?.id;
      if (id && id !== projectId) {
        window.location.assign(`/admin/${id}`);
        return;
      }
      window.location.reload();
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Invalid JSON or import failed." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Backup &amp; restore</h2>
          <p className="text-xs text-white/50 mt-1 max-w-xl">
            Download a JSON file of this site (for moving to production or safekeeping). Import merges into this
            environment: same project id updates the site; a different id opens that project after reload.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void downloadBackup()}
            className="px-3 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-xs font-medium disabled:opacity-50"
          >
            {busy === "export" ? "Preparing…" : "Download backup"}
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
