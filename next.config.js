/** @type {import('next').NextConfig} */
const nextConfig = {
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
