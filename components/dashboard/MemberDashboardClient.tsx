'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { Heart, DollarSign, Droplet, Wallet, TrendingUp, TrendingDown, Circle, CheckCircle2, Flame } from 'lucide-react';
import { scoreColor, scoreLabel } from '@/lib/wellfilab-score';
import { ScoreRing } from '@/components/ui/ScoreRing';
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
import { LockedInsightTile } from './LockedInsightTile';
import { RiskAlertsCard } from './RiskAlertsCard';
import { GoalProgressCard } from './GoalProgressCard';
import { NetWorthCard } from './NetWorthCard';
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
const HealthWealthTrendChart = dynamic(
  () => import('./HealthWealthTrendChart').then(m => m.HealthWealthTrendChart),
  { ssr: false, loading: () => <div className="h-60 animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" /> }
);
const MiniTrendLine = dynamic(
  () => import('./MiniTrendLine').then(m => m.MiniTrendLine),
  { ssr: false }
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

function ScoreSummaryCard({ label, icon, score, delta, dims, series }: {
  label: string; icon: React.ReactNode; score: number; delta?: number;
  dims: { id: string; label: string; score: number; icon: string }[];
  series: number[];
}) {
  const color = scoreColor(score);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label} Score</p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ color, backgroundColor: `${color}1a` }}>
          {delta != null && delta >= 0 && <TrendingUp size={11} />}
          {delta != null && delta < 0 && <TrendingDown size={11} />}
          {scoreLabel(score)}
        </span>
      </div>
      <div className="flex items-end gap-2 mb-1">
        <span className="font-mono tabular-nums text-4xl font-black" style={{ color }}>{Math.round(score)}</span>
        <span className="text-gray-400 text-sm mb-1">/100</span>
      </div>
      {delta != null ? (
        <p className={`text-xs font-semibold flex items-center gap-1 ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : delta < 0 ? 'text-red-500' : 'text-gray-400'}`}>
          {delta > 0 ? <TrendingUp size={12} /> : delta < 0 ? <TrendingDown size={12} /> : null}
          {delta > 0 ? '+' : ''}{delta} pts since last check-in
        </p>
      ) : <div className="h-4" />}

      {series.length > 1 && (
        <div className="-mx-2 mt-1">
          <MiniTrendLine data={series} color={color} />
        </div>
      )}

      {dims.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {dims.map(d => <DimTile key={d.id} label={d.label} score={d.score} icon={d.icon} />)}
        </div>
      )}
    </div>
  );
}

const TREND_WINDOWS = [3, 6, 10] as const;

