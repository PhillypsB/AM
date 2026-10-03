
// ══════════════════════════════════════════════════
//  CONFIGURACIÓN  ← derivada automáticamente del dataset
// ══════════════════════════════════════════════════
const FECHA_CORTE = window.AM_CORTE_SEL;

const _MC = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// «Datos actualizados a» y «Próxima actualización» describen el corte que se
// está mirando. Se recalculan al cambiar de corte (ver selectCorte).
let DATOS_CORTE_LABEL_CORTO, PROX_DATOS_LABEL_CORTO, PROX_ACTUALIZACION_CORTO;
function fijarEtiquetasCorte(fechaISO) {
  const fc    = new Date(fechaISO + "T12:00:00");
  const nxt   = new Date(fc.getFullYear(), fc.getMonth() + 2, 1);   // fecha próx. actualización
  const datos = new Date(fc.getFullYear(), fc.getMonth() + 1, 1);   // mes de datos que traerá
  DATOS_CORTE_LABEL_CORTO  = _MC[fc.getMonth()]    + " " + fc.getFullYear();
  PROX_DATOS_LABEL_CORTO   = _MC[datos.getMonth()] + " " + datos.getFullYear();
  PROX_ACTUALIZACION_CORTO = "16 " + _MC[nxt.getMonth()];
  const fTxt = document.getElementById('appFooterText');
  if (fTxt) fTxt.innerHTML = buildFooterLine();
}
// Mostrar el enlace "Ayudas generadas" en pantalla. En producción se deja en false
// hasta validarlo en el laboratorio (donde va en true).
const MOSTRAR_ESTADISTICAS = true;

// Helpers de footer (reutilizados para pantalla y Word)
function _fmtFechaHora(d = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
// Fuente de los datos: una sola frase para pantalla, Word y Excel (parametros.js).
const FUENTE_DATOS = (window.PNCM_PARAMETROS && window.PNCM_PARAMETROS.fuente) || 'Padrones oficiales UOAI';
// «14:43 del 16/09/2026» — para «Generado a las …»
function _generadoALas(d = new Date()) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())} del ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}
// Tiempo transcurrido desde que se pidió la página hasta que la app quedó lista
function _tiempoCarga() {
  const ms = Math.round(performance.now());
  return ms < 1000 ? ms + ' ms' : (ms / 1000).toFixed(1).replace('.', ',') + ' s';
}

function buildFooterLine(fechaHora) {
  const fh  = fechaHora || _fmtFechaHora();
  const sep = '<span style="color:#d1d5db;margin:0 6px;">|</span>';
  // cada segmento no se parte a media frase; el salto de línea ocurre entre segmentos
  const seg = html => `<span style="white-space:nowrap;display:inline-block;">${html}</span>`;
  const it  = t => `<span style="color:#9ca3af;font-style:italic;">${t}</span>`;
  const st  = t => `<strong style="color:#374151;">${t}</strong>`;
  const linkStyle = 'color:#1d4ed8;font-weight:700;text-decoration:none;';

  const linea1 =
    seg(`📅 ${it('Datos actualizados a:')} ${st(DATOS_CORTE_LABEL_CORTO)}`) + sep +
    seg(`🔄 ${it('Próxima actualización:')} ${st(PROX_ACTUALIZACION_CORTO)} <span style="color:#9ca3af;">(incluye ${PROX_DATOS_LABEL_CORTO})</span>`);
  // Documentos exportados (Word): fuente en una línea y la hora de generación
  // en otra. Sin versión ni «generado por».
  const linea2 = fechaHora
    ? seg(`🗄️ ${it('Fuente:')} ${st(FUENTE_DATOS)}`)
    : seg(`🗄️ ${it('Fuente:')} ${st(FUENTE_DATOS)}`) + sep +
      seg(`⚡ ${it('Tiempo de carga:')} ${st(_tiempoCarga())}`);

  let linea3;
  if (fechaHora) {
    linea3 = seg(`🕒 ${it('Generado a las')} ${st(fh)}`);
  } else {
    // Pantalla: crédito de autor (+ estadísticas si están habilitadas)
    linea3 = seg(`Diseñado y desarrollado por <a href="https://phillyps-bravo.vercel.app/" target="_blank" rel="noopener" style="${linkStyle}">Phillyps BRAV[O]</a>`);
    if (MOSTRAR_ESTADISTICAS) {
      linea3 += sep + seg(`<a href="#" onclick="abrirEstadisticas();return false;" style="${linkStyle}">📈 Ayudas generadas</a>`);
    }
  }
  return `<div style="margin-bottom:2px;">${linea1}</div>` +
         `<div style="margin-bottom:2px;">${linea2}</div>` +
         `<div>${linea3}</div>`;
}
// Inyecta la información del footer en pantalla
document.addEventListener('DOMContentLoaded', () => fijarEtiquetasCorte(fechaCorteActual() || FECHA_CORTE));

// ══════════════════════════════════════════════════
//  Estadísticas de uso (locales a este dispositivo)
// ══════════════════════════════════════════════════
const AM_STATS_KEY = 'am_stats_v1';
function _leerStats() { try { return JSON.parse(localStorage.getItem(AM_STATS_KEY)) || {}; } catch (e) { return {}; } }
// Etiquetas válidas. Toda acción que produzca una salida debe registrar una
// de estas, y solo una: es lo que cuenta el panel y lo que viaja a Vercel.
const AM_STATS_TAGS = ['consultas', 'word', 'excel', 'ppt', 'wa', 'imagen'];

function registrarStat(tipo) {
  if (AM_STATS_TAGS.indexOf(tipo) < 0) { console.warn('etiqueta de estadística desconocida:', tipo); return; }
  try {
    const s = _leerStats();
    s[tipo] = (s[tipo] || 0) + 1;
    const hoy = new Date().toISOString();
    if (!s.primera) s.primera = hoy;
    s.ultima = hoy;
    localStorage.setItem(AM_STATS_KEY, JSON.stringify(s));
  } catch (e) { /* localStorage no disponible: se ignora */ }
  // Vercel Web Analytics: el contador local es por dispositivo; este envío es
  // el que deja ver el uso agregado en el panel de Vercel. Si el script no
  // está (por ejemplo abriendo el archivo con file://), no pasa nada.
  try {
    if (typeof window.va === 'function') {
      window.va('event', { name: 'am_' + tipo, data: { corte: fechaCorteActual() } });
    }
  } catch (e) { /* analítica caída: nunca debe romper la descarga */ }
}

// El script de analítica solo existe cuando la página se sirve por HTTP
// (Vercel lo publica en esa ruta). En el laboratorio, con file://, no se pide.
if (location.protocol === 'http:' || location.protocol === 'https:') {
  const _sa = document.createElement('script');
  _sa.defer = true;
  _sa.src = '/_vercel/insights/script.js';
  document.head.appendChild(_sa);
}
function cerrarEstadisticas() { const o = document.getElementById('statsOverlay'); if (o) o.remove(); }
function abrirEstadisticas() {
  const s = _leerStats();
  const n = k => s[k] || 0;
  const total = n('word') + n('excel') + n('ppt') + n('imagen');
  const fFecha = iso => iso ? new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const tile = (lbl, val, color) =>
    `<div style="flex:1;min-width:84px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 8px;text-align:center;">
       <div style="font-size:1.45rem;font-weight:800;color:${color};line-height:1;">${(val).toLocaleString('es-PE')}</div>
       <div style="font-size:.66rem;color:#64748b;text-transform:uppercase;letter-spacing:.03em;margin-top:4px;">${lbl}</div>
     </div>`;
  const cont = document.createElement('div');
  cont.id = 'statsOverlay';
  cont.setAttribute('onclick', 'if(event.target===this)cerrarEstadisticas()');
  cont.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;';
  cont.innerHTML =
    `<div style="background:#fff;border-radius:18px;max-width:520px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);">
       <div style="background:linear-gradient(120deg,#0b1f47,#1d4ed8);color:#fff;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;">
         <div>
           <div style="font-size:.64rem;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,.7);font-weight:700;">Estadísticas de uso</div>
           <div style="font-size:1.2rem;font-weight:800;">📈 Ayudas generadas</div>
         </div>
         <button onclick="cerrarEstadisticas()" aria-label="Cerrar" style="background:rgba(255,255,255,.15);border:none;color:#fff;width:32px;height:32px;border-radius:8px;font-size:1rem;cursor:pointer;">✕</button>
       </div>
       <div style="padding:22px;">
         <div style="text-align:center;margin-bottom:18px;">
           <div style="font-size:2.8rem;font-weight:800;color:#1d4ed8;line-height:1;">${total.toLocaleString('es-PE')}</div>
           <div style="font-size:.8rem;color:#64748b;margin-top:4px;">ayudas memoria generadas (Word · Excel · PPT)</div>
         </div>
         <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
           ${tile('Word', n('word'), '#1d4ed8')}
           ${tile('Excel', n('excel'), '#15803d')}
           ${tile('PPT', n('ppt'), '#c2410c')}
           ${tile('Imagen', n('imagen'), '#7c3aed')}
           ${tile('WhatsApp', n('wa'), '#16a34a')}
         </div>
         <div style="display:flex;flex-wrap:wrap;gap:8px;">
           ${tile('Consultas', n('consultas'), '#0f172a')}
           <div style="flex:2;min-width:170px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;">
             <div style="font-size:.74rem;color:#64748b;">Primer uso: <strong style="color:#334155;">${fFecha(s.primera)}</strong></div>
             <div style="font-size:.74rem;color:#64748b;margin-top:5px;">Último uso: <strong style="color:#334155;">${fFecha(s.ultima)}</strong></div>
           </div>
         </div>
         <p style="font-size:.72rem;color:#94a3b8;margin-top:16px;line-height:1.5;">
           📱 Estas cifras corresponden a <strong>este dispositivo</strong>. Las visitas y el tráfico global del sitio se registran en el panel de <strong>Vercel Analytics</strong>.
         </p>
       </div>
     </div>`;
  document.body.appendChild(cont);
}

// Logo PNCM/MIDIS (compartido entre exportaciones)
// Word logo is loaded only when generating a document.


// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════
let   ultimaFecha      = new Date(FECHA_CORTE);
fijarEtiquetasCorte(FECHA_CORTE);
const opciones         = { month: 'long' };
let   mesNombre        = ultimaFecha.toLocaleDateString('es-PE', opciones).toUpperCase();
let   año              = ultimaFecha.getFullYear();

// Poblar select de corte (fechas únicas del dataset, orden descendente)
const fechasCorte = window.AM_MESES.map(m => m.f).sort((a, b) => b.localeCompare(a));
const selectCorte = document.getElementById('selectCorte');
fechasCorte.forEach(f => {
  const fdObj  = new Date(f);
  const fLabel = fdObj.getFullYear() + ' - ' + fdObj.toLocaleDateString('es-PE', { month: 'long' }).toUpperCase();
  const opt    = document.createElement('option');
  opt.value = f;
  opt.text  = fLabel;
  if (f === FECHA_CORTE) opt.selected = true;
  selectCorte.add(opt);
});

// Trae un corte que aún no está en memoria
function _traerCorte(f) {
  if (window.AM_EN_MEMORIA.has(f)) return Promise.resolve();
  const m = window.AM_MESES.find(x => x.f === f);
  if (!m) return Promise.reject(new Error('corte desconocido'));
  if (!window.AM_PEDIDOS[f]) {
    window.AM_PEDIDOS[f] = new Promise((ok, mal) => {
      const sc = document.createElement('script');
      sc.src = window.AM_DATOS + 'mensual/BD/' + m.a;
      sc.onload  = () => { window.AM_EN_MEMORIA.add(f); ok(); };
      sc.onerror = mal;
      document.head.appendChild(sc);
    });
  }
  return window.AM_PEDIDOS[f];
}

selectCorte.addEventListener('change', () => {
  const f = selectCorte.value;
  const aplicar = () => {
    ultimaFecha = new Date(f);
    mesNombre   = ultimaFecha.toLocaleDateString('es-PE', { month: 'long' }).toUpperCase();
    año         = ultimaFecha.getFullYear();
    fijarEtiquetasCorte(f);
    aplicarInsumos(f);
    poblarCentrosPoblados();   // reevalúa el filtro CCPP según el nuevo corte
    if (selectDep.value) filtrar(); else mostrarResumenNacional();
  };
  selectCorte.disabled = true;
  _traerCorte(f)
    .then(() => Promise.all([window.AM_NEEDS_CP ? cargarCCPP(f) : Promise.resolve(false), cargarACT(f), cargarSA(f)]))
    .then(aplicar)
    .catch(() => {   // respaldo: recargar la página pidiendo ese corte
      const url = new URL(location.href);
      url.searchParams.set('corte', f);
      location.href = url.toString();
    })
    .finally(() => { selectCorte.disabled = false; });
});

// ── Vista inicial: resumen nacional, antes de cualquier consulta ──
function mostrarResumenNacional() {
  const r = calcularResumenNacional();
  document.getElementById('resultadosKicker').textContent    = 'Vista nacional';
  document.getElementById('resultadosAvatar').textContent    = '🌎';
  document.getElementById('resultadosTitulo').textContent    = 'Resumen nacional';
  document.getElementById('resultadosSubtitulo').textContent = 'Todo el país · ' + mesNombre + ' ' + año;
  document.getElementById('resultados').innerHTML =
    renderKPIs(r, null, null, null) +
    `<div class="am-narrativa"><div class="am-narrativa-lbl">Resumen narrativo</div>` +
      generarIntroNarrativa('nacional', null, null, null, r) +
      `<div class="am-cols">` +
        `<div class="am-col am-col-saf">${generarNarrativaSAF('nacional', r)}</div>` +
        `<div class="am-col am-col-scd">${generarNarrativaSCD('nacional', r)}</div>` +
      `</div></div>`;
  document.getElementById('resultadosArea').classList.remove('hidden');
  // el ámbito nacional también es exportable
  r.departamento = null; r.provincia = null; r.distrito = null;
  window.ultimoResultado = r;
  setExportButtons(true);
  mostrarConsultar(false);
}

const selectDep  = document.getElementById('selectDepartamento');
const selectProv = document.getElementById('selectProvincia');
const selectDist = document.getElementById('selectDistrito');
const selectCP   = document.getElementById('selectCentroPoblado');

// ── Datos por CENTRO POBLADO — carga mensual auto-detectada ──
// Cada mes se genera DATOS_PNCM/mensual/CPP/ccpp_YYYYMM.js, que se autorregistra en
// window.CCPP_STORE[fecha] = { saf, scd }. La app intenta cargar el archivo
// del corte seleccionado; si existe, habilita el filtro CCPP; si no, lo omite.
const CCPP_IDX = {
  SAF: { CC:0, NOM:1, FAM:2, NINO_V:3, NINA_M:4, GEST:5, USU:6, G:7, H:8 },
  SCD: { CC:0, NOM:1, USU:2, VAR:3, MUJ:4, C6:5, C8:6, C9:7 }
};
window.CCPP_STORE = window.CCPP_STORE || {};
const _ccppIntentos = {};   // fecha → Promise (no recarga ni reintenta 404)

function _fechaAWmes(fecha) { return fecha.replace(/-/g, '').slice(0, 6); } // 2026-07-31 → 202607

function cargarCCPP(fecha) {
  if (!fecha) return Promise.resolve(false);
  if (window.CCPP_STORE[fecha]) return Promise.resolve(true);
  if (_ccppIntentos[fecha]) return _ccppIntentos[fecha];
  _ccppIntentos[fecha] = new Promise(resolve => {
    const s = document.createElement('script');
    s.src = window.AM_DATOS + 'mensual/CPP/ccpp_' + _fechaAWmes(fecha) + '.js';
    s.onload  = () => resolve(!!window.CCPP_STORE[fecha]);
    s.onerror = () => resolve(false);   // no hay CCPP para ese corte
    document.head.appendChild(s);
  });
  return _ccppIntentos[fecha];
}

// ── Insumos de corte único: ACTORES y SERVICIOS ALIMENTARIOS ──
// Mismo trato que el CCPP: se piden por año-mes y, si el archivo de ese corte
// no existe, la promesa resuelve en falso y la app sigue sin ese detalle.
const _insIntentos = {};
function _cargarInsumo(carpeta, prefijo, fecha) {
  const clave = carpeta + '@' + fecha;
  if (_insIntentos[clave]) return _insIntentos[clave];
  _insIntentos[clave] = new Promise(resolve => {
    const s = document.createElement('script');
    s.src = window.AM_DATOS + 'mensual/' + carpeta + '/' + prefijo + _fechaAWmes(fecha) + '.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
  return _insIntentos[clave];
}
function cargarACT(f) {
  if (window.ACT_STORE[f]) return Promise.resolve(true);
  return _cargarInsumo('ACTORES', 'actores_', f).then(() => {
    if (window.ACTORES && window.ACTORES.periodo === f) window.ACT_STORE[f] = window.ACTORES;
    return !!window.ACT_STORE[f];
  });
}
function cargarSA(f) {
  if (window.SA_STORE[f]) return Promise.resolve(true);
  return _cargarInsumo('SA', 'sa_', f).then(() => {
    const m = window.SERVICIOS_ALIMENTARIOS;
    if (m && m.periodo === f) window.SA_STORE[f] = m;
    return !!window.SA_STORE[f];
  });
}
// Deja en pie los insumos del corte elegido y descarta los del anterior
function aplicarInsumos(f) {
  window.ACTORES = window.ACT_STORE[f] || null;
  window.SERVICIOS_ALIMENTARIOS = window.SA_STORE[f] || null;
  if (window.AM__resetIdx) window.AM__resetIdx();
  if (typeof invalidarBusqueda === 'function') invalidarBusqueda();
}

function fechaCorteActual() { try { return ultimaFecha.toISOString().split('T')[0]; } catch (e) { return null; } }
function ccppDelCorte() { const f = fechaCorteActual(); return (f && window.CCPP_STORE[f]) ? window.CCPP_STORE[f] : null; }

// Ubigeo (6 díg) del distrito seleccionado → llave para los datos CCPP
function ubigeoDe(dep, prov, dist) {
  const rec = dataset.find(d => d.departamento === dep && d.provincia === prov && d.distrito === dist);
  return rec ? rec.ubigeo : null;
}

// Reinicia el selector de centro poblado
function resetCentrosPoblados() {
  selectCP.innerHTML = '<option value="">— Todos —</option>';
  selectCP.disabled = true;
}

// Une CCPP de SAF y SCD del distrito y llena el 4º selector (solo si el corte tiene datos)
function poblarCentrosPoblados() {
  resetCentrosPoblados();
  const store = ccppDelCorte();
  if (!store) {
    if (selectDist.value && !_ccppIntentos[fechaCorteActual()]) {
      selectCP.disabled=false;
      selectCP.innerHTML='<option value="">Consultar centros poblados…</option>';
    }
    return;
  }
  const dep = selectDep.value, prov = selectProv.value, dist = selectDist.value;
  if (!dist) return;
  const ub = ubigeoDe(dep, prov, dist);
  if (!ub) return;
  const mapa = {};
  (store.saf[ub] || []).forEach(r => { mapa[r[0]] = { c: r[0], n: r[1] }; });
  (store.scd[ub] || []).forEach(r => { if (!mapa[r[0]]) mapa[r[0]] = { c: r[0], n: r[1] }; });
  const lista = Object.values(mapa).sort((a, b) => a.n.localeCompare(b.n, 'es'));
  if (!lista.length) return;
  selectCP.disabled = false;
  lista.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.c; opt.text = o.n;
    selectCP.add(opt);
  });
}

// Centros poblados: carga diferida al solicitar búsqueda o filtro.
// Loaded on search/filter intent, never required for a national/district start.
async function solicitarCentros() {
  window.AM_NEEDS_CP=true;
  const f=fechaCorteActual();
  const selected=selectCP.value;
  const ok=await cargarCCPP(f);
  if(f!==fechaCorteActual())return false;
  if(ok){
    _IDX_BUSCA=null;
    poblarCentrosPoblados();
    if(selected&&[...selectCP.options].some(o=>o.value===selected))selectCP.value=selected;
    const field=document.getElementById('buscadorAmbito');
    if(document.activeElement===field&&field.value.trim().length>=2)
      _pintarSugerencias(_buscarAmbitos(field.value),_sinTildes(field.value).trim());
  }else if(selectDist.value){
    selectCP.innerHTML='<option value="">No disponible para este corte</option>';selectCP.disabled=true;
  }
  return ok;
}
selectCP.addEventListener('focus',solicitarCentros);
document.getElementById('buscadorAmbito').addEventListener('focus',solicitarCentros);

// ── Exclusión mutua: "Ámbito especial" ↔ búsqueda por ubicación ──
const selectEsp = document.getElementById('selectEspecial');

// Exclusión por RESET (no se deshabilita nada): elegir uno limpia el otro,
// así siempre se puede alternar entre ubicación y ámbito especial.
function limpiarUbicacionSelects() {
  selectDep.value = '';
  selectProv.innerHTML = '<option value="">— Todas —</option>';
  selectDist.innerHTML = '<option value="">— Todas —</option>';
  resetCentrosPoblados();
}
function limpiarEspecialSelect() {
  selectEsp.value = '';
  const info = document.getElementById('especial-info');
  if (info) info.style.display = 'none';
}
// onchange del selector de ámbito especial
function onEspecialChange() {
  mostrarConsultar(false);
  if (selectEsp.value) {
    limpiarUbicacionSelects();   // el ámbito especial reemplaza a la ubicación
    filtrarEspecial();
  } else {
    mostrarResumenNacional();
  }
}

// Muestra/oculta la búsqueda avanzada (ámbito especial)
function toggleAvanzada() {
  const card = document.querySelector('.filter-card');
  const box = document.getElementById('avanzadaBox');
  const btn = document.getElementById('avanzadaToggle');
  const abrir = box.style.display === 'none' || !box.style.display;
  // En móvil la tarjeta se colapsa al filtrar; el bloque avanzado vive dentro,
  // así que primero hay que expandir la tarjeta para que sea visible.
  if (abrir && card && card.classList.contains('plegado')) toggleFiltros(true);
  box.style.display = abrir ? 'flex' : 'none';
  btn.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  if (abrir) {
    box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const caja = document.getElementById('buscadorAmbito');
    if (caja && !esMovil()) setTimeout(() => caja.focus(), 220);
  }
}

// ── Móvil: la búsqueda NO es en vivo; se dispara con el botón "Consultar" ──
function esMovil() { return window.matchMedia('(max-width:820px)').matches; }
function mostrarConsultar(show) { const b = document.getElementById('btnConsultar'); if (b) b.classList.toggle('visible', !!show); }
function consultar() { mostrarConsultar(false); filtrar(); }
// En PC filtra en vivo; en móvil solo muestra el botón para consultar.
function filtrarSiPC() { if (esMovil()) mostrarConsultar(true); else filtrar(); }

const departamentos = [...new Set(dataset.map(d => d.departamento))].sort((a, b) => a.localeCompare(b, 'es'));
selectDep.innerHTML = '<option value="">— Elegir —</option>';
departamentos.forEach(dep => {
  const opt = document.createElement('option');
  opt.value = opt.text = dep;
  selectDep.add(opt);
});

selectDep.addEventListener('change', () => {
  const dep = selectDep.value;
  // al usar la ubicación, el ámbito especial se limpia (quedan excluyentes)
  if (dep) limpiarEspecialSelect();
  selectProv.innerHTML = '<option value="">— Todas —</option>';
  selectDist.innerHTML = '<option value="">— Todas —</option>';
  resetCentrosPoblados();
  const provincias = [...new Set(dataset.filter(d => d.departamento === dep).map(d => d.provincia))].sort((a, b) => a.localeCompare(b, 'es'));
  provincias.forEach(prov => {
    const opt = document.createElement('option');
    opt.value = opt.text = prov;
    selectProv.add(opt);
  });
  if (dep) filtrarSiPC(); else limpiar();
});

selectProv.addEventListener('change', () => {
  const dep  = selectDep.value;
  const prov = selectProv.value;
  selectDist.innerHTML = '<option value="">— Todas —</option>';
  resetCentrosPoblados();
  const distritos = [...new Set(dataset.filter(d => d.departamento === dep && d.provincia === prov).map(d => d.distrito))].sort((a, b) => a.localeCompare(b, 'es'));
  distritos.forEach(dist => {
    const opt = document.createElement('option');
    opt.value = opt.text = dist;
    selectDist.add(opt);
  });
  if (dep) filtrarSiPC();
});

selectDist.addEventListener('change', () => {
  poblarCentrosPoblados();
  if (selectDep.value) filtrarSiPC();
});

selectCP.addEventListener('change', () => {
  if (selectDep.value) filtrarSiPC();
});

// ══════════════════════════════════════════════════
//  BUSCADOR EN VIVO  (Búsqueda avanzada)
// ══════════════════════════════════════════════════
// Escribe y filtra sobre todos los ámbitos del corte vigente: departamentos,
// provincias, distritos y —si el corte tiene archivo CCPP— centros poblados.
// El índice se arma la primera vez que se escribe y se bota al cambiar de
// corte, porque los distritos y los centros poblados varían entre meses.
const BUSCA_MAX = 40;
let _IDX_BUSCA = null;

