/* Progressive UI enhancements. Existing calculation and export functions remain authoritative. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let noticeTimer, mapVersion = 0;
  const mapRequests = new Map();
  function notice(message) {
    $('premiumNotice').textContent = message; $('premiumNotice').hidden = false;
    clearTimeout(noticeTimer); noticeTimer = setTimeout(() => $('premiumNotice').hidden = true, 6000);
  }
  function queryURL() {
    const d = window.ultimoResultado;
    if (!d) return null;
    const url = new URL(location.href);
    ['corte','ubigeo','dep','prov','cp','especial'].forEach(k => url.searchParams.delete(k));
    url.searchParams.set('corte',fechaCorteActual());
    if (d._esEspecial) url.searchParams.set('especial',selectEsp.value);
    else if(d.distrito) {
      const ub = ubigeoDe(d.departamento,d.provincia,d.distrito);
      if(ub) url.searchParams.set('ubigeo',String(ub).padStart(6,'0'));
      if(d.ccpp) url.searchParams.set('cp',selectCP.value);
    } else if(d.departamento) {
      url.searchParams.set('dep',d.departamento);
      if(d.provincia) url.searchParams.set('prov',d.provincia);
    }
    return url;
  }
  function publicLink() { return /^https?:$/.test(location.protocol) ? queryURL()?.href : null; }
  async function copyLink() {
    const link = publicLink();
    if(!link) return notice('El enlace compartido estará disponible al abrir la web publicada.');
    try { await navigator.clipboard.writeText(link); notice('Enlace copiado con el territorio y período consultados.'); }
    catch { window.prompt('Copia el enlace de esta consulta:',link); }
  }
  function loadMap(dep) {
    if(window.AM_MAPS?.[dep]) return Promise.resolve(window.AM_MAPS[dep]);
    if(!mapRequests.has(dep)) mapRequests.set(dep,new Promise((resolve,reject) => {
      const script=document.createElement('script'); script.src='assets/maps/'+dep+'.js';
      script.onload=()=>resolve(window.AM_MAPS?.[dep]);
      script.onerror=()=>{mapRequests.delete(dep);reject(new Error('Mapa no disponible'));};
      document.head.appendChild(script);
    }));
    return mapRequests.get(dep);
  }
  function ringsOf(shape) {
    if(!Array.isArray(shape)||!shape.length) return [];
    return typeof shape[0]?.[0] === 'number' ? [shape] : shape.flatMap(ringsOf);
  }
  let mapView=null;
  let mapModule=null;
  async function renderMap(d) {
    const version=++mapVersion;
    mapView?.dispose();mapView=null;
    const results=$('resultados');
    $('territoryMap')?.remove();results.classList.remove('has-map');
    if(!d?.distrito||d.ccpp||d._esEspecial)return;
    const ub=String(ubigeoDe(d.departamento,d.provincia,d.distrito)||'').padStart(6,'0');
    if(!/^\d{6}$/.test(ub))return;
    const host=document.createElement('aside');host.id='territoryMap';host.className='territory-map';
    host.innerHTML='<div class="map-heading"><h3>TERRITORIO · '+escapeHTML(d.distrito)+'</h3><button type="button" aria-label="Ampliar mapa">Ampliar ↗</button></div><div class="map-art"><div class="map-modes"><button type="button" data-mode="editorial" aria-pressed="true" disabled>Editorial</button><button type="button" data-mode="relief" aria-pressed="false" disabled>Relieve 3D</button></div><div class="map-canvas"></div><div class="map-status" role="status"></div></div><div class="map-caption"><strong>'+escapeHTML(d.provincia.toLocaleLowerCase('es'))+' · '+escapeHTML(d.departamento.toLocaleLowerCase('es'))+'</strong><span class="map-legend">Distrito consultado</span><small>Límites INEI · Cartografía editorial</small></div>';
    results.append(host);results.classList.add('has-map');
    const expand=host.querySelector('.map-heading button');
    expand.addEventListener('click',()=>{const open=host.classList.toggle('map-fullscreen');expand.textContent=open?'Cerrar ×':'Ampliar ↗';expand.setAttribute('aria-label',open?'Cerrar mapa ampliado':'Ampliar mapa');mapView?.resize();});
    try{
      const shapes=await loadMap(ub.slice(0,2));if(version!==mapVersion)return;
      const selected=ringsOf(shapes[ub]);const points=selected.flat();if(!points.length)throw Error('Sin geometría');
      const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
      const scale=Math.min(260/(x1-x0||1),240/(y1-y0||1));
      const path=selected.map(r=>r.map((p,i)=>(i?'L':'M')+[(p[0]-(x0+x1)/2)*scale+210,((y0+y1)/2-p[1])*scale+220].join(' ')).join('')+'Z').join('');
      host.querySelector('.map-art').insertAdjacentHTML('afterbegin','<svg class="map-static" viewBox="0 0 420 490" role="img" aria-label="Límite de '+escapeHTML(d.distrito)+'"><rect width="420" height="490" fill="#eeeaef"/><path d="'+path+'" fill="#f4c1d7" stroke="#e00060" stroke-width="1.5"/></svg>');
      if(!mapModule)mapModule=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='app/territory-map.js';script.onload=resolve;script.onerror=()=>{mapModule=null;reject(Error('Mapa no disponible'));};document.head.append(script);});
      await mapModule;if(version!==mapVersion)return;
      mapView=AMTerritoryMap.mount({host,shapes,ub,name:d.distrito});
    }catch{if(version===mapVersion)host.querySelector('.map-status').textContent='Mapa no disponible. Puedes consultar y exportar normalmente.';}
  }
  function enhanceTables() {
    document.querySelectorAll('#resultados .detail-section').forEach(section=>{
      const table=section.querySelector('table');
      if(!table||section.dataset.enhanced)return;
      section.dataset.enhanced='true';
      const rows=[...table.rows];let group=null;
      for(const row of rows){
        if(row.classList.contains('row-sep')){
          const details=document.createElement('details');details.className='service-details';
          const summary=document.createElement('summary');summary.textContent=row.textContent.trim();
          const subtable=document.createElement('table');subtable.className='detail-table';
          const tbody=document.createElement('tbody');subtable.append(tbody);details.append(summary,subtable);section.append(details);
          group={details,summary,tbody};row.remove();
        }else if(group){
          if(row.classList.contains('row-total')){
            const count=document.createElement('strong');count.textContent=row.cells[1]?.textContent||'';group.summary.append(count);
          }
          group.tbody.append(row);
        }
      }
    });
    document.querySelectorAll('#resultados > .cobertura-card').forEach(card=>{
      const details=document.createElement('details');details.className='coverage-details';
      const summary=document.createElement('summary');summary.textContent=card.querySelector('h3')?.textContent||'Detalle de cobertura';
      card.before(details);details.append(summary,card);
      const title=card.querySelector('h3');if(title)title.hidden=true;
    });
  }
  function refresh() {
    const d=window.ultimoResultado;if(!d)return;
    if(!d._esEspecial&&!d.esNacional&&d.departamento) {
      const name=d.ccpp?.nombre||d.distrito||d.provincia||d.departamento;
      $('resultadosTitulo').textContent=name.toLocaleLowerCase('es').replace(/(^|\s)\p{L}/gu,c=>c.toLocaleUpperCase('es'));
      $('resultadosKicker').textContent=[d.departamento,d.provincia].filter(Boolean).join(' / ');
    }
    // Remove decorative emoji from screen labels only. Export text remains unchanged.
    document.querySelectorAll('#resultados .detail-table td:first-child').forEach(cell=>{
      if(cell.children.length===0) cell.textContent=cell.textContent.replace(/^[\s\p{Extended_Pictographic}\uFE0F\u200D]+/u,'');
    });
    document.querySelectorAll('.am-narrativa-lbl').forEach(el=>el.textContent='Resumen listo para presentar');
    enhanceTables();renderMap(d);
  }
  async function restoreQuery() {
    const q=new URLSearchParams(location.search);
    const corte=q.get('corte');
    if(corte&&!window.AM_MESES.some(m=>m.f===corte)) notice('Ese período no está disponible. Se muestra el último corte.');
    if(q.get('especial')) {
      if([...selectEsp.options].some(o=>o.value===q.get('especial'))) {selectEsp.value=q.get('especial');onEspecialChange();}
      else notice('El ámbito del enlace no está disponible.');
      return;
    }
    const rows=dataset.filter(d=>d.fecha===fechaCorteActual());
    const record=q.get('ubigeo')? rows.find(d=>String(d.ubigeo).padStart(6,'0')===q.get('ubigeo')) : rows.find(d=>d.departamento===q.get('dep')&&(!q.get('prov')||d.provincia===q.get('prov')));
    if(!record) {if(q.has('ubigeo')||q.has('dep'))notice('El territorio del enlace no está disponible en este corte.');return;}
    const district=q.has('ubigeo');
    if(q.get('cp'))await solicitarCentros();
    _sugActual=[{t:district?record.distrito:q.get('prov')||record.departamento,dep:record.departamento,prov:district?record.provincia:q.get('prov')||'',dist:district?record.distrito:'',cp:q.get('cp')||''}];
    irAAmbito(0);
    if(q.get('cp')&&selectCP.value!==q.get('cp'))notice('El centro poblado no está disponible. Se muestra el distrito.');
  }
  window.AMPremium={refresh,copyLink,publicLink,queryURL};
  const search=document.querySelector('.busca-wrap');
  if(search)$('premiumSearch').append(search);
  const input=$('buscadorAmbito');
  input.placeholder='Busca tu distrito o cualquier territorio…';input.setAttribute('role','combobox');input.setAttribute('aria-expanded','false');
  const observer=new MutationObserver(()=>input.setAttribute('aria-expanded',String($('buscadorSug').classList.contains('abierta'))));
  observer.observe($('buscadorSug'),{attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelector('.map-fullscreen .map-heading button')?.click();}});
  document.querySelectorAll('.export-bar .btn:not(.btn-link)').forEach(button=>{
    button.insertAdjacentHTML('afterbegin','<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h7l4 4v14H7zM14 3v5h4M10 12h5M10 16h5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>');
  });
  toggleFiltros(false);
  refresh();restoreQuery();
})();

