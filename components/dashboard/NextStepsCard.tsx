import Link from 'next/link';
import type { Dimension, BodyInputs, FinanceInputs } from '@/lib/wellfilab-score';
import { getDimActions } from '@/lib/roadmapActions';
import { getBySlug } from '@/config/tools';

interface StepCard { kicker: string; title: string; why: string; href: string; cta: string }

// getDimActions only knows these fine-grained ids — a 'quick'-level score's
// dimensions are coarse (body/mind/wealth/life) and would silently fall
// through to the debt action bank if passed in directly.
const FINE_DIM_IDS = new Set(['sleep', 'movement', 'stress', 'savings', 'investing', 'debt']);

function buildSteps(dim: Dimension, body: BodyInputs | null, finance: FinanceInputs | null): StepCard[] {
  const actions = getDimActions(dim.id, dim, body, finance);
  const withTool = actions.find(a => a.toolSlug && a.toolCat) ?? actions[0];
  const steps: StepCard[] = [];

  if (withTool.toolSlug && withTool.toolCat) {
    const calc = getBySlug(withTool.toolSlug);
    if (calc) {
      steps.push({
        kicker: 'Calculator', title: calc.title, why: calc.short,
        href: `/tools/${withTool.toolCat}/${withTool.toolSlug}`, cta: 'Open calculator →',
      });
      const guide = calc.wflTopics?.[0];
      if (guide) {
        steps.push({
          kicker: 'Guide', title: guide.title, why: `The reasoning behind your ${dim.label.toLowerCase()} score, explained.`,
          href: `/guides/${guide.slug}`, cta: 'Read guide →',
        });
      }
    }
  }

  steps.push({
    kicker: 'Roadmap action', title: actions[0].title, why: actions[0].why,
    href: '/roadmap', cta: 'View in roadmap →',
  });

  return steps.slice(0, 3);
}

export function NextStepsCard({ dimensions, body, finance }: {
  dimensions: Dimension[]; body: BodyInputs | null; finance: FinanceInputs | null;
}) {
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0];
  if (!weakest) return null;

  const steps = FINE_DIM_IDS.has(weakest.id) ? buildSteps(weakest, body, finance) : [
    { kicker: 'Score', title: 'Add your body & finance details', why: 'Unlocks a personalised, ranked plan tied to your real numbers instead of a self-rating.', href: '/score', cta: 'Complete my score →' },
    { kicker: 'Roadmap', title: 'See what a full roadmap looks like', why: 'A phased plan built from real data — free once your score is complete.', href: '/roadmap', cta: 'View roadmap →' },
    { kicker: 'Goals', title: 'Set a goal in the meantime', why: 'Track a health or wealth target even before your full score is ready.', href: '/goals', cta: 'Set a goal →' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Recommended next steps — {weakest.label}</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <Link key={i} href={s.href}
            className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-teal-300 dark:hover:border-teal-700 p-4 transition-all group">
            <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 mb-1.5">{s.kicker}</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm mb-1.5 leading-snug">{s.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{s.why}</p>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform inline-block">{s.cta}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
