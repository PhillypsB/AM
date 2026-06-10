/* theme.js — Toggle lila (default) / magenta
   Se carga en <head> sin defer para evitar flash de color.
   Aplica clase en <html> inmediatamente, luego la transfiere a <body> en DOMContentLoaded.
*/
(function(){
  var KEY = 'bravo-accent';
  var saved = 'lila';
  try{ saved = localStorage.getItem(KEY) || 'lila'; }catch(e){}

  /* Aplicar en <html> de inmediato (body aún no existe) */
  if(saved === 'magenta') document.documentElement.classList.add('magenta');

  document.addEventListener('DOMContentLoaded', function(){
    /* Transferir clase a <body> y limpiar en <html> */
    if(saved === 'magenta') document.body.classList.add('magenta');
    document.documentElement.classList.remove('magenta');

    /* Botón toggle */
    var btn = document.getElementById('themeToggle');
    if(btn){
      btn.addEventListener('click', function(){
        var isMag = document.body.classList.contains('magenta');
        document.body.classList.toggle('magenta', !isMag);
        try{ localStorage.setItem(KEY, isMag ? 'lila' : 'magenta'); }catch(e){}
      });
    }
  });
})();
