import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getPlanAny } from '@/lib/plans';
import type { StoredSubscription } from '@/lib/subscriptionStorage';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto');

/**
 * Links a Razorpay event back to a WellFiLab account by email and updates
 * their subscription metadata — the only path that reflects lifecycle
 * events (renewals, failed payments, cancellations) that happen entirely on
 * Razorpay's servers with no browser involved to sync them otherwise. A
 * no-op if no account with that email exists yet (guest checkout, no
 * account signed up under that address).
 */
async function syncSubscriptionForEmail(
  email: string,
  patch: Partial<StoredSubscription> & { status: StoredSubscription['status'] }
): Promise<void> {
  try {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({ emailAddress: [email] });
    const user = users[0];
    if (!user) return;

    const existing = (user.publicMetadata?.subscription as StoredSubscription | undefined) ?? null;
    const merged: StoredSubscription = {
      planId: existing?.planId ?? 'diet',
      planName: existing?.planName ?? '',
      nextBillingDate: existing?.nextBillingDate ?? new Date().toISOString(),
      weekNumber: existing?.weekNumber ?? 1,
      deliveries: existing?.deliveries ?? [],
      ...existing,
      ...patch,
    };
    await client.users.updateUserMetadata(user.id, { publicMetadata: { ...user.publicMetadata, subscription: merged } });
  } catch (err) {
    console.error('Clerk metadata sync failed:', err);
  }
}

function buildPaymentEmail({ email, planId, billing, amount, siteUrl }: {
  email: string; planId: string; billing: string; amount: number; siteUrl: string;
}) {
  const planNames: Record<string, string> = {
    diet: 'Diet & Nutrition Plan', finance: 'Personal Finance Plan', bundle: 'Health + Finance Bundle',
  };
  const planName = planNames[planId] ?? planId;
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,sans-serif">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)">
  <div style="background:linear-gradient(135deg,#0f766e,#0d9488);padding:32px 40px;text-align:center">
    <p style="color:white;font-size:32px;margin:0">🎉</p>
    <h1 style="color:white;margin:8px 0 0;font-size:22px">You're subscribed!</h1>
    <p style="color:rgba(255,255,255,.8);margin:4px 0 0;font-size:14px">${planName}</p>
  </div>
  <div style="padding:40px">
    <p style="color:#111;font-size:15px;line-height:1.6">
      Welcome to WellFiLab! Your payment of <strong>₹${amount}</strong> (${billing}) was successful.
    </p>
    <div style="background:#f0fdfa;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #0d9488">
      <p style="margin:0;font-weight:700;color:#0f766e">What happens next:</p>
      <ol style="margin:10px 0 0;padding-left:20px;color:#115e59;font-size:14px;line-height:2">
        <li>You'll receive an onboarding questionnaire within the next few minutes</li>
        <li>We'll create your personalised plan within 48 hours</li>
        <li>Your first plan will be delivered to this email</li>
      </ol>
    </div>
    <a href="${siteUrl}/dashboard" style="display:block;text-align:center;background:#0d9488;color:white;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;margin-top:24px">
      View Your Dashboard →
    </a>
    <p style="margin-top:24px;font-size:13px;color:#9ca3af;text-align:center">
      Questions? Reply to this email or visit <a href="${siteUrl}/contact" style="color:#0d9488">our contact page</a>.
    </p>
  </div>
</div>
</body></html>`;
}

async function sendPaymentEmail({ email, planId, billing, amount }: {
  email: string; planId: string; billing: string; amount: number;
}) {
  const apiKey  = process.env.RESEND_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wellfilab.com';

  if (!apiKey) {
    console.log('Payment email (no Resend key):', { email, planId, billing, amount });
    return;
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'WellFiLab <hello@wellfilab.com>',
        to:      [email],
        subject: "You're subscribed to WellFiLab 🎉",
        html:    buildPaymentEmail({ email, planId, billing, amount, siteUrl }),
      }),
    });
  } catch (err) {
    // Swallow — a failed email must not cause Razorpay to retry the webhook.
    console.error('Payment email send failed:', err);
  }
}

/**
 * Razorpay webhook handler.
 * Vercel → Settings → Environment Variables → RAZORPAY_WEBHOOK_SECRET
 * Razorpay Dashboard → Settings → Webhooks → Add new webhook:
 *   URL: https://wellfilab.com/api/webhook
 *   Events: payment.captured, subscription.activated, subscription.cancelled
 */
export async function POST(req: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  try {
    const body      = await req.text();
    const signature = req.headers.get('x-razorpay-signature') ?? '';

    // ── Verify signature ─────────────────────────────────────────────────────
    if (webhookSecret) {
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (expectedSig !== signature) {
        console.error('Webhook signature mismatch');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    const { event: eventName, payload } = event;

    console.log('Razorpay webhook:', eventName);

    switch (eventName) {

      case 'payment.captured': {
        const payment = payload.payment?.entity;
        const planId  = payment?.notes?.planId;
        const email   = payment?.notes?.email;
        const billing = payment?.notes?.billing;
        const amount  = payment?.amount / 100; // paise → INR

        console.log(`✅ Payment captured: ₹${amount} | Plan: ${planId} | Email: ${email} | Billing: ${billing}`);

        if (email && planId) {
          const plan = getPlanAny(planId);
          await syncSubscriptionForEmail(email, {
            status: 'active',
            planId,
            planName: plan?.name ?? planId,
          });
        }

        break;
      }

      case 'subscription.activated': {
        const sub     = payload.subscription?.entity;
        const email   = sub?.notes?.email;
        const planId  = sub?.notes?.planId;
        const billing = sub?.notes?.billing;
        const plan    = getPlanAny(planId);
        const amount  = plan ? (billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice) : 0;

        console.log(`✅ Subscription activated: ${sub?.id} | Email: ${email}`);

        if (email && planId) {
          await syncSubscriptionForEmail(email, {
            status: 'active',
            planId,
            planName: plan?.name ?? planId,
            subscriptionId: sub?.id,
          });
          await sendPaymentEmail({ email, planId, billing, amount });
        } else {
          console.error('subscription.activated missing notes — cannot send confirmation email', sub?.id);
        }

        break;
      }

      case 'subscription.cancelled': {
        const sub   = payload.subscription?.entity;
        const email = sub?.notes?.email;
        console.log(`❌ Subscription cancelled: ${sub?.id} | Email: ${email}`);
        if (email) await syncSubscriptionForEmail(email, { status: 'cancelled' });
        break;
      }

      case 'payment.failed': {
        const payment = payload.payment?.entity;
        console.log(`❌ Payment failed: ${payment?.id} | Email: ${payment?.notes?.email}`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventName}`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
