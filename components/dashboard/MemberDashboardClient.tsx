'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { scoreColor, type WellFiScore } from '@/lib/wellfilab-score';
import { getLatestScore, getScoreHistory } from '@/lib/scoreStorage';
import { getSubscription, getCalcHistory, type StoredSubscription, type CalcHistoryEntry } from '@/lib/dashboardData';
import { AICoach } from './AICoach';
import { PlanStatus } from './PlanStatus';
import { QuickTools } from './QuickTools';

// recharts is heavy — load it only on the client, same pattern every
// calculator widget already uses, instead of bloating the dashboard's
// initial JS payload with a library only this one chart needs.
const ScoreHistoryChart = dynamic(
  () => import('./ScoreHistoryChart').then(m => m.ScoreHistoryChart),
  { ssr: false, loading: () => <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-full min-h-[300px] animate-pulse" /> }
);

interface Props {
  userName: string;
  userEmail: string;
  userImageUrl: string;
  memberSince: string;
}

interface DashboardData {
  score: WellFiScore | null;
  history: WellFiScore[];
  subscription: StoredSubscription | null;
  calcHistory: CalcHistoryEntry[];
  greeting: string;
  dateStr: string;
}

const DIMENSIONS: { key: 'body' | 'mind' | 'wealth' | 'life'; label: string; icon: string; barColor: string }[] = [
  { key: 'body',   label: 'Body',   icon: '💪', barColor: 'bg-teal-500' },
  { key: 'mind',   label: 'Mind',   icon: '🧠', barColor: 'bg-indigo-500' },
  { key: 'wealth', label: 'Wealth', icon: '💰', barColor: 'bg-amber-500' },
  { key: 'life',   label: 'Life',   icon: '🌱', barColor: 'bg-green-500' },
];

export function MemberDashboardClient({ userName, userEmail, userImageUrl, memberSince }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const firstName = userName.split(' ')[0];
  const initial = userName.trim().charAt(0).toUpperCase() || 'W';

  useEffect(() => {
    const hour = new Date().getHours();
    Promise.all([getLatestScore(), getScoreHistory()]).then(([score, history]) => {
      setData({
        score, history,
        subscription: getSubscription(),
        calcHistory:  getCalcHistory(),
        greeting:     hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening',
        dateStr:      new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Header — dark gradient with teal glow ── */}
      <div className="relative overflow-hidden bg-gray-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start justify-between gap-6 flex-wrap">

            <div className="flex items-center gap-4">
              {userImageUrl ? (
                <img src={userImageUrl} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-xl font-black text-white flex-shrink-0">
                  {initial}
                </div>
              )}
              <div>
                <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">
                  {data ? data.dateStr : ' '}
                </p>
                <h1 className="text-2xl font-extrabold text-white mb-0.5">
                  {data ? `${data.greeting}, ${firstName}` : `Welcome, ${firstName}`} 👋
                </h1>
                <p className="text-white/50 text-sm">{userEmail}{memberSince ? ` · Member since ${memberSince}` : ''}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 min-w-[92px]">
                <p className="text-2xl font-black" style={{ color: data?.score ? scoreColor(data.score.overall) : '#6b7280' }}>
                  {data?.score?.overall ?? '—'}
                </p>
                <p className="text-white/40 text-[11px]">WellFiLab Score</p>
              </div>
              <div className="text-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 min-w-[92px]">
                <p className="text-2xl font-black text-teal-400">{data?.score?.streakDays ?? '—'}</p>
                <p className="text-white/40 text-[11px]">Day streak 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!data ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center text-gray-400 text-sm">Loading your dashboard…</div>
      ) : !data.score ? (
        // ── No score yet — CTA to take it ──
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-4xl mb-4">🎯</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You haven't taken your WellFiLab Score yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Answer 3 quick questions and get your score, archetype, and a personalised action plan in under a minute.
          </p>
          <Link href="/score" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
            Take the WellFiLab Score →
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Score + archetype hero */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex items-center gap-4 flex-wrap justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{data.score.archetype.emoji}</span>
                <div>
                  <p className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">{data.score.archetype.name}</p>
                  <p className="text-xs text-gray-400">{data.score.archetype.tagline}</p>
                </div>
              </div>
              <Link href="/score" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex-shrink-0">
                View full score →
              </Link>
            </div>

            {/* 4 dimension progress bars */}
            <div className="grid sm:grid-cols-2 gap-4">
              {DIMENSIONS.map(d => (
                <div key={d.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                      <span>{d.icon}</span>{d.label}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{data.score[d.key]}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${d.barColor} transition-all duration-700`} style={{ width: `${data.score![d.key]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Coach */}
          <AICoach score={data.score} />

          {/* Chart (2/3) + Plan status (1/3) */}
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2"><ScoreHistoryChart history={data.history} /></div>
            <div><PlanStatus subscription={data.subscription} /></div>
          </div>

          {/* Last 3 actions */}
          {data.score.actions.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Do this next</p>
              <div className="space-y-3">
                {data.score.actions.slice(0, 3).map(a => (
                  <div key={a.rank} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{a.rank}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{a.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-1.5">{a.why}</p>
                        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">{a.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick tools */}
          <QuickTools actions={data.score.actions} calcHistory={data.calcHistory} />

          <p className="text-center text-[11px] text-gray-400 pt-2">
            Scores and history are stored on this device only. <Link href="/contact" className="underline hover:text-teal-600 dark:hover:text-teal-400">Questions?</Link>
          </p>
        </div>
      )}
    </div>
  );
}
