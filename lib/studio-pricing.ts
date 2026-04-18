/**
 * Parse a display price like "From $185", "$85+", "120" → USD number or null.
 */
export function parseStartingPriceUsd(startingPrice?: string): number | null {
  if (!startingPrice?.trim()) return null;
  const m = startingPrice.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  if (!m) return null;
  const n = Number.parseFloat(m[1]!);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Deposit in cents: max(percent of service, flat minimum), clamped to service total when known.
 */
export function computeDepositCents(params: {
  serviceUsd: number | null;
  depositPercent?: number;
  depositFlatUsd?: number;
}): number {
  const pct = Math.min(100, Math.max(0, params.depositPercent ?? 25));
  const flatUsd = Math.max(0, params.depositFlatUsd ?? 35);
  const fromPct = params.serviceUsd != null ? (params.serviceUsd * pct) / 100 : 0;
  const fromFlat = flatUsd;
  let usd = Math.max(fromPct, fromFlat);
  if (params.serviceUsd != null) {
    usd = Math.min(usd, params.serviceUsd);
  }
  const cents = Math.round(usd * 100);
  return Math.max(500, cents); // minimum $5 for Stripe
}
