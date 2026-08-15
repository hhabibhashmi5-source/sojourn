import './styles.css';
import './pages.css';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { AuthProvider } from '@/components/AuthProvider';
import { ModalProvider } from '@/components/ModalProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SiteEffects from '@/components/SiteEffects';
import Announce from '@/components/Announce';
import { asset } from '@/lib/paths';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});
const body = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const SITE = 'https://hhabibhashmi5-source.github.io/sojourn';
const DESC =
  'A quiet-luxury travel journal and bespoke-advisory house. Fewer places, known deeply — private islands, cliffside coasts, alpine retreats and cultural capitals.';

export const metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Sojourn — The Art of Quiet Luxury Travel', template: '%s — Sojourn' },
  description: DESC,
  applicationName: 'Sojourn',
  authors: [{ name: 'Sojourn' }],
  manifest: asset('/manifest.webmanifest'),
  icons: { icon: [{ url: asset('/assets/favicon.svg'), type: 'image/svg+xml' }] },
  openGraph: { type: 'website', siteName: 'Sojourn', locale: 'en_US', url: SITE, title: 'Sojourn — The Art of Quiet Luxury Travel', description: DESC },
  twitter: { card: 'summary_large_image', title: 'Sojourn — The Art of Quiet Luxury Travel', description: DESC },
};

export const viewport = { themeColor: '#1C1A17' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <AuthProvider>
          <ModalProvider>
            <Announce />
            <Header />
            {children}
            <Footer />
            <SiteEffects />
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
