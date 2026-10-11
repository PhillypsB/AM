/* vitrina.js — Carrusel de videos del hero, miniaturas con video y reproductor.
   - Solo el video activo se reproduce (sin sonido, en bucle). El resto muestra su cartel.
   - Los videos se descargan cuando se acercan a la pantalla (nada pesa antes de verlo).
   - Respeta "reducir movimiento" y el ahorro de datos: sin reproducción automática.
   - Cuenta clics (video abierto, producto abierto) en el Worker de avisos, sin datos personales.
   Para añadir un video: sumar su entrada en VIDEOS y su <article class="vit-card" data-v="id"> en index.html. */
(function(){

  var VIDEOS = {
    zaza: {
      tag: 'Nuevo · Sector público', title: 'zaZÁ PRESUPUESTO',
      text: 'Subes el Excel del SIAF y ves tu presupuesto procesado en segundos.',
      full: 'video/zaza.mp4', poster: 'img/cartel-zaza.webp', href: 'presupuesto/', link: 'Probarlo con mi Excel →'
    },
    maia: {
      tag: 'En desarrollo', title: 'MAIA · ¿Dónde prepararnos primero?',
      text: 'Cruza padrón, riesgo y decreto de emergencia para decidir dónde preparar primero ante lluvias.',
      full: 'video/maia.mp4', poster: 'img/cartel-maia.webp', href: 'maia/index2', link: 'Abrir MAIA →'
    },
    am: {
      tag: 'En uso en Cuna Más', title: 'AM · Ayuda Memoria en un clic',
      text: 'Cualquier territorio, con su ayuda memoria lista en Word, Excel, PPT o WhatsApp.',
      full: 'video/am.mp4', poster: 'img/cartel-am.webp', href: 'am/', link: 'Abrir AM →'
    },
    academia: {
      tag: 'Lo más nuevo', title: 'BRAVO ACADEMY',
      text: 'Tu página web .com con IA, en 3 horas. Sales con tu web publicada.',
      full: 'bravo-academy/video/bravo-academy-truco.mp4', poster: 'img/cartel-academia.webp', href: 'bravo-academy/', link: 'Conocer la academia →'
    },
    historia: {
      tag: 'Mi historia', title: 'Phillyps Bravo en 43 segundos',
      text: 'Del dato a la acción: lo que construí y lo que quedó en uso.',
      full: 'video/historia.mp4', poster: 'img/cartel-historia.webp', href: 'cv/', link: 'Ver mi CV →'
    }
  };

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var autoplay = !reduce && !saveData;

  function track(e, o){
    try{ navigator.sendBeacon('/_avisos/evento', new Blob([JSON.stringify({ e: e, o: o })], { type: 'application/json' })); }catch(x){}
  }
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return [].slice.call((r || document).querySelectorAll(s)); }

  /* Carga el video (si aún no tiene fuente) y lo reproduce o lo pausa. */
  function cargar(v){ if(v.dataset.src && !v.getAttribute('src')){ v.src = v.dataset.src; } }
  function reproducir(v){
    if(!autoplay) return;
    cargar(v);
    var p = v.play(); if(p && p.catch) p.catch(function(){});
  }
  function pausar(v){ try{ v.pause(); }catch(x){} }

  /* ───────── Carrusel del hero ───────── */
  var deck = $('#vitDeck');
  var cards = deck ? $$('.vit-card', deck) : [];
  var cur = 0, timer = null, ptrX = null, interacted = false;

  function pos(i){ var n = cards.length, d = i - cur; if(d > n / 2) d -= n; if(d < -n / 2) d += n; return d; }

  function pintarInfo(id){
    var d = VIDEOS[id]; if(!d) return;
    $('#vitTag').textContent = d.tag;
    $('#vitTitle').textContent = d.title;
    $('#vitText').textContent = d.text;
    var l = $('#vitLink'); l.textContent = d.link; l.setAttribute('href', d.href); l.dataset.o = id;
    $('#vitPlay').dataset.openVideo = id;
  }

  function ir(n){
    if(!cards.length) return;
    cur = ((n % cards.length) + cards.length) % cards.length;
    cards.forEach(function(c, i){
      var p = pos(i);
      c.setAttribute('data-pos', p);
      c.setAttribute('aria-hidden', p === 0 ? 'false' : 'true');
      c.tabIndex = p === 0 ? 0 : -1;
      var v = $('video', c);
      if(v){
        if(Math.abs(p) <= 1) cargar(v);
        if(p === 0) reproducir(v); else pausar(v);
      }
    });
    pintarInfo(cards[cur].dataset.v);
    $$('#vitDots .vit-dot').forEach(function(d, i){ d.setAttribute('aria-selected', i === cur ? 'true' : 'false'); });
    reiniciar();
  }

  function reiniciar(){
    clearInterval(timer);
    if(autoplay && !interacted) timer = setInterval(function(){ ir(cur + 1); }, 9000);
  }

  if(deck && cards.length){
    var dots = $('#vitDots');
    cards.forEach(function(c, i){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'vit-dot'; b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Ver ' + VIDEOS[c.dataset.v].title);
      b.addEventListener('click', function(){ interacted = true; ir(i); });
      dots.appendChild(b);
      c.addEventListener('click', function(){
        if(i === cur) abrir(c.dataset.v); else { interacted = true; ir(i); }
      });
      c.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); if(i === cur) abrir(c.dataset.v); }
      });
    });
    $('.vit-prev').addEventListener('click', function(){ interacted = true; ir(cur - 1); });
    $('.vit-next').addEventListener('click', function(){ interacted = true; ir(cur + 1); });
    deck.addEventListener('keydown', function(e){
      if(e.key === 'ArrowLeft'){ interacted = true; ir(cur - 1); }
      if(e.key === 'ArrowRight'){ interacted = true; ir(cur + 1); }
    });
    /* Deslizar con el dedo o el mouse */
    var stage = $('#vitStage');
    stage.addEventListener('pointerdown', function(e){ ptrX = e.clientX; });
    stage.addEventListener('pointerup', function(e){
      if(ptrX === null) return;
      var dx = e.clientX - ptrX; ptrX = null;
      if(Math.abs(dx) > 40){ interacted = true; ir(dx < 0 ? cur + 1 : cur - 1); }
    });
    stage.addEventListener('pointercancel', function(){ ptrX = null; });
    /* Pausa cuando no se ve la pestaña o el hero */
    document.addEventListener('visibilitychange', function(){
      if(document.hidden){ clearInterval(timer); pausar($('video', cards[cur])); }
      else { reproducir($('video', cards[cur])); reiniciar(); }
    });
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){
        var v = $('video', cards[cur]);
        if(es[0].isIntersecting){ reproducir(v); reiniciar(); } else { clearInterval(timer); pausar(v); }
      }, { threshold: 0.25 }).observe($('#vitHero'));
    }
    ir(0);
  }

  /* ───────── Miniaturas con video (sección Productos, Academia, historia) ───────── */
  var thumbs = $$('.pr-thumb video[data-src]');
  if(thumbs.length && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){
        var v = en.target;
        if(en.isIntersecting){ reproducir(v); } else { pausar(v); }
      });
    }, { rootMargin: '120px', threshold: 0.2 });
    thumbs.forEach(function(v){ io.observe(v); });
  }

  /* ───────── Reproductor ───────── */
  var vm = $('#vm');
  var last = null;
  function abrir(id){
    var d = VIDEOS[id]; if(!d || !vm) return;
    last = document.activeElement;
    var v = $('#vmVideo');
    v.poster = d.poster;
    v.src = d.full;
    $('#vmTitle').textContent = d.title;
    var a = $('#vmLink'); a.textContent = d.link; a.setAttribute('href', d.href); a.dataset.o = id;
    vm.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.vm-x', vm).focus();
    var p = v.play(); if(p && p.catch) p.catch(function(){});
    track('video', id);
    pausar($('video', cards[cur] || document.body));
    clearInterval(timer);
  }
  function cerrar(){
    if(!vm || vm.hidden) return;
    var v = $('#vmVideo'); pausar(v); v.removeAttribute('src'); v.load();
    vm.hidden = true;
    document.body.style.overflow = '';
    if(last && last.focus) last.focus();
    if(cards.length){ reproducir($('video', cards[cur])); reiniciar(); }
  }
  if(vm){
    $$('[data-close]', vm).forEach(function(b){ b.addEventListener('click', cerrar); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') cerrar(); });
    vm.addEventListener('keydown', function(e){
      if(e.key !== 'Tab') return;
      var f = $$('button,a[href],video', vm).filter(function(x){ return !x.hidden; });
      var first = f[0], lastEl = f[f.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); lastEl.focus(); }
      else if(!e.shiftKey && document.activeElement === lastEl){ e.preventDefault(); first.focus(); }
    });
  }
  document.addEventListener('keydown', function(e){
    if(e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target.closest && e.target.closest('[data-open-video][role="button"]');
    if(t){ e.preventDefault(); abrir(t.dataset.openVideo); }
  });
  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('[data-open-video]');
    if(t){ e.preventDefault(); abrir(t.dataset.openVideo); return; }
    var l = e.target.closest && e.target.closest('[data-o]');
    if(l && l.tagName === 'A'){ track('abrir', l.dataset.o); }
  });

  /* Video de zaZÁ con controles dentro de la sección: cuenta la primera reproducción */
  var zv = $('#zazaVideo');
  if(zv){ zv.addEventListener('play', function once(){ zv.removeEventListener('play', once); track('video', 'zaza'); }); }

  window.BravoVideo = { open: abrir, close: cerrar };
})();
