import type { MetadataRoute } from 'next';

// Static robots.txt for the docs site. Docs are fully public and indexable, so
// allow all crawlers and point them at the sitemap. Required because the docs
// site previously shipped no robots.txt at all, leaving crawlers to guess.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://docs.sonicsaas.com/sitemap.xml',
  };
}
