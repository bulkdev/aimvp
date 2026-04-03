"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import IntakeForm from "@/components/form/IntakeForm";
import type { IntakeFormData } from "@/types";

export default function AdminGenerateView() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: IntakeFormData) {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intake: data }),
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Generation failed.");
      }

      router.push(`/preview/${json.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen builder-gradient">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="px-6 py-6 flex items-center justify-between border-b border-white/10 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/50 hover:text-white/80 text-sm">
              ← All sites
            </Link>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/admin"
              className="text-white/70 hover:text-white border border-white/15 rounded-lg px-3 py-1.5"
            >
              Dashboard
            </Link>
          </div>
        </header>

        <section className="px-6 pt-12 pb-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            <span className="text-indigo-300 text-sm font-medium">Main admin · AI generation</span>
          </div>

          <h1
            className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-display), Georgia, serif" }}
          >
            Generate a new site
          </h1>

          <p className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
            Enter business details. AI writes copy and structure; the draft opens in preview. New projects are unassigned until you set an owner from the dashboard.
          </p>
        </section>

        <div className="flex-1 px-4 pb-16 flex items-start justify-center">
          <div className="w-full max-w-2xl">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-400/30 rounded-xl text-red-300 text-sm flex items-start gap-3">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <IntakeForm onSubmit={handleSubmit} isLoading={isGenerating} />
          </div>
        </div>
      </div>
    </main>
  );
}
