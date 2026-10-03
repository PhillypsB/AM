(function(){
  const C = window.AM_CAMPOS, GEO = C.geo, NUM = C.num, nN = NUM.length;
  window.AM_DATA = [];
  // Rehidrata un mes al formato de registros que usa el resto de la app.
  // No se llama desde aqui: la llama cada mensual/BD/m_YYYYMM.js al final.
  window.AM_cargarMes = function (m) {
    const g = m.g, a = m.a, b = m.b, out = window.AM_DATA;
    for (let i = 0; i < m.r.length; i++) {
      const r = m.r[i], t = g[r[0]], o = {};
      for (let k = 0; k < GEO.length; k++) o[GEO[k]] = t[k];
      for (let k = 0; k < nN; k++) o[NUM[k]] = r[k + 1];
      o.fecha = m.f;
      o.CUMPLE_SAF = a[r[nN + 1]];
      o.CUMPLE_SCD = b[r[nN + 2]];
      out.push(o);
    }
  };
  const meses  = window.AM_MESES;
  const pedido = new URLSearchParams(location.search).get('corte');
  const sel    = meses.find(m => m.f === pedido) || meses[meses.length - 1];
  window.AM_CORTE_SEL  = sel.f;
  window.AM_EN_MEMORIA = new Set([sel.f]);   // cortes ya rehidratados
  window.AM_PEDIDOS    = {};                 // descargas en curso
})();
