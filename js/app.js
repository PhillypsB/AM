/* app.js — Scroll, reveals, counters, form, botones magnéticos
   Dependencia: GSAP cargado desde CDN antes de este script
*/
(function(){

  /* ── Scroll progress bar ── */
  var sp = document.getElementById('sp');
  if(sp){
    window.addEventListener('scroll', function(){
      var pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      sp.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── IntersectionObserver: reveals ── */
  var io = new IntersectionObserver(function(entries){
    for(var i = 0; i < entries.length; i++){
      var entry = entries[i];
      if(!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      var counters = entry.target.querySelectorAll('[data-target]');
      for(var k = 0; k < counters.length; k++) cnt(counters[k]);
      io.unobserve(entry.target);
    }
  }, { threshold: 0.08 });

  var revEls = document.querySelectorAll('.rv,.rv-l,.rv-r,.stg');
  for(var i = 0; i < revEls.length; i++) io.observe(revEls[i]);

  /* ── Hero reveal inmediato ── */
  setTimeout(function(){
    var heroRevs = document.querySelectorAll('.hero-text .rv');
    for(var i = 0; i < heroRevs.length; i++){
      (function(el, idx){
        setTimeout(function(){ el.classList.add('in'); }, idx * 90);
      })(heroRevs[i], i);
    }
  }, 80);

  /* ── Contadores animados (requiere GSAP) ── */
  function cnt(el){
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || '';
    if(isNaN(target) || target === 0){ el.textContent = '0' + suffix; return; }
    if(typeof gsap === 'undefined'){ el.textContent = target + suffix; return; }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.8, ease: 'expo.out',
      onUpdate:   function(){ el.textContent = Math.round(obj.v) + suffix; },
      onComplete: function(){ el.textContent = target + suffix; }
    });
  }

  /* ── Botones magnéticos ── */
  var magBtns = document.querySelectorAll('.btn-p,.btn-g,.nav-btn');
  for(var b = 0; b < magBtns.length; b++){
    (function(btn){
      btn.addEventListener('mousemove', function(e){
        var rc = btn.getBoundingClientRect();
        var x  = (e.clientX - rc.left - rc.width  / 2) * 0.2;
        var y  = (e.clientY - rc.top  - rc.height / 2) * 0.2;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px) translateY(-2px)';
      });
      btn.addEventListener('mouseleave', function(){ btn.style.transform = ''; });
    })(magBtns[b]);
  }

  /* ── Smooth scroll ── */
  var anchors = document.querySelectorAll('a[href^="#"]');
  for(var a = 0; a < anchors.length; a++){
    (function(link){
      link.addEventListener('click', function(e){
        var target = document.querySelector(link.getAttribute('href'));
        if(target){
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    })(anchors[a]);
  }

  /* ── El método: la estrella recorre el camino (GSAP scrub) ── */
  function initMetodo(){
    var flow = document.querySelector('.met-flow');
    if(!flow) return;
    var steps  = flow.querySelectorAll('.mstep');
    var fill   = document.getElementById('metFill');
    var star   = document.getElementById('metStar');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setAll(){
      for(var i = 0; i < steps.length; i++) steps[i].classList.add('on');
      if(fill) fill.style.width = '100%';
      if(star){ star.style.left = '100%'; star.style.opacity = 1; }
    }
    if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || reduce){
      setAll(); return;
    }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: '.met-card', start: 'top 62%', end: 'top 8%', scrub: .8,
      onUpdate: function(self){
        var p = self.progress;
        if(fill) fill.style.width = (p * 100) + '%';
        if(star){ star.style.left = (p * 100) + '%'; star.style.opacity = p > 0.01 ? 1 : 0; }
        var active = p * steps.length;
        for(var i = 0; i < steps.length; i++){
          steps[i].classList.toggle('on', i < active || p >= 1);
        }
      }
    });
  }

  /* ── Logo del footer: secuencia firma (sombrero → letras → estrella) ── */
  function initFooterLogo(){
    if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var lockup = document.querySelector('.ft-lockup');
    if(!lockup) return;
    var hat     = lockup.querySelector('.hat');
    var letters = lockup.querySelectorAll('.ft-wm span');
    var rule    = lockup.querySelector('.wm-rule');
    var slogan  = lockup.querySelector('.ft-slogan');
    if(hat) hat.style.animation = 'none'; /* pausa el float CSS durante la entrada */

    /* Se dispara recién cuando el final de la página entra en pantalla:
       el visitante ya está mirando el logo cuando arranca la secuencia. */
    var anchor = document.querySelector('.ft-bottom') || lockup;
    var tl = gsap.timeline({
      scrollTrigger: { trigger: anchor, start: 'top 98%', once: true },
      onComplete: function(){
        if(hat){ gsap.set(hat, { clearProps: 'transform' }); hat.style.animation = ''; }
      }
    });
    tl.from(hat,     { y: -90, opacity: 0, rotation: -12, duration: 1.1, ease: 'bounce.out' })
      .from(letters, { y: 54, opacity: 0, stagger: .12, duration: .8, ease: 'back.out(1.6)' }, '-=.3')
      .from(rule,    { scaleX: 0, opacity: 0, duration: .7, ease: 'power3.out' }, '-=.25')
      .from(slogan,  { opacity: 0, y: 14, duration: .55 }, '-=.2');
  }

  function initGsapExtras(){ initMetodo(); initFooterLogo(); }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initGsapExtras);
  } else { initGsapExtras(); }

  /* ── Formulario → WhatsApp ── */
  var fsub = document.getElementById('fsub');
  if(fsub){
    fsub.addEventListener('click', function(){
      var fnEl  = document.getElementById('fn');
      var feEl  = document.getElementById('fe');
      var fmEl  = document.getElementById('fm');
      var n   = fnEl  ? fnEl.value.trim()  : '';
      var e2  = feEl  ? feEl.value.trim()  : '';
      var msg = fmEl  ? fmEl.value.trim()  : '';
      if(!n || !e2 || !msg){
        alert('Por favor completa todos los campos.');
        return;
      }
      var text = 'Hola, soy ' + n + ' (' + e2 + ').\n\n' + msg;
      window.open('https://wa.me/51954708174?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  }

})();
