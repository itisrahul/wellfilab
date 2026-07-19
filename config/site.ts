export const SITE_NAME = 'WellFiLab';
export const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wellfilab.com';
export const STRIPE_PUB = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

/**
 * Single switch for the paid-plans/subscription feature. Off for now while
 * the focus is on free-product quality and trust before asking anyone to
 * pay — flip to true to bring back nav links, homepage upsell, roadmap
 * upsell, and the PlanUpsell component at the bottom of guides/blog posts.
 * The /plan routes, checkout, and webhook handling are all still fully
 * intact underneath this flag, just not linked to from anywhere.
 */
export const PLANS_ENABLED = false;

// Legacy — kept for compatibility with copied WFL/HWT components.
// These now point internally within the merged app.
export const HWT_NAME    = SITE_NAME;
export const HWT_URL     = '/tools';
export const PARTNER_NAME = SITE_NAME;
export const PARTNER_URL  = '/tools';
