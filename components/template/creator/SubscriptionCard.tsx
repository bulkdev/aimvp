export default function SubscriptionCard({
  title,
  priceUsd,
  description,
  interval,
  projectId,
}: {
  title: string;
  priceUsd: number;
  description?: string;
  interval: "month" | "year";
  projectId: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.04] p-5">
      <p className="text-white font-semibold">{title}</p>
      <p className="mt-2 text-3xl text-white font-semibold">${priceUsd}<span className="text-base text-white/60">/{interval}</span></p>
      <p className="text-sm text-white/65 mt-2">{description || "Full access to member content."}</p>
      <a href={`/api/creator/checkout?projectId=${encodeURIComponent(projectId)}&plan=${interval}`} className="mt-4 inline-block btn-primary w-full text-center">
        Join {title}
      </a>
    </div>
  );
}

