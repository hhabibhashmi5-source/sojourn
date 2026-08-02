/* =========================================================
   SOJOURN — Booking wizard (Phase 3)
   Multi-step request builder with a live summary. Captures to
   the Supabase `inquiries` table (type: booking/advisory) via
   window.sojournDB, with graceful fallback when unconfigured.
   ========================================================= */
(function () {
  "use strict";

  var db = window.sojournDB;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var form = document.getElementById("bookingWizard");
  if (!form) return;

  var panels = Array.prototype.slice.call(form.querySelectorAll(".wizard__panel"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".wizard__dot"));
  var backBtn = document.getElementById("wizBack");
  var nextBtn = document.getElementById("wizNext");
  var note = document.getElementById("wizNote");
  var stepNo = document.getElementById("wizStepNo");
  var current = 0;

  var state = {
    destination: "", when: "", nights: "",
    adults: "2", children: "0",
    occasion: "", style: "", budget: "",
    interests: [], notes: "",
    name: "", email: "", phone: ""
  };

  var params = new URLSearchParams(window.location.search);
  if (params.get("destination")) state.destination = params.get("destination");

  form.addEventListener("submit", function (e) { e.preventDefault(); });

  /* ---- Option cards (single & multi select) ---- */
  form.querySelectorAll(".option").forEach(function (opt) {
    var field = opt.getAttribute("data-field");
    var value = opt.getAttribute("data-value");
    var multi = opt.hasAttribute("data-multi");
    opt.addEventListener("click", function () {
      if (multi) {
        var i = state[field].indexOf(value);
        if (i === -1) { state[field].push(value); opt.classList.add("is-selected"); }
        else { state[field].splice(i, 1); opt.classList.remove("is-selected"); }
      } else {
        state[field] = value;
        form.querySelectorAll('.option[data-field="' + field + '"]').forEach(function (o) { o.classList.remove("is-selected"); });
        opt.classList.add("is-selected");
      }
      updateSummary();
    });
  });

  /* ---- Text / number / select inputs ---- */
  form.querySelectorAll("[data-input]").forEach(function (el) {
    var field = el.getAttribute("data-input");
    if (state[field]) el.value = state[field];
    el.addEventListener("input", function () { state[field] = el.value; updateSummary(); });
    el.addEventListener("change", function () { state[field] = el.value; updateSummary(); });
  });

  /* ---- Live summary ---- */
  function setSummary(id, val) {
    var el = document.getElementById(id);
    if (!el) return;
    if (val) { el.textContent = val; el.classList.remove("is-empty"); }
    else { el.textContent = el.getAttribute("data-empty") || "—"; el.classList.add("is-empty"); }
  }
  function travellers() {
    var a = parseInt(state.adults, 10) || 0, c = parseInt(state.children, 10) || 0;
    if (!a && !c) return "";
    var parts = [];
    if (a) parts.push(a + " adult" + (a > 1 ? "s" : ""));
    if (c) parts.push(c + " child" + (c > 1 ? "ren" : ""));
    return parts.join(", ");
  }
  function updateSummary() {
    setSummary("sumDest", state.destination);
    setSummary("sumWhen", state.when ? state.when + (state.nights ? " · " + state.nights + " nights" : "") : "");
    setSummary("sumWho", travellers());
    setSummary("sumStyle", state.style);
    setSummary("sumOccasion", state.occasion);
    setSummary("sumBudget", state.budget);
  }

  /* ---- Step navigation ---- */
  function showStep(i, scroll) {
    current = i;
    panels.forEach(function (p, idx) { p.classList.toggle("is-active", idx === i); });
    dots.forEach(function (d, idx) {
      d.classList.toggle("is-done", idx < i);
      d.classList.toggle("is-current", idx === i);
    });
    if (stepNo) stepNo.textContent = "Step " + (i + 1) + " of " + panels.length;
    backBtn.style.visibility = i === 0 ? "hidden" : "visible";
    nextBtn.textContent = i === panels.length - 1 ? "Submit Request" : "Continue";
    note.textContent = "";
    note.classList.remove("is-error");
    if (scroll) form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validateStep(i) {
    if (i === 0) {
      if (!state.destination) return "Please choose a destination (or 'Not sure yet').";
      if (!state.when.trim()) return "Roughly when would you like to travel?";
    }
    if (i === panels.length - 1) {
      if (!state.name.trim()) return "Please tell us your name.";
      if (!EMAIL_RE.test(state.email)) return "Please enter a valid email.";
    }
    return null;
  }

  backBtn.addEventListener("click", function () { if (current > 0) showStep(current - 1, true); });

  nextBtn.addEventListener("click", function () {
    var err = validateStep(current);
    if (err) { note.textContent = err; note.classList.add("is-error"); return; }
    if (current < panels.length - 1) { showStep(current + 1, true); return; }
    submit();
  });

  function composeMessage() {
    var lines = [];
    if (params.get("tier")) lines.push("Tier: " + params.get("tier"));
    if (state.occasion) lines.push("Occasion: " + state.occasion);
    if (state.style) lines.push("Stay style: " + state.style);
    if (state.budget) lines.push("Budget/night: " + state.budget);
    if (state.interests.length) lines.push("Interests: " + state.interests.join(", "));
    if (state.phone) lines.push("Phone: " + state.phone);
    if (state.notes) lines.push("Notes: " + state.notes);
    return lines.join("\n") || null;
  }

  function submit() {
    nextBtn.disabled = true; backBtn.disabled = true; nextBtn.textContent = "Sending…";
    var payload = {
      type: params.get("type") === "advisory" ? "advisory" : "booking",
      name: state.name.trim(),
      email: state.email.trim(),
      destination: state.destination || null,
      travel_dates: (state.when + (state.nights ? " (" + state.nights + " nights)" : "")).trim() || null,
      party_size: ((parseInt(state.adults, 10) || 0) + (parseInt(state.children, 10) || 0)) || null,
      message: composeMessage()
    };

    var done = function (result) {
      if (result.ok || result.offline) { showConfirm(); }
      else {
        nextBtn.disabled = false; backBtn.disabled = false; nextBtn.textContent = "Submit Request";
        note.textContent = "Something went wrong. Please try again."; note.classList.add("is-error");
      }
    };

    if (db) {
      db.capture("inquiries", payload)
        .then(done)
        .catch(function (e) { console.error("[Sojourn] booking error:", e); done({ ok: false }); });
    } else {
      done({ ok: false, offline: true });
    }
  }

  function showConfirm() {
    var wiz = document.getElementById("wizardCard");
    var conf = document.getElementById("bookingConfirm");
    if (wiz) wiz.style.display = "none";
    if (conf) {
      conf.classList.add("is-active");
      var who = document.getElementById("confName");
      if (who) who.textContent = state.name.split(" ")[0] || "traveller";
      var dest = document.getElementById("confDest");
      if (dest) dest.textContent = state.destination || "your journey";
      conf.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  updateSummary();
  showStep(0, false);
})();
