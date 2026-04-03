"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { TurnstileField } from "@/components/security/TurnstileField";

const hasTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(hasTurnstile ? null : "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (hasTurnstile && !turnstileToken) {
      setError("Please complete the captcha.");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      turnstileToken: turnstileToken || "",
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="min-h-screen builder-gradient flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-white mb-1">Sign in</h1>
        <p className="text-white/55 text-sm mb-6">Access your site dashboard and generate new sites.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-400/30 text-red-200 text-sm">{error}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/35"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/35"
            />
          </div>
          <TurnstileField onToken={setTurnstileToken} theme="dark" />
          <button
            type="submit"
            disabled={loading || (hasTurnstile && !turnstileToken)}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/55">
          No account?{" "}
          <Link href="/register" className="text-indigo-400 hover:underline">
            Create one
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link href="/" className="text-sm text-white/45 hover:text-white/70">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen builder-gradient" />}>
      <LoginForm />
    </Suspense>
  );
}
