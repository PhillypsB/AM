/* Ordered initialization avoids document.write races and works with file:// and HTTP. */
(async () => {
  const load = (src,optional=false) => new Promise((resolve,reject) => {
    const script=document.createElement('script');script.src=src;
    script.onload=()=>resolve(true);
    script.onerror=()=>optional?resolve(false):reject(new Error('No se pudo leer '+src));
    document.head.appendChild(script);
  });
  const loading=document.getElementById('loadingState');loading.classList.remove('hidden');
  try {
    if(location.protocol==='file:')await load('app/config.local.js',true);
    await Promise.all([load(AM_DATOS+'mensual/BD/manifest.js'),load(AM_DATOS+'parametros/parametros.js')]);
    await load('app/data-init.js');
    const selected=AM_MESES.find(m=>m.f===AM_CORTE_SEL);
    const ym=selected.f.replace(/-/g,'').slice(0,6), monthly=AM_DATOS+'mensual/';
    await Promise.all([
      load(monthly+'BD/'+selected.a),
      load(monthly+'ACTORES/actores_'+ym+'.js',true),load(monthly+'SA/sa_'+ym+'.js',true),
      load(AM_DATOS+'fijo/ut.js'),load(AM_DATOS+'fijo/frontera_distritos.js')
    ]);
    await load(AM_DATOS+'fijo/ambitos_especiales.js');
    await load('app/data-stores.js');
    await load('lib/frontera_export.js');
    await load('app/coverage.js');
    await load('app/premium.js');
    document.getElementById('appFooterText').innerHTML=buildFooterLine();
    loading.classList.add('hidden');
  } catch(error) {
    loading.querySelector('.spinner').hidden=true;
    loading.querySelector('p').textContent='No se pudo abrir la fuente de datos. Verifica que DATOS_PNCM esté junto a la carpeta de la aplicación y vuelve a cargar.';
    console.error(error);
  }
})();
