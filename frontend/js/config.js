/* =========================================================
   SOJOURN — Supabase configuration
   ---------------------------------------------------------
   1. Create a project at https://supabase.com
   2. Supabase Studio → Project Settings → API
   3. Paste the two values below.

   ✅ The anon / public key is DESIGNED to live in browser code.
      It is protected by Row-Level Security (see supabase/schema.sql).
   ⛔ NEVER paste the service_role / secret key here — it bypasses
      RLS and would give the whole internet full DB access.
   ========================================================= */
window.SOJOURN_CONFIG = {
  SUPABASE_URL: "https://aakhrgwkugzazklerntv.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_1hNlAZQRZVCfmnqtcf66PQ_c2UvBTgq"
};
