/* Lettavia — miglioramenti progressivi. Nessuna dipendenza. Il sito funziona anche senza questo file. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var mqRM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = function () { return mqRM.matches; };
  var hasIO = 'IntersectionObserver' in window;

  function ready(fn) { d.readyState === 'loading' ? d.addEventListener('DOMContentLoaded', fn) : fn(); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  ready(function () {
    var header = d.querySelector('.site-header');

    /* ---- Scroll: header compatto, barra di avanzamento, parallax dell'hero ---- */
    var hero = d.querySelector('.hero'), heroVisible = true, ticking = false;
    function onScroll() {
      ticking = false;
      var y = window.pageYOffset || root.scrollTop;
      if (header) header.classList.toggle('is-scrolled', y > 12);
      var max = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--sp', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      if (hero && heroVisible && !reduce()) hero.style.setProperty('--sy', Math.min(y, 900).toFixed(1));
    }
    function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req, { passive: true });
    onScroll();

    if (!hasIO) { $$('[data-r]').forEach(function (e) { e.classList.add('in'); }); }

    /* ---- Reveal con ritardo a cascata ---- */
    $$('[data-stagger]').forEach(function (g) {
      $$('[data-r]', g).forEach(function (el, i) { el.style.setProperty('--d', (i * 0.09).toFixed(2) + 's'); });
    });
    function counter(el) {
      var end = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-dec') || 0);
      var fmt = function (v) { return v.toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
      if (reduce() || isNaN(end)) { el.textContent = fmt(end); return; }
      var t0 = null, dur = 1700;
      function step(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(end * e);
        if (p < 1) requestAnimationFrame(step);
      }
      el.textContent = fmt(0);
      requestAnimationFrame(step);
    }
    if (hasIO) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target; io.unobserve(el);
          el.classList.add('in');
          if (el.hasAttribute('data-count')) counter(el);
          $$('[data-count]', el).forEach(counter);
          var done = function () { el.classList.add('done'); };
          el.addEventListener('transitionend', function (e) { if (e.target === el && e.propertyName === 'opacity') done(); });
          setTimeout(done, 1900 + (parseFloat(el.style.getPropertyValue('--d')) || 0) * 1000);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      $$('[data-r], .ring').forEach(function (el) { io.observe(el); });
    }

    /* ---- Tour delle funzioni: a ogni passo cambia l'intera composizione di schermate ---- */
    var steps = $$('.step'), comps = $$('.tour-stage .comp'), dots = $$('.dots i'), cap = d.querySelector('.stage-cap');
    function setStep(i) {
      steps.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      comps.forEach(function (c, k) {
        c.classList.toggle('on', k === i); c.classList.toggle('before', k < i); c.classList.toggle('after', k > i);
        c.setAttribute('aria-hidden', k === i ? 'false' : 'true');
      });
      dots.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      if (cap && comps[i]) {
        cap.textContent = comps[i].getAttribute('data-cap') || '';
        cap.classList.remove('sw'); void cap.offsetWidth; cap.classList.add('sw');
      }
    }
    if (steps.length && comps.length) {
      setStep(0);
      if (hasIO) {
        var tio = new IntersectionObserver(function (es) {
          es.forEach(function (en) { if (en.isIntersecting) setStep(steps.indexOf(en.target)); });
        }, { rootMargin: '-48% 0px -48% 0px', threshold: 0 });
        steps.forEach(function (s) { tio.observe(s); });
      }
    }
    /* Composizioni nei passi (telefono/tablet): entrano quando compaiono */
    var mobComps = $$('.step-comp .comp');
    if (!hasIO || reduce()) { mobComps.forEach(function (c) { c.classList.add('on'); }); }
    else {
      var mio = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('on'); mio.unobserve(en.target); } });
      }, { threshold: 0.28 });
      mobComps.forEach(function (c) { mio.observe(c); });
    }

    /* ---- Pausa delle animazioni infinite fuori schermo ---- */
    if (hasIO) {
      var pio = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          en.target.classList.toggle('paused', !en.isIntersecting);
          if (en.target === hero) heroVisible = en.isIntersecting;
        });
      }, { rootMargin: '80px' });
      $$('.hero, .marquee, .import').forEach(function (el) { pio.observe(el); });
    }

    /* ---- Inclinazione dei telefoni dell'hero col puntatore ---- */
    var stage = d.querySelector('.stage');
    if (stage && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var raf = 0, tx = 0, ty = 0;
      var apply = function () { raf = 0; stage.style.setProperty('--tx', tx.toFixed(2)); stage.style.setProperty('--ty', ty.toFixed(2)); };
      window.addEventListener('pointermove', function (e) {
        if (reduce() || !heroVisible) return;
        var r = stage.getBoundingClientRect();
        var nx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
        var ny = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
        tx = Math.max(-1, Math.min(1, nx)) * 7; ty = Math.max(-1, Math.min(1, ny)) * -5;
        if (!raf) raf = requestAnimationFrame(apply);
      }, { passive: true });
      d.documentElement.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); });
    }

    /* ---- FAQ: apertura e chiusura morbide (senza JS restano <details> nativi) ---- */
    $$('.faq details').forEach(function (det) {
      var sum = det.querySelector('summary'), body = det.querySelector('.faq-body'), anim = null;
      if (!sum || !body) return;
      sum.addEventListener('click', function (e) {
        if (reduce() || !body.animate) return;
        e.preventDefault();
        if (anim) anim.cancel();
        var opening = !det.open, h0 = body.offsetHeight;
        if (opening) det.open = true;
        var h1 = opening ? body.scrollHeight : 0;
        body.style.overflow = 'hidden';
        anim = body.animate([{ height: h0 + 'px', opacity: opening ? 0 : 1 }, { height: h1 + 'px', opacity: opening ? 1 : 0 }],
          { duration: 380, easing: 'cubic-bezier(.22,.8,.24,1)' });
        anim.onfinish = anim.oncancel = function () { anim = null; body.style.overflow = ''; if (!opening) det.open = false; };
      });
    });
  });
})();
