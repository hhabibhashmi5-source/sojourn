# Sojourn — Backend

The backend is a **Supabase** project (managed PostgreSQL + Auth + REST API).
There is no custom server process to run — the browser talks to Supabase
directly using the safe **anon/publishable** key, and **Row-Level Security (RLS)**
is what actually enforces who can read and write what.

## What's in this folder
| File | Purpose |
|---|---|
| [`schema.sql`](schema.sql) | All tables + RLS policies. Paste into Supabase → SQL Editor → Run. |
| [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) | Step-by-step: create the project, run the schema, add keys. |

## Data model
| Table | Holds | Who can read | Who can write |
|---|---|---|---|
| `subscribers` | Newsletter signups | Owner only | Anyone (insert) |
| `inquiries` | Advisory / booking requests | Owner + the member who submitted it | Anyone (insert) |
| `saved_trips` | A member's private wishlist | The member who owns the row | The member who owns the row |

Auth is Supabase **email + password**; a member's chosen username lives in
`user_metadata.username` (no separate table).

## How the frontend connects
`frontend/js/config.js` holds the project URL + anon/publishable key.
`frontend/js/supabase-client.js` wraps the Supabase SDK as `window.sojournDB`
(`subscribe`, `capture`, `auth.*`, `myInquiries`, `trips.*`).

> ⛔ Only the **anon/publishable** key belongs in the frontend. The
> **service_role** key bypasses RLS and must never ship in browser code.

See [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) to wire (or re-wire) it up.
