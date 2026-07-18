import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { eq, desc, and, notInArray } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { scores } from '@/lib/db/schema';
import type { WellFiScore } from '@/lib/wellfilab-score';

export const dynamic = 'force-dynamic';

/**
 * Account-level WellFiLab Score history, keyed by Clerk userId.
 * Mirrors lib/scoreStorage.ts's localStorage shape exactly (same stamped
 * record, same MAX_HISTORY cap) so that file's function bodies can become
 * thin fetch() wrappers around this route without changing its exported
 * signatures or any call site.
 *
 * Uses auth() rather than currentUser() — only userId is ever needed here,
 * and auth() verifies the session locally (JWT/JWKS) with no outbound call
 * to Clerk's API, unlike currentUser() which always makes one.
 */

const MAX_HISTORY = 30;

// Mirrors lib/wellfilab-score.ts's WellFiScore shape — kept here rather than
// derived from the TS types since zod needs its own runtime schema either way.
const scoreFactorSchema = z.object({
  id: z.string(), label: z.string(), value: z.string(), points: z.number(),
  dimension: z.enum(['body', 'mind', 'wealth']),
});
const dimensionSchema = z.object({
  id: z.string(), label: z.string(), score: z.number(), icon: z.string(), color: z.string(),
  trend: z.enum(['up', 'down', 'same']).optional(), insight: z.string().optional(),
});
const insightSchema = z.object({
  type: z.enum(['connection', 'opportunity', 'warning', 'strength']),
  emoji: z.string(), headline: z.string(), detail: z.string(), financialValue: z.number().optional(),
});
const actionSchema = z.object({
  rank: z.number(), title: z.string(), why: z.string(), impact: z.string(),
  howEasy: z.enum(['today', 'this-week', 'this-month']),
  category: z.enum(['health', 'finance', 'mind', 'both']),
  toolSlug: z.string().optional(), toolCat: z.string().optional(),
});
const trajectorySchema = z.object({
  scenario: z.enum(['current', 'improved', 'optimal']), label: z.string(),
  netWorthAt60: z.number(), monthlyPassiveIncome: z.number(), keyChange: z.string(),
});
const archetypeSchema = z.object({
  id: z.string(), name: z.string(), emoji: z.string(), tagline: z.string(),
  description: z.string(), strength: z.string(), challenge: z.string(), color: z.string(),
});
const wellFiScoreSchema = z.object({
  scoreVersion: z.number().optional(),
  overall: z.number(), body: z.number(), mind: z.number(), wealth: z.number(), life: z.number(),
  level: z.enum(['quick', 'body', 'full']),
  focus: z.enum(['health', 'wealth', 'both']),
  archetype: archetypeSchema,
  financialIndependencePct: z.number().optional(),
  dimensions: z.array(dimensionSchema),
  insights: z.array(insightSchema),
  actions: z.array(actionSchema),
  trajectories: z.array(trajectorySchema).optional(),
  scoreFactors: z.array(scoreFactorSchema).optional(),
  previousScore: z.number().optional(),
  scoreChange: z.number().optional(),
  streakDays: z.number(),
  date: z.string().optional(),
  id: z.string().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const rows = await db.select().from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.date))
    .limit(MAX_HISTORY);

  return NextResponse.json({ history: rows.map(r => r.data) });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const parsed = wellFiScoreSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid score payload.', details: parsed.error.flatten() }, { status: 400 });
  const score = parsed.data as WellFiScore;

  // A normal save passes an unstamped score — id/date get generated here.
  // The one-time local→account import (lib/accountImport.ts) passes an
  // already-stamped score with its real original id/date, which must be
  // preserved rather than overwritten with "now".
  const stamped: WellFiScore = {
    ...score,
    id: score.id ?? crypto.randomUUID(),
    date: score.date ?? new Date().toISOString(),
  };

  await db.insert(scores).values({
    id: stamped.id!,
    userId,
    date: new Date(stamped.date!),
    data: stamped,
  });

  // Prune to the most recent MAX_HISTORY rows for this user.
  const keep = await db.select({ id: scores.id }).from(scores)
    .where(eq(scores.userId, userId))
    .orderBy(desc(scores.date))
    .limit(MAX_HISTORY);
  const keepIds = keep.map(r => r.id);
  if (keepIds.length > 0) {
    await db.delete(scores).where(and(eq(scores.userId, userId), notInArray(scores.id, keepIds)));
  }

  return NextResponse.json({ score: stamped });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await db.delete(scores).where(eq(scores.userId, userId));
  return NextResponse.json({ ok: true });
}
