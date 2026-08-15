import Link from 'next/link';
import { U } from '@/lib/data';
import NewsletterForm from '@/components/NewsletterForm';

const DESC =
  "Sojourn is a members' house for quiet luxury travel — curated escapes, long-form editorial, and bespoke advisory for journeys distilled to what matters.";
const HERO = U('photo-1507525428034-b723cf961d3e', 2000);
const OG = U('photo-1507525428034-b723cf961d3e', 1200).replace('&w=1200', '&w=1200&h=630');

export const metadata = {
  title: 'Sojourn — The Art of Quiet Luxury Travel',
  description: DESC,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', url: '/', title: 'Sojourn — The Art of Quiet Luxury Travel', description: DESC, images: [{ url: OG, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'Sojourn — The Art of Quiet Luxury Travel', description: DESC, images: [OG] },
};

const SITE = 'https://hhabibhashmi5-source.github.io/sojourn/';
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'TravelAgency', '@id': `${SITE}#org`, name: 'Sojourn', url: SITE, logo: `${SITE}assets/favicon.svg`, description: "A members' house for quiet luxury travel — curated escapes, editorial and bespoke advisory.", sameAs: ['https://instagram.com/', 'https://pinterest.com/'] },
    { '@type': 'WebSite', '@id': `${SITE}#website`, url: SITE, name: 'Sojourn', publisher: { '@id': `${SITE}#org` } },
  ],
};

const FEATURED = [
  { slug: 'maldives', label: 'Maldives · Private Islands', title: 'Overwater seclusion, redrawn', desc: 'Whole-island buyouts and butler-served villas where the only itinerary is the tide.', img: U('photo-1573843981267-be1999ff37cd', 1200), alt: 'Overwater villas above a turquoise Maldivian lagoon.', feature: true },
  { slug: 'swiss-alps', label: 'Swiss Alps · Wellness', title: 'Alpine restoration', desc: 'Low-density chalets and clinical spa programmes at altitude.', img: U('photo-1527668752968-14dc70a27c95', 900), alt: 'Snow-dusted alpine peaks above a green Swiss valley and lake.' },
  { slug: 'amalfi-coast', label: 'Amalfi · Cliffside Villas', title: 'A coast, privately held', desc: 'Staffed villas and lemon-grove terraces above the tourist tide.', img: U('photo-1612698093158-e07ac200d44e', 900), alt: 'Pastel houses stacked on the cliffs of the Amalfi Coast.' },
  { slug: 'kyoto', label: 'Kyoto · Cultural Immersion', title: 'Ritual and quiet', desc: 'Private ryokan stays, tea masters, and mornings before the crowds.', img: U('photo-1493976040374-85c8e12f0c0e', 900), alt: 'A pagoda at the end of a quiet Kyoto lane at first light.' },
];

const PERSONAS = [
  { num: '01', title: 'The Wellness Seeker', desc: 'Restorative retreats, low-density destinations, and slow-travel itineraries built around rest, not reach.', cta: 'Wellness journeys' },
  { num: '02', title: 'The Cultural Explorer', desc: 'Depth over breadth — private guides, cooking with locals, and access that never feels arranged.', cta: 'Immersive travel' },
  { num: '03', title: 'The Multi-Gen Planner', desc: 'Spacious private villas and seamless logistics for the whole family, quietly handled end to end.', cta: 'Family escapes' },
];

const HOME_POSTS = [
  { cat: 'Slow Travel', read: '6 min read', title: 'Shoulder season is the new peak', excerpt: 'Why the discerning are trading July crowds for the softer light and open tables of the in-between months.', img: U('photo-1470071459604-3b5ec3a7fe05', 800), alt: 'Mist drifting through a forested mountain valley.' },
  { cat: 'Conscious Luxury', read: '8 min read', title: 'The quiet case for conscious luxury', excerpt: 'Sustainability has become the ultimate status symbol. We look at what it actually asks of the traveler.', img: U('photo-1441974231531-c6227db76b6e', 800), alt: 'Sunlight falling through an old forest.' },
  { cat: 'Design', read: '5 min read', title: 'Rooms that ask nothing of you', excerpt: 'On the rise of the un-designed suite — and why true luxury increasingly means restraint.', img: U('photo-1512918728675-ed5a9ecdebfd', 800), alt: 'A restrained, light-filled bedroom in warm daylight.' },
];

