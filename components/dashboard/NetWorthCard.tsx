import Link from 'next/link';
import type { NetWorthSnapshot } from '@/lib/netWorthHistory';
import { netWorthVerdict } from '@/lib/wellfilab-score';
import { fmtINR } from '@/lib/roadmapActions';
import { LinkChip, LinkBar } from './LinkChip';

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NetWorthCard({ snapshots, age }: { snapshots: NetWorthSnapshot[]; age?: number }) {
  if (snapshots.length === 0) {
    return (
      <div id="net-worth" className="bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-5 flex flex-col items-center justify-center text-center min-h-[180px]">
        <p className="text-3xl mb-3">💼</p>
        <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">No net worth snapshots yet</p>
        <p className="text-xs text-gray-400 mb-4 max-w-xs">Add up what you own and owe once — every future update takes under a minute.</p>
        <Link href="/tools/finance/net-worth" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Calculate my net worth →</Link>
      </div>
    );
  }

  const points = snapshots.slice(-10);
  const latest = points[points.length - 1];
  const oldest = points[0];
  const delta = latest.netWorth - oldest.netWorth;
  const verdict = age != null ? netWorthVerdict(age, latest.netWorth) : null;
  const assetsPct = latest.assets > 0 ? Math.round((latest.assets / (latest.assets + latest.liabilities)) * 100) : 0;

  // Hand-rolled sparkline — a single series doesn't need recharts' code-split weight.
  const w = 300, h = 56;
  const values = points.map(p => p.netWorth);
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const coords = points.map((p, i) => {
    const x = points.length > 1 ? (i / (points.length - 1)) * w : w;
    const y = h - ((p.netWorth - min) / range) * (h - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const linePoints = coords.join(' ');
  const areaPoints = `0,${h} ${coords.join(' ')} ${w},${h}`;
  const [lastX, lastY] = coords[coords.length - 1].split(',');

  return (
    <div id="net-worth" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Net worth</p>
        <Link href="/tools/finance/net-worth" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline">Update in calculator →</Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="font-mono tabular-nums text-lg font-black text-gray-900 dark:text-white">{fmtINR(latest.netWorth)}</p>
            {verdict && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 whitespace-nowrap">{verdict.label}</span>
            )}
          </div>
          <p className="text-[10px] text-gray-400">Current net worth{verdict ? ' — for your age' : ''}</p>
        </div>
        {points.length > 1 && (
          <>
            <div>
              <p className={`font-mono tabular-nums text-lg font-black ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : delta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                {delta > 0 ? '+' : ''}{fmtINR(delta)}
              </p>
              <p className="text-[10px] text-gray-400">Since {fmtDate(oldest.date)}</p>
            </div>
            <div>
              <p className="font-mono tabular-nums text-lg font-black text-gray-400">{fmtINR(oldest.netWorth)}</p>
              <p className="text-[10px] text-gray-400">{fmtDate(oldest.date)}</p>
            </div>
          </>
        )}
      </div>

      {points.length > 1 && (
        <svg className="w-full block" style={{ height: h }} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <polyline points={linePoints} fill="none" stroke="#0d9488" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <polygon points={areaPoints} fill="#0d9488" opacity={0.12} />
          <circle cx={lastX} cy={lastY} r={4} fill="#0d9488" />
        </svg>
      )}

      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-3">
        Assets {fmtINR(latest.assets)} vs Liabilities {fmtINR(latest.liabilities)}
      </p>
      <div className="h-2.5 rounded-full overflow-hidden flex bg-gray-100 dark:bg-gray-800 mt-1.5">
        {assetsPct > 0 && <div className="h-full bg-teal-600" style={{ width: `${assetsPct}%` }} />}
        {assetsPct < 100 && <div className="h-full bg-red-600" style={{ width: `${100 - assetsPct}%` }} />}
      </div>

      <LinkBar>
        <LinkChip targetId="goal-progress">Tracking toward your Net Worth goal</LinkChip>
      </LinkBar>
    </div>
  );
}
