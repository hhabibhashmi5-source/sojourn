/* =========================================================
   SOJOURN — Phase 1 interactions
   Kept dependency-free and progressive. Deepened in Phase 5.
   ========================================================= */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Deferred background images (hero + advisory band) ----
     Set as data-bg so the LCP paint isn't blocked, then swap in. */
  document.querySelectorAll("[data-bg]").forEach((el) => {
    const url = el.getAttribute("data-bg");
    if (!url) return;
    const img = new Image();
    img.onload = () => { el.style.backgroundImage = `url("${url}")`; el.classList.add("is-loaded"); };
    img.onerror = () => { el.classList.add("bg-failed"); }; // CSS fallback colour stays
    img.src = url;
  });

  /* ---- Sticky header state on scroll ---- */
  const header = document.getElementById("header");
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Announcement dismiss ---- */
  const announce = document.getElementById("announce");
  const announceClose = document.getElementById("announceClose");
  if (announce && announceClose) {
    announceClose.addEventListener("click", () => announce.classList.add("is-hidden"));
  }

  /* ---- Mobile menu ---- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (mobileMenu) mobileMenu.setAttribute("aria-hidden", String(!open));
  };
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", () =>
      setMenu(!document.body.classList.contains("menu-open"))
    );
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => setMenu(false))
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) setMenu(false);
    });
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---- Animated stat counters ---- */
  const counters = document.querySelectorAll(".stat__num[data-count]");
  const runCount = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (prefersReduced) { el.textContent = String(target); return; }
    const duration = 1500;
    let startTime = null;
    const step = (ts) => {
      if (startTime === null) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && counters.length) {
    const cio = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { runCount(entry.target); obs.unobserve(entry.target); }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => cio.observe(c));
  }

  /* ---- Newsletter form → Supabase (with graceful fallback) ---- */
  const form = document.getElementById("signupForm");
  const note = document.getElementById("signupNote");
  if (form && note) {
    const btn = form.querySelector('button[type="submit"]');
    const btnLabel = btn ? btn.textContent : "";
    const setNote = (msg, state) => {
      note.textContent = msg;
      note.classList.toggle("is-success", state === "success");
      note.classList.toggle("is-error", state === "error");
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("email");
      const value = (input.value || "").trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      if (!valid) {
        setNote("Please enter a valid email address.", "error");
        input.focus();
        return;
      }

      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      setNote("Sending…", null);

      let result = { ok: false, offline: true };
      try {
        if (window.sojournDB) {
          result = await window.sojournDB.subscribe(value, { source: "homepage" });
        }
      } catch (err) {
        console.error("[Sojourn] subscribe error:", err);
        result = { ok: false, error: err };
      }

      if (result.ok) {
        setNote(
          result.duplicate
            ? "You're already on the list — thank you."
            : "Thank you — your invitation is on its way.",
          "success"
        );
        form.reset();
      } else if (result.offline) {
        // Not configured / offline: keep the elegant simulated confirmation.
        setNote("Thank you — your invitation is on its way.", "success");
        form.reset();
      } else {
        setNote("Something went wrong. Please try again.", "error");
      }

      if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
    });
  }

  /* ---- Footer year ---- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Privacy notice (shown once, on first visit) ---- */
  try {
    if (!localStorage.getItem("sojourn-privacy-ack")) {
      const pb = document.createElement("div");
      pb.className = "privacy-banner";
      pb.setAttribute("role", "dialog");
      pb.setAttribute("aria-label", "Privacy notice");
      pb.innerHTML =
        '<p class="privacy-banner__text">We use only the data needed to run Sojourn. See our <a href="privacy.html">Privacy Policy</a>.</p>' +
        '<button class="btn btn--solid btn--sm privacy-banner__ok" type="button">Got it</button>';
      document.body.appendChild(pb);
      requestAnimationFrame(() => pb.classList.add("is-shown"));
      pb.querySelector(".privacy-banner__ok").addEventListener("click", () => {
        try { localStorage.setItem("sojourn-privacy-ack", "1"); } catch (e) {}
        pb.classList.remove("is-shown");
        setTimeout(() => pb.remove(), 350);
      });
    }
  } catch (e) { /* localStorage unavailable — skip the notice */ }

  /* ---- Service worker (PWA: installable + offline-resilient) ---- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((err) =>
        console.warn("[Sojourn] SW registration failed:", err)
      );
    });
  }
})();
