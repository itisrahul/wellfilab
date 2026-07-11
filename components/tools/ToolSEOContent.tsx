import type { Calculator } from '@/config/tools';

/**
 * CalcSEOContent — renders the rich, original long-form content block for a
 * calculator: an intro, "How it works" explanation sections, an optional
 * formula box, worked examples, and in-depth use cases.
 *
 * This is real, unique prose (not duplicated boilerplate) intended to:
 *  - give Google's crawler substantial on-topic text per calculator page
 *  - target featured snippets via clearly labelled formula/example blocks
 *  - answer the "how / why / when" questions searchers actually have
 *
 * Renders nothing if `calc.content` is not defined, so calculators without
 * content yet degrade gracefully.
 */
export function CalcSEOContent({ calc }: { calc: Calculator }) {
  const content = calc.content;
  if (!content) return null;

  return (
    <section className="space-y-8">
      {/* Intro */}
      <div>
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">
          📘 What is the {calc.title}?
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {content.intro}
        </p>
      </div>

      {/* How it works */}
      {content.howItWorks.length > 0 && (
        <div>
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-3">
            ⚙️ How {calc.short} is calculated
          </h2>
          <div className="space-y-4">
            {content.howItWorks.map((sec, i) => (
              <div key={i}>
                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">
                  {sec.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {sec.body}
                </p>
              </div>
            ))}
          </div>

          {/* Formula box */}
          {content.formula && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                {content.formula.label}
              </p>
              <p className="calc-num-md text-orange-600 dark:text-orange-400 break-words">
                {content.formula.expr}
              </p>
              {content.formula.note && (
                <p className="text-xs text-gray-400 mt-2">{content.formula.note}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Worked examples */}
      {content.examples.length > 0 && (
        <div>
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-3">
            🧮 Worked examples
          </h2>
          <div className="space-y-3">
            {content.examples.map((ex, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">{ex.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">{ex.scenario}</p>
                <p className="text-sm font-mono text-orange-600 dark:text-orange-400 leading-relaxed break-words">
                  → {ex.result}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In-depth use cases / insights */}
      {content.useCases.length > 0 && (
        <div>
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-3">
            💡 Original insights &amp; how to use this calculator
          </h2>
          <div className="space-y-4">
            {content.useCases.map((u, i) => (
              <div key={i}>
                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">
                  {u.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {u.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
export { CalcSEOContent as ToolSEOContent };
