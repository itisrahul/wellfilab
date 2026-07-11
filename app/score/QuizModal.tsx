'use client';

import { useState, useEffect } from 'react';
import type { Answer } from './types';
import { QUESTIONS, DIMS } from './data';

interface Props {
  onComplete: (answers: Answer[]) => void;
  onClose: () => void;
}

export function QuizModal({ onComplete, onClose }: Props) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [idx, setIdx]         = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [fade, setFade]       = useState(false);

  const q    = QUESTIONS[idx];
  const prev = answers.find(a => a.qid === q?.id);
  const prog = Math.round(((idx + 1) / QUESTIONS.length) * 100);

  useEffect(() => { setSelected(prev?.value ?? null); }, [idx]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const pick = (val: number) => {
    setSelected(val);
    setAnswers(prev => {
      const i = prev.findIndex(a => a.qid === q.id);
      if (i >= 0) { const n = [...prev]; n[i] = { qid: q.id, value: val }; return n; }
      return [...prev, { qid: q.id, value: val }];
    });
  };

  const goNext = () => {
    if (selected === null) return;
    setFade(true);
    setTimeout(() => {
      setFade(false);
      if (idx < QUESTIONS.length - 1) { setIdx(i => i + 1); }
      else { onComplete(answers); }
    }, 150);
  };

  const goPrev = () => { if (idx > 0) setIdx(i => i - 1); };

  const dimQs  = QUESTIONS.filter(x => x.dimension.id === q.dimension.id);
  const dimIdx = dimQs.findIndex(x => x.id === q.id) + 1;

  return (
    /* Full-screen overlay — sits above everything including navbar */
    <div className="fixed inset-0 z-[200] flex flex-col" style={{ background: '#0a0f1e' }}>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">

          {/* Progress */}
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: '#64748b' }}>
              <span>{q.dimension.icon} {q.dimension.label} · Q{dimIdx}/{dimQs.length}</span>
              <span style={{ fontFamily: 'monospace' }}>{idx + 1} / {QUESTIONS.length}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${prog}%`, background: 'linear-gradient(90deg,#0d9488,#0891b2)' }} />
            </div>
          </div>

          {/* Close button */}
          <button onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all text-lg"
            style={{ background: 'rgba(255,255,255,0.07)', color: '#94a3b8' }}
            title="Close quiz">
            ✕
          </button>
        </div>
      </div>

      {/* ── Question content ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-10">

          {/* Category badge */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">{q.dimension.icon}</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
              background: q.dimension.type === 'health' ? 'rgba(20,184,166,0.15)' : 'rgba(245,158,11,0.15)',
              border:     q.dimension.type === 'health' ? '1px solid rgba(20,184,166,0.3)' : '1px solid rgba(245,158,11,0.3)',
              color:      q.dimension.type === 'health' ? '#5eead4' : '#fcd34d',
            }}>
              {q.dimension.type === 'health' ? '❤️ Health' : '💰 Wealth'} · {q.dimension.label}
            </span>
          </div>

          <div className={`transition-all duration-150 ${fade ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>

            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 leading-snug">{q.text}</h2>
            {q.subtitle && <p className="text-sm mb-5" style={{ color: '#64748b' }}>{q.subtitle}</p>}

            {/* HWT calculator link */}
            {q.hwtLink && (
              <a href={q.hwtLink.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs mb-6 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                style={{ color:'#5eead4', border:'1px solid rgba(20,184,166,0.25)', background:'rgba(20,184,166,0.08)' }}>
                🧮 {q.hwtLink.label} ↗
              </a>
            )}

            {/* Options */}
            <div className="space-y-3 mb-8">
              {q.options.map(opt => (
                <button key={opt.value} onClick={() => pick(opt.value)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                  style={{
                    background: selected === opt.value ? 'rgba(20,184,166,0.15)' : 'rgba(255,255,255,0.04)',
                    border:     selected === opt.value ? '1.5px solid #14b8a6' : '1px solid rgba(255,255,255,0.08)',
                    color:      selected === opt.value ? '#fff' : '#cbd5e1',
                    boxShadow:  selected === opt.value ? '0 0 20px rgba(20,184,166,0.12)' : 'none',
                  }}>
                  <span className="text-2xl flex-shrink-0">{opt.icon}</span>
                  <span className="text-sm leading-snug flex-1">{opt.label}</span>
                  {selected === opt.value && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#14b8a6', color: '#fff' }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {idx > 0 && (
                <button onClick={goPrev}
                  className="px-5 py-3 rounded-xl text-sm transition-all hover:opacity-80"
                  style={{ border:'1px solid rgba(255,255,255,0.12)', color:'#94a3b8', background:'rgba(255,255,255,0.04)' }}>
                  ← Back
                </button>
              )}
              <button onClick={goNext} disabled={selected === null}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-30"
                style={{ background: selected !== null ? 'linear-gradient(90deg,#0d9488,#0891b2)' : 'rgba(255,255,255,0.08)' }}>
                {idx === QUESTIONS.length - 1 ? '🎯 Get My Score' : 'Next →'}
              </button>
            </div>

            {/* Dimension dots */}
            <div className="flex gap-3 mt-8 justify-center flex-wrap">
              {DIMS.map(d => {
                const dqs  = QUESTIONS.filter(x => x.dimension.id === d.id);
                const done = dqs.filter(x => answers.find(a => a.qid === x.id)).length;
                const cur  = d.id === q.dimension.id;
                return (
                  <div key={d.id} className="flex flex-col items-center gap-1">
                    <span className="text-sm">{d.icon}</span>
                    <div className="flex gap-0.5">
                      {dqs.map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full" style={{
                          background: i < done ? '#14b8a6' : cur && i === done ? 'rgba(20,184,166,0.35)' : 'rgba(255,255,255,0.1)',
                        }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