function _sinTildes(t) {
  return (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
}

function _indiceBusqueda() {
  if (_IDX_BUSCA) return _IDX_BUSCA;
  const f = fechaCorteActual();
  const filas = dataset.filter(d => d.fecha === f);
  const vistos = new Set();
  const out = [];
  const geo = {};
  filas.forEach(d => {
    geo[d.ubigeo] = d;
    if (!vistos.has('D|' + d.departamento)) {
      vistos.add('D|' + d.departamento);
      out.push({ t: d.departamento, sub: 'Departamento', nivel: 'Departamento', dep: d.departamento });
    }
    const kp = 'P|' + d.departamento + '|' + d.provincia;
    if (!vistos.has(kp)) {
      vistos.add(kp);
      out.push({ t: d.provincia, sub: d.departamento, nivel: 'Provincia', dep: d.departamento, prov: d.provincia });
    }
    out.push({ t: d.distrito, sub: d.provincia + ' · ' + d.departamento, nivel: 'Distrito',
               dep: d.departamento, prov: d.provincia, dist: d.distrito });
  });
  const store = ccppDelCorte();
  if (store) {
    const agregado = new Set();
    ['saf', 'scd'].forEach(bloque => {
      Object.keys(store[bloque]).forEach(ub => {
        const g = geo[ub];
        if (!g) return;
        store[bloque][ub].forEach(r => {
          const k = ub + r[0];
          if (agregado.has(k)) return;
          agregado.add(k);
          out.push({ t: r[1], sub: g.distrito + ' · ' + g.provincia + ', ' + g.departamento,
                     nivel: 'Centro poblado', dep: g.departamento, prov: g.provincia,
                     dist: g.distrito, cp: r[0] });
        });
      });
    });
  }
  out.forEach(o => { o.k = _sinTildes(o.t); o.ks = _sinTildes(o.sub); });
  _IDX_BUSCA = out;
  return out;
}

// Al cambiar de corte cambian los distritos y los centros poblados
function invalidarBusqueda() {
  _IDX_BUSCA = null;
  const caja = document.getElementById('buscadorAmbito');
  if (caja && caja.value) { caja.value = ''; _pintarSugerencias([]); _verBotonLimpiar(); }
}

function _puntaje(o, q) {
  const i = o.k.indexOf(q);
  if (i === 0) return 0;              // empieza con lo escrito
  if (i > 0)   return 1;              // lo contiene
  return o.ks.indexOf(q) >= 0 ? 2 : -1;   // coincide por el ámbito que lo contiene
}

const _PESO_NIVEL = { 'Departamento': 0, 'Provincia': 1, 'Distrito': 2, 'Centro poblado': 3 };

function _buscarAmbitos(texto) {
  const q = _sinTildes(texto).trim();
  if (q.length < 2) return [];
  const res = [];
  for (const o of _indiceBusqueda()) {
    const p = _puntaje(o, q);
    if (p >= 0) res.push({ o, p });
  }
  res.sort((a, b) => a.p - b.p
    || _PESO_NIVEL[a.o.nivel] - _PESO_NIVEL[b.o.nivel]
    || a.o.t.localeCompare(b.o.t, 'es'));
  return res.slice(0, BUSCA_MAX).map(x => x.o);
}

function _escBusqueda(texto) { return String(texto ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c])); }
function _resaltar(texto, q) {
  const i = _sinTildes(texto).indexOf(q);
  if (i < 0 || !q) return _escBusqueda(texto);
  return _escBusqueda(texto.slice(0, i)) + '<b>' + _escBusqueda(texto.slice(i, i + q.length)) + '</b>' + _escBusqueda(texto.slice(i + q.length));
}

let _sugActual = [], _sugFoco = -1;

function _pintarSugerencias(lista, q) {
  const caja = document.getElementById('buscadorSug');
  if (!caja) return;
  _sugActual = lista; _sugFoco = -1;
  if (!lista.length) {
    const escrito = (document.getElementById('buscadorAmbito') || {}).value || '';
    if (escrito.trim().length >= 2) {
      caja.innerHTML = '<div class="busca-vacio">Sin coincidencias para “' + _escBusqueda(escrito.trim()) + '”</div>';
      caja.classList.add('abierta');
      _colocarSugerencias();
    } else {
      caja.innerHTML = ''; caja.classList.remove('abierta');
    }
    return;
  }
  caja.innerHTML = lista.map((o, i) =>
    `<div class="busca-item" role="option" data-i="${i}" onclick="irAAmbito(${i})">
       <span class="busca-nivel" data-n="${o.nivel}">${o.nivel}</span>
       <span class="busca-txt">${_resaltar(o.t, q)} <span style="color:#94a3b8;">· ${_escBusqueda(o.sub)}</span></span>
     </div>`).join('');
  caja.classList.add('abierta');
  _colocarSugerencias();
}

function _cerrarSugerencias() {
  const caja = document.getElementById('buscadorSug');
  if (caja) { caja.classList.remove('abierta'); }
  _sugFoco = -1;
}

// Coloca el desplegable justo debajo del campo. Va en position:fixed y colgado
// del <body> porque el contenedor de los filtros recorta lo que se le sale.
function _colocarSugerencias() {
  const caja = document.getElementById('buscadorAmbito');
  const sug  = document.getElementById('buscadorSug');
  if (!caja || !sug || !sug.classList.contains('abierta')) return;
  const r = caja.getBoundingClientRect();
  sug.style.left  = r.left + 'px';
  sug.style.width = r.width + 'px';
  sug.style.top   = (r.bottom + 6) + 'px';
  sug.style.maxHeight = Math.max(140, Math.min(320, window.innerHeight - r.bottom - 16)) + 'px';
}

function _verBotonLimpiar() {
  const caja = document.getElementById('buscadorAmbito');
  const btn  = document.getElementById('buscadorLimpiar');
  if (caja && btn) btn.style.display = caja.value ? 'block' : 'none';
}

// Llena un <select> sin disparar su onchange (evita filtrar tres veces seguidas)
function _llenarSelect(sel, valores, vacio) {
  sel.innerHTML = '<option value="">' + vacio + '</option>';
  valores.forEach(v => { const o = document.createElement('option'); o.value = o.text = v; sel.add(o); });
}

// Salta al ámbito elegido: deja los cuatro selectores como si se hubieran
// elegido a mano y consulta una sola vez.
function irAAmbito(i) {
  const o = _sugActual[i];
  if (!o) return;
  limpiarEspecialSelect();
  const f = fechaCorteActual();
  const delCorte = d => d.fecha === f;

  selectDep.value = o.dep;
  _llenarSelect(selectProv, [...new Set(dataset.filter(d => delCorte(d) && d.departamento === o.dep).map(d => d.provincia))]
    .sort((a, b) => a.localeCompare(b, 'es')), '— Todas —');
  selectProv.value = o.prov || '';

  if (o.prov) {
    _llenarSelect(selectDist, [...new Set(dataset.filter(d => delCorte(d) && d.departamento === o.dep && d.provincia === o.prov).map(d => d.distrito))]
      .sort((a, b) => a.localeCompare(b, 'es')), '— Todas —');
    selectDist.value = o.dist || '';
  } else {
    _llenarSelect(selectDist, [], '— Todas —');
  }

  if (o.dist) { poblarCentrosPoblados(); selectCP.value = o.cp || ''; }
  else { resetCentrosPoblados(); }

  document.getElementById('buscadorAmbito').value = o.t;
  _cerrarSugerencias();
  _verBotonLimpiar();
  mostrarConsultar(false);
  filtrar();
}

(function _armarBuscador() {
  const caja = document.getElementById('buscadorAmbito');
  const btn  = document.getElementById('buscadorLimpiar');
  const sug  = document.getElementById('buscadorSug');
  if (!caja) return;

  document.body.appendChild(sug);   // fuera del contenedor que lo recorta
  window.addEventListener('scroll', _colocarSugerencias, true);
  window.addEventListener('resize', _colocarSugerencias);

  let t = null;
  caja.addEventListener('input', () => {
    _verBotonLimpiar();
    clearTimeout(t);
    const v = caja.value;
    t = setTimeout(() => _pintarSugerencias(_buscarAmbitos(v), _sinTildes(v).trim()), 120);
  });

  caja.addEventListener('keydown', e => {
    if (!sug.classList.contains('abierta')) return;
    const items = sug.querySelectorAll('.busca-item');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!items.length) return;
      _sugFoco = (_sugFoco + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((el, i) => el.classList.toggle('activa', i === _sugFoco));
      items[_sugFoco].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      irAAmbito(_sugFoco >= 0 ? _sugFoco : 0);
    } else if (e.key === 'Escape') {
      _cerrarSugerencias();
    }
  });

  caja.addEventListener('focus', () => { if (caja.value.trim().length >= 2) _pintarSugerencias(_buscarAmbitos(caja.value), _sinTildes(caja.value).trim()); });
  btn.addEventListener('click', () => { caja.value = ''; _verBotonLimpiar(); _cerrarSugerencias(); caja.focus(); });
  document.addEventListener('click', e => {
    if (!e.target.closest('.busca-wrap') && !e.target.closest('#buscadorSug')) _cerrarSugerencias();
  });
})();

// ══════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════
function getEtiquetaFocalizacion(valor) {
  if (valor === '1') return { emoji: '✅', texto: 'FOCALIZADO',    color: '#d4edda', borde: '#28a745' };
  if (valor === '2') return { emoji: '🔁', texto: 'CONTINUIDAD',   color: '#fff3cd', borde: '#ffc107' };
  return                    { emoji: '❌', texto: 'NO FOCALIZADO', color: '#f8d7da', borde: '#dc3545' };
}

// ── Descarga de una tarjeta como imagen ────────────────────────────────────
// html2canvas devuelve un lienzo VACÍO si el objetivo es .service-card (o el
// contenedor que la aloja): la tarjeta es un grid item y no la dibuja. Sus
// partes internas sí se dibujan, así que se reconstruye la tarjeta como un div
// plano —mismos estilos, sin la clase que rompe la captura— dentro de un marco
// con el gris de la página, que además reemplaza a la sombra (tampoco se captura).
async function descargarTarjeta(serv) {
  const card = document.querySelector(`#resultados .service-card[data-serv="${serv}"]`);
  if (!card) return;
  try { await asegurarLibs(['html2canvas', 'filesaver']); }
  catch (e) { alert('No se pudo cargar la librería de captura. Verifique la conexión.'); return; }
  const FONDO  = '#f7f6f8';
  const BORDE  = serv === 'saf' ? '#e00060' : '#120c15';
  const ancho  = Math.round(card.getBoundingClientRect().width);

  const marco = document.createElement('div');
  marco.style.cssText = `position:fixed;left:-10000px;top:0;padding:26px;background:${FONDO};` +
                        `width:${ancho + 52}px;font-family:'Inter','Segoe UI',Roboto,sans-serif;`;
  const copia = document.createElement('div');
  copia.className = serv === 'saf' ? 'saf-card' : 'scd-card';
  copia.style.cssText = `width:${ancho}px;background:#fff;border:1px solid #dbe1ea;` +
                        `border-top:4px solid ${BORDE};border-radius:16px;`;
  copia.innerHTML = card.innerHTML;
  copia.querySelectorAll('details').forEach(detail => { detail.open = true; });
  copia.querySelectorAll('.card-dl').forEach(b => b.remove());
  marco.appendChild(copia);
  document.body.appendChild(marco);

  try {
    const lienzo = await html2canvas(marco, { backgroundColor: FONDO, scale: 2, logging: false });
    const amb = (card.querySelector('.card-chip-amb')?.textContent || 'NACIONAL').replace(/[\/ ]+/g, '_');
    const per = (card.querySelector('.card-chip')?.textContent || '').replace(/\s+/g, '_');
    const nombre = `Tarjeta_${serv.toUpperCase()}_${amb}_${per}.png`;
    registrarStat('imagen');
    await new Promise(res => lienzo.toBlob(b => {
      if (typeof saveAs === 'function') saveAs(b, nombre);
      else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b); a.download = nombre;
        document.body.appendChild(a); a.click(); a.remove();
      }
      res();
    }));
  } catch (e) {
    alert('No se pudo generar la imagen: ' + e.message);
  } finally {
    marco.remove();
  }
}

function setExportButtons(enabled) {
  if (enabled) queueMicrotask(() => window.AMPremium?.refresh());
  // En ámbito especial solo se ofrece Excel; el resto se oculta.
  const esEspecial = !!(window.ultimoResultado && window.ultimoResultado._esEspecial);
  ['btnWord','btnExcel','btnPPT','btnWA'].forEach(id => {
    const b = document.getElementById(id);
    if (!b) return;
    b.disabled = !enabled;
    b.style.display = (esEspecial && id !== 'btnExcel') ? 'none' : '';
  });
}


// ── Filtros plegables ──────────────────────────────────────────────────────
// En el celular ocupaban media pantalla. Tras consultar se recogen solos y
// la cabecera muestra el ámbito elegido.
function toggleFiltros(forzar) {
  const card = document.querySelector('.filter-card');
  const btn  = document.getElementById('filtroToggle');
  if (!card || !btn) return;
  const abrir = typeof forzar === 'boolean' ? forzar : card.classList.contains('plegado');
  card.classList.toggle('plegado', !abrir);
  btn.setAttribute('aria-expanded', String(abrir));
}
function resumirFiltros() {
  const r = document.getElementById('filtroResumen');
  if (!r) return;
  const v = i => (document.getElementById(i) || {}).value || '';
  const p = [v('selectDepartamento'), v('selectProvincia'), v('selectDistrito')].filter(Boolean);
  r.textContent = p.length ? p.join(' · ') : 'Todo el país';
}

function limpiar() {
  selectDep.value  = '';
  selectProv.innerHTML = '<option value="">— Todas —</option>';
  selectDist.innerHTML = '<option value="">— Todas —</option>';
  resetCentrosPoblados();
  limpiarEspecialSelect();
  mostrarConsultar(false);
  document.getElementById('loadingState').classList.add('hidden');
  resumirFiltros(); toggleFiltros(true);
  mostrarResumenNacional();   // se vuelve al panorama nacional, no a una pantalla vacía
}

// ══════════════════════════════════════════════════
//  FILTRAR + RENDERIZAR KPIs
// ══════════════════════════════════════════════════
// ── Ámbitos especiales ────────────────────────────────────────────────────
// Los distritos de cada ámbito viven en DATOS_PNCM/fijo: ambitos_especiales.js
// (VRAEM, NOR-VRAEM) y frontera_distritos.js (FRONTERAS).
const AMBITOS_ESPECIALES = {
  VRAEM: {
    label:   window.AMBITOS_UBIGEOS.VRAEM.label,
    ubigeos: new Set(window.AMBITOS_UBIGEOS.VRAEM.ubigeos)
  },
  'NOR-VRAEM': {
    label:   window.AMBITOS_UBIGEOS['NOR-VRAEM'].label,
    ubigeos: new Set(window.AMBITOS_UBIGEOS['NOR-VRAEM'].ubigeos)
  },
  FRONTERAS: {
    label: 'Distritos de frontera (SIRF \u2013 Ministerio de Relaciones Exteriores)',
    ubigeos: new Set(FRONTERA_UBIGEOS)   // 85 distritos, ver frontera_distritos.js
  }
};

function filtrarEspecial() {
  const selectEsp = document.getElementById('selectEspecial');
  const ambito    = selectEsp.value;
  if (!ambito) { alert('Por favor seleccione un ámbito especial.'); return; }

  const config  = AMBITOS_ESPECIALES[ambito];
  const fStr    = ultimaFecha.toISOString().split('T')[0];
  const datosAm = dataset.filter(d => config.ubigeos.has(d.ubigeo) && d.fecha === fStr);

  if (!datosAm.length) {
    alert('No se encontraron datos para el ámbito seleccionado en el corte actual.');
    return;
  }

  const sumBy = (key) => datosAm.reduce((s,d) => s+(d[key]||0), 0);
  const distSAF = new Set(datosAm.filter(d=>d.nfamilia_saf>0).map(d => d.ubigeo));
  const distSCD = new Set(datosAm.filter(d=>d.nniños_scd>0).map(d => d.ubigeo));
  const provSAF = new Set(datosAm.filter(d=>d.nfamilia_saf>0).map(d=>d.provincia));
  const provSCD = new Set(datosAm.filter(d=>d.nniños_scd>0).map(d=>d.provincia));
  const depsSAF = new Set(datosAm.filter(d=>d.nfamilia_saf>0).map(d=>d.departamento));
  const depsSCD = new Set(datosAm.filter(d=>d.nniños_scd>0).map(d=>d.departamento));

  const resumen = {
    familias_2025: sumBy('nfamilia_saf'),
    gestantes_SAF: sumBy('ngestantes_saf'), niños_saf: sumBy('nniños_saf'),
    niños_2025: sumBy('nniños_scd'),
    ejec_saf: sumBy('ejecucion_saf'), ejec_scd: sumBy('ejecucion_scd'),
    CG_SAF: sumBy('CG_SAF'), FACILITADOR_SAF: sumBy('FACILITADOR_SAF'),
    CG_SCD: sumBy('CG_SCD'), MadresCuidadoras_SCD: sumBy('MadresCuidadoras_SCD'),
    CIAI_SCD: sumBy('CIAI_SCD'), SA_SCD: sumBy('SA_SCD'),
    dist_saf: distSAF.size, dist_scd: distSCD.size,
    prov_saf: provSAF.size, prov_scd: provSCD.size,
    dep_saf: depsSAF.size, dep_scd: depsSCD.size,
    departamento: ambito, provincia: '', distrito: '',
    CUMPLE_SAF: null, CUMPLE_SCD: null,
    ubigeos: [...new Set(datosAm.map(x => x.ubigeo))],
    ccpp: null,
    _esEspecial: true, _ambitoLabel: config.label, _ambito: ambito,
    _datos: datosAm
  };

  document.getElementById('resultadosKicker').textContent   = 'Ámbito especial';
  document.getElementById('resultadosAvatar').textContent   = ambito === 'FRONTERAS' ? '🛂' : '🌿';
  document.getElementById('resultadosTitulo').textContent   = ambito;
  document.getElementById('resultadosSubtitulo').textContent = config.label + ' · ' + mesNombre + ' ' + año;

  // Mostrar info badge
  const info = document.getElementById('especial-info');
  info.style.display = 'flex';
  document.getElementById('especial-label').innerHTML =
    `<strong>${ambito}</strong> — ${datosAm.length} registros · ${distSAF.size+distSCD.size} distritos ·
     ${[...new Set(datosAm.map(d=>d.departamento))].length} departamentos`;

  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('resultadosArea').classList.add('hidden');

  setTimeout(() => {
    // Render KPIs globales del ámbito
    let htmlSalida = renderKPIs(resumen, ambito, '', '');
    // Tabla de cobertura por departamento dentro del ámbito
    htmlSalida += generarTablaCoberturaEspecial(datosAm, ambito);
    document.getElementById('resultados').innerHTML = htmlSalida;
    window.ultimoResultado = resumen;
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('resultadosArea').classList.remove('hidden');
    setExportButtons(true);
    resumirFiltros();
    if (window.matchMedia('(max-width:820px)').matches) toggleFiltros(false);
  }, 40);
}

function generarTablaCoberturaEspecial(datosAm, titulo) {
  // Agrupa por departamento dentro del ámbito
  const mapa = {};
  datosAm.forEach(r => {
    const k = r.departamento;
    if (!mapa[k]) mapa[k] = {fam:0,nSaf:0,gest:0,eSaf:0,uScd:0,ciai:0,eScd:0};
    mapa[k].fam  += r.nfamilia_saf  ||0;
    mapa[k].nSaf += r.nniños_saf    ||0;
    mapa[k].gest += r.ngestantes_saf||0;
    mapa[k].eSaf += r.ejecucion_saf ||0;
    mapa[k].uScd += r.nniños_scd    ||0;
    mapa[k].ciai += r.CIAI_SCD      ||0;
    mapa[k].eScd += r.ejecucion_scd ||0;
  });
  const deps = Object.keys(mapa).sort((a,b)=>a.localeCompare(b,'es'));
  const fmt  = n => Math.round(n).toLocaleString('es-PE');
  const fmtS = n => n>0?'S/. '+Math.round(n).toLocaleString('es-PE'):'S/ 0';

  let tot = {fam:0,nSaf:0,gest:0,eSaf:0,uScd:0,ciai:0,eScd:0};
  let filas = '';
  deps.forEach((dep,i) => {
    const m = mapa[dep];
    Object.keys(tot).forEach(k => tot[k]+=m[k]);
    const bg = i%2===1?'background:#f8fafc;':'';
    filas += `<tr style="${bg}">
      <td style="text-align:left;padding:4px 8px;border:1px solid #e2e8f0;font-weight:600;">${dep}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(m.fam)}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(m.nSaf)}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(m.gest)}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;font-weight:600;">${fmtS(m.eSaf)}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(m.uScd)}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;">${fmt(m.ciai)}</td>
      <td style="text-align:right;padding:4px 8px;border:1px solid #e2e8f0;font-weight:600;">${fmtS(m.eScd)}</td>
    </tr>`;
  });

  return `<div class="cobertura-card" style="margin-top:24px;background:#fff;padding:18px;border-radius:12px;
    box-shadow:0 2px 16px rgba(0,0,0,.07);border:1px solid #e2e8f0;overflow-x:auto;grid-column:1 / -1;">
    <h3 style="font-size:1rem;font-weight:700;color:#1e293b;margin-bottom:12px;">
      COBERTURA ${titulo} — Por Departamento
    </h3>
    <table style="width:100%;border-collapse:collapse;font-size:.83rem;">
      <thead>
        <tr>
          <th rowspan="2" style="background:#4b5563;color:#fff;border:1px solid #374151;padding:5px 8px;text-align:left;">DEPARTAMENTO</th>
          <th colspan="4" style="background:#6b7280;color:#fff;border:1px solid #374151;padding:5px;text-align:center;">Serv. Acompañamiento a Familias</th>
          <th colspan="3" style="background:#9ca3af;color:#fff;border:1px solid #374151;padding:5px;text-align:center;">Serv. Cuidado Diurno</th>
        </tr>
        <tr>
          <th style="background:#e5e7eb;border:1px solid #d1d5db;padding:3px 6px;text-align:center;">FAMILIAS</th>
          <th style="background:#e5e7eb;border:1px solid #d1d5db;padding:3px 6px;text-align:center;">NIÑAS/OS</th>
          <th style="background:#e5e7eb;border:1px solid #d1d5db;padding:3px 6px;text-align:center;">GESTANTES</th>
          <th style="background:#e5e7eb;border:1px solid #d1d5db;padding:3px 6px;text-align:center;">S/. EJEC.</th>
          <th style="background:#f3f4f6;border:1px solid #d1d5db;padding:3px 6px;text-align:center;">USUARIOS</th>
          <th style="background:#f3f4f6;border:1px solid #d1d5db;padding:3px 6px;text-align:center;">CIAI</th>
          <th style="background:#f3f4f6;border:1px solid #d1d5db;padding:3px 6px;text-align:center;">S/. EJEC.</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
      <tfoot>
        <tr style="font-weight:700;">
          <td style="background:#e5e7eb;padding:4px 8px;border:1px solid #d1d5db;text-align:left;">Total ${titulo}</td>
          <td style="background:#e5e7eb;padding:4px 8px;border:1px solid #d1d5db;text-align:right;">${fmt(tot.fam)}</td>
          <td style="background:#e5e7eb;padding:4px 8px;border:1px solid #d1d5db;text-align:right;">${fmt(tot.nSaf)}</td>
          <td style="background:#e5e7eb;padding:4px 8px;border:1px solid #d1d5db;text-align:right;">${fmt(tot.gest)}</td>
          <td style="background:#e5e7eb;padding:4px 8px;border:1px solid #d1d5db;text-align:right;">${fmtS(tot.eSaf)}</td>
          <td style="background:#f3f4f6;padding:4px 8px;border:1px solid #d1d5db;text-align:right;">${fmt(tot.uScd)}</td>
          <td style="background:#f3f4f6;padding:4px 8px;border:1px solid #d1d5db;text-align:right;">${fmt(tot.ciai)}</td>
          <td style="background:#f3f4f6;padding:4px 8px;border:1px solid #d1d5db;text-align:right;">${fmtS(tot.eScd)}</td>
        </tr>
      </tfoot>
    </table>
  </div>`;
}

