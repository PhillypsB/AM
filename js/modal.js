/* modal.js — Detalle de cada solución (click en .sol-card)
   Accesible: ESC, click en fondo, botón ✕, navegable por teclado.
*/
(function(){

  var DATA = [
    {
      tag: 'Sistemas en producción',
      title: 'Aplicaciones Web a Medida',
      prob: 'Las hojas de cálculo y los chats funcionan… hasta que la operación crece. Entonces la información se duplica, se pierde, o depende de la memoria de una sola persona.',
      sol: 'Construyo sistemas web hechos para tu flujo real de trabajo: cada quien ve lo que necesita, la información vive en un solo lugar y la operación deja de depender de nadie en particular.',
      num: '5+', lbl: 'sistemas activos, todos en uso diario'
    },
    {
      tag: 'Caso · Ayudas Memoria',
      title: 'Dashboards e Indicadores',
      prob: 'Para saber cómo va la semana había que pedir el reporte, esperar a que alguien lo armara y confiar en que estuviera al día.',
      sol: 'Un tablero que se actualiza solo: compromisos, vencimientos y cumplimiento visibles en el momento, con alertas antes de que algo se venza.',
      num: '4h', lbl: 'semanales recuperadas por el equipo'
    },
    {
      tag: 'Caso · Mi Mantenimiento',
      title: 'Automatización de Procesos',
      prob: 'Cada solicitud de mantenimiento pasaba por llamadas, papeles y re-tipeo. Horas de trabajo manual y solicitudes que se perdían en el camino.',
      sol: 'Las solicitudes entran solas al sistema, se asignan automáticamente al técnico correcto y todos ven el estado en tiempo real. Lo que tomaba horas, ocurre sin intervención.',
      num: '85%', lbl: 'menos tiempo de respuesta'
    },
    {
      tag: 'Caso · Sello Municipal',
      title: 'Gestión Documental',
      prob: 'Un trámite tomaba 3 días: papel, colas, sellos físicos y expedientes que había que buscar a mano.',
      sol: 'Flujo 100% digital con validaciones, firma electrónica y trazabilidad completa. El mismo trámite hoy toma 2 horas y no usa una sola hoja de papel.',
      num: '96%', lbl: 'menos tiempo por trámite (3 días → 2 horas)'
    },
    {
      tag: 'Caso · Potenciales',
      title: 'Sistemas de Seguimiento',
      prob: 'Las oportunidades comerciales vivían en cuadernos y correos. Los seguimientos se olvidaban y nadie sabía cuánto había realmente en el pipeline.',
      sol: 'Un CRM adaptado al flujo comercial real: pipeline visible, recordatorios automáticos de seguimiento y cada oportunidad con su historia completa.',
      num: '+40%', lbl: 'cierre de oportunidades'
    },
    {
      tag: 'Caso · zaZÁ',
      title: 'Integración de Información',
      prob: 'Entradas vendidas por varios canales, listas en Excel y control de acceso a mano: duplicados, colas y discusiones en la puerta.',
      sol: 'Toda la información conectada en una sola fuente. Cada entrada se valida por QR en tiempo real contra el sistema: ni duplicados ni entradas falsas.',
      num: '0', lbl: 'errores de validación en eventos con cientos de asistentes'
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
