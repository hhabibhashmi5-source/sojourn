'use client';
import { useState } from 'react';
import Link from 'next/link';
import { destinations, REGIONS } from '@/lib/data';
import DestinationCard from './DestinationCard';
import { useModal } from './ModalProvider';

// The region filter is now pure React state: only matching cards are rendered,
// so the old "filtered-in card stays invisible" bug is structurally impossible.
export default function DestinationsClient() {
  const { openModal } = useModal();
  const [filter, setFilter] = useState('all');
  const chips = ['all', ...REGIONS];
  const shown = filter === 'all' ? destinations : destinations.filter((d) => d.region === filter);

  return (
    <main id="main">
      <section className="page-hero page-hero--cream">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span>/</span>Destinations
          </nav>
          <p className="overline">The Atlas</p>
          <h1 className="page-hero__title">A world, quietly narrowed</h1>
          <p className="page-hero__sub">We keep a small book of places — each chosen for privacy, depth and a certain stillness. Fewer destinations, known well.</p>
          <div className="chips" role="tablist" aria-label="Filter destinations by region">
            {chips.map((c) => (
              <button
                key={c}
                className={`chip${filter === c ? ' is-active' : ''}`}
                onClick={() => setFilter(c)}
                type="button"
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="dest-index section">
        <div className="container">
          <div className="dest-grid dest-grid--index">
            {shown.map((d) => <DestinationCard key={d.slug} d={d} />)}
          </div>
        </div>
      </section>

      <section className="cta-band section">
        <div className="container container--narrow reveal">
          <p className="overline">Not sure where to begin?</p>
          <h2 className="cta-band__title">Let us narrow the world for you</h2>
          <p className="cta-band__sub">Tell an advisor how you like to travel and we&apos;ll compose a shortlist — quietly, and with no obligation.</p>
          <button className="btn btn--solid" type="button" onClick={() => openModal('inquiry')}>Speak with an Advisor</button>
        </div>
      </section>
    </main>
  );
}
