// Placeholder availability: Monday to Saturday, 10:00–19:00 IST, 30-minute slots.
// Nothing here is a real calendar. A deterministic share of slots is dropped so the grid
// looks like a working week, and the same date always produces the same slots.

export const IST_OFFSET_MINUTES = 330;
export const SLOT_MINUTES = 30;
const OPEN_HOUR = 10;
const CLOSE_HOUR = 19;
const MIN_LEAD_HOURS = 24;

/** Monday (YYYY-MM-DD, in IST) of the week containing `date`. */
export function weekStartIst(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MINUTES * 60_000);
  const day = ist.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  ist.setUTCDate(ist.getUTCDate() + diff);
  return ist.toISOString().slice(0, 10);
}

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function istIso(date: string, hour: number, minute: number) {
  return `${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:30`;
}

export function generateWeek(service: string, weekStart: string, now: Date) {
  const earliest = now.getTime() + MIN_LEAD_HOURS * 3_600_000;
  const days: { date: string; slots: { start: string; minutes: number }[] }[] = [];
  const monday = new Date(`${weekStart}T00:00:00Z`);
  for (let d = 0; d < 6; d++) {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + d);
    const date = day.toISOString().slice(0, 10);
    const slots = [];
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      for (const m of [0, 30]) {
        const start = istIso(date, h, m);
        if (new Date(start).getTime() < earliest) continue;
        if (hash(`${service}|${start}`) % 10 < 3) continue; // roughly 30% look taken
        slots.push({ start, minutes: SLOT_MINUTES });
      }
    }
    days.push({ date, slots });
  }
  return days;
}

/** Normalise any offset ISO string to the canonical +05:30 form used by generated slots. */
export function toIstIso(value: string) {
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return null;
  const ist = new Date(t + IST_OFFSET_MINUTES * 60_000).toISOString();
  return `${ist.slice(0, 19)}+05:30`;
}
