/**
 * components/home/HeroCycle.tsx — animated Body→Mind→Wealth→Life cycle
 * diagram, replacing the homepage hero's headline text.
 *
 * Same 4 dimensions, icons, and colors as SCORE_DIMS in app/page.tsx and
 * the dashboard's own dimension bars — this is a visual explanation of the
 * real product mechanic (four real inputs compounding into one tracked
 * score), not decorative artwork, so it reuses the app's actual vocabulary
 * rather than inventing new iconography.
 *
 * Pure SVG + CSS (see the cycle-* keyframes in tailwind.config.js) — no
 * video file, no animation library. Loads instantly, scales to any size,
 * costs zero bandwidth, and motion-safe: variants fall back to a static
 * diagram for prefers-reduced-motion.
 */

const NODES = [
  { icon: '💪', label: 'Body',   position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',    delay: '0s' },
  { icon: '🧠', label: 'Mind',   position: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',     delay: '2s' },
  { icon: '💰', label: 'Wealth', position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',   delay: '4s' },
  { icon: '🌱', label: 'Life',   position: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',     delay: '6s' },
] as const;

export function HeroCycle() {
  return (
    <div className="relative mx-auto w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[380px] md:h-[380px]">
      {/* Static faint ring — the track the sweep travels */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
        {/* Bright traveling arc — one continuous lap every 8s, sized to match the keyframe's -552 offset (2*pi*88) */}
        <circle
          cx="100" cy="100" r="88" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
          strokeDasharray="90 463"
          className="motion-safe:animate-cycle-sweep opacity-90"
        />
      </svg>

      {/* Center — brand mark, pulsing gently. No fabricated score number here on
          purpose: this diagram illustrates how the product works, not a claim
          about what any specific score is. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="motion-safe:animate-cycle-center-pulse flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm">
          <svg width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <path d="M6 10L10 24L17 15L24 24L28 10" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/80">Your Score</span>
        </div>
      </div>

      {/* Four dimension nodes, pulsing in sequence as the sweep passes each one */}
      {NODES.map(n => (
        <div key={n.label} className={`absolute ${n.position} flex flex-col items-center gap-1`}>
          <div
            className="motion-safe:animate-cycle-node-pulse flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm text-2xl sm:text-3xl"
            style={{ animationDelay: n.delay }}
          >
            {n.icon}
          </div>
          <span className="text-[11px] font-bold text-white/80 uppercase tracking-wide">{n.label}</span>
        </div>
      ))}
    </div>
  );
}
