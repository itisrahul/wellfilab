/**
 * lib/habitsStorage.ts — storage adapter for daily habit tracking.
 * Same async-wrapper-around-localStorage pattern as the rest of this codebase's
 * storage layers. Deliberately distinct from roadmap checkboxes (which track a
 * one-time action as permanently done) — a habit is checked off fresh every day,
 * and its value is the streak, not a single completion.
 */

export interface Habit {
  id: string;
  label: string;
  icon: string;
  createdAt: string;
  /** ISO date strings (YYYY-MM-DD), one per day this habit was checked off. */
  completions: string[];
}

const KEY = 'wfl_habits';

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function readHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function writeHabits(habits: Habit[]): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY, JSON.stringify(habits)); } catch { /* quota exceeded — non-critical */ }
}

export async function getHabits(): Promise<Habit[]> {
  return readHabits();
}

export async function addHabit(label: string, icon: string): Promise<Habit> {
  const habit: Habit = { id: genId(), label, icon, createdAt: new Date().toISOString(), completions: [] };
  writeHabits([...readHabits(), habit]);
  return habit;
}

export async function deleteHabit(id: string): Promise<void> {
  writeHabits(readHabits().filter(h => h.id !== id));
}

/** Toggles today's completion for a habit — check it off, or undo an accidental check. */
export async function toggleToday(id: string): Promise<void> {
  const today = todayStr();
  writeHabits(readHabits().map(h => {
    if (h.id !== id) return h;
    const done = h.completions.includes(today);
    return { ...h, completions: done ? h.completions.filter(d => d !== today) : [...h.completions, today] };
  }));
}

export function isDoneToday(habit: Habit): boolean {
  return habit.completions.includes(todayStr());
}

/** Consecutive-day streak ending today or yesterday (so it doesn't zero out the moment
 * the clock ticks past midnight before the user has had a chance to check in). */
export function habitStreak(habit: Habit): number {
  const days = Array.from(new Set(habit.completions)).map(d => new Date(d + 'T00:00:00').getTime()).sort((a, b) => b - a);
  if (days.length === 0) return 0;
  const today = new Date().setHours(0, 0, 0, 0);
  const daysSinceLast = Math.round((today - days[0]) / 86400000);
  if (daysSinceLast > 1) return 0;
  let streak = 1;
  for (let i = 0; i < days.length - 1; i++) {
    const gap = Math.round((days[i] - days[i + 1]) / 86400000);
    if (gap === 1) streak++;
    else break;
  }
  return streak;
}
