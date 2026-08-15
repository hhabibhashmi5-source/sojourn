'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth, displayName } from './AuthProvider';
import { useModal } from './ModalProvider';

const NAV = [
  { href: '/destinations', label: 'Destinations' },
  { href: '/journal', label: 'Journal' },
  { href: '/itinerary', label: 'AI Itinerary' },
  { href: '/#personas', label: 'Experiences' },
  { href: '/advisory', label: 'Advisory' },
  { modal: 'auth', label: 'Membership' },
];

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { openModal } = useModal();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Home has a transparent header over its hero; every other page is solid.
  const solid = pathname !== '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const isActive = (href) => href && pathname === href;

  const renderNavLink = (item, cls) =>
    item.modal ? (
      <a key={item.label} className={cls} href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); openModal(item.modal); }}>{item.label}</a>
    ) : (
      <Link key={item.label} className={`${cls}${isActive(item.href) ? ' is-active' : ''}`} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>
    );

  return (
    <>
      <header className={`header${solid ? ' header--solid' : ''}${scrolled ? ' is-scrolled' : ''}`} id="header">
        <div className="header__inner container">
          <Link className="brand" href="/" aria-label="Sojourn home">
            <span className="brand__mark">S</span><span className="brand__name">Sojourn</span>
          </Link>
          <nav className="nav" aria-label="Primary">
            {NAV.map((item) => renderNavLink(item, 'nav__link'))}
          </nav>
          <div className="header__actions">
            {user ? (
              <>
                <Link className="header__signin" href="/dashboard" title="Your dashboard">{displayName(user)}</Link>
                <button className="header__signout" type="button" onClick={signOut}>Sign Out</button>
              </>
            ) : (
              <button className="header__signin" type="button" onClick={() => openModal('auth')}>Sign In</button>
            )}
            <Link className="btn btn--solid btn--sm" href="/booking">Plan Your Journey</Link>
            <button className="nav-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobileMenu" onClick={() => setMenuOpen((v) => !v)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      <div className="mobile-menu" id="mobileMenu" aria-hidden={!menuOpen}>
        <nav className="mobile-menu__nav" aria-label="Mobile">
          {NAV.map((item) => renderNavLink(item, 'mobile-menu__link'))}
        </nav>
        <div className="mobile-menu__foot">
          <Link className="btn btn--solid" href="/booking" onClick={() => setMenuOpen(false)}>Plan Your Journey</Link>
          {user ? (
            <button className="mobile-menu__signin" type="button" onClick={() => { setMenuOpen(false); signOut(); }}>Sign Out</button>
          ) : (
            <button className="mobile-menu__signin" type="button" onClick={() => { setMenuOpen(false); openModal('auth'); }}>Sign In</button>
          )}
        </div>
      </div>
    </>
  );
}
