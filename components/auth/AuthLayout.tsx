import Link from 'next/link';

const TRUST_POINTS = [
  { icon: '🔒', label: 'Your data stays private', detail: 'Never sold, never browsed by us.' },
  { icon: '💸', label: 'Free forever', detail: 'Score, roadmap, and goals — no credit card.' },
  { icon: '🔁', label: 'Synced everywhere', detail: 'Sign in on any device, pick up where you left off.' },
];

/**
 * Shared shell for /sign-in and /sign-up. Clerk's own form (SignIn/SignUp)
 * has limited styling surface beyond colors/borders (see clerkAppearance.ts)
 * — the real design lever here is the surrounding page, not the form
 * itself, so this does the actual composition work: a branded panel with
 * real trust signals next to the auth card, rather than a bare centered
 * widget on a plain background.
 */
export function AuthLayout({ mode, children }: { mode: 'sign-in' | 'sign-up'; children: React.ReactNode }) {
  const heading = mode === 'sign-in' ? 'Welcome back.' : 'Start tracking what actually matters.';
  const subheading = mode === 'sign-in'
    ? 'Your score, goals, and history are waiting.'
    : 'One free account — your health and wealth score, roadmap, and goals, synced across every device.';

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gray-50 dark:bg-gray-950">
      {/* Brand panel — hidden on mobile, full column on desktop */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-500 flex-col justify-between p-12 xl:p-16">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />

        <Link href="/" className="relative flex items-center gap-2.5">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <rect width="34" height="34" rx="9" fill="white" fillOpacity="0.15" />
            <path d="M6 10L10 24L17 15L24 24L28 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-bold text-lg tracking-tight text-white">WellFiLab</span>
        </Link>

        <div className="relative">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4 text-balance">{heading}</h1>
          <p className="text-teal-100/85 text-base leading-relaxed max-w-sm mb-10">{subheading}</p>

          <div className="space-y-5">
            {TRUST_POINTS.map(t => (
              <div key={t.label} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{t.icon}</span>
                <div>
                  <p className="text-white font-bold text-sm">{t.label}</p>
                  <p className="text-teal-100/70 text-xs mt-0.5">{t.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-teal-100/50 text-xs">© {new Date().getFullYear()} WellFiLab</p>
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
