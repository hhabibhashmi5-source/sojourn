import Link from 'next/link';
import { U, destinations } from '@/lib/data';
import DestinationCard from './DestinationCard';
import EnquireButton from './EnquireButton';

// Full destination page, ported from the vanilla generator (build-destinations.js).
export default function DestinationDetail({ d }) {
  const others = destinations.filter((o) => o.slug !== d.slug).slice(0, 3);

  return (
    <main id="main">
      {/* Hero */}
      <section className="dest-hero">
        <div className="dest-hero__media" data-bg={U(d.hero.id, 2000)} role="img" aria-label={d.hero.alt}></div>
        <div className="dest-hero__inner container">
          <p className="overline overline--light reveal">{d.overline}</p>
          <h1 className="dest-hero__title reveal">{d.title}</h1>
          <p className="dest-hero__loc reveal">{d.loc}</p>
        </div>
      </section>

      {/* Intro */}
      <section className="dest-intro section">
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span>/</span><Link href="/destinations">Destinations</Link><span>/</span>{d.name}
          </nav>
          <div className="dest-intro__grid">
            <div className="reveal">
              <p className="dest-intro__lead">{d.lead}</p>
              <div className="dest-intro__body">
                {d.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
            <aside className="facts reveal" aria-label="Destination facts">
              {d.facts.map(([k, v]) => (
                <div className="facts__row" key={k}><span className="facts__key">{k}</span><span className="facts__val">{v}</span></div>
              ))}
            </aside>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="highlights section">
        <div className="container">
          <div className="section-head reveal"><div><p className="overline">Why we send you here</p><h2 className="section-title">The quiet particulars</h2></div></div>
          <div className="highlight-grid">
            {d.highlights.map(([t, x], i) => (
              <div className="highlight reveal" key={t}><span className="highlight__num">0{i + 1}</span><h3 className="highlight__title">{t}</h3><p className="highlight__text">{x}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="gallery section">
        <div className="container">
          <div className="section-head reveal"><div><p className="overline">In pictures</p><h2 className="section-title">A sense of the place</h2></div></div>
          <div className="gallery__grid reveal">
            {d.gallery.map((g, i) => {
              const mod = i === 0 ? ' gallery__item--wide gallery__item--tall' : i === 3 ? ' gallery__item--wide' : '';
              const w = mod ? 1200 : 700;
              return (
                <figure className={`gallery__item${mod}`} key={g.id + i}>
                  <img loading="lazy" decoding="async" src={U(g.id, w)} alt={g.alt} />
                </figure>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stays */}
      <section className="stays section">
        <div className="container">
          <div className="section-head reveal">
            <div><p className="overline">Where you&apos;ll stay</p><h2 className="section-title">Held for our members</h2></div>
            <EnquireButton destination={d.name} className="link-arrow">Enquire on availability <span aria-hidden="true">&rarr;</span></EnquireButton>
          </div>
          <div className="stay-grid">
            {d.stays.map(([name, desc, price, img]) => (
              <article className="stay reveal" key={name}>
                <div className="stay__media"><img loading="lazy" decoding="async" src={U(img.id, 800)} alt={img.alt} /></div>
                <div className="stay__body">
                  <h3 className="stay__name">{name}</h3><p className="stay__desc">{desc}</p>
                  <div className="stay__foot">
                    <span className="stay__price" dangerouslySetInnerHTML={{ __html: price }} />
                    <EnquireButton destination={d.name} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="map-band section">
        <div className="container">
          <div className="section-head reveal"><div><p className="overline">Orientation</p><h2 className="section-title">Where in the world</h2></div></div>
          <div className="map-box reveal">
            <div className="map-box__inner">
              <span className="map-box__pin">&#10022;</span>
              <p className="overline">Interactive map</p>
              <p style={{ color: 'var(--taupe)', maxWidth: '34ch' }}>{d.map}</p>
            </div>
          </div>
        </div>
      </section>

      {/* More destinations */}
      <section className="dest-index section">
        <div className="container">
          <div className="section-head reveal">
            <div><p className="overline">Keep looking</p><h2 className="section-title">Other places we know well</h2></div>
            <Link className="link-arrow" href="/destinations">All destinations <span aria-hidden="true">&rarr;</span></Link>
          </div>
          <div className="dest-grid">
            {others.map((o) => <DestinationCard key={o.slug} d={o} level={3} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band section">
        <div className="container container--narrow reveal">
          <p className="overline">Ready when you are</p>
          <h2 className="cta-band__title">{d.ctaTitle}</h2>
          <p className="cta-band__sub">Share your dates and the shape of the trip. An advisor will return a considered proposal within two working days.</p>
          <EnquireButton destination={d.name} className="btn btn--solid">Request a Proposal</EnquireButton>
        </div>
      </section>
    </main>
  );
}
