import './admin.css';
import AdminClient from '@/components/AdminClient';

export const metadata = {
  title: 'Advisor Desk',
  description: 'Private advisor desk for Sojourn inquiries and subscribers.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/admin' },
};

export default function Page() {
  return (
    <main id="main">
      <AdminClient />
    </main>
  );
}
