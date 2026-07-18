'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { WellFiScore } from '@/lib/wellfilab-score';
import { getReminderPrefs, setReminderOptIn } from '@/lib/reminderPreference';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ReminderToggle() {
  const [optedIn, setOptedIn] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getReminderPrefs().then(p => setOptedIn(p.optedIn)); }, []);

  const toggle = async () => {
    if (optedIn == null) return;
    setSaving(true);
    const next = !optedIn;
    setOptedIn(next);
    await setReminderOptIn(next);
    setSaving(false);
  };

  if (optedIn == null) return null;

  return (
    <button onClick={toggle} disabled={saving}
      className="flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition-colors disabled:opacity-50">
      <span className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${optedIn ? 'bg-teal-500' : 'bg-white/20'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${optedIn ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      Email reminder {optedIn ? 'on' : 'off'}
    </button>
  );
}

export function MonthlyReviewBand({ score }: { score: WellFiScore }) {
  const lastReview = score.date ?? null;
  const daysSinceScore = lastReview ? Math.floor((Date.now() - new Date(lastReview).getTime()) / 86400000) : 0;
  const nextReviewDue = lastReview ? new Date(new Date(lastReview).getTime() + 28 * 86400000) : null;
  const reviewDue = daysSinceScore >= 28;

  return (
    <div className="rounded-2xl bg-gray-950 dark:bg-black p-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
        <div className="grid grid-cols-3 gap-6 flex-1">
          <div>
            <p className="font-mono tabular-nums text-lg font-black">{lastReview ? fmtDate(lastReview) : '—'}</p>
            <p className="text-[11px] text-white/40 mt-0.5">Last review</p>
          </div>
          <div>
            <p className={`font-mono tabular-nums text-lg font-black ${reviewDue ? 'text-amber-400' : ''}`}>
              {nextReviewDue ? (reviewDue ? 'Due now' : fmtDate(nextReviewDue.toISOString())) : '—'}
            </p>
            <p className="text-[11px] text-white/40 mt-0.5">Next review due</p>
          </div>
          <div>
            <p className="font-mono tabular-nums text-lg font-black">{score.streakDays}🔥</p>
            <p className="text-[11px] text-white/40 mt-0.5">Day streak</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <ReminderToggle />
          <Link href="/score?retake=1" className="px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-gray-950 text-xs font-bold transition-colors whitespace-nowrap">
            Update my numbers →
          </Link>
        </div>
      </div>
    </div>
  );
}
