/** Deterministic pseudo-availability for demo / lightweight hosting without a DB. */
export function studioSlotsForDay(seed: string, dateIso: string, locationId: string): string[] {
  const times: string[] = [];
  for (let h = 9; h <= 18; h++) {
    for (const m of [0, 30]) {
      if (h === 18 && m > 0) continue;
      const hr = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const mm = m === 0 ? "00" : "30";
      times.push(`${hr}:${mm} ${ampm}`);
    }
  }
  let hash = 0;
  const key = `${seed}|${dateIso}|${locationId}`;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const take = new Set<number>();
  let x = hash;
  for (let n = 0; n < 7; n++) {
    x = (x * 1664525 + 1013904223) >>> 0;
    take.add(x % times.length);
  }
  return times.filter((_, i) => !take.has(i));
}
