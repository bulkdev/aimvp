/** Salon slot generation + conflict rules for hair studio booking. */

export const STUDIO_SLOT_INTERVAL_MIN = 30;
export const STUDIO_DAY_START_HOUR = 9;
export const STUDIO_DAY_END_HOUR = 18;
/** Parallel “any stylist” chairs per location per slot. */
export const STUDIO_MAX_UNASSIGNED_PER_SLOT = 3;

export function parseDateIsoLocal(dateIso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
  return dt;
}

/** 0 = Sunday … 6 = Saturday */
export function isStudioOpenOnDay(dayOfWeek: number): boolean {
  return dayOfWeek >= 2 && dayOfWeek <= 6;
}

export function formatTimeLabel(hour: number, minute: number): string {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "am" : "pm";
  const mm = minute === 0 ? "" : `:${minute.toString().padStart(2, "0")}`;
  return `${h12}${mm} ${ampm}`;
}

export function generateStudioTimeLabelsForDay(): string[] {
  const out: string[] = [];
  for (let h = STUDIO_DAY_START_HOUR; h < STUDIO_DAY_END_HOUR; h++) {
    for (const m of [0, 30]) {
      if (h === STUDIO_DAY_END_HOUR - 1 && m === 30) break;
      out.push(formatTimeLabel(h, m));
    }
  }
  return out;
}

export type StudioBookingLike = {
  locationId: string;
  dateIso: string;
  timeLabel: string;
  stylistId?: string | null;
  status?: string;
};

export function normalizeTimeLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ").toLowerCase();
}

export function bookingSlotConflicts(
  existing: StudioBookingLike[],
  next: { locationId: string; dateIso: string; timeLabel: string; stylistId: string }
): boolean {
  const t = normalizeTimeLabel(next.timeLabel);
  const atSlot = existing.filter(
    (e) =>
      e.locationId === next.locationId &&
      e.dateIso === next.dateIso &&
      normalizeTimeLabel(e.timeLabel) === t &&
      e.status !== "cancelled"
  );
  const sid = next.stylistId.trim();
  if (sid) {
    return atSlot.some((e) => (e.stylistId || "").trim() === sid);
  }
  const unassigned = atSlot.filter((e) => !(e.stylistId || "").trim()).length;
  return unassigned >= STUDIO_MAX_UNASSIGNED_PER_SLOT;
}
