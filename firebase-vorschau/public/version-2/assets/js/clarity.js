// Scroll-Szene „Klarheit“
(function () {
  var sec = document.querySelector(".clarity"); if (!sec) return;
  var words = sec.querySelectorAll(".clarity__words span"), dots = sec.querySelectorAll(".clarity__progress i");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches, ticking = false, last = -1;
  function set(i) {
    if (i === last) return; last = i;
    words.forEach(function (w, k) { w.classList.toggle("on", k === i); });
    dots.forEach(function (d, k) { d.classList.toggle("on", k === i); });
    sec.classList.toggle("is-clear", i === words.length - 1);
  }
  function update() {
    ticking = false;
    var r = sec.getBoundingClientRect(), range = sec.offsetHeight - window.innerHeight;
    var p = Math.min(1, Math.max(0, -r.top / range));
    var eased = Math.min(1, Math.max(0, (p - .08) / .8)); // Klarheit erst ab ~8 %, fertig bei ~88 %
    sec.style.setProperty("--p", eased.toFixed(4));
    set(Math.min(words.length - 1, Math.floor(p * words.length * 1.05)));
  }
  if (reduce) { sec.style.setProperty("--p", 1); set(words.length - 1); return; }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
