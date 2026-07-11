'use client';

// ── Shared UI components for the Score feature ────────────────────────────────

export function Ring({ pct, size = 140, thick = 12, color = '#14b8a6' }: {
  pct: number; size?: number; thick?: number; color?: string;
}) {
  const r = (size - thick) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={thick} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={thick}
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }} />
    </svg>
  );
}

export function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Badge({ children, color = 'teal' }: { children?: React.ReactNode; color?: 'teal' | 'amber' | 'red' | 'green' }) {
  const styles: Record<string, React.CSSProperties> = {
    teal:  { background:'rgba(20,184,166,0.15)',  border:'1px solid rgba(20,184,166,0.3)',  color:'#5eead4' },
    amber: { background:'rgba(245,158,11,0.15)',  border:'1px solid rgba(245,158,11,0.3)',  color:'#fcd34d' },
    red:   { background:'rgba(239,68,68,0.15)',   border:'1px solid rgba(239,68,68,0.3)',   color:'#f87171' },
    green: { background:'rgba(16,185,129,0.15)',  border:'1px solid rgba(16,185,129,0.3)',  color:'#34d399' },
  };
  return (
    <span className="text-xs font-bold px-3 py-1 rounded-full" style={styles[color]}>
      {children}
    </span>
  );
}

export function Card({ children, className = '' }: { children?: React.ReactNode; className?: string; key?: any }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children?: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#64748b' }}>
      {children}
    </p>
  );
}
