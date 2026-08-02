# Connecting Sojourn to Supabase

The homepage newsletter form now writes to a real database. Follow these
four steps to switch it from the local fallback to a live connection.

## 1. Create a project
- Go to <https://supabase.com> → **New project** (the free tier is plenty).
- Wait for it to finish provisioning (~1 min).

## 2. Create the tables
- Open **SQL Editor** → **New query**.
- Paste the contents of [`schema.sql`](schema.sql) (in this `backend/` folder) and click **Run**.
- This creates `subscribers`, `inquiries` + `saved_trips` with Row-Level Security enabled.

## 3. Add your keys
- Go to **Project Settings → API**.
- Copy two values into [`../frontend/js/config.js`](../frontend/js/config.js):
  - **Project URL** → `SUPABASE_URL`
  - **Project API key → `anon` `public`** → `SUPABASE_ANON_KEY`

```js
window.SOJOURN_CONFIG = {
  SUPABASE_URL: "https://abcdefgh.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi...your-anon-key..."
};
```

> ✅ The **anon / public** key is meant to ship in browser code — RLS protects it.
> ⛔ Never use the **service_role** key in the browser; it bypasses RLS.

## 4. Run it over http (recommended)
Supabase behaves best from `http://localhost`, not `file://`. The site now lives
in the sibling `frontend/` folder, so serve **that** folder from the project root:

```bash
# Python (already installed)
python -m http.server 5500 --directory frontend
# then open http://localhost:5500

# …or Node
npx serve frontend -l 5500
```

## Verify it works
1. Open the site, scroll to **The Quiet List**, submit an email.
2. You should see *"Thank you — your invitation is on its way."*
3. In Supabase → **Table Editor → subscribers**, your row appears.
4. Browser console shows `[Sojourn] Supabase connected.` when keys are set.

### Troubleshooting
- Console says *"not configured"* → keys still contain the placeholder text.
- Console says *"failed to load"* → you're offline; the CDN SDK didn't download.
- Row not appearing but no error → confirm you ran `schema.sql` in **this** project.
- CORS error on `file://` → run it over `http://localhost` as in step 4.
