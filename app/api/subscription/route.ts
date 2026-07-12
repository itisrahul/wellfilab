import { NextResponse } from 'next/server';
import { currentUser, clerkClient } from '@clerk/nextjs/server';
import type { StoredSubscription } from '@/lib/subscriptionStorage';

/**
 * Account-level subscription state, stored in the signed-in user's Clerk
 * `publicMetadata`. This is the actual source of truth — unlike
 * lib/subscriptionStorage.ts (a per-browser localStorage cache used during
 * anonymous checkout, before we know who the buyer is), this is tied to the
 * account and visible on any device the user signs into.
 *
 * When a real database exists, this route is the only place that changes:
 * swap the clerkClient metadata read/write for a query against a
 * `subscriptions` table keyed by user id.
 */

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ subscription: null }, { status: 401 });

  const subscription = (user.publicMetadata?.subscription as StoredSubscription | undefined) ?? null;
  return NextResponse.json({ subscription });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to save your subscription to your account.' }, { status: 401 });

  const subscription = (await req.json().catch(() => null)) as StoredSubscription | null;
  if (!subscription) return NextResponse.json({ error: 'Invalid subscription payload.' }, { status: 400 });

  const client = await clerkClient();
  await client.users.updateUserMetadata(user.id, {
    publicMetadata: { ...user.publicMetadata, subscription },
  });

  return NextResponse.json({ subscription });
}
