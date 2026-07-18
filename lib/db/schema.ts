/**
 * lib/db/schema.ts — Postgres schema (Drizzle), Supabase-hosted.
 *
 * No `users` table: every row is scoped directly by Clerk's `userId` (a
 * stable Clerk-issued string like `user_xxx`), which is the actual foreign
 * key everywhere below — Clerk is already the account system, so a second
 * internal user id would just be a redundant join.
 *
 * `scores.data` and `goals.history` keep the exact nested shapes
 * (ScoreFactor[], insights, actions, GoalHistoryPoint[]) that
 * lib/wellfilab-score.ts and lib/goalsStorage.ts already define — stored as
 * jsonb rather than normalized into their own tables, since nothing queries
 * a factor or a history point independently of its parent record.
 *
 * IDs are `text`, not Postgres `uuid` — every record already carries a
 * client-generated id (crypto.randomUUID(), see genId() in each
 * lib/*Storage.ts file) specifically so it can double as the DB primary key
 * without renumbering. See the `id` comment on WellFiScore in
 * lib/wellfilab-score.ts.
 */

import { pgTable, text, timestamp, doublePrecision, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import type { WellFiScore } from '../wellfilab-score';
import type { GoalType, GoalHistoryPoint } from '../goalsStorage';
import type { RoadmapChecks } from '../roadmapChecks';

export const scores = pgTable('scores', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  data: jsonb('data').$type<WellFiScore>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index('scores_user_id_idx').on(t.userId),
]);

export const goals = pgTable('goals', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').$type<GoalType>().notNull(),
  label: text('label').notNull(),
  target: doublePrecision('target').notNull(),
  current: doublePrecision('current').notNull(),
  startValue: doublePrecision('start_value').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  targetDate: timestamp('target_date', { withTimezone: true }),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).notNull(),
  paused: boolean('paused').notNull().default(false),
  history: jsonb('history').$type<GoalHistoryPoint[]>().notNull().default([]),
}, (t) => [
  index('goals_user_id_idx').on(t.userId),
]);

export const netWorthSnapshots = pgTable('net_worth_snapshots', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  assets: doublePrecision('assets').notNull(),
  liabilities: doublePrecision('liabilities').notNull(),
  netWorth: doublePrecision('net_worth').notNull(),
}, (t) => [
  index('net_worth_snapshots_user_id_idx').on(t.userId),
]);

/** One row per user — same single-blob shape as the `wfl_roadmap_checks` localStorage key. */
export const roadmapChecks = pgTable('roadmap_checks', {
  userId: text('user_id').primaryKey(),
  checks: jsonb('checks').$type<RoadmapChecks>().notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
