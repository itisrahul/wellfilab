'use client';
import Link from 'next/link';
import useSWR from 'swr';
import { useUser } from '@clerk/nextjs';
import { getScoreHistory } from '@/lib/scoreStorage';
import { getGoals, getGoalHistory, GOAL_TYPE_META } from '@/lib/goalsStorage';
import { getSnapshots } from '@/lib/netWorthHistory';
import { syncRoadmapChecksFromAccount, checkedAt } from '@/lib/roadmapChecks';
import { fmtINR } from '@/lib/roadmapActions';
import { SWR_KEYS } from '@/lib/swrKeys';

interface TimelineEvent {
  date: string;
  icon: string;
  label: string;
  detail: string;
  color: string;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

/** Roadmap check ids are positional (p1-alg-0, p2-3, …), not stable action
 * titles — this labels them honestly and generically rather than trying to
 * reconstruct exact wording that depends on score/finance state at the time. */
function labelRoadmapCheck(id: string): string {
  const m = id.match(/^p(\d)-(alg-)?(\d+)$/);
  if (!m) return id;
  const [, phase, , idx] = m;
  return `Phase ${phase} — action #${Number(idx) + 1} completed`;
}

export default function HistoryPage() {
  const { isSignedIn } = useUser();
  const { data: scoreHistory, isLoading: scoreLoading } = useSWR(SWR_KEYS.scoreHistory, getScoreHistory);
  const { data: goals, isLoading: goalsLoading } = useSWR(SWR_KEYS.goals, getGoals);
  const { data: netWorthSnapshots, isLoading: snapshotsLoading } = useSWR(SWR_KEYS.netWorthSnapshots, getSnapshots);
  const { data: roadmapChecks, isLoading: checksLoading } = useSWR(SWR_KEYS.roadmapChecks, syncRoadmapChecksFromAccount);
  const loading = scoreLoading || goalsLoading || snapshotsLoading || checksLoading;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>;
  }

  const hasAnyHistory = scoreHistory.length > 0 || goals.length > 0 || netWorthSnapshots.length > 0;

