import { destinations } from '@/lib/data';

const SITE = 'https://hhabibhashmi5-source.github.io/sojourn';

export const dynamic = 'force-static';

// Public, indexable routes (admin/dashboard are noindex and excluded).
export default function sitemap() {
  const now = new Date();
  const paths = ['', '/destinations', '/journal', '/article', '/itinerary', '/advisory', '/booking', ...destinations.map((d) => `/${d.slug}`)];
  return paths.map((p) => ({
    url: `${SITE}${p}/`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: p === '' ? 1 : p.startsWith('/destinations') || p.startsWith('/journal') ? 0.8 : 0.7,
  }));
}
