// Generates frontend/<slug>.html for each destination in destinations.data.js.
//
// The site has no build step — the generated files are committed and served as
// plain static HTML. This script exists so the nine pages keep identical header,
// footer and modal markup; run `node tools/build-destinations.js` after editing
// the data file, then commit the result.

const fs = require('fs');
const path = require('path');
const { U, site, destinations } = require('./destinations.data.js');

const OUT = path.join(__dirname, '..', 'frontend');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonEsc = (s) => JSON.stringify(String(s)).slice(1, -1);

const nav = (linkClass, activeHref) => `
        <a class="${linkClass}${activeHref === 'destinations' ? ' is-active' : ''}" href="destinations.html">Destinations</a>
        <a class="${linkClass}" href="journal.html">Journal</a>
        <a class="${linkClass}" href="index.html#personas">Experiences</a>
        <a class="${linkClass}" href="advisory.html">Advisory</a>
        <a class="${linkClass}" href="#" data-modal="auth">Membership</a>`;

const head = (d) => {
  const url = `${site}/${d.slug}.html`;
  const og = U(d.hero.id, 1200).replace('&w=1200', '&w=1200&h=630');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(d.metaTitle)}</title>
  <meta name="description" content="${esc(d.metaDesc)}" />
  <meta name="theme-color" content="#1C1A17" />
  <!-- Canonical, social & structured data -->
  <link rel="canonical" href="${url}" />
  <link rel="manifest" href="manifest.webmanifest" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Sojourn" />
  <meta property="og:site_name" content="Sojourn" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:title" content="${esc(d.metaTitle)}" />
  <meta property="og:description" content="${esc(d.metaDesc)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${esc(og)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(d.metaTitle)}" />
  <meta name="twitter:description" content="${esc(d.metaDesc)}" />
  <meta name="twitter:image" content="${esc(og)}" />
  <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"TouristDestination","name":"${jsonEsc(d.name)}","description":"${jsonEsc(d.metaDesc)}","url":"${url}","image":"${jsonEsc(og)}"},{"@type":"WebPage","name":"${jsonEsc(d.metaTitle)}","description":"${jsonEsc(d.metaDesc)}","url":"${url}","isPartOf":{"@id":"${site}/#website"}},{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"${site}/"},{"@type":"ListItem","position":2,"name":"Destinations","item":"${site}/destinations.html"},{"@type":"ListItem","position":3,"name":"${jsonEsc(d.name)}","item":"${url}"}]}]}</script>
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
      <nav class="nav" id="nav" aria-label="Primary">${nav('nav__link', 'destinations')}
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
    <nav class="mobile-menu__nav" aria-label="Mobile">${nav('mobile-menu__link')}
    </nav>
    <div class="mobile-menu__foot">
      <a class="btn btn--solid" href="booking.html">Plan Your Journey</a>
      <button class="mobile-menu__signin" data-modal="auth" type="button">Sign In</button>
    </div>
  </div>
`;
};

const body = (d) => `
  <main id="main">
    <!-- Hero -->
    <section class="dest-hero">
      <div class="dest-hero__media" data-bg="${esc(U(d.hero.id, 2000))}" role="img" aria-label="${esc(d.hero.alt)}"></div>
      <div class="dest-hero__inner container">
        <p class="overline overline--light reveal">${esc(d.overline)}</p>
        <h1 class="dest-hero__title reveal">${esc(d.title)}</h1>
        <p class="dest-hero__loc reveal">${esc(d.loc)}</p>
      </div>
    </section>

    <!-- Intro -->
    <section class="dest-intro section">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a href="destinations.html">Destinations</a><span>/</span>${esc(d.name)}</nav>
        <div class="dest-intro__grid">
          <div class="reveal">
            <p class="dest-intro__lead">${esc(d.lead)}</p>
            <div class="dest-intro__body">
${d.body.map((p) => `              <p>${esc(p)}</p>`).join('\n')}
            </div>
          </div>
          <aside class="facts reveal" aria-label="Destination facts">
${d.facts.map(([k, v]) => `            <div class="facts__row"><span class="facts__key">${esc(k)}</span><span class="facts__val">${esc(v)}</span></div>`).join('\n')}
          </aside>
        </div>
      </div>
    </section>

    <!-- Highlights -->
    <section class="highlights section">
      <div class="container">
        <div class="section-head reveal"><div><p class="overline">Why we send you here</p><h2 class="section-title">The quiet particulars</h2></div></div>
        <div class="highlight-grid">
