/* Lettavia — anteprima Mobbin. Vanilla JS, nessuna libreria. Solo transform/opacity. */
(function(){
'use strict';
var d=document,root=d.documentElement;
root.classList.add('js');
var RM=window.matchMedia('(prefers-reduced-motion: reduce)');
function ready(f){d.readyState!=='loading'?f():d.addEventListener('DOMContentLoaded',f)}
ready(function(){
 /* barra: diventa solida dopo lo scroll */
 var bar=d.getElementById('bar');
 function onBar(){bar&&bar.classList.toggle('solid',window.scrollY>12)}
 onBar();window.addEventListener('scroll',onBar,{passive:true});

 /* hero: ingresso e parallasse leggera */
 var hero=d.querySelector('.hero');
 if(hero){
  requestAnimationFrame(function(){requestAnimationFrame(function(){hero.classList.add('ready')})});
  var pars=hero.querySelectorAll('.par'),tick=false;
  var k=[ -1, 1, 0 ]; // l, r, c
  function par(){tick=false;if(RM.matches)return;
   var r=hero.getBoundingClientRect(),p=Math.min(1,Math.max(0,-r.top/(r.height||1)));
   pars.forEach(function(el,i){var s=k[i];
    el.style.transform=s?('translate3d('+(s*p*40)+'px,'+(-p*30)+'px,0) rotate('+(s*p*4)+'deg)'):('translate3d(0,'+(-p*70)+'px,0)');});}
  window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(par)}},{passive:true});
 }

 /* comparse allo scroll */
 var rv=d.querySelectorAll('.rv');
 if('IntersectionObserver' in window&&!RM.matches){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  d.querySelectorAll('.grid8,.priv-cells,.plans').forEach(function(g){Array.prototype.forEach.call(g.querySelectorAll('.rv'),function(el,i){el.style.setProperty('--d',(i*0.06)+'s')})});
  rv.forEach(function(el){io.observe(el)});
 } else rv.forEach(function(el){el.classList.add('in')});

 /* funzioni: elenco a schede che cambia gli iPhone */
 var list=d.querySelector('.feat-list'),stage=d.getElementById('vetrina');
 if(list&&stage){
  var tabs=[].slice.call(list.querySelectorAll('.feat')),
      front=stage.querySelectorAll('.v-front .sl'),back=stage.querySelectorAll('.v-back .sl'),
      cur=0,auto=!RM.matches,inView=false,hovering=false,swapT;
  function show(i,focus){
   i=(i+tabs.length)%tabs.length; if(i===cur&&!focus)return;
   tabs.forEach(function(t,j){var on=j===i;t.classList.toggle('on',on);t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1});
   [front,back].forEach(function(set){[].forEach.call(set,function(p,j){p.classList.toggle('on',j===i)})});
   stage.setAttribute('aria-labelledby',tabs[i].id);
   if(!RM.matches){stage.classList.remove('swap');void stage.offsetWidth;stage.classList.add('swap');clearTimeout(swapT);swapT=setTimeout(function(){stage.classList.remove('swap')},950)}
   if(focus)tabs[i].focus();
   cur=i;
  }
  function stopAuto(){if(!auto)return;auto=false;list.classList.remove('auto','paused')}
  function sync(){list.classList.toggle('paused',!inView||hovering||d.hidden)}
  if(auto){list.classList.add('auto');sync();
   list.addEventListener('animationend',function(e){if(e.target.classList.contains('ring-fg')&&auto)show(cur+1)});
   if('IntersectionObserver' in window){new IntersectionObserver(function(es){inView=es[0].isIntersecting;sync()},{threshold:.35}).observe(stage)}else{inView=true;sync()}
   d.addEventListener('visibilitychange',sync);
   var sec=d.getElementById('funzioni');
   if(window.matchMedia('(hover: hover)').matches){sec.addEventListener('mouseenter',function(){hovering=true;sync()});sec.addEventListener('mouseleave',function(){hovering=false;sync()})}
  }
  tabs.forEach(function(t,i){t.addEventListener('click',function(){stopAuto();show(i)})});
  list.addEventListener('keydown',function(e){var k=e.key,n=null;
   if(k==='ArrowDown'||k==='ArrowRight')n=cur+1;else if(k==='ArrowUp'||k==='ArrowLeft')n=cur-1;else if(k==='Home')n=0;else if(k==='End')n=tabs.length-1;
   if(n!==null){e.preventDefault();stopAuto();show(n,true)}});
  /* swipe sugli iPhone (touch) */
  var x0=null,y0=null;
  stage.addEventListener('pointerdown',function(e){if(e.pointerType==='mouse')return;x0=e.clientX;y0=e.clientY});
  stage.addEventListener('pointerup',function(e){if(x0===null)return;var dx=e.clientX-x0,dy=e.clientY-y0;x0=null;
   if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3){stopAuto();show(cur+(dx<0?1:-1))}});
  stage.addEventListener('pointercancel',function(){x0=null});
 }

 /* Pro: anteprima palette */
 var pro=d.querySelector('.plans');
 if(pro){[].forEach.call(pro.querySelectorAll('.sw'),function(b){b.addEventListener('click',function(){
  pro.setAttribute('data-pal',b.getAttribute('data-p'));
  [].forEach.call(pro.querySelectorAll('.sw'),function(o){o.setAttribute('aria-pressed',o===b)});})})}

 /* indice delle pagine documento */
 var toc=d.querySelectorAll('.toc a');
 if(toc.length&&'IntersectionObserver' in window){
  var map={};toc.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
  var tio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){toc.forEach(function(a){a.classList.remove('cur')});var a=map[e.target.id];a&&a.classList.add('cur')}})},{rootMargin:'-20% 0px -70% 0px'});
  d.querySelectorAll('.doc-s').forEach(function(s){tio.observe(s)});
 }
});
})();
