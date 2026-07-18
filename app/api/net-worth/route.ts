import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { netWorthSnapshots } from '@/lib/db/schema';
import type { NetWorthSnapshot } from '@/lib/netWorthHistory';

/** Account-level net worth snapshots, keyed by Clerk userId — mirrors lib/netWorthHistory.ts's shape. */

export const dynamic = 'force-dynamic';

function toSnapshot(row: typeof netWorthSnapshots.$inferSelect): NetWorthSnapshot {
  return { id: row.id, date: row.date.toISOString(), assets: row.assets, liabilities: row.liabilities, netWorth: row.netWorth };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const rows = await db.select().from(netWorthSnapshots)
    .where(eq(netWorthSnapshots.userId, userId))
    .orderBy(asc(netWorthSnapshots.date));

  return NextResponse.json({ snapshots: rows.map(toSnapshot) });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  // id/date are optional — present only when the one-time local→account
  // import (lib/accountImport.ts) is preserving a snapshot's real original
  // date instead of stamping it as taken today.
  const body = (await req.json().catch(() => null)) as { assets: number; liabilities: number; id?: string; date?: string } | null;
  if (!body || typeof body.assets !== 'number' || typeof body.liabilities !== 'number') {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const id = body.id ?? crypto.randomUUID();
  const date = body.date ? new Date(body.date) : new Date();
  await db.insert(netWorthSnapshots).values({
    id, userId, date, assets: body.assets, liabilities: body.liabilities, netWorth: body.assets - body.liabilities,
  });

  return NextResponse.json({ snapshot: { id, date: date.toISOString(), assets: body.assets, liabilities: body.liabilities, netWorth: body.assets - body.liabilities } });
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await db.delete(netWorthSnapshots).where(eq(netWorthSnapshots.userId, userId));
  return NextResponse.json({ ok: true });
}
