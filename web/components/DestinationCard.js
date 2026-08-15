import Link from 'next/link';
import { U, BLURBS } from '@/lib/data';

// Shared destination card for the index + home grids.
export default function DestinationCard({ d, level = 2 }) {
  const Title = `h${level}`;
  return (
    <article className="dest-card reveal" data-region={d.region}>
      <Link className="dest-card__link" href={`/${d.slug}`}>
        <div className="dest-card__media">
          <img loading="lazy" decoding="async" width="900" height="1100" src={U(d.hero.id, 900)} alt={d.hero.alt} />
        </div>
        <div className="dest-card__body">
          <p className="overline overline--light">{d.name} &middot; {d.region}</p>
          <Title className="dest-card__title">{d.title}</Title>
          {BLURBS[d.slug] && <p className="dest-card__desc">{BLURBS[d.slug]}</p>}
          <span className="dest-card__cta">Discover <span aria-hidden="true">&rarr;</span></span>
        </div>
      </Link>
    </article>
  );
}
