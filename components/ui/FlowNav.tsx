import Link from 'next/link';
import { Check } from 'lucide-react';

export type FlowStep = 'score' | 'roadmap' | 'goals' | 'dashboard';

const STEPS: { id: FlowStep; label: string; href: string }[] = [
  { id: 'goals', label: 'Goals', href: '/goals' },
  { id: 'score', label: 'Score', href: '/score' },
  { id: 'roadmap', label: 'Roadmap', href: '/roadmap' },
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard' },
];

/**
 * A consistent "you are here" stepper shown on every page in the core
 * flow, so a first-time user always sees the same 4 steps and where they
 * stand. Ordered to match the product's own mental model — set a goal,
 * see where you stand, get a plan, track it — not the order these
 * features happened to ship in.
 */
export function FlowNav({ current }: { current: FlowStep }) {
  const currentIdx = STEPS.findIndex(s => s.id === current);
  return (
    <nav aria-label="Your progress" className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap py-3">
      {STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={s.id} className="flex items-center gap-1 sm:gap-2">
            {i > 0 && <span className="w-4 sm:w-6 h-px bg-white/15 flex-shrink-0" />}
            <Link href={s.href}
              className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-2.5 py-1.5 rounded-full transition-colors ${
                active ? 'bg-teal-500 text-white'
                : done ? 'text-teal-300 hover:text-teal-200'
                : 'text-white/40 hover:text-white/70'
              }`}>
              {done ? <Check size={13} className="flex-shrink-0" /> : <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${active ? 'bg-white/20' : 'border border-white/30'}`}>{i + 1}</span>}
              {s.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
