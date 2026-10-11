/* modal.js — Detalle de cada caso (click en .sol-card). Cifras: las del CV (09 CV/CV_MAESTRO.md); no inventar otras.
   Accesible: ESC, click en fondo, botón ✕, navegable por teclado.
*/
(function(){

  var DATA = [
    {
      tag: 'Caso · Mi Mantenimiento · PRONIED',
      title: 'Aplicaciones web accionables',
      prob: 'El Programa de Mantenimiento de locales escolares vivía en Excel y en un sistema que solo veía una parte del ciclo. La información se duplicaba y era difícil seguir el dinero.',
      sol: 'Fui parte del equipo de «Mi Mantenimiento», que integra el ciclo completo en una sola plataforma: responsables, transferencias, ejecución y devoluciones, con automatización y trazabilidad para la gestión interna y para los usuarios de todo el país. Lo diseñé y lideré con la oficina de TI. Sigue en uso desde 2019.',
      num: '2019', lbl: 'Premio a las Buenas Prácticas en Gestión Pública (Ciudadanos al Día)'
    },
    {
      tag: 'Caso · Potenciales Usuarios · Cuna Más',
      title: 'Dashboards e indicadores',
      prob: 'Las Unidades Territoriales esperaban un Excel con los potenciales usuarios del programa y dependían de que alguien lo armara y lo enviara.',
      sol: 'Entregué un tablero que se actualiza solo cada semana, con filtros por unidad territorial, provincia y distrito, y descarga a Excel. Esperaban un Excel; recibieron una herramienta que hoy usan.',
      num: '33', lbl: 'Unidades Territoriales usan el tablero'
    },
    {
      tag: 'Caso · Padrones SAF y SCD · Cuna Más',
      title: 'Automatización de procesos',
      prob: 'Cargar y procesar el padrón del servicio de acompañamiento a familias tomaba 4 horas con dedicación plena, y los reportes se emitían a lo largo de la semana.',
      sol: 'Construí un ETL en Python y SQL Server, con controles de consistencia, que valida y carga el padrón. Hoy la carga toma 14 minutos y los reportes salen el mismo día en que llega el padrón.',
      num: '14 min', lbl: 'para cargar el padrón SAF (antes, 4 horas)'
    },
    {
      tag: 'Caso · Reportes institucionales · Cuna Más',
      title: 'Reportes automáticos',
      prob: 'Cada informe para el programa, el MIDIS y los organismos de control había que armarlo a mano, y cada pedido de información reiniciaba la cadena de pedir, esperar, cruzar y dar formato.',
      sol: 'Dejé 7 reportes institucionales generándose de forma automática, con trazabilidad hasta el MIDIS y la Contraloría. Y AM: la ayuda memoria de cualquier territorio sale ya redactada, en un clic.',
      num: '7', lbl: 'reportes institucionales generados automáticamente'
    },
    {
      tag: 'Caso · Mi Mantenimiento · PRONIED',
      title: 'Capacitación y adopción',
      prob: 'Un sistema nuevo no sirve si quienes lo operan no lo adoptan, sobre todo cuando hay que llegar a todo el país.',
      sol: 'Capacité a más de 200 especialistas de UGEL y DRE a nivel nacional y coordiné un equipo técnico de 4 personas en el seguimiento de metas y el control presupuestal.',
      num: '+200', lbl: 'especialistas de UGEL y DRE capacitados'
    },
    {
      tag: 'Producto · MAIA',
      title: 'Integración de información',
      prob: 'El padrón, el escenario de riesgo, el decreto de emergencia y los límites territoriales viven en lugares distintos. Ya tienes la información; falta cruzarla.',
      sol: 'MAIA cruza cuatro fuentes oficiales en un solo paso y muestra en un mapa dónde conviene preparar primero: coinciden mucha exposición a inundaciones y mucha gente atendida.',
      num: '4', lbl: 'fuentes oficiales en un solo cruce'
    }
  ];

  var modal = document.getElementById('solModal');
  if(!modal) return;
  var card    = modal.querySelector('.modal-card');
  var lastFocus = null;

  function fill(d){
    document.getElementById('mTag').textContent   = d.tag;
    document.getElementById('mTitle').textContent = d.title;
    document.getElementById('mProb').textContent  = d.prob;
    document.getElementById('mSol').textContent   = d.sol;
    document.getElementById('mNum').textContent   = d.num;
    document.getElementById('mLbl').textContent   = d.lbl;
  }

  function open(idx){
    if(!DATA[idx]) return;
    fill(DATA[idx]);
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-x').focus();
  }

  function close(){
    modal.hidden = true;
    document.body.style.overflow = '';
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* Cards clickeables + teclado */
  var cards = document.querySelectorAll('.sol-card');
  for(var i = 0; i < cards.length; i++){
    (function(el, idx){
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-haspopup', 'dialog');
      el.addEventListener('click', function(){ open(idx); });
      el.addEventListener('keydown', function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(idx); }
      });
    })(cards[i], i);
  }

  /* Cierres */
  var closers = modal.querySelectorAll('[data-close]');
  for(var c = 0; c < closers.length; c++){
    closers[c].addEventListener('click', close);
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && !modal.hidden) close();
  });

  /* Focus simple dentro del modal */
  modal.addEventListener('keydown', function(e){
    if(e.key !== 'Tab') return;
    var focusables = card.querySelectorAll('button,a[href]');
    var first = focusables[0], last = focusables[focusables.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

})();
