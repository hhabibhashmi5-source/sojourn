import Link from 'next/link';

export const metadata = { title: 'Page not found', robots: { index: false, follow: true } };

const css = `
.nf { min-height: 78vh; display: flex; align-items: center; justify-content: center; text-align: center; background: var(--cream-2); }
.nf__inner { max-width: 560px; padding: 2rem; }
.nf__code { font-family: var(--font-display); font-size: clamp(4rem, 14vw, 8rem); line-height: 1; color: var(--gold-deep); }
.nf__title { font-size: var(--fs-h3, 2rem); margin: 0.5rem 0 0.75rem; }
.nf__text { color: var(--taupe); margin-bottom: 1.75rem; line-height: 1.6; }
.nf__actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
`;

export default function NotFound() {
  return (
    <main className="nf" id="main">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="nf__inner">
        <p className="overline">Lost the trail</p>
        <div className="nf__code">404</div>
        <h1 className="nf__title">This path leads nowhere</h1>
        <p className="nf__text">The page you were looking for has wandered off. Let us guide you back to somewhere beautiful.</p>
        <div className="nf__actions">
          <Link className="btn btn--solid" href="/">Back to Home</Link>
          <Link className="btn btn--ghost-dark" href="/destinations">Explore Destinations</Link>
        </div>
      </div>
    </main>
  );
}