function filtrar() {
  const dep  = selectDep.value;
  const prov = selectProv.value;
  const dist = selectDist.value;

  if (!dep) { alert('Por favor, seleccione un Departamento.'); return; }
  registrarStat('consultas');

  const ultimaFechaStr = ultimaFecha.toISOString().split('T')[0];

  // Show loading
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('resultadosArea').classList.add('hidden');

  setTimeout(() => {
    const datosFiltrados = dataset.filter(d =>
      d.departamento === dep &&
      (!prov || d.provincia === prov) &&
      (!dist || d.distrito === dist)
    );

    if (!datosFiltrados.length) {
      document.getElementById('loadingState').classList.add('hidden');
      document.getElementById('resultados').innerHTML =
        '<p style="color:#64748b;text-align:center;padding:32px">No se encontraron datos para la selección.</p>';
      document.getElementById('resultadosArea').classList.remove('hidden');
      return;
    }

    const datosUltima = datosFiltrados.filter(d => d.fecha === ultimaFechaStr);

    const sumBy = (arr, key) => arr.reduce((sum, d) => sum + (d[key] || 0), 0);

    const distritosSAF = new Set(dataset
      .filter(d => d.fecha === ultimaFechaStr && d.departamento === dep && (!prov || d.provincia === prov))
      .filter(d => d.nfamilia_saf > 0).map(d => d.ubigeo));
    const distritosSCD = new Set(dataset
      .filter(d => d.fecha === ultimaFechaStr && d.departamento === dep && (!prov || d.provincia === prov))
      .filter(d => d.nniños_scd > 0).map(d => d.ubigeo));
    const provinciasSAF = new Set(dataset
      .filter(d => d.fecha === ultimaFechaStr && d.departamento === dep)
      .filter(d => d.nfamilia_saf > 0).map(d => d.provincia));
    const provinciasSCD = new Set(dataset
      .filter(d => d.fecha === ultimaFechaStr && d.departamento === dep)
      .filter(d => d.nniños_scd > 0).map(d => d.provincia));

    const resumen = {
      familias_2025:       sumBy(datosUltima, 'nfamilia_saf'),
        gestantes_SAF:       sumBy(datosUltima, 'ngestantes_saf'),
      niños_saf:           sumBy(datosUltima, 'nniños_saf'),
      niños_2025:          sumBy(datosUltima, 'nniños_scd'),
        ejec_saf:            sumBy(datosUltima, 'ejecucion_saf'),
      ejec_scd:            sumBy(datosUltima, 'ejecucion_scd'),
      CG_SAF:              sumBy(datosUltima, 'CG_SAF'),
      FACILITADOR_SAF:     sumBy(datosUltima, 'FACILITADOR_SAF'),
      CG_SCD:              sumBy(datosUltima, 'CG_SCD'),
      MadresCuidadoras_SCD:sumBy(datosUltima, 'MadresCuidadoras_SCD'),
      CIAI_SCD:            sumBy(datosUltima, 'CIAI_SCD'),
      SA_SCD:              sumBy(datosUltima, 'SA_SCD'),
      dist_saf:            distritosSAF.size,
      dist_scd:            distritosSCD.size,
      prov_saf:            provinciasSAF.size,
      prov_scd:            provinciasSCD.size,
      CUMPLE_SAF:          datosUltima[0]?.CUMPLE_SAF ?? null,
      CUMPLE_SCD:          datosUltima[0]?.CUMPLE_SCD ?? null,
      ubigeos:             [...new Set(datosUltima.map(x => x.ubigeo))],
      departamento: dep, provincia: prov, distrito: dist
    };

    // ── Centro Poblado (4º nivel): solo en el corte con datos CCPP ──
    resumen.ccpp = null;
    const _store = ccppDelCorte();
    if (dist && selectCP.value && _store) {
      const ub   = datosUltima[0]?.ubigeo || ubigeoDe(dep, prov, dist);
      const code = selectCP.value;
      const I    = CCPP_IDX;
      const saf  = (_store.saf[ub] || []).find(r => r[0] === code) || null;
      const scd  = (_store.scd[ub] || []).find(r => r[0] === code) || null;
      const nom  = saf ? saf[1] : (scd ? scd[1] : code);
      const utNombre = (typeof UT_MAP !== 'undefined' && UT_MAP[ub] && UT_MAP[ub] !== 'NO APLICA') ? UT_MAP[ub] : null;
      resumen.ccpp = {
        codigo: (ub || '') + code,
        nombre: nom,
        ut: utNombre,
        saf: saf ? {
          familias: saf[I.SAF.FAM], ninoV: saf[I.SAF.NINO_V], ninaM: saf[I.SAF.NINA_M],
          gestantes: saf[I.SAF.GEST], usuarios: saf[I.SAF.USU], cg: saf[I.SAF.G], fac: saf[I.SAF.H]
        } : null,
        scd: scd ? {
          usuarios: scd[I.SCD.USU], varones: scd[I.SCD.VAR], mujeres: scd[I.SCD.MUJ],
          locales: scd[I.SCD.C6],   // col6 = CIAI/locales (coincide exacto con bd.js)
          madres:  scd[I.SCD.C8]    // col8 = Madres Cuidadoras (coincide exacto con bd.js)
        } : null,
        dist_familias: resumen.familias_2025,
        dist_usuarios_scd: resumen.niños_2025
      };
    }

    // Títulos
    const nombreUbicacion = [dep];
    if (prov) nombreUbicacion.push(prov);
    if (dist) nombreUbicacion.push(dist);
    if (resumen.ccpp) nombreUbicacion.push('CCPP ' + resumen.ccpp.nombre);
    const nivelLabel = resumen.ccpp ? 'Centro Poblado' : dist ? 'Distrito' : prov ? 'Provincia' : 'Departamento';
    document.getElementById('resultadosKicker').textContent   = resumen.ccpp ? 'Centro poblado seleccionado' : 'Ubicación seleccionada';
    document.getElementById('resultadosAvatar').textContent   = '📍';
    document.getElementById('resultadosTitulo').textContent   = nombreUbicacion.join(' / ');
    document.getElementById('resultadosSubtitulo').textContent = nivelLabel + ' · ' + mesNombre + ' ' + año;

    const _niv = dist ? 'distrito' : prov ? 'provincia' : 'departamento';
    let htmlSalida = '';
    if (resumen.ccpp) {
      // Vista de Centro Poblado: solo la tarjeta del CCPP, sin datos distritales
      htmlSalida = renderCCPP(resumen.ccpp);
    } else {
      htmlSalida = renderKPIs(resumen, dep, prov, dist);
      // narrativa en pantalla (el mismo texto que va a Word)
      htmlSalida += `<div class="am-narrativa">` +
        `<div class="am-narrativa-lbl">Resumen narrativo</div>` +
        generarIntroNarrativa(_niv, dep, prov, dist, resumen) +
        `<div class="am-cols">` +
          `<div class="am-col am-col-saf">${generarNarrativaSAF(_niv, resumen)}</div>` +
          `<div class="am-col am-col-scd">${generarNarrativaSCD(_niv, resumen)}</div>` +
        `</div></div>`;
      // Tablas de cobertura según nivel consultado
      htmlSalida += generarTablaCobertura('departamento', dep, prov, dist);
      if (prov) htmlSalida += generarTablaCobertura('provincia',  dep, prov, dist);
      if (dist) htmlSalida += generarTablaCobertura('distrito',   dep, prov, dist);
    }
    document.getElementById('resultados').innerHTML = htmlSalida;
    window.ultimoResultado = resumen;

    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('resultadosArea').classList.remove('hidden');
    setExportButtons(true);
    resumirFiltros();
    if (window.matchMedia('(max-width:820px)').matches) toggleFiltros(false);
  }, 40);
}

// ──────────────────────────────────────────────────
//  Centro Poblado (4º nivel)
// ──────────────────────────────────────────────────
// Texto narrativo del centro poblado (mismo en pantalla y en Word)
function textoCCPP(c) {
  const fN  = n => (n || 0).toLocaleString('es-PE');
  const mes = (mesNombre || '').toLowerCase();
  const pl  = (n, sing, plu) => `${fN(n)} ${n === 1 ? sing : plu}`;
  const ut  = c.ut ? ` (${c.ut})` : '';
  const r = {};
  if (c.saf) {
    const ninos = (c.saf.ninoV || 0) + (c.saf.ninaM || 0);
    // Facilitadoras: presencia, no conteo exclusivo (una facilitadora puede cubrir varios CCPP)
    const facTxt = (c.saf.fac != null) ? `, con presencia de ${pl(c.saf.fac, 'facilitadora', 'facilitadoras')}` : '';
    r.saf = `En el Centro Poblado de ${c.nombre}${ut}, al cierre de ${mes} de ${año}, el Servicio de Acompañamiento a Familias (SAF) alcanza una cobertura de ${pl(c.saf.familias, 'familia', 'familias')} (${pl(c.saf.gestantes, 'gestante', 'gestantes')}, ${fN(ninos)} niñas y niños)${facTxt}.`;
  }
  if (c.scd) {
    const madresTxt = (c.scd.madres  != null) ? `, atendidos por ${pl(c.scd.madres, 'madre cuidadora', 'madres cuidadoras')}` : '';
    const localTxt  = (c.scd.locales != null) ? ` en ${pl(c.scd.locales, 'local', 'locales')}` : '';
    r.scd = `En el Centro Poblado de ${c.nombre}${ut}, al cierre de ${mes} de ${año}, el Servicio de Cuidado Diurno (SCD) alcanza una cobertura de ${pl(c.scd.usuarios, 'usuario', 'usuarios')} (${fN(c.scd.varones)} niños y ${fN(c.scd.mujeres)} niñas)${madresTxt}${localTxt}.`;
  }
  return r;
}

function renderCCPP(c) {
  const fN  = n => (n || 0).toLocaleString('es-PE');
  const txt = textoCCPP(c);

  const celda = (lbl, val) =>
    `<div style="flex:1;min-width:78px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:10px 8px;text-align:center;">
       <div style="font-size:1.35rem;font-weight:800;color:#0f172a;line-height:1.1;">${val}</div>
       <div style="font-size:.68rem;color:#64748b;text-transform:uppercase;letter-spacing:.03em;margin-top:3px;">${lbl}</div>
     </div>`;

  const sinDato = serv =>
    `<div class="service-card" style="border-top:4px solid #cbd5e1;display:flex;align-items:center;justify-content:center;min-height:120px;color:#94a3b8;font-size:.9rem;padding:20px;">
       Sin atención ${serv} en este centro poblado
     </div>`;

  // Tarjeta SAF (columna izquierda)
  const cardSAF = c.saf
    ? `<div class="service-card saf-card" style="padding:18px 20px;">
         <div style="font-weight:800;color:#b91c1c;font-size:.95rem;margin-bottom:10px;">👨‍👩‍👧 SAF · Acompañamiento a Familias</div>
         <p style="font-size:.86rem;color:#334155;line-height:1.55;margin:0 0 12px;">${txt.saf}</p>
         <div style="display:flex;flex-wrap:wrap;gap:8px;">
           ${celda('Familias', fN(c.saf.familias))}
           ${celda('Gestantes', fN(c.saf.gestantes))}
           ${celda('Niños', fN(c.saf.ninoV))}
           ${celda('Niñas', fN(c.saf.ninaM))}
           ${c.saf.fac != null ? celda('Facilitadoras', fN(c.saf.fac)) : ''}
         </div>
       </div>`
    : sinDato('SAF');

  // Tarjeta SCD (columna derecha)
  const cardSCD = c.scd
    ? `<div class="service-card scd-card" style="padding:18px 20px;">
         <div style="font-weight:800;color:#15803d;font-size:.95rem;margin-bottom:10px;">🧒 SCD · Cuidado Diurno</div>
         <p style="font-size:.86rem;color:#334155;line-height:1.55;margin:0 0 12px;">${txt.scd}</p>
         <div style="display:flex;flex-wrap:wrap;gap:8px;">
           ${celda('Usuarios', fN(c.scd.usuarios))}
           ${celda('Niños', fN(c.scd.varones))}
           ${celda('Niñas', fN(c.scd.mujeres))}
           ${c.scd.madres  != null ? celda('Madres', fN(c.scd.madres))   : ''}
           ${c.scd.locales != null ? celda('Locales', fN(c.scd.locales)) : ''}
         </div>
       </div>`
    : sinDato('SCD');

  // Encabezado a todo el ancho (ocupa las 2 columnas del grid)
  const header =
    `<div style="grid-column:1 / -1;display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:#fff;border:1px solid #dbe1ea;border-radius:14px;padding:14px 18px;box-shadow:0 1px 3px rgba(0,0,0,.05);">
       <span style="background:#1d4ed8;color:#fff;font-size:.62rem;font-weight:700;padding:3px 9px;border-radius:50px;letter-spacing:.06em;">CENTRO POBLADO</span>
       <span style="font-size:1.2rem;font-weight:800;color:#0f172a;">${c.nombre}</span>
       ${c.ut ? `<span style="background:#eef2ff;color:#4338ca;font-size:.66rem;font-weight:700;padding:3px 9px;border-radius:50px;">${c.ut}</span>` : ''}
       <span style="font-size:.72rem;color:#94a3b8;font-family:monospace;">cód. ${c.codigo}</span>
       <span style="margin-left:auto;font-size:.74rem;color:#64748b;">${mesNombre} ${año}</span>
     </div>`;

  return header + cardSAF + cardSCD;
}

// ──────────────────────────────────────────────────
//  Render KPI cards
// ──────────────────────────────────────────────────
function renderKPIs(d, dep, prov, dist) {
  // Determinar nivel de consulta
  const nivelDistrito  = !!dist;
  const nivelDepto     = !dist && !prov;

  const focSAF = nivelDistrito && d.CUMPLE_SAF != null ? getEtiquetaFocalizacion(d.CUMPLE_SAF) : null;
  const focSCD = nivelDistrito && d.CUMPLE_SCD != null ? getEtiquetaFocalizacion(d.CUMPLE_SCD) : null;

  function focBadge(foc) {
    if (!foc) return '';
    return `<span class="foc-badge" style="background:${foc.color};border-color:${foc.borde}">${foc.emoji} ${foc.texto}</span>`;
  }

  // Periodo y ámbito, visibles en la esquina de cada tarjeta (y en la imagen)
  const _periodo = `${mesNombre} ${año}`;
  const _ambito  = (d.esNacional || (!dep && !prov && !dist))
    ? 'NACIONAL' : String(dist || prov || dep).toUpperCase();
  const meta = (serv, badge) => `
      <div class="service-meta">
        ${badge}
        <span class="card-chip">${_periodo}</span>
        <span class="card-chip card-chip-amb">${_ambito}</span>
        <button class="card-dl" onclick="descargarTarjeta('${serv}')"
                title="Descargar esta tarjeta como imagen" aria-label="Descargar imagen">⤓</button>
      </div>`;

  // ── Actores comunales: misma fuente que la narrativa (padrón deduplicado) ──
  const _ac  = d.esNacional ? actoresNacional() : actoresDe(d.ubigeos);
  const _det = _ac.cubiertos > 0;
  const _sa  = d.esNacional ? saNacional() : saDe(d.ubigeos);
  const _n   = v => (v || 0).toLocaleString('es-PE');
  const _sep = t => `<tr class="row-sep"><td colspan="2">${t}</td></tr>`;
  const _fila = (ico, lbl, val) => val ? `<tr><td>${ico} ${lbl}</td><td>${_n(val)}</td></tr>` : '';
  const _total = v => `<tr class="row-total"><td>🤝 Total actores comunales</td><td>${_n(v)}</td></tr>`;

  // ── SAF ──────────────────────────────────────────────────────────
  const bS = _ac.saf, okS = _det && bS.total;
  const safRows = `
    <tr><td>🤰 Gestantes</td><td>${_n(d.gestantes_SAF)}</td></tr>
    <tr><td>🧒 Niños SAF</td><td>${_n(d.niños_saf)}</td></tr>
    ${!nivelDistrito ? `<tr><td>📌 Distritos con atención</td><td>${_n(d.dist_saf)}</td></tr>` : ''}
    ${nivelDepto     ? `<tr><td>🗺 Provincias con atención</td><td>${_n(d.prov_saf)}</td></tr>` : ''}
    ${(nivelDistrito || d.esNacional) ? (okS ? (
        _sep('Actores comunales') +
        _fila('🏛','Comités de Gestión',   bS.cg) +
        _fila('👥','Facilitadoras',        bS.facilitadoras) +
        _fila('🗂','Apoyo administrativo', bS.apoyo_admin) +
        _fila('🧑‍💼','Junta directiva',      bS.junta_directiva) +
        _fila('🔎','Consejo de vigilancia', bS.consejo_vigilancia) +
        _total(bS.total)
      ) : (
        _fila('🏛','Comités de Gestión', d.CG_SAF) +
        _fila('👥','Facilitadoras',      d.FACILITADOR_SAF)
      )) : ''}
  `;

  // ── SCD ──────────────────────────────────────────────────────────
  const bD = _ac.scd, okD = _det && bD.total;
  const scdRows = `
    <tr><td>🏘 CIAI</td><td>${_n(d.CIAI_SCD)}</td></tr>
    ${_sa.servicios  ? `<tr><td>🍲 Servicios alimentarios</td><td>${_n(_sa.servicios)}</td></tr>` : ''}
    ${!nivelDistrito ? `<tr><td>📌 Distritos con atención</td><td>${_n(d.dist_scd)}</td></tr>` : ''}
    ${nivelDepto     ? `<tr><td>🗺 Provincias con atención</td><td>${_n(d.prov_scd)}</td></tr>` : ''}
    ${nivelDistrito && _sa.servicios ? (
        _sep('Servicios alimentarios') +
        _sa.lista.map(s => `<tr><td>🍲 ${s.sa_nombre}</td><td class="sa-cg">${s.cg_nombre}</td></tr>`).join('')
      ) : ''}
    ${(nivelDistrito || d.esNacional) ? (okD ? (
        _sep('Actores comunales') +
        _fila('🏛','Comités de Gestión',       bD.cg) +
        _fila('👩','Madres Cuidadoras',        bD.madres_cuidadoras) +
        _fila('🧕','Madres Guía',              bD.madres_guia) +
        _fila('🧑‍🏫','Guías de Familia',         bD.guias_familia) +
        _fila('🍲','Socias de Cocina',         bD.socias_cocina) +
        _fila('🧹','Apoyo limpieza y vigilancia', bD.apoyo_limpieza) +
        _fila('🚚','Repartidores de alimentos', bD.repartidores) +
        _fila('🗂','Apoyo administrativo',     bD.apoyo_admin) +
        _fila('🧑‍💼','Junta directiva',          bD.junta_directiva) +
        _fila('🔎','Consejo de vigilancia',    bD.consejo_vigilancia) +
        _total(bD.total)
      ) : (
        _fila('🏛','Comités de Gestión', d.CG_SCD) +
        _fila('👩','Madres Cuidadoras',  d.MadresCuidadoras_SCD)
      )) : ''}
  `;

  return `
  <div class="service-card saf-card" data-serv="saf">
    <div class="service-header">
      <div class="service-title">
        <span class="service-dot saf-dot"></span>
        <h3>Servicio de Acompañamiento a Familias</h3>
        <span class="service-abbr">SAF</span>
      </div>
      ${meta('saf', focBadge(focSAF))}
    </div>
    <div class="kpi-grid kpi-grid-2">
      <div class="kpi-block primary-kpi">
        <div class="kpi-emoji">👨‍👩‍👧‍👦</div>
        <div class="kpi-value">${d.familias_2025.toLocaleString('es-PE')}</div>
        <div class="kpi-label">Familias</div>
      </div>
      <div class="kpi-block">
        <div class="kpi-emoji">💰</div>
        <div class="kpi-value" style="font-size:1.0rem">S/. ${d.ejec_saf.toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        <div class="kpi-label">Ejecución acumulada</div>
      </div>
    </div>
    <div class="detail-section">
      <table class="detail-table">${safRows}</table>
    </div>
  </div>

  <div class="service-card scd-card" data-serv="scd">
    <div class="service-header">
      <div class="service-title">
        <span class="service-dot scd-dot"></span>
        <h3>Servicio de Cuidado Diurno</h3>
        <span class="service-abbr">SCD</span>
      </div>
      ${meta('scd', focBadge(focSCD))}
    </div>
    <div class="kpi-grid kpi-grid-2">
      <div class="kpi-block primary-kpi">
        <div class="kpi-emoji">🧒</div>
        <div class="kpi-value">${d.niños_2025.toLocaleString('es-PE')}</div>
        <div class="kpi-label">Niños SCD</div>
      </div>
      <div class="kpi-block">
        <div class="kpi-emoji">💰</div>
        <div class="kpi-value" style="font-size:1.0rem">S/. ${d.ejec_scd.toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
        <div class="kpi-label">Ejecución acumulada</div>
      </div>
    </div>
    <div class="detail-section">
      <table class="detail-table">${scdRows}</table>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════
//  FUNCIONES DE EXPORTACIÓN (conservadas)
// ══════════════════════════════════════════════════
function compartirWhatsApp() {
  if (!window.ultimoResultado) return alert('Primero realice una consulta.');
  const d = window.ultimoResultado;

  const dep  = d.departamento;
  const prov = d.provincia;
  const dist = d.distrito;
  const nivelDistrito = !!dist;
  // Actores comunales: detalle real por rol cuando hay dato del distrito
  const _ac = actoresDe(d.ubigeos);
  const _wa = (b, roles) => {
    let t = `🏛 Comités de Gestión: ${b.cg.toLocaleString('es-PE')}  \n`;
    roles.forEach(([k, e, n]) => { if (b[k]) t += `${e} ${n}: ${b[k].toLocaleString('es-PE')}  \n`; });
    return t + `🤝 Total actores comunales: ${b.total.toLocaleString('es-PE')}  \n`;
  };
  const safCGLines = !nivelDistrito ? ''
    : (_ac.cubiertos && _ac.saf.total)
      ? _wa(_ac.saf, [['facilitadoras','👥','Facilitadoras'],
                      ['apoyo_admin','🗂','Apoyo administrativo'],
                      ['junta_directiva','🧑‍💼','Junta directiva'],
                      ['consejo_vigilancia','🔎','Consejo de vigilancia']])
      : `🏛 Comités de Gestión: ${(d.CG_SAF || 0).toLocaleString('es-PE')}  \n👥 Facilitadoras: ${(d.FACILITADOR_SAF || 0).toLocaleString('es-PE')}  \n`;
  const scdCGLines = !nivelDistrito ? ''
    : (_ac.cubiertos && _ac.scd.total)
      ? _wa(_ac.scd, [['madres_cuidadoras','👩','Madres Cuidadoras'],
                      ['madres_guia','🧕','Madres Guía'],
                      ['guias_familia','🧑‍🏫','Guías de Familia'],
                      ['socias_cocina','🍲','Socias de Cocina'],
                      ['apoyo_limpieza','🧹','Apoyo limpieza y vigilancia'],
                      ['repartidores','🚚','Repartidores de alimentos'],
                      ['apoyo_admin','🗂','Apoyo administrativo'],
                      ['junta_directiva','🧑‍💼','Junta directiva'],
                      ['consejo_vigilancia','🔎','Consejo de vigilancia']])
      : `🏛 Comités de Gestión: ${(d.CG_SCD || 0).toLocaleString('es-PE')}  \n👩 Madres Cuidadoras: ${(d.MadresCuidadoras_SCD || 0).toLocaleString('es-PE')}  \n`;

  const nombreUbicacion = dep ? [dep] : ['NACIONAL'];
  if (prov) nombreUbicacion.push(prov);
  if (dist) nombreUbicacion.push(dist);
  const encabezadoUbicacion = `(${nombreUbicacion.join(' / ')})`;
  const fW = n => (n || 0).toLocaleString('es-PE');
  // «Distritos/Provincias con atención» describen el ámbito de arriba: en un
  // distrito no aplican, y en una provincia solo aplican los distritos.
  const lineaTerr = (dists, provs) =>
    (dist ? '' : `📌 Distritos con atención: ${fW(dists)}\n`) +
    (dist || prov ? '' : `📌 Provincias con atención: ${fW(provs)}  \n`);
  const foc = v => (dist && v != null) ? `${getEtiquetaFocalizacion(v).emoji} ${getEtiquetaFocalizacion(v).texto}` : '';
  const _saW = d.esNacional ? saNacional() : saDe(d.ubigeos);

  const fecha = new Date().toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Bloque de Centro Poblado (si hay uno seleccionado)
  const _fW = n => (n || 0).toLocaleString('es-PE');
  let ccppBlock = '';
  if (d.ccpp) {
    const c = d.ccpp;
    ccppBlock = `\n*📍 CENTRO POBLADO: ${c.nombre}${c.ut ? ' — ' + c.ut : ''}*  \n`;
    ccppBlock += c.saf
      ? `🔴 *SAF:* ${_fW(c.saf.familias)} familias (🤰 ${_fW(c.saf.gestantes)} gestantes, 🧒 ${_fW((c.saf.ninoV||0)+(c.saf.ninaM||0))} niñas y niños)${c.saf.fac != null ? ' · 👥 presencia de ' + _fW(c.saf.fac) + (c.saf.fac === 1 ? ' facilitadora' : ' facilitadoras') : ''}  \n`
      : `🔴 *SAF:* sin atención  \n`;
    ccppBlock += c.scd
      ? `🟢 *SCD:* ${_fW(c.scd.usuarios)} usuarios (${_fW(c.scd.varones)} niños, ${_fW(c.scd.mujeres)} niñas)${c.scd.madres != null ? ' · 👩 ' + _fW(c.scd.madres) + (c.scd.madres === 1 ? ' madre' : ' madres') : ''}${c.scd.locales != null ? ' · 🏘 ' + _fW(c.scd.locales) + (c.scd.locales === 1 ? ' local' : ' locales') : ''}  \n`
      : `🟢 *SCD:* sin atención  \n`;
  }

  const mensaje = `*REPORTE COBERTURA PNCM*
${encabezadoUbicacion}  
📅 *Reporte:* ${mesNombre} ${año}  

*🔴 Servicio de Acompañamiento a Familias (SAF) -* ${foc(d.CUMPLE_SAF)}  
👨‍👩‍👧‍👦 Familias: ${fW(d.familias_2025)}
🤰 Gestantes: ${fW(d.gestantes_SAF)}
🧒 Niños: ${fW(d.niños_saf)}
${safCGLines}${lineaTerr(d.dist_saf, d.prov_saf)}💰 Ejecución acumulada: S/. ${d.ejec_saf.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}  


*🟢 Servicio de Cuidado Diurno (SCD) -* ${foc(d.CUMPLE_SCD)}  
🧒 Niños: ${fW(d.niños_2025)}
🏘 CIAI: ${fW(d.CIAI_SCD)}
${_saW.servicios ? '🍲 Servicios alimentarios: ' + fW(_saW.servicios) + '\n' : ''}${scdCGLines}${lineaTerr(d.dist_scd, d.prov_scd)}💰 Ejecución acumulada: S/. ${d.ejec_scd.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

${ccppBlock}
🕐 Generado: ${fecha}
`;

  const enlace = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje + (window.AMPremium?.publicLink() ? '\nAbrir esta consulta: ' + window.AMPremium.publicLink() : ''))}`;
  window.open(enlace, '_blank');
  registrarStat('wa');
}

function calcularResumen(dep, prov = null, dist = null) {
  const ultimaFechaStr = ultimaFecha.toISOString().split('T')[0];

  const datosUltima = dataset.filter(d =>
    d.departamento === dep &&
    (!prov || d.provincia === prov) &&
    (!dist || d.distrito === dist) &&
    d.fecha === ultimaFechaStr
  );


  const sumBy = (arr, key) => arr.reduce((sum, d) => sum + (d[key] || 0), 0);

  const distritosSAF = new Set(dataset
    .filter(d => d.fecha === ultimaFechaStr && d.departamento === dep && (!prov || d.provincia === prov))
    .filter(d => d.nfamilia_saf > 0)
    .map(d => d.ubigeo));

  const distritosSCD = new Set(dataset
    .filter(d => d.fecha === ultimaFechaStr && d.departamento === dep && (!prov || d.provincia === prov))
    .filter(d => d.nniños_scd > 0)
    .map(d => d.ubigeo));

  const provinciasSAF = new Set(dataset
    .filter(d => d.fecha === ultimaFechaStr && d.departamento === dep)
    .filter(d => d.nfamilia_saf > 0)
    .map(d => d.provincia));

  const provinciasSCD = new Set(dataset
    .filter(d => d.fecha === ultimaFechaStr && d.departamento === dep)
    .filter(d => d.nniños_scd > 0)
    .map(d => d.provincia));

  return {
    familias_2025: sumBy(datosUltima, 'nfamilia_saf'),
    gestantes_SAF: sumBy(datosUltima, 'ngestantes_saf'),
    niños_saf: sumBy(datosUltima, 'nniños_saf'),
    niños_2025: sumBy(datosUltima, 'nniños_scd'),
    ejec_saf: sumBy(datosUltima, 'ejecucion_saf'),
    ejec_scd: sumBy(datosUltima, 'ejecucion_scd'),
    CG_SAF: sumBy(datosUltima, 'CG_SAF'),
    FACILITADOR_SAF: sumBy(datosUltima, 'FACILITADOR_SAF'),
    CG_SCD: sumBy(datosUltima, 'CG_SCD'),
    MadresCuidadoras_SCD: sumBy(datosUltima, 'MadresCuidadoras_SCD'),
    CIAI_SCD: sumBy(datosUltima, 'CIAI_SCD'),
    dist_saf: distritosSAF.size,
    dist_scd: distritosSCD.size,
    prov_saf: provinciasSAF.size,
    prov_scd: provinciasSCD.size,
    CUMPLE_SAF: dist ? datosUltima[0]?.CUMPLE_SAF ?? null : null,
    CUMPLE_SCD: dist ? datosUltima[0]?.CUMPLE_SCD ?? null : null,
    ubigeos: [...new Set(datosUltima.map(d => d.ubigeo))]
  };
}

// ── Resumen a nivel nacional (todos los departamentos) ─────────────────────
function calcularResumenNacional() {
  const ultimaFechaStr = ultimaFecha.toISOString().split('T')[0];
  const datos = dataset.filter(d => d.fecha === ultimaFechaStr);
  const sumBy = (key) => datos.reduce((s, d) => s + (d[key] || 0), 0);
  const depsSAF = new Set(datos.filter(d => d.nfamilia_saf > 0).map(d => d.departamento));
  const depsSCD = new Set(datos.filter(d => d.nniños_scd   > 0).map(d => d.departamento));
  const distSAF = new Set(datos.filter(d => d.nfamilia_saf > 0).map(d => d.ubigeo));
  const distSCD = new Set(datos.filter(d => d.nniños_scd   > 0).map(d => d.ubigeo));
  const provSAFnac = new Set(datos.filter(d => d.nfamilia_saf > 0).map(d => d.departamento+'|'+d.provincia));
  const provSCDnac = new Set(datos.filter(d => d.nniños_scd   > 0).map(d => d.departamento+'|'+d.provincia));
  // Unión de distritos con cobertura (SAF o SCD)
  const distUnion = new Set([...distSAF, ...distSCD]);
  const TOTAL_DISTRITOS_PERU = window.PNCM_PARAMETROS.total_distritos_peru;   // INEI, en parametros.js
  const _nac = actoresNacional();
  // Sin padrón de actores para este corte: los totales oficiales del reporte,
  // que no cuentan doble a quien atiende dos distritos. Si tampoco hay, cero.
  const _of  = _nac.cubiertos ? null : totalesOficiales(ultimaFechaStr);
  return {
    familias_2025: sumBy('nfamilia_saf'),
    gestantes_SAF: sumBy('ngestantes_saf'),
    niños_saf:     sumBy('nniños_saf'),
    niños_2025:    sumBy('nniños_scd'),
    ejec_saf:      sumBy('ejecucion_saf'),
    ejec_scd:      sumBy('ejecucion_scd'),
    CIAI_SCD:      sumBy('CIAI_SCD'),
    dep_saf:  depsSAF.size,
    dep_scd:  depsSCD.size,
    dist_saf: distSAF.size,
    dist_scd: distSCD.size,
    dist_union: distUnion.size,
    total_distritos: TOTAL_DISTRITOS_PERU,
    pct_cobertura: ((distUnion.size / TOTAL_DISTRITOS_PERU) * 100).toFixed(1),
    pct_saf: ((distSAF.size / TOTAL_DISTRITOS_PERU) * 100).toFixed(1),
    pct_scd: ((distSCD.size / TOTAL_DISTRITOS_PERU) * 100).toFixed(1),
    prov_saf: provSAFnac.size, prov_scd: provSCDnac.size,
    // actores reales del padrón (antes eran ceros fijos)
    CG_SAF:               _of ? (_of.saf.cg || 0)            : _nac.saf.cg,
    FACILITADOR_SAF:      _of ? (_of.saf.facilitadoras || 0) : _nac.saf.facilitadoras,
    CG_SCD:               _of ? (_of.scd.cg || 0)            : _nac.scd.cg,
    MadresCuidadoras_SCD: _of ? (_of.scd.madres || 0)        : _nac.scd.madres_cuidadoras,
    ubigeos: [...new Set(datos.map(d => d.ubigeo))],
    esNacional: true
  };
}

// ── Genera la tabla de cobertura nacional (por departamento) ───────────────
// ── Prólogo institucional ─────────────────────────────────────────────────
function generarPrologo() {
  return `
    <div style="margin:10px 0 14px 0;padding:10px 14px 8px 14px;border-left:4px solid #9ca3af;background:#f9fafb;font-family:'Segoe UI',sans-serif;">
      <p style="font-size:8.5pt;font-style:italic;color:#374151;margin:0 0 8px 0;line-height:1.65;text-align:justify;">
        El <strong style="font-style:normal;">Programa Nacional Cuna Más (PNCM)</strong> es un programa social focalizado adscrito al
        <strong style="font-style:normal;">Ministerio de Desarrollo e Inclusión Social (MIDIS)</strong>, cuyo objetivo es mejorar el
        desarrollo infantil de niñas, niños y madres gestantes. El PNCM opera a través de dos servicios complementarios:
      </p>
      <div style="margin:6px 0 8px 12px;">
        <p style="font-size:8.5pt;font-style:italic;color:#374151;margin:0 0 6px 0;line-height:1.65;text-align:justify;">
          <span style="font-weight:700;font-style:normal;color:#4b5563;">● Servicio de Cuidado Diurno (SCD)</span> —
          brinda cuidado y atención integral a niñas y niños de <em>6 a 36 meses</em> que requieren cuidado extrafamiliar,
          implementado a través de los <strong style="font-style:normal;">Centros Infantiles de Atención Integral (CIAI)</strong>
          y Servicios Alimentarios (SA).
        </p>
        <p style="font-size:8.5pt;font-style:italic;color:#374151;margin:0;line-height:1.65;text-align:justify;">
          <span style="font-weight:700;font-style:normal;color:#4b5563;">● Servicio de Acompañamiento a Familias (SAF)</span> —
          brinda acompañamiento a familias con niñas, niños y gestantes para fortalecer las capacidades de los cuidadores
          principales y favorecer el desarrollo integral de la primera infancia.
        </p>
      </div>
      <p style="font-size:8.5pt;font-style:italic;color:#374151;margin:0 0 6px 0;line-height:1.65;text-align:justify;">
        Ambos servicios se implementan bajo el modelo de <strong style="font-style:normal;">cogestión comunitaria</strong><sup>1</sup>,
        una estrategia de corresponsabilidad entre el Estado y la comunidad organizada. El PNCM brinda capacitación,
        asistencia técnica y recursos financieros; la comunidad, a través de sus <strong style="font-style:normal;">Comités de Gestión</strong>,
        participa activamente en la administración y operación de los servicios.
      </p>
      <p style="font-size:7.5pt;color:#9ca3af;margin:6px 0 0 0;line-height:1.4;border-top:1px solid #e5e7eb;padding-top:5px;font-style:normal;">
        <sup>1</sup> Directiva "Modelo de Cogestión Comunal para la Implementación y Funcionamiento de los Servicios del
        Programa Nacional Cuna Más", versión 9 — RDE N° 2100-2025-MIDIS/PNCM.
      </p>
    </div>`;
}

function generarResumenNacional(resNac) {
  const mesMin = (mesNombre||'').toLowerCase();
  const tot  = resNac.ejec_saf + resNac.ejec_scd;
  const pSAF = tot > 0 ? ((resNac.ejec_saf/tot)*100).toFixed(1) : '0.0';
  const pSCD = tot > 0 ? ((resNac.ejec_scd/tot)*100).toFixed(1) : '0.0';
  const fN   = n => (n||0).toLocaleString('es-PE');
  const fS   = n => 'S/. '+(n||0).toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2});
  // 24 departamentos + Provincia Constitucional del Callao = 25 jurisdicciones.
  // Se cuenta del padrón; la frase larga solo cuando están las 25.
  const depTxt = k => k === 25 ? '24 departamentos y la Provincia Constitucional del Callao'
                               : fN(k) + (k === 1 ? ' departamento' : ' departamentos');
  const depSub = k => k === 25 ? '24 dep. + Callao' : 'con cobertura';

  // ── Estilos tarjeta KPI mejorada ─────────────────────────────────────────
  const C = {
    wrap:  'padding:3px;vertical-align:top;',
    card:  'border:none;border-radius:0;padding:5px 8px 4px;text-align:center;background:#fff;',
    lbl:   'font-size:7pt;color:#6b7280;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;line-height:1.3;',
    val:   'font-size:11pt;font-weight:700;color:#111827;line-height:1;margin-bottom:2px;',
    sub:   'font-size:6.5pt;color:#9ca3af;line-height:1.3;',
    exec:  'font-size:9pt;font-weight:700;color:#374151;line-height:1.2;',
    sec:   'border-left:3px solid #6b7280;background:#f9fafb;padding:5px 10px;font-size:9pt;font-weight:700;color:#374151;margin:12px 0 6px 0;'
  };
  const card = (label, value, sub='', isExec=false) => `
    <td style="${C.wrap}">
      <div style="${C.card}">
        <div style="${C.lbl}">${label}</div>
        <div style="${isExec ? C.exec : C.val}">${value}</div>
        ${sub ? `<div style="${C.sub}">${sub}</div>` : ''}
      </div>
    </td>`;

  const fmtEjec = n => 'S/. ' + Math.round(n||0).toLocaleString('es-PE');
  const bloqueTerritorioNacional = `
    <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;margin:10px 0 14px 0;border:none;">
      <tr>
        <td style="width:38%;padding:0 12px 0 0;vertical-align:top;border:none;">
          <div style="border-top:3px solid #374151;padding:12px 14px;background:#f9fafb;text-align:center;">
            <div style="font-size:6.5pt;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;">Cobertura territorial PNCM</div>
            <div style="font-size:28pt;font-weight:800;color:#111827;line-height:1;">${resNac.pct_cobertura}%</div>
            <div style="font-size:7.5pt;color:#6b7280;margin-top:3px;line-height:1.2;">distritos a nivel nacional<br><strong style="font-size:8.5pt;color:#374151;">${fN(resNac.dist_union)} de ${fN(resNac.total_distritos)} distritos</strong></div>
          </div>
        </td>
        <td style="width:31%;padding:0 12px 0 0;vertical-align:top;border:none;">
          <div style="border-top:3px solid #6b7280;padding:12px;background:#f9fafb;text-align:center;">
            <div style="font-size:6.5pt;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;">SAF — Presencia</div>
            <div style="font-size:20pt;font-weight:800;color:#374151;line-height:1;">${resNac.pct_saf}%</div>
            <div style="font-size:7.5pt;color:#6b7280;margin-top:3px;"><strong style="color:#111827;">${fN(resNac.dist_saf)}</strong> distritos con SAF</div>
          </div>
        </td>
        <td style="width:31%;padding:0;vertical-align:top;border:none;">
          <div style="border-top:3px solid #9ca3af;padding:12px;background:#f9fafb;text-align:center;">
            <div style="font-size:6.5pt;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px;">SCD — Presencia</div>
            <div style="font-size:20pt;font-weight:800;color:#374151;line-height:1;">${resNac.pct_scd}%</div>
            <div style="font-size:7.5pt;color:#6b7280;margin-top:3px;"><strong style="color:#111827;">${fN(resNac.dist_scd)}</strong> distritos con SCD</div>
          </div>
        </td>
      </tr>
    </table>`;

  return `
    <h2>COBERTURA NACIONAL — PNCM | ${mesNombre} ${año}</h2>
    <p style="margin-bottom:14px;line-height:1.7;">De enero a ${mesMin} de ${año}, el <strong>Programa Nacional Cuna Más (PNCM)</strong> ejecutó a nivel nacional un monto total de <strong>S/ ${fN(Math.round(tot))}</strong>, de los cuales <strong>S/ ${fN(Math.round(resNac.ejec_saf))} (${pSAF}%)</strong> corresponden al <strong>Servicio de Acompañamiento a Familias (SAF)</strong> y <strong>S/ ${fN(Math.round(resNac.ejec_scd))} (${pSCD}%)</strong> al <strong>Servicio de Cuidado Diurno (SCD)</strong>.</p>
    <p style="margin-bottom:14px;line-height:1.7;">Al mes de <strong>${mesMin} de ${año}</strong>, el <strong>Servicio de Acompañamiento a Familias (SAF)</strong> alcanza una cobertura de <strong>${fN(resNac.familias_2025)} familias</strong>, conformadas por <strong>${fN(resNac.niños_saf)} niñas y niños</strong> y <strong>${fN(resNac.gestantes_SAF)} gestantes</strong>, con presencia en <strong>${fN(resNac.dist_saf)} distritos</strong> de los <strong>${depTxt(resNac.dep_saf)}</strong>.</p>
    <p style="margin-bottom:14px;line-height:1.7;">Al mes de <strong>${mesMin} de ${año}</strong>, el <strong>Servicio de Cuidado Diurno (SCD)</strong> brinda atención a <strong>${fN(resNac.niños_2025)} niñas y niños</strong> en <strong>${fN(resNac.CIAI_SCD)} Centros Infantiles de Atención Integral (CIAI)</strong>, distribuidos en <strong>${fN(resNac.dist_scd)} distritos</strong> de los <strong>${depTxt(resNac.dep_scd)}</strong>.</p>

    ${bloqueTerritorioNacional}
    <p style="${C.sec}">Servicio de Acompañamiento a Familias (SAF)</p>
    <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;border:none;margin-bottom:10px;table-layout:fixed;">
      <tr>
        ${card('Familias',         fN(resNac.familias_2025), 'beneficiarias del programa')}
        ${card('Niñas y niños',    fN(resNac.niños_saf),     'en el SAF')}
        ${card('Gestantes',        fN(resNac.gestantes_SAF), 'atendidas')}
        ${card('Departamentos',    fN(resNac.dep_saf),       depSub(resNac.dep_saf))}
        ${card('Provincias',       fN(resNac.prov_saf),      'con cobertura SAF')}
        ${card('Distritos',        fN(resNac.dist_saf),      'con cobertura SAF')}
        ${card('Ejecución acumulada', fmtEjec(resNac.ejec_saf), 'enero–'+mesMin+' '+año, true)}
      </tr>
    </table>

    <p style="${C.sec}">Servicio de Cuidado Diurno (SCD)</p>
    <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;border:none;margin-bottom:8px;table-layout:fixed;">
      <tr>
        ${card('Niñas y niños',    fN(resNac.niños_2025),    'usuarios del SCD')}
        ${card('CIAI',             fN(resNac.CIAI_SCD),      'centros de atención')}
        ${card('Departamentos',    fN(resNac.dep_scd),       depSub(resNac.dep_scd))}
        ${card('Provincias',       fN(resNac.prov_scd),      'con cobertura SCD')}
        ${card('Distritos',        fN(resNac.dist_scd),      'con cobertura SCD')}
        ${card('Ejecución acumulada', fmtEjec(resNac.ejec_scd), 'enero–'+mesMin+' '+año, true)}
      </tr>
    </table>
  `;
}