  // ── Unified activity timeline — every real, dated event across the app ──
  const events: TimelineEvent[] = [];
  for (const s of scoreHistory) {
    if (!s.date) continue;
    events.push({
      date: s.date, icon: '⭐', color: 'text-teal-600 dark:text-teal-400',
      label: `Score taken — ${s.overall}/100`,
      detail: s.focus === 'health' ? 'Health-only assessment' : s.focus === 'wealth' ? 'Wealth-only assessment' : 'Health + Wealth assessment',
    });
  }
  for (const snap of netWorthSnapshots) {
    events.push({
      date: snap.date, icon: '💼', color: 'text-amber-600 dark:text-amber-400',
      label: `Net worth logged — ${fmtINR(snap.netWorth)}`,
      detail: `Assets ${fmtINR(snap.assets)} · Liabilities ${fmtINR(snap.liabilities)}`,
    });
  }
  for (const g of goals) {
    const meta = GOAL_TYPE_META[g.type];
    for (const point of getGoalHistory(g)) {
      events.push({
        date: point.date, icon: meta.icon, color: 'text-purple-600 dark:text-purple-400',
        label: `${g.label} updated — ${fmtVal(point.value, meta.unit)}`,
        detail: `Goal progress update`,
      });
    }
  }
  for (const [id, val] of Object.entries(roadmapChecks)) {
    const at = checkedAt(roadmapChecks, id);
    if (at) events.push({
      date: at, icon: '🗺️', color: 'text-green-600 dark:text-green-400',
      label: labelRoadmapCheck(id), detail: 'Roadmap action completed',
    });
  }
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-gradient-to-br from-teal-800 to-gray-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-300 mb-2">Your Full History</p>
          <h1 className="text-3xl font-extrabold text-white mb-2">Every real update, in one place</h1>
          <p className="text-sm text-white/50">Score, net worth, goals, and roadmap — nothing here is reconstructed after the fact, only what was actually recorded.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {!hasAnyHistory ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-4xl mb-4">📜</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No history yet</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Take your score, log a net worth snapshot, or set a goal — this page fills in as you go.</p>
            <Link href="/score" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all">
              Get my free score →
            </Link>
          </div>
        ) : (
          <>
            {/* ── Score History ── */}
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-3">Score history</p>
              {scoreHistory.length === 0 ? (
                <EmptyRow text="No scores taken yet." href="/score" cta="Get my score →" />
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
                  {scoreHistory.slice(0, 12).map((s, i) => {
                    const prev = scoreHistory[i + 1];
                    const delta = prev && prev.scoreVersion === s.scoreVersion ? s.overall - prev.overall : null;
                    return (
                      <div key={s.id ?? i} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.date ? fmtDate(s.date) : '—'}</p>
                          <p className="text-[11px] text-gray-400">
                            {s.focus === 'health' ? 'Health only' : s.focus === 'wealth' ? 'Wealth only' : 'Health + Wealth'} · Body {s.focus !== 'wealth' ? s.body : '—'} · Mind {s.focus !== 'wealth' ? s.mind : '—'} · Wealth {s.focus !== 'health' ? s.wealth : '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono tabular-nums text-lg font-black text-gray-900 dark:text-white">{s.overall}</p>
                          {delta != null && delta !== 0 && (
                            <p className={`font-mono tabular-nums text-[11px] font-bold ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{delta > 0 ? '+' : ''}{delta}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Net Worth History ── */}
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-3">Net worth history</p>
              {netWorthSnapshots.length === 0 ? (
                <EmptyRow text="No net worth snapshots yet." href="/tools/finance/net-worth" cta="Calculate my net worth →" />
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
                  {[...netWorthSnapshots].reverse().slice(0, 12).map(snap => (
                    <div key={snap.id} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{fmtDate(snap.date)}</p>
                        <p className="text-[11px] text-gray-400">Assets {fmtINR(snap.assets)} · Liabilities {fmtINR(snap.liabilities)}</p>
                      </div>
                      <p className="font-mono tabular-nums text-lg font-black text-gray-900 dark:text-white">{fmtINR(snap.netWorth)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Goal History ── */}
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-3">Goal history</p>
              {goals.length === 0 ? (
                <EmptyRow text="No goals set yet." href="/goals" cta="Set my first goal →" />
              ) : (
                <div className="space-y-4">
                  {goals.map(g => {
                    const meta = GOAL_TYPE_META[g.type];
                    const history = getGoalHistory(g);
                    return (
                      <div key={g.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{meta.icon}</span>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{g.label}</p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {history.map((p, i) => (
                            <div key={i} className="flex-shrink-0 min-w-[70px] p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center">
                              <p className="text-[9px] text-gray-400">{fmtDate(p.date)}</p>
                              <p className="font-mono tabular-nums text-xs font-bold text-gray-900 dark:text-white">{fmtVal(p.value, meta.unit)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* ── Roadmap History ── */}
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 mb-3">Roadmap history</p>
              {Object.keys(roadmapChecks).length === 0 ? (
                <EmptyRow text="No roadmap actions completed yet." href="/roadmap" cta="View my roadmap →" />
              ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
                  {Object.keys(roadmapChecks)
                    .map(id => ({ id, at: checkedAt(roadmapChecks, id) }))
                    .filter((r): r is { id: string; at: string } => r.at != null)
                    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
                    .slice(0, 12)
                    .map(r => (
                      <div key={r.id} className="flex items-center justify-between px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{labelRoadmapCheck(r.id)}</p>
                        <p className="text-xs text-gray-400">{fmtDate(r.at)}</p>
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* ── Unified Activity Timeline ── */}
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Full activity timeline</p>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
                {events.slice(0, 40).map((e, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <span className="text-lg flex-shrink-0">{e.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold ${e.color}`}>{e.label}</p>
                      <p className="text-[11px] text-gray-400">{e.detail}</p>
                    </div>
                    <p className="text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap">{fmtDateTime(e.date)}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <p className="text-center text-[11px] text-gray-400 pt-2">
          {isSignedIn
            ? 'Every entry here is synced to your account.'
            : "Every entry here comes from data stored on this device. Sign in to keep it synced across devices."} <Link href="/dashboard" className="underline hover:text-teal-600 dark:hover:text-teal-400">Back to dashboard</Link>
        </p>
      </div>
    </div>
  );
}

function EmptyRow({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-5 text-center">
      <p className="text-xs text-gray-400 mb-2">{text}</p>
      <Link href={href} className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">{cta}</Link>
    </div>
  );
}

function fmtVal(n: number, unit: string): string {
  if (unit.startsWith('₹')) return `${fmtINR(Math.round(n))}${unit.slice(1)}`;
  return `${n.toLocaleString('en-IN')}${unit ? ` ${unit}` : ''}`;
}
