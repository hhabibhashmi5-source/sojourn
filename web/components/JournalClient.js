'use client';
import { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES, featured, posts } from '@/lib/journal';
import PostCard from './PostCard';

export default function JournalClient() {
  const [filter, setFilter] = useState('all');
  const chips = ['all', ...CATEGORIES];
  const shown = filter === 'all' ? posts : posts.filter((p) => p.cat === filter);

  return (
    <main id="main">
      <section className="page-hero page-hero--cream">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span>Journal</nav>
          <p className="overline">The Journal</p>
          <h1 className="page-hero__title">Considered reading</h1>
          <p className="page-hero__sub">Essays on travelling slowly and deeply — written for people who would rather understand a place than tick it off.</p>
          <div className="chips" aria-label="Filter articles by theme">
            {chips.map((c) => (
              <button key={c} className={`chip${filter === c ? ' is-active' : ''}`} type="button" onClick={() => setFilter(c)}>
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="journal-page section">
        <div className="container">
          {/* Featured (always shown) */}
          <article className="featured reveal">
            <Link className="featured__media" href={featured.href}><img loading="lazy" decoding="async" src={featured.img.src} alt={featured.img.alt} /></Link>
            <div>
              <p className="featured__meta"><span>{featured.cat}</span> &middot; {featured.badge} &middot; {featured.read}</p>
              <h2 className="featured__title"><Link href={featured.href}>{featured.title}</Link></h2>
              <p className="featured__excerpt">{featured.excerpt}</p>
              <Link className="link-arrow" href={featured.href}>Read the essay <span aria-hidden="true">&rarr;</span></Link>
            </div>
          </article>

          <div className="section-head reveal" style={{ marginTop: '1rem' }}><div><p className="overline">Latest</p><h2 className="section-title">From the desk</h2></div></div>
          <div className="journal-grid">
            {shown.map((p) => <PostCard key={p.title} p={p} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