// Estilos reutilizables celdas KPI Word
// ── Paleta monocromática (grises) + amarillo para resaltado ───────────────

// ──────────────────────────────────────────────────
//  Tabla de Cobertura a nivel (Depto / Provincia / Distrito)
//  Muestra el desglose por cada entidad "hija" con la
//  fila correspondiente al seleccionado resaltada.
// ──────────────────────────────────────────────────
// ──────────────────────────────────────────────────
//  Datos de cobertura (estructura cruda para Excel/Word)
// ──────────────────────────────────────────────────
function obtenerDatosCobertura(nivel, dep, prov) {
  const ultimaFechaStr = ultimaFecha.toISOString().split('T')[0];
  const base = dataset.filter(d => d.fecha === ultimaFechaStr);
  let claveCol, tituloCol, datosAmbito;
  if (nivel === 'departamento') {
    claveCol    = 'departamento';
    tituloCol   = 'DEPARTAMENTO';
    datosAmbito = base;
  } else if (nivel === 'provincia') {
    claveCol    = 'provincia';
    tituloCol   = 'PROVINCIAS DE ' + (dep || '').toUpperCase();
    datosAmbito = base.filter(d => d.departamento === dep);
  } else {
    claveCol    = 'distrito';
    tituloCol   = 'DISTRITOS DE ' + (prov || '').toUpperCase();
    datosAmbito = base.filter(d => d.departamento === dep && d.provincia === prov);
  }
  const mapa = {};
  datosAmbito.forEach(r => {
    const k = r[claveCol];
    if (!mapa[k]) mapa[k] = {familias:0,ninos_saf:0,gestantes:0,ejec_saf:0,usuarios:0,ciai:0,ejec_scd:0};
    mapa[k].familias  += r.nfamilia_saf   || 0;
    mapa[k].ninos_saf += r.nniños_saf     || 0;
    mapa[k].gestantes += r.ngestantes_saf || 0;
    mapa[k].ejec_saf  += r.ejecucion_saf  || 0;
    mapa[k].usuarios  += r.nniños_scd     || 0;
    mapa[k].ciai      += r.CIAI_SCD       || 0;
    mapa[k].ejec_scd  += r.ejecucion_scd  || 0;
  });
  const filas = Object.keys(mapa)
    .sort((a,b)=>a.localeCompare(b,'es'))
    .map(n => {
      const m = mapa[n];
      return { nombre:n, ...m };
    });
  const tot = filas.reduce((a,f)=>({
    familias:a.familias+f.familias, ninos_saf:a.ninos_saf+f.ninos_saf, gestantes:a.gestantes+f.gestantes,
    ejec_saf:a.ejec_saf+f.ejec_saf, usuarios:a.usuarios+f.usuarios, ciai:a.ciai+f.ciai,
    ejec_scd:a.ejec_scd+f.ejec_scd
  }),{familias:0,ninos_saf:0,gestantes:0,ejec_saf:0,usuarios:0,ciai:0,ejec_scd:0});
  return { tituloCol, filas, tot };
}

// ══════════════════════════════════════════════════════════════════════════
//  EXPORTAR PPT — el deck institucional de 5 láminas, con los datos del corte.
//  No se reconstruye la presentación: se parchea modelo_ppt.pptx, que es un
//  ZIP, igual que hace FRONTERAS con su libro modelo. Así se conservan tal
//  cual las imágenes, las tipografías, los degradados y las notas; solo se
//  reemplaza el contenido de los <a:t> que son cifras.
//
//  El deck es NACIONAL: las láminas 3 y 4 traen población objetivo, metas POI
//  y PIM, que solo existen a nivel país. Por eso el PPT sale siempre con el
//  panorama nacional, sin importar el filtro que esté puesto en pantalla.
//
//  El modelo pesa 2,5 MB y solo hace falta al exportar, así que se descarga
//  recién en ese momento.
// ══════════════════════════════════════════════════════════════════════════

// Metas POI, población objetivo y PIM: DATOS_PNCM/parametros/parametros.js.
// Se toman del AÑO DEL CORTE. Si ese año no tiene el dato, va null y la lámina
// muestra «—»: nunca se usa la cifra de otro año.
function parametroAnual(serv, campo) {
  const A = (window.PNCM_PARAMETROS.anual || {})[año];
  const v = A && A[serv] ? A[serv][campo] : null;
  return (v === undefined) ? null : v;
}
// Totales del reporte oficial de un corte (comités, facilitadoras, madres), o null.
function totalesOficiales(fechaISO) {
  const T = window.PNCM_PARAMETROS.totales_oficiales || {};
  return T[fechaISO] || null;
}

function _libsPPT() { return asegurarLibs(['pptmodelo']); }

/* ---------- edición de los textos de una lámina ---------- */

// Reemplaza el contenido exacto de un run <a:t>, conservando los espacios de
// alrededor: en la tabla de la lámina 3 sirven para alinear las columnas.
function _pptTexto(xml, viejo, nuevo) {
  const izq = (viejo.match(/^\s*/) || [''])[0];
  const der = (viejo.match(/\s*$/) || [''])[0];
  const de  = '<a:t>' + _pptEsc(viejo) + '</a:t>';
  const a   = '<a:t>' + izq + _pptEsc(String(nuevo)) + der + '</a:t>';
  if (xml.indexOf(de) < 0) throw new Error('el modelo no trae el texto «' + viejo.trim() + '»');
  return xml.split(de).join(a);
}
function _pptEsc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Parte un run en varios para poder resaltar solo un trozo. Copia el formato
// del original en cada pedazo y, en el resaltado, le suma el fondo amarillo
// respetando el orden que exige DrawingML (highlight va antes de latin).
function _pptPartir(xml, viejo, partes) {
  const marca = '<a:t>' + _pptEsc(viejo) + '</a:t>';
  const i = xml.indexOf(marca);
  if (i < 0) throw new Error('el modelo no trae el texto \u00ab' + viejo.trim() + '\u00bb');
  const ini = xml.lastIndexOf('<a:r>', i);
  const fin = xml.indexOf('</a:r>', i) + 6;

  let rPr = '';
  const pi = xml.indexOf('<a:rPr', ini);
  if (pi > ini && pi < i) {
    const cierre = xml.indexOf('>', pi);
    rPr = (xml[cierre - 1] === '/') ? xml.slice(pi, cierre + 1)
                                    : xml.slice(pi, xml.indexOf('</a:rPr>', pi) + 8);
  }
  const HL = '<a:highlight><a:srgbClr val="FFFF00"/></a:highlight>';
  const conHL = pr => {
    if (!pr) return '<a:rPr>' + HL + '</a:rPr>';
    if (pr.slice(-2) === '/>') return pr.slice(0, -2) + '>' + HL + '</a:rPr>';
    if (pr.indexOf('<a:latin') >= 0) return pr.replace('<a:latin', HL + '<a:latin');
    return pr.replace('</a:rPr>', HL + '</a:rPr>');
  };

  const runs = partes.map(p =>
    '<a:r>' + (p.hl ? conHL(rPr) : rPr) + '<a:t>' + _pptEsc(p.t) + '</a:t></a:r>').join('');
  return xml.slice(0, ini) + runs + xml.slice(fin);
}

/* ---------- lámina del ámbito consultado ---------- */

// Reemplazo por lotes a prueba de colisiones. Si se hiciera uno por uno, un
// valor nuevo podría coincidir con un texto del modelo aún sin reemplazar
// —muy probable con cifras chicas de un distrito— y se pisaría a sí mismo.
// Por eso va en dos pasadas, con marcas intermedias que no existen en el XML.
function _pptLote(xml, pares) {
  const marca = i => '' + i + '';
  pares.forEach((p, i) => {
    const de = '<a:t>' + _pptEsc(p[0]) + '</a:t>';
    if (xml.indexOf(de) < 0) throw new Error('el modelo no trae el texto «' + p[0].trim() + '»');
    const izq = (p[0].match(/^\s*/) || [''])[0];
    const der = (p[0].match(/\s*$/) || [''])[0];
    xml = xml.split(de).join('<a:t>' + izq + marca(i) + der + '</a:t>');
  });
  pares.forEach((p, i) => { xml = xml.split(marca(i)).join(_pptEsc(String(p[1]))); });
  return xml;
}

// Nombre corto del ámbito: el nivel más específico que se haya consultado.
function _pptAmbitoNombre(d) {
  if (d._esEspecial) return String(d._ambitoLabel || d._ambito || 'ÁMBITO').toUpperCase();
  if (d.ccpp && d.ccpp.nombre) return String(d.ccpp.nombre).toUpperCase();
  return String(d.distrito || d.provincia || d.departamento || '').toUpperCase();
}

// Los cambios de la lámina del ámbito, o null si la vista es la nacional
// (en ese caso la lámina 5 ya dice lo mismo y sobra repetirla).
function _pptCambiosAmbito() {
  const d = window.ultimoResultado;
  if (!d || d.esNacional) return null;
  if (!d._esEspecial && !d.departamento) return null;

  const fN = v => Math.round(v || 0).toLocaleString('es-PE');
  const nombre = _pptAmbitoNombre(d);
  if (!nombre) return null;

  // Los actores salen del padrón cuando su corte coincide; si no, de bd.
  const ac = (typeof actoresDe === 'function') ? actoresDe(d.ubigeos) : { cubiertos: 0 };
  const hayPadron = ac && ac.cubiertos > 0;
  let acSaf = hayPadron ? ac.saf.total : (d.FACILITADOR_SAF || 0);
  let acScd = hayPadron ? ac.scd.total : (d.MadresCuidadoras_SCD || 0);
  let cgSaf = hayPadron ? ac.saf.cg : (d.CG_SAF || 0);
  let cgScd = hayPadron ? ac.scd.cg : (d.CG_SCD || 0);

  const sa = (typeof saDe === 'function') ? saDe(d.ubigeos) : { servicios: 0 };
  let servAlim = sa.servicios || d.SA_SCD || 0;
  let fam = Math.round(d.familias_2025 || 0);
  let usu = Math.round(d.niños_2025 || 0);
  let gest = d.gestantes_SAF, ninosSaf = d.niños_saf, ciai = d.CIAI_SCD;

  // Si lo consultado es un centro poblado, la lámina debe hablar de ESE centro
  // poblado, no del distrito que lo contiene. Los comités, facilitadoras y
  // madres cuidadoras salen del archivo de centro poblado; cuando ese archivo
  // no los trae (van en null), se muestran en cero en vez de inventarlos.
  if (d.ccpp) {
    const s = d.ccpp.saf, c = d.ccpp.scd;
    fam      = s ? (s.familias || 0) : 0;
    gest     = s ? (s.gestantes || 0) : 0;
    ninosSaf = s ? ((s.ninoV || 0) + (s.ninaM || 0)) : 0;
    usu      = c ? (c.usuarios || 0) : 0;
    ciai     = c ? (c.locales || 0) : 0;
    cgSaf    = (s && s.cg  != null) ? s.cg  : 0;
    acSaf    = (s && s.fac != null) ? s.fac : 0;
    acScd    = (c && c.madres != null) ? c.madres : 0;
    cgScd    = 0;
    servAlim = 0;
  }

  return [
    ['JUL 2026',          (mesNombre || '').slice(0, 3).toUpperCase() + ' ' + año],
    ['usuarios a nivel\r\n', 'usuarios en'],
    ['NACIONAL',          nombre],
    ['341,339',           fN(fam + usu)],
    ['78,005',            fN(acSaf + acScd)],
    ['3,061',             fN(cgSaf + cgScd)],
    ['276,720',           fN(fam)],
    ['22,040',            fN(gest)],
    ['256,347',           fN(ninosSaf)],
    ['2,404',             fN(cgSaf)],
    ['48,254',            fN(acSaf)],
    ['64,619',            fN(usu)],
    ['657',               fN(cgScd)],
    ['29,751',            fN(acScd)],
    ['2,542',             fN(ciai)],
    ['807',               fN(servAlim)]
  ];
}

