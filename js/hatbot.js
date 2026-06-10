/* hatbot.js — Sombrero flotante → conversación → WhatsApp
   Flujo: nombre → problema → abre WhatsApp con mensaje formateado
   Editar WA_NUMBER para cambiar el número de destino
*/
(function(){

  var WA_NUMBER = '51954708174';

  var MESSAGES = {
    greeting : '¡Hola! 👋 Soy el sombrero de <strong>BRAV[O]</strong>.<br>¿Cómo te llamas?',
    askHelp  : function(name){ return '¡Mucho gusto, <strong>' + name + '</strong>! 🎩<br>¿En qué puedo ayudarte hoy?'; },
    confirm  : function(name){ return 'Perfecto, <strong>' + name + '</strong>.<br>Te conectaré directamente con Phillyps 👇'; },
    tooltip  : '¿Hablamos? 👋',
  };

  var step = 0; /* 0=pedir nombre, 1=pedir problema, 2=enviar */
  var userName = '';

  /* ── Crear HTML del widget ─────────────────────────────────── */
  var widget = document.createElement('div');
  widget.innerHTML = [
    /* Tooltip */
    '<div id="hatbot-tip">' + MESSAGES.tooltip + '</div>',

    /* Botón flotante */
    '<button id="hatbot-btn" aria-label="Chatear con BRAV[O]" aria-expanded="false">',
    '  <img src="img/hat.png" alt="BRAV[O] bot">',
    '</button>',

    /* Chat popup */
    '<div id="hatbot-chat" role="dialog" aria-label="Chat BRAV[O]" aria-hidden="true">',
    '  <div class="hbc-header">',
    '    <div class="hbc-avatar"><img src="img/hat.png" alt=""></div>',
    '    <div class="hbc-info">',
    '      <div class="hbc-name">BRAV[O]</div>',
    '      <div class="hbc-status">● En línea · responde rápido</div>',
    '    </div>',
    '    <button class="hbc-close" id="hatbot-close" aria-label="Cerrar">✕</button>',
    '  </div>',
    '  <div class="hbc-msgs" id="hbc-msgs"></div>',
    '  <div class="hbc-input-area" id="hbc-input-area">',
    '    <textarea class="hbc-input" id="hbc-input" rows="1" placeholder="Escribe aquí..."></textarea>',
    '    <button class="hbc-send" id="hbc-send" aria-label="Enviar">',
    '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">',
    '        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    '      </svg>',
    '    </button>',
    '  </div>',
    '</div>',
  ].join('');

  document.body.appendChild(widget);

  /* ── Referencias ───────────────────────────────────────────── */
  var btn      = document.getElementById('hatbot-btn');
  var chat     = document.getElementById('hatbot-chat');
  var closeBtn = document.getElementById('hatbot-close');
  var msgs     = document.getElementById('hbc-msgs');
  var input    = document.getElementById('hbc-input');
  var sendBtn  = document.getElementById('hbc-send');
  var tip      = document.getElementById('hatbot-tip');

  /* ── Tooltip: aparece a los 4s, desaparece al click ─────────── */
  setTimeout(function(){ tip.classList.add('show'); }, 4000);
  btn.addEventListener('click', function(){ tip.classList.remove('show'); });

  /* ── Abrir / cerrar chat ───────────────────────────────────── */
  function openChat(){
    chat.classList.add('open');
    btn.setAttribute('aria-expanded','true');
    chat.setAttribute('aria-hidden','false');
    tip.classList.remove('show');
    if(msgs.children.length === 0) startConversation();
    setTimeout(function(){ input.focus(); }, 350);
  }
  function closeChat(){
    chat.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
    chat.setAttribute('aria-hidden','true');
  }

  btn.addEventListener('click', function(){
    chat.classList.contains('open') ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);

  /* ── Conversación ──────────────────────────────────────────── */
  function addMsg(html, isUser){
    var bubble = document.createElement('div');
    bubble.className = 'hbc-bubble' + (isUser ? ' user' : '');
    bubble.innerHTML = '<div class="hbc-msg">' + html + '</div>';
    msgs.appendChild(bubble);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addTyping(callback){
    var typing = document.createElement('div');
    typing.className = 'hbc-bubble hbc-typing';
    typing.innerHTML = '<div class="hbc-msg"><div class="hbc-dots"><span></span><span></span><span></span></div></div>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(function(){
      msgs.removeChild(typing);
      callback();
    }, 1100);
  }

  function startConversation(){
    step = 0; userName = '';
    hideInput(false);
    addTyping(function(){
      addMsg(MESSAGES.greeting);
      input.placeholder = 'Tu nombre...';
    });
  }

  function hideInput(hidden){
    document.getElementById('hbc-input-area').style.display = hidden ? 'none' : '';
  }

  function showWaButton(){
    hideInput(true);
    var waBtn = document.createElement('button');
    waBtn.className = 'hbc-wa-btn';
    waBtn.innerHTML = [
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.99 2C6.472 2 2 6.473 2 11.99c0 1.89.523 3.658 1.432 5.173L2 22l4.979-1.405A9.944 9.944 0 0011.99 22C17.508 22 22 17.527 22 11.99S17.508 2 11.99 2z"/></svg>',
      'Abrir WhatsApp con Phillyps',
    ].join('');
    waBtn.addEventListener('click', function(){
      var userMsg = document.getElementById('hbc-final-msg') ? document.getElementById('hbc-final-msg').dataset.msg : '';
      var text = 'Hola Phillyps, soy ' + userName + ' y te escribo desde BRAV[O].\n\n' + userMsg;
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
    msgs.appendChild(waBtn);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function handleSend(){
    var val = input.value.trim();
    if(!val) return;
    input.value = '';
    autoResize();

    if(step === 0){
      /* Recibe nombre */
      userName = val.charAt(0).toUpperCase() + val.slice(1);
      addMsg(val, true);
      addTyping(function(){
        addMsg(MESSAGES.askHelp(userName));
        input.placeholder = '¿Cuál es tu reto o problema?';
        step = 1;
      });

    } else if(step === 1){
      /* Recibe problema → confirma y muestra botón WA */
      addMsg(val, true);
      /* Guardar mensaje para WA */
      var ghost = document.createElement('span');
      ghost.id = 'hbc-final-msg';
      ghost.dataset.msg = val;
      ghost.style.display = 'none';
      msgs.appendChild(ghost);
      addTyping(function(){
        addMsg(MESSAGES.confirm(userName));
        step = 2;
        setTimeout(showWaButton, 400);
      });
    }
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); }
  });

  /* Auto-resize textarea */
  function autoResize(){
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 80) + 'px';
  }
  input.addEventListener('input', autoResize);

  /* Cerrar al clickear fuera */
  document.addEventListener('click', function(e){
    if(chat.classList.contains('open') && !chat.contains(e.target) && !btn.contains(e.target)){
      closeChat();
    }
  });

  /* ESC cierra */
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeChat();
  });

})();
