'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, Target, Map, FileText, Link2, Lock } from 'lucide-react';
import type { WellFiScore } from '@/lib/wellfilab-score';
import { ScoreGauge } from './ScoreGauge';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/goals', label: 'Goals', Icon: Target },
  { href: '/roadmap', label: 'Action Plan', Icon: Map },
  { href: '/history', label: 'Reports', Icon: FileText },
];

/**
 * Sidebar app-shell for the signed-in dashboard experience — replaces the
 * site's top nav (see Navbar.tsx/Footer.tsx's own pathname check) rather
 * than stacking both, matching a dedicated-app layout instead of a
 * marketing-site page. Score-change badges ("+8 points vs last month",
 * etc.) live on the individual score cards, not here — this shell only
 * ever renders the current score, which it always has for certain.
 */
export function DashboardShell({ score, scoreChangeLabel, children }: {
  score: WellFiScore | null;
  scoreChangeLabel?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-gray-950 border-r border-white/5">
        <Link href="/" className="flex items-center gap-2.5 px-6 py-6">
          <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <rect width="34" height="34" rx="9" fill="#0d9488" />
            <path d="M6 10L10 24L17 15L24 24L28 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-bold text-lg tracking-tight text-white">WellFiLab</span>
        </Link>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(item => {
            const active = item.href === '/dashboard' ? pathname === '/dashboard' : !!pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active ? 'bg-teal-600 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
                }`}>
                <item.Icon size={18} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}

          {/* Bank/wearable account linking doesn't exist yet — shown, not hidden,
              so the roadmap is visible, but honestly locked rather than pretending
              it's a live feature. */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/25 cursor-not-allowed" title="Coming soon">
            <Link2 size={18} strokeWidth={2} />
            Connections
            <Lock size={12} className="ml-auto flex-shrink-0" />
          </div>
        </nav>

        {score && (
          <div className="mx-3 mb-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">WellFiLab Score</p>
            <ScoreGauge score={score.overall} size={88} />
            {scoreChangeLabel && <p className="text-[11px] font-semibold text-emerald-400 mt-3">{scoreChangeLabel}</p>}
          </div>
        )}

        <div className="flex items-center gap-3 px-4 py-4 border-t border-white/5">
          <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          <span className="text-xs text-white/50">Account</span>
        </div>
      </aside>

      {/* Mobile top bar — compact horizontal nav instead of a full sidebar drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-950 border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <rect width="34" height="34" rx="9" fill="#0d9488" />
              <path d="M6 10L10 24L17 15L24 24L28 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-sm text-white">WellFiLab</span>
          </Link>
          <UserButton appearance={{ elements: { avatarBox: 'w-7 h-7' } }} />
        </div>
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: 'none' }}>
          {NAV.map(item => {
            const active = item.href === '/dashboard' ? pathname === '/dashboard' : !!pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  active ? 'bg-teal-600 text-white' : 'bg-white/5 text-white/50'
                }`}>
                <item.Icon size={14} strokeWidth={2} /> {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 min-w-0 pt-[88px] lg:pt-0">
        {children}
      </div>
    </div>
  );
}
