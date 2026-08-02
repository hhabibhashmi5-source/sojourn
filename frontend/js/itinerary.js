/* =========================================================
   SOJOURN — AI Itinerary (Phase 4b)
   Calls the Supabase Edge Function `itinerary`, which talks to
   Claude server-side. The Anthropic key lives in Supabase secrets,
   never in the browser. Renders the returned JSON with textContent
   (XSS-safe).
   ========================================================= */
(function () {
  "use strict";

  var cfg = window.SOJOURN_CONFIG || {};
  var FN_URL = cfg.SUPABASE_URL ? cfg.SUPABASE_URL.replace(/\/$/, "") + "/functions/v1/itinerary" : "";
  var ANON = cfg.SUPABASE_ANON_KEY || "";

  var form = document.getElementById("itinForm");
  var submit = document.getElementById("itSubmit");
  var note = document.getElementById("itNote");
  var empty = document.getElementById("itinEmpty");
  var loading = document.getElementById("itinLoading");
  var doc = document.getElementById("itinDoc");

  if (!form) return;

  function show(el) { if (el) el.classList.remove("is-hidden"); }
  function hide(el) { if (el) el.classList.add("is-hidden"); }

  function setNote(msg, isError) {
    if (!note) return;
    note.textContent = msg || "";
    note.classList.toggle("is-error", !!isError);
  }

  function busy(on) {
    if (!submit) return;
    submit.disabled = on;
    submit.textContent = on ? "Composing…" : "Compose my itinerary";
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function slot(label, value) {
    var row = el("div", "itin-slot");
    row.appendChild(el("div", "itin-slot__k", label));
    row.appendChild(el("div", "itin-slot__v", value || "—"));
    return row;
  }

  function render(it) {
    doc.textContent = "";
    if (!it || typeof it !== "object") { setNote("Unexpected response — please try again.", true); return; }

    doc.appendChild(el("h2", "itin-doc__title", it.title || "Your itinerary"));
    if (it.overview) doc.appendChild(el("p", "itin-doc__overview", it.overview));

    (it.days || []).forEach(function (d) {
      var card = el("div", "itin-day");
      var head = el("div", "itin-day__head");
      head.appendChild(el("span", "itin-day__no", "Day " + (d.day != null ? d.day : "")));
      head.appendChild(el("span", "itin-day__title", d.title || ""));
      card.appendChild(head);
      card.appendChild(slot("Morning", d.morning));
      card.appendChild(slot("Afternoon", d.afternoon));
      card.appendChild(slot("Evening", d.evening));
      doc.appendChild(card);
    });

    if (it.tips && it.tips.length) {
      var tips = el("div", "itin-tips");
      tips.appendChild(el("h3", null, "Advisor's tips"));
      var ul = el("ul");
      it.tips.forEach(function (t) { ul.appendChild(el("li", null, t)); });
      tips.appendChild(ul);
      doc.appendChild(tips);
    }

    var actions = el("div", "itin-actions");
    var book = el("a", "btn btn--solid", "Have an advisor perfect this");
    book.href = "booking.html";
    var again = el("button", "btn btn--ghost-dark", "Compose another");
    again.type = "button";
    again.addEventListener("click", function () {
      hide(doc); show(empty); setNote(""); window.scrollTo({ top: 0, behavior: "smooth" });
    });
    actions.appendChild(book);
    actions.appendChild(again);
    doc.appendChild(actions);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var destination = (document.getElementById("itDest").value || "").trim();
    if (!destination) { setNote("Please enter a destination.", true); document.getElementById("itDest").focus(); return; }

    if (!FN_URL) { setNote("The itinerary service isn't configured yet.", true); return; }

    var payload = {
      destination: destination,
      days: parseInt(document.getElementById("itDays").value, 10) || 5,
      month: (document.getElementById("itMonth").value || "").trim(),
      travelers: (document.getElementById("itTravelers").value || "").trim(),
      pace: document.getElementById("itPace").value,
      budget: document.getElementById("itBudget").value,
      interests: (document.getElementById("itInterests").value || "").trim(),
      notes: (document.getElementById("itNotes").value || "").trim()
    };

    busy(true);
    setNote("");
    hide(empty); hide(doc); show(loading);

    // Guard against a hung request (thinking can take a while).
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 90000);

    fetch(FN_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "apikey": ANON,
        "authorization": "Bearer " + ANON
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })
      .then(function (res) {
        return res.json().then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (r) {
        hide(loading);
        if (r.ok && r.data && r.data.itinerary) {
          show(doc);
          render(r.data.itinerary);
        } else {
          show(empty);
          setNote((r.data && r.data.error) || "Couldn't compose an itinerary. Please try again.", true);
        }
      })
      .catch(function (err) {
        hide(loading); show(empty);
        if (err && err.name === "AbortError") setNote("That took too long. Please try again with a shorter trip.", true);
        else setNote("Network error — is the itinerary service deployed? Please try again.", true);
      })
      .finally(function () {
        clearTimeout(timer);
        busy(false);
      });
  });
})();
