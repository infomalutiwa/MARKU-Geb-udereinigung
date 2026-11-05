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
