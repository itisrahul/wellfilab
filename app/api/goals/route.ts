import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { goals } from '@/lib/db/schema';
import type { Goal } from '@/lib/goalsStorage';

/** Account-level Goals, keyed by Clerk userId — mirrors lib/goalsStorage.ts's shape. */

export const dynamic = 'force-dynamic';

function toGoal(row: typeof goals.$inferSelect): Goal {
  return {
    id: row.id,
    type: row.type,
    label: row.label,
    target: row.target,
    current: row.current,
    startValue: row.startValue,
    startDate: row.startDate.toISOString(),
    targetDate: row.targetDate ? row.targetDate.toISOString() : undefined,
    lastUpdated: row.lastUpdated.toISOString(),
    paused: row.paused,
    history: row.history,
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const rows = await db.select().from(goals).where(eq(goals.userId, userId));
  return NextResponse.json({ goals: rows.map(toGoal) });
}

const GOAL_TYPES = ['net-worth', 'sip-target', 'emergency-fund', 'debt-freedom', 'fire-corpus', 'weight', 'sleep', 'fitness', 'hydration', 'wellfilab-score', 'custom'] as const;

const addGoalSchema = z.object({
  type: z.enum(GOAL_TYPES),
  label: z.string().min(1).max(200),
  target: z.number(),
  current: z.number(),
  targetDate: z.string().optional(),
  // Optional — present only when the one-time local→account import
  // (lib/accountImport.ts) is preserving a goal's real original history
  // instead of starting a fresh one. Absent on a normal "add goal" call.
  id: z.string().optional(),
  startValue: z.number().optional(),
  startDate: z.string().optional(),
  lastUpdated: z.string().optional(),
  paused: z.boolean().optional(),
  history: z.array(z.object({ date: z.string(), value: z.number() })).optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const parsed = addGoalSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid goal payload.', details: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;

  const now = new Date();
  const id = input.id ?? crypto.randomUUID();
  await db.insert(goals).values({
    id,
    userId,
    type: input.type,
    label: input.label,
    target: input.target,
    current: input.current,
    startValue: input.startValue ?? input.current,
    startDate: input.startDate ? new Date(input.startDate) : now,
    targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
    lastUpdated: input.lastUpdated ? new Date(input.lastUpdated) : now,
    paused: input.paused ?? false,
    history: input.history ?? [{ date: now.toISOString(), value: input.current }],
  });

  const [row] = await db.select().from(goals).where(eq(goals.id, id));
  return NextResponse.json({ goal: toGoal(row) });
}
