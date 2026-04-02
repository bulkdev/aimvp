"use client";

import Link from "next/link";
import type { Project } from "@/types";
import SiteTemplate from "@/components/template/SiteTemplate";

interface Props {
  project: Project;
}

export default function PreviewShell({ project }: Props) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Builder toolbar */}
      <div className="sticky top-0 z-50 bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          <div className="h-4 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/70 text-sm font-medium">
              Preview: <span className="text-white">{project.content.brandName}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs hidden sm:block">
            Generated {new Date(project.createdAt).toLocaleDateString()}
          </span>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-white/60 hover:text-white border border-white/10 hover:border-white/30 rounded-lg text-xs transition-all"
          >
            Export
          </button>

          <Link
            href={`/admin/${project.id}`}
            className="px-3 py-1.5 text-white/80 hover:text-white border border-white/15 hover:border-white/35 rounded-lg text-xs transition-all"
          >
            Owner Dashboard
          </Link>

          <Link
            href="/"
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
          >
            New Website
          </Link>
        </div>
      </div>

      {/* Rendered website template */}
      <div className="flex-1">
        <SiteTemplate project={project} />
      </div>

    </div>
  );
}
