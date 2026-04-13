export default function LockedContentOverlay({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="absolute inset-0 rounded-xl bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center px-4">
      <p className="text-white font-semibold">{title}</p>
      <p className="text-white/70 text-sm mt-1">{subtitle}</p>
      <a href="#pricing" className="mt-3 btn-primary !py-2 !px-4 !text-sm">Subscribe to unlock</a>
    </div>
  );
}

