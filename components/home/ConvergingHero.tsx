import { Heart, DollarSign, Moon, Activity, Wind, PiggyBank, TrendingUp, CreditCard } from 'lucide-react';

/**
 * Homepage hero — dark gradient with a converging Health/Wealth visual,
 * built from a reference concept the user shared. Two adaptations from
 * that reference, both deliberate:
 *
 * 1. Colors: the reference used blue/green for Health/Wealth. Every other
 *    page on the site (dashboard, tools directory, navbar) uses teal/amber
 *    for that same split — introducing a third color pairing just for the
 *    hero would clash the moment someone scrolls past it, so this uses the
 *    site's actual established colors instead.
 * 2. Metrics: the reference showed Heart Rate Variability, VO2 Max, live
 *    bank balance — none of which WellFiLab has access to (no wearable or
 *    bank integration exists). These cards show the dimensions the score
 *    algorithm actually computes (sleep, movement, stress, savings,
 *    investing, debt) with illustrative example values, the same way any
 *    SaaS marketing page shows sample data in a product screenshot — never
 *    a claim about live/real-time data.
 */

const HEALTH_CARDS = [
  { icon: Moon, label: 'Sleep Quality', value: '85', unit: '/100' },
  { icon: Activity, label: 'Movement', value: '5', unit: ' days/wk' },
  { icon: Wind, label: 'Stress', value: 'Low', unit: '' },
];

const WEALTH_CARDS = [
  { icon: PiggyBank, label: 'Savings Rate', value: '32', unit: '%' },
  { icon: TrendingUp, label: 'Investing', value: '₹25K', unit: '/mo' },
  { icon: CreditCard, label: 'Debt', value: '0.8x', unit: ' income' },
];

function MetricCard({ icon: Icon, label, value, unit, accent }: {
  icon: typeof Moon; label: string; value: string; unit: string; accent: 'teal' | 'amber';
}) {
  const color = accent === 'teal' ? 'text-teal-400' : 'text-amber-400';
  const border = accent === 'teal' ? 'border-teal-500/20 hover:border-teal-500/40' : 'border-amber-500/20 hover:border-amber-500/40';
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border ${border} backdrop-blur-sm transition-colors`}>
      <div className={`w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={16} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-white/40">{label}</p>
        <p className={`font-mono tabular-nums font-bold text-lg ${color}`}>{value}<span className="text-xs font-normal text-white/40">{unit}</span></p>
      </div>
    </div>
  );
}

export function ConvergingHero() {
  return (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-4">

        {/* HEALTH panel */}
        <div className="order-2 lg:order-1 flex-1 space-y-2.5 max-w-xs mx-auto lg:mx-0 w-full">
          <p className="flex items-center gap-1.5 text-teal-400 text-xs font-bold uppercase tracking-widest mb-3 justify-center lg:justify-start">
            <Heart size={13} /> Health <span className="text-white/25 font-normal normal-case">— example</span>
          </p>
          {HEALTH_CARDS.map(c => <MetricCard key={c.label} {...c} accent="teal" />)}
        </div>

        {/* Center — brand */}
        <div className="order-1 lg:order-2 flex-shrink-0 text-center px-2 lg:px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-amber-400 mb-5 shadow-lg shadow-teal-500/20">
            <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <path d="M6 10L10 24L17 15L24 24L28 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">WellFiLab</h1>
          <p className="text-white/60 text-sm md:text-base mb-1 text-balance">Your Personal Health and Wealth<br className="hidden md:block" /> Operating System</p>
          <p className="text-sm font-semibold mb-2">
            <span className="text-teal-400">Measure.</span>{' '}
            <span className="text-white/70">Integrate.</span>{' '}
            <span className="text-amber-400">Optimize.</span>{' '}
            <span className="text-white">Grow.</span>
          </p>
        </div>

        {/* WEALTH panel */}
        <div className="order-3 flex-1 space-y-2.5 max-w-xs mx-auto lg:mx-0 w-full">
          <p className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3 justify-center lg:justify-end">
            <span className="text-white/25 font-normal normal-case lg:order-1">example —</span> <span className="lg:order-2">Wealth</span> <DollarSign size={13} className="lg:order-3" />
          </p>
          {WEALTH_CARDS.map(c => <MetricCard key={c.label} {...c} accent="amber" />)}
        </div>
      </div>
    </div>
  );
}
