/** @type {import('next').NextConfig} */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://cdn.razorpay.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://clerk.wellfilab.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://cdn.razorpay.com https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://clerk.wellfilab.com",
  "worker-src 'self' blob:",
  "frame-src https://checkout.razorpay.com https://api.razorpay.com https://clerk.wellfilab.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.razorpay.com",
  "object-src 'none'",
].join('; ');

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [{ key: 'Content-Security-Policy', value: csp }],
      },
    ];
  },
  async redirects() {
    return [
      // Old HWT URL patterns → /tools/
      { source: '/health/:slug', destination: '/tools/health/:slug', permanent: true },
      { source: '/finance/:slug', destination: '/tools/finance/:slug', permanent: true },
      { source: '/health', destination: '/tools/health', permanent: true },
      { source: '/finance', destination: '/tools/finance', permanent: true },
      // /blog → /guides (keep old URLs working for SEO)
      { source: '/blog', destination: '/guides', permanent: true },
      { source: '/blog/:slug', destination: '/guides/:slug', permanent: true },
      // /plans → /plan
      { source: '/plans', destination: '/plan', permanent: true },
      { source: '/plans/:slug', destination: '/plan/:slug', permanent: true },
      { source: '/plans/success', destination: '/plan/success', permanent: true },
    ];
  },
};
module.exports = nextConfig;
