import Link from 'next/link';

/**
 * Cross-link banner pointing traffic from Tools/Guides toward /score — the
 * product's core USP. Individual calculators and articles answer one narrow
 * question; this is the pitch for the thing that ties them all together.
 */
export function ScoreCTA({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Link href="/score"
        className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 transition-opacity text-white group">
        <span className="text-2xl flex-shrink-0">🎯</span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm">Get your WellFiLab Score</p>
          <p className="text-xs text-white/80">One number for your health + money. 60 seconds, free.</p>
        </div>
        <span className="text-lg group-hover:translate-x-0.5 transition-transform flex-shrink-0">→</span>
      </Link>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 to-gray-900 p-6 sm:p-7">
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="relative flex items-center gap-5 flex-wrap sm:flex-nowrap">
        <span className="text-4xl flex-shrink-0">🎯</span>
        <div className="min-w-0 flex-1">
          <p className="font-extrabold text-white text-lg mb-1">This is one piece of a bigger picture</p>
          <p className="text-sm text-white/60">
            Your WellFiLab Score connects this to your whole health-and-money life — one score, your archetype, and what to do next.
          </p>
        </div>
        <Link href="/score"
          className="flex-shrink-0 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm transition-all hover:scale-105 whitespace-nowrap">
          Get my Score →
        </Link>
      </div>
    </div>
  );
}
