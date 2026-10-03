
var dataset = window.AM_DATA;
// Cada insumo de corte unico queda guardado bajo su propio periodo, para que
// cambiar de mes no deje colgados los datos del mes anterior.
window.ACT_STORE = {}; window.SA_STORE = {};
if (window.ACTORES && window.ACTORES.periodo)
  window.ACT_STORE[window.ACTORES.periodo] = window.ACTORES;
if (window.SERVICIOS_ALIMENTARIOS && window.SERVICIOS_ALIMENTARIOS.periodo)
  window.SA_STORE[window.SERVICIOS_ALIMENTARIOS.periodo] = window.SERVICIOS_ALIMENTARIOS;
