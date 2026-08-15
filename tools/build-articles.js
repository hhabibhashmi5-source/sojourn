// Generates frontend/<slug>.html for each journal essay in articles.data.js.
// Same contract as build-destinations.js: edit the data, re-run, commit output.

const fs = require('fs');
const path = require('path');
const { site, articles } = require('./articles.data.js');

const OUT = path.join(__dirname, '..', 'frontend');
const U = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonEsc = (s) => JSON.stringify(String(s)).slice(1, -1);

// `ul` items and blockquotes carry inline <strong>/<em>, so they're trusted as
// authored markup; plain paragraphs and headings are escaped.
const block = (b) => {
  if (b.h2) return `            <h2>${esc(b.h2)}</h2>`;
  if (b.quote) return `            <blockquote>${b.quote}</blockquote>`;
  if (b.ul) return `            <ul>\n${b.ul.map((li) => `              <li>${li}</li>`).join('\n')}\n            </ul>`;
  return `            <p>${esc(b.p)}</p>`;
};

const related = (a) => {
  // Prefer essays in other categories, then fill up to three.
  const others = articles.filter((o) => o.slug !== a.slug);
  const picks = [...others.filter((o) => o.cat !== a.cat), ...others.filter((o) => o.cat === a.cat)].slice(0, 3);
  return picks.map((o) => `          <article class="post reveal">
            <a class="post__link" href="${o.slug}.html"><div class="post__media"><img loading="lazy" decoding="async" src="${esc(U(o.img.id, 800))}" alt="${esc(o.img.alt)}" /></div><div class="post__body"><p class="post__meta"><span>${esc(o.cat)}</span> &middot; ${esc(o.read)}</p><h3 class="post__title">${esc(o.title)}</h3><p class="post__excerpt">${esc(o.excerpt)}</p></div></a>
          </article>`).join('\n');
};

const page = (a) => {
  const url = `${site}/${a.slug}.html`;
  const og = U(a.img.id, 1200).replace('&w=1200', '&w=1200&h=630');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(a.metaTitle)}</title>
  <meta name="description" content="${esc(a.metaDesc)}" />
  <meta name="theme-color" content="#1C1A17" />
  <!-- Canonical, social & structured data -->
  <link rel="canonical" href="${url}" />
  <link rel="manifest" href="manifest.webmanifest" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="${esc(a.author)}" />
  <meta property="og:site_name" content="Sojourn" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content="${esc(a.metaTitle)}" />
  <meta property="og:description" content="${esc(a.metaDesc)}" />
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content="${a.date}" />
  <meta property="article:section" content="${esc(a.cat)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${esc(og)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(a.metaTitle)}" />
  <meta name="twitter:description" content="${esc(a.metaDesc)}" />
  <meta name="twitter:image" content="${esc(og)}" />
  <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"BlogPosting","headline":"${jsonEsc(a.title)}","description":"${jsonEsc(a.metaDesc)}","url":"${url}","image":"${jsonEsc(og)}","datePublished":"${a.date}","articleSection":"${jsonEsc(a.cat)}","author":{"@type":"Person","name":"${jsonEsc(a.author)}"},"publisher":{"@type":"Organization","name":"Sojourn"},"mainEntityOfPage":"${url}"},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${site}/"},{"@type":"ListItem","position":2,"name":"Journal","item":"${site}/journal.html"},{"@type":"ListItem","position":3,"name":"${jsonEsc(a.title)}","item":"${url}"}]}]}</script>
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://images.unsplash.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/styles.css" />
  <link rel="stylesheet" href="css/pages.css" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="header header--solid" id="header">
    <div class="header__inner container">
      <a class="brand" href="index.html" aria-label="Sojourn home"><span class="brand__mark">S</span><span class="brand__name">Sojourn</span></a>
      <nav class="nav" id="nav" aria-label="Primary">
        <a class="nav__link" href="destinations.html">Destinations</a>
        <a class="nav__link is-active" href="journal.html">Journal</a>
        <a class="nav__link" href="index.html#personas">Experiences</a>
        <a class="nav__link" href="advisory.html">Advisory</a>
        <a class="nav__link" href="#" data-modal="auth">Membership</a>
      </nav>
      <div class="header__actions">
        <button class="header__signin" id="signinBtn" data-modal="auth" type="button">Sign In</button>
        <button class="header__signout" id="signoutBtn" type="button" hidden>Sign Out</button>
        <a class="btn btn--solid btn--sm" id="planBtn" href="booking.html">Plan Your Journey</a>
        <button class="nav-toggle" id="navToggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobileMenu"><span></span><span></span><span></span></button>
      </div>
    </div>
  </header>

  <div class="mobile-menu" id="mobileMenu" aria-hidden="true">
    <nav class="mobile-menu__nav" aria-label="Mobile">
      <a class="mobile-menu__link" href="destinations.html">Destinations</a>
      <a class="mobile-menu__link" href="journal.html">Journal</a>
      <a class="mobile-menu__link" href="index.html#personas">Experiences</a>
      <a class="mobile-menu__link" href="advisory.html">Advisory</a>
      <a class="mobile-menu__link" href="#" data-modal="auth">Membership</a>
    </nav>
    <div class="mobile-menu__foot">
      <a class="btn btn--solid" href="booking.html">Plan Your Journey</a>
      <button class="mobile-menu__signin" data-modal="auth" type="button">Sign In</button>
    </div>
  </div>

  <main id="main">
    <article class="article">
      <div class="container">
        <header class="article__head">
          <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="journal.html">Journal</a><span>/</span>${esc(a.cat)}</nav>
          <p class="overline article__cat">${esc(a.cat)}</p>
          <h1 class="article__title">${esc(a.title)}</h1>
          <p class="article__byline"><span aria-hidden="true">By</span> ${esc(a.author)} <span aria-hidden="true">&middot;</span> <time datetime="${a.date}">${esc(a.dateLabel)}</time> <span aria-hidden="true">&middot;</span> ${esc(a.read)}</p>
        </header>

        <figure class="article__hero">
          <img loading="eager" decoding="async" src="${esc(U(a.img.id, 1600))}" alt="${esc(a.img.alt)}" />
        </figure>
      </div>

      <div class="container">
        <div class="article__wrap">
          <div class="article__body">
