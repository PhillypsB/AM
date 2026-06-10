/* carousel.js — Hero carousel (5 slides de proyectos)
   Para añadir o quitar slides:
   1. Añade/quita el HTML del slide en index.html
   2. Actualiza los arrays TITLES y NAMES aquí
*/
(function(){

  var TITLES = [
    'Mi Mantenimiento · Dashboard',
    'zaZÁ · Control de Eventos',
    'Potenciales · CRM Pipeline',
    'Ayudas Memoria · Dashboard',
    'Sello Municipal · Trámites'
  ];
  var NAMES = [
    ['Mi Mantenimiento','Dashboard'],
    ['zaZÁ','Control de eventos'],
    ['Potenciales','CRM Pipeline'],
    ['Ayudas Memoria','Compromisos'],
    ['Sello Municipal','Trámites']
  ];

  var cur = 0, tmr = null;

  /* Exponer globalmente para los onclick del HTML */
  window.gs = function(n){
    var sl = document.querySelectorAll('.slide');
    var dt = document.querySelectorAll('#wdots-nav .ndot');
    var tb = document.querySelectorAll('#wtabs .wt');

    /* Guardar contra índices fuera de rango */
    if(!sl.length || !dt.length || !tb.length) return;

    /* Quitar estado activo del slide actual */
    if(sl[cur])  sl[cur].classList.remove('on');
    if(dt[cur])  dt[cur].classList.remove('on');
    if(tb[cur])  tb[cur].classList.remove('on');

    /* Nuevo slide — limitar al rango de dots/tabs (pueden ser menos que slides) */
    var total = Math.min(sl.length, dt.length, tb.length, TITLES.length);
    cur = ((n % total) + total) % total;

    /* Activar nuevo */
    if(sl[cur])  sl[cur].classList.add('on');
    if(dt[cur])  dt[cur].classList.add('on');
    if(tb[cur])  tb[cur].classList.add('on');

    /* Actualizar título y nombre de pantalla */
    var wttl = document.getElementById('wttl');
    if(wttl) wttl.textContent = TITLES[cur] || '';

    var sn = document.getElementById('scrName');
    if(sn && NAMES[cur]){
      sn.innerHTML = NAMES[cur][0] + ' <small>' + NAMES[cur][1] + '</small>';
    }

    /* Reiniciar autoplay */
    clearInterval(tmr);
    tmr = setInterval(function(){ window.gs((cur + 1) % total); }, 5000);
  };

  window.gsNext = function(){
    var total = Math.min(
      document.querySelectorAll('.slide').length,
      document.querySelectorAll('#wdots-nav .ndot').length,
      TITLES.length
    );
    window.gs((cur + 1) % total);
  };

  window.gsPrev = function(){
    var total = Math.min(
      document.querySelectorAll('.slide').length,
      document.querySelectorAll('#wdots-nav .ndot').length,
      TITLES.length
    );
    window.gs((cur - 1 + total) % total);
  };

  /* Iniciar autoplay solo cuando el DOM esté listo */
  document.addEventListener('DOMContentLoaded', function(){
    var total = Math.min(
      document.querySelectorAll('.slide').length,
      document.querySelectorAll('#wdots-nav .ndot').length,
      TITLES.length
    );
    if(total > 0){
      tmr = setInterval(function(){ window.gs((cur + 1) % total); }, 5000);
    }
  });

})();
