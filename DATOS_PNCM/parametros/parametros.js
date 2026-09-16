/* parametros.js — cifras del PNCM que NO vienen en el padrón mensual.
   Único lugar donde se escriben. Lo leen las aplicaciones con
   <script src="../DATOS_PNCM/parametros/parametros.js">.

   Reglas
   - Un valor que no se conoce va en null. La aplicación lo muestra como «—»;
     nunca toma el de otro año.
   - Cada cambio lleva su fuente en el comentario de al lado y una línea en el
     historial de DATOS_PNCM/LEEME.md.
   - Se edita a mano: es el único archivo de DATOS_PNCM que no genera una
     herramienta. Después de editarlo, correr herramientas/verificar.js. */
window.PNCM_PARAMETROS = {

  // Fuente que se imprime en los pies de pantalla, Word y Excel.
  fuente: 'Padrones oficiales UOAI',

  // Año cuyas metas y población objetivo valen para los cortes sin año propio.
  anio_vigente: 2026,

  // ── Metas POI, población objetivo y PIM, por año ──────────────────────────
  anual: {
    2025: {
      saf: { meta: null,   poblacion_objetivo: 601141, pim: null },
      scd: { meta: null,   poblacion_objetivo: 281334, pim: null }
      // PO 2025: Web_UPPM (PO_ANUAL) y data/poblacion_objetivo.js (distrital).
      // Metas 2025: no registradas aquí todavía.
    },
    2026: {
      saf: { meta: 277283, poblacion_objetivo: 582652, pim: null },
      scd: { meta: 67387,  poblacion_objetivo: 327985, pim: null }
      // PO 2026: indicada por el usuario el 2026-09-16 (reemplaza 607,215 / 287,259).
      // Metas POI 2026: las mismas de COBERTURA_PNCM y Web_UPPM.
      // PIM: mientras esté en null, el PPT muestra «XX» resaltado.
    }
  },

  // Distritos oficiales del país (INEI). Es el denominador de la «cobertura
  // territorial». El padrón mensual trae 1,890: el que falta no tiene registro.
  total_distritos_peru: 1891,

  // ── Totales oficiales por corte (reporte UPPM) ────────────────────────────
  // Comités de gestión, facilitadoras y madres cuidadoras se cuentan doble al
  // sumar distritos: un actor que atiende dos distritos aparece en los dos.
  // Estas son las cifras del reporte. Se usan a nivel nacional cuando el corte
  // no tiene padrón de actores (mensual/ACTORES). 'distritos' = distritos con
  // atención efectiva del propio padrón (nfamilia_saf > 0 / nniños_scd > 0).
  totales_oficiales: {
    '2026-05-31': {
      saf: { cg: 2402, facilitadoras: 27855 },
      scd: { cg: 656,  madres: 10257 }
    },
    '2026-07-31': {
      saf: { cg: 2404, facilitadoras: 27865, distritos: 1420 },
      scd: { cg: 657,  madres: 10380,        distritos: 535 }
    },
    '2026-08-31': {
      saf: { cg: 2403, facilitadoras: 27875, distritos: 1395 },
      scd: { cg: 656,  madres: 10341,        distritos: 542 }
    }
  }
};
