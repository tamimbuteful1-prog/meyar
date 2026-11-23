// Fit the «اسأل فلان!» frame to its content (same origin).
(function () {
  function init() {
    var f = document.getElementById('ask-frame');
    if (!f) return;
    var fit = function () {
      try {
        var d = f.contentDocument;
        if (!d || !d.body) return;
        var m = d.getElementById('main') || d.body;
        f.style.height = Math.ceil(m.getBoundingClientRect().height + 24) + 'px';
      } catch (e) {}
    };
    f.addEventListener('load', function () {
      fit();
      try {
        var ro = new ResizeObserver(fit);
        ro.observe(f.contentDocument.body);
        var m = f.contentDocument.getElementById('main'); if (m) ro.observe(m);
      } catch (e) { setInterval(fit, 800); }
    });
    window.addEventListener('resize', fit, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
