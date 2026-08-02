# Sojourn — AI Itinerary setup (Phase 4b)

The AI itinerary generator (`frontend/itinerary.html`) calls a **Supabase Edge Function**
(`backend/supabase/functions/itinerary/index.ts`) which talks to **Claude** server-side.
Your Anthropic API key lives in Supabase secrets — it is **never** in the website code.

```
Browser (itinerary.html)  ──►  Supabase Edge Function  ──►  Claude API
        (no secrets)              (holds ANTHROPIC_API_KEY)
```

Until you deploy the function, the page still loads — it just shows a friendly
"service isn't deployed yet" message when you press Compose.

---

## 1. Get an Anthropic API key (needed — this is the paid part)

1. Go to **[console.anthropic.com](https://console.anthropic.com)** → sign up.
2. **Billing** → add a payment method / credits (a few dollars covers a lot of itineraries).
3. **API Keys** → **Create key** → copy it (starts with `sk-ant-...`).

**Cost:** the function uses `claude-opus-5` at **low effort** — roughly a few cents per
itinerary. To spend less, open `index.ts` and change the model to `claude-sonnet-5`
(cheaper) or `claude-haiku-4-5` (cheapest), then redeploy.

## 2. Install the Supabase CLI

```bash
npm install -g supabase
# or on Windows with scoop:  scoop install supabase
```

## 3. Link this project + set the secret + deploy

From the project root (`luxury travelling blog/`):

```bash
supabase login                                   # opens a browser
supabase link --project-ref aakhrgwkugzazklerntv
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...   # paste your key
supabase functions deploy itinerary --no-verify-jwt
```

That's it. The function is now live at:
`https://aakhrgwkugzazklerntv.supabase.co/functions/v1/itinerary`

## 4. Test it

Open **itinerary.html** (locally at `http://localhost:5500/itinerary.html`, or live once
GitHub Pages is on), enter a destination, and press **Compose my itinerary**.

---

## Notes & hardening

- **The endpoint is public** (`--no-verify-jwt`) so anyone visiting the site can generate an
  itinerary — that's the intended lead-gen behaviour. Input lengths are capped in the function
  to limit abuse. Because each call spends your Anthropic credit, for production consider:
  - moving the feature behind the member login (verify the user's Supabase JWT — drop
    `--no-verify-jwt` and send the member's `access_token` from the browser), and/or
  - adding simple rate-limiting (e.g. a `requests` table keyed by IP/day).
- **Redeploy after any edit** to `index.ts` with `supabase functions deploy itinerary --no-verify-jwt`.
- **Logs:** `supabase functions logs itinerary` (or the Supabase dashboard → Edge Functions) if a
  generation fails.
- **The model never invents real prices/addresses** — the system prompt tells it to suggest
  kinds of places and neighbourhoods, and the page shows a "confirm details" disclaimer.
