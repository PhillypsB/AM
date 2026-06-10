/* nav.js — Menú hamburguesa mobile */
(function(){
  var btn = document.getElementById('navHamburger');
  if(!btn) return;
  btn.addEventListener('click', function(){
    document.body.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', document.body.classList.contains('nav-open'));
  });
  // Cerrar al hacer click en un link del drawer
  document.querySelectorAll('.nav-drawer a').forEach(function(a){
    a.addEventListener('click', function(){
      document.body.classList.remove('nav-open');
    });
  });
  // Cerrar al hacer scroll
  window.addEventListener('scroll', function(){
    document.body.classList.remove('nav-open');
  }, {passive:true});
})();
