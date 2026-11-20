/* Lettavia — Concept Editoriale. Vanilla JS, nessuna libreria. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* parole del titolo: ritardi scaglionati via CSSOM */
  $$('.display .w').forEach(function (w, i) { w.style.setProperty('--d', (1.05 + i * 0.09) + 's'); });

  /* riempimento parola per parola */
  var fills = $$('.fill');
  fills.forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.textContent = '';
    words.forEach(function (w, i) {
      var s = d.createElement('span'); s.className = 'fw'; s.setAttribute('aria-hidden', 'true'); s.textContent = w;
      el.appendChild(s); if (i < words.length - 1) el.appendChild(d.createTextNode(' '));
    });
  });

  var mastBar = $('.mast-bar i');
  var lines = $$('.display .ln');
  var sec = $('.chapters'), pin = $('.pin'), track = $('.track');
  var chs = $$('.track > .ch');
  var pfN = $('.pf-n'), pfBar = $('.pf-bar i');
  var ROM = ['I', 'II', 'III', 'IV', 'V'];
  var RATIO = 3;
  var hx = false, dist = 0, cur = 0, target = 0, raf = 0;
  var mqWide = window.matchMedia('(min-width: 901px)');

  function setupHx() {
    var want = !reduce && mqWide.matches;
    if (want !== hx) { hx = want; root.classList.toggle('hx', hx); }
    if (!hx) { track.style.transform = ''; chs.forEach(function (c) { c.style.transform = ''; }); sec.style.removeProperty('--h'); return; }
    dist = track.scrollWidth - window.innerWidth;
    sec.style.setProperty('--h', (pin.offsetHeight + dist / RATIO) + 'px');
  }

  function frame() {
    raf = 0;
    var y = window.scrollY, vh = window.innerHeight;
    var docH = root.scrollHeight - vh;
    if (mastBar) mastBar.style.transform = 'scaleX(' + clamp(y / docH, 0, 1).toFixed(4) + ')';
    if (!reduce) {
      var hp = clamp(y / vh, 0, 1.2);
      if (lines[0]) lines[0].style.transform = 'translate3d(' + (-hp * 7) + 'vw,0,0)';
      if (lines[1]) lines[1].style.transform = 'translate3d(' + (hp * 5) + 'vw,0,0)';
    }
    var again = false;
    if (hx) {
      var top = sec.getBoundingClientRect().top + y;
      var p = clamp((y - top) / (sec.offsetHeight - pin.offsetHeight), 0, 1);
      target = p * dist;
      cur = lerp(cur, target, 0.12);
      if (Math.abs(cur - target) < 0.3) cur = target; else again = true;
      track.style.transform = 'translate3d(' + (-cur).toFixed(2) + 'px,0,0)';
      var vw = window.innerWidth, active = 0;
      chs.forEach(function (c, i) {
        var r = c.offsetLeft - cur;           /* posizione del bordo sinistro */
        var k = clamp(r / vw, 0, 1);          /* 0 = pagina aperta, 1 = in arrivo da destra */
        c.style.transform = 'perspective(1600px) rotateY(' + (-k * 14).toFixed(2) + 'deg)';
        c.style.setProperty('--k', k.toFixed(3));
        var fig = c.querySelector('.ch-fig'); if (fig) fig.style.transform = 'translate3d(' + (k * 6).toFixed(2) + 'vw,0,0)';
        var num = c.querySelector('.ch-num'); if (num) num.style.transform = 'translate3d(' + (k * -10).toFixed(2) + 'vw,0,0)';
        if (c.id && r < vw * 0.5) active = Number(c.id.slice(1)) - 1;
      });
      if (pfN && pfN.textContent !== ROM[active]) pfN.textContent = ROM[active];
      if (pfBar) pfBar.style.transform = 'scaleX(' + (cur / dist).toFixed(4) + ')';
    }
    fills.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var q = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      var ws = el.children, n = Math.round(q * ws.length);
      for (var i = 0; i < ws.length; i++) ws[i].classList.toggle('lit', i < n);
    });
    if (again) req();
  }
  function req() { if (!raf) raf = requestAnimationFrame(frame); }

  /* indice: in modalità orizzontale porta al capitolo giusto */
  $$('.toc a, .mast nav a[href="#capitoli"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (!hx) return;
      var id = a.getAttribute('href').slice(1), el = d.getElementById(id);
      if (!el || !el.classList.contains('ch')) return;
      e.preventDefault();
      var top = sec.getBoundingClientRect().top + window.scrollY;
      var x = clamp(el.offsetLeft - window.innerWidth * 0.0, 0, dist);
      window.scrollTo({ top: top + x / RATIO, behavior: 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  });

  /* cursore editoriale */
  if (fine) {
    var c = $('.cursor'), cx = -100, cy = -100, tx = -100, ty = -100, crf = 0;
    var loop = function () {
      cx = lerp(cx, tx, reduce ? 1 : 0.2); cy = lerp(cy, ty, reduce ? 1 : 0.2);
      c.style.setProperty('--x', cx.toFixed(1) + 'px'); c.style.setProperty('--y', cy.toFixed(1) + 'px');
      crf = (Math.abs(cx - tx) + Math.abs(cy - ty) > 0.2) ? requestAnimationFrame(loop) : 0;
    };
    d.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY; if (!crf) crf = requestAnimationFrame(loop);
      var t = e.target;
      c.classList.toggle('big', !!(hx && t.closest && t.closest('.ch-fig')));
      c.classList.toggle('link', !!(t.closest && t.closest('a,button')));
    }, { passive: true });
    d.addEventListener('pointerleave', function () { tx = ty = -100; req(); });
  }

  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', function () { setupHx(); req(); });
  if (mqWide.addEventListener) mqWide.addEventListener('change', function () { setupHx(); req(); });
  setupHx();
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { setupHx(); req(); });
  window.addEventListener('load', function () { setupHx(); req(); });
  req();
})();
