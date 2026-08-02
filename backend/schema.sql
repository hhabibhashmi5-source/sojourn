-- =========================================================
-- SOJOURN · Supabase schema
-- Paste into Supabase Studio → SQL Editor → Run.
-- Row-Level Security: anonymous visitors may INSERT (submit
-- forms) but never SELECT (read other people's data).
-- =========================================================

-- 1. Newsletter subscribers -------------------------------------
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text default 'homepage',
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

drop policy if exists "Public can subscribe" on public.subscribers;
create policy "Public can subscribe"
  on public.subscribers
  for insert
  to anon, authenticated
  with check (true);
-- No SELECT/UPDATE/DELETE policy → the public cannot read the list.
-- View subscribers in Studio → Table Editor (bypasses RLS for you).


-- 2. Advisory / booking inquiries (used from Phase 3) -----------
create table if not exists public.inquiries (
  id           uuid primary key default gen_random_uuid(),
  type         text not null default 'advisory',   -- 'advisory' | 'booking'
  name         text,
  email        text not null,
  destination  text,
  travel_dates text,
  party_size   int,
  message      text,
  created_at   timestamptz not null default now()
);

alter table public.inquiries enable row level security;

drop policy if exists "Public can submit inquiries" on public.inquiries;
create policy "Public can submit inquiries"
  on public.inquiries
  for insert
  to anon, authenticated
  with check (true);


-- 3. Owner-only read access (admin dashboard) ------------------
-- Only the signed-in owner may SELECT rows. The public still
-- cannot read anything — RLS filters every other user to zero rows.
-- To add more admins later, swap this for an `admins` table check.
drop policy if exists "Owner can read inquiries" on public.inquiries;
create policy "Owner can read inquiries"
  on public.inquiries
  for select
  to authenticated
  using ( (auth.jwt() ->> 'email') in ('hhabibhashmi5@gmail.com','absarajammalik1@gmail.com') );

drop policy if exists "Owner can read subscribers" on public.subscribers;
create policy "Owner can read subscribers"
  on public.subscribers
  for select
  to authenticated
  using ( (auth.jwt() ->> 'email') in ('hhabibhashmi5@gmail.com','absarajammalik1@gmail.com') );


-- 4. Member dashboard (Phase 4a) --------------------------------
-- Members may read the inquiries they submitted, matched by the
-- email on their signed-in account. Owner policy above still lets
-- the owner read everything (RLS policies are OR-ed together).
drop policy if exists "Members read own inquiries" on public.inquiries;
create policy "Members read own inquiries"
  on public.inquiries
  for select
  to authenticated
  using ( (auth.jwt() ->> 'email') = email );

-- Saved trips: a member's private wishlist. Each row is owned by
-- the member (user_id = auth.uid()); they alone can read/add/remove.
create table if not exists public.saved_trips (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  destination text not null,
  title       text,
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.saved_trips enable row level security;

drop policy if exists "Members read own trips" on public.saved_trips;
create policy "Members read own trips"
  on public.saved_trips for select to authenticated
  using ( user_id = auth.uid() );

drop policy if exists "Members add own trips" on public.saved_trips;
create policy "Members add own trips"
  on public.saved_trips for insert to authenticated
  with check ( user_id = auth.uid() );

drop policy if exists "Members remove own trips" on public.saved_trips;
create policy "Members remove own trips"
  on public.saved_trips for delete to authenticated
  using ( user_id = auth.uid() );
