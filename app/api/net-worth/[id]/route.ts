import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { netWorthSnapshots } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

interface Params { params: { id: string } }

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await db.delete(netWorthSnapshots).where(and(eq(netWorthSnapshots.id, params.id), eq(netWorthSnapshots.userId, userId)));
  return NextResponse.json({ ok: true });
}
