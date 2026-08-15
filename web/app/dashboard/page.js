import Link from 'next/link';
import './dashboard.css';
import DashboardClient from '@/components/DashboardClient';

export const metadata = {
  title: 'Your Sojourn — Member Dashboard',
  description: 'Your Sojourn member dashboard — your requests, saved trips and profile.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/dashboard' },
};

export default function Page() {
  return (
    <main id="main">
      <section className="page-hero page-hero--cream">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span>Your Dashboard</nav>
          <p className="overline">Members</p>
          <h1 className="page-hero__title">Your Sojourn</h1>
          <p className="page-hero__sub">Your requests, saved trips and profile — all in one quiet place.</p>
        </div>
      </section>
      <DashboardClient />
    </main>
  );
}
