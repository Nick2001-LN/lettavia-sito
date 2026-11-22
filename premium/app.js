(function(){
  'use strict';
  var d=document, root=d.documentElement;
  var RM=window.matchMedia('(prefers-reduced-motion: reduce)');
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s));}
  function raf(fn){var t=false;return function(){if(t)return;t=true;requestAnimationFrame(function(){t=false;fn();});};}

  // word stagger index (CSP: no inline styles; CSSOM is allowed)
  $$('.w[data-i]').forEach(function(w){w.style.setProperty('--i',w.getAttribute('data-i'));});

  // bar
  var bar=d.getElementById('bar');
  function onBar(){if(bar)bar.classList.toggle('solid',window.scrollY>40);}

  // reveals
  var rv=$$('.rv,.bl');
  if('IntersectionObserver' in window && !RM.matches){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.12});
    rv.forEach(function(el){io.observe(el);});
  } else rv.forEach(function(el){el.classList.add('in');});

  // hero intro
  var hero=d.querySelector('.hero');
  if(hero){requestAnimationFrame(function(){requestAnimationFrame(function(){hero.classList.add('ready');});});}

  // scroll-linked: hero tilt + parallax crops
  var tilt=d.getElementById('tilt');
  var pars=$$('[data-par]');
  function onScroll(){
    onBar();
    if(RM.matches)return;
    var vh=window.innerHeight;
    if(tilt){
      var p=Math.min(1,Math.max(0,window.scrollY/(vh*0.55)));
      var e=1-Math.pow(1-p,3);
      tilt.style.setProperty('--rx',(16*(1-e)).toFixed(2)+'deg');
      tilt.style.setProperty('--sc',(0.92+0.08*e).toFixed(4));
    }
    pars.forEach(function(el){
      var r=el.parentNode.getBoundingClientRect();
      if(r.bottom<-100||r.top>vh+100)return;
      var c=(r.top+r.height/2-vh/2);
      var v=Math.max(-28,Math.min(28,-c*parseFloat(el.getAttribute('data-par'))));el.style.translate='0 '+v.toFixed(1)+'px';
    });
  }
  var os=raf(onScroll);
  window.addEventListener('scroll',os,{passive:true});
  window.addEventListener('resize',os);
  onScroll();

  // showcase tabs
  var tabs=$$('.sg'), texts=$$('.sh-t'), ind=d.querySelector('.seg-ind');
  var fronts=$$('.st-front .sl'), backs=$$('.st-back .sl'), cur=0;
  function moveInd(){
    var t=tabs[cur]; if(!t||!ind)return;
    ind.style.setProperty('--x',t.offsetLeft+'px');
    ind.style.setProperty('--w',t.offsetWidth+'px');
  }
  function sel(i,focus){
    i=(i+tabs.length)%tabs.length; cur=i;
    tabs.forEach(function(t,k){var on=k===i;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;t.classList.toggle('on',on);});
    [texts,fronts,backs].forEach(function(a){a.forEach(function(el,k){el.classList.toggle('on',k===i);});});
    moveInd();
    var t=tabs[i];
    if(focus)t.focus({preventScroll:true});
    // keep active chip visible in the horizontally scrollable bar (no page scroll)
    var w=t.closest('.seg-wrap');
    if(w&&w.scrollWidth>w.clientWidth){var l=t.offsetLeft+t.parentNode.offsetLeft-(w.clientWidth-t.offsetWidth)/2;w.scrollTo({left:l,behavior:RM.matches?'auto':'smooth'});}
  }
  tabs.forEach(function(t,k){
    t.addEventListener('click',function(){sel(k);});
    t.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){e.preventDefault();sel(cur+1,true);}
      else if(e.key==='ArrowLeft'){e.preventDefault();sel(cur-1,true);}
      else if(e.key==='Home'){e.preventDefault();sel(0,true);}
      else if(e.key==='End'){e.preventDefault();sel(tabs.length-1,true);}
    });
  });
  var stage=d.getElementById('stage');
  if(stage){
    var sx=null,sy=0;
    stage.addEventListener('pointerdown',function(e){sx=e.clientX;sy=e.clientY;});
    stage.addEventListener('pointerup',function(e){
      if(sx===null)return; var dx=e.clientX-sx, dy=e.clientY-sy; sx=null;
      if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))sel(cur+(dx<0?1:-1));
    });
    stage.addEventListener('pointercancel',function(){sx=null;});
  }
  if(tabs.length){moveInd();window.addEventListener('resize',raf(moveInd));if(d.fonts&&d.fonts.ready)d.fonts.ready.then(moveInd);}

  // palette
  var card=d.querySelector('.pro-card[data-pal]');
  $$('.sw').forEach(function(b){
    b.addEventListener('click',function(){
      card.setAttribute('data-pal',b.getAttribute('data-p'));
      $$('.sw').forEach(function(x){x.setAttribute('aria-pressed',x===b);});
    });
  });

  // TOC highlight on doc pages
  var toc=$$('.toc a');
  if(toc.length&&'IntersectionObserver' in window){
    var map={};toc.forEach(function(a){map[a.getAttribute('href').slice(1)]=a;});
    var tio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){toc.forEach(function(a){a.classList.remove('on');});var a=map[e.target.id];if(a)a.classList.add('on');}});},{rootMargin:'-20% 0px -70% 0px'});
    $$('.doc-s').forEach(function(s){tio.observe(s);});
  }
})();