// Deja una parte del paquete lista para escribir: comprime, y actualiza el
// tamaño y el CRC que pide la cabecera del ZIP.
async function _pptGuardarParte(e, texto) {
  const bytes = new TextEncoder().encode(texto);
  const comprimido = await frDeflar(bytes);
  e.origSz = bytes.length;
  e.crc = frCrc32(bytes);
  if (comprimido && comprimido.length < bytes.length) { e.metodo = 8; e.datos = comprimido; }
  else { e.metodo = 0; e.datos = bytes; }
  return e;
}

async function _pptLeerParte(entradas, nombre) {
  const e = entradas.find(x => x.nombre === nombre);
  if (!e) throw new Error('el modelo no contiene ' + nombre + '.');
  const crudo = (e.metodo === 0) ? e.datos : await frInflar(e.datos);
  return { e: e, xml: new TextDecoder().decode(crudo) };
}

// Añade al paquete una lámina nueva clonada de la 5. Hay que tocar cuatro
// piezas además del XML: el tipo de contenido, las relaciones de la lámina,
// las relaciones de la presentación y la lista de láminas.
async function _pptAgregarLamina(entradas, xmlNuevo) {
  const NUM = 6, RID = 'rId100', SLD_ID = 7300;
  const base = entradas.find(x => x.nombre === 'ppt/slides/slide5.xml');

  // 1 · la lámina
  entradas.push(await _pptGuardarParte({
    nombre: 'ppt/slides/slide' + NUM + '.xml',
    hora: base.hora, fecha: base.fecha, attrExt: base.attrExt
  }, xmlNuevo));

  // 2 · sus relaciones: las mismas de la 5, menos la nota (una nota no puede
  //     pertenecer a dos láminas).
  const rels = await _pptLeerParte(entradas, 'ppt/slides/_rels/slide5.xml.rels');
  const sinNota = rels.xml.replace(/<Relationship[^>]*notesSlide[^>]*\/>/g, '');
  entradas.push(await _pptGuardarParte({
    nombre: 'ppt/slides/_rels/slide' + NUM + '.xml.rels',
    hora: base.hora, fecha: base.fecha, attrExt: base.attrExt
  }, sinNota));

  // 3 · el tipo de contenido
  const ct = await _pptLeerParte(entradas, '[Content_Types].xml');
  await _pptGuardarParte(ct.e, ct.xml.replace('</Types>',
    '<Override PartName="/ppt/slides/slide' + NUM + '.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/></Types>'));

  // 4 · la relación desde la presentación
  const pr = await _pptLeerParte(entradas, 'ppt/_rels/presentation.xml.rels');
  await _pptGuardarParte(pr.e, pr.xml.replace('</Relationships>',
    '<Relationship Id="' + RID + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide' + NUM + '.xml"/></Relationships>'));

  // 5 · la lámina entra al final de la lista
  const pp = await _pptLeerParte(entradas, 'ppt/presentation.xml');
  if (pp.xml.indexOf('</p:sldIdLst>') < 0) throw new Error('el modelo no trae la lista de láminas.');
  await _pptGuardarParte(pp.e, pp.xml.replace('</p:sldIdLst>',
    '<p:sldId id="' + SLD_ID + '" r:id="' + RID + '"/></p:sldIdLst>'));
}

/* ---------- exportador ---------- */

async function exportarPPT() {
  if (typeof DecompressionStream === 'undefined') {
    return alert('Este navegador no puede abrir el modelo. Use Chrome o Edge actualizado.');
  }
  const btn = document.getElementById('btnPPT');
  const rotulo = btn ? btn.innerHTML : null;
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Generando…'; }
  try {
    await _libsPPT();
    if (typeof MOLDE_PPT_B64 === 'undefined') throw new Error('no se pudo cargar el modelo (modelo_ppt.js).');
    await _armarPPT();
  } catch (e) {
    console.error(e);
    alert('No se pudo generar el PPT: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = rotulo || '<span>PPT</span>'; }
  }
}

async function _armarPPT() {
  // Siempre el panorama nacional: las láminas 3 y 4 no tienen equivalente por ámbito.
  const d  = calcularResumenNacional();
  const ac = actoresNacional();
  const sa = (typeof saNacional === 'function') ? saNacional() : { servicios: 0 };

  const fN  = v => Math.round(v || 0).toLocaleString('es-PE');
  const fM  = v => (v || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pc  = (a, b) => b ? (a / b * 100).toFixed(2) + '%' : '—';
  const pcC = (a, b) => b ? (a / b * 100).toFixed(2).replace('.', ',') : '—';   // 99,80

  const fam  = Math.round(d.familias_2025 || 0);
  const usu  = Math.round(d.niños_2025 || 0);
  const total = fam + usu;
  const metaSaf = parametroAnual('saf', 'meta'), poSaf = parametroAnual('saf', 'poblacion_objetivo');
  const metaScd = parametroAnual('scd', 'meta'), poScd = parametroAnual('scd', 'poblacion_objetivo');
  const pimSaf  = parametroAnual('saf', 'pim'),  pimScd = parametroAnual('scd', 'pim');
  // Un parámetro que falta se muestra «—» (y su brecha y cobertura también).
  const fP  = v => v ? fN(v) : '—';
  const brSaf = poSaf ? Math.max(0, poSaf - fam) : null;
  const brScd = poScd ? Math.max(0, poScd - usu) : null;
  // La brecha % se calcula como complemento de la cobertura, no por separado:
  // asi las dos columnas siempre suman 100,00 como en el modelo.
  const cobSaf = poSaf ? fam / poSaf * 100 : null;
  const cobScd = poScd ? usu / poScd * 100 : null;
  const pctP   = v => v == null ? '—' : v.toFixed(2) + '%';
  const brP    = v => v == null ? '—' : (100 - v).toFixed(2) + '%';
  const MES = (mesNombre || '').toUpperCase();
  const MESC = MES.slice(0, 3);

  // El padrón de actores es de un solo corte. Si el corte elegido es otro, en
  // vez de imprimir ceros se cae a lo que sí trae bd para ese mes: comités de
  // gestión, facilitadoras y madres cuidadoras. Es el mismo respaldo que usan
  // las tarjetas en pantalla.
  // El respaldo se toma de bd directamente: los campos de actores del resumen
  // nacional ya vienen del padrón, así que si el padrón no aplica valen cero y
  // no sirven de respaldo.
  // Antes que bd van los totales oficiales del corte (parametros.js), que no
  // cuentan doble: bd suma distrito por distrito y repite a quien atiende dos.
  const hayAct = ac.cubiertos > 0;
  const _fBD = ultimaFecha.toISOString().split('T')[0];
  const _bd  = dataset.filter(x => x.fecha === _fBD);
  const _sBD = k => _bd.reduce((t, x) => t + (x[k] || 0), 0);
  const _of  = hayAct ? null : totalesOficiales(_fBD);
  const _res = (ofv, k) => (ofv != null) ? ofv : _sBD(k);
  const nCgSaf  = hayAct ? ac.saf.cg    : _res(_of && _of.saf.cg, 'CG_SAF');
  const nCgScd  = hayAct ? ac.scd.cg    : _res(_of && _of.scd.cg, 'CG_SCD');
  const nFacil  = hayAct ? ac.saf.facilitadoras     : _res(_of && _of.saf.facilitadoras, 'FACILITADOR_SAF');
  const nMadres = hayAct ? ac.scd.madres_cuidadoras : _res(_of && _of.scd.madres, 'MadresCuidadoras_SCD');
  const nActSaf = hayAct ? ac.saf.total : nFacil;
  const nActScd = hayAct ? ac.scd.total : nMadres;
  // Total de actores: con padrón, personas únicas (quien está en los dos
  // servicios cuenta una vez, como el reporte oficial); sin padrón, la suma.
  const nActTot = hayAct ? ac.total : nActSaf + nActScd;

  // El monto ejecutado y su porcentaje del PIM. Mientras el PIM del anio no
  // este cargado, en lugar del porcentaje va un XX resaltado en amarillo:
  // asi se ve que ese dato se completa a mano, en vez de desaparecer callado.
  const pres = (ejec, pim, guion, sep) => pim
    ? [{ t: fM(ejec) + ' ' + guion + ' ' + (ejec / pim * 100).toFixed(2) + sep + '% del PIM ' + año }]
    : [{ t: fM(ejec) + ' ' + guion + ' ' }, { t: 'XX', hl: true }, { t: sep + '% del PIM ' + año }];

  const CAMBIOS = {
    'ppt/slides/slide1.xml': [
      ['2026', String(año)]
    ],
    'ppt/slides/slide3.xml': [
      ['FUENTE: SISTEMA INTEGRADO JULIO 2026', 'FUENTE: ' + FUENTE_DATOS.toUpperCase() + ' ' + MES + ' ' + año],
      ['341,339 ',      fN(total)],
      ['276,720',       fN(fam)],
      [' (99.80%) ',    '(' + pc(fam, metaSaf) + ')'],
      ['64,619',        fN(usu)],
      ['(95.89%)',      '(' + pc(usu, metaScd) + ')'],
      ['ATENCIÓN JULIO', 'ATENCIÓN ' + MES],
      ['        607,215', fP(poSaf)],
      ['        276,720', fN(fam)],
      ['45.57%',        pctP(cobSaf)],
      ['      330,495', fP(brSaf)],
      ['54.43%',        brP(cobSaf)],
      ['       287,259', fP(poScd)],
      ['           64,619 ', fN(usu)],
      ['22.49%',        pctP(cobScd)],
      ['        222,640 ', fP(brScd)],
      ['77.51%',        brP(cobScd)],
      ['Meta: 277,283', 'Meta: ' + fP(metaSaf)],
      ['Meta: 67,387',  'Meta: ' + fP(metaScd)]
    ],
    'ppt/slides/slide4.xml': [
      ['276,720', fN(fam)],
      ['256,347', fN(d.niños_saf)],
      ['22,040',  fN(d.gestantes_SAF)],
      ['99,80',   pcC(fam, metaSaf)],
      ['(277,283 familias ', '(' + fP(metaSaf) + ' familias'],
      ['335,850,669.26 - 61.68 % del PIM 2026', null, pres(d.ejec_saf, pimSaf, '-', ' ')],
      ['64,619',  fN(usu)],
      ['2,542',   fN(d.CIAI_SCD)],
      ['95,89',   pcC(usu, metaScd)],
      ['67,387',  fP(metaScd)],
      ['268,135,315 – 59.17 % del PIM 2026', null, pres(d.ejec_scd, pimScd, '–', ' ')],
      ['10,380',  fN(nMadres)],
      ['27,865',  fN(nFacil)],
      ['2,404',   fN(nCgSaf)],
      ['Con presencia en 25 departamentos, 188 provincias y 1,420 distritos',
       'Con presencia en ' + fN(d.dep_saf) + ' departamentos, ' + fN(d.prov_saf) + ' provincias y ' + fN(d.dist_saf) + ' distritos'],
      ['657',     fN(nCgScd)],
      ['Con presencia en 25 departamentos, 145 provincias y 535 distritos',
       'Con presencia en ' + fN(d.dep_scd) + ' departamentos, ' + fN(d.prov_scd) + ' provincias y ' + fN(d.dist_scd) + ' distritos']
    ],
    'ppt/slides/slide5.xml': [
      ['JUL 2026', MESC + ' ' + año],
      ['341,339', fN(total)],
      ['78,005',  fN(nActTot)],
      ['3,061',   fN(nCgSaf + nCgScd)],
      ['276,720', fN(fam)],
      ['22,040',  fN(d.gestantes_SAF)],
      ['256,347', fN(d.niños_saf)],
      ['2,404',   fN(nCgSaf)],
      ['48,254',  fN(nActSaf)],
      ['64,619',  fN(usu)],
      ['657',     fN(nCgScd)],
      ['29,751',  fN(nActScd)],
      ['2,542',   fN(d.CIAI_SCD)],
      ['807',     fN(sa.servicios)]
    ]
  };

  // Se reusa la maquinaria de ZIP de la exportación de FRONTERAS.
  const entradas = frLeerZip(frB64aBytes(MOLDE_PPT_B64));
  const dec = new TextDecoder(), enc = new TextEncoder();

  // La lámina del ámbito se clona de la 5, pero a partir del XML ORIGINAL:
  // si se tomara el ya modificado, los textos del modelo que hay que sustituir
  // ya no estarían.
  const cambiosAmbito = _pptCambiosAmbito();
  let xmlLamina5 = null;
  if (cambiosAmbito) xmlLamina5 = (await _pptLeerParte(entradas, 'ppt/slides/slide5.xml')).xml;

  for (const hoja of Object.keys(CAMBIOS)) {
    const e = entradas.find(x => x.nombre === hoja);
    if (!e) throw new Error('el modelo no contiene ' + hoja + '.');
    const crudo = (e.metodo === 0) ? e.datos : await frInflar(e.datos);
    let xml = dec.decode(crudo);
    for (const c of CAMBIOS[hoja]) {
      xml = (c.length === 3) ? _pptPartir(xml, c[0], c[2]) : _pptTexto(xml, c[0], c[1]);
    }

    const bytes = enc.encode(xml);
    const comprimido = await frDeflar(bytes);
    e.origSz = bytes.length;
    e.crc = frCrc32(bytes);
    if (comprimido && comprimido.length < bytes.length) { e.metodo = 8; e.datos = comprimido; }
    else { e.metodo = 0; e.datos = bytes; }
  }

  // Lámina extra con el ámbito consultado, después de las cinco del modelo
  let sufijo = 'NACIONAL';
  if (cambiosAmbito) {
    await _pptAgregarLamina(entradas, _pptLote(xmlLamina5, cambiosAmbito));
    sufijo = _pptAmbitoNombre(window.ultimoResultado).replace(/[^A-Za-z0-9ÁÉÍÓÚÑ]+/g, '_').replace(/^_|_$/g, '');
  }

  const salida = frEscribirZip(entradas);
  const nom = 'Cobertura_' + sufijo + '_' + mesNombre + '_' + año + '.pptx';
  if (typeof saveAs !== 'function' && typeof asegurarLibs === 'function') {
    try { await asegurarLibs(['filesaver']); } catch (e) { /* queda el enlace */ }
  }
  const blob = new Blob([salida], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
  registrarStat('ppt');
  if (typeof saveAs === 'function') saveAs(blob, nom);
  else {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nom; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
}

// ──────────────────────────────────────────────────
//  EXPORTAR EXCEL — una pestaña por nivel consultado
// ──────────────────────────────────────────────────
// Estilos compartidos por las hojas sueltas del Excel (actores, servicios
// alimentarios, información). Misma paleta que las hojas de cobertura.
const XL_COL = { titulo:'FF0056B3', saf:'FFF8BBD0', scd:'FFA5D6A7', gris:'FFF1F5F9',
                 totPink:'FFFCE4EC', totGreen:'FFC8E6C9', borde:'FFCBD5E1',
                 blanco:'FFFFFFFF', texto:'FF1E293B', tenue:'FF64748B' };
function _xlEst() {
  const b = { style:'thin', color:{ rgb: XL_COL.borde } };
  const borde = { top:b, bottom:b, left:b, right:b };
  const f = (sz, bold, color, extra) => Object.assign({ name:'Calibri', sz, bold:!!bold, color:{ rgb: color || XL_COL.texto } }, extra || {});
  const al = (h, wrap) => ({ horizontal:h, vertical:'center', wrapText:!!wrap });
  const fill = c => ({ fgColor:{ rgb:c } });
  return {
    titulo: { font:f(13, true, XL_COL.blanco), fill:fill(XL_COL.titulo), alignment:al('left') },
    lbl:    { font:f(10, true),  fill:fill(XL_COL.gris), alignment:al('left'), border:borde },
    val:    { font:f(10),        alignment:al('left', true), border:borde },
    head:   { font:f(10, true),  fill:fill(XL_COL.gris), alignment:al('center', true), border:borde },
    headS:  { font:f(10, true),  fill:fill(XL_COL.saf),  alignment:al('center', true), border:borde },
    headD:  { font:f(10, true),  fill:fill(XL_COL.scd),  alignment:al('center', true), border:borde },
    txt:    { font:f(10),        alignment:al('left'),  border:borde },
    num:    { font:f(10),        alignment:al('right'), border:borde },
    totL:   { font:f(10, true),  fill:fill(XL_COL.gris),     alignment:al('left'),  border:borde },
    totS:   { font:f(10, true),  fill:fill(XL_COL.totPink),  alignment:al('right'), border:borde },
    totD:   { font:f(10, true),  fill:fill(XL_COL.totGreen), alignment:al('right'), border:borde },
    totT:   { font:f(10, true),  fill:fill(XL_COL.gris),     alignment:al('right'), border:borde },
    nota:   { font:f(9, false, XL_COL.tenue, { italic:true }), alignment:al('left', true) },
    pieL:   { font:f(9, true,  XL_COL.tenue), alignment:al('left') },
    pieV:   { font:f(9, false, XL_COL.tenue), alignment:al('left') }
  };
}
// Pone estilo a una celda (la crea vacía si no existe) y, si es número, su formato.
function _xlS(ws, r, c, st, fmt) {
  const a = XLSX.utils.encode_cell({ r, c });
  if (!ws[a]) ws[a] = { t:'s', v:'' };
  ws[a].s = st;
  if (fmt && ws[a].t === 'n') ws[a].z = fmt;
}
// Pie de toda hoja: fuente y hora de generación.
function _xlPie(filas) {
  filas.push([], ['Fuente', FUENTE_DATOS], ['Generado a las', _generadoALas()]);
}
function _xlEstiloPie(ws, filas, E) {
  for (let r = filas.length - 2; r < filas.length; r++) { _xlS(ws, r, 0, E.pieL); _xlS(ws, r, 1, E.pieV); }
}
// Hoja «Información»: título y pares etiqueta/valor, ya con fuente y hora.
function _xlHojaInfo(titulo, pares) {
  const E = _xlEst();
  const filas = [[titulo], []].concat(pares.map(p => [p[0], p[1] == null ? '' : p[1]]));
  filas.push(['Fuente', FUENTE_DATOS], ['Generado a las', _generadoALas()]);
  const ws = XLSX.utils.aoa_to_sheet(filas);
  ws['!cols'] = [{ wch:22 }, { wch:48 }];
  ws['!merges'] = [{ s:{ r:0, c:0 }, e:{ r:0, c:1 } }];
  ws['!rows'] = [{ hpt:26 }];
  _xlS(ws, 0, 0, E.titulo); _xlS(ws, 0, 1, E.titulo);
  for (let r = 2; r < filas.length; r++) { _xlS(ws, r, 0, E.lbl); _xlS(ws, r, 1, E.val); }
  return ws;
}

// Excel para ámbito especial (VRAEM / NOR-VRAEM): agrega SOLO el ámbito seleccionado
async function exportarExcelEspecial(d) {
  await asegurarLibs(['xlsx']);
  const datosAm = d._datos || [];
  const ambito  = d._ambito || 'ÁMBITO';
  const COL = { titulo:'FF0056B3', saf:'FFF8BBD0', scd:'FFA5D6A7', gris:'FFF1F5F9',
                totPink:'FFFCE4EC', totGreen:'FFC8E6C9', bordeHex:'FFCBD5E1', blanco:'FFFFFFFF', textoOsc:'FF1E293B' };
  const bordeThin = { top:{style:'thin',color:{rgb:COL.bordeHex}}, bottom:{style:'thin',color:{rgb:COL.bordeHex}},
                      left:{style:'thin',color:{rgb:COL.bordeHex}}, right:{style:'thin',color:{rgb:COL.bordeHex}} };
  const F = (sz,bold,color)=>({name:'Calibri',sz,bold:!!bold,color:{rgb:color||COL.textoOsc}});
  const wb = XLSX.utils.book_new();

  function armarHoja(nombreHoja, colTitulo, filas, w0) {
    const aoa = [];
    aoa.push([`COBERTURA ${ambito} — POR ${colTitulo.toUpperCase()} · ${mesNombre} ${año}`]);
    aoa.push([]);
    aoa.push([colTitulo, 'Servicio de Acompañamiento a Familias','','','', 'Servicio de Cuidado Diurno','','']);
    aoa.push(['', 'FAMILIAS','NIÑAS/OS','GESTANTES','S/. EJECUCIÓN ACUM.', 'USUARIOS','CIAI','S/. EJECUCIÓN ACUM.']);
    const tot = {fam:0,nSaf:0,gest:0,eSaf:0,uScd:0,ciai:0,eScd:0};
    filas.forEach(f => {
      ['fam','nSaf','gest','eSaf','uScd','ciai','eScd'].forEach(k => tot[k]+=f[k]);
      aoa.push([f.label, f.fam, f.nSaf, f.gest, Math.round(f.eSaf), f.uScd, f.ciai, Math.round(f.eScd)]);
    });
    aoa.push([`Total ${ambito}`, tot.fam, tot.nSaf, tot.gest, Math.round(tot.eSaf), tot.uScd, tot.ciai, Math.round(tot.eScd)]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{wch:w0||30},{wch:12},{wch:12},{wch:12},{wch:18},{wch:12},{wch:10},{wch:18}];
    ws['!merges'] = [{s:{r:0,c:0},e:{r:0,c:7}},{s:{r:2,c:1},e:{r:2,c:4}},{s:{r:2,c:5},e:{r:2,c:7}},{s:{r:2,c:0},e:{r:3,c:0}}];
    ws['!rows'] = [{hpt:24},{hpt:6},{hpt:22},{hpt:22}];

    const stTit  = { font:F(13,true,COL.blanco), fill:{fgColor:{rgb:COL.titulo}}, alignment:{horizontal:'left',vertical:'center'} };
    const stHSAF = { font:F(9.5,true), fill:{fgColor:{rgb:COL.saf}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:bordeThin };
    const stHSCD = { font:F(9.5,true), fill:{fgColor:{rgb:COL.scd}}, alignment:{horizontal:'center',vertical:'center',wrapText:true}, border:bordeThin };
    const stHGr  = { font:F(9.5,true), fill:{fgColor:{rgb:COL.gris}}, alignment:{horizontal:'center',vertical:'center'}, border:bordeThin };
    const stLbl  = { font:F(9.5,false), alignment:{horizontal:'left',vertical:'center'}, border:bordeThin };
    const stNum  = { font:F(9.5,false), alignment:{horizontal:'right',vertical:'center'}, border:bordeThin };
    const stTotL = { font:F(9.5,true), fill:{fgColor:{rgb:COL.totPink}}, alignment:{horizontal:'left',vertical:'center'}, border:bordeThin };
    const stTotS = { font:F(9.5,true), fill:{fgColor:{rgb:COL.totPink}}, alignment:{horizontal:'right',vertical:'center'}, border:bordeThin };
    const stTotD = { font:F(9.5,true), fill:{fgColor:{rgb:COL.totGreen}}, alignment:{horizontal:'right',vertical:'center'}, border:bordeThin };
    const S = (a,st,z)=>{ if(!ws[a]) ws[a]={t:'s',v:''}; ws[a].s=st; if(z){ws[a].t='n';ws[a].z=z;} };

    S('A1',stTit);
    S('A3',stHGr); ['B3','C3','D3','E3'].forEach(a=>S(a,stHSAF)); ['F3','G3','H3'].forEach(a=>S(a,stHSCD));
    ['B4','C4','D4','E4'].forEach(a=>S(a,stHSAF)); ['F4','G4','H4'].forEach(a=>S(a,stHSCD));
    const nF = aoa.length;
    for (let r=4; r<nF; r++) {
      const esTot = (r === nF-1);
      for (let c=0; c<=7; c++) {
        const a = XLSX.utils.encode_cell({r,c});
        const z = (c===4||c===7) ? '"S/. "#,##0' : (c>=1 ? '#,##0' : null);
        if (c===0) S(a, esTot ? stTotL : stLbl);
        else       S(a, esTot ? ((c<=4)?stTotS:stTotD) : stNum, z);
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  }

  const acumular = (m, k, r, label) => {
    if (!m[k]) m[k] = { label, fam:0,nSaf:0,gest:0,eSaf:0,uScd:0,ciai:0,eScd:0 };
    const o = m[k];
    o.fam+=r.nfamilia_saf||0; o.nSaf+=r.nniños_saf||0; o.gest+=r.ngestantes_saf||0; o.eSaf+=r.ejecucion_saf||0;
    o.uScd+=r.nniños_scd||0; o.ciai+=r.CIAI_SCD||0; o.eScd+=r.ejecucion_scd||0;
  };

  const mDep = {};
  datosAm.forEach(r => acumular(mDep, r.departamento, r, r.departamento));
  armarHoja('Por departamento', 'Departamento', Object.values(mDep).sort((a,b)=>a.label.localeCompare(b.label,'es')), 26);

  const mDist = {};
  datosAm.forEach(r => acumular(mDist, r.ubigeo, r, `${r.departamento} / ${r.provincia} / ${r.distrito}`));
  armarHoja('Por distrito', 'Distrito', Object.values(mDist).sort((a,b)=>a.label.localeCompare(b.label,'es')), 46);

  const wsM = _xlHojaInfo('REPORTE ÁMBITO ESPECIAL PNCM', [
    ['Ámbito', ambito], ['Detalle', d._ambitoLabel || ''],
    ['Mes del corte', `${mesNombre} ${año}`], ['Distritos', String(Object.keys(mDist).length)]]);
  XLSX.utils.book_append_sheet(wb, wsM, 'Información');

  registrarStat('excel');
  XLSX.writeFile(wb, `Cobertura_${ambito}_${mesNombre}_${año}.xlsx`);
}

async function exportarExcel() {
  if (!window.ultimoResultado) return alert('Primero realice una consulta.');
  // Ámbito especial: FRONTERAS usa el libro modelo del SIRF; VRAEM/NOR-VRAEM su propio libro
  if (window.ultimoResultado._esEspecial) {
    if (window.ultimoResultado._ambito === 'FRONTERAS') return exportarExcelFronteras();
    return exportarExcelEspecial(window.ultimoResultado);
  }
  await asegurarLibs(['xlsx']);
  const d    = window.ultimoResultado;
  const dep  = d.departamento;
  const prov = d.provincia;
  const dist = d.distrito;

  // Paleta
  const COL = {
    titulo   : 'FF0056B3',
    subtitulo: 'FF64748B',
    saf      : 'FFF8BBD0',  // rosa
    scd      : 'FFA5D6A7',  // verde
    gris     : 'FFF1F5F9',
    selec    : 'FFFFF176',  // amarillo selección
    totPink  : 'FFFCE4EC',
    totGreen : 'FFC8E6C9',
    bordeHex : 'FFCBD5E1',
    blanco   : 'FFFFFFFF',
    textoOsc : 'FF1E293B'
  };
  const bordeThin = {
    top:    { style:'thin', color:{rgb:COL.bordeHex} },
    bottom: { style:'thin', color:{rgb:COL.bordeHex} },
    left:   { style:'thin', color:{rgb:COL.bordeHex} },
    right:  { style:'thin', color:{rgb:COL.bordeHex} }
  };

  const wb = XLSX.utils.book_new();

  function setCell(ws, addr, value, style, numFmt, type) {
    if (value == null) value = '';   // un null escrito en la celda corrompe el libro
    if (!ws[addr]) ws[addr] = { t: type || 's', v: value };
    else { ws[addr].v = value; if (type) ws[addr].t = type; }
    if (numFmt) ws[addr].z = numFmt;
    if (style) ws[addr].s = style;
  }

  function agregarHoja(nivel, nombreHoja, seleccionado) {
    const data = obtenerDatosCobertura(nivel, dep, prov);
    const aoa = [];
    aoa.push([`COBERTURA A NIVEL ${nivel.toUpperCase()} — ${mesNombre.toUpperCase()} ${año}`]);
    aoa.push([`Selección: ${[dep, prov, dist].filter(Boolean).join(' / ') || 'Nacional'}`]);
    aoa.push([]);
    aoa.push([
      data.tituloCol,
      'Servicio de Acompañamiento a Familias', '', '', '',
      'Servicio de Cuidado Diurno', '', ''
    ]);
    aoa.push([
      '',
      'FAMILIAS','NIÑAS/OS','GESTANTES','S/. EJECUCIÓN ACUM.',
      'USUARIOS','CIAI','S/. EJECUCIÓN ACUM.'
    ]);
    data.filas.forEach(f => {
      aoa.push([
        f.nombre, f.familias, f.ninos_saf, f.gestantes,
        Math.round(f.ejec_saf), f.usuarios, f.ciai, Math.round(f.ejec_scd)
      ]);
    });
    aoa.push([
      'Total general',
      data.tot.familias, data.tot.ninos_saf, data.tot.gestantes,
      Math.round(data.tot.ejec_saf),
      data.tot.usuarios, data.tot.ciai, Math.round(data.tot.ejec_scd)
    ]);
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges'] = [
      {s:{r:0,c:0},e:{r:0,c:7}},
      {s:{r:1,c:0},e:{r:1,c:7}},
      {s:{r:3,c:1},e:{r:3,c:4}},
      {s:{r:3,c:5},e:{r:3,c:7}},
      {s:{r:3,c:0},e:{r:4,c:0}}
    ];
    ws['!cols'] = [
      {wch:34},{wch:12},{wch:12},{wch:12},{wch:16},{wch:12},{wch:10},{wch:16}
    ];
    ws['!rows'] = [{hpt:26},{hpt:18},{hpt:8},{hpt:24},{hpt:22}];

    // Estilos base
    const stTitulo = {
      font: {name:'Calibri', sz:14, bold:true, color:{rgb:COL.titulo}},
      alignment:{horizontal:'left', vertical:'center'}
    };
    const stSub = {
      font:{name:'Calibri', sz:10, italic:true, color:{rgb:COL.subtitulo}},
      alignment:{horizontal:'left', vertical:'center'}
    };
    const stHeadBase = {
      font:{name:'Calibri', sz:10, bold:true, color:{rgb:COL.textoOsc}},
      alignment:{horizontal:'center', vertical:'center', wrapText:true},
      border: bordeThin
    };
    const stHeadSAF  = Object.assign({}, stHeadBase, {fill:{fgColor:{rgb:COL.saf}}});
    const stHeadSCD  = Object.assign({}, stHeadBase, {fill:{fgColor:{rgb:COL.scd}}});
    const stHeadGris = Object.assign({}, stHeadBase, {fill:{fgColor:{rgb:COL.gris}}});
    const stTexto = {
      font:{name:'Calibri', sz:10, color:{rgb:COL.textoOsc}},
      alignment:{horizontal:'left', vertical:'center'},
      border: bordeThin
    };
    const stNum = {
      font:{name:'Calibri', sz:10, color:{rgb:COL.textoOsc}},
      alignment:{horizontal:'right', vertical:'center'},
      border: bordeThin
    };
    const stNumSel  = Object.assign({}, stNum, {fill:{fgColor:{rgb:COL.selec}}, font:{name:'Calibri', sz:10, bold:true, color:{rgb:COL.textoOsc}}});
    const stTextoSel= Object.assign({}, stTexto, {fill:{fgColor:{rgb:COL.selec}}, font:{name:'Calibri', sz:10, bold:true, color:{rgb:COL.textoOsc}}});
    const stTotSaf  = Object.assign({}, stNum, {fill:{fgColor:{rgb:COL.totPink}}, font:{name:'Calibri', sz:10, bold:true, color:{rgb:COL.textoOsc}}});
    const stTotScd  = Object.assign({}, stNum, {fill:{fgColor:{rgb:COL.totGreen}}, font:{name:'Calibri', sz:10, bold:true, color:{rgb:COL.textoOsc}}});
    const stTotLbl  = Object.assign({}, stTexto, {fill:{fgColor:{rgb:COL.totPink}}, font:{name:'Calibri', sz:10, bold:true, color:{rgb:COL.textoOsc}}});

    // Título y subtítulo
    setCell(ws, 'A1', aoa[0][0], stTitulo);
    setCell(ws, 'A2', aoa[1][0], stSub);

    // Cabecera fila 4 (índice 3)
    setCell(ws, 'A4', data.tituloCol, stHeadGris);
    setCell(ws, 'B4', 'Servicio de Acompañamiento a Familias', stHeadSAF);
    setCell(ws, 'F4', 'Servicio de Cuidado Diurno', stHeadSCD);
    // rellenar celdas mergeadas con estilo
    ['C4','D4','E4'].forEach(a => setCell(ws, a, '', stHeadSAF));
    ['G4','H4'].forEach(a => setCell(ws, a, '', stHeadSCD));

    // Sub-cabecera fila 5 (índice 4)
    const subH = [null,'FAMILIAS','NIÑAS/OS','GESTANTES','S/. EJECUCIÓN ACUM.','USUARIOS','CIAI','S/. EJECUCIÓN ACUM.'];
    for (let c=1; c<=7; c++) {
      const addr = XLSX.utils.encode_cell({r:4, c});
      setCell(ws, addr, subH[c], c<=4 ? stHeadSAF : stHeadSCD);
    }

    // Filas de datos
    const nFilas = aoa.length;
    for (let r=5; r<nFilas; r++) {
      const esTotal = (r === nFilas - 1);
      const nombreFila = aoa[r][0];
      const sel = !esTotal && seleccionado && nombreFila === seleccionado;
      for (let c=0; c<=7; c++) {
        const addr = XLSX.utils.encode_cell({r, c});
        if (!ws[addr]) ws[addr] = { t: c===0?'s':'n', v: aoa[r][c] };
        if (c === 0) {
          ws[addr].s = esTotal ? stTotLbl : (sel ? stTextoSel : stTexto);
        } else {
          ws[addr].t = 'n';
          ws[addr].z = (c===4 || c===7) ? '"S/. "#,##0' : '#,##0';
          if (esTotal)      ws[addr].s = (c<=4) ? stTotSaf : stTotScd;
          else if (sel)     ws[addr].s = stNumSel;
          else              ws[addr].s = stNum;
        }
      }
    }

    ws['!autofilter'] = { ref: `A5:H${nFilas-1}` };

    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  }

  // La vista nacional también lleva la tabla por departamento (sin fila resaltada)
  agregarHoja('departamento', 'Departamental', dep);
  if (prov) agregarHoja('provincia', 'Provincia_' + prov.slice(0,20), prov);
  if (dist) agregarHoja('distrito',  'Distrito_'  + dist.slice(0,20), dist);

  // Hoja de Centro Poblado (solo si se seleccionó un CCPP) — con estilo
  (function () {
    const c = d.ccpp;
    if (!c) return;

    // filas + tipo de cada una (para estilar)
    const filas = [], tipo = [];
    const push = (t, a, b) => { filas.push(b === undefined ? [a] : [a, b]); tipo.push(t); };

    push('titulo', 'REPORTE A NIVEL CENTRO POBLADO');
    push('meta', 'Centro poblado', c.nombre);
    push('meta', 'Código CCPP', c.codigo);
    push('meta', 'Unidad Territorial', c.ut || '—');
    push('meta', 'Corte', `${mesNombre} ${año}`);
    push('blank', '');
    push('secSAF', 'SERVICIO DE ACOMPAÑAMIENTO A FAMILIAS (SAF)');
    push('head', 'Indicador', 'Valor');
    if (c.saf) {
      push('dato', 'Familias', c.saf.familias);
      push('dato', 'Gestantes', c.saf.gestantes);
      push('dato', 'Niñas y niños', (c.saf.ninoV || 0) + (c.saf.ninaM || 0));
      push('dato', '   · Niños (varones)', c.saf.ninoV);
      push('dato', '   · Niñas (mujeres)', c.saf.ninaM);
      push('dato', 'Usuarios (total)', c.saf.usuarios);
      if (c.saf.fac != null) push('dato', 'Facilitadoras (presencia)', c.saf.fac);
    } else {
      push('sin', 'Sin atención SAF en este centro poblado');
    }
    push('blank', '');
    push('secSCD', 'SERVICIO DE CUIDADO DIURNO (SCD)');
    push('head', 'Indicador', 'Valor');
    if (c.scd) {
      push('dato', 'Usuarios (total)', c.scd.usuarios);
      push('dato', 'Niños', c.scd.varones);
      push('dato', 'Niñas', c.scd.mujeres);
      if (c.scd.madres  != null) push('dato', 'Madres Cuidadoras', c.scd.madres);
      if (c.scd.locales != null) push('dato', 'Locales (CIAI)', c.scd.locales);
    } else {
      push('sin', 'Sin atención SCD en este centro poblado');
    }

    const wsC = XLSX.utils.aoa_to_sheet(filas);
    wsC['!cols'] = [{wch:40},{wch:16}];

    // Estilos (reutilizan la paleta COL y bordeThin de exportarExcel)
    const f = (sz, bold, color) => ({ name:'Calibri', sz, bold: !!bold, color:{rgb: color || COL.textoOsc} });
    const stTit    = { font:f(13,true,COL.blanco), fill:{fgColor:{rgb:COL.titulo}},  alignment:{horizontal:'left',vertical:'center'} };
    const stMetaL  = { font:f(10,true),            fill:{fgColor:{rgb:COL.gris}},    alignment:{horizontal:'left',vertical:'center'},  border:bordeThin };
    const stMetaV  = { font:f(10,false),                                             alignment:{horizontal:'left',vertical:'center'},  border:bordeThin };
    const stSecSAF = { font:f(10.5,true),          fill:{fgColor:{rgb:COL.saf}},     alignment:{horizontal:'left',vertical:'center'} };
    const stSecSCD = { font:f(10.5,true),          fill:{fgColor:{rgb:COL.scd}},     alignment:{horizontal:'left',vertical:'center'} };
    const stHeadL  = { font:f(10,true),            fill:{fgColor:{rgb:COL.gris}},    alignment:{horizontal:'left',vertical:'center'},  border:bordeThin };
    const stHeadV  = { font:f(10,true),            fill:{fgColor:{rgb:COL.gris}},    alignment:{horizontal:'right',vertical:'center'}, border:bordeThin };
    const stDatoL  = { font:f(10,false),                                             alignment:{horizontal:'left',vertical:'center'},  border:bordeThin };
    const stDatoV  = { font:f(10,true),                                              alignment:{horizontal:'right',vertical:'center'}, border:bordeThin };
    const stSin    = { font:{ name:'Calibri', sz:10, italic:true, color:{rgb:COL.subtitulo} }, alignment:{horizontal:'left',vertical:'center'}, border:bordeThin };

    const merges = [];
    wsC['!rows'] = [];
    for (let r = 0; r < filas.length; r++) {
      const t = tipo[r];
      const aA = XLSX.utils.encode_cell({ r, c:0 });
      const aB = XLSX.utils.encode_cell({ r, c:1 });
      if (t === 'blank') { wsC['!rows'][r] = { hpt: 6 }; continue; }
      if (t === 'titulo' || t === 'secSAF' || t === 'secSCD' || t === 'sin') {
        merges.push({ s:{r,c:0}, e:{r,c:1} });
        if (!wsC[aB]) wsC[aB] = { t:'s', v:'' };
      }
      if (t === 'titulo') { wsC[aA].s = stTit; wsC[aB].s = stTit; wsC['!rows'][r] = { hpt: 24 }; }
      else if (t === 'secSAF') { wsC[aA].s = stSecSAF; wsC[aB].s = stSecSAF; wsC['!rows'][r] = { hpt: 20 }; }
      else if (t === 'secSCD') { wsC[aA].s = stSecSCD; wsC[aB].s = stSecSCD; wsC['!rows'][r] = { hpt: 20 }; }
      else if (t === 'sin')    { wsC[aA].s = stSin; wsC[aB].s = stSin; }
      else if (t === 'meta')   { wsC[aA].s = stMetaL; if (wsC[aB]) wsC[aB].s = stMetaV; }
      else if (t === 'head')   { wsC[aA].s = stHeadL; if (wsC[aB]) wsC[aB].s = stHeadV; }
      else if (t === 'dato')   {
        wsC[aA].s = stDatoL;
        if (wsC[aB]) { wsC[aB].t = 'n'; wsC[aB].z = '#,##0'; wsC[aB].s = stDatoV; }
      }
    }
    wsC['!merges'] = merges;
    XLSX.utils.book_append_sheet(wb, wsC, 'Centro Poblado');
  })();

  // Hoja de actores comunales — misma lógica que las tarjetas y la narrativa:
  // si un servicio no tiene detalle en el padrón, se usan los valores de bd.js.
  (function () {
    const res = window.ultimoResultado; if (!res) return;
    const ac  = res.esNacional ? actoresNacional() : actoresDe(res.ubigeos);
    const okS = ac.cubiertos && ac.saf.total, okD = ac.cubiertos && ac.scd.total;
    if (!okS && !okD) return;
    const ROT = [['facilitadoras','Facilitadoras'], ['madres_cuidadoras','Madres Cuidadoras'],
                 ['madres_guia','Madres Guía'], ['guias_familia','Guías de Familia'],
                 ['socias_cocina','Socias de Cocina'],
                 ['apoyo_limpieza','Apoyo de limpieza y vigilancia'],
                 ['repartidores','Repartidores de alimentos'],
                 ['apoyo_admin','Apoyo administrativo del Comité de Gestión'],
                 ['junta_directiva','Junta directiva'], ['consejo_vigilancia','Consejo de vigilancia']];
    const filas = [['ACTORES COMUNALES'], [],
                   ['Ámbito', [dep, prov, dist].filter(Boolean).join(' / ') || 'Nacional'],
                   ['Corte', `${mesNombre} ${año}`],
                   ['Criterio', 'Cada persona se cuenta una sola vez (no hay doble conteo)'], [],
                   ['Rol', 'SAF', 'SCD', 'Total']];
    const vS = k => okS ? ac.saf[k] : 0;
    const vD = k => okD ? ac.scd[k] : 0;
    const cgS = okS ? ac.saf.cg : (res.CG_SAF || 0);
    const cgD = okD ? ac.scd.cg : (res.CG_SCD || 0);
    filas.push(['Comités de Gestión', cgS, cgD, cgS + cgD]);
    ROT.forEach(([k, t]) => {
      let a = vS(k), b = vD(k);
      // sin padrón para un servicio: se muestran los valores de bd.js
      if (!okS && k === 'facilitadoras')     a = res.FACILITADOR_SAF || 0;
      if (!okD && k === 'madres_cuidadoras') b = res.MadresCuidadoras_SCD || 0;
      if (a || b) filas.push([t, a, b, a + b]);
    });
    const totS = okS ? ac.saf.total : 0, totD = okD ? ac.scd.total : 0;
    // En el país, quien está en SAF y en SCD cuenta una vez (total oficial).
    const totT = (res.esNacional && ac.total) ? ac.total : totS + totD;
    if (okS && okD) filas.push(['TOTAL ACTORES COMUNALES', totS, totD, totT]);
    if (okS && okD && totT !== totS + totD) filas.push(['Nota', 'El total general cuenta una sola vez a las ' +
      (totS + totD - totT).toLocaleString('es-PE') + ' personas que trabajan en los dos servicios.']);
    if (!okS || !okD) {
      filas.push([]);
      filas.push(['Nota', 'El detalle por rol de ' + (!okS ? 'SAF' : 'SCD') +
                  ' no está disponible: el comité que atiende este distrito tiene sede en otro. ' +
                  'Se muestran las cifras del registro de cobertura.']);
    }
    const finDatos = filas.length;            // hasta aquí van título, datos y nota
    _xlPie(filas);
    const wsA = XLSX.utils.aoa_to_sheet(filas);
    wsA['!cols'] = [{wch:46},{wch:12},{wch:12},{wch:12}];
    wsA['!merges'] = [{ s:{r:0,c:0}, e:{r:0,c:3} }, { s:{r:2,c:1}, e:{r:2,c:3} },
                      { s:{r:3,c:1}, e:{r:3,c:3} }, { s:{r:4,c:1}, e:{r:4,c:3} }];
    wsA['!rows'] = [{ hpt:24 }];
    const E = _xlEst();
    for (let c = 0; c < 4; c++) _xlS(wsA, 0, c, E.titulo);
    for (let r = 2; r <= 4; r++) { _xlS(wsA, r, 0, E.lbl); for (let c = 1; c < 4; c++) _xlS(wsA, r, c, E.val); }
    const HR = 6;                             // fila «Rol · SAF · SCD · Total»
    [E.head, E.headS, E.headD, E.head].forEach((st, c) => _xlS(wsA, HR, c, st));
    for (let r = HR + 1; r < finDatos; r++) {
      const f = filas[r];
      if (!f || !f.length) continue;
      if (f[0] === 'Nota') {
        wsA['!merges'].push({ s:{r,c:1}, e:{r,c:3} });
        _xlS(wsA, r, 0, E.lbl); for (let c = 1; c < 4; c++) _xlS(wsA, r, c, E.nota);
        wsA['!rows'][r] = { hpt:42 };
        continue;
      }
      const tot = f[0] === 'TOTAL ACTORES COMUNALES';
      _xlS(wsA, r, 0, tot ? E.totL : E.txt);
      _xlS(wsA, r, 1, tot ? E.totS : E.num, '#,##0');
      _xlS(wsA, r, 2, tot ? E.totD : E.num, '#,##0');
      _xlS(wsA, r, 3, tot ? E.totT : E.num, '#,##0');
    }
    _xlEstiloPie(wsA, filas, E);
    XLSX.utils.book_append_sheet(wb, wsA, 'Actores comunales');
  })();

  // Hoja de servicios alimentarios (solo si el ambito tiene alguno)
  (function () {
    const sa = d.esNacional ? { servicios: 0, lista: [] } : saDe(d.ubigeos);
    const lista = sa.lista.length ? sa.lista
      : (d.esNacional && _saVigente()
          ? window.SERVICIOS_ALIMENTARIOS.filas.map(f => {
              const o = {}; window.SERVICIOS_ALIMENTARIOS.campos.forEach((k, i) => o[k] = f[i]); return o;
            })
          : []);
    if (!lista.length) return;
    const filas = [['SERVICIOS ALIMENTARIOS'], [],
      ['Departamento','Provincia','Distrito','Ubigeo','Comité de Gestión','Cód. CG','Servicio alimentario','Cód. SA']];
    lista.forEach(o => filas.push([o.departamento, o.provincia, o.distrito, o.ubigeo,
                                   o.cg_nombre, o.cg_codigo, o.sa_nombre, o.sa_codigo]));
    const filaTot = filas.length;
    filas.push(['Total de servicios', '', '', '', '', '', '', lista.length]);
    _xlPie(filas);
    const wsS = XLSX.utils.aoa_to_sheet(filas);
    wsS['!cols'] = [{wch:16},{wch:18},{wch:20},{wch:9},{wch:34},{wch:9},{wch:34},{wch:9}];
    wsS['!merges'] = [{ s:{r:0,c:0}, e:{r:0,c:7} }, { s:{r:filaTot,c:0}, e:{r:filaTot,c:6} }];
    wsS['!rows'] = [{ hpt:24 }];
    const E = _xlEst();
    for (let c = 0; c < 8; c++) { _xlS(wsS, 0, c, E.titulo); _xlS(wsS, 2, c, E.head); }
    for (let r = 3; r < filaTot; r++)
      for (let c = 0; c < 8; c++) _xlS(wsS, r, c, (c === 3 || c === 5 || c === 7) ? E.num : E.txt);
    for (let c = 0; c < 7; c++) _xlS(wsS, filaTot, c, E.totL);
    _xlS(wsS, filaTot, 7, E.totD, '#,##0');
    _xlEstiloPie(wsS, filas, E);
    XLSX.utils.book_append_sheet(wb, wsS, 'Servicios alimentarios');
  })();

  // Hoja de información (fuente y hora de generación; sin versión)
  const wsMeta = _xlHojaInfo('REPORTE DE COBERTURA PNCM', [
    ['Departamento', dep || 'Nacional'], ['Provincia', prov || '—'],
    ['Distrito', dist || '—'], ['Mes del corte', `${mesNombre} ${año}`]]);
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Información');

  const nombreArchivo = `Cobertura_${(dep||'Nacional').replace(/\s+/g,'_')}${prov?'_'+prov.replace(/\s+/g,'_'):''}${dist?'_'+dist.replace(/\s+/g,'_'):''}_${mesNombre}_${año}.xlsx`;
  registrarStat('excel');
  XLSX.writeFile(wb, nombreArchivo);
}

function generarTablaCobertura(nivel, dep, prov, dist, opts) {
  opts = opts || {};
  const forWord = !!opts.forWord;
  const fz      = forWord ? '7pt'  : '0.8rem';
  const fzHead  = forWord ? '7pt'  : '0.8rem';
  const fzTitle = forWord ? '9pt'  : '1rem';
  const padCell = forWord ? '1px 3px'  : '4px 8px';
  const padHead = forWord ? '1px 3px'  : '6px';
  // Colores cabecera tabla cobertura
  // Paleta monocromática — solo grises; amarillo para resaltado
  // Cabeceras todas en escala de grises — sin rojo ni verde
  const thSAF   = forWord ? 'background:#6b7280;color:#fff;' : 'background:#e5e7eb;color:#1f2937;';
  const thSCD   = forWord ? 'background:#9ca3af;color:#fff;' : 'background:#f3f4f6;color:#1f2937;';
  const thSAF2  = forWord ? 'background:#e5e7eb;color:#374151;' : 'background:#e5e7eb;color:#374151;';
  const thSCD2  = forWord ? 'background:#f3f4f6;color:#374151;' : 'background:#f3f4f6;color:#374151;';
  const thGray  = forWord ? 'background:#4b5563;color:#fff;' : 'background:#f1f5f9;color:#1e293b;';
  const ultimaFechaStr = ultimaFecha.toISOString().split('T')[0];
  const base = dataset.filter(d => d.fecha === ultimaFechaStr);

  let titulo, claveCol, tituloCol, datosAmbito, seleccionado;
  if (nivel === 'departamento') {
    titulo       = 'COBERTURA A NIVEL DEPARTAMENTAL';
    claveCol     = 'departamento';
    tituloCol    = 'DEPARTAMENTO';
    datosAmbito  = base;
    seleccionado = dep;
  } else if (nivel === 'provincia') {
    titulo       = 'COBERTURA A NIVEL PROVINCIA';
    claveCol     = 'provincia';
    tituloCol    = 'PROVINCIAS DE ' + (dep || '').toUpperCase();
    datosAmbito  = base.filter(d => d.departamento === dep);
    seleccionado = prov;
  } else {
    titulo       = 'COBERTURA A NIVEL DISTRITO';
    claveCol     = 'distrito';
    tituloCol    = 'DISTRITOS DE ' + (prov || '').toUpperCase();
    datosAmbito  = base.filter(d => d.departamento === dep && d.provincia === prov);
    seleccionado = dist;
  }

  // Agrupar por entidad hija
  const mapa = {};
  datosAmbito.forEach(r => {
    const k = r[claveCol];
    if (!mapa[k]) mapa[k] = {familias:0, ninos_saf:0, gestantes:0, ejec_saf:0, usuarios:0, ciai:0, ejec_scd:0};
    mapa[k].familias  += r.nfamilia_saf   || 0;
    mapa[k].ninos_saf += r.nniños_saf     || 0;
    mapa[k].gestantes += r.ngestantes_saf || 0;
    mapa[k].ejec_saf  += r.ejecucion_saf  || 0;
    mapa[k].usuarios  += r.nniños_scd     || 0;
    mapa[k].ciai      += r.CIAI_SCD       || 0;
    mapa[k].ejec_scd  += r.ejecucion_scd  || 0;
  });

  const nombres = Object.keys(mapa).sort((a,b)=>a.localeCompare(b,'es'));
  const fmt    = n => (Math.round(n)).toLocaleString('es-PE');
  const fmtSol = n => n > 0 ? 'S/. ' + Math.round(n).toLocaleString('es-PE') : 'S/ 0';

  // ── Colores de bordes y celdas según destino ──────────────────────────────
  const brd   = '1px solid ' + (forWord ? '#374151' : '#cbd5e1');
  const brdSAF = '1px solid ' + (forWord ? '#374151' : '#cbd5e1');
  const brdSCD = '1px solid ' + (forWord ? '#374151' : '#cbd5e1');
  // Total row background
  const bgTotSAF = forWord ? '#d1d5db' : '#e5e7eb';
  const bgTotSCD = forWord ? '#e5e7eb' : '#f3f4f6';
  const bgTotNom = forWord ? '#e5e7eb' : '#f1f5f9';

  const tot = {familias:0,ninos_saf:0,gestantes:0,ejec_saf:0,usuarios:0,ciai:0,ejec_scd:0};
  let filas = '';
  nombres.forEach((n, idx) => {
    const m   = mapa[n];
    tot.familias  += m.familias;
    tot.ninos_saf += m.ninos_saf;
    tot.gestantes += m.gestantes;
    tot.ejec_saf  += m.ejec_saf;
    tot.usuarios  += m.usuarios;
    tot.ciai      += m.ciai;
    tot.ejec_scd  += m.ejec_scd;
    const sel  = (n === seleccionado);
    const zebra = (!sel && idx % 2 === 1) ? (forWord ? 'background:#f8fafc;' : 'background:#f8fafc;') : '';
    const rowStyle = sel ? 'background:#fef08a;font-weight:700;' : zebra;
    const tdBase = `padding:${padCell};border:${brd};font-size:${fz};`;
    filas += `<tr style="${rowStyle}">
      <td style="${tdBase}text-align:left;font-weight:${sel?'700':'600'};">${n}</td>
      <td style="${tdBase}text-align:right;">${fmt(m.familias)}</td>
      <td style="${tdBase}text-align:right;">${fmt(m.ninos_saf)}</td>
      <td style="${tdBase}text-align:right;">${fmt(m.gestantes)}</td>
      <td style="${tdBase}text-align:right;font-weight:600;">${fmtSol(m.ejec_saf)}</td>
      <td style="${tdBase}text-align:right;">${fmt(m.usuarios)}</td>
      <td style="${tdBase}text-align:right;">${fmt(m.ciai)}</td>
      <td style="${tdBase}text-align:right;font-weight:600;">${fmtSol(m.ejec_scd)}</td>
    </tr>`;
  });

  const tdTot = `padding:${padCell};font-size:${fz};font-weight:700;border:${brd};text-align:right;`;
  const totalRow = `<tr>
    <td style="${tdTot}text-align:left;background:${bgTotNom};">Total general</td>
    <td style="${tdTot}background:${bgTotSAF};">${fmt(tot.familias)}</td>
    <td style="${tdTot}background:${bgTotSAF};">${fmt(tot.ninos_saf)}</td>
    <td style="${tdTot}background:${bgTotSAF};">${fmt(tot.gestantes)}</td>
    <td style="${tdTot}background:${bgTotSAF};">${fmtSol(tot.ejec_saf)}</td>
    <td style="${tdTot}background:${bgTotSCD};">${fmt(tot.usuarios)}</td>
    <td style="${tdTot}background:${bgTotSCD};">${fmt(tot.ciai)}</td>
    <td style="${tdTot}background:${bgTotSCD};">${fmtSol(tot.ejec_scd)}</td>
  </tr>`;

  // Wrapper: para web usa card con sombra; para Word usa bloque simple sin overflow
  const wrapStart = forWord
    ? `<div style="margin-top:16px;margin-bottom:8px;width:100%;">`
    : `<div class="cobertura-card" style="margin-top:24px;background:#fff;padding:18px;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,.07);border:1px solid #e2e8f0;overflow-x:auto;grid-column:1 / -1;">`;

  return `
    ${wrapStart}
      <h3 style="font-size:${fzTitle};font-weight:700;color:${forWord?'#1e3a8a':'#1e293b'};margin-bottom:10px;margin-top:0;text-transform:uppercase;letter-spacing:.03em;">${titulo}</h3>
      <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;font-size:${fz};border:${brd};font-family:'Segoe UI',sans-serif;">
        <thead>
          <tr>
            <th rowspan="2" style="${thGray}border:${brd};padding:${padHead};text-align:center;vertical-align:middle;font-size:${fzHead};">${tituloCol}</th>
            <th colspan="4" style="${thSAF}border:${brdSAF};padding:${padHead};text-align:center;font-size:${fzHead};">Servicio de Acompañamiento a Familias</th>
            <th colspan="3" style="${thSCD}border:${brdSCD};padding:${padHead};text-align:center;font-size:${fzHead};">Servicio de Cuidado Diurno</th>
          </tr>
          <tr>
            <th style="${thSAF2}border:${brdSAF};padding:${padHead};text-align:center;font-size:${fzHead};">FAMILIAS</th>
            <th style="${thSAF2}border:${brdSAF};padding:${padHead};text-align:center;font-size:${fzHead};">NIÑAS/OS</th>
            <th style="${thSAF2}border:${brdSAF};padding:${padHead};text-align:center;font-size:${fzHead};">GESTANTES</th>
            <th style="${thSAF2}border:${brdSAF};padding:${padHead};text-align:center;font-size:${fzHead};">S/. EJECUCIÓN ACUM.</th>
            <th style="${thSCD2}border:${brdSCD};padding:${padHead};text-align:center;font-size:${fzHead};">USUARIOS</th>
            <th style="${thSCD2}border:${brdSCD};padding:${padHead};text-align:center;font-size:${fzHead};">CIAI</th>
            <th style="${thSCD2}border:${brdSCD};padding:${padHead};text-align:center;font-size:${fzHead};">S/. EJECUCIÓN ACUM.</th>
          </tr>
        </thead>
        <tbody>
          ${filas}
          ${totalRow}
        </tbody>
      </table>
    </div>
  `;
}

// ── Genera el encabezado de sección + párrafo(s) de intro ──────────────────
function generarIntroNarrativa(nivel, dep, prov, dist, d) {
  const fmt = n => (n || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });
  const fmtD = n => (n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const mesMin = (mesNombre || '').toLowerCase();
  const total = d.ejec_saf + d.ejec_scd;
  const pctSAF = total > 0 ? ((d.ejec_saf / total) * 100).toFixed(1) : '0.0';
  const pctSCD = total > 0 ? ((d.ejec_scd / total) * 100).toFixed(1) : '0.0';
  const nombre = [dep, prov, dist].filter(Boolean).join(' / ');

  let heading = nivel === 'nacional'
    ? `<h2>RESUMEN NACIONAL</h2>`
    : `<h2>${nivel.toUpperCase()}: ${nombre.toUpperCase()}</h2>`;
  let intro = '';

  if (nivel === 'nacional') {
    intro = `<p>De enero a ${mesMin} de ${año}, el <strong>Programa Nacional Cuna Más (PNCM)</strong> acumuló a nivel nacional una ejecución de <strong>S/ ${fmt(total)}</strong>, de los cuales <strong>S/ ${fmt(d.ejec_saf)} (${pctSAF}%)</strong> corresponden al <strong>Servicio de Acompañamiento a Familias (SAF)</strong> y <strong>S/ ${fmt(d.ejec_scd)} (${pctSCD}%)</strong> al <strong>Servicio de Cuidado Diurno (SCD)</strong>.</p>
    <p>La intervención alcanza <strong>${d.dist_union} de ${d.total_distritos} distritos</strong> del país (<strong>${d.pct_cobertura}%</strong>), considerando ambos servicios.</p>`;
  } else if (nivel === 'departamento') {
    intro = `<p>De enero a ${mesMin} de ${año}, el <strong>Programa Nacional Cuna Más (PNCM)</strong> acumuló en <strong>${dep}</strong> una ejecución de <strong>S/ ${fmt(total)}</strong>, de los cuales <strong>S/ ${fmt(d.ejec_saf)} (${pctSAF}%)</strong> corresponden al <strong>Servicio de Acompañamiento a Familias (SAF)</strong> y <strong>S/ ${fmt(d.ejec_scd)} (${pctSCD}%)</strong> al <strong>Servicio de Cuidado Diurno (SCD)</strong>.</p>`;
  } else if (nivel === 'provincia') {
    intro = `<p>De enero a ${mesMin} de ${año}, el <strong>Programa Nacional Cuna Más (PNCM)</strong> acumuló en la provincia de <strong>${prov}</strong>, departamento de <strong>${dep}</strong>, una ejecución de <strong>S/ ${fmt(total)}</strong>, de los cuales <strong>S/ ${fmt(d.ejec_saf)} (${pctSAF}%)</strong> corresponden al <strong>Servicio de Acompañamiento a Familias (SAF)</strong> y <strong>S/ ${fmt(d.ejec_scd)} (${pctSCD}%)</strong> al <strong>Servicio de Cuidado Diurno (SCD)</strong>.</p>
    <p>Esta inversión permitió financiar la prestación de ambos servicios, contribuyendo al desarrollo infantil temprano y al fortalecimiento de la atención brindada a niñas, niños y gestantes de la provincia.</p>`;
  } else {
    // distrito — se informan los dos servicios; nunca "S/ 0.00"
    const haySAF = d.ejec_saf > 0, haySCD = d.ejec_scd > 0;
    const ubic = `el distrito de <strong>${dist}</strong>, provincia de <strong>${prov} (${dep})</strong>`;
    if (haySAF && haySCD) {
      intro = `<p>De enero a ${mesMin} de ${año}, el <strong>Programa Nacional Cuna Más (PNCM)</strong> acumuló en ${ubic} una ejecución de <strong>S/ ${fmtD(total)}</strong>, de los cuales <strong>S/ ${fmtD(d.ejec_saf)} (${pctSAF}%)</strong> corresponden al <strong>Servicio de Acompañamiento a Familias (SAF)</strong> y <strong>S/ ${fmtD(d.ejec_scd)} (${pctSCD}%)</strong> al <strong>Servicio de Cuidado Diurno (SCD)</strong>.</p>`;
    } else if (haySAF) {
      intro = `<p>De enero a ${mesMin} de ${año}, el <strong>Programa Nacional Cuna Más (PNCM)</strong> acumuló en ${ubic} una ejecución de <strong>S/ ${fmtD(d.ejec_saf)}</strong>, correspondiente en su totalidad al <strong>Servicio de Acompañamiento a Familias (SAF)</strong>. Durante el período, el distrito no registró ejecución en el <strong>Servicio de Cuidado Diurno (SCD)</strong>.</p>`;
    } else if (haySCD) {
      intro = `<p>De enero a ${mesMin} de ${año}, el <strong>Programa Nacional Cuna Más (PNCM)</strong> acumuló en ${ubic} una ejecución de <strong>S/ ${fmtD(d.ejec_scd)}</strong>, correspondiente en su totalidad al <strong>Servicio de Cuidado Diurno (SCD)</strong>. Durante el período, el distrito no registró ejecución en el <strong>Servicio de Acompañamiento a Familias (SAF)</strong>.</p>`;
    } else {
      intro = `<p>De enero a ${mesMin} de ${año}, ${ubic} no registró ejecución presupuestal acumulada del <strong>Programa Nacional Cuna Más (PNCM)</strong> en ninguno de sus dos servicios.</p>`;
    }
  }

  return heading + intro;
}

// ── Genera los párrafos narrativos del SAF ─────────────────────────────────
// ── ACTORES COMUNALES ──────────────────────────────────────────────────────
// Padron a nivel de persona (DATOS_PNCM/mensual/ACTORES). Los conteos de bd inflan
// porque atribuyen cada comite a todos los distritos que atiende; aqui cada
// persona se cuenta una sola vez.
// OJO: el padron es de un solo corte. Si el usuario elige otro mes en el
// selector, no se usa el detalle y se cae a los valores de bd.js.
const _ROLES = ['facilitadoras','madres_cuidadoras','madres_guia','guias_familia',
                'socias_cocina','apoyo_limpieza','repartidores','apoyo_admin',
                'junta_directiva','consejo_vigilancia'];
const _ROL_TXT = {
  facilitadoras:      ['facilitadora',                              'facilitadoras'],
  madres_cuidadoras:  ['Madre Cuidadora',                           'Madres Cuidadoras'],
  madres_guia:        ['Madre Guía',                                'Madres Guía'],
  guias_familia:      ['Guía de Familia',                           'Guías de Familia'],
  socias_cocina:      ['Socia de Cocina',                           'Socias de Cocina'],
  apoyo_limpieza:     ['persona de apoyo de limpieza y vigilancia', 'personas de apoyo de limpieza y vigilancia'],
  repartidores:       ['repartidor de alimentos',                   'repartidores de alimentos'],
  apoyo_admin:        ['apoyo administrativo del Comité de Gestión','apoyos administrativos del Comité de Gestión'],
  junta_directiva:    ['miembro de la junta directiva',             'miembros de la junta directiva'],
  consejo_vigilancia: ['miembro del consejo de vigilancia',         'miembros del consejo de vigilancia']
};

// Estado de focalizacion: los datos traen "1"/"2"/"0" (no la etiqueta)
const _esFocalizado  = v => v === '1' || v === 1 || v === true || v === 'FOCALIZADO';
const _esContinuidad = v => v === '2' || v === 2 || v === 'CONTINUIDAD';

// ¿el corte elegido coincide con el periodo del padron?
function _actVigente() {
  if (!window.ACTORES) return false;
  const f = ultimaFecha instanceof Date
    ? ultimaFecha.toISOString().split('T')[0]
    : String(ultimaFecha || '').split('T')[0];
  return f === window.ACTORES.periodo;
}

// ── SERVICIOS ALIMENTARIOS ─────────────────────────────────────────────────
// Directorio por distrito (DATOS_PNCM/mensual/SA). Es un padron de un solo corte:
// si el selector apunta a otro mes, no se muestra. El campo SA_SCD de bd.js
// llega vacio en todos los cortes, asi que la cifra sale de aqui.
let _SA_IDX = null;
function _saVigente() {
  if (!window.SERVICIOS_ALIMENTARIOS) return false;
  const f = ultimaFecha instanceof Date
    ? ultimaFecha.toISOString().split('T')[0] : String(ultimaFecha).slice(0, 10);
  return f === window.SERVICIOS_ALIMENTARIOS.periodo;
}
function _saIndex() {
  if (_SA_IDX) return _SA_IDX;
  _SA_IDX = {};
  const M = window.SERVICIOS_ALIMENTARIOS;
  if (M && M.filas) {
    const C = M.campos;
    M.filas.forEach(f => {
      const o = {}; C.forEach((k, i) => o[k] = f[i]);
      (_SA_IDX[o.ubigeo] = _SA_IDX[o.ubigeo] || []).push(o);
    });
  }
  return _SA_IDX;
}
// Servicios alimentarios de una lista de ubigeos.
function saDe(ubigeos) {
  const r = { servicios: 0, cg: 0, distritos: 0, lista: [] };
  if (!_saVigente()) return r;
  const idx = _saIndex(), cg = new Set();
  (ubigeos || []).forEach(u => {
    const arr = idx[u];
    if (!arr || !arr.length) return;
    r.distritos++;
    arr.forEach(o => { r.servicios++; cg.add(o.cg_codigo); r.lista.push(o); });
  });
  r.cg = cg.size;
  r.lista.sort((a, b) => a.sa_nombre.localeCompare(b.sa_nombre, 'es'));
  return r;
}
// Frase de servicios alimentarios para la narrativa. Vacia si no hay ninguno:
// solo 399 de los 1.890 distritos cuentan con este servicio.
function _fraseSA(sa) {
  if (!sa || !sa.servicios) return '';
  const f = v => (v || 0).toLocaleString('es-PE');
  const es1 = sa.servicios === 1;
  const nombres = sa.lista.length && sa.lista.length <= 6
    ? ' (' + sa.lista.map(s => s.sa_nombre).join(', ') + ')' : '';
  const donde = sa.distritos > 1 ? ` en <strong>${f(sa.distritos)} distritos</strong>` : '';
  return `<p>La alimentación de las niñas y los niños se prepara en ` +
    `<strong>${f(sa.servicios)} ${es1 ? 'servicio alimentario' : 'servicios alimentarios'}</strong>${nombres}` +
    `${donde}, a cargo de <strong>${f(sa.cg)} ${sa.cg === 1 ? 'Comité de Gestión' : 'Comités de Gestión'}</strong>.</p>`;
}

function saNacional() {
  const M = window.SERVICIOS_ALIMENTARIOS;
  if (!_saVigente() || !M) return { servicios: 0, cg: 0, distritos: 0, lista: [] };
  return { servicios: M.filas.length,
           cg: new Set(M.filas.map(f => f[5])).size,
           distritos: new Set(M.filas.map(f => f[0])).size,
           lista: [] };
}

let _ACT_IDX = null;
// Los indices de ACTORES y SA se arman una vez por corte: al cambiar de mes
// hay que botarlos, o el mes nuevo se leeria con el padron del mes viejo.
window.AM__resetIdx = function () { _ACT_IDX = null; _SA_IDX = null; };
function _actIndex() {
  if (_ACT_IDX) return _ACT_IDX;
  _ACT_IDX = {};
  if (window.ACTORES && window.ACTORES.filas) {
    const C = window.ACTORES.campos;
    window.ACTORES.filas.forEach(f => {
      const o = {}; C.forEach((k, i) => o[k] = f[i]);
      _ACT_IDX[o.ubigeo] = o;
    });
  }
  return _ACT_IDX;
}

// Suma los actores de una lista de ubigeos. `cubiertos` = cuantos de esos
// distritos tienen detalle; si es 0 no se muestra desglose.
function actoresDe(ubigeos) {
  const r = { cubiertos: 0, total: 0, saf: { cg: 0, total: 0 }, scd: { cg: 0, total: 0 } };
  _ROLES.forEach(k => { r.saf[k] = 0; r.scd[k] = 0; });
  if (!_actVigente()) return r;
  const idx = _actIndex();
  (ubigeos || []).forEach(u => {
    const o = idx[u];
    if (!o) return;
    r.cubiertos++;
    r.saf.cg += o.saf_cg;  r.saf.total += o.saf_actores;
    r.scd.cg += o.scd_cg;  r.scd.total += o.scd_actores;
    _ROLES.forEach(k => { r.saf[k] += o['saf_' + k]; r.scd[k] += o['scd_' + k]; });
  });
  r.total = r.saf.total + r.scd.total;
  return r;
}

// Redacta los actores agrupados por función, en frases cortas.
// Evita el inventario de nueve elementos en una sola oración.
function _fraseActores(b, serv) {
  // [texto singular, texto plural, roles]
  const GRUPOS = serv === 'saf'
    ? [['El acompañamiento a las familias está a cargo de',
        'El acompañamiento a las familias está a cargo de',  ['facilitadoras']],
       ['La gestión comunal recae en',
        'La gestión comunal recae en', ['junta_directiva','consejo_vigilancia','apoyo_admin']]]
    : [['La atención cotidiana está a cargo de',
        'La atención cotidiana está a cargo de', ['madres_cuidadoras','madres_guia','guias_familia']],
       ['El soporte del servicio lo brinda',
        'El soporte del servicio lo brindan', ['socias_cocina','apoyo_limpieza','repartidores']],
       ['La gestión comunal recae en',
        'La gestión comunal recae en', ['junta_directiva','consejo_vigilancia','apoyo_admin']]];

  return GRUPOS.map(([sing, plur, roles]) => {
    const lista = _listaRoles(b, roles);
    if (!lista) return '';
    const n = roles.reduce((t, k) => t + (b[k] || 0), 0);
    return `${n === 1 ? sing : plur} ${lista}.`;
  }).filter(Boolean).join(' ');
}

// Totales nacionales de actores: se toman del padrón ya deduplicado.
// NO se suman los distritos: 559 personas trabajan en más de uno.
function actoresNacional() {
  const v = { cubiertos: 0, total: 0, saf: { cg: 0, total: 0 }, scd: { cg: 0, total: 0 } };
  _ROLES.forEach(k => { v.saf[k] = 0; v.scd[k] = 0; });
  if (!_actVigente() || !window.ACTORES.totales) return v;
  const t = window.ACTORES.totales;
  ['saf', 'scd'].forEach(sv => {
    v[sv].cg = t[sv].cg; v[sv].total = t[sv].actores;
    _ROLES.forEach(k => { v[sv][k] = t[sv][k] || 0; });
  });
  v.cubiertos = 1;
  v.total = t.personas_unicas;
  return v;
}

// "3 facilitadoras, 2 Madres Guía y 1 Socia de Cocina"
function _listaRoles(bloque, roles) {
  const presentes = roles.filter(k => bloque[k] > 0);
  // evita repetir "miembros de..." dos veces seguidas
  const juntaAntes = presentes.includes('junta_directiva');
  const partes = presentes.map(k => {
    const n = bloque[k];
    let t = _ROL_TXT[k][n === 1 ? 0 : 1];
    if (k === 'consejo_vigilancia' && juntaAntes) t = t.replace(/^miembros? /, '');
    return '<strong>' + n.toLocaleString('es-PE') + ' ' + t + '</strong>';
  });
  if (!partes.length) return '';
  if (partes.length === 1) return partes[0];
  return partes.slice(0, -1).join(', ') + ' y ' + partes[partes.length - 1];
}

function generarNarrativaSAF(nivel, d) {
  const fmt = n => (n || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });
  const mesMin = (mesNombre || '').toLowerCase();
  let p1 = '', p2 = '';

  if (nivel === 'nacional') {
    const b = actoresNacional().saf;
    p1 = `<p>Al cierre de <strong>${mesMin} de ${año}</strong>, el <strong>Servicio de Acompañamiento a Familias (SAF)</strong> atiende a <strong>${fmt(d.familias_2025)} familias</strong> en todo el país, conformadas por <strong>${fmt(d.niños_saf)} niñas y niños</strong> y <strong>${fmt(d.gestantes_SAF)} gestantes</strong>. La cobertura llega a <strong>${fmt(d.dist_saf)} distritos</strong> (<strong>${d.pct_saf}%</strong> del país) en <strong>${fmt(d.prov_saf)} provincias</strong> de <strong>${d.dep_saf} departamentos</strong>.</p>`;
    p2 = b.total
      ? `<p>El servicio se sostiene con <strong>${fmt(b.cg)} Comités de Gestión</strong>. ` + _fraseActores(b, 'saf') +
        ` En conjunto, <strong>${fmt(b.total)} actores comunales</strong> participan en la prestación del servicio.</p>`
      : '';
  } else if (nivel === 'departamento') {
    p1 = `<p>Al cierre de <strong>${mesMin} de ${año}</strong>, el <strong>Servicio de Acompañamiento a Familias (SAF)</strong> alcanza una cobertura de <strong>${fmt(d.familias_2025)} familias</strong>. Entre sus integrantes se encuentran <strong>${fmt(d.niños_saf)} niñas y niños</strong> y <strong>${fmt(d.gestantes_SAF)} gestantes</strong>, quienes reciben atención y acompañamiento a través de la intervención del programa.</p>`;
    p2 = `<p>Esta cobertura se extiende a <strong>${d.dist_saf} distritos</strong>, distribuidos en <strong>${d.prov_saf} provincias</strong>, reflejando el alcance territorial del servicio y su contribución al desarrollo integral de la primera infancia y la atención de gestantes en los ámbitos de intervención.</p>`;
  } else if (nivel === 'provincia') {
    p1 = `<p>Al cierre de <strong>${mesMin} de ${año}</strong>, el <strong>Servicio de Acompañamiento a Familias (SAF)</strong> alcanza una cobertura de <strong>${fmt(d.familias_2025)} familias</strong> en la provincia. Esta población está conformada por <strong>${fmt(d.niños_saf)} niñas y niños</strong> y <strong>${fmt(d.gestantes_SAF)} gestantes</strong>, quienes reciben atención y acompañamiento a través de la intervención del programa.</p>`;
    p2 = `<p>La prestación del servicio tiene presencia en los <strong>${d.dist_saf} distritos de la provincia</strong>, contribuyendo al fortalecimiento del desarrollo infantil temprano y a la atención integral de las familias usuarias.</p>`;
  } else if ((d.familias_2025 || 0) === 0) {
    // distrito sin cobertura SAF — no enumerar ceros
    p1 = `<p>Al cierre de <strong>${mesMin} de ${año}</strong>, el distrito no registra atención ni cobertura a través del <strong>Servicio de Acompañamiento a Familias (SAF)</strong>. En consecuencia, no cuenta con familias usuarias, <strong>Comités de Gestión</strong> ni <strong>facilitadoras</strong> vinculados a este servicio.</p>`;
    const haySCD = (d.niños_2025 || 0) > 0 || (d.CIAI_SCD || 0) > 0;
    const focSAF = _esFocalizado(d.CUMPLE_SAF);
    if (haySCD) {
      p2 = `<p>${focSAF ? 'Si bien el distrito se encuentra focalizado para la implementación del SAF, durante' : 'Durante'} el período evaluado no se ha iniciado la prestación de este servicio, por lo que la intervención del <strong>Programa Nacional Cuna Más (PNCM)</strong> se desarrolla exclusivamente a través del <strong>Servicio de Cuidado Diurno (SCD)</strong>.</p>`;
    } else if (focSAF) {
      p2 = `<p>El distrito se encuentra focalizado para la implementación del SAF; durante el período evaluado aún no se ha iniciado la prestación del servicio.</p>`;
    }
  } else {
    // distrito
    const _g = d.gestantes_SAF || 0;
    const _comp = _g > 0
      ? `<strong>${fmt(d.niños_saf)} ${d.niños_saf === 1 ? 'niña o niño' : 'niñas y niños'}</strong> y <strong>${fmt(_g)} ${_g === 1 ? 'gestante' : 'gestantes'}</strong>`
      : `<strong>${fmt(d.niños_saf)} ${d.niños_saf === 1 ? 'niña o niño' : 'niñas y niños'}</strong>, sin gestantes registradas en el período`;
    p1 = `<p>Al cierre de <strong>${mesMin} de ${año}</strong>, el <strong>Servicio de Acompañamiento a Familias (SAF)</strong> alcanza una cobertura de <strong>${fmt(d.familias_2025)} ${d.familias_2025 === 1 ? 'familia' : 'familias'}</strong> en el distrito. Esta población está conformada por ${_comp}, quienes reciben atención y acompañamiento a través de la intervención del programa.</p>`;
    const ac = actoresDe(d.ubigeos), b = ac.saf;
    if (ac.cubiertos && b.total) {
      p2 = `<p>La prestación del servicio se organiza en torno a <strong>${b.cg} ${b.cg === 1 ? 'Comité de Gestión' : 'Comités de Gestión'}</strong>. ` +
           _fraseActores(b, 'saf') +
           ` En conjunto, <strong>${fmt(b.total)} ${b.total === 1 ? 'actor comunal sostiene' : 'actores comunales sostienen'}</strong> el acompañamiento a las familias usuarias del distrito.</p>`;
    } else {
      p2 = `<p>La prestación del servicio se desarrolla con la participación de <strong>${d.CG_SAF} ${d.CG_SAF === 1 ? 'Comité' : 'Comités'} de Gestión</strong> y <strong>${d.FACILITADOR_SAF} ${d.FACILITADOR_SAF === 1 ? 'facilitadora' : 'facilitadoras'}</strong>, actores clave que contribuyen a la implementación de las actividades y al acompañamiento de las familias usuarias en el territorio.</p>`;
    }
  }

  return `<h3 style="color:#374151;margin-top:14px;margin-bottom:5px;">🔴 Servicio de Acompañamiento a Familias (SAF)</h3>${p1}${p2}`;
}

// ── Genera los párrafos narrativos del SCD ─────────────────────────────────
function generarNarrativaSCD(nivel, d) {
  const fmt = n => (n || 0).toLocaleString('es-PE', { maximumFractionDigits: 0 });
  const mesMin = (mesNombre || '').toLowerCase();
  let p1 = '', p2 = '';

  const sinCobertura = d.niños_2025 === 0 && d.CIAI_SCD === 0;

  if (nivel === 'nacional') {
    const b = actoresNacional().scd;
    p1 = `<p>Al cierre de <strong>${mesMin} de ${año}</strong>, el <strong>Servicio de Cuidado Diurno (SCD)</strong> atiende a <strong>${fmt(d.niños_2025)} niñas y niños</strong> en <strong>${fmt(d.CIAI_SCD)} Centros Infantiles de Atención Integral (CIAI)</strong>, con presencia en <strong>${fmt(d.dist_scd)} distritos</strong> (<strong>${d.pct_scd}%</strong> del país) de <strong>${fmt(d.prov_scd)} provincias</strong> en <strong>${d.dep_scd} departamentos</strong>.</p>`;
    p2 = b.total
      ? `<p>El servicio se sostiene con <strong>${fmt(b.cg)} Comités de Gestión</strong>. ` + _fraseActores(b, 'scd') +
        ` En conjunto, <strong>${fmt(b.total)} actores comunales</strong> participan en la prestación del servicio.</p>`
      : '';
    p2 += _fraseSA(saNacional());
  } else if (nivel === 'departamento') {
    p1 = `<p>Por su parte, al cierre de <strong>${mesMin} de ${año}</strong>, el <strong>Servicio de Cuidado Diurno (SCD)</strong> alcanza una cobertura de <strong>${fmt(d.niños_2025)} niñas y niños</strong>, quienes reciben atención integral en espacios especialmente acondicionados para promover su desarrollo y bienestar.</p>`;
    p2 = `<p>Para la prestación de este servicio, se cuenta con <strong>${d.CIAI_SCD} Centros Infantiles de Atención Integral (CIAI)</strong>, con presencia en <strong>${d.dist_scd} distritos</strong> distribuidos en <strong>${d.prov_scd} provincias</strong>, lo que permite acercar la atención a las familias de los ámbitos de intervención del programa.</p>`;
  } else if (nivel === 'provincia') {
    p1 = `<p>Al cierre de <strong>${mesMin} de ${año}</strong>, el <strong>Servicio de Cuidado Diurno (SCD)</strong> brinda atención a <strong>${fmt(d.niños_2025)} niñas y niños</strong> en la provincia, a través de espacios orientados a promover su cuidado, aprendizaje y desarrollo integral.</p>`;
    p2 = `<p>Para la prestación de este servicio, se cuenta con <strong>${d.CIAI_SCD} Centros Infantiles de Atención Integral (CIAI)</strong>, con presencia en <strong>${d.dist_scd} distritos de la provincia</strong>, lo que permite acercar la atención a las familias de los ámbitos de intervención.</p>`;
  } else {
    // distrito
    if (sinCobertura) {
      const focSCD  = _esFocalizado(d.CUMPLE_SCD);
      const contSCD = _esContinuidad(d.CUMPLE_SCD);
      const haySAF  = (d.familias_2025 || 0) > 0;
      p1 = `<p>Al cierre de <strong>${mesMin} de ${año}</strong>, el distrito no registra atención ni cobertura a través del <strong>Servicio de Cuidado Diurno (SCD)</strong>. En consecuencia, no cuenta con niñas y niños usuarios, <strong>Centros Infantiles de Atención Integral (CIAI)</strong>, <strong>Comités de Gestión</strong> ni <strong>Madres Cuidadoras</strong> vinculados a este servicio.</p>`;
      const estado = focSCD  ? 'Si bien el distrito se encuentra focalizado para la implementación del SCD, durante'
                   : contSCD ? 'Si bien el distrito se encuentra en continuidad para el SCD, durante'
                   :           'Durante';
      // solo se afirma "exclusivamente a través del SAF" si el SAF realmente opera
      if (haySAF) {
        p2 = `<p>${estado} el período evaluado no se ha iniciado la prestación de este servicio, por lo que la intervención del <strong>Programa Nacional Cuna Más (PNCM)</strong> se desarrolla exclusivamente a través del <strong>Servicio de Acompañamiento a Familias (SAF)</strong>.</p>`;
      } else if (focSCD || contSCD) {
        p2 = `<p>${estado} el período evaluado aún no se ha iniciado la prestación del servicio en el distrito.</p>`;
      } else {
        p2 = '';
      }
    } else {
      p1 = `<p>Al cierre de <strong>${mesMin} de ${año}</strong>, el <strong>Servicio de Cuidado Diurno (SCD)</strong> brinda atención a <strong>${fmt(d.niños_2025)} niñas y niños</strong> en el distrito, a través de espacios orientados a promover su cuidado, aprendizaje y desarrollo integral.</p>`;
      const ac = actoresDe(d.ubigeos), b = ac.scd;
      if (ac.cubiertos && b.total) {
        p2 = `<p>Para la prestación de este servicio se cuenta con <strong>${d.CIAI_SCD} ${d.CIAI_SCD === 1 ? 'Centro Infantil' : 'Centros Infantiles'} de Atención Integral (CIAI)</strong> y <strong>${b.cg} ${b.cg === 1 ? 'Comité de Gestión' : 'Comités de Gestión'}</strong>. ` +
             _fraseActores(b, 'scd') +
             ` En conjunto, <strong>${fmt(b.total)} ${b.total === 1 ? 'actor comunal sostiene' : 'actores comunales sostienen'}</strong> la atención cotidiana de las niñas y los niños usuarios.</p>`;
        p2 += _fraseSA(saDe(d.ubigeos));
      } else {
        p2 = `<p>Para la prestación de este servicio, se cuenta con <strong>${d.CIAI_SCD} ${d.CIAI_SCD === 1 ? 'Centro Infantil' : 'Centros Infantiles'} de Atención Integral (CIAI)</strong> y <strong>${d.CG_SCD} ${d.CG_SCD === 1 ? 'Comité' : 'Comités'} de Gestión</strong>, con el apoyo de <strong>${d.MadresCuidadoras_SCD} ${d.MadresCuidadoras_SCD === 1 ? 'Madre Cuidadora' : 'Madres Cuidadoras'}</strong> que garantizan la atención cotidiana de las niñas y los niños usuarios.</p>`;
        p2 += _fraseSA(saDe(d.ubigeos));
      }
    }
  }

  return `<h3 style="color:#374151;margin-top:14px;margin-bottom:5px;">🟢 Servicio de Cuidado Diurno (SCD)</h3>${p1}${p2}`;
}

// ── Bloque cobertura territorial para un nivel (dep/prov) ─────────────────
function generarBloqueTerritorioNivel(nivel, dep, prov, resumen) {
  const ultimaFechaStr = ultimaFecha.toISOString().split('T')[0];
  const datos = dataset.filter(d => d.fecha === ultimaFechaStr);
  const fN = n => (n||0).toLocaleString('es-PE');

  // Total distritos en el ámbito
  let totalDistAmbito, labelAmbito;
  if (nivel === 'departamento') {
    const allDist = new Set(datos.filter(d => d.departamento === dep).map(d => d.ubigeo));
    totalDistAmbito = allDist.size;
    labelAmbito = dep;
  } else {
    const allDist = new Set(datos.filter(d => d.departamento === dep && d.provincia === prov).map(d => d.ubigeo));
    totalDistAmbito = allDist.size;
    labelAmbito = prov;
  }
  if (totalDistAmbito === 0) return '';

  const pctSAF = ((resumen.dist_saf / totalDistAmbito) * 100).toFixed(1);
  const pctSCD = ((resumen.dist_scd / totalDistAmbito) * 100).toFixed(1);
  // Unión real: un distrito con SAF y SCD cuenta una vez (antes se sumaban).
  const enAmbito = d => d.departamento === dep && (nivel === 'departamento' || d.provincia === prov);
  const distUnion = new Set(datos.filter(d => enAmbito(d) && (d.nfamilia_saf > 0 || d.nniños_scd > 0))
                                 .map(d => d.ubigeo)).size;
  const pctUnion  = ((distUnion / totalDistAmbito) * 100).toFixed(1);

  return `
    <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;margin:10px 0 14px 0;border:none;">
      <tr>
        <td style="width:38%;padding:0 12px 0 0;vertical-align:top;border:none;">
          <div style="border-top:3px solid #374151;padding:11px 13px;background:#f9fafb;text-align:center;">
            <div style="font-size:6.5pt;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;">Cobertura territorial</div>
            <div style="font-size:26pt;font-weight:800;color:#111827;line-height:1;">${pctUnion}%</div>
            <div style="font-size:7pt;color:#6b7280;margin-top:2px;line-height:1.2;">${fN(distUnion)} de ${fN(totalDistAmbito)} distritos<br><span style="font-size:6pt;color:#9ca3af;font-style:italic;">${labelAmbito}</span></div>
          </div>
        </td>
        <td style="width:31%;padding:0 12px 0 0;vertical-align:top;border:none;">
          <div style="border-top:3px solid #6b7280;padding:11px 12px;background:#f9fafb;text-align:center;">
            <div style="font-size:6.5pt;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;">SAF — Presencia</div>
            <div style="font-size:20pt;font-weight:800;color:#374151;line-height:1;">${pctSAF}%</div>
            <div style="font-size:7.5pt;color:#6b7280;margin-top:2px;"><strong style="color:#111827;">${fN(resumen.dist_saf)}</strong> distritos con SAF</div>
          </div>
        </td>
        <td style="width:31%;padding:0;vertical-align:top;border:none;">
          <div style="border-top:3px solid #9ca3af;padding:11px 12px;background:#f9fafb;text-align:center;">
            <div style="font-size:6.5pt;color:#9ca3af;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px;">SCD — Presencia</div>
            <div style="font-size:20pt;font-weight:800;color:#374151;line-height:1;">${pctSCD}%</div>
            <div style="font-size:7.5pt;color:#6b7280;margin-top:2px;"><strong style="color:#111827;">${fN(resumen.dist_scd)}</strong> distritos con SCD</div>
          </div>
        </td>
      </tr>
    </table>`;
}

// ── Tarjetas KPI (reemplaza generarTablaSAF/SCD en Word) ───────────────────
function generarTarjetasKPI(d, nivel, servicio) {
  const nivelDist  = nivel === 'distrito';
  // misma fuente que la pantalla: el directorio, no el campo vacio de bd.js
  const _saT = d.esNacional ? saNacional() : saDe(d.ubigeos);
  const nivelDep   = nivel === 'departamento';
  const fN = n => (n||0).toLocaleString('es-PE');
  const fS = n => 'S/. '+Math.round(n||0).toLocaleString('es-PE');
  const mesMin = (mesNombre||'').toLowerCase();

  const W = 'padding:4px;vertical-align:top;';
  const K = 'border-top:2px solid #d1d5db;padding:8px 10px 7px;text-align:center;background:#fafafa;';
  const KL= 'font-size:6.5pt;color:#6b7280;text-transform:uppercase;letter-spacing:.03em;margin-bottom:3px;';
  const KV= 'font-size:13pt;font-weight:700;color:#111827;line-height:1;';
  const KS= 'font-size:6pt;color:#9ca3af;margin-top:2px;';
  const KE= 'font-size:9pt;font-weight:700;color:#374151;line-height:1.2;';
  const card = (lbl, val, sub='', exec=false) =>
    `<td style="${W}"><div style="${K}"><div style="${KL}">${lbl}</div><div style="${exec?KE:KV}">${val}</div>${sub?`<div style="${KS}">${sub}</div>`:''}</div></td>`;

  // mismos actores que la narrativa y las tarjetas de pantalla
  const _ac  = d.esNacional ? actoresNacional() : actoresDe(d.ubigeos);
  const _okS = _ac.cubiertos && _ac.saf.total;
  const _okD = _ac.cubiertos && _ac.scd.total;

  if (servicio === 'SAF') {
    const cols = nivelDist
      ? [card('Familias', fN(d.familias_2025), 'beneficiarias'),
         card('Niñas/os', fN(d.niños_saf)),
         card('Gestantes', fN(d.gestantes_SAF)),
         card('Com. Gestión', String(_okS ? _ac.saf.cg : d.CG_SAF)),
         card('Facilitadoras', fN(_okS ? _ac.saf.facilitadoras : d.FACILITADOR_SAF)),
         card('Ejecución', fS(d.ejec_saf), 'ene–'+mesMin+' '+año, true)]
      : [card('Familias', fN(d.familias_2025), 'beneficiarias'),
         card('Niñas/os', fN(d.niños_saf)),
         card('Gestantes', fN(d.gestantes_SAF)),
         card('Distritos', String(d.dist_saf), 'con atención'),
         nivelDep ? card('Provincias', String(d.prov_saf)) : '',
         card('Ejecución', fS(d.ejec_saf), 'ene–'+mesMin+' '+año, true)];
    return `<table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;border:none;margin:6px 0 12px 0;"><tr>${cols.join('')}</tr></table>`;
  } else {
    const focRow = nivelDist && d.CUMPLE_SCD != null
      ? card('Focalización', getEtiquetaFocalizacion(d.CUMPLE_SCD).emoji+' '+getEtiquetaFocalizacion(d.CUMPLE_SCD).texto)
      : '';
    const cols = nivelDist
      ? [card('Niñas/os', fN(d.niños_2025), 'usuarios'),
         card('CIAI', fN(d.CIAI_SCD)),
         (_saT.servicios ? card('Serv. alim.', fN(_saT.servicios)) : ''),
         card('Com. Gestión', String(_okD ? _ac.scd.cg : d.CG_SCD)),
         card('Madres Cuid.', fN(_okD ? _ac.scd.madres_cuidadoras : d.MadresCuidadoras_SCD)),
         card('Ejecución', fS(d.ejec_scd), 'ene–'+mesMin+' '+año, true),
         focRow]
      : [card('Niñas/os', fN(d.niños_2025), 'usuarios'),
         card('CIAI', fN(d.CIAI_SCD)),
         (_saT.servicios ? card('Serv. alim.', fN(_saT.servicios)) : ''),
         card('Distritos', String(d.dist_scd), 'con atención'),
         nivelDep ? card('Provincias', String(d.prov_scd)) : '',
         card('Ejecución', fS(d.ejec_scd), 'ene–'+mesMin+' '+año, true),
         ''];
    return `<table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;border:none;margin:6px 0 12px 0;"><tr>${cols.join('')}</tr></table>`;
  }
}

// Sección de Centro Poblado para el documento Word (solo datos del CCPP)
function generarSeccionCCPPWord(c) {
  const fN  = n => (n || 0).toLocaleString('es-PE');
  const txt = textoCCPP(c);

  let html = `<div class="page-break"></div>`;
  html += `<h2>Centro Poblado: ${c.nombre}</h2>`;
  html += `<p class="subtitulo-ubicacion">Cód. CCPP ${c.codigo}${c.ut ? ' · ' + c.ut : ''} · ${mesNombre} ${año}</p>`;

  // SAF
  html += `<h3>Servicio de Acompañamiento a Familias (SAF)</h3>`;
  if (c.saf) {
    html += `<p>${txt.saf}</p>`;
    html += `<table>
      <tr><th>Familias</th><th>Gestantes</th><th>Niñas y niños</th><th>Usuarios</th>${c.saf.fac != null ? '<th>Facilitadoras (presencia)</th>' : ''}</tr>
      <tr><td>${fN(c.saf.familias)}</td><td>${fN(c.saf.gestantes)}</td><td>${fN((c.saf.ninoV||0)+(c.saf.ninaM||0))}</td><td>${fN(c.saf.usuarios)}</td>${c.saf.fac != null ? `<td>${fN(c.saf.fac)}</td>` : ''}</tr>
    </table>`;
  } else {
    html += `<p><em>Sin atención SAF en este centro poblado.</em></p>`;
  }

  // SCD
  html += `<h3>Servicio de Cuidado Diurno (SCD)</h3>`;
  if (c.scd) {
    html += `<p>${txt.scd}</p>`;
    html += `<table>
      <tr><th>Usuarios</th><th>Niños</th><th>Niñas</th>${c.scd.madres != null ? '<th>Madres Cuidadoras</th>' : ''}${c.scd.locales != null ? '<th>Locales</th>' : ''}</tr>
      <tr><td>${fN(c.scd.usuarios)}</td><td>${fN(c.scd.varones)}</td><td>${fN(c.scd.mujeres)}</td>${c.scd.madres != null ? `<td>${fN(c.scd.madres)}</td>` : ''}${c.scd.locales != null ? `<td>${fN(c.scd.locales)}</td>` : ''}</tr>
    </table>`;
  } else {
    html += `<p><em>Sin atención SCD en este centro poblado.</em></p>`;
  }

  return html;
}

async function exportarWord(opts = {}) {
  if (!opts.soloHTML) await asegurarLibs(['filesaver']);
  await asegurarLibs(['logo']);
  const logoBase64 = LOGO_BASE64;
  const d = window.ultimoResultado;
  if (!d) return alert('Primero realice una consulta.');
  if (d._esEspecial) return alert('En ámbito especial solo se genera Excel.');

  const dep = d.departamento;
  const prov = d.provincia;
  const dist = d.distrito;

  const nombreUbicacion = dep ? [dep] : ['NACIONAL'];
  if (prov) nombreUbicacion.push(prov);
  if (dist) nombreUbicacion.push(dist);
  const encabezadoUbicacion = `(${nombreUbicacion.join(' / ')})`;

  let contenido = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <style>
        @page Section1 {
          size: 21.0cm 29.7cm;
          margin: 1.2cm 1.8cm 1.0cm 1.8cm;
          mso-header: h1;
          mso-footer: f1;
          mso-header-margin: .15cm;
          mso-footer-margin: .4cm;
        }
        div.Section1 { page: Section1; }
        @page {
          size: 21.0cm 29.7cm;
          margin: 1.2cm 1.8cm 1.0cm 1.8cm;
        }
        body {
          font-family: 'Segoe UI', sans-serif;
          font-size: 10pt;
          color: #333333;
          margin: 0;
          line-height: 1.55;
        }
        h1 {
          font-size: 13pt;
          font-weight: bold;
          margin-top: 6px;
          margin-bottom: 2px;
          text-align: center;
          color: #1e293b;
        }
        .subtitulo-ubicacion {
          text-align: center;
          color: #6b7280;
          font-size: 8.5pt;
          margin-top: 0;
          margin-bottom: 10px;
        }
        h2 {
          font-size: 10.5pt;
          font-weight: bold;
          color: #374151;
          text-transform: uppercase;
          margin-top: 16px;
          margin-bottom: 8px;
          padding-bottom: 2px;
          border-bottom: 1px solid #9ca3af;
        }
        h3 {
          font-size: 9.5pt;
          font-weight: bold;
          color: #374151;
          margin-top: 12px;
          margin-bottom: 4px;
        }
        p {
          margin-top: 0;
          margin-bottom: 6px;
          text-align: justify;
          font-size: 9.5pt;
        }
        table { border-collapse: collapse; margin-top: 6px; margin-bottom: 8px; width: 100%; font-size: 8.5pt; }
        th { border: 1px solid #d1d5db; text-align: center; background-color: #f3f4f6; padding: 3px 5px; font-size: 8.5pt; color: #374151; }
        td { border: 1px solid #d1d5db; text-align: center; padding: 3px 5px; }
        tr.fila-destacada td { background-color: #fef9c3; font-weight: bold; }
        tr.fila-total td { background-color: #f3f4f6; font-weight: bold; }
        .footer {
          font-size: 7.5pt;
          color: #9ca3af;
          text-align: center;
          margin-top: 16px;
          border-top: 1px solid #e5e7eb;
          padding-top: 6px;
          line-height: 1.4;
        }
        .logo { width: 380px; margin-bottom: 3px; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <!--[if gte mso 9]><xml>
       <w:WordDocument>
        <w:View>Normal</w:View>
        <w:Zoom>0</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
       </w:WordDocument>
      </xml><![endif]-->
      <div style="mso-element:header" id="h1">
        <div style="text-align:center;padding-bottom:5px;border-bottom:2px solid #1e3a8a;font-family:'Segoe UI',sans-serif;line-height:1.4;">
          <div><img src="${logoBase64}" alt="MIDIS-PNCM" style="width:55px;height:auto;"></div>
          <div style="font-size:12pt;font-weight:700;color:#1e3a8a;margin-top:3px;">AYUDA MEMORIA PNCM — ${mesNombre} ${año}</div>
          <div style="font-size:8.5pt;color:#374151;font-weight:600;text-transform:uppercase;letter-spacing:.03em;margin-top:1px;">${[dep, prov, dist].filter(Boolean).join(' / ')}</div>
        </div>
      </div>
      <div class="Section1">
  `;


  // ── RESUMEN NACIONAL ──
  const resumenNac = calcularResumenNacional();
  contenido += generarPrologo();
  contenido += generarResumenNacional(resumenNac);
  contenido += `<div class="page-break"></div>`;

  // Tabla cobertura nacional → aquí, después de tarjetas nacionales (punto 4)
  contenido += generarTablaCobertura('departamento', dep, prov, dist, {forWord:true});

  // ── DEPARTAMENTO ── (la vista nacional termina en la tabla de arriba)
  if (dep) {
  const resumenDep = calcularResumen(dep);
  contenido += `<div class="page-break"></div>`;
  contenido += generarIntroNarrativa('departamento', dep, null, null, resumenDep);
  contenido += generarBloqueTerritorioNivel('departamento', dep, null, resumenDep);
  contenido += generarNarrativaSAF('departamento', resumenDep);
  contenido += generarTarjetasKPI(resumenDep, 'departamento', 'SAF');
  contenido += generarNarrativaSCD('departamento', resumenDep);
  contenido += generarTarjetasKPI(resumenDep, 'departamento', 'SCD');
  // Tabla cobertura provincial → después de tarjetas departamento (punto 5)
  if (prov) contenido += generarTablaCobertura('provincia', dep, prov, dist, {forWord:true});
  }

  // ── PROVINCIA ──
  if (prov) {
    contenido += `<div class="page-break"></div>`;
    const resumenProv = calcularResumen(dep, prov);
    contenido += generarIntroNarrativa('provincia', dep, prov, null, resumenProv);
    contenido += generarBloqueTerritorioNivel('provincia', dep, prov, resumenProv);
    contenido += generarNarrativaSAF('provincia', resumenProv);
    contenido += generarTarjetasKPI(resumenProv, 'provincia', 'SAF');
    contenido += generarNarrativaSCD('provincia', resumenProv);
    contenido += generarTarjetasKPI(resumenProv, 'provincia', 'SCD');
    // Tabla cobertura distrital → después de tarjetas provincia (punto 6)
    if (dist) contenido += generarTablaCobertura('distrito', dep, prov, dist, {forWord:true});
  }

  // ── DISTRITO ──
  if (dist) {
    contenido += `<div class="page-break"></div>`;
    const resumenDist = calcularResumen(dep, prov, dist);
    contenido += generarIntroNarrativa('distrito', dep, prov, dist, resumenDist);
    contenido += generarNarrativaSAF('distrito', resumenDist);
    contenido += generarTarjetasKPI(resumenDist, 'distrito', 'SAF');
    contenido += generarNarrativaSCD('distrito', resumenDist);
    contenido += generarTarjetasKPI(resumenDist, 'distrito', 'SCD');

    // ── CENTRO POBLADO (si se seleccionó) ──
    if (d.ccpp) contenido += generarSeccionCCPPWord(d.ccpp);
  }

    // Footer: línea + tabla 3 columnas (texto | vacío | paginado)
  contenido += `
      </div>
      <div style="mso-element:footer" id="f1">
        <hr style="border:none;border-top:1px solid #d1d5db;margin:0 0 4px 0;">
        <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;background:#f8f9fa;border-radius:3px;border:none;">
          <tr>
            <td style="padding:6px 12px;font-size:7pt;color:#6b7280;line-height:1.7;width:76%;vertical-align:middle;border:none;text-align:left;">
              ${buildFooterLine(_generadoALas())}
            </td>
            <td style="width:4%;border:none;"></td>
            <td style="padding:6px 14px 6px 0;font-size:9pt;font-weight:700;color:#374151;text-align:right;white-space:nowrap;vertical-align:middle;width:20%;border:none;letter-spacing:.01em;">
              Página&nbsp;<span style="mso-field-code:'PAGE \* MERGEFORMAT'">1</span>&nbsp;de&nbsp;<span style="mso-field-code:'NUMPAGES \* MERGEFORMAT'">1</span>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  const ccppSufijo = d.ccpp ? '_CP_' + d.ccpp.nombre.replace(/\s+/g, '_') : '';
  const base = `AM_${(dep||'Nacional').replace(/\s+/g, '_')}${prov ? '_' + prov.replace(/\s+/g, '_') : ''}${dist ? '_' + dist.replace(/\s+/g, '_') : ''}${ccppSufijo}_${mesNombre}_${año}`;

  if (opts.soloHTML) return { html: contenido, base };
  registrarStat('word');
  saveAs(new Blob([contenido], { type: 'application/msword' }), base + '.doc');
}

// ── Arranque: panorama nacional apenas carga la página ──
try { mostrarResumenNacional(); } catch (e) { console.warn('Resumen nacional:', e.message); }
try {
  resumirFiltros();
  if (window.matchMedia('(max-width:820px)').matches) toggleFiltros(false);
} catch (e) { console.warn('Filtros:', e.message); }

// Los cortes históricos se cargan al elegirlos en el selector.
