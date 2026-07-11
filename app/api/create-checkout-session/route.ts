import { NextResponse } from 'next/server';
import { getPlan } from '@/lib/plans';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planId, billing, email, name, phone } = body;

    if (!email?.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const plan = getPlan(planId);
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const keyId     = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const siteUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wellfilab.com';

    // ── DEV / DEMO MODE ──────────────────────────────────────────────────
    if (!keyId || !keySecret || keyId === 'rzp_test_DEMO') {
      return NextResponse.json({
        mode: 'demo',
        url: `${siteUrl}/plan/success?plan=${planId}&billing=${billing}&email=${encodeURIComponent(email)}&demo=true`,
      });
    }

    // ── Get Razorpay plan ID ──────────────────────────────────────────────
    const razorpayPlanId = billing === 'yearly'
      ? plan.razorpayPlanIds.yearly
      : plan.razorpayPlanIds.monthly;

    if (!razorpayPlanId) {
      return NextResponse.json(
        { error: `Plan ID not configured for ${planId} ${billing}.` },
        { status: 500 }
      );
    }

    const credentials = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    // ── Create Razorpay Subscription ──────────────────────────────────────
    const subRes = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id:         razorpayPlanId,
        total_count:     billing === 'yearly' ? 12 : 120,  // max billing cycles
        quantity:        1,
        customer_notify: 1,
        addons:          [],
        notes: {
          planId,
          billing,
          email,
          name: name ?? '',
        },
      }),
    });

    if (!subRes.ok) {
      const err = await subRes.json();
      console.error('Razorpay subscription error:', err);
      return NextResponse.json(
        { error: err?.error?.description ?? 'Payment gateway error. Please try again.' },
        { status: 500 }
      );
    }

    const subscription = await subRes.json();

    return NextResponse.json({
      mode:           'razorpay',
      subscriptionId: subscription.id,
      planId,
      billing,
      planName:       plan.name,
      keyId,
      prefill: {
        name:    name    ?? '',
        email:   email   ?? '',
        contact: phone   ?? '',
      },
      successUrl: `${siteUrl}/plan/success?plan=${planId}&billing=${billing}&email=${encodeURIComponent(email)}`,
      cancelUrl:  `${siteUrl}/plan/${planId}`,
    });

  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
