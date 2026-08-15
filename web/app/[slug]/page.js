import { notFound } from 'next/navigation';
import { destinations, bySlug, U, site } from '@/lib/data';
import DestinationDetail from '@/components/DestinationDetail';

export const dynamicParams = false;

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const d = bySlug(slug);
  if (!d) return {};
  const og = U(d.hero.id, 1200).replace('&w=1200', '&w=1200&h=630');
  return {
    title: d.metaTitle.replace(' — Sojourn Destinations', ''),
    description: d.metaDesc,
    alternates: { canonical: `/${d.slug}` },
    openGraph: { type: 'article', url: `/${d.slug}`, title: d.metaTitle, description: d.metaDesc, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: d.metaTitle, description: d.metaDesc, images: [og] },
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const d = bySlug(slug);
  if (!d) notFound();

  const url = `${site}/${d.slug}`;
  const og = U(d.hero.id, 1200).replace('&w=1200', '&w=1200&h=630');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'TouristDestination', name: d.name, description: d.metaDesc, url, image: og },
      { '@type': 'WebPage', name: d.metaTitle, description: d.metaDesc, url, isPartOf: { '@id': `${site}/#website` } },
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/` },
        { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${site}/destinations` },
        { '@type': 'ListItem', position: 3, name: d.name, item: url },
      ] },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DestinationDetail d={d} />
    </>
  );
}