export function MemberDashboardClient({ userName, userEmail, userImageUrl, memberSince }: Props) {
  const [focus, setFocus] = useState<ScoreFocus>('both');
  const [showImportBanner, setShowImportBanner] = useState(false);
  const [roadmapStarted, setRoadmapStarted] = useState(false);
  const [trendWindow, setTrendWindow] = useState<typeof TREND_WINDOWS[number]>(6);
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

  // Oldest -> newest, for the mini sparklines and the trend window below.
  const chronological = (history ?? []).slice().reverse();
  const healthSeriesFull = chronological.map(h => Math.round((h.body + h.mind) / 2));
  const wealthSeriesFull = chronological.map(h => h.wealth);
  const windowed = chronological.slice(-trendWindow);
  const healthImprovement = windowed.length > 1 ? Math.round((windowed[windowed.length - 1].body + windowed[windowed.length - 1].mind) / 2) - Math.round((windowed[0].body + windowed[0].mind) / 2) : null;
  const wealthImprovement = windowed.length > 1 ? windowed[windowed.length - 1].wealth - windowed[0].wealth : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Hero — one bold moment: the real score, big, with real
           identity (archetype) instead of a small badge buried in a
           header bar. Same dark-gradient brand language as the homepage
           hero, not a duplicated but distinct look. ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)', backgroundSize: '28px 28px'}} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <div className="flex items-center gap-3 mb-6">
            {userImageUrl ? (
              <img src={userImageUrl} alt="" className="w-10 h-10 rounded-xl object-cover border-2 border-white/20 flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-sm font-black text-white flex-shrink-0">
                {firstName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-bold text-sm leading-tight">{!loading ? `${greeting}, ${firstName}` : `Welcome, ${firstName}`} 👋</p>
              <p className="text-white/40 text-xs">{!loading ? monthLabel : ' '}</p>
            </div>
          </div>

          {score && (
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className="relative flex-shrink-0" style={{ width: 150, height: 150 }}>
                <ScoreRing pct={score.overall} color={scoreColor(score.overall)} size={150} thick={12} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono tabular-nums font-black text-5xl text-white leading-none">{score.overall}</span>
                  <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest mt-1">Score</span>
                </div>
              </div>
              <div className="text-center md:text-left flex-1">
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Your WellFiLab archetype</p>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-2">
                  {score.archetype.emoji} {score.archetype.name}
                </h1>
                <p className="text-white/60 text-base leading-relaxed max-w-lg">{score.archetype.tagline}</p>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-4 flex-wrap">
                  {score.streakDays > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
                      <Flame size={13} /> {score.streakDays} day streak
                    </span>
                  )}
                  {score.scoreChange != null && score.scoreChange !== 0 && (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1.5 border ${
                      score.scoreChange > 0
                        ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-red-300 bg-red-500/10 border-red-500/20'
                    }`}>
                      {score.scoreChange > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {score.scoreChange > 0 ? '+' : ''}{score.scoreChange} pts since last check-in
                    </span>
                  )}
                  <Link href="/score" className="text-xs font-bold text-white/50 hover:text-white transition-colors underline underline-offset-2">
                    Retake your score →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!loading && showImportBanner && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
          <ImportLocalDataBanner onDone={handleImportDone} />
        </div>
      )}

      {loading ? (
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

      {/* ── Focus selector ── */}
      <div className="flex items-center justify-end gap-3 flex-wrap">
        <FocusSelector focus={focus} onChange={handleFocusChange} />
      </div>

      {/* ── Split Health / Wealth score cards ── */}
      <div className="grid lg:grid-cols-2 gap-5">
        {focus !== 'wealth' && (
          <ScoreSummaryCard label="Health" icon={<Heart size={16} />} score={healthScore ?? score.body} delta={healthDelta} dims={healthDims} series={healthSeriesFull} />
        )}
        {focus !== 'health' && (
          <ScoreSummaryCard label="Wealth" icon={<DollarSign size={16} />} score={score.wealth} delta={wealthDelta} dims={wealthDims} series={wealthSeriesFull} />
        )}
      </div>

      {/* ── Do This Next / Trend Analysis — merged Priorities + Action Plan
           into one focused card (same real data, less box-sprawl) next to
           Trend, instead of three same-weight boxes competing for attention. ── */}
      <div className="grid lg:grid-cols-2 gap-5 items-stretch">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Do This Next</p>
            {roadmapProgress && <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">Phase {roadmapProgress.activePhaseNum} · {roadmapProgress.activePhaseLabel}</span>}
          </div>

          {score.actions[0] && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900 mb-4">
              <span className="flex-shrink-0 text-[10px] font-black text-white bg-teal-600 rounded-full w-5 h-5 flex items-center justify-center mt-0.5">1</span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{score.actions[0].title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{score.actions[0].why}</p>
              </div>
            </div>
          )}

          {/* Real connected checklist — the current active phase's real
              actions (same generator the roadmap page itself uses, see
              lib/roadmapProgress.ts's activePhaseActions) with their real
              checked state, not a duplicated/invented list. */}
          {!roadmapStarted ? (
            <div className="text-center py-4">
              <p className="text-xs text-gray-400 mb-3">You haven't started your roadmap yet.</p>
              <Link href="/roadmap" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Start your roadmap →</Link>
            </div>
          ) : roadmapProgress && roadmapProgress.activePhaseActions.length > 0 ? (
            <div className="space-y-2.5">
              {roadmapProgress.activePhaseActions.slice(0, 3).map((a, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {a.checked
                    ? <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0" />
                    : <Circle size={17} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />}
                  <p className={`text-xs font-medium leading-tight ${a.checked ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{a.title}</p>
                </div>
              ))}
              <Link href="/roadmap" className="block text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline pt-2">View full action plan →</Link>
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-2">No active phase yet — take your score to build a roadmap.</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Trend Analysis</p>
            <select value={trendWindow} onChange={e => setTrendWindow(Number(e.target.value) as typeof TREND_WINDOWS[number])}
              className="text-[11px] font-semibold border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none">
              {TREND_WINDOWS.map(w => <option key={w} value={w}>Last {w} check-ins</option>)}
            </select>
          </div>
          <HealthWealthTrendChart history={history ?? []} limit={trendWindow} />
          {(healthImprovement != null || wealthImprovement != null) && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {healthImprovement != null && focus !== 'wealth' && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                  <p className="text-[10px] text-gray-400">Health Improvement</p>
                  <p className={`font-mono tabular-nums text-sm font-bold ${healthImprovement >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{healthImprovement > 0 ? '+' : ''}{healthImprovement} points</p>
                </div>
              )}
              {wealthImprovement != null && focus !== 'health' && (
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <p className="text-[10px] text-gray-400">Wealth Improvement</p>
                  <p className={`font-mono tabular-nums text-sm font-bold ${wealthImprovement >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-500'}`}>{wealthImprovement > 0 ? '+' : ''}{wealthImprovement} points</p>
                </div>
              )}
            </div>
          )}
          <Link href="/history" className="block text-center text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline mt-3">Full history →</Link>
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

      {/* ── Your full picture — real detail, visually secondary to the hero
           and Do This Next zone above so the page has one clear focal point
           instead of a dozen equal-weight boxes. ── */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Your Full Picture</p>

        <div className="space-y-6">
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
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-400 pt-2">
        Scores and history are synced to your account — sign in on any device and it's all here. <Link href="/contact" className="underline hover:text-teal-600 dark:hover:text-teal-400">Questions?</Link>
      </p>
      </div>
      )}
    </div>
  );
}
