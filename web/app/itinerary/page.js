import Link from 'next/link';
import './itinerary.css';
import ItineraryClient from '@/components/ItineraryClient';

const DESC =
  "Tell Sojourn's advisor where and how you like to travel, and receive a considered day-by-day luxury itinerary in moments — crafted by AI, refined by taste.";

export const metadata = {
  title: 'AI Itinerary',
  description: DESC,
  alternates: { canonical: '/itinerary' },
  openGraph: { url: '/itinerary', title: 'AI Itinerary — Sojourn', description: DESC, type: 'website' },
  twitter: { title: 'AI Itinerary — Sojourn', description: DESC },
};

export default function Page() {
  return (
    <main id="main">
      <section className="page-hero page-hero--cream">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span>AI Itinerary</nav>
          <p className="overline">Composed by AI, refined by taste</p>
          <h1 className="page-hero__title">Your itinerary, in moments</h1>
          <p className="page-hero__sub">Tell our advisor where and how you like to travel. A considered day-by-day plan appears in seconds — a starting point your Sojourn advisor can perfect.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <ItineraryClient />
          <p className="itin-disclaimer">Itineraries are AI-generated suggestions to inspire your planning — details, openings and prices should be confirmed. For a fully arranged, human-perfected journey, <Link href="/booking">speak with a Sojourn advisor</Link>.</p>
        </div>
      </section>
    </main>
  );
}
