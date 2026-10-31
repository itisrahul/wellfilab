import { describe, it, expect, vi, afterEach } from 'vitest';
import { estimateGoalProbability } from './goalProbability';
import type { Goal } from './goalsStorage';

afterEach(() => { vi.useRealTimers(); });

const NOW = new Date('2026-01-01T00:00:00Z');

function baseGoal(overrides: Partial<Goal>): Goal {
  return {
    id: 'g1', type: 'net-worth', label: 'Test goal',
    target: 1000, current: 500, startValue: 0, startDate: '2025-07-01T00:00:00Z',
    lastUpdated: '2026-01-01T00:00:00Z', ...overrides,
  };
}

describe('estimateGoalProbability', () => {
  it('returns no-target when the goal has no target date', () => {
    const g = baseGoal({ targetDate: undefined });
    expect(estimateGoalProbability(g)).toEqual({ status: 'no-target' });
  });

  it('returns not-enough-data with fewer than 3 history points', () => {
    const g = baseGoal({
      targetDate: '2027-01-01T00:00:00Z',
      history: [{ date: '2025-07-01T00:00:00Z', value: 0 }, { date: '2026-01-01T00:00:00Z', value: 500 }],
    });
    expect(estimateGoalProbability(g)).toEqual({ status: 'not-enough-data' });
  });

  it('returns past-due once the target date has already passed', () => {
    vi.useFakeTimers(); vi.setSystemTime(NOW);
    const g = baseGoal({
      targetDate: '2025-12-01T00:00:00Z',
      history: [
        { date: '2025-07-01T00:00:00Z', value: 0 },
        { date: '2025-09-01T00:00:00Z', value: 200 },
        { date: '2025-11-01T00:00:00Z', value: 400 },
      ],
    });
    expect(estimateGoalProbability(g)).toEqual({ status: 'past-due' });
  });

  it('gives a high probability when the required pace is well under the real historical pace', () => {
    vi.useFakeTimers(); vi.setSystemTime(NOW);
    // Real pace: ~+100/month (800 -> 900 -> 1000). Only +300 needed over the
    // next 6 months (~50/month required) — well under the real pace.
    const g = baseGoal({
      target: 1300, current: 1000, startValue: 0,
      targetDate: '2026-07-01T00:00:00Z',
      history: [
        { date: '2025-10-01T00:00:00Z', value: 800 },
        { date: '2025-11-01T00:00:00Z', value: 900 },
        { date: '2025-12-01T00:00:00Z', value: 1000 },
      ],
    });
    const r = estimateGoalProbability(g);
    expect(r.status).toBe('estimated');
    if (r.status === 'estimated') expect(r.pct).toBeGreaterThanOrEqual(90);
  });

  it('gives a low probability when real progress is far behind what the target date needs', () => {
    vi.useFakeTimers(); vi.setSystemTime(NOW);
    // Only +10/month, but needs +1000 in the next month — nowhere close.
    const g = baseGoal({
      target: 2000, current: 1000, startValue: 0,
      targetDate: '2026-02-01T00:00:00Z',
      history: [
        { date: '2025-10-01T00:00:00Z', value: 980 },
        { date: '2025-11-01T00:00:00Z', value: 990 },
        { date: '2025-12-01T00:00:00Z', value: 1000 },
      ],
    });
    const r = estimateGoalProbability(g);
    expect(r.status).toBe('estimated');
    if (r.status === 'estimated') expect(r.pct).toBeLessThanOrEqual(10);
  });

  it('never reports 0% or 100% even with a perfectly consistent, comfortable pace', () => {
    vi.useFakeTimers(); vi.setSystemTime(NOW);
    const g = baseGoal({
      target: 1200, current: 1000, startValue: 0,
      targetDate: '2026-06-01T00:00:00Z',
      history: [
        { date: '2025-10-01T00:00:00Z', value: 800 },
        { date: '2025-11-01T00:00:00Z', value: 900 },
        { date: '2025-12-01T00:00:00Z', value: 1000 },
      ],
    });
    const r = estimateGoalProbability(g);
    expect(r.status).toBe('estimated');
    if (r.status === 'estimated') { expect(r.pct).toBeLessThanOrEqual(97); expect(r.pct).toBeGreaterThanOrEqual(3); }
  });

  it('handles a decreasing-is-good goal (e.g. debt payoff) with the comparison flipped', () => {
    vi.useFakeTimers(); vi.setSystemTime(NOW);
    // Real pace: -1000/month (6000 -> 5000 -> 4000). Needs to clear ₹4000 of
    // debt over the next 7 months (~571/month required) — well under the
    // real ~1000/month payoff pace, so this should read as likely.
    const g = baseGoal({
      type: 'debt-freedom', target: 0, current: 4000, startValue: 10000,
      targetDate: '2026-08-01T00:00:00Z',
      history: [
        { date: '2025-10-01T00:00:00Z', value: 6000 },
        { date: '2025-11-01T00:00:00Z', value: 5000 },
        { date: '2025-12-01T00:00:00Z', value: 4000 },
      ],
    });
    const r = estimateGoalProbability(g);
    expect(r.status).toBe('estimated');
    if (r.status === 'estimated') expect(r.pct).toBeGreaterThanOrEqual(80);
  });
});
