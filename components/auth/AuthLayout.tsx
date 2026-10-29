import Link from 'next/link';

const TRUST_POINTS = [
  { icon: '🔒', label: 'Your data stays private', detail: 'Never sold, never browsed by us.' },
  { icon: '📊', label: 'One score for health and money', detail: 'See where you actually stand, in one place.' },
  { icon: '🔁', label: 'Synced everywhere', detail: 'Sign in on any device, pick up where you left off.' },
];

/**
 * Shared shell for /sign-in and /sign-up. Flat two-panel layout — a solid
 * brand panel (no gradient/blur/pattern decoration, matching the site's
 * current flat-minimal direction) next to Clerk's own form, which already
 * renders its own card via clerkAppearance.ts, so this never wraps it in a
 * second redundant card.
 */
export function AuthLayout({ mode, children }: { mode: 'sign-in' | 'sign-up'; children: React.ReactNode }) {
  const heading = mode === 'sign-in' ? 'Welcome back.' : 'Start tracking what actually matters.';
  const subheading = mode === 'sign-in'
    ? 'Your score, goals, and history are waiting.'
    : 'Track your health and wealth score, roadmap, and goals — synced across every device.';

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-gray-950">
      {/* Brand panel — flat solid teal, hidden on mobile, full column on desktop */}
      <div className="hidden lg:flex bg-teal-700 flex-col justify-between p-12 xl:p-16">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <rect width="34" height="34" rx="9" fill="white" fillOpacity="0.15" />
            <path d="M6 10L10 24L17 15L24 24L28 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-bold text-lg tracking-tight text-white">WellFiLab</span>
        </Link>

        <div>
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-3 text-balance">{heading}</h1>
          <p className="text-teal-100 text-base leading-relaxed max-w-sm mb-10">{subheading}</p>

          <div className="space-y-5">
            {TRUST_POINTS.map(t => (
              <div key={t.label} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{t.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{t.label}</p>
                  <p className="text-teal-100/80 text-xs mt-0.5">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-teal-100/60 text-xs">© {new Date().getFullYear()} WellFiLab</p>
      </div>

      {/* Auth card panel */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md flex flex-col items-center">
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8">
            <svg width="36" height="36" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <rect width="34" height="34" rx="9" fill="#0d9488" />
              <path d="M6 10L10 24L17 15L24 24L28 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">WellFiLab</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
