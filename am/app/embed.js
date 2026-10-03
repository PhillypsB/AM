
// Embebida en Web_UPPM: se marca antes de pintar y se informa la altura al
// contenedor para que el iframe crezca con el contenido (sin barra interna).
if (/[?&]embebido=1(&|$)/.test(location.search) && window.parent !== window) {
  document.documentElement.classList.add('embebido');
  (function () {
    let ultima = 0;
    const avisar = () => {
      const h = document.body.scrollHeight;
      if (Math.abs(h - ultima) < 2) return;
      ultima = h;
      parent.postMessage({ am_altura: h }, '*');
    };
    new ResizeObserver(avisar).observe(document.body);
    addEventListener('load', avisar);
  })();
}
