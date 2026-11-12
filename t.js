/* Anonymous counters for Meyar (GoatCounter, no cookies, no personal data).
   Counts: visits, real API checks, file downloads, prompt copies, social clicks. */
(function () {
  var CODE = ''; // GoatCounter site code, e.g. "meyar" -> https://meyar.goatcounter.com
  if (!CODE || location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
  var END = 'https://' + CODE + '.goatcounter.com/count';

  function send(path, title, isEvent) {
    try {
      var q = '?p=' + encodeURIComponent(path) +
        '&t=' + encodeURIComponent(title || path) +
        (isEvent ? '&e=true' : '&r=' + encodeURIComponent(document.referrer || '')) +
        '&s=' + encodeURIComponent(screen.width) + '&rnd=' + Math.random().toString(36).slice(2);
      var img = new Image();
      img.src = END + q;
    } catch (e) {}
  }

  // 1) visit
  send('/', 'زيارة', false);

  // 2) real API use: count once per request sent to OpenAI / Anthropic
  if (window.fetch) {
    var f = window.fetch;
    window.fetch = function (input) {
      try {
        var u = typeof input === 'string' ? input : (input && input.url) || '';
        if (/api\.anthropic\.com/.test(u)) send('api-claude', 'استخدام API: Claude', true);
        else if (/api\.openai\.com/.test(u)) send('api-openai', 'استخدام API: OpenAI', true);
      } catch (e) {}
      return f.apply(this, arguments);
    };
  }

  // 3) downloads, prompt copies, social clicks
  document.addEventListener('click', function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest('a,button') : null;
    if (!el) return;
    if (el.id === 'zip-link') return send('download-files', 'تحميل الملفات', true);
    if (el.id === 'copy-prompt') return send('copy-prompt', 'نسخ البرومبت', true);
    var h = el.getAttribute('href') || '';
    var where = el.closest('.founder') ? 'المؤسس' : 'الواجهة';
    if (/x\.com\/tamimimpact/.test(h)) return send('social-x', 'حساب X (' + where + ')', true);
    if (/instagram\.com\/tamimimpact/.test(h)) return send('social-instagram', 'Instagram (' + where + ')', true);
    if (/tiktok\.com\/@tamimimpact/.test(h)) return send('social-tiktok', 'TikTok (' + where + ')', true);
  }, true);
})();
