/** Decorative, slow-drifting gradient blobs for a dark section's
 * background. Pure CSS animation (no JS, no layout impact — absolutely
 * positioned and pointer-events-none) so it costs nothing to render and
 * never fights prefers-reduced-motion users since it's purely ambient,
 * not information-bearing. */
export function Aurora({ variant = 'hero' }: { variant?: 'hero' | 'soft' }) {
  if (variant === 'soft') {
    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none motion-reduce:[&_*]:animate-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] rounded-full bg-teal-500/[0.07] blur-[110px] animate-aurora-a" />
      </div>
    );
  }
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none motion-reduce:[&_*]:animate-none">
      <div className="absolute -top-32 left-[6%] w-[520px] h-[520px] rounded-full bg-teal-500/20 blur-[120px] animate-aurora-a" />
      <div className="absolute top-4 right-[2%] w-[420px] h-[420px] rounded-full bg-indigo-500/15 blur-[110px] animate-aurora-b" />
      <div className="absolute -bottom-24 left-[28%] w-[460px] h-[460px] rounded-full bg-amber-500/10 blur-[130px] animate-aurora-a" style={{ animationDelay: '-7s' }} />
      <div aria-hidden className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(45,212,191,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.05) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 90%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 90%)',
      }} />
    </div>
  );
}
