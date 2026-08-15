// Supabase project config. The anon / publishable key is SAFE in client code
// (protected by Row-Level Security). Never put the service_role key here.
// Values can be overridden at build time with NEXT_PUBLIC_SUPABASE_* env vars.
export const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aakhrgwkugzazklerntv.supabase.co'
).trim();

export const SUPABASE_ANON_KEY = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_1hNlAZQRZVCfmnqtcf66PQ_c2UvBTgq'
).trim();