${a.body.map(block).join('\n\n')}
          </div>

          <div class="article__foot">
            <div class="article__tags">
              ${a.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}
            </div>
            <div class="article__share"><span>Share</span><a href="#">Copy link</a><a href="#">Email</a></div>
          </div>
        </div>
      </div>
    </article>

    <!-- Related -->
    <section class="related section">
      <div class="container">
        <div class="section-head reveal"><div><p class="overline">Keep reading</p><h2 class="section-title">More from the Journal</h2></div><a class="link-arrow" href="journal.html">All essays <span aria-hidden="true">&rarr;</span></a></div>
        <div class="journal-grid">
${related(a)}
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand"><a class="brand brand--light" href="index.html" aria-label="Sojourn home"><span class="brand__mark">S</span><span class="brand__name">Sojourn</span></a><p class="footer__tagline">The art of quiet luxury travel. Fewer places, known deeply.</p></div>
      <nav class="footer__col" aria-label="Explore"><h4 class="footer__heading">Explore</h4><a href="destinations.html">Destinations</a><a href="journal.html">Journal</a><a href="index.html#personas">Experiences</a><a href="advisory.html">Advisory</a></nav>
      <nav class="footer__col" aria-label="House"><h4 class="footer__heading">The House</h4><a href="#" data-modal="auth">Membership</a><a href="#" data-modal="inquiry">Concierge</a><a href="#">About</a><a href="#">Contact</a></nav>
      <nav class="footer__col" aria-label="Legal"><h4 class="footer__heading">Legal</h4><a href="privacy.html">Privacy</a><a href="#">Terms</a><a href="#">Sustainability</a></nav>
      <div class="footer__col footer__social"><h4 class="footer__heading">Follow</h4><a href="#">Instagram</a><a href="#">Pinterest</a><a href="#">Newsletter</a></div>
    </div>
    <div class="container footer__bar"><p>&copy; <span id="year">2026</span> Sojourn. All rights reserved.</p><p class="footer__made">Composed quietly, for the discerning traveler.</p></div>
  </footer>

  <!-- Inquiry modal -->
  <dialog class="modal" id="inquiryModal" aria-labelledby="inquiryTitle">
    <form class="modal__panel" id="inquiryForm" novalidate>
      <button class="modal__close" type="button" data-close aria-label="Close">&times;</button>
      <p class="overline">Bespoke Advisory</p>
      <h2 class="modal__title" id="inquiryTitle">Begin your journey</h2>
      <p class="modal__sub">Tell us a little, and a dedicated advisor will be in touch. No obligation.</p>
      <div class="field-grid">
        <div class="field"><label for="iqName">Full name</label><input id="iqName" type="text" autocomplete="name" required /></div>
        <div class="field"><label for="iqEmail">Email</label><input id="iqEmail" type="email" autocomplete="email" required /></div>
        <div class="field"><label for="iqDestination">Destination of interest</label><input id="iqDestination" type="text" placeholder="Maldives, Kyoto&hellip;" /></div>
        <div class="field"><label for="iqDates">Approximate dates</label><input id="iqDates" type="text" placeholder="Sept 2026, flexible&hellip;" /></div>
        <div class="field"><label for="iqParty">Party size</label><input id="iqParty" type="number" min="1" max="30" placeholder="2" /></div>
        <div class="field"><label for="iqType">Enquiry type</label><select id="iqType"><option value="advisory">Advisory / concierge</option><option value="booking">Specific booking</option></select></div>
      </div>
      <div class="field"><label for="iqMessage">What are you dreaming of?</label><textarea id="iqMessage" rows="3" placeholder="A quiet week, mostly resting, somewhere warm&hellip;"></textarea></div>
      <button class="btn btn--solid modal__submit" type="submit">Request Consultation</button>
      <p class="modal__note" id="inquiryNote" role="status"></p>
    </form>
  </dialog>

  <!-- Auth modal -->
  <dialog class="modal modal--sm" id="authModal" aria-labelledby="authTitle">
    <form class="modal__panel" id="authForm" novalidate>
      <button class="modal__close" type="button" data-close aria-label="Close">&times;</button>
      <p class="overline">Membership</p>
      <h2 class="modal__title" id="authTitle" data-signin="Welcome back" data-register="Join Sojourn">Welcome back</h2>
      <p class="modal__sub" id="authSub" data-signin="Sign in to your member profile." data-register="Create your member profile.">Sign in to your member profile.</p>
      <div class="field"><label for="auEmail">Email</label><input id="auEmail" type="email" autocomplete="email" required /></div>
      <div class="field"><label for="auPassword">Password</label><input id="auPassword" type="password" autocomplete="current-password" minlength="6" required /></div>
      <button class="btn btn--solid modal__submit" type="submit" id="authSubmit" data-signin="Sign In" data-register="Create Account">Sign In</button>
      <p class="modal__note" id="authNote" role="status"></p>
      <p class="modal__switch"><span id="authSwitchText">New to Sojourn?</span><button type="button" id="authSwitch" class="link-inline" data-signin="Create an account" data-register="Sign in instead">Create an account</button></p>
    </form>
  </dialog>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="js/config.js"></script>
  <script src="js/supabase-client.js"></script>
  <script src="js/main.js" defer></script>
  <script src="js/forms.js" defer></script>