${d.highlights.map(([t, x], i) => `          <div class="highlight reveal"><span class="highlight__num">0${i + 1}</span><h3 class="highlight__title">${esc(t)}</h3><p class="highlight__text">${esc(x)}</p></div>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- Gallery -->
    <section class="gallery section">
      <div class="container">
        <div class="section-head reveal"><div><p class="overline">In pictures</p><h2 class="section-title">A sense of the place</h2></div></div>
        <div class="gallery__grid reveal">
${d.gallery.map((g, i) => {
  const mod = i === 0 ? ' gallery__item--wide gallery__item--tall' : i === 3 ? ' gallery__item--wide' : '';
  const w = mod ? 1200 : 700;
  return `          <figure class="gallery__item${mod}"><img loading="lazy" decoding="async" src="${esc(U(g.id, w))}" alt="${esc(g.alt)}" /></figure>`;
}).join('\n')}
        </div>
      </div>
    </section>

    <!-- Stays -->
    <section class="stays section">
      <div class="container">
        <div class="section-head reveal"><div><p class="overline">Where you'll stay</p><h2 class="section-title">Held for our members</h2></div><a class="link-arrow" href="#" data-modal="inquiry">Enquire on availability <span aria-hidden="true">&rarr;</span></a></div>
        <div class="stay-grid">
${d.stays.map(([name, desc, price, img]) => `          <article class="stay reveal">
            <div class="stay__media"><img loading="lazy" decoding="async" src="${esc(U(img.id, 800))}" alt="${esc(img.alt)}" /></div>
            <div class="stay__body"><h3 class="stay__name">${esc(name)}</h3><p class="stay__desc">${esc(desc)}</p>
              <div class="stay__foot"><span class="stay__price">${price}</span><button class="btn btn--sm btn--solid" data-modal="inquiry" type="button">Enquire</button></div>
            </div>
          </article>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- Map -->
    <section class="map-band section">
      <div class="container">
        <div class="section-head reveal"><div><p class="overline">Orientation</p><h2 class="section-title">Where in the world</h2></div></div>
        <div class="map-box reveal">
          <div class="map-box__inner">
            <span class="map-box__pin">&#10022;</span>
            <p class="overline">Interactive map</p>
            <p style="color:var(--taupe);max-width:34ch;">${esc(d.map)}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- More destinations -->
    <section class="dest-index section">
      <div class="container">
        <div class="section-head reveal"><div><p class="overline">Keep looking</p><h2 class="section-title">Other places we know well</h2></div><a class="link-arrow" href="destinations.html">All destinations <span aria-hidden="true">&rarr;</span></a></div>
        <div class="dest-grid">
${destinations.filter((o) => o.slug !== d.slug).slice(0, 3).map((o) => `          <article class="dest-card reveal">
            <a class="dest-card__link" href="${o.slug}.html">
              <div class="dest-card__media"><img loading="lazy" decoding="async" width="900" height="1100" src="${esc(U(o.hero.id, 900))}" alt="${esc(o.hero.alt)}" /></div>
              <div class="dest-card__body">
                <p class="overline overline--light">${esc(o.name)} &middot; ${esc(o.region)}</p>
                <h3 class="dest-card__title">${esc(o.title)}</h3>
                <span class="dest-card__cta">Discover <span aria-hidden="true">&rarr;</span></span>
              </div>
            </a>
          </article>`).join('\n')}
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-band section">
      <div class="container container--narrow reveal">
        <p class="overline">Ready when you are</p>
        <h2 class="cta-band__title">${esc(d.ctaTitle)}</h2>
        <p class="cta-band__sub">Share your dates and the shape of the trip. An advisor will return a considered proposal within two working days.</p>
        <button class="btn btn--solid" data-modal="inquiry" type="button">Request a Proposal</button>
      </div>
    </section>
  </main>
`;

const foot = (d) => `
  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a class="brand brand--light" href="index.html" aria-label="Sojourn home"><span class="brand__mark">S</span><span class="brand__name">Sojourn</span></a>
        <p class="footer__tagline">The art of quiet luxury travel. Fewer places, known deeply.</p>
      </div>
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
        <div class="field"><label for="iqDestination">Destination of interest</label><input id="iqDestination" type="text" value="${esc(d.name)}" /></div>
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

for (const d of destinations) {
  fs.writeFileSync(path.join(OUT, `${d.slug}.html`), head(d) + body(d) + foot(d));
  console.log(`wrote frontend/${d.slug}.html  (${d.region})`);
}
console.log(`\n${destinations.length} destination pages generated.`);
