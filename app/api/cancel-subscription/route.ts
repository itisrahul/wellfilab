import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: 'subscriptionId required' }, { status: 400 });
    }

    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Demo mode — no real Razorpay subscription to cancel server-side.
    if (!keyId || !keySecret || keyId === 'rzp_test_DEMO') {
      return NextResponse.json({ cancelled: true, dev: true });
    }

    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cancel_at_cycle_end: 0 }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Razorpay cancel error:', err);
      return NextResponse.json(
        { error: err?.error?.description ?? 'Could not cancel subscription. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`❌ Subscription cancelled via dashboard: ${subscriptionId}`);
    return NextResponse.json({ cancelled: true });

  } catch (err) {
    console.error('Cancel subscription error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
