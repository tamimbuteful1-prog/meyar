(function () {
  var API = 'https://tamim.goatcounter.com/api/v0';
  var KEY = 'meyar-gc-token';
  var START = '2026-11-12';
  var $ = function (id) { return document.getElementById(id); };
  var AR = function (n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); };
  var fmt = function (n) { return AR(Number(n || 0).toLocaleString('en-US')); };
  var token = null, range = '7';
  try { token = localStorage.getItem(KEY); } catch (e) {}

  function day(d) { return d.toISOString().slice(0, 10); }
  function period() {
    var end = new Date(), start = new Date();
    if (range !== 'all') start.setDate(start.getDate() - (Number(range) - 1));
    var s0 = range === 'all' ? START : day(start);
    return { start: s0 + 'T00:00:00Z', end: day(end) + 'T23:59:59Z' };
  }
  function get(path, q) {
    var u = API + path + '?' + new URLSearchParams(q).toString();
    return fetch(u, { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' } })
      .then(function (r) {
        if (r.status === 401 || r.status === 403) throw new Error('auth');
        if (!r.ok) return r.text().then(function (t) { var m = t; try { m = JSON.parse(t).error || JSON.stringify(JSON.parse(t).errors) || t; } catch (_) {} throw new Error(r.status + ': ' + String(m).replace(/<[^>]*>/g, ' ').slice(0, 160)); });
        return r.json();
      });
  }

  function showLogin(msg) {
    $('login').hidden = false; $('dash').hidden = true; $('logout').hidden = true; $('refresh').hidden = true;
    $('lerr').hidden = !msg; $('lerr').textContent = msg || '';
  }
  function showDash() {
    $('login').hidden = true; $('dash').hidden = false; $('logout').hidden = false; $('refresh').hidden = false;
  }

  function chart(points) {
    var svg = $('chart'); svg.innerHTML = '';
    if (!points.length) return;
    var W = 600, H = 140, P = 8, max = Math.max(1, Math.max.apply(null, points));
    var step = points.length > 1 ? (W - 2 * P) / (points.length - 1) : 0;
    var xy = points.map(function (v, i) { return [W - P - i * step, H - P - (v / max) * (H - 2 * P)]; }); // RTL: newest on the left
    var line = xy.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var area = line + ' L' + xy[xy.length - 1][0].toFixed(1) + ',' + (H - P) + ' L' + xy[0][0].toFixed(1) + ',' + (H - P) + ' Z';
    svg.innerHTML = '<path d="' + area + '" fill="rgba(194,61,46,.16)"/><path d="' + line + '" fill="none" stroke="#c23d2e" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      xy.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" fill="#1d1e20"/>'; }).join('');
  }

  function load() {
    var p = period();
    $('derr').hidden = true; $('upd').textContent = 'جاري التحميل…';
    Promise.all([
      get('/stats/hits', { start: p.start, end: p.end, limit: 100 }),
      get('/stats/total', { start: p.start, end: p.end }).catch(function () { return {}; })
    ]).then(function (res) {
      var hits = (res[0] && res[0].hits) || [], tot = res[1] || {};
      var c = {};
      hits.forEach(function (h) { c[h.path] = (c[h.path] || 0) + (h.count || 0); });
      var g = function (k) { return c[k] || 0; };
      var visits = 0;
      hits.forEach(function (h) { if (!h.event) visits += h.count || 0; });
      var apiC = g('api-claude'), apiO = g('api-openai');
      var x = g('social-x'), ig = g('social-instagram'), tt = g('social-tiktok');
      $('v-visits').textContent = fmt(visits);
      $('v-api').textContent = fmt(apiC + apiO); $('v-api-c').textContent = fmt(apiC); $('v-api-o').textContent = fmt(apiO);
      $('v-dl').textContent = fmt(g('download-files'));
      $('v-cp').textContent = fmt(g('copy-prompt'));
      $('v-soc').textContent = fmt(x + ig + tt); $('v-x').textContent = fmt(x); $('v-ig').textContent = fmt(ig); $('v-tt').textContent = fmt(tt);
      // daily visits chart from the pageview path(s)
      var days = {};
      hits.forEach(function (h) {
        if (h.event) return;
        (h.stats || []).forEach(function (s) { days[s.day] = (days[s.day] || 0) + (s.daily || 0); });
      });
      var keys = Object.keys(days).sort();
      if (!keys.length && tot.stats) tot.stats.forEach(function (s) { days[s.day] = s.daily || 0; keys.push(s.day); });
      chart(keys.map(function (k) { return days[k]; }));
      var now = new Date();
      $('upd').textContent = 'آخر تحديث ' + AR(now.toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit' })) + ' · الأرقام مجهولة الهوية';
    }).catch(function (e) {
      if (e.message === 'auth') { try { localStorage.removeItem(KEY); } catch (_) {} token = null; showLogin('المفتاح غير صحيح أو لا يملك صلاحية القراءة.'); return; }
      $('upd').textContent = ''; $('derr').hidden = false; $('derr').textContent = 'تعذّر جلب الأرقام (' + e.message + ')';
    });
  }

  $('save').addEventListener('click', function () {
    var v = $('token').value.trim();
    if (!v) { $('lerr').hidden = false; $('lerr').textContent = 'الصق المفتاح أولًا.'; return; }
    token = v; try { localStorage.setItem(KEY, v); } catch (e) {}
    $('token').value = ''; showDash(); load();
  });
  $('token').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('save').click(); });
  $('logout').addEventListener('click', function () { try { localStorage.removeItem(KEY); } catch (e) {} token = null; showLogin(); });
  $('refresh').addEventListener('click', load);
  $('range').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    range = b.getAttribute('data-r');
    [].forEach.call(this.querySelectorAll('button'), function (x) { x.classList.toggle('on', x === b); });
    load();
  });

  if (token) { showDash(); load(); } else showLogin();
})();
