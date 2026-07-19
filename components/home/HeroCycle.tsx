/**
 * components/home/HeroCycle.tsx — animated hero diagram replacing the
 * homepage headline: the real 6-step loop of using WellFiLab (Tools ->
 * Guides -> Score -> Roadmap -> Goals -> Dashboard, then back around next
 * month). Each stop is a real <Link> to that actual page, not decoration —
 * this doubles as functional navigation. A single rotating caption line
 * explains each stop as its node lights up.
 *
 * Pure SVG + CSS (see the cycle-* keyframes in tailwind.config.js) — no
 * video file, no animation library. motion-safe: variants fall back to a
 * static diagram for prefers-reduced-motion.
 */

import Link from 'next/link';

const STAGES = [
  { icon: '🧮', label: 'Calculate', href: '/tools',     caption: 'Start with any of 77+ free calculators',
    position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
  { icon: '📖', label: 'Learn',     href: '/guides',     caption: 'Read the real science behind your numbers',
    position: 'top-[27%] right-0 translate-x-1/2 -translate-y-1/2' },
  { icon: '🎯', label: 'Score',     href: '/score',      caption: 'Get one real score for body, mind & wealth',
    position: 'bottom-[27%] right-0 translate-x-1/2 translate-y-1/2' },
  { icon: '🗺️', label: 'Roadmap',   href: '/roadmap',    caption: 'Get a phased plan — what to fix first',
    position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
  { icon: '🏆', label: 'Goals',     href: '/goals',      caption: 'Turn any target into a tracked goal',
    position: 'bottom-[27%] left-0 -translate-x-1/2 translate-y-1/2' },
  { icon: '📊', label: 'Dashboard', href: '/dashboard',  caption: 'Watch it all improve, month over month',
    position: 'top-[27%] left-0 -translate-x-1/2 -translate-y-1/2' },
] as const;

const DELAY_STEP = 1.5; // 9s cycle / 6 stops

/**
 * `compact`: used when this diagram shares a row with other content (the
 * homepage hero's Health/Wealth panels) instead of standing alone. The
 * node positions use `-translate-x/y-1/2` so they sit centered *on* the
 * ring — meaning they always extend roughly half a node's size outside the
 * diagram's own declared box on every side. At full size that overflow is
 * ~32px; a neighboring element needs at least that much real gap or the
 * two collide. Compact mode shrinks the whole diagram (and its overflow)
 * instead of relying on gap alone.
 */
export function HeroCycle({ compact = false }: { compact?: boolean }) {
  const boxSize = compact ? 'w-[240px] h-[240px] sm:w-[280px] sm:h-[280px]' : 'w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] md:w-[400px] md:h-[400px]';
  const centerSize = compact ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20';
  const centerIcon = compact ? 20 : 26;
  const nodeSize = compact ? 'w-10 h-10 text-lg' : 'w-14 h-14 sm:w-16 sm:h-16 text-2xl sm:text-3xl';
  const captionWidth = compact ? 'w-56' : 'w-72 sm:w-80';

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${boxSize}`}>
        {/* Static faint ring — the track the sweep travels */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
          <circle
            cx="100" cy="100" r="88" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
            strokeDasharray="70 483"
            className="motion-safe:animate-cycle-sweep opacity-90"
          />
        </svg>

        {/* Center — brand mark, pulsing gently, and a real link to /score
            (the natural "start here" action). No fabricated score number
            on purpose: this diagram illustrates the product flow, not a
            claim about what any specific score is. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Link
            href="/score" aria-label="Get your free WellFiLab score"
            className={`motion-safe:animate-cycle-center-pulse group flex items-center justify-center ${centerSize} rounded-full bg-white/15 border border-white/25 backdrop-blur-sm hover:bg-white/25 hover:border-white/40 hover:scale-105 transition-all`}
          >
            <svg width={centerIcon} height={centerIcon} viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <path d="M6 10L10 24L17 15L24 24L28 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Six real stops on the product journey, each a working link */}
        {STAGES.map((s, i) => (
          <Link
            key={s.label} href={s.href}
            className={`group absolute ${s.position} flex flex-col items-center gap-1.5`}
          >
            <div
              className={`motion-safe:animate-cycle-node-pulse flex items-center justify-center ${nodeSize} rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm group-hover:bg-white/25 group-hover:border-white/40 group-hover:scale-105 transition-colors`}
              style={{ animationDelay: `${i * DELAY_STEP}s` }}
            >
              {s.icon}
            </div>
            {!compact && <span className="text-[11px] font-bold text-white/80 group-hover:text-white uppercase tracking-wide transition-colors">{s.label}</span>}
          </Link>
        ))}
      </div>

      {/* Rotating caption — one line, fixed height so nothing shifts as it cycles.
          Explicit width (not max-width): every child is `absolute`, so the
          container has nothing in normal flow to size itself against and
          would otherwise collapse to zero width. */}
      <div className={`relative ${captionWidth} h-10 motion-reduce:h-auto mt-8 text-center`} aria-hidden="true">
        {STAGES.map((s, i) => (
          <p
            key={s.label}
            className="motion-safe:animate-cycle-caption absolute inset-0 text-teal-100/85 text-sm font-medium opacity-0 motion-reduce:opacity-100 motion-reduce:static"
            style={{ animationDelay: `${i * DELAY_STEP}s` }}
          >
            {s.caption}
          </p>
        ))}
      </div>
    </div>
  );
}
