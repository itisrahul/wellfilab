'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  getScoreHistory, getLifeROIHistory, getScoreHistoryChartData, getSubscription,
  getCalcHistory, recordVisitAndGetStreak, scoreColor,
  type ScoreSnapshotLike, type LifeROIHistoryEntry, type ChartPoint, type StoredSubscription, type CalcHistoryEntry,
} from '@/lib/dashboardData';
import { ScoreRingsSection } from './ScoreRingsSection';
import { AICoach } from './AICoach';
import { AIRecommendations } from './AIRecommendations';
import { LifeInsightsFeed } from './LifeInsightsFeed';
import { PlanStatus } from './PlanStatus';
import { QuickTools } from './QuickTools';

// recharts is heavy — load it only on the client, same pattern every
// calculator widget already uses, instead of bloating the dashboard's
// initial JS payload with a library only this one chart needs.
const ScoreHistoryChart = dynamic(
  () => import('./ScoreHistoryChart').then(m => m.ScoreHistoryChart),
  { ssr: false, loading: () => <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 h-full min-h-[340px] animate-pulse" /> }
);

interface Props {
  userName: string;
  userEmail: string;
  userImageUrl: string;
  memberSince: string;
}

interface DashboardData {
  scoreHistory: ScoreSnapshotLike[];
  lifeRoiHistory: LifeROIHistoryEntry[];
  chartData: ChartPoint[];
  subscription: StoredSubscription | null;
  calcHistory: CalcHistoryEntry[];
  streak: number;
  greeting: string;
  dateStr: string;
}

export function MemberDashboardClient({ userName, userEmail, userImageUrl, memberSince }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const firstName = userName.split(' ')[0];
  const initial = userName.trim().charAt(0).toUpperCase() || 'W';

  useEffect(() => {
    const hour = new Date().getHours();
    setData({
      scoreHistory:   getScoreHistory(),
      lifeRoiHistory: getLifeROIHistory(),
      chartData:      getScoreHistoryChartData(),
      subscription:   getSubscription(),
      calcHistory:    getCalcHistory(),
      streak:         recordVisitAndGetStreak(),
      greeting:       hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening',
      dateStr:        new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    });
  }, []);

  const latestLifeROI = data?.lifeRoiHistory[0]?.lifeROIScore;

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
                  {data ? data.dateStr : ' '}
                </p>
                <h1 className="text-2xl font-extrabold text-white mb-0.5">
                  {data ? `${data.greeting}, ${firstName}` : `Welcome, ${firstName}`} 👋
                </h1>
                <p className="text-white/50 text-sm">{userEmail}{memberSince ? ` · Member since ${memberSince}` : ''}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="text-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 min-w-[92px]">
                <p className="text-2xl font-black" style={{ color: latestLifeROI != null ? scoreColor(latestLifeROI) : '#6b7280' }}>
                  {latestLifeROI ?? '—'}
                </p>
                <p className="text-white/40 text-[11px]">Life ROI Score</p>
              </div>
              <div className="text-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 min-w-[92px]">
                <p className="text-2xl font-black text-teal-400">{data ? data.streak : '—'}</p>
                <p className="text-white/40 text-[11px]">Day streak 🔥</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!data ? (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center text-gray-400 text-sm">Loading your dashboard…</div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Row 1 — three score rings */}
          <ScoreRingsSection scoreHistory={data.scoreHistory} lifeRoiHistory={data.lifeRoiHistory} />

          {/* AI Coach — real Claude-generated analysis, the flagship differentiator */}
          <AICoach scoreHistory={data.scoreHistory} lifeRoiHistory={data.lifeRoiHistory} />

          {/* Row 2 — chart (2/3) + AI recommendations (1/3) */}
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2"><ScoreHistoryChart data={data.chartData} /></div>
            <div><AIRecommendations lifeRoiHistory={data.lifeRoiHistory} /></div>
          </div>

          {/* Row 3 — life insights (2/3) + plan status (1/3) */}
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-2"><LifeInsightsFeed lifeRoiHistory={data.lifeRoiHistory} /></div>
            <div><PlanStatus subscription={data.subscription} /></div>
          </div>

          {/* Row 4 — quick tools */}
          <QuickTools lifeRoiHistory={data.lifeRoiHistory} calcHistory={data.calcHistory} />

          <p className="text-center text-[11px] text-gray-400 pt-2">
            Scores and history are stored on this device only. <Link href="/contact" className="underline hover:text-teal-600 dark:hover:text-teal-400">Questions?</Link>
          </p>
        </div>
      )}
    </div>
  );
}
