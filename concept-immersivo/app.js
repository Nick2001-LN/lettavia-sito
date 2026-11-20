/* Lettavia — Concept Immersivo. Vanilla JS, nessuna libreria. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var mqMob = window.matchMedia('(max-width: 900px)');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (t) { return t * t * (3 - 2 * t); };

  /* riempimento parola per parola */
  var fills = $$('.fill');
  fills.forEach(function (el) {
    var txt = el.textContent.trim(), words = txt.split(/\s+/);
    el.setAttribute('aria-label', txt); el.textContent = '';
    words.forEach(function (w, i) {
      var s = d.createElement('span'); s.className = 'fw'; s.setAttribute('aria-hidden', 'true'); s.textContent = w;
      el.appendChild(s); if (i < words.length - 1) el.appendChild(d.createTextNode(' '));
    });
  });

  var story = $('.story'), stage = $('.stage'), intro = $('.intro');
  var rot = $('.d-rot'), frame = $('.frame3d'), shadow = $('.d-shadow');
  var scrs = $$('.frame3d .scr'), words = $$('.bw'), caps = $$('.cap'), dots = $$('.dots button');
  var hint = $('.hint');
  var N = scrs.length - 1;               /* 5 capitoli dopo l'introduzione */
  var SEG = 0.48;                         /* altezza di ogni capitolo, in viewport */

  /* fotogrammi chiave: x/y in vw/vh, rotazioni in gradi */
  var KD = [
    { x: 19, y: 3, rx: 18, ry: -34, rz: 8, s: 0.94 },
    { x: 17, y: 0, rx: 5, ry: -24, rz: 0, s: 1 },
    { x: -17, y: 0, rx: 6, ry: 24, rz: -2, s: 1 },
    { x: 17, y: 2, rx: -8, ry: -20, rz: 3, s: 1.04 },
    { x: -17, y: 0, rx: 8, ry: 22, rz: -3, s: 1 },
    { x: 17, y: -1, rx: 3, ry: -18, rz: 2, s: 1.02 }
  ];
  var KM = [
    { x: 0, y: 25, rx: 18, ry: -22, rz: 6, s: 0.66 },
    { x: 0, y: -13, rx: 4, ry: -12, rz: 0, s: 0.84 },
    { x: 0, y: -13, rx: 6, ry: 12, rz: -2, s: 0.84 },
    { x: 0, y: -12, rx: -5, ry: -10, rz: 2, s: 0.86 },
    { x: 0, y: -13, rx: 6, ry: 10, rz: -2, s: 0.84 },
    { x: 0, y: -13, rx: 2, ry: -8, rz: 1, s: 0.86 }
  ];

  var on = false, target = 0, cur = 0, raf = 0, active = -1, top0 = 0, range = 1;

  function measure() {
    var want = !reduce;
    if (want !== on) { on = want; root.classList.toggle('pin', on); }
    if (!on) return;
    var vh = window.innerHeight;
    story.style.setProperty('--sh', (vh * (1 + N * SEG)) + 'px');
    top0 = story.getBoundingClientRect().top + window.scrollY;
    range = story.offsetHeight - vh;
  }

  function setActive(i) {
    if (i === active) return; active = i;
    scrs.forEach(function (s, k) { s.classList.toggle('on', k === i); });
    words.forEach(function (w, k) { w.classList.toggle('on', k === i); });
    caps.forEach(function (c) { var on2 = Number(c.getAttribute('data-i')) === i; c.classList.toggle('on', on2); c.setAttribute('aria-hidden', on2 ? 'false' : 'true'); });
    dots.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    intro.classList.toggle('off', i !== 0);
  }

  function tick() {
    raf = 0;
    var vh = window.innerHeight, y = window.scrollY;
    target = clamp((y - top0) / range, 0, 1) * N;
    cur = lerp(cur, target, 0.09);
    if (Math.abs(cur - target) < 0.0008) cur = target;
    var i = Math.floor(cur), f = cur - i;
    if (i >= N) { i = N - 1; f = 1; }
    /* ogni capitolo resta fermo, poi passa al successivo nella parte centrale del tratto */
    var t = smooth(clamp((f - 0.3) / 0.4, 0, 1));
    var K = mqMob.matches ? KM : KD, a = K[i], b = K[i + 1];
    var spin = Math.sin(t * Math.PI);
    var x = lerp(a.x, b.x, t), yy = lerp(a.y, b.y, t);
    var rx = lerp(a.rx, b.rx, t) + spin * 6;
    var ry = lerp(a.ry, b.ry, t) + spin * (b.x < a.x ? 34 : -34) * (mqMob.matches ? 0.6 : 1);
    var rz = lerp(a.rz, b.rz, t), s = lerp(a.s, b.s, t) - spin * 0.06;
    rot.style.transform = 'translate3d(' + x.toFixed(3) + 'vw,' + yy.toFixed(3) + 'vh,0) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) rotateZ(' + rz.toFixed(2) + 'deg) scale(' + s.toFixed(4) + ')';
    frame.style.setProperty('--gx', (50 + ry * 1.6).toFixed(1) + '%');
    shadow.style.setProperty('--sx', x.toFixed(2) + 'vw');
    shadow.style.setProperty('--ss', (1 - Math.abs(ry) / 90).toFixed(3));
    var idx = t > 0.5 ? i + 1 : i;
    setActive(idx);
    /* introduzione: scompare nel primo tratto */
    var io = i === 0 ? 1 - t : 0;
    intro.style.setProperty('--io', io.toFixed(3));
    intro.style.setProperty('--iy', (-(1 - io) * 60).toFixed(1) + 'px');
    if (hint) hint.classList.toggle('off', cur > 0.15);
    if (cur !== target) req();
  }

  function fillTick() {
    var vh = window.innerHeight;
    fills.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var q = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      var ws = el.children, n = Math.round(q * ws.length);
      for (var k = 0; k < ws.length; k++) ws[k].classList.toggle('lit', k < n);
    });
  }

  var bar = $('.bar'), barOn = false;
  function barTick() { var b2 = window.scrollY > 30; if (b2 !== barOn) { barOn = b2; bar.classList.toggle('solid', b2); } }
  function req() { if (!raf) raf = requestAnimationFrame(function () { if (on) tick(); else raf = 0; fillTick(); barTick(); }); }

  dots.forEach(function (bt) {
    bt.addEventListener('click', function () {
      var k = Number(bt.getAttribute('data-go'));
      window.scrollTo({ top: top0 + (k / N) * range, behavior: reduce ? 'auto' : 'smooth' });
    });
  });
  /* il link "Il racconto" porta al primo capitolo */
  $$('a[href="#cap1-t"]').forEach(function (a) {
    a.addEventListener('click', function (e) { if (!on) return; e.preventDefault(); window.scrollTo({ top: top0 + range / N, behavior: 'smooth' }); });
  });

  /* pulsanti magnetici e luci che seguono il puntatore (solo mouse) */
  if (fine && !reduce) {
    var mags = $$('.mag');
    d.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      mags.forEach(function (m) {
        var r = m.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        var dx = e.clientX - cx, dy = e.clientY - cy, dist = Math.sqrt(dx * dx + dy * dy);
        var R = Math.max(r.width, r.height) * 0.9 + 40;
        if (dist < R) { m.classList.add('near'); m.style.setProperty('--mx', (dx * 0.3).toFixed(1) + 'px'); m.style.setProperty('--my', (dy * 0.35).toFixed(1) + 'px'); }
        else if (m.classList.contains('near')) { m.classList.remove('near'); m.style.setProperty('--mx', '0px'); m.style.setProperty('--my', '0px'); }
      });
    }, { passive: true });
  }

  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', function () { measure(); req(); });
  measure();
  if (on) { cur = target = clamp((window.scrollY - top0) / range, 0, 1) * N; setActive(0); }
  else caps.forEach(function (c) { c.removeAttribute('aria-hidden'); });
  window.addEventListener('load', function () { measure(); req(); });
  req();
})();
