
(function () {
  const URLS = {
    logo: 'assets/word-logo.js',
    filesaver:  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
    // SheetJS Community ignora los estilos de celda; xlsx-js-style es la misma
    // API y sí los escribe (la misma que usa Web_UPPM).
    xlsx:       'https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.bundle.js',
    html2canvas:'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    frontera:   window.AM_DATOS + 'plantillas/frontera_modelo.js',  // 74 KB: solo al exportar FRONTERAS
    pptmodelo:  window.AM_DATOS + 'plantillas/modelo_ppt.js'        // 2,5 MB: el deck modelo, solo al exportar PPT
  };
  const pedidas = {};
  function una(k) {
    if (pedidas[k]) return pedidas[k];
    pedidas[k] = new Promise((ok, mal) => {
      const sc = document.createElement('script');
      sc.src = URLS[k]; sc.async = false;
      sc.onload = ok;
      sc.onerror = () => { delete pedidas[k]; sc.remove(); mal(new Error('No se pudo cargar ' + k)); };
      document.head.appendChild(sc);
    });
    return pedidas[k];
  }
  window.asegurarLibs = async function (lista) {
    for (const k of lista) await una(k);
  };
})();
