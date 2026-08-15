import Link from 'next/link';
import { U } from '@/lib/data';
import { posts } from '@/lib/journal';
import PostCard from '@/components/PostCard';

const DESC =
  'The discerning are quietly abandoning July. A case for the softer light, open tables and halved crowds of the in-between months — and how to plan around them.';
const HERO = U('photo-1470071459604-3b5ec3a7fe05', 1600);
const OG = U('photo-1507525428034-b723cf961d3e', 1200).replace('&w=1200', '&w=1200&h=630');

export const metadata = {
  title: 'Shoulder Season Is the New Peak',
  description: DESC,
  alternates: { canonical: '/article' },
  openGraph: { type: 'article', url: '/article', title: 'Shoulder Season Is the New Peak — Sojourn Journal', description: DESC, images: [{ url: OG, width: 1200, height: 630 }] },
  twitter: { card: 'summary_large_image', title: 'Shoulder Season Is the New Peak — Sojourn Journal', description: DESC, images: [OG] },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Shoulder Season Is the New Peak — Sojourn Journal',
  description: DESC,
  url: 'https://hhabibhashmi5-source.github.io/sojourn/article',
  image: OG,
  publisher: { '@type': 'Organization', name: 'Sojourn' },
  mainEntityOfPage: 'https://hhabibhashmi5-source.github.io/sojourn/article',
};

const related = [posts[0], posts[4], posts[5]];

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main id="main">
        <article className="article">
          <div className="container">
            <header className="article__head">
              <nav className="breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/journal">Journal</Link><span>/</span>Slow Travel</nav>
              <p className="overline article__cat">Slow Travel</p>
              <h1 className="article__title">Shoulder season is the new peak</h1>
              <p className="article__byline"><span aria-hidden="true">By</span> Camille Ardent <span aria-hidden="true">·</span> 18 July 2026 <span aria-hidden="true">·</span> 6 min read</p>
            </header>
            <figure className="article__hero">
              <img loading="eager" decoding="async" src={HERO} alt="Mist drifting through a forested valley in the soft light of the off-season." />
            </figure>
          </div>

          <div className="container">
            <div className="article__wrap">
              <div className="article__body">
                <p>There is a particular kind of traveler who has stopped asking when a place is at its best and started asking when it is at its quietest. For them, the calendar has inverted. The weeks everyone else calls peak — the crowded, sun-blanched heart of summer — have become the season to avoid. The margins, the shoulders, the almost-seasons on either side: that is where the good travelling now happens.</p>
                <p>It is easy to mistake this for thrift. It is not. Shoulder-season travel can cost as much as any other; what it buys is different. Not a discount, but a dividend — of light, of space, of the sense that a place is being itself rather than performing for a crowd.</p>
                <h2>What the crowds take with them</h2>
                <p>Visit the Amalfi Coast in early June or late September and you meet a different coast entirely. The same cliffs, the same lemon terraces, but the roads move, the restaurants have tables, and the light — lower, softer, kinder to both the landscape and the photographs — arrives without the flattening glare of August noon.</p>
                <blockquote>The luxury is not that it is cheaper. The luxury is that it is emptier.</blockquote>
                <p>The staff are different too. In the off-months they have time; the concierge who is triaging four hundred guests in July can, in October, actually plan your day. Service, that most quoted of luxuries, is largely a function of ratio. Improve the ratio and you improve everything downstream of it.</p>
                <h2>The strategy, in practice</h2>
                <p>Planning for shoulder season is less about the destination than the timing, and timing rewards a little discipline. A few principles we return to again and again:</p>
                <ul>
                  <li><strong>Chase the fortnight, not the month.</strong> Every destination has a narrow window where weather still holds but crowds have gone. It is often only two weeks wide. Find it, and build around it.</li>
                  <li><strong>Read the weather like a local, not a brochure.</strong> &quot;Rainy season&quot; rarely means all-day rain; it often means a spectacular afternoon hour and then clear, washed light. The brochures never tell you this.</li>
                  <li><strong>Let the calendar flex.</strong> The best shoulder trips move by a week when the forecast asks them to. Book the kind of stays that let you.</li>
                </ul>
                <h2>Where we&apos;re sending people this year</h2>
                <p>Kyoto in late November, once the tour buses thin and the maples turn. The Cyclades in the first fortnight of October, the sea still warm, the ferries half empty. The Alps in the green shoulder of early summer, before the season proper, when the valleys are yours and the spas are unhurried.</p>
                <p>None of these are secrets, exactly. They are simply the same beloved places, met a few degrees off the crowd&apos;s timing — which turns out to make all the difference. Peak was never the best time to go. It was only the most obvious.</p>
              </div>

              <div className="article__foot">
                <div className="article__tags">
                  <span className="chip">Slow Travel</span><span className="chip">Planning</span><span className="chip">Seasonality</span>
                </div>
                <div className="article__share"><span>Share</span><a href="#">Copy link</a><a href="#">Email</a></div>
              </div>
            </div>
          </div>
        </article>

        <section className="related section">
          <div className="container">
            <div className="section-head reveal">
              <div><p className="overline">Keep reading</p><h2 className="section-title">More from the Journal</h2></div>
              <Link className="link-arrow" href="/journal">All essays <span aria-hidden="true">&rarr;</span></Link>
            </div>
            <div className="journal-grid">
              {related.map((p) => <PostCard key={p.title} p={p} />)}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
