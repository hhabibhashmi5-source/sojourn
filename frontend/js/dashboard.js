/* =========================================================
   SOJOURN — Member dashboard (Phase 4a)
   Auth-gated view of a member's own requests + saved trips.
   Reads/writes are protected by row-level security (see
   supabase/schema.sql): members only ever touch their own rows.
   Auth itself is handled by the shared modal in js/forms.js;
   this script reacts to auth state and renders member content.
   ========================================================= */
(function () {
  "use strict";

  var db = window.sojournDB;

  var signedOut = document.getElementById("dashSignedOut");
  var signedIn = document.getElementById("dashSignedIn");
  var reqBox = document.getElementById("dashRequests");
  var tripBox = document.getElementById("dashTrips");
  var tripSelect = document.getElementById("tripSelect");
  var tripAdd = document.getElementById("tripAdd");
  var tripNote = document.getElementById("tripNote");

  var currentUser = null;

  /* ---------- Helpers ---------- */
  function show(el) { if (el) el.classList.remove("is-hidden"); }
  function hide(el) { if (el) el.classList.add("is-hidden"); }
  function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

  function setNote(msg, state) {
    if (!tripNote) return;
    tripNote.textContent = msg || "";
    tripNote.classList.toggle("is-error", state === "error");
    tripNote.classList.toggle("is-success", state === "success");
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    try {
      var d = new Date(iso);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch (e) { return String(iso); }
  }

  /* ---------- Profile ---------- */
  function renderProfile(user) {
    var meta = user.user_metadata || {};
    var fallback = (user.email || "Member").split("@")[0];
    var name = meta.username || (fallback.charAt(0).toUpperCase() + fallback.slice(1));
    setText("dashName", name);
    setText("dashUsername", meta.username || "—");
    setText("dashEmail", user.email || "—");
    setText("dashSince", fmtDate(user.created_at));
  }

  /* ---------- Requests ---------- */
  function loadRequests() {
    if (!reqBox) return;
    db.myInquiries().then(function (res) {
      var rows = res.data || [];
      setText("dashReqCount", rows.length);
      if (!rows.length) {
        reqBox.innerHTML = '<p class="dash-empty">No requests yet. <a class="link-inline" href="booking.html">Plan your first journey →</a></p>';
        return;
      }
      reqBox.innerHTML = rows.map(reqHtml).join("");
    });
  }

  function reqHtml(r) {
    var type = r.type === "booking" ? "booking" : "advisory";
    var bits = [];
    if (r.travel_dates) bits.push(esc(r.travel_dates));
    if (r.party_size != null) bits.push(esc(String(r.party_size)) + " travelling");
    return '<div class="req">' +
      '<div class="req__head">' +
        '<span class="req__dest">' + esc(r.destination || "To be decided") + '</span>' +
        '<span class="req__when"><span class="pill pill--' + type + '">' + esc(type) + '</span> &nbsp;' + esc(fmtDate(r.created_at)) + '</span>' +
      '</div>' +
      (bits.length ? '<p class="req__meta">' + bits.join(" · ") + '</p>' : '') +
      '</div>';
  }

  /* ---------- Saved trips ---------- */
  function loadTrips() {
    if (!tripBox) return;
    db.trips.list().then(function (res) {
      var rows = res.data || [];
      setText("dashTripCount", rows.length);
      if (!rows.length) {
        tripBox.innerHTML = '<p class="dash-empty">No saved trips yet. Add one below.</p>';
        return;
      }
      tripBox.innerHTML = '<div class="trip-grid">' + rows.map(tripHtml).join("") + '</div>';
    });
  }

  function tripHtml(t) {
    return '<div class="trip">' +
      '<button class="trip__remove" type="button" data-id="' + esc(t.id) + '" aria-label="Remove ' + esc(t.destination) + '">&times;</button>' +
      '<div class="trip__dest">' + esc(t.destination) + '</div>' +
      (t.note ? '<p class="trip__note">' + esc(t.note) + '</p>' : '') +
      '</div>';
  }

  /* ---------- Add / remove trips ---------- */
  if (tripAdd) {
    tripAdd.addEventListener("click", function () {
      var dest = tripSelect ? tripSelect.value : "";
      if (!dest) { setNote("Pick a destination first.", "error"); return; }
      tripAdd.disabled = true;
      setNote("Saving…", null);
      db.trips.save(dest).then(function (res) {
        tripAdd.disabled = false;
        if (res.ok) {
          setNote(dest + " saved.", "success");
          if (tripSelect) tripSelect.value = "";
          loadTrips();
        } else {
          setNote((res.error && res.error.message) || "Couldn't save. Try again.", "error");
        }
      });
    });
  }

  if (tripBox) {
    tripBox.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest(".trip__remove") : null;
      if (!btn) return;
      var id = btn.getAttribute("data-id");
      btn.disabled = true;
      db.trips.remove(id).then(function (res) {
        if (res.ok) { loadTrips(); }
        else { btn.disabled = false; setNote("Couldn't remove. Try again.", "error"); }
      });
    });
  }

  /* ---------- Sign out ---------- */
  var signoutBtn = document.getElementById("dashSignout");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", function () {
      if (db && db.auth) db.auth.signOut();
      // renderState(null) will fire via onChange; render immediately too.
      renderState(null);
    });
  }

  /* ---------- Auth-driven view ---------- */
  function renderState(user) {
    currentUser = user;
    if (user) {
      hide(signedOut); show(signedIn);
      renderProfile(user);
      loadRequests();
      loadTrips();
    } else {
      show(signedOut); hide(signedIn);
      setNote("", null);
    }
  }

  /* ---------- Boot ---------- */
  if (db && db.isReady()) {
    db.auth.onChange(renderState);
  } else {
    renderState(null);
    var sub = document.getElementById("dashHeroSub");
    if (sub) sub.textContent = "Member accounts activate once Supabase is connected.";
  }
})();
