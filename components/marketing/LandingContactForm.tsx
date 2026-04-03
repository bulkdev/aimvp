"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

export function LandingContactForm() {
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, location, email, phone, description }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setErrorMessage(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      setStatus("success");
      setCompanyName("");
      setLocation("");
      setEmail("");
      setPhone("");
      setDescription("");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <p className="text-center text-emerald-400/95 text-sm md:text-base">
        Thanks — I&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left max-w-xl mx-auto">
      <div>
        <label htmlFor="lead-company" className="block text-xs font-medium text-slate-400 mb-1.5">
          Company name <span className="text-rose-400/90">*</span>
        </label>
        <input
          id="lead-company"
          name="companyName"
          type="text"
          required
          autoComplete="organization"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
          placeholder="Your business name"
        />
      </div>
      <div>
        <label htmlFor="lead-location" className="block text-xs font-medium text-slate-400 mb-1.5">
          Location
        </label>
        <input
          id="lead-location"
          name="location"
          type="text"
          autoComplete="address-level2"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClass}
          placeholder="City, state, or service area"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="lead-email" className="block text-xs font-medium text-slate-400 mb-1.5">
            Email <span className="text-rose-400/90">*</span>
          </label>
          <input
            id="lead-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="lead-phone" className="block text-xs font-medium text-slate-400 mb-1.5">
            Phone
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="(555) 000-0000"
          />
        </div>
      </div>
      <div>
        <label htmlFor="lead-description" className="block text-xs font-medium text-slate-400 mb-1.5">
          What should I know?
        </label>
        <textarea
          id="lead-description"
          name="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} resize-y min-h-[100px]`}
          placeholder="Briefly describe your business, goals, or timeline."
        />
      </div>
      {status === "error" && errorMessage ? (
        <p className="text-sm text-rose-400/95" role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className="pt-1">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto inline-flex justify-center rounded-xl px-8 py-3.5 text-sm font-semibold bg-white text-slate-900 hover:bg-white/90 disabled:opacity-60 disabled:pointer-events-none transition-colors"
        >
          {status === "loading" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
