/* =========================================================
   SOJOURN — Service Worker (PWA)
   Makes the site installable + resilient offline. Network-first
   for pages (always fresh when online), cache-first for static
   assets. Only same-origin GETs are handled; Unsplash images,
   Google Fonts and Supabase always go straight to the network.
   ========================================================= */
const CACHE = "sojourn-v1";
const PRECACHE = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./css/pages.css",
  "./assets/favicon.svg",
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {}) // don't fail install if one asset is momentarily unavailable
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let cross-origin (images/fonts/supabase) pass through

  // Pages: network-first, fall back to cache, then the cached home shell.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  // Static assets: cache-first, then network (and cache it for next time).
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
    )
  );
});
