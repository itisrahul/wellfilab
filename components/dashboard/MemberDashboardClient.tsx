'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useSWR, { mutate } from 'swr';
import { Flame } from 'lucide-react';
import { getScoreHistory } from '@/lib/scoreStorage';
import { syncScoreInputsFromAccount } from '@/lib/scoreInputs';
import { getGoals } from '@/lib/goalsStorage';
import { getHoldings, syncNetWorthGoalFromHoldings, computeMonthlyNetWorthHistory, getHoldingsSyncError } from '@/lib/holdingsStorage';
import { getRiskAlerts } from '@/lib/riskAlerts';
import { computeRoadmapProgress } from '@/lib/roadmapProgress';
import { dimMatchesFocus } from '@/lib/scoreFocus';
import { syncRoadmapChecksFromAccount, toggleRoadmapCheck, type RoadmapChecks } from '@/lib/roadmapChecks';
import { hasUnimportedLocalData } from '@/lib/accountImport';
import { fmtINR } from '@/lib/roadmapActions';
import { SWR_KEYS } from '@/lib/swrKeys';
import { RecentToolsBanner } from '@/components/ui/RecentToolsBanner';
import { ImportLocalDataBanner } from './ImportLocalDataBanner';
import { RiskAlertsCard } from './RiskAlertsCard';
import { GoalProgressCard } from './GoalProgressCard';
import { NextStepsCard } from './NextStepsCard';

// recharts is heavy — load it only on the client, same pattern every
// calculator widget already uses.
const GoalTrendChart = dynamic(
  () => import('./GoalTrendChart').then(m => m.GoalTrendChart),
  { ssr: false, loading: () => <div className="h-[140px] animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" /> }
);

interface Props {
  userName: string;
  userEmail: string;
  userImageUrl: string;
  memberSince: string;
}

/** Refetches every account data source — used after the one-time import
 * banner completes, since it may have just written into all of them. */
function refreshAllAccountData() {
  return Promise.all([
    mutate(SWR_KEYS.scoreHistory), mutate(SWR_KEYS.goals), mutate(SWR_KEYS.holdings),
    mutate(SWR_KEYS.roadmapChecks), mutate(SWR_KEYS.scoreInputs),
  ]);
}

function Metric({ label, value, pct, color, note }: { label: string; value: string; pct: number; color: string; note: string }) {
  return (
    <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3.5 bg-gray-50 dark:bg-gray-800/60">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-black text-gray-900 dark:text-white tracking-tight my-0.5">{value}</p>
      <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden my-2"><div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(2, pct))}%`, backgroundColor: color }} /></div>
      <p className="text-xs text-gray-400">{note}</p>
    </div>
  );
}

/**
 * One simple, continuous page — no category tabs, no big labelled sections.
 * Just what actually matters, in order: current score and its real history,
 * today's roadmap actions and next steps, goal progress, then risk alerts
 * and a few key numbers. Everything links out to its own full page for the
 * detail a glance doesn't need here.
 */
