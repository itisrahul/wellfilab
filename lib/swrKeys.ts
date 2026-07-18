/**
 * lib/swrKeys.ts — shared SWR cache keys for account data.
 *
 * One source of truth so every page reading the same data (dashboard,
 * goals, roadmap, history) shares the same cache entry instead of each
 * re-fetching independently on every navigation — a typo'd duplicate key
 * string would silently defeat the cache, so these are centralized here.
 */
export const SWR_KEYS = {
  scoreHistory: 'account:score-history',
  goals: 'account:goals',
  netWorthSnapshots: 'account:net-worth-snapshots',
  roadmapChecks: 'account:roadmap-checks',
  scoreInputs: 'account:score-inputs',
} as const;
