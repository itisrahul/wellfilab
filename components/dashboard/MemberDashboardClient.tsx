'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { Heart, DollarSign, Droplet, Wallet } from 'lucide-react';
import { scoreColor, scoreLabel } from '@/lib/wellfilab-score';
import { getScoreHistory } from '@/lib/scoreStorage';
import { syncScoreInputsFromAccount } from '@/lib/scoreInputs';
import { getGoals } from '@/lib/goalsStorage';
import { getSnapshots, syncNetWorthGoal } from '@/lib/netWorthHistory';
import { getRiskAlerts } from '@/lib/riskAlerts';
import { computeRoadmapProgress } from '@/lib/roadmapProgress';
import { getAchievements } from '@/lib/achievements';
import { getScoreFocus, setScoreFocus, dimMatchesFocus, type ScoreFocus } from '@/lib/scoreFocus';
import { syncRoadmapChecksFromAccount } from '@/lib/roadmapChecks';
import { hasUnimportedLocalData } from '@/lib/accountImport';
import { SWR_KEYS } from '@/lib/swrKeys';
import { ImportLocalDataBanner } from './ImportLocalDataBanner';
import { DashboardShell } from './DashboardShell';
import { LockedInsightTile } from './LockedInsightTile';
import { HealthWealthTrendChart } from './HealthWealthTrendChart';
import { RiskAlertsCard } from './RiskAlertsCard';
import { GoalProgressCard } from './GoalProgressCard';
import { NetWorthCard } from './NetWorthCard';
import { RoadmapProgressCard } from './RoadmapProgressCard';
import { AchievementsCard } from './AchievementsCard';
import { NextStepsCard } from './NextStepsCard';
import { MonthlyReviewBand } from './MonthlyReviewBand';
import { FocusSelector } from './FocusSelector';

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

const HEALTH_DIM_IDS = ['sleep', 'movement', 'stress'];
const WEALTH_DIM_IDS = ['savings', 'investing', 'debt'];

/** Refetches every account data source — used after the one-time import
 * banner completes, since it may have just written into all of them. */
function refreshAllAccountData() {
  return Promise.all([
    mutate(SWR_KEYS.scoreHistory), mutate(SWR_KEYS.goals), mutate(SWR_KEYS.netWorthSnapshots),
    mutate(SWR_KEYS.roadmapChecks), mutate(SWR_KEYS.scoreInputs),
  ]);
}

function DimTile({ label, score, icon }: { label: string; score: number; icon: string }) {
  const color = scoreColor(score);
  return (
    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
      <p className="text-[11px] text-gray-400 mb-1">{icon} {label}</p>
      <p className="font-mono tabular-nums font-bold text-sm" style={{ color }}>{Math.round(score)}<span className="text-gray-400 font-normal">/100</span></p>
    </div>
  );
}

