// MARKU – kleine Interaktionen (kein Framework nötig)
(function () {
  // Zentrale Kontaktdaten für das Formular
  var WHATSAPP = "4915255682011";
  var EMAIL = "marku.services@gmail.com";

  // Mobile Navigation
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    });
  }

  // Einblenden beim Scrollen
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Galerie-Lightbox
  var lb = document.getElementById("lightbox");
  if (lb) {
    var lbImg = lb.querySelector("img");
    document.querySelectorAll(".gallery figure").forEach(function (fig) {
      fig.addEventListener("click", function () {
        var img = fig.querySelector("img");
        lbImg.src = img.src; lbImg.alt = img.alt; lb.classList.add("open");
      });
    });
    lb.addEventListener("click", function (e) { if (e.target !== lbImg) lb.classList.remove("open"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.classList.remove("open"); });
  }

  // Kontaktformular -> WhatsApp oder E-Mail
  var form = document.getElementById("contact-form");
  if (form) {
    var err = document.getElementById("form-error");
    var via = "whatsapp";
    form.querySelectorAll("button[data-via]").forEach(function (b) {
      b.addEventListener("click", function () { via = b.dataset.via; });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var name = f.name.value.trim(), msg = f.message.value.trim();
      if (!name || !msg) { return showErr("Bitte geben Sie Ihren Namen und eine Nachricht ein."); }
      if (!document.getElementById("f-consent").checked) { return showErr("Bitte stimmen Sie der Verarbeitung Ihrer Angaben zu."); }
      err.style.display = "none";

      var service = f.service.selectedIndex > 0 ? f.service.value : "";
      var opt = function (label, v) { v = v.trim(); return v ? label + ": " + v : null; };
      var lines = [
        "Anfrage über die Website",
        "Name: " + name,
        opt("Telefon", f.phone.value),
        opt("E-Mail", f.email.value),
        opt("Ort/Objekt", f.place.value),
        opt("Leistung", service),
        "",
        msg
      ].filter(function (l) { return l !== null; });
      var text = lines.join("\n");

      if (via === "mail") {
        var subject = "Anfrage" + (service ? ": " + service : "") + " – " + name;
        window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      } else {
        window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      }
    });
    function showErr(t) { err.textContent = t; err.style.display = "block"; }
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

// Fenster-Wisch-Demo: verschmutzte Glasscheibe über echtem Foto
(function () {
  var box = document.getElementById("wipe");
  if (!box) return;
  var img = box.querySelector("img"), cv = box.querySelector("canvas"), ctx = cv.getContext("2d");
  var sq = box.querySelector(".squeegee"), bar = box.querySelector(".wipe__meter b"), pct = box.querySelector(".wipe__pct");
  var W, H, dpr, autoRun = 0, userTouched = false, played = false, done = false;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function drawDirt() {
    var r = box.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(r.width - 20); H = Math.round(r.height - 20); // minus Rahmen
    if (W < 10) return;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    // Foto "cover" zeichnen, unscharf & trüb wie durch eine schmutzige Scheibe
    var s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    var iw = img.naturalWidth * s, ih = img.naturalHeight * s;
    ctx.filter = "blur(6px) saturate(0.55) brightness(1.05) contrast(0.72)";
    ctx.drawImage(img, (W - iw) / 2, (H - ih) / 2, iw, ih);
    ctx.filter = "none";
    // Grauschleier, unten stärker (Staub)
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(214,214,206,.34)"); g.addColorStop(1, "rgba(176,168,150,.52)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // Regenläufer: senkrechte, leicht wellige Schlieren
    for (var i = 0; i < 70; i++) {
      var x = rnd(0, W), y = rnd(-H * .2, H * .6), len = rnd(H * .15, H * .6);
      ctx.strokeStyle = "rgba(240,238,230," + rnd(.06, .2) + ")"; ctx.lineWidth = rnd(1, 4);
      ctx.beginPath(); ctx.moveTo(x, y);
      for (var t = 0; t < len; t += 12) ctx.lineTo(x + Math.sin((y + t) / rnd(18, 30)) * 1.6, y + t);
      ctx.stroke();
    }
    // Eingetrocknete Wassertropfen (Kalkränder)
    for (var j = 0; j < 140; j++) {
      var cx = rnd(0, W), cy = rnd(0, H), rr = rnd(1.5, 6);
      ctx.strokeStyle = "rgba(250,248,240," + rnd(.15, .45) + ")"; ctx.lineWidth = rnd(.6, 1.4);
      ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * rnd(.8, 1.2), 0, 0, Math.PI * 2); ctx.stroke();
    }
    // Wischspuren eines schlechten Putzversuchs
    for (var k = 0; k < 5; k++) {
      ctx.strokeStyle = "rgba(235,232,222,.10)"; ctx.lineWidth = rnd(30, 60); ctx.lineCap = "round";
      ctx.beginPath(); var ax = rnd(0, W), ay = rnd(0, H);
      ctx.arc(ax, ay, rnd(W * .15, W * .35), rnd(0, 3), rnd(3, 6)); ctx.stroke();
    }
    done = false; box.classList.remove("is-done"); update(true);
  }

  function erase(x0, y0, x1, y1, blade) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = ctx.strokeStyle = "#000";
    if (blade) { // Abzieher: waagerechte Klinge, Bewegung nach unten
      var hw = blade / 2;
      ctx.beginPath(); ctx.moveTo(x0 - hw, y0); ctx.lineTo(x0 + hw, y0); ctx.lineTo(x1 + hw, y1); ctx.lineTo(x1 - hw, y1); ctx.closePath(); ctx.fill();
    } else {     // Finger / Maus: weiches Tuch
      ctx.lineCap = "round"; ctx.lineWidth = Math.max(40, W * .11);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  var lastCheck = 0;
  function update(force) {
    var now = performance.now();
    if (!force && now - lastCheck < 200) return;
    lastCheck = now;
    var d = ctx.getImageData(0, 0, cv.width, cv.height).data, clear = 0, n = 0, step = 4 * 37;
    for (var i = 3; i < d.length; i += step) { n++; if (d[i] < 40) clear++; }
    var p = Math.round(clear / n * 100);
    bar.style.width = p + "%"; pct.textContent = p + " %";
    if (p >= 90 && !done) { done = true; box.classList.add("is-done"); ctx.clearRect(0, 0, W, H); bar.style.width = "100%"; pct.textContent = "100 %"; }
  }

  // Automatische Vorführung: senkrechte Bahnen mit dem Abzieher
  function autoplay() {
    if (played || userTouched || reduce) return;
    played = true; box.classList.add("is-auto");
    var blade = W * .27, cols = Math.ceil(W / (blade * .92)), col = 0, run = ++autoRun;
    var sqW = sq.offsetWidth;
    function stroke() {
      if (run !== autoRun || userTouched) return finish();
      if (col >= cols) return finish();
      var x = Math.min(blade / 2 + col * blade * .92, W - blade / 2), y = -10, last = y, t0 = null, dur = 1100;
      function frame(ts) {
        if (run !== autoRun || userTouched) return finish();
        if (!t0) t0 = ts;
        var k = Math.min(1, (ts - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        y = -10 + e * (H + 20);
        erase(x, last - 3, x, y, blade); last = y;
        sq.style.transform = "translate(" + (x - sqW / 2 + 10) + "px," + (y - sqW * .28 + 10) + "px)";
        update();
        if (k < 1) requestAnimationFrame(frame); else { col++; setTimeout(stroke, 160); }
      }
      requestAnimationFrame(frame);
    }
    stroke();
  }
  function finish() { box.classList.remove("is-auto"); update(true); }

  // Selbst wischen
  var drawing = false, px, py;
  function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  cv.addEventListener("pointerdown", function (e) {
    userTouched = true; autoRun++; box.classList.remove("is-auto");
    drawing = true; var p = pos(e); px = p[0]; py = p[1]; erase(px, py, px + .1, py + .1); cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener("pointermove", function (e) {
    if (!drawing) return; var p = pos(e); erase(px, py, p[0], p[1]); px = p[0]; py = p[1]; update();
  });
  ["pointerup", "pointercancel"].forEach(function (t) { cv.addEventListener(t, function () { drawing = false; update(true); }); });

  box.querySelector(".wipe__reset").addEventListener("click", function () {
    autoRun++; played = false; userTouched = false; drawDirt(); setTimeout(autoplay, 500);
  });

  function init() {
    lastW = box.clientWidth; drawDirt();
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { io.disconnect(); setTimeout(autoplay, 700); }
      }, { threshold: .55 });
      io.observe(box);
    }
  }
  if (img.complete && img.naturalWidth) init(); else img.addEventListener("load", init);
  var rt, lastW = 0; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { var w = box.clientWidth; if (w !== lastW && !done) { lastW = w; drawDirt(); played = false; } }, 250); });
})();
