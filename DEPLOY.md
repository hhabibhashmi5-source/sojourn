# Deploying Sojourn — GitHub Pages

**Repo:** https://github.com/hhabibhashmi5-source/sojourn
**Live URL:** https://hhabibhashmi5-source.github.io/sojourn/
**What gets served:** the `frontend/` folder (published automatically by GitHub Actions)
**Build step:** none — it's plain HTML/CSS/JS

Because the repo is named `sojourn` (not `hhabibhashmi5-source.github.io`), the site is a
**project site** served under the `/sojourn/` subpath. All URLs, the sitemap, robots,
manifest and 404 links are already configured for that subpath.

The repo already contains the workflow that deploys it:
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) — it uploads `frontend/`
to Pages on every push to `main`.

---

## Go live (the repo already exists)

### 1. Push the code
From the project root (`luxury travelling blog/`):

```bash
git push -u origin main
```
(The `origin` remote is already set to your repo.) The first push opens a browser to
sign in to GitHub — approve it and the code uploads.

### 2. Turn on Pages
In the repo: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
No folder to pick — the workflow handles `frontend/`.

### 3. Watch it deploy
Open the **Actions** tab → the "Deploy to GitHub Pages" run goes green in ~1–2 min.
Then visit **https://hhabibhashmi5-source.github.io/sojourn/**.

### Updating later
Just `git add -A && git commit -m "..." && git push` — it redeploys automatically.

---

## After the first deploy

1. **Point Supabase at the live site.**
   Supabase → **Authentication → URL Configuration** → set
   **Site URL** to `https://hhabibhashmi5-source.github.io/sojourn/`

2. **Smoke-test:**
   - `/sojourn/` loads, hero image appears
   - `/sojourn/sitemap.xml` loads
   - a made-up URL under the site shows the branded 404
   - newsletter form → row appears in Supabase `subscribers`
   - `/sojourn/dashboard.html` → sign up with a username → works
   - `/sojourn/admin.html` → sign in as owner → inquiries listed

3. **Google Search Console** (for the ranking goal): add the site and submit
   `https://hhabibhashmi5-source.github.io/sojourn/sitemap.xml`.

---

## Good to know

- **`robots.txt` limitation on a project site:** crawlers only read `robots.txt` at a
  domain's root (`hhabibhashmi5-source.github.io/robots.txt`), not under `/sojourn/`.
  So the admin/dashboard pages are kept out of search by their in-page
  `<meta name="robots" content="noindex">` — which *is* always honored — not by robots.txt.
- **`frontend/_headers` does nothing on GitHub Pages** — it's a Cloudflare feature; harmless to leave.
- **`frontend/js/config.js` is safe to commit** — only the Supabase *publishable* key (protected by RLS). The `service_role` key is never in this repo.

---

## Want the cleaner root URL later?
Rename the repo to `hhabibhashmi5-source.github.io` (Settings → General → Rename), then set
`BASE = "https://hhabibhashmi5-source.github.io"` in `tools/seo-inject.py`, run it, and
update `sitemap.xml` + `robots.txt`. Or add a custom domain (Settings → Pages → Custom domain).

## Local preview
```bash
python -m http.server 5500 --directory frontend
# open http://localhost:5500
```