function ScoreSummaryCard({ label, icon, score, delta, dims }: {
  label: string; icon: React.ReactNode; score: number; delta?: number;
  dims: { id: string; label: string; score: number; icon: string }[];
}) {
  const color = scoreColor(score);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color }}>{icon}</span>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label} Score</p>
      </div>
      <div className="flex items-end gap-2 mb-1">
        <span className="font-mono tabular-nums text-4xl font-black" style={{ color }}>{Math.round(score)}</span>
        <span className="text-gray-400 text-sm mb-1">/100</span>
        <span className="mb-1.5 ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: `${color}1a` }}>{scoreLabel(score)}</span>
      </div>
      {delta != null && (
        <p className={`text-xs font-semibold ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
          {delta > 0 ? '+' : ''}{delta} pts since last check-in
        </p>
      )}
      {dims.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {dims.map(d => <DimTile key={d.id} label={d.label} score={d.score} icon={d.icon} />)}
        </div>
      )}
    </div>
  );
}

export function MemberDashboardClient({ userName, userEmail, userImageUrl, memberSince }: Props) {
  const [focus, setFocus] = useState<ScoreFocus>('both');
  const [showImportBanner, setShowImportBanner] = useState(false);
  const [roadmapStarted, setRoadmapStarted] = useState(false);
  const firstName = userName.split(' ')[0];

  // Cached by shared keys (lib/swrKeys.ts) — the same data fetched here is
  // reused (not re-fetched) when the user then visits /goals, /roadmap, or
  // /history, and vice versa.
  const { data: history, isLoading: historyLoading } = useSWR(SWR_KEYS.scoreHistory, getScoreHistory);
  const { data: rawGoals, isLoading: goalsLoading } = useSWR(SWR_KEYS.goals, getGoals);
  const { data: netWorthSnapshots, isLoading: snapshotsLoading } = useSWR(SWR_KEYS.netWorthSnapshots, getSnapshots);
  const { data: roadmapChecks, isLoading: roadmapLoading } = useSWR(SWR_KEYS.roadmapChecks, syncRoadmapChecksFromAccount);
  const { data: rawInputs, isLoading: inputsLoading } = useSWR(SWR_KEYS.scoreInputs, syncScoreInputsFromAccount);

  const loading = historyLoading || goalsLoading || snapshotsLoading || roadmapLoading || inputsLoading;
  const score = history?.[0] ?? null;

  // A 'net-worth' goal reads its current value from the latest real
  // snapshot instead of a stale manual entry — see syncNetWorthGoal.
  const goals = useMemo(
    () => (rawGoals ?? []).map(g => syncNetWorthGoal(g, netWorthSnapshots ?? [])),
    [rawGoals, netWorthSnapshots]
  );

  useEffect(() => {
    setFocus(getScoreFocus());
    setShowImportBanner(hasUnimportedLocalData());
    setRoadmapStarted(typeof window !== 'undefined' && !!window.localStorage.getItem('wfl_roadmap_start'));
  }, []);

  useEffect(() => {
    if (score && typeof window !== 'undefined' && !window.localStorage.getItem('wfl_roadmap_start')) {
      const now = new Date().toISOString();
      window.localStorage.setItem('wfl_roadmap_start', now);
      setRoadmapStarted(true);
    }
  }, [score]);

  const handleImportDone = () => {
    setShowImportBanner(false);
    refreshAllAccountData();
  };

  const handleFocusChange = (f: ScoreFocus) => {
    setFocus(f);
    setScoreFocus(f);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const roadmapProgress = score
    ? computeRoadmapProgress(score, rawInputs?.body ?? null, rawInputs?.finance ?? null, roadmapChecks ?? {}, focus)
    : null;

  // Real deltas vs the previous saved check-in — never against an assumed
  // "last month," since real check-in cadence varies. Skipped across a
  // scoreVersion boundary, same rule the algorithm itself uses for
  // `scoreChange`, so a formula update never shows as a fake swing.
  const prevEntry = history && history.length > 1 ? history[1] : null;
  const prevValid = !!(prevEntry && score && prevEntry.scoreVersion === score.scoreVersion);
  const healthScore = score ? Math.round((score.body + score.mind) / 2) : null;
  const healthDelta = prevValid && healthScore != null ? healthScore - Math.round((prevEntry!.body + prevEntry!.mind) / 2) : undefined;
  const wealthDelta = prevValid && score ? score.wealth - prevEntry!.wealth : undefined;

  const healthDims = score?.dimensions.filter(d => HEALTH_DIM_IDS.includes(d.id)) ?? [];
  const wealthDims = score?.dimensions.filter(d => WEALTH_DIM_IDS.includes(d.id)) ?? [];

  const latestNetWorth = netWorthSnapshots && netWorthSnapshots.length > 0 ? netWorthSnapshots[netWorthSnapshots.length - 1] : null;

  const content = loading ? (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center text-gray-400 text-sm">Loading your dashboard…</div>
  ) : !score ? (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
      <p className="text-4xl mb-4">🎯</p>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You haven't taken your WellFiLab Score yet</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Answer 3 quick questions and get your score, archetype, and a personalised action plan in under a minute.
      </p>
      <Link href="/score" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
        Get my free score →
      </Link>
    </div>
  ) : (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">{greeting}, {firstName}! 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Here's your health and wealth overview — {monthLabel}</p>
        </div>
        <FocusSelector focus={focus} onChange={handleFocusChange} />
      </div>

      {showImportBanner && <ImportLocalDataBanner onDone={handleImportDone} />}

      {/* ── Split Health / Wealth score cards ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {focus !== 'wealth' && (
          <ScoreSummaryCard label="Health" icon={<Heart size={16} />} score={healthScore ?? score.body} delta={healthDelta} dims={healthDims} />
        )}
        {focus !== 'health' && (
          <ScoreSummaryCard label="Wealth" icon={<DollarSign size={16} />} score={score.wealth} delta={wealthDelta} dims={wealthDims} />
        )}
      </div>

      {/* ── Priorities / Action Plan / Trend Analysis ── */}
      <div className="grid lg:grid-cols-3 gap-5 items-stretch">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Priorities</p>
          <div className="space-y-3">
            {score.actions.slice(0, 3).map(a => (
              <div key={a.rank} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight">{a.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{a.why}</p>
                </div>
                <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  a.howEasy === 'today' ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                  : a.howEasy === 'this-week' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {a.howEasy === 'today' ? 'High' : a.howEasy === 'this-week' ? 'Medium' : 'Low'} Priority
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Action Plan</p>
          <RoadmapProgressCard started={roadmapStarted} progress={roadmapProgress} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Trend Analysis</p>
            <Link href="/history" className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline">Full history →</Link>
          </div>
          <HealthWealthTrendChart history={history ?? []} />
        </div>
      </div>

      {/* ── Real-time insights — real "as of last update" tiles mixed with
           honestly-locked tiles for data we don't have access to yet (no
           wearable or bank/investment integration exists) ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Insights</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {focus !== 'wealth' && rawInputs?.body?.sleepHours != null && (
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <Droplet size={16} className="text-teal-500 mb-2" />
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Sleep</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{rawInputs.body.sleepHours}h · last reported</p>
            </div>
          )}
          {focus !== 'health' && latestNetWorth && (
            <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <Wallet size={16} className="text-amber-500 mb-2" />
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Net Worth</p>
              <p className="text-[11px] text-gray-400 mt-0.5">₹{latestNetWorth.netWorth.toLocaleString('en-IN')} · last snapshot</p>
            </div>
          )}
          {focus !== 'wealth' && <LockedInsightTile icon="❤️" label="Heart Rate" connectLabel="Connect a wearable" />}
          {focus !== 'wealth' && <LockedInsightTile icon="🔥" label="Calories Burned" connectLabel="Connect a wearable" />}
          {focus !== 'health' && <LockedInsightTile icon="🏦" label="Bank Balance" connectLabel="Connect your bank" />}
          {focus !== 'health' && <LockedInsightTile icon="📈" label="Investments" connectLabel="Connect your broker" />}
        </div>
      </div>

      {/* ── Everything else that already works well ── */}
      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        <GoalProgressCard goals={goals} focus={focus} />
        {focus !== 'health' && <NetWorthCard snapshots={netWorthSnapshots ?? []} age={rawInputs?.body?.age} />}
      </div>

      {focus !== 'wealth' && (
        <RiskAlertsCard alerts={getRiskAlerts(
          rawInputs?.body ?? null,
          focus === 'health' ? null : rawInputs?.finance ?? null,
        )} />
      )}

      <div className="grid lg:grid-cols-5 gap-6 items-stretch">
        <div className="lg:col-span-3"><ScoreHistoryChart history={history ?? []} /></div>
        <div className="lg:col-span-2"><AchievementsCard achievements={getAchievements(score, history ?? [], roadmapProgress, goals)} /></div>
      </div>

      <NextStepsCard
        dimensions={(() => {
          const focused = score.dimensions.filter(d => dimMatchesFocus(d.id, focus));
          return focused.length > 0 ? focused : score.dimensions;
        })()}
        body={rawInputs?.body ?? null} finance={rawInputs?.finance ?? null}
      />

      <MonthlyReviewBand score={score} />

      <p className="text-center text-[11px] text-gray-400 pt-2">
        Scores and history are synced to your account — sign in on any device and it's all here. <Link href="/contact" className="underline hover:text-teal-600 dark:hover:text-teal-400">Questions?</Link>
      </p>
    </div>
  );

  return (
    <DashboardShell score={score} scoreChangeLabel={score?.scoreChange != null ? `${score.scoreChange > 0 ? '+' : ''}${score.scoreChange} pts since last check-in` : undefined}>
      {content}
    </DashboardShell>
  );
}
