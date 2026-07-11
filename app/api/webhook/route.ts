import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto');

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

        // TODO (after adding auth):
        // 1. Create/update user record in DB
        // 2. Set subscription status to active
        // 3. Send welcome email via Resend
        // 4. Trigger onboarding questionnaire email

        break;
      }

      case 'subscription.activated': {
        const sub   = payload.subscription?.entity;
        const email = sub?.notes?.email;
        console.log(`✅ Subscription activated: ${sub?.id} | Email: ${email}`);
        break;
      }

      case 'subscription.cancelled': {
        const sub   = payload.subscription?.entity;
        const email = sub?.notes?.email;
        console.log(`❌ Subscription cancelled: ${sub?.id} | Email: ${email}`);
        // TODO: Revoke dashboard access
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
