// Sojourn data layer — a small, form-friendly wrapper over supabase-js.
// Mirrors the vanilla window.sojournDB API. Degrades gracefully to a local
// fallback when unconfigured or offline, so the UI never breaks.
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

const isPlaceholder =
  !SUPABASE_URL || !SUPABASE_ANON_KEY ||
  SUPABASE_URL.includes('YOUR-PROJECT') ||
  SUPABASE_ANON_KEY.includes('YOUR-ANON');

let _client = null;
function client() {
  if (isPlaceholder) return null;
  if (_client) return _client;
  try {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('[Sojourn] Supabase init failed:', err);
  }
  return _client;
}

const fallback = () => Promise.resolve({ ok: false, offline: true, error: null });

function mapAuth(res) {
  const data = res.data || {};
  if (res.error) return { ok: false, error: res.error, user: null };
  // signUp with email-confirmation ON returns a user but no session yet.
  return { ok: true, error: null, user: data.user || null, needsConfirm: !!(data.user && !data.session) };
}

export const db = {
  isReady() { return !isPlaceholder && !!client(); },

  subscribe(email, meta) {
    const c = client();
    if (!c) return fallback();
    const row = { email: String(email).toLowerCase(), source: (meta && meta.source) || 'homepage' };
    return c.from('subscribers').insert(row).then((res) => {
      if (res.error) {
        if (res.error.code === '23505') return { ok: true, duplicate: true, error: null };
        return { ok: false, error: res.error };
      }
      return { ok: true, error: null };
    });
  },

  capture(table, payload) {
    const c = client();
    if (!c) return fallback();
    return c.from(table).insert(payload).then((res) =>
      res.error ? { ok: false, error: res.error } : { ok: true, error: null }
    );
  },

  auth: {
    register(email, password, username) {
      const c = client();
      if (!c) return fallback();
      const options = {};
      if (username) options.data = { username };
      return c.auth.signUp({ email: String(email).toLowerCase(), password, options }).then(mapAuth);
    },
    signIn(email, password) {
      const c = client();
      if (!c) return fallback();
      return c.auth.signInWithPassword({ email: String(email).toLowerCase(), password }).then(mapAuth);
    },
    signOut() {
      const c = client();
      if (!c) return Promise.resolve({ ok: true });
      return c.auth.signOut().then(() => ({ ok: true }));
    },
    current() {
      const c = client();
      if (!c) return Promise.resolve(null);
      return c.auth.getUser().then((r) => (r && r.data ? r.data.user : null)).catch(() => null);
    },
    // Calls cb(user|null) now and on every auth change. Returns an unsubscribe fn.
    onChange(cb) {
      const c = client();
      if (!c) { cb(null); return () => {}; }
      c.auth.getUser().then((r) => cb(r && r.data ? r.data.user : null));
      const { data } = c.auth.onAuthStateChange((_evt, session) => cb(session ? session.user : null));
      return () => { try { data.subscription.unsubscribe(); } catch {} };
    },
  },

  myInquiries() {
    const c = client();
    if (!c) return Promise.resolve({ ok: false, offline: true, data: [] });
    return c.from('inquiries').select('*').order('created_at', { ascending: false }).then((res) =>
      res.error ? { ok: false, error: res.error, data: [] } : { ok: true, error: null, data: res.data || [] }
    );
  },

  trips: {
    list() {
      const c = client();
      if (!c) return Promise.resolve({ ok: false, offline: true, data: [] });
      return c.from('saved_trips').select('*').order('created_at', { ascending: false }).then((res) =>
        res.error ? { ok: false, error: res.error, data: [] } : { ok: true, error: null, data: res.data || [] }
      );
    },
    save(destination, meta) {
      const c = client();
      if (!c) return fallback();
      return c.auth.getUser().then((r) => {
        const user = r && r.data ? r.data.user : null;
        if (!user) return { ok: false, error: { message: 'Not signed in.' } };
        const row = {
          user_id: user.id,
          destination,
          title: (meta && meta.title) || null,
          note: (meta && meta.note) || null,
        };
        return c.from('saved_trips').insert(row).then((res) =>
          res.error ? { ok: false, error: res.error } : { ok: true, error: null }
        );
      });
    },
    remove(id) {
      const c = client();
      if (!c) return fallback();
      return c.from('saved_trips').delete().eq('id', id).then((res) =>
        res.error ? { ok: false, error: res.error } : { ok: true, error: null }
      );
    },
  },

  raw() { return client(); },
};
