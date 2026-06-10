/* cursor.js — Cursor diamante mágico con lag suave */
(function(){

  /* Solo en dispositivos con mouse (no touch-only) */
  if(!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return;

  var dot  = document.getElementById('cdot');
  var ring = document.getElementById('cring');
  if(!dot || !ring) return;

  var mx = window.innerWidth  / 2;
  var my = window.innerHeight / 2;
  var rx = mx, ry = my;

  /* Mover el diamante instantáneo */
  window.addEventListener('mousemove', function(e){
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  /* Anillo con lag suave */
  function loop(){
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  }
  loop();

  /* Estados click */
  window.addEventListener('mousedown', function(){ document.body.classList.add('cur-down'); });
  window.addEventListener('mouseup',   function(){ document.body.classList.remove('cur-down'); });

  /* Hover en links / botones */
  var links = document.querySelectorAll('a,button,input,textarea,[onclick],.wt,.ndot,.cnav');
  for(var i = 0; i < links.length; i++){
    links[i].addEventListener('mouseenter', function(){ document.body.classList.add('cur-link'); });
    links[i].addEventListener('mouseleave', function(){ document.body.classList.remove('cur-link'); });
  }

  /* Hover en cards */
  var cards = document.querySelectorAll('.sol-card,.cv2-step');
  for(var j = 0; j < cards.length; j++){
    cards[j].addEventListener('mouseenter', function(){ document.body.classList.add('cur-card'); });
    cards[j].addEventListener('mouseleave', function(){ document.body.classList.remove('cur-card'); });
  }

})();
