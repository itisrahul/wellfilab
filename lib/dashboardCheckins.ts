/**
 * lib/dashboardCheckins.ts — daily dashboard check-ins (sleep, water,
 * movement, spending, stress, mood). Local-only for now (wfl_dash_ prefixed
 * keys, no account sync yet) — a lighter-weight, more-frequent log than the
 * full WellFiLab Score, which stays the source of truth for the real
 * Body/Mind/Wealth/Life scores shown elsewhere on the dashboard.
 */

export interface CheckinEntry {
  date: string; // YYYY-MM-DD, local date
  sleepHours?: number;
  waterGlasses?: number;
  movementMinutes?: number;
  spentToday?: number;
  stressLevel?: number; // 1-10
  mood?: number; // 1-5
}

const KEY = 'wfl_dash_checkins';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function readAll(): CheckinEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeAll(entries: CheckinEntry[]): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(entries)); } catch { /* quota exceeded — non-critical */ }
}

/** Oldest -> newest. */
export function getCheckins(): CheckinEntry[] {
  return readAll().sort((a, b) => a.date.localeCompare(b.date));
}

export function getTodayCheckin(): CheckinEntry | null {
  return readAll().find(e => e.date === todayKey()) ?? null;
}

export function saveTodayCheckin(fields: Omit<CheckinEntry, 'date'>): CheckinEntry {
  const all = readAll();
  const key = todayKey();
  const existing = all.find(e => e.date === key);
  const entry: CheckinEntry = { date: key, ...existing, ...fields };
  const next = existing ? all.map(e => (e.date === key ? entry : e)) : [...all, entry];
  writeAll(next);
  return entry;
}

/** Last N days (oldest -> newest), zero-filled for days with no entry, for
 * the weekly trend bars. */
export function getLastNDays(n: number): { date: string; label: string; sleepHours: number; waterGlasses: number; spentToday: number }[] {
  const byDate = new Map(readAll().map(e => [e.date, e]));
  const out: { date: string; label: string; sleepHours: number; waterGlasses: number; spentToday: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const e = byDate.get(key);
    out.push({
      date: key,
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      sleepHours: e?.sleepHours ?? 0,
      waterGlasses: e?.waterGlasses ?? 0,
      spentToday: e?.spentToday ?? 0,
    });
  }
  return out;
}
