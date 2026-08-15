import JournalClient from '@/components/JournalClient';

const DESC =
  'Considered, long-form travel writing on quiet luxury — slow travel, conscious luxury, wellness, design and the culture of going deeper.';

export const metadata = {
  title: 'The Journal',
  description: DESC,
  alternates: { canonical: '/journal' },
  openGraph: { url: '/journal', title: 'The Journal — Sojourn', description: DESC, type: 'website' },
  twitter: { title: 'The Journal — Sojourn', description: DESC },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'The Journal — Sojourn',
  description: DESC,
  url: 'https://hhabibhashmi5-source.github.io/sojourn/journal',
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <JournalClient />
    </>
  );
}
