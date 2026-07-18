import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { goals } from '@/lib/db/schema';
import type { Goal, GoalType } from '@/lib/goalsStorage';

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
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const rows = await db.select().from(goals).where(eq(goals.userId, user.id));
  return NextResponse.json({ goals: rows.map(toGoal) });
}

interface AddGoalInput {
  type: GoalType; label: string; target: number; current: number; targetDate?: string;
  // Optional — present only when the one-time local→account import
  // (lib/accountImport.ts) is preserving a goal's real original history
  // instead of starting a fresh one. Absent on a normal "add goal" call.
  id?: string; startValue?: number; startDate?: string; lastUpdated?: string;
  paused?: boolean; history?: { date: string; value: number }[];
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const input = (await req.json().catch(() => null)) as AddGoalInput | null;
  if (!input) return NextResponse.json({ error: 'Invalid goal payload.' }, { status: 400 });

  const now = new Date();
  const id = input.id ?? crypto.randomUUID();
  await db.insert(goals).values({
    id,
    userId: user.id,
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