export function MemberDashboardClient({ userName, userImageUrl }: Props) {
  const [showImportBanner, setShowImportBanner] = useState(false);
  const [roadmapStarted, setRoadmapStarted] = useState(false);
  const firstName = userName.split(' ')[0];

  const { data: history, isLoading: historyLoading } = useSWR(SWR_KEYS.scoreHistory, getScoreHistory);
  const { data: rawGoals, isLoading: goalsLoading } = useSWR(SWR_KEYS.goals, getGoals);
  const { data: holdings, isLoading: holdingsLoading } = useSWR(SWR_KEYS.holdings, getHoldings);
  const { data: cachedChecks, isLoading: roadmapLoading, mutate: mutateChecks } = useSWR(SWR_KEYS.roadmapChecks, syncRoadmapChecksFromAccount);
  const { data: rawInputs, isLoading: inputsLoading } = useSWR(SWR_KEYS.scoreInputs, syncScoreInputsFromAccount);
  const [checks, setChecks] = useState<RoadmapChecks>({});

  const loading = historyLoading || goalsLoading || holdingsLoading || roadmapLoading || inputsLoading;
  const score = history?.[0] ?? null;

  const goals = useMemo(
    () => (rawGoals ?? []).map(g => syncNetWorthGoalFromHoldings(g, holdings ?? [])),
    [rawGoals, holdings]
  );

  useEffect(() => {
    setShowImportBanner(hasUnimportedLocalData());
    setRoadmapStarted(typeof window !== 'undefined' && !!window.localStorage.getItem('wfl_roadmap_start'));
  }, []);

  useEffect(() => {
    if (cachedChecks) setChecks(cachedChecks);
  }, [cachedChecks]);

  // Same optimistic-update pattern as app/roadmap/page.tsx — toggle the
  // real check, update local state immediately, and push the result into
  // the shared SWR cache (no refetch) so other mounted views stay in sync.
  const toggleCheck = (id: string) => {
    setChecks(prev => {
      const next = toggleRoadmapCheck(prev, id);
      mutateChecks(next, false);
      return next;
    });
  };

  useEffect(() => {
    if (score && typeof window !== 'undefined' && !window.localStorage.getItem('wfl_roadmap_start')) {
      window.localStorage.setItem('wfl_roadmap_start', new Date().toISOString());
      setRoadmapStarted(true);
    }
  }, [score]);

  const handleImportDone = () => {
    setShowImportBanner(false);
    refreshAllAccountData();
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const roadmapProgress = score
    ? computeRoadmapProgress(score, rawInputs?.body ?? null, rawInputs?.finance ?? null, checks, 'both')
    : null;
  const actionsLeftToday = roadmapProgress ? roadmapProgress.activePhaseActions.filter(a => !a.checked).length : 0;

  const prevEntry = history && history.length > 1 ? history[1] : null;
  const prevValid = !!(prevEntry && score && prevEntry.scoreVersion === score.scoreVersion);
  const scoreDelta = prevValid && score && prevEntry ? score.overall - prevEntry.overall : undefined;

  const scoreTrend = (history ?? []).slice().reverse().map(h => ({ date: h.date as string, value: h.overall }));

  const monthlyNetWorth = computeMonthlyNetWorthHistory(holdings ?? []);
  const latestNetWorth = monthlyNetWorth.length > 0 ? monthlyNetWorth[monthlyNetWorth.length - 1] : null;
  const netWorthDelta = monthlyNetWorth.length > 1 ? latestNetWorth!.netWorth - monthlyNetWorth[0].netWorth : null;
  const savedPerMonth = rawInputs?.finance ? Math.max(0, rawInputs.finance.monthlyIncome - rawInputs.finance.monthlyExpenses) : null;
  const savingsRatePct = rawInputs?.finance && rawInputs.finance.monthlyIncome > 0
    ? Math.round(((rawInputs.finance.monthlyIncome - rawInputs.finance.monthlyExpenses) / rawInputs.finance.monthlyIncome) * 100) : null;
  const sipGoal = goals.find(g => g.type === 'sip-target');
  const holdingsSyncError = getHoldingsSyncError();

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950">

      {!loading && showImportBanner && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <ImportLocalDataBanner onDone={handleImportDone} />
        </div>
      )}

      {loading ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center text-gray-400 text-sm">Loading your dashboard…</div>
      ) : !score ? (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-4xl mb-4">🎯</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You haven't taken your WellFiLab Score yet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Answer 3 quick questions and get your score, archetype, and a personalised action plan in under a minute.
          </p>
          <Link href="/score" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-[#04211E] font-semibold text-sm transition-colors">
            Get my score →
          </Link>
          <RecentToolsBanner className="mt-10" />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

          {/* ── Welcome band — the one deliberately-dark band regardless of
               theme, same role as a dark CTA band on an otherwise light
               page; everything else below is fully theme-adaptive. ── */}
          <div className="bg-[#0F2A27] rounded-xl p-6 flex flex-wrap justify-between items-center gap-5">
            <div className="flex items-center gap-3">
              {userImageUrl ? (
                <img src={userImageUrl} alt="" className="w-11 h-11 rounded-xl object-cover border border-white/20 flex-shrink-0" />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-teal-500 flex items-center justify-center text-base font-black text-[#04211E] flex-shrink-0">{firstName.charAt(0).toUpperCase()}</div>
              )}
              <div>
                <h1 className="text-xl font-extrabold text-white leading-tight">{greeting}, {firstName}</h1>
                <p className="text-sm text-[#93ADA8]">{dateLabel} · {actionsLeftToday} action{actionsLeftToday === 1 ? '' : 's'} left today</p>
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="bg-white/5 rounded-lg px-4 py-2.5 text-center min-w-[88px]">
                <p className="text-xl font-black text-teal-300 tabular-nums leading-none">{score.overall}{scoreDelta != null && (
                  <span className={`text-xs font-bold ml-1 ${scoreDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{scoreDelta > 0 ? '+' : ''}{scoreDelta}</span>
                )}</p>
                <p className="text-[11px] text-[#93ADA8] mt-1">Score</p>
              </div>
              <div className="bg-white/5 rounded-lg px-4 py-2.5 text-center min-w-[88px]">
                <p className="text-xl font-black text-teal-300 tabular-nums leading-none">{latestNetWorth ? fmtINR(latestNetWorth.netWorth) : '—'}</p>
                <p className="text-[11px] text-[#93ADA8] mt-1">Net worth</p>
              </div>
              <div className="bg-white/5 rounded-lg px-4 py-2.5 text-center min-w-[88px]">
                <p className="text-xl font-black text-teal-300 tabular-nums leading-none">{score.date ? new Date(score.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</p>
                <p className="text-[11px] text-[#93ADA8] mt-1">Last check-in{score.streakDays > 0 && <span className="inline-flex items-center gap-0.5 ml-1"><Flame size={10} />{score.streakDays}</span>}</p>
              </div>
            </div>
          </div>

          {/* ── Score, every month ── */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Your score, every month</p>
              <Link href="/score" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Full score →</Link>
            </div>
            <GoalTrendChart history={scoreTrend} unit="pts" color="#0d9488" emptyLabel="Retake your score a few times to see a real trend here." />
          </div>

          {/* ── Roadmap ── */}
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Today's actions</p>
              <Link href="/roadmap" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Full roadmap →</Link>
            </div>
            {!roadmapStarted ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-400 mb-3">You haven't started your roadmap yet.</p>
                <Link href="/roadmap" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Start your roadmap →</Link>
              </div>
            ) : roadmapProgress && roadmapProgress.activePhaseActions.length > 0 ? (
              <>
                <div className="space-y-3">
                  {roadmapProgress.activePhaseActions.map(a => (
                    <label key={a.id} className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={a.checked} onChange={() => toggleCheck(a.id)}
                        className="w-[18px] h-[18px] mt-0.5 accent-teal-600 flex-shrink-0" />
                      <p className={`text-sm font-medium leading-tight ${a.checked ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>{a.title}</p>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 mt-4 mb-1.5">
                  <span>Phase {roadmapProgress.activePhaseNum} of your roadmap</span>
                  <span>{roadmapProgress.activePhaseChecked} of {roadmapProgress.activePhaseTotal} done</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${roadmapProgress.activePhaseTotal > 0 ? (roadmapProgress.activePhaseChecked / roadmapProgress.activePhaseTotal) * 100 : 0}%` }} /></div>
              </>
            ) : (
              <p className="text-xs text-gray-400 py-2">No active phase yet — take your score to build a roadmap.</p>
            )}
          </div>

          <NextStepsCard
            dimensions={(() => {
              const focused = score.dimensions.filter(d => dimMatchesFocus(d.id, 'both'));
              return focused.length > 0 ? focused : score.dimensions;
            })()}
            body={rawInputs?.body ?? null} finance={rawInputs?.finance ?? null}
          />

          {/* ── Goal progress ── */}
          <GoalProgressCard goals={goals} />

          {/* ── Other important things ── */}
          <div className="grid lg:grid-cols-2 gap-4">
            <RiskAlertsCard alerts={getRiskAlerts(rawInputs?.body ?? null, rawInputs?.finance ?? null)} />
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Key numbers</p>
                <Link href="/assets" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Track by holding →</Link>
              </div>
              {holdingsSyncError && (
                <p className="text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded-lg px-2.5 py-2 mb-3 leading-relaxed">
                  ⚠️ Net worth couldn't load from your account — {holdingsSyncError}.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Metric label="Net worth" value={latestNetWorth ? fmtINR(latestNetWorth.netWorth) : '—'}
                  pct={netWorthDelta != null && latestNetWorth ? Math.min(100, Math.max(2, (Math.abs(netWorthDelta) / Math.max(1, Math.abs(latestNetWorth.netWorth))) * 100)) : 2}
                  color="#0d9488"
                  note={netWorthDelta != null ? `${netWorthDelta >= 0 ? '+' : ''}${fmtINR(netWorthDelta)} this period` : 'Add a holding'} />
                <Metric label="Saved each month" value={savedPerMonth != null ? fmtINR(savedPerMonth) : '—'}
                  pct={savingsRatePct ?? 2} color="#f59e0b"
                  note={savingsRatePct != null ? `${savingsRatePct}% of income` : 'Add on the score'} />
                <Metric label="Monthly SIP" value={rawInputs?.finance?.monthlyInvestments != null ? fmtINR(rawInputs.finance.monthlyInvestments) : '—'}
                  pct={sipGoal ? Math.min(100, Math.max(2, ((rawInputs?.finance?.monthlyInvestments ?? 0) / sipGoal.target) * 100)) : 2}
                  color="#a78bfa"
                  note={sipGoal ? `Target ${fmtINR(sipGoal.target)}` : 'No SIP goal set'} />
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            Your data is private, encrypted, and synced to your account only — sign in on any device and it's all here. <Link href="/contact" className="underline hover:text-teal-600 dark:hover:text-teal-400">Questions?</Link>
          </p>
        </div>
      )}
    </div>
  );
}
