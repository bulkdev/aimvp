"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import IntakeForm from "@/components/form/IntakeForm";
import type { IntakeFormData } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
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
        if (res.status === 401) {
          throw new Error(json.error || "Please sign in to generate a site.");
        }
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
      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-6 py-6 flex items-center justify-between border-b border-white/10 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              SiteGen<span className="text-indigo-400">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {status === "loading" ? (
              <span className="text-white/35">…</span>
            ) : session?.user ? (
              <>
                <span className="text-white/50 hidden sm:inline truncate max-w-[200px]">{session.user.email}</span>
                {session.user.isMainAdmin ? (
                  <Link
                    href="/admin"
                    className="text-amber-200/95 hover:text-amber-100 border border-amber-400/35 rounded-lg px-3 py-1.5 text-sm font-medium"
                  >
                    Admin
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-white/70 hover:text-white border border-white/15 rounded-lg px-3 py-1.5"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-white/70 hover:text-white">
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-white bg-indigo-600/90 hover:bg-indigo-500 rounded-lg px-3 py-1.5 font-medium"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Hero copy */}
        <section className="px-6 pt-16 pb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
            <span className="text-indigo-300 text-sm font-medium">AI-Powered Website Generation</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: "Fraunces, Georgia, serif" }}>
            A full website draft
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              in one click.
            </span>
          </h1>

          <p className="text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Enter your business details below. Our AI writes the copy, structures the layout, and delivers a ready-to-publish website draft — in seconds.
          </p>
          {status !== "loading" && !session && (
            <p className="mt-4 text-amber-200/90 text-sm max-w-xl mx-auto">
              Sign in or create an account to generate sites — each site is tied to your account for a secure owner dashboard.
            </p>
          )}
        </section>

        {/* Form card */}
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
