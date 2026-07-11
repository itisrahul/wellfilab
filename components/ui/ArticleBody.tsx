/**
 * components/ui/ArticleBody.tsx
 *
 * Renders the structured body sections of a post.
 * Supported section types: intro | h2 | h3 | p | ul | ol | quote | callout | image
 *   | table | chart | comparison | steps | stat-row
 *
 * Usage:
 *   <ArticleBody sections={post.body} hwtCalc={post.hwtCalc} calcPillClass="calc-pill" />
 */
import type { Section } from '@/lib/types';

interface Props {
  sections: Section[];
  hwtCalc?: { label: string; url: string };
  calcPillClass?: string;
}

export function ArticleBody({ sections, hwtCalc, calcPillClass = 'calc-pill' }: Props) {
  return (
    <div className="article-body font-reading">
      {sections.map((section, i) => {
        switch (section.type) {

          case 'intro':
            return <p key={i} className="lead">{section.text}</p>;

          case 'h2':
            return <h2 key={i}>{section.text}</h2>;

          case 'h3':
            return <h3 key={i}>{section.text}</h3>;

          case 'p':
            return <p key={i}>{section.text}</p>;

          case 'ul':
            return (
              <ul key={i} className="list-disc">
                {section.items?.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            );

          case 'ol':
            return (
              <ol key={i} className="list-decimal">
                {section.items?.map((item, j) => <li key={j}>{item}</li>)}
              </ol>
            );

          case 'image':
            return section.text
              ? <img key={i} src={section.text} alt="" className="w-full rounded-xl my-4 object-cover max-h-72" />
              : null;

          case 'table': {
            const t = section.table;
            if (!t) return null;
            return (
              <div key={i} className="my-8 not-prose overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      {t.headers.map((h, hi) => (
                        <th key={hi} className="text-left px-4 py-3 font-bold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {t.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''}>
                        {row.map((cell, ci) => (
                          <td key={ci} className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 ${ci === 0 ? 'font-semibold text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {t.caption && <p className="text-xs text-gray-400 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">{t.caption}</p>}
              </div>
            );
          }

          case 'chart': {
            const c = section.chart;
            if (!c) return null;
            if (c.kind === 'bar' && c.bars?.length) {
              const max = Math.max(...c.bars.map(b => Math.abs(b.value)), 1);
              return (
                <div key={i} className="my-8 not-prose rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-900">
                  {c.title && <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 font-sans">{c.title}</p>}
                  <div className="space-y-3">
                    {c.bars.map((b, bi) => (
                      <div key={bi} className="font-sans">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400 font-medium">{b.label}</span>
                          <span className="text-gray-800 dark:text-gray-200 font-bold">{b.display ?? (c.unit ? `${b.value}${c.unit}` : b.value)}</span>
                        </div>
                        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${b.value < 0 ? 'bg-red-400' : 'bg-teal-500'}`}
                            style={{ width: `${Math.max(2, (Math.abs(b.value) / max) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            if (c.kind === 'line' && c.series?.length && c.xLabels?.length) {
              const allVals = c.series.flatMap(s => s.values);
              const maxV = Math.max(...allVals, 1);
              const minV = Math.min(...allVals, 0);
              const range = maxV - minV || 1;
              const W = 560, H = 220, PAD = 32;
              const stepX = (W - PAD * 2) / (c.xLabels.length - 1 || 1);
              const toY = (v: number) => H - PAD - ((v - minV) / range) * (H - PAD * 2);
              return (
                <div key={i} className="my-8 not-prose rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-900">
                  {c.title && <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 font-sans">{c.title}</p>}
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                    {[0, 0.5, 1].map((f, fi) => (
                      <line key={fi} x1={PAD} x2={W - PAD} y1={PAD + f * (H - PAD * 2)} y2={PAD + f * (H - PAD * 2)} stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth={1} />
                    ))}
                    {c.series.map((s, si) => (
                      <polyline
                        key={si}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={2.5}
                        points={s.values.map((v, vi) => `${PAD + vi * stepX},${toY(v)}`).join(' ')}
                      />
                    ))}
                    {c.series.map((s, si) => s.values.map((v, vi) => (
                      <circle key={`${si}-${vi}`} cx={PAD + vi * stepX} cy={toY(v)} r={3} fill={s.color} />
                    )))}
                    {c.xLabels.map((l, li) => (
                      <text key={li} x={PAD + li * stepX} y={H - 8} fontSize={10} textAnchor="middle" fill="currentColor" className="text-gray-400">{l}</text>
                    ))}
                  </svg>
                  {c.series.length > 1 && (
                    <div className="flex gap-4 mt-3 font-sans">
                      {c.series.map((s, si) => (
                        <div key={si} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                          {s.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          }

          case 'comparison': {
            const cp = section.comparison;
            if (!cp) return null;
            return (
              <div key={i} className="my-8 not-prose">
                {cp.title && <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 font-sans">{cp.title}</p>}
                <div className="grid sm:grid-cols-2 gap-4 font-sans">
                  {[cp.optionA, cp.optionB].map((opt, oi) => (
                    <div key={oi} className={`rounded-xl border-2 p-5 ${oi === 0 ? 'border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20' : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'}`}>
                      <p className={`font-bold mb-3 ${oi === 0 ? 'text-teal-700 dark:text-teal-400' : 'text-amber-700 dark:text-amber-400'}`}>{opt.label}</p>
                      <ul className="space-y-2 mb-3">
                        {opt.points.map((pt, pi) => (
                          <li key={pi} className="text-sm text-gray-600 dark:text-gray-400 flex gap-2">
                            <span className="flex-shrink-0">•</span><span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                      {opt.verdict && (
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-500 pt-3 border-t border-gray-200 dark:border-gray-700">{opt.verdict}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          case 'steps': {
            const st = section.steps;
            if (!st?.length) return null;
            return (
              <div key={i} className="my-8 not-prose space-y-4 font-sans">
                {st.map((step, si) => (
                  <div key={si} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-500 text-white font-bold text-sm flex items-center justify-center">{si + 1}</div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">{step.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          case 'stat-row': {
            const stats = section.stats;
            if (!stats?.length) return null;
            const colorMap = { teal: 'text-teal-600 dark:text-teal-400', amber: 'text-amber-600 dark:text-amber-400', red: 'text-red-500 dark:text-red-400', green: 'text-green-600 dark:text-green-400' };
            const gridClass = stats.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' : stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2';
            return (
              <div key={i} className={`my-8 not-prose grid ${gridClass} gap-3 font-sans`}>
                {stats.map((s, si) => (
                  <div key={si} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center bg-white dark:bg-gray-900">
                    <p className={`text-2xl font-extrabold ${colorMap[s.color ?? 'teal']}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            );
          }

          case 'quote':
            return <blockquote key={i}>{section.text}</blockquote>;

          case 'callout':
            return (
              <div key={i} className="my-8 not-prose">
                {hwtCalc ? (
                  <a
                    href={hwtCalc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-5 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl hover:shadow-md transition-all group"
                  >
                    <span className="text-3xl flex-shrink-0">🧮</span>
                    <div className="flex-1">
                      <p className="font-bold text-teal-700 dark:text-teal-400 text-sm mb-1">{hwtCalc.label}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{section.text}</p>
                    </div>
                    <span className="text-teal-500 flex-shrink-0 text-lg">↗</span>
                  </a>
                ) : (
                  <div className="p-5 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800">
                    <p className="text-sm text-teal-700 dark:text-teal-300 leading-relaxed">{section.text}</p>
                  </div>
                )}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
