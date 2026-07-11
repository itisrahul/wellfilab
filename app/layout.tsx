import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider }    from '@/components/layout/ThemeProvider';
import { CurrencyProvider } from '@/lib/useCurrency';
import { Navbar }        from '@/components/layout/Navbar';
import { ScrollToTop }   from '@/components/ui/ScrollToTop';
import { Footer }        from '@/components/layout/Footer';
import { SITE_NAME, SITE_URL } from '@/config/site';

const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' });
const mono  = JetBrains_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} — Health & Finance Tools and Guides`,
    template: `%s | ${SITE_NAME}`,
  },
  description: '60+ free health and finance calculators in 15 currencies, evidence-based guides, and a personalised Health-Wealth Score — free for everyone, everywhere.',
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/icon.svg',        type: 'image/svg+xml'                          },
      { url: '/favicon.ico',     sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/favicon-192.png', sizes: '192x192',            type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512',            type: 'image/png' },
    ],
    apple: '/favicon-192.png',
    shortcut: '/icon.svg',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/favicon-512.png`,
  };
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/favicon-192.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CurrencyProvider>
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <ScrollToTop />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
      {/* Google Analytics GA4 */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_path: window.location.pathname,
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      )}
      {/* Google AdSense */}
      {process.env.NEXT_PUBLIC_ADSENSE_PUB_ID && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </html>
  );
}
