/* =========================================================
   SOJOURN — Supabase data layer
   Exposes window.sojournDB with a small, form-friendly API.
   Loads AFTER the supabase-js UMD bundle and js/config.js.
   Degrades gracefully to a local fallback when unconfigured
   or offline, so the site never breaks.
   ========================================================= */
(function () {
  "use strict";

  var cfg = window.SOJOURN_CONFIG || {};
  var url = (cfg.SUPABASE_URL || "").trim();
  var key = (cfg.SUPABASE_ANON_KEY || "").trim();

  var isPlaceholder =
    !url || !key ||
    url.indexOf("YOUR-PROJECT") !== -1 ||
    key.indexOf("YOUR-ANON") !== -1;

  var libReady = !!(window.supabase && typeof window.supabase.createClient === "function");

  var client = null;
  var ready = false;

  if (isPlaceholder) {
    console.info("[Sojourn] Supabase not configured yet — form uses local fallback. Add your keys in js/config.js.");
  } else if (!libReady) {
    console.warn("[Sojourn] supabase-js failed to load (offline?) — form uses local fallback.");
  } else {
    try {
      client = window.supabase.createClient(url, key);
      ready = true;
      console.info("[Sojourn] Supabase connected.");
    } catch (err) {
      console.error("[Sojourn] Supabase init failed:", err);
    }
  }

  function fallback() {
    return Promise.resolve({ ok: false, offline: true, error: null });
  }

  function mapAuth(res) {
    var data = res.data || {};
    if (res.error) return { ok: false, error: res.error, user: null };
    // signUp with email-confirmation ON returns a user but no session yet.
    var needsConfirm = !!(data.user && !data.session);
    return { ok: true, error: null, user: data.user || null, needsConfirm: needsConfirm };
  }

  window.sojournDB = {
    /** Is a live Supabase connection available? */
    isReady: function () { return ready; },

    /**
     * Add a newsletter subscriber.
     * @returns Promise<{ok, duplicate?, offline?, error}>
     */
    subscribe: function (email, meta) {
      if (!ready) return fallback();
      var row = { email: String(email).toLowerCase(), source: (meta && meta.source) || "homepage" };
      return client.from("subscribers").insert(row).then(function (res) {
        if (res.error) {
          if (res.error.code === "23505") return { ok: true, duplicate: true, error: null };
          return { ok: false, error: res.error };
        }
        return { ok: true, error: null };
      });
    },

    /**
     * Generic capture for advisory / booking forms (Phase 3).
     * @param {string} table  e.g. "inquiries"
     * @param {object} payload row to insert
     */
    capture: function (table, payload) {
      if (!ready) return fallback();
      return client.from(table).insert(payload).then(function (res) {
        return res.error ? { ok: false, error: res.error } : { ok: true, error: null };
      });
    },

    /** Supabase Auth — email + password member accounts. */
    auth: {
      register: function (email, password, username) {
        if (!ready) return fallback();
        var opts = {};
        // A self-chosen username is stored on the account (user_metadata)
        // and comes back as user.user_metadata.username on every sign-in.
        if (username) opts.data = { username: username };
        return client.auth.signUp({
          email: String(email).toLowerCase(),
          password: password,
          options: opts
        }).then(mapAuth);
      },
      signIn: function (email, password) {
        if (!ready) return fallback();
        return client.auth.signInWithPassword({ email: String(email).toLowerCase(), password: password }).then(mapAuth);
      },
      signOut: function () {
        if (!ready) return Promise.resolve({ ok: true });
        return client.auth.signOut().then(function () { return { ok: true }; });
      },
      current: function () {
        if (!ready) return Promise.resolve(null);
        return client.auth.getUser().then(function (r) {
          return r && r.data ? r.data.user : null;
        }).catch(function () { return null; });
      },
      onChange: function (cb) {
        if (!ready) { cb(null); return; }
        client.auth.getUser().then(function (r) { cb(r && r.data ? r.data.user : null); });
        client.auth.onAuthStateChange(function (_evt, session) {
          cb(session ? session.user : null);
        });
      }
    },

    /** Inquiries submitted by the signed-in member (RLS: email match). */
    myInquiries: function () {
      if (!ready) return Promise.resolve({ ok: false, offline: true, data: [] });
      return client.from("inquiries").select("*").order("created_at", { ascending: false }).then(function (res) {
        return res.error ? { ok: false, error: res.error, data: [] } : { ok: true, error: null, data: res.data || [] };
      });
    },

    /** Member wishlist — saved_trips (RLS: own rows only). */
    trips: {
      list: function () {
        if (!ready) return Promise.resolve({ ok: false, offline: true, data: [] });
        return client.from("saved_trips").select("*").order("created_at", { ascending: false }).then(function (res) {
          return res.error ? { ok: false, error: res.error, data: [] } : { ok: true, error: null, data: res.data || [] };
        });
      },
      save: function (destination, meta) {
        if (!ready) return fallback();
        return client.auth.getUser().then(function (r) {
          var user = r && r.data ? r.data.user : null;
          if (!user) return { ok: false, error: { message: "Not signed in." } };
          var row = {
            user_id: user.id,
            destination: destination,
            title: (meta && meta.title) || null,
            note: (meta && meta.note) || null
          };
          return client.from("saved_trips").insert(row).then(function (res) {
            return res.error ? { ok: false, error: res.error } : { ok: true, error: null };
          });
        });
      },
      remove: function (id) {
        if (!ready) return fallback();
        return client.from("saved_trips").delete().eq("id", id).then(function (res) {
          return res.error ? { ok: false, error: res.error } : { ok: true, error: null };
        });
      }
    },

    /** Escape hatch to the raw supabase-js client (storage, rpc, etc.). */
    raw: function () { return client; }
  };
})();
