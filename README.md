# Sojourn — Luxury Travel Blog & Booking Platform

A quiet-luxury travel blog and bespoke-advisory platform, built from the PRD in
[`docs/PRD.md`](docs/PRD.md). Plain HTML5 + modern
CSS + vanilla JS (no build step), with a Supabase backend.

## Structure
```
.
├── frontend/          ← everything the browser loads (THIS is the deploy root)
│   ├── *.html         ← 10 pages (home, destinations, journal, advisory, booking,
│   │                     dashboard, admin, 404…)
│   ├── css/           ← styles.css (design system) + pages.css (interior pages)
│   ├── js/            ← main, forms, booking, dashboard, admin + Supabase data layer
│   ├── assets/        ← favicon
│   ├── robots.txt     ← crawl rules (admin/dashboard disallowed)
│   ├── sitemap.xml    ← 7 public URLs
│   ├── manifest.webmanifest
│   └── _headers       ← Cloudflare security + cache headers
├── backend/           ← the Supabase project's schema + setup docs
│   ├── schema.sql     ← tables + Row-Level Security
│   ├── SUPABASE_SETUP.md
│   └── README.md
├── tools/
│   └── seo-inject.py  ← regenerates canonical/OG/Twitter/JSON-LD tags
└── docs/              ← project documentation
    └── PRD.md         ← the original PRD
```

## Run it locally
From this project root:

```bash
python -m http.server 5500 --directory frontend
# then open http://localhost:5500
```
(or `npx serve frontend -l 5500`)

## Backend
The backend is a hosted **Supabase** project (Postgres + Auth). No server to run —
see [`backend/README.md`](backend/README.md) and
[`backend/SUPABASE_SETUP.md`](backend/SUPABASE_SETUP.md).

## Deploy
Deploys to **GitHub Pages** at https://hhabibhashmi5-source.github.io/sojourn/ via the
workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (publishes
`frontend/` on every push to `main`). Step-by-step instructions in [`DEPLOY.md`](DEPLOY.md).

## Status
- **Phase 1–3** ✅ homepage, blog + destination pages, booking + advisory
  (verified live against the database)
- **Phase 4a** ✅ member dashboard (usernames, saved trips, own requests) + owner admin desk
- **Phase 5** ✅ SEO (canonical/OG/Twitter/JSON-LD, sitemap, robots, manifest),
  performance preloads, branded 404, Cloudflare headers, deploy guide
- **Phase 4b** ⏳ AI itinerary — deferred
