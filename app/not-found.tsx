import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen builder-gradient flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-4">
          404
        </p>
        <h1
          className="text-4xl font-bold text-white mb-4"
          style={{ fontFamily: "Fraunces, Georgia, serif" }}
        >
          Project not found
        </h1>
        <p className="text-white/50 mb-8">
          This website draft may have been deleted or the link is invalid.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Build a New Website
        </Link>
      </div>
    </main>
  );
}
