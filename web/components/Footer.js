'use client';
import Link from 'next/link';
import { useModal } from './ModalProvider';

export default function Footer() {
  const { openModal } = useModal();
  const year = 2026; // build-time year; bump on rebuild

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Link className="brand brand--light" href="/" aria-label="Sojourn home"><span className="brand__mark">S</span><span className="brand__name">Sojourn</span></Link>
          <p className="footer__tagline">The art of quiet luxury travel. Fewer places, known deeply.</p>
        </div>
        <nav className="footer__col" aria-label="Explore">
          <h4 className="footer__heading">Explore</h4>
          <Link href="/destinations">Destinations</Link><Link href="/journal">Journal</Link>
          <Link href="/#personas">Experiences</Link><Link href="/advisory">Advisory</Link>
        </nav>
        <nav className="footer__col" aria-label="House">
          <h4 className="footer__heading">The House</h4>
          <a href="#" onClick={(e) => { e.preventDefault(); openModal('auth'); }}>Membership</a>
          <a href="#" onClick={(e) => { e.preventDefault(); openModal('inquiry'); }}>Concierge</a>
          <a href="#">About</a><a href="#">Contact</a>
        </nav>
        <nav className="footer__col" aria-label="Legal">
          <h4 className="footer__heading">Legal</h4>
          <a href="#">Privacy</a><a href="#">Terms</a><a href="#">Sustainability</a>
        </nav>
        <div className="footer__col footer__social">
          <h4 className="footer__heading">Follow</h4>
          <a href="#">Instagram</a><a href="#">Pinterest</a><a href="#">Newsletter</a>
        </div>
      </div>
      <div className="container footer__bar">
        <p>&copy; <span>{year}</span> Sojourn. All rights reserved.</p>
        <p className="footer__made">Composed quietly, for the discerning traveler.</p>
      </div>
    </footer>
  );
}
