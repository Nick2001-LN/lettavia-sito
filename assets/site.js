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

    /* ---- Funzioni a schede: ogni scheda cambia la composizione di iPhone ---- */
    var feat = d.querySelector('.feat');
    if (feat) {
      var tabs = $$('[role=tab]', feat), panels = $$('[role=tabpanel]', feat), comps = $$('.fstage .comp', feat);
      var cap = feat.querySelector('.stage-cap'), list = feat.querySelector('[role=tablist]'), cur = 0;
      var stopAuto = function () { feat.classList.remove('auto'); };
      var select = function (i, user) {
        var n = tabs.length; i = (i + n) % n; cur = i;
        if (user) stopAuto();
        tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
        panels.forEach(function (p, k) { p.hidden = k !== i; });
        comps.forEach(function (c, k) {
          c.classList.toggle('on', k === i); c.classList.toggle('before', k < i); c.classList.toggle('after', k > i);
          c.setAttribute('aria-hidden', k === i ? 'false' : 'true');
        });
        if (cap) { cap.textContent = comps[i].getAttribute('data-cap') || ''; cap.classList.remove('sw'); void cap.offsetWidth; cap.classList.add('sw'); }
        $$('.ring', panels[i]).forEach(function (r) { r.classList.remove('in'); void r.offsetWidth; r.classList.add('in'); });
        $$('[data-count]', panels[i]).forEach(counter);
        var t = tabs[i];
        if (list && list.scrollWidth > list.clientWidth) list.scrollTo({ left: t.offsetLeft - (list.clientWidth - t.offsetWidth) / 2, behavior: reduce() ? 'auto' : 'smooth' });
      };
      tabs.forEach(function (t, k) {
        t.addEventListener('click', function () { select(k, true); });
        t.addEventListener('keydown', function (e) {
          var map = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }, to = null;
          if (e.key in map) to = cur + map[e.key];
          else if (e.key === 'Home') to = 0;
          else if (e.key === 'End') to = tabs.length - 1;
          if (to === null) return;
          e.preventDefault(); select(to, true); tabs[cur].focus();
        });
      });
      $$('.fnav', feat).forEach(function (b) { b.addEventListener('click', function () { select(cur + (+b.getAttribute('data-dir')), true); }); });
      /* scorrimento orizzontale sul telefono */
      var stg = feat.querySelector('.fstage'), x0 = null, y0 = 0;
      if (stg) {
        stg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
        stg.addEventListener('touchend', function (e) {
          if (x0 === null) return;
          var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) select(cur + (dx < 0 ? 1 : -1), true);
        }, { passive: true });
      }
      select(0, false);
      /* avanzamento automatico leggero: parte quando la sezione è visibile, si ferma al primo intervento */
      feat.addEventListener('animationend', function (e) {
        if (e.animationName === 'fillbar' && feat.classList.contains('auto')) select(cur + 1, false);
      });
      feat.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') feat.classList.add('hover'); });
      feat.addEventListener('pointerleave', function () { feat.classList.remove('hover'); });
      feat.addEventListener('focusin', stopAuto);
      if (hasIO && !reduce()) {
        var started = false;
        var fio = new IntersectionObserver(function (es) {
          es.forEach(function (en) {
            if (en.isIntersecting && !started) { started = true; feat.classList.add('auto'); }
            feat.classList.toggle('paused', !en.isIntersecting);
          });
        }, { threshold: 0.35 });
        fio.observe(feat);
      }
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
