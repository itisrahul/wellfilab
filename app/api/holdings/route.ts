import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { holdings } from '@/lib/db/schema';
import { HOLDING_TYPES, type Holding } from '@/lib/holdingsStorage';

/** Account-level holdings, keyed by Clerk userId — mirrors lib/holdingsStorage.ts's shape. */

export const dynamic = 'force-dynamic';

function toHolding(row: typeof holdings.$inferSelect): Holding {
  return {
    id: row.id,
    category: row.category,
    type: row.type,
    subType: row.subType,
    currentValue: row.currentValue,
    investedAmount: row.investedAmount ?? undefined,
    monthlyContribution: row.monthlyContribution ?? undefined,
    lastUpdated: row.lastUpdated.toISOString(),
    history: row.history,
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  try {
    const rows = await db.select().from(holdings).where(eq(holdings.userId, userId));
    return NextResponse.json({ holdings: rows.map(toHolding) });
  } catch (err) {
    // Surfaced client-side (lib/holdingsStorage.ts's getHoldingsSyncError)
    // instead of silently falling back to local-only data with no clue why —
    // most likely cause is a schema drift (e.g. a column added here but the
    // migration never run against the live database).
    console.error('[GET /api/holdings] DB error:', err);
    return NextResponse.json({ error: 'Could not load holdings from the database.', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// Derived from HOLDING_TYPES (the single source of truth) rather than a
// hand-maintained copy — a stale parallel enum here is exactly the bug
// class that silently broke goal creation for new goal types (see
// app/api/goals/route.ts's fix), not repeating it here.
const addHoldingSchema = z.object({
  category: z.enum(['asset', 'liability']),
  type: z.enum(HOLDING_TYPES),
  subType: z.string().min(1).max(100),
  currentValue: z.number(),
  investedAmount: z.number().optional(),
  monthlyContribution: z.number().optional(),
  history: z.array(z.object({ date: z.string(), value: z.number() })).optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const parsed = addHoldingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid holding payload.', details: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;

  const id = crypto.randomUUID();
  const now = new Date();
  try {
    await db.insert(holdings).values({
      id, userId,
      category: input.category, type: input.type, subType: input.subType,
      currentValue: input.currentValue, investedAmount: input.investedAmount, monthlyContribution: input.monthlyContribution,
      lastUpdated: now,
      history: input.history ?? [{ date: now.toISOString(), value: input.currentValue }],
    });

    const [row] = await db.select().from(holdings).where(eq(holdings.id, id));
    return NextResponse.json({ holding: toHolding(row) });
  } catch (err) {
    console.error('[POST /api/holdings] DB error:', err);
    return NextResponse.json({ error: 'Could not save this holding to the database.', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

/** Deletes every holding for this account — used when the net-worth goal
 * itself is deleted, so a "start over" actually starts over instead of
 * leaving orphaned holdings behind with nothing pointing at them. */
export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  try {
    await db.delete(holdings).where(eq(holdings.userId, userId));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/holdings] DB error:', err);
    return NextResponse.json({ error: 'Could not delete your holdings from the database.', detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
