/* Barrie Insulation Systems — nav behaviour.
   Progressive enhancement only: every link works with JS disabled. */
(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  var header = document.querySelector(".site-header");
  if (!toggle || !nav) return;

  var scrim = document.createElement("div");
  scrim.className = "nav-scrim";
  document.body.appendChild(scrim);

  var desktop = function () { return window.matchMedia("(min-width: 1000px)").matches; };

  function closeMenu() {
    nav.classList.remove("open");
    scrim.classList.remove("show");
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  function openMenu() {
    nav.classList.add("open");
    scrim.classList.add("show");
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
  }

  toggle.addEventListener("click", function () {
    nav.classList.contains("open") ? closeMenu() : openMenu();
  });
  scrim.addEventListener("click", closeMenu);

  /* Dropdowns: the chevron button opens the submenu.
     On mobile it is an accordion; on desktop it supplements hover/focus. */
  var drops = Array.prototype.slice.call(document.querySelectorAll(".has-drop"));

  function closeDrops(except) {
    drops.forEach(function (d) {
      if (d === except) return;
      d.classList.remove("open");
      var b = d.querySelector(".drop-toggle");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }

  drops.forEach(function (item) {
    var btn = item.querySelector(".drop-toggle");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) closeDrops(item);
    });
  });

  document.addEventListener("click", function (e) {
    if (desktop() && !e.target.closest(".has-drop")) closeDrops(null);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    closeDrops(null);
    if (nav.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });

  /* Reset state when crossing the desktop breakpoint. */
  var wasDesktop = desktop();
  window.addEventListener("resize", function () {
    var now = desktop();
    if (now !== wasDesktop) {
      closeMenu();
      closeDrops(null);
      wasDesktop = now;
    }
  });

  /* Shadow the sticky header once the page scrolls. */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();

/* ---- Our Work: category filter + lightbox (progressive enhancement) ---- */
(function () {
  "use strict";

  var bar = document.querySelector(".filter-bar");
  var grid = document.getElementById("work-gallery");
  if (bar && grid) {
    var empty = document.querySelector(".gal-empty");
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      var want = btn.dataset.filter;
      bar.querySelectorAll(".filter-btn").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      var shown = 0;
      grid.querySelectorAll(".gal-item").forEach(function (item) {
        var show = want === "All" || item.dataset.cat === want;
        item.hidden = !show;
        if (show) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  var box = document.getElementById("lightbox");
  if (!box) return;
  var img = box.querySelector(".lb-img");
  var cap = box.querySelector(".lb-cap");
  var closeBtn = box.querySelector(".lb-close");
  var opener = null;

  function open(btn) {
    opener = btn;
    img.src = btn.dataset.full;
    img.alt = btn.getAttribute("aria-label").replace(/^Enlarge photo:\s*/, "");
    cap.textContent = btn.dataset.cap || "";
    box.hidden = false;
    document.body.classList.add("nav-open");
    closeBtn.focus();
  }

  function close() {
    box.hidden = true;
    img.src = "";
    document.body.classList.remove("nav-open");
    if (opener) opener.focus();
  }

  document.addEventListener("click", function (e) {
    var zoom = e.target.closest(".gal-zoom");
    if (zoom && zoom.dataset.full) {
      e.preventDefault();
      open(zoom);
      return;
    }
    if (!box.hidden && (e.target === box || e.target.closest(".lb-close"))) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !box.hidden) close();
  });
})();

/* ---- "Which insulation do I need?" — deterministic product matching ---- */
(function () {
  "use strict";
  var root = document.querySelector(".selector");
  if (!root) return;

  var rules, names;
  try {
    rules = JSON.parse(root.dataset.rules);
    names = JSON.parse(root.dataset.names);
  } catch (e) { return; }

  var steps = [].slice.call(root.querySelectorAll(".sel-step"));
  var result = root.querySelector(".sel-result");
  var answers = {};

  function match() {
    for (var i = 0; i < rules.length; i++) {
      var m = rules[i].m, ok = true;
      for (var k in m) { if (answers[k] !== m[k]) { ok = false; break; } }
      if (ok) return rules[i];
    }
    return rules[rules.length - 1];
  }

  function show(n) {
    steps.forEach(function (s) { s.hidden = Number(s.dataset.step) !== n; });
    result.hidden = true;
  }

  function finish() {
    var r = match();
    steps.forEach(function (s) { s.hidden = true; });
    root.querySelector(".sel-head").textContent = r.h;
    root.querySelector(".sel-why").textContent = r.why;
    var link = root.querySelector(".sel-link");
    link.href = r.svc === "services" ? "/services/" : "/services/" + r.svc + "/";
    link.textContent = "Read about " + (names[r.svc] || "our services").toLowerCase();
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  root.addEventListener("click", function (e) {
    var opt = e.target.closest(".sel-opt");
    if (opt) {
      answers[opt.dataset.key] = opt.dataset.val;
      var step = Number(opt.closest(".sel-step").dataset.step);
      opt.closest(".sel-opts").querySelectorAll(".sel-opt").forEach(function (b) {
        b.classList.toggle("is-on", b === opt);
      });
      if (step < steps.length) { show(step + 1); } else { finish(); }
      return;
    }
    if (e.target.closest(".sel-restart")) {
      answers = {};
      root.querySelectorAll(".sel-opt").forEach(function (b) { b.classList.remove("is-on"); });
      show(1);
      root.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });

  result.setAttribute("tabindex", "-1");
})();

/* ---- Truck drives in when its section reaches the viewport ------------- */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var band = document.querySelector(".truck-band");
  if (!band) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    band.classList.add("is-in");
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.28, rootMargin: "0px 0px -8% 0px" });

  io.observe(band);
})();

/* ---- Quote form: contractor / homeowner branch ------------------------- */
(function () {
  "use strict";
  var wrap = document.querySelector(".audience-form");
  if (!wrap) return;

  var tabs = [].slice.call(wrap.querySelectorAll(".aud-btn"));
  var panels = [].slice.call(wrap.querySelectorAll(".aud-panel"));
  if (!tabs.length) return;

  function select(key, focusPanel) {
    tabs.forEach(function (t) {
      t.setAttribute("aria-selected", t.dataset.aud === key ? "true" : "false");
    });
    panels.forEach(function (p) {
      p.hidden = p.id !== "aud-panel-" + key;
    });
    var panel = document.getElementById("aud-panel-" + key);
    if (panel && focusPanel) {
      panel.setAttribute("tabindex", "-1");
      panel.focus({ preventScroll: true });
    }
    try { history.replaceState(null, "", "#" + key); } catch (e) {}
  }

  wrap.addEventListener("click", function (e) {
    var btn = e.target.closest(".aud-btn");
    if (btn) select(btn.dataset.aud, true);
  });

  /* left/right arrows move between the two options, as tablists should */
  wrap.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var i = tabs.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    select(next.dataset.aud, false);
  });

  /* /contact/#contractor opens straight into that form */
  var hash = (location.hash || "").replace("#", "");
  if (tabs.some(function (t) { return t.dataset.aud === hash; })) select(hash, false);
})();
