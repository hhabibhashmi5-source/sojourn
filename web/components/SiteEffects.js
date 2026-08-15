'use client';
// Global progressive-enhancement effects, ported from vanilla main.js:
// scroll-reveal, animated stat counters, and deferred hero background images.
// Re-runs on every route change so freshly-rendered pages animate correctly.
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SiteEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups = [];

    // Run after paint so the new page's DOM exists.
    const raf = requestAnimationFrame(() => {
      // --- Deferred background images ---
      document.querySelectorAll('[data-bg]').forEach((el) => {
        if (el.dataset._bgDone) return;
        el.dataset._bgDone = '1';
        const url = el.getAttribute('data-bg');
        if (!url) return;
        const img = new Image();
        img.onload = () => { el.style.backgroundImage = `url("${url}")`; el.classList.add('is-loaded'); };
        img.onerror = () => el.classList.add('bg-failed');
        img.src = url;
      });

      // --- Reveal on scroll ---
      const revealEls = document.querySelectorAll('.reveal:not(.is-visible)');
      if (prefersReduced || !('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('is-visible'));
      } else {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
          });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach((el) => io.observe(el));
        cleanups.push(() => io.disconnect());
      }

      // --- Animated stat counters ---
      const counters = document.querySelectorAll('.stat__num[data-count]');
      if ('IntersectionObserver' in window && counters.length) {
        const runCount = (el) => {
          const target = parseInt(el.getAttribute('data-count'), 10) || 0;
          if (prefersReduced) { el.textContent = String(target); return; }
          const duration = 1500; let start = null;
          const step = (ts) => {
            if (start === null) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        };
        const cio = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => { if (entry.isIntersecting) { runCount(entry.target); obs.unobserve(entry.target); } });
        }, { threshold: 0.6 });
        counters.forEach((c) => cio.observe(c));
        cleanups.push(() => cio.disconnect());
      }
    });

    return () => { cancelAnimationFrame(raf); cleanups.forEach((fn) => fn()); };
  }, [pathname]);

  return null;
}
