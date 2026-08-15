import Link from 'next/link';
import { U } from '@/lib/data';

const DESC =
  "Sojourn's bespoke travel advisory: a dedicated advisor, a black book most travelers never see, and journeys planned so you can simply arrive.";

export const metadata = {
  title: 'Advisory',
  description: DESC,
  alternates: { canonical: '/advisory' },
  openGraph: { url: '/advisory', title: 'Advisory — Sojourn', description: DESC, type: 'website' },
  twitter: { title: 'Advisory — Sojourn', description: DESC },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Advisory — Sojourn',
  description: DESC,
  url: 'https://hhabibhashmi5-source.github.io/sojourn/advisory',
};

const STEPS = [
  ['01', 'Introduction', 'A relaxed call to understand how you travel — pace, taste, the non-negotiables and the quiet wishes.'],
  ['02', 'The brief', 'We turn the conversation into a considered brief: where, when, with whom, and to what end.'],
  ['03', 'The proposal', "A single elegant itinerary — options where they matter, decisions made where they don't."],
  ['04', 'On the ground', 'Everything booked, briefed and watched over. Your concierge is a message away, day or night.'],
];

const ADVISORS = [
  { img: U('photo-1494790108377-be9c29b29330', 440), name: 'Camille Ardent', role: 'Head of Advisory · Mediterranean', bio: 'Fifteen years placing families along the coasts of Italy, Greece and the South of France.', alt: 'Portrait of advisor Camille Ardent.' },
  { img: U('photo-1507003211169-0a1dd7228f2d', 440), name: 'Idris Vale', role: 'Wellness & Asia', bio: 'A former hotelier in Kyoto and the Maldives, now composing restorative, slow-paced journeys.', alt: 'Portrait of advisor Idris Vale.' },
  { img: U('photo-1573497019940-1c28c88b4f3e', 440), name: 'Noor Haddad', role: 'Culture & Expeditions', bio: 'Builds immersive, guide-led trips through Morocco, the Levant and beyond the map.', alt: 'Portrait of advisor Noor Haddad.' },
];

