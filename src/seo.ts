/**
 * Search and social metadata, generated from the portfolio data at build time
 * (scripts/prerender.mjs). Keeps the <head>, JSON-LD and on-page copy in sync.
 *
 * NDA: nothing here may name a client or an internal system. `npm run build` scans the
 * generated dist/index.html for confidential terms.
 */
import portfolio from './data/portfolio';

const p = portfolio;
const displayName = p.fullName ?? p.name;

function listJoin(items: string[]): string {
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export const seo = {
  url: p.siteUrl,
  title: `${displayName} · ${p.role} in ${p.location.city}`,
  // Kept under ~160 characters so search results show it whole.
  description: `${displayName}, ${p.role.toLowerCase()} in ${p.location.city}. Backend and frontend systems in ${listJoin(p.headlineStack)} for capital markets and financial services.`,
  image: {
    url: `${p.siteUrl}og.png`,
    width: 1200,
    height: 630,
    alt: `${displayName}'s portfolio: a Windows 98 style desktop with a welcome window that reads "${p.name}, ${p.role}".`,
  },
  locale: 'en_US',
  themeColor: '#008080',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** schema.org graph: the site, the profile page, and the person it is about. */
export function structuredData(buildDate: string): object {
  const personId = `${p.siteUrl}#person`;
  const knowsAbout = Array.from(new Set(p.toolkit.flatMap((g) => g.tools)));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${p.siteUrl}#website`,
        url: p.siteUrl,
        name: `${displayName} · Portfolio`,
        inLanguage: 'en',
        publisher: { '@id': personId },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${p.siteUrl}#profile`,
        url: p.siteUrl,
        name: seo.title,
        description: seo.description,
        inLanguage: 'en',
        isPartOf: { '@id': `${p.siteUrl}#website` },
        dateModified: buildDate,
        primaryImageOfPage: { '@type': 'ImageObject', url: seo.image.url, width: seo.image.width, height: seo.image.height },
        mainEntity: { '@id': personId },
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: displayName,
        ...(p.fullName ? { alternateName: [p.name, p.handle] } : { alternateName: p.handle }),
        jobTitle: p.role,
        description: `${p.role} in ${p.location.city}, building backend and frontend systems for clients in capital markets and financial services.`,
        url: p.siteUrl,
        email: `mailto:${p.contact.email}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: p.location.city,
          addressCountry: p.location.countryCode,
        },
        knowsAbout,
        sameAs: [p.contact.github, p.contact.linkedin],
      },
    ],
  };
}

/** Tags injected into <head>, replacing the `<!--seo-->` placeholder in index.html. */
export function headTags(buildDate: string): string {
  const { title, description, url, image, locale } = seo;
  // `<` is escaped so the JSON can never close the script element.
  const json = JSON.stringify(structuredData(buildDate)).replace(/</g, '\\u003c');
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="author" content="${esc(displayName)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:site_name" content="${esc(displayName)} · Portfolio" />`,
    `<meta property="og:locale" content="${locale}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${image.url}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="${image.width}" />`,
    `<meta property="og:image:height" content="${image.height}" />`,
    `<meta property="og:image:alt" content="${esc(image.alt)}" />`,
    `<meta property="profile:username" content="${p.handle}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${image.url}" />`,
    `<meta name="twitter:image:alt" content="${esc(image.alt)}" />`,
    `<script type="application/ld+json">${json}</script>`,
  ].join('\n    ');
}
