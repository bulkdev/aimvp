"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TurnstileField } from "@/components/security/TurnstileField";

const hasTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [websiteHoneypot, setWebsiteHoneypot] = useState("");
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
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
          website: websiteHoneypot,
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }
      const signRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signRes?.error) {
        setError("Account created but sign-in failed. Try logging in.");
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen builder-gradient flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
        <p className="text-white/55 text-sm mb-6">One account to generate and manage customer sites.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/15 border border-red-400/30 text-red-200 text-sm">{error}</div>
        )}

        <form onSubmit={onSubmit} className="relative space-y-4">
          <div
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0 pointer-events-none"
            aria-hidden="true"
          >
            <label htmlFor="reg-website-hp">Website</label>
            <input
              id="reg-website-hp"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={websiteHoneypot}
              onChange={(e) => setWebsiteHoneypot(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Name (optional)</label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/35"
            />
          </div>
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
            <label className="block text-xs font-medium text-white/70 mb-1">Password (min 8 characters)</label>
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
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
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-white/55">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Sign in
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
