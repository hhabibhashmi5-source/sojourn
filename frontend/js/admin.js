/* =========================================================
   SOJOURN — Advisor Desk (admin, Phase 3 polish)
   Owner-only view of the `inquiries` table. Reads are gated by
   Supabase Auth + row-level security: only the signed-in owner
   account can SELECT (see supabase/schema.sql). This client-side
   email check is just UX — RLS is the real lock.
   ========================================================= */
(function () {
  "use strict";

  var db = window.sojournDB;
  // Allowlist of admin accounts. Must stay in sync with the RLS
  // policies in backend/schema.sql — RLS is the real lock, this is UX.
  var OWNERS = [
    "hhabibhashmi5@gmail.com",
    "absarajammalik1@gmail.com"
  ];
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var gate = document.getElementById("deskGate");
  var panel = document.getElementById("deskPanel");
  var gateForm = document.getElementById("gateForm");
  var gateNote = document.getElementById("gateNote");
  var gateSubmit = document.getElementById("gateSubmit");
  var deskWho = document.getElementById("deskWho");
  var deskRows = document.getElementById("deskRows");
  var deskEmpty = document.getElementById("deskEmpty");

  var allRows = [];
  var currentFilter = "all";

  /* ---------- Helpers ---------- */
  function show(el) { if (el) el.classList.remove("is-hidden"); }
  function hide(el) { if (el) el.classList.add("is-hidden"); }

  function setNote(msg, state) {
    if (!gateNote) return;
    gateNote.textContent = msg || "";
    gateNote.classList.toggle("is-error", state === "error");
    gateNote.classList.toggle("is-success", state === "success");
  }

  function busy(on) {
    if (!gateSubmit) return;
    gateSubmit.disabled = on;
    gateSubmit.textContent = on ? "Please wait…" : "Sign In";
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
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) +
        " · " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    } catch (e) { return String(iso); }
  }

  function isOwner(user) {
    return !!(user && user.email && OWNERS.indexOf(user.email.toLowerCase()) !== -1);
  }

  /* ---------- Views ---------- */
  function gateView() { show(gate); hide(panel); }

  function panelView(user) {
    hide(gate); show(panel);
    if (deskWho) deskWho.textContent = "Signed in as " + user.email;
    loadData();
  }

  /* ---------- Data ---------- */
  function loadData() {
    var client = db && db.raw();
    if (!client) return;

    client.from("inquiries").select("*").order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) {
          console.error("[Sojourn] desk load error:", res.error);
          allRows = [];
        } else {
          allRows = res.data || [];
        }
        setStat("statTotal", allRows.length);
        setStat("statBooking", allRows.filter(function (r) { return r.type === "booking"; }).length);
        setStat("statAdvisory", allRows.filter(function (r) { return r.type === "advisory"; }).length);
        render();
      });

    client.from("subscribers").select("id", { count: "exact", head: true })
      .then(function (res) {
        var n = (res.count != null) ? res.count : ((res.data && res.data.length) || 0);
        setStat("statSubs", n);
      });
  }

  function setStat(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ---------- Render ---------- */
  function render() {
    var list = currentFilter === "all"
      ? allRows
      : allRows.filter(function (r) { return r.type === currentFilter; });

    if (!list.length) { deskRows.innerHTML = ""; show(deskEmpty); return; }
    hide(deskEmpty);
    deskRows.innerHTML = list.map(rowHtml).join("");
  }

  function rowHtml(r) {
    var type = r.type === "booking" ? "booking" : "advisory";
    return "<tr>" +
      "<td><span class='pill pill--" + type + "'>" + esc(type) + "</span></td>" +
      "<td>" + esc(r.name || "—") + "</td>" +
      "<td class='cell-mail'><a href='mailto:" + esc(r.email || "") + "'>" + esc(r.email || "—") + "</a></td>" +
      "<td>" + esc(r.destination || "—") + "</td>" +
      "<td>" + esc(r.travel_dates || "—") + "</td>" +
      "<td>" + (r.party_size != null ? esc(String(r.party_size)) : "—") + "</td>" +
      "<td class='cell-msg'>" + esc(r.message || "—") + "</td>" +
      "<td class='cell-when'>" + esc(fmtDate(r.created_at)) + "</td>" +
      "</tr>";
  }

  /* ---------- Tabs ---------- */
  Array.prototype.slice.call(document.querySelectorAll(".tab")).forEach(function (tab) {
    tab.addEventListener("click", function () {
      currentFilter = tab.getAttribute("data-filter");
      document.querySelectorAll(".tab").forEach(function (t) { t.classList.toggle("is-active", t === tab); });
      render();
    });
  });

  /* ---------- Refresh / sign out ---------- */
  var refreshBtn = document.getElementById("deskRefresh");
  if (refreshBtn) refreshBtn.addEventListener("click", loadData);

  var signoutBtn = document.getElementById("deskSignout");
  if (signoutBtn) {
    signoutBtn.addEventListener("click", function () {
      if (db && db.auth) db.auth.signOut();
      allRows = [];
      gateView();
      if (gateForm) gateForm.reset();
      setNote("", null);
    });
  }

  /* ---------- Sign-in ---------- */
  if (gateForm) {
    gateForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("gateEmail").value.trim();
      var pw = document.getElementById("gatePassword").value;
      if (!EMAIL_RE.test(email)) { setNote("Enter a valid email.", "error"); return; }
      if (pw.length < 6) { setNote("Password must be at least 6 characters.", "error"); return; }
      if (!db || !db.isReady()) { setNote("Supabase isn't connected (check js/config.js).", "error"); return; }

      busy(true);
      setNote("", null);
      db.auth.signIn(email, pw).then(function (res) {
        busy(false);
        if (res.ok && res.user) {
          if (isOwner(res.user)) { setNote("Welcome.", "success"); panelView(res.user); }
          else { db.auth.signOut(); setNote("That account isn't authorized for the desk.", "error"); }
        } else if (res.needsConfirm) {
          setNote("Confirm your email first, or create the user with Auto-Confirm in Supabase.", "error");
        } else if (res.offline) {
          setNote("Supabase isn't connected (check js/config.js).", "error");
        } else {
          setNote((res.error && res.error.message) || "Sign-in failed. Check your details.", "error");
        }
      }).catch(function (err) {
        busy(false);
        console.error("[Sojourn] desk sign-in error:", err);
        setNote("Sign-in failed. Please try again.", "error");
      });
    });
  }

  /* ---------- Boot ---------- */
  (function boot() {
    if (!db || !db.isReady()) {
      gateView();
      setNote("Supabase isn't connected yet — add your keys in js/config.js.", "error");
      return;
    }
    db.auth.current().then(function (user) {
      if (isOwner(user)) { panelView(user); }
      else if (user) { db.auth.signOut(); gateView(); }
      else { gateView(); }
    }).catch(function () { gateView(); });
  })();
})();
