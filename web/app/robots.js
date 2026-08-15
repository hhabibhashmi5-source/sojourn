const SITE = 'https://hhabibhashmi5-source.github.io/sojourn';

export const dynamic = 'force-static';

export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin/', '/dashboard/'] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
