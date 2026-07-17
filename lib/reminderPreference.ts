/**
 * lib/reminderPreference.ts — client wrapper around /api/reminder-preference.
 * No localStorage cache here (unlike scoreStorage etc.) — this preference is
 * meaningless unless it reaches the account, since only the account-level
 * (Clerk) copy is visible to the cron job that actually sends the email.
 */

export interface ReminderPrefs {
  optedIn: boolean;
  lastSentAt?: string;
}

export async function getReminderPrefs(): Promise<ReminderPrefs> {
  try {
    const res = await fetch('/api/reminder-preference');
    if (!res.ok) return { optedIn: false };
    return await res.json();
  } catch {
    return { optedIn: false };
  }
}

export async function setReminderOptIn(optedIn: boolean): Promise<ReminderPrefs> {
  const res = await fetch('/api/reminder-preference', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optedIn }),
  });
  return res.json();
}
