/**
 * StructuredData — adds JSON-LD schema markup for SEO.
 * Use on calculator pages to get rich results in Google.
 */
export function StructuredData({ slug, title, desc, url }: {
  slug: string; title: string; desc: string; url: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title,
    "description": desc,
    "url": url,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "Web Browser",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "featureList": desc,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
