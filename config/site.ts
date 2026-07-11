export const SITE_NAME = 'WellFiLab';
export const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wellfilab.com';
export const STRIPE_PUB = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// Legacy — kept for compatibility with copied WFL/HWT components.
// These now point internally within the merged app.
export const HWT_NAME    = SITE_NAME;
export const HWT_URL     = '/tools';
export const PARTNER_NAME = SITE_NAME;
export const PARTNER_URL  = '/tools';
