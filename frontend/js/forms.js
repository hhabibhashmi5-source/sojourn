/* =========================================================
   SOJOURN — modals, inquiry capture & member auth
   Uses window.sojournDB (Supabase). Degrades gracefully when
   Supabase isn't configured yet.
   ========================================================= */
(function () {
  "use strict";

  var db = window.sojournDB;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ---------- Generic <dialog> modal helpers ---------- */
  var lastFocus = null;

  function openModal(id) {
    var dlg = document.getElementById(id);
    if (!dlg) return;
    lastFocus = document.activeElement;
    // Close the mobile menu if it's open.
    document.body.classList.remove("menu-open");
    document.body.style.overflow = "";
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    document.body.classList.add("modal-open");
    var firstInput = dlg.querySelector("input, select, textarea, button:not([data-close])");
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 40);
  }

  function closeModal(dlg) {
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Trigger buttons: [data-modal="inquiry" | "auth"]
  document.querySelectorAll("[data-modal]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var target = btn.getAttribute("data-modal");
      if (!target) return; // attribute removed once signed in (name button)
      e.preventDefault();
      openModal(target === "auth" ? "authModal" : "inquiryModal");
    });
  });

  // Close on ✕, backdrop click, and native cancel (Esc).
  document.querySelectorAll(".modal").forEach(function (dlg) {
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) closeModal(dlg);               // backdrop
      if (e.target.hasAttribute && e.target.hasAttribute("data-close")) closeModal(dlg);
    });
    dlg.addEventListener("cancel", function (e) {
      e.preventDefault();
      closeModal(dlg);
    });
  });

  function setNote(el, msg, state) {
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("is-success", state === "success");
    el.classList.toggle("is-error", state === "error");
  }

  function busy(btn, on, busyLabel) {
    if (!btn) return;
    if (on) { btn.dataset._label = btn.textContent; btn.disabled = true; btn.textContent = busyLabel || "Sending…"; }
    else { btn.disabled = false; if (btn.dataset._label) btn.textContent = btn.dataset._label; }
  }

  /* ---------- Inquiry form → inquiries table ---------- */
  var inquiryForm = document.getElementById("inquiryForm");
  var inquiryNote = document.getElementById("inquiryNote");
  if (inquiryForm) {
    inquiryForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      // Reference by id — form.name/form.type would resolve to the form's
      // own properties, not the child inputs.
      var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var payload = {
        type: val("iqType") || "advisory",
        name: val("iqName"),
        email: val("iqEmail"),
        destination: val("iqDestination") || null,
        travel_dates: val("iqDates") || null,
        party_size: val("iqParty") ? parseInt(val("iqParty"), 10) : null,
        message: val("iqMessage") || null
      };

      if (!payload.name) { setNote(inquiryNote, "Please share your name.", "error"); document.getElementById("iqName").focus(); return; }
      if (!EMAIL_RE.test(payload.email)) { setNote(inquiryNote, "Please enter a valid email.", "error"); document.getElementById("iqEmail").focus(); return; }

      var submit = inquiryForm.querySelector('button[type="submit"]');
      busy(submit, true);
      setNote(inquiryNote, "Sending your request…", null);

      var result = { ok: false, offline: true };
      try { if (db) result = await db.capture("inquiries", payload); }
      catch (err) { console.error("[Sojourn] inquiry error:", err); result = { ok: false, error: err }; }

      if (result.ok || result.offline) {
        setNote(inquiryNote, "Thank you, " + payload.name.split(" ")[0] + ". An advisor will be in touch shortly.", "success");
        inquiryForm.reset();
      } else {
        setNote(inquiryNote, "Something went wrong. Please try again.", "error");
      }
      busy(submit, false);
    });
  }

  /* ---------- Auth: sign in / register ---------- */
  var authForm = document.getElementById("authForm");
  var authNote = document.getElementById("authNote");
  var authSwitch = document.getElementById("authSwitch");
  var authSwitchText = document.getElementById("authSwitchText");
  var authMode = "signin"; // 'signin' | 'register'

  // Inject a self-chosen Username field into the shared auth modal.
  // Sits above Email; only visible in register mode (see applyAuthMode).
  (function injectUsername() {
    if (!authForm) return;
    var emailWrap = document.getElementById("auEmail");
    emailWrap = emailWrap ? emailWrap.closest(".field") : null;
    if (!emailWrap || document.getElementById("auUsernameField")) return;
    var field = document.createElement("div");
    field.className = "field";
    field.id = "auUsernameField";
    field.hidden = true; // sign-in is the default mode
    field.innerHTML =
      '<label for="auUsername">Username</label>' +
      '<input id="auUsername" type="text" autocomplete="username" maxlength="30" placeholder="Choose a username" />';
    emailWrap.parentNode.insertBefore(field, emailWrap);
  })();

  function applyAuthMode() {
    ["authTitle", "authSub", "authSubmit", "authSwitch"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.dataset[authMode]) el.textContent = el.dataset[authMode];
    });
    if (authSwitchText) authSwitchText.textContent = authMode === "signin" ? "New to Sojourn?" : "Already a member?";
    var pw = document.getElementById("auPassword");
    if (pw) pw.setAttribute("autocomplete", authMode === "signin" ? "current-password" : "new-password");
    var uf = document.getElementById("auUsernameField");
    if (uf) uf.hidden = authMode !== "register"; // username only when joining
    setNote(authNote, "", null);
  }

  if (authSwitch) {
    authSwitch.addEventListener("click", function () {
      authMode = authMode === "signin" ? "register" : "signin";
      applyAuthMode();
    });
  }

  if (authForm) {
    authForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var email = document.getElementById("auEmail").value.trim();
      var password = document.getElementById("auPassword").value;
      var usernameEl = document.getElementById("auUsername");
      var username = usernameEl ? usernameEl.value.trim() : "";
      if (authMode === "register" && username.length < 2) {
        setNote(authNote, "Please choose a username (2+ characters).", "error");
        if (usernameEl) usernameEl.focus();
        return;
      }
      if (!EMAIL_RE.test(email)) { setNote(authNote, "Please enter a valid email.", "error"); return; }
      if (password.length < 6) { setNote(authNote, "Password must be at least 6 characters.", "error"); return; }

      if (!db || !db.isReady()) {
        setNote(authNote, "Member accounts activate once Supabase is connected (see backend/SUPABASE_SETUP.md).", "error");
        return;
      }

      var submit = document.getElementById("authSubmit");
      busy(submit, true, "Please wait…");
      setNote(authNote, "", null);

      var result;
      try {
        result = authMode === "signin"
          ? await db.auth.signIn(email, password)
          : await db.auth.register(email, password, username);
      } catch (err) {
        console.error("[Sojourn] auth error:", err);
        result = { ok: false, error: err };
      }

      if (result.ok && result.needsConfirm) {
        setNote(authNote, "Almost there — check your inbox to confirm your email.", "success");
        busy(submit, false);
        return;
      }
      if (result.ok) {
        var greet = authMode === "signin" ? "Welcome back." : "Welcome to Sojourn, " + username + ".";
        setNote(authNote, greet, "success");
        setTimeout(function () { closeModal(document.getElementById("authModal")); }, 700);
      } else {
        var msg = (result.error && result.error.message) || "Unable to continue. Please try again.";
        setNote(authNote, msg, "error");
      }
      busy(submit, false);
    });
  }

  /* ---------- Header auth state ---------- */
  var signinBtn = document.getElementById("signinBtn");
  var signoutBtn = document.getElementById("signoutBtn");

  function goDashboard() { window.location.href = "dashboard.html"; }

  function renderAuthState(user) {
    if (!signinBtn) return;
    if (user) {
      var meta = user.user_metadata || {};
      var name = meta.username || (user.email || "Member").split("@")[0];
      signinBtn.textContent = name;
      signinBtn.title = "Your dashboard";
      signinBtn.removeAttribute("data-modal");
      // Signed in: the name button leads to the member dashboard.
      signinBtn.addEventListener("click", goDashboard);
      if (signoutBtn) signoutBtn.hidden = false;
    } else {
      signinBtn.textContent = "Sign In";
      signinBtn.removeAttribute("title");
      signinBtn.removeEventListener("click", goDashboard);
      signinBtn.setAttribute("data-modal", "auth");
      if (signoutBtn) signoutBtn.hidden = true;
    }
  }

  if (signoutBtn) {
    signoutBtn.addEventListener("click", async function () {
      if (db && db.auth) await db.auth.signOut();
      renderAuthState(null);
    });
  }

  if (db && db.auth && db.isReady()) {
    db.auth.onChange(renderAuthState);
  } else {
    renderAuthState(null);
  }
})();
