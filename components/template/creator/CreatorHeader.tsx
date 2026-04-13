"use client";

export default function CreatorHeader({
  creatorName,
  creatorTagline,
  avatarUrl,
  ctaText,
}: {
  creatorName: string;
  creatorTagline: string;
  avatarUrl?: string;
  ctaText: string;
}) {
  return (
    <section id="hero" className="relative overflow-hidden px-6 md:px-12 lg:px-20 py-16 md:py-24 bg-[#0b1020] text-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
        <div>
          <p className="section-label !text-violet-300">Creator Membership</p>
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">{creatorName}</h1>
          <p className="mt-4 text-white/75 max-w-2xl text-lg">{creatorTagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#pricing" className="btn-primary">{ctaText}</a>
            <a href="#reels" className="btn-outline !border-white/35 !text-white">Watch free reels</a>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={`${creatorName} cover`} className="w-full h-64 md:h-80 object-cover rounded-xl" />
          ) : (
            <div className="w-full h-64 md:h-80 rounded-xl bg-gradient-to-br from-violet-500/40 to-cyan-500/20" />
          )}
        </div>
      </div>
    </section>
  );
}

