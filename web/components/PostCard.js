import Link from 'next/link';

// Shared journal post card (journal grid, related, home preview).
export default function PostCard({ p }) {
  return (
    <article className="post reveal" data-cat={p.cat}>
      <Link className="post__link" href={p.href || '/article'}>
        <div className="post__media"><img loading="lazy" decoding="async" src={p.img.src} alt={p.img.alt} /></div>
        <div className="post__body">
          <p className="post__meta"><span>{p.cat}</span> &middot; {p.read}</p>
          <h3 className="post__title">{p.title}</h3>
          <p className="post__excerpt">{p.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