const STATS = [
  ['42', 'Private destinations'],
  ['24', 'Hour concierge, always'],
  ['360', 'Trusted local partners'],
  ['15', 'Years of quiet planning'],
];

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <link rel="preload" as="image" fetchPriority="high" href={HERO} />
      <main id="main">
        {/* Hero */}
        <section className="hero" id="hero">
          <div className="hero__media" data-bg={HERO}></div>
          <div className="hero__overlay"></div>
          <div className="hero__content container">
            <p className="overline overline--light reveal">Quiet Luxury · Est. 2026</p>
            <h1 className="hero__title reveal">Travel, distilled<br />to what matters.</h1>
            <p className="hero__lead lead reveal">A members&apos; house for the discerning traveler — curated escapes, considered editorial, and advisory that turns inspiration into an itinerary worth living.</p>
            <div className="hero__actions reveal">
              <Link className="btn btn--solid" href="/destinations">Explore Destinations</Link>
              <Link className="btn btn--ghost" href="/journal">Read the Journal</Link>
            </div>
          </div>
          <a className="hero__scroll" href="#manifesto" aria-label="Scroll to content"><span className="hero__scroll-line"></span></a>
        </section>

        {/* Manifesto */}
        <section className="manifesto section" id="manifesto">
          <div className="container container--narrow reveal">
            <p className="overline">Our Philosophy</p>
            <blockquote className="manifesto__quote">In 2026, luxury is no longer the most glamorous address or the most opulent suite — it is the <em>meaningful, the mindful, and the culturally rich.</em></blockquote>
            <div className="rule"></div>
            <p className="manifesto__body">We plan slowly and travel lightly. Fewer places, known deeply. Privacy over spectacle, presence over pace. This is the quiet luxury we compose for our members.</p>
          </div>
        </section>

        {/* Destinations */}
        <section className="destinations section" id="destinations">
          <div className="container">
            <div className="section-head reveal">
              <div><p className="overline">Curated Escapes</p><h2 className="section-title">Places worth the distance</h2></div>
              <Link className="link-arrow" href="/destinations">View all destinations <span aria-hidden="true">&rarr;</span></Link>
            </div>
            <div className="dest-grid">
              {FEATURED.map((d) => (
                <article className={`dest-card${d.feature ? ' dest-card--feature' : ''} reveal`} key={d.slug}>
                  <Link className="dest-card__link" href={`/${d.slug}`}>
                    <div className="dest-card__media">
                      <img loading="lazy" decoding="async" width={d.feature ? 1200 : 900} height={d.feature ? 1500 : 1100} src={d.img} alt={d.alt} />
                    </div>
                    <div className="dest-card__body">
                      <p className="overline overline--light">{d.label}</p>
                      <h3 className="dest-card__title">{d.title}</h3>
                      <p className="dest-card__desc">{d.desc}</p>
                      <span className="dest-card__cta">Discover <span aria-hidden="true">&rarr;</span></span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Personas */}
        <section className="personas section" id="personas">
          <div className="container">
            <div className="section-head section-head--center reveal"><p className="overline">Travel Your Way</p><h2 className="section-title">Composed around who you are</h2></div>
            <div className="persona-grid">
              {PERSONAS.map((p) => (
                <article className="persona reveal" key={p.num}>
                  <span className="persona__num">{p.num}</span>
                  <h3 className="persona__title">{p.title}</h3>
                  <p className="persona__desc">{p.desc}</p>
                  <a className="link-arrow" href="#">{p.cta} <span aria-hidden="true">&rarr;</span></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Journal preview */}
        <section className="journal section" id="journal">
          <div className="container">
            <div className="section-head reveal">
              <div><p className="overline">From the Journal</p><h2 className="section-title">Considered reading</h2></div>
              <Link className="link-arrow" href="/journal">All essays <span aria-hidden="true">&rarr;</span></Link>
            </div>
            <div className="journal-grid">
              {HOME_POSTS.map((p) => (
                <article className="post reveal" key={p.title}>
                  <Link className="post__link" href="/article">
                    <div className="post__media"><img loading="lazy" decoding="async" width="800" height="600" src={p.img} alt={p.alt} /></div>
                    <div className="post__body">
                      <p className="post__meta"><span>{p.cat}</span> &middot; {p.read}</p>
                      <h3 className="post__title">{p.title}</h3>
                      <p className="post__excerpt">{p.excerpt}</p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Advisory band */}
        <section className="advisory" id="advisory">
          <div className="advisory__media" data-bg={U('photo-1590490360182-c33d57733427', 1600)}></div>
          <div className="advisory__inner container">
            <div className="advisory__panel reveal">
              <p className="overline">Bespoke Advisory</p>
              <h2 className="advisory__title">Your journey, personally composed</h2>
              <p className="advisory__body">Every Sojourn member is paired with a dedicated advisor — a single point of contact with a black book most travelers never see. From a one-off itinerary review to full concierge, we plan the trip so you can simply arrive.</p>
              <ul className="advisory__list">
                <li>Dedicated travel advisor &amp; 24/7 concierge</li>
                <li>Access to villa, aviation &amp; residence partners</li>
                <li>Collaborative, mobile-first itinerary builder</li>
              </ul>
              <Link className="btn btn--solid" href="/advisory">Discover Advisory</Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="stats section">
          <div className="container stats__grid">
            {STATS.map(([num, label]) => (
              <div className="stat reveal" key={label}>
                <span className="stat__num" data-count={num}>{num}</span>
                <span className="stat__label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Membership / Newsletter */}
        <section className="membership section" id="membership">
          <div className="container container--narrow membership__inner reveal">
            <p className="overline">The Quiet List</p>
            <h2 className="membership__title">Join a smaller way to travel</h2>
            <p className="membership__body">Members receive our editorial, early booking windows, and invitations held back from the public. No noise — a few considered notes a season.</p>
            <NewsletterForm />
          </div>
        </section>
      </main>
    </>
  );
}
