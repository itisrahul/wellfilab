import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { netWorthSnapshots } from '@/lib/db/schema';

interface Params { params: { id: string } }

export async function DELETE(_req: Request, { params }: Params) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  await db.delete(netWorthSnapshots).where(and(eq(netWorthSnapshots.id, params.id), eq(netWorthSnapshots.userId, user.id)));
  return NextResponse.json({ ok: true });
}
