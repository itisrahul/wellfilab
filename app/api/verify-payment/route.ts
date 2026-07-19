import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto');

export async function POST(req: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      planId,
      email,
    } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    // Fail closed: a missing secret must reject the request, not report
    // "verified" without ever checking a signature.
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is not set — cannot verify payment');
      return NextResponse.json({ verified: false, error: 'Payment verification not configured' }, { status: 500 });
    }

    // Verify subscription payment signature
    const body     = `${razorpay_payment_id}|${razorpay_subscription_id}`;
    const expected = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

    const sigBuf = Buffer.from(razorpay_signature ?? '', 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    const validSig = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
    if (!validSig) {
      console.error('Payment signature mismatch');
      return NextResponse.json({ verified: false, error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`✅ Subscription payment verified: ${razorpay_payment_id} | Plan: ${planId} | Email: ${email}`);
    return NextResponse.json({ verified: true });

  } catch (err) {
    console.error('Verify error:', err);
    return NextResponse.json({ verified: false, error: String(err) }, { status: 500 });
  }
}
