"use client";

export default function TintLuxuryFooter({ brandName }: { brandName: string }) {
  return (
    <footer className="py-10 px-5 md:px-10 bg-black border-t border-white/[0.06] text-center">
      <p className="text-zinc-600 text-xs tracking-[0.2em] uppercase">
        © {new Date().getFullYear()} {brandName}
      </p>
      <p className="text-zinc-700 text-[10px] mt-3 max-w-md mx-auto">
        Premium template · Ceramic film visualization is illustrative — consult local tint laws.
      </p>
    </footer>
  );
}
