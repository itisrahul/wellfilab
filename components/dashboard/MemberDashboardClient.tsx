'use client';
import Link from 'next/link';

interface Props {
  userName: string;
  userEmail: string;
  userImageUrl: string;
  memberSince: string;
}

const QUICK_LINKS = [
  { href: '/score',  icon: '⭐', label: 'Health-Wealth Score', desc: 'Take the free 24-question quiz' },
  { href: '/tools',  icon: '🧮', label: 'Browse Tools',        desc: '60+ free calculators' },
  { href: '/guides', icon: '📚', label: 'Read Guides',         desc: 'Evidence-based articles' },
];

export function MemberDashboardClient({ userName, userEmail, userImageUrl, memberSince }: Props) {
  const initial = userName.trim().charAt(0).toUpperCase() || 'W';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Header ── */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center gap-4 flex-wrap">
            {userImageUrl ? (
              <img src={userImageUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center text-2xl font-black flex-shrink-0">
                {initial}
              </div>
            )}
            <div>
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Member Dashboard</p>
              <h1 className="text-2xl font-extrabold mb-0.5">Welcome back, {userName.split(' ')[0]} 👋</h1>
              <p className="text-white/75 text-sm">{userEmail}{memberSince ? ` · Member since ${memberSince}` : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* ── No active plan ── */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-2xl flex-shrink-0">📋</div>
                <div className="flex-1">
                  <h2 className="font-bold text-gray-900 dark:text-white text-base mb-1">No active plan yet</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                    Subscribe to a Diet & Nutrition, Personal Finance, or Health + Finance Bundle plan and your personalised meal plans, budget spreadsheets, and check-ins will show up here.
                  </p>
                  <Link href="/plan"
                    className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
                    View Plans & Pricing →
                  </Link>
                </div>
              </div>
            </div>

            {/* ── Quick links to real free features ── */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white text-sm">Free, right now</h2>
              </div>
              <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-50 dark:divide-gray-800">
                {QUICK_LINKS.map(l => (
                  <Link key={l.href} href={l.href}
                    className="flex flex-col gap-1.5 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <span className="text-2xl">{l.icon}</span>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{l.label}</p>
                    <p className="text-xs text-gray-400">{l.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-5">

            {/* Account */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Account</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400">Name</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-right">{userName}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400">Email</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-right truncate">{userEmail}</span>
                </div>
                {memberSince && (
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500 dark:text-gray-400">Member since</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-right">{memberSince}</span>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400">Plan</span>
                  <span className="font-semibold text-gray-400 text-right">None</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                Manage your profile, password, and connected accounts from the avatar menu in the navbar.
              </p>
            </div>

            {/* Support */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Need help?</p>
              <div className="space-y-2">
                <Link href="/contact"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-lg">✉️</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Email support</p>
                    <p className="text-[10px] text-gray-400">Reply within 24 hours</p>
                  </div>
                </Link>
                <Link href="/plan"
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <span className="text-lg">⭐</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Get a plan</p>
                    <p className="text-[10px] text-gray-400">From ₹149/month, 7-day free trial</p>
                  </div>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
