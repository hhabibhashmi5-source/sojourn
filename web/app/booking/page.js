import { Suspense } from 'react';
import Link from 'next/link';
import BookingWizard from '@/components/BookingWizard';

const DESC =
  'Start your bespoke Sojourn journey. Share where, when and how you like to travel — an advisor returns a considered proposal within two working days.';

export const metadata = {
  title: 'Plan Your Journey',
  description: DESC,
  alternates: { canonical: '/booking' },
  openGraph: { url: '/booking', title: 'Plan Your Journey — Sojourn', description: DESC, type: 'website' },
  twitter: { title: 'Plan Your Journey — Sojourn', description: DESC },
};

export default function Page() {
  return (
    <main id="main">
      <section className="page-hero page-hero--cream">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span>Plan Your Journey</nav>
          <p className="overline">Begin</p>
          <h1 className="page-hero__title">Plan your journey</h1>
          <p className="page-hero__sub">A few quiet questions. No payment now — just the beginning of a proposal, returned by your advisor within two working days.</p>
        </div>
      </section>
      <section className="booking section">
        <div className="container">
          <Suspense fallback={<div className="container" style={{ minHeight: '40vh' }} />}>
            <BookingWizard />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