</body>
</html>
`;
};

for (const a of articles) {
  fs.writeFileSync(path.join(OUT, `${a.slug}.html`), page(a));
  console.log(`wrote frontend/${a.slug}.html  (${a.cat})`);
}
console.log(`\n${articles.length} article pages generated.`);

/* ---- Rebuild the journal index between its markers ---------------------- */
// The grid used to be hand-written, which is how it drifted to one post per
// category while the filter offered six. Generating it keeps the two in step.

const byDate = [...articles].sort((x, y) => (x.date < y.date ? 1 : -1));
const featured = byDate[0];
const rest = byDate.slice(1);

// The featured post carries data-cat too, so the theme filter can hide it —
// otherwise it stays on screen under every filter and looks like a stray result.
const featuredHtml = `        <article class="featured reveal" data-cat="${esc(featured.cat)}">
          <a class="featured__media" href="${featured.slug}.html"><img loading="lazy" decoding="async" src="${esc(U(featured.img.id, 1000))}" alt="${esc(featured.img.alt)}" /></a>
          <div>
            <p class="featured__meta"><span>${esc(featured.cat)}</span> &middot; Editor's pick &middot; ${esc(featured.read)}</p>
            <h2 class="featured__title"><a href="${featured.slug}.html">${esc(featured.title)}</a></h2>
            <p class="featured__excerpt">${esc(featured.metaDesc)}</p>
            <a class="link-arrow" href="${featured.slug}.html">Read the essay <span aria-hidden="true">&rarr;</span></a>
          </div>
        </article>`;

const gridHtml = rest.map((a) => `          <article class="post reveal" data-cat="${esc(a.cat)}">
            <a class="post__link" href="${a.slug}.html">
              <div class="post__media"><img loading="lazy" decoding="async" src="${esc(U(a.img.id, 800))}" alt="${esc(a.img.alt)}" /></div>
              <div class="post__body"><p class="post__meta"><span>${esc(a.cat)}</span> &middot; ${esc(a.read)}</p><h3 class="post__title">${esc(a.title)}</h3><p class="post__excerpt">${esc(a.excerpt)}</p></div>
            </a>
          </article>`).join('\n\n');

const journalPath = path.join(OUT, 'journal.html');
let journal = fs.readFileSync(journalPath, 'utf8');

const splice = (src, marker, replacement) => {
  const re = new RegExp(`([ \\t]*<!-- ${marker}:start -->\\r?\\n)[\\s\\S]*?([ \\t]*<!-- ${marker}:end -->)`);
  if (!re.test(src)) throw new Error(`journal.html is missing the ${marker} markers`);
  return src.replace(re, `$1${replacement}\n$2`);
};

journal = splice(journal, 'featured', featuredHtml);
journal = splice(journal, 'grid', gridHtml);

// Keep the filter chips in step with the categories that actually exist.
const cats = [...new Set(byDate.map((a) => a.cat))].sort();
const chipsHtml = [`          <button class="chip is-active" data-filter="all">All</button>`]
  .concat(cats.map((c) => `          <button class="chip" data-filter="${esc(c)}">${esc(c)}</button>`))
  .join('\n');
journal = splice(journal, 'chips', chipsHtml);

fs.writeFileSync(journalPath, journal);
console.log(`journal.html rebuilt: 1 featured + ${rest.length} posts across ${cats.length} categories`);
for (const c of cats) console.log(`  ${String(byDate.filter((a) => a.cat === c).length).padStart(2)} × ${c}`);
