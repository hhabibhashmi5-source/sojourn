import DestinationsClient from '@/components/DestinationsClient';

const DESC =
  'A curated atlas of quiet-luxury destinations — private islands, cliffside coasts, alpine retreats and cultural capitals, chosen for depth over spectacle.';

export const metadata = {
  title: 'Destinations',
  description: DESC,
  alternates: { canonical: '/destinations' },
  openGraph: { url: '/destinations', title: 'Destinations — Sojourn', description: DESC, type: 'website' },
  twitter: { title: 'Destinations — Sojourn', description: DESC },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Destinations — Sojourn',
  description: DESC,
  url: 'https://hhabibhashmi5-source.github.io/sojourn/destinations',
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DestinationsClient />
    </>
  );
}