const TESTI = [
  ['"We didn\'t lift a finger, and nothing was left to chance. It was the first holiday I\'ve actually rested on."', '— A. & M., London'],
  ['"They found us an island I still can\'t find online. That is the whole point, I suppose."', '— The R. Family, Singapore'],
  ['"One text at midnight and a new plan appeared before breakfast. Worth every penny."', '— J.K., New York'],
];

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main id="main">
        <section className="dest-hero">
          <div className="dest-hero__media" data-bg={U('photo-1590490360182-c33d57733427', 2000)}></div>
          <div className="dest-hero__inner container">
            <p className="overline overline--light reveal">Bespoke Advisory</p>
            <h1 className="dest-hero__title reveal">Planned so you<br />can simply arrive</h1>
            <p className="dest-hero__loc reveal">A dedicated advisor, a black book most travelers never see, and none of the machinery in between.</p>
          </div>
        </section>

        <section className="dest-intro section">
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span>Advisory</nav>
            <div className="dest-intro__grid">
              <div className="reveal">
                <p className="dest-intro__lead">The best trips feel effortless. That effortlessness is a great deal of quiet work — done by someone else, before you ever pack a bag.</p>
                <div className="dest-intro__body">
                  <p>Every Sojourn member is paired with a single advisor who learns how you like to travel and remembers it — the airline you prefer, the pace that suits you, the things you would rather never see. Behind them sits a network built over fifteen years: villa owners, general managers, private guides and fixers who answer our calls.</p>
                  <p>We are not a booking site with a chat window. We are the person who knows which villa has the quiet wing, which chef will cook off-menu, and which week the coast belongs to no one. You tell us the shape of the trip. We compose the rest.</p>
                </div>
              </div>
              <aside className="facts reveal" aria-label="At a glance">
                <div className="facts__row"><span className="facts__key">Response</span><span className="facts__val">Within 24 hours</span></div>
                <div className="facts__row"><span className="facts__key">Advisor</span><span className="facts__val">One dedicated, named</span></div>
                <div className="facts__row"><span className="facts__key">Concierge</span><span className="facts__val">24 / 7 in-trip</span></div>
                <div className="facts__row"><span className="facts__key">Network</span><span className="facts__val">360+ partners</span></div>
                <div className="facts__row"><span className="facts__key">Planning from</span><span className="facts__val">$500 one-off</span></div>
              </aside>
            </div>
          </div>
        </section>

        <section className="steps section">
          <div className="container">
            <div className="section-head section-head--center reveal"><p className="overline">How it works</p><h2 className="section-title">Four unhurried steps</h2></div>
            <div className="step-grid">
              {STEPS.map(([num, title, text]) => (
                <div className="highlight reveal" key={num}><span className="highlight__num">{num}</span><h3 className="highlight__title">{title}</h3><p className="highlight__text">{text}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section className="tiers section">
          <div className="container">
            <div className="section-head section-head--center reveal"><p className="overline">Ways to work with us</p><h2 className="section-title">Choose your level of care</h2></div>
            <div className="tier-grid">
              <article className="tier reveal">
                <h3 className="tier__name">Itinerary Review</h3>
                <p className="tier__price">from <b>$500</b> one-off</p>
                <p className="tier__desc">For those who love to plan, but want expert eyes before they commit.</p>
                <ul className="tier__list"><li>Review of your draft plan</li><li>Honest edits &amp; upgrades</li><li>Two rounds of revisions</li><li>Curated little-known additions</li></ul>
                <Link className="btn btn--ghost-dark" href="/booking?type=advisory&tier=review">Start a Review</Link>
              </article>
              <article className="tier tier--featured reveal">
                <span className="tier__badge">Most chosen</span>
                <h3 className="tier__name">Journey Design</h3>
                <p className="tier__price">from <b>$2,500</b> per trip</p>
                <p className="tier__desc">A trip composed end to end, every booking handled by your advisor.</p>
                <ul className="tier__list"><li>Dedicated advisor</li><li>Full bespoke itinerary</li><li>All bookings &amp; logistics</li><li>24/7 in-trip concierge</li><li>Elegant mobile itinerary</li></ul>
                <Link className="btn btn--solid" href="/booking?type=booking&tier=design">Design My Journey</Link>
              </article>
              <article className="tier reveal">
                <h3 className="tier__name">Full Concierge</h3>
                <p className="tier__price"><b>On request</b> · annual</p>
                <p className="tier__desc">A year-round relationship for those who travel often and quietly.</p>
                <ul className="tier__list"><li>Everything in Journey Design</li><li>Unlimited trips per year</li><li>Black-book &amp; early access</li><li>Priority everything</li><li>Lifestyle requests beyond travel</li></ul>
                <Link className="btn btn--ghost-dark" href="/booking?type=advisory&tier=concierge">Enquire</Link>
              </article>
            </div>
          </div>
        </section>

        <section className="advisors section">
          <div className="container">
            <div className="section-head section-head--center reveal"><p className="overline">The people</p><h2 className="section-title">Meet a few of our advisors</h2></div>
            <div className="advisor-grid">
              {ADVISORS.map((a) => (
                <article className="advisor reveal" key={a.name}>
                  <div className="advisor__photo"><img loading="lazy" decoding="async" src={a.img} alt={a.alt} /></div>
                  <h3 className="advisor__name">{a.name}</h3>
                  <p className="advisor__role">{a.role}</p>
                  <p className="advisor__bio">{a.bio}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="testimonials section">
          <div className="container">
            <div className="section-head section-head--center reveal"><p className="overline">In their words</p><h2 className="section-title">Quietly, from our members</h2></div>
            <div className="testi-grid">
              {TESTI.map(([quote, by]) => (
                <blockquote className="testi reveal" key={by}><p className="testi__quote">{quote}</p><p className="testi__by">{by}</p></blockquote>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band section">
          <div className="container container--narrow reveal">
            <p className="overline">Begin</p>
            <h2 className="cta-band__title">Let&apos;s plan something quiet</h2>
            <p className="cta-band__sub">Start with a short brief. Your advisor will be in touch within a day — no obligation, no noise.</p>
            <Link className="btn btn--solid" href="/booking">Plan Your Journey</Link>
          </div>
        </section>
      </main>
    </>
  );
}
