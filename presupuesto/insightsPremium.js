// =======================================================
// zaZA PRESUPUESTO — insightsPremium.js
// Motor de Insights Inteligentes v2 (10 insights)
// =======================================================

// -------------------------------------------------------
// CONFIGURACIÓN POR DEFECTO (El presupuestólogo ajusta)
// -------------------------------------------------------

const CONFIG_UMBRALES = {
  // Restricciones
  restriccionDominante: 0.15,      // 15% del PIM
  restriccionCritica: 0.40,        // 40% de partida
  umbralRedistribucion: 0.40,      // Partida restringida > 40%
  
  // Ejecución por mes
  ejecucionMes: {
    3: 0.25,   // Mes 3: 25%
    6: 0.50,   // Mes 6: 50%
    9: 0.75,   // Mes 9: 75%
    12: 1.00   // Mes 12: 100%
  },
  
  // Desfase
  desfaseCertMinimo: 0.70,    // 70% certificado
  desfaseExecMinimo: 0.60,    // 60% ejecutado
  
  // Ventana crítica
  ventanaMonesesCritica: 4,
  ventanaEjecucionMinima: 0.70,
  
  // Concentración
  concentracionMinima: 0.50    // 50% en una fuente
};

// -------------------------------------------------------
// FUNCIÓN PRINCIPAL: Generar todos los insights
// -------------------------------------------------------

function generarInsightsPremium(datosExcel) {
  // Calcular métricas base
  const metricas = calcularMetricas(datosExcel);
  
  // Arreglo de insights
  const insights = [];
  
  // NIVEL 1: CRÍTICOS
  if (insight_1_restriccionDominante(metricas)) {
    insights.push(insight_1_restriccionDominante(metricas));
  }
  
  if (insight_2_presupuestoDisponible(metricas)) {
    insights.push(insight_2_presupuestoDisponible(metricas));
  }
  
  // NIVEL 2: DIAGNÓSTICO
  if (insight_3_ritmoEjecucion(metricas)) {
    insights.push(insight_3_ritmoEjecucion(metricas));
  }
  
  if (insight_4_saldoNoUtilizado(metricas, datosExcel)) {
    insights.push(insight_4_saldoNoUtilizado(metricas, datosExcel));
  }
  
  if (insight_5_redistribucion(metricas, datosExcel)) {
    insights.push(insight_5_redistribucion(metricas, datosExcel));
  }
  
  if (insight_6_restriccionPorFuente(metricas, datosExcel)) {
    insights.push(insight_6_restriccionPorFuente(metricas, datosExcel));
  }
  
  // NIVEL 3: DESFASE
  if (insight_7_desfaseCertExec(metricas, datosExcel)) {
    insights.push(insight_7_desfaseCertExec(metricas, datosExcel));
  }
  
  if (insight_8_ventanaAccion(metricas)) {
    insights.push(insight_8_ventanaAccion(metricas));
  }
  
  // SIEMPRE: Resumen + Recomendaciones
  insights.push(insight_9_resumenEjecutivo(metricas, insights.length));
  insights.push(insight_10_recomendacionesAutomaticas(metricas, datosExcel, insights));
  
  return insights;
}

// -------------------------------------------------------
// CÁLCULOS BASE
// -------------------------------------------------------

function calcularMetricas(datosExcel) {
  const pim = datosExcel.reduce((s, r) => s + (parseFloat(r.PIM) || 0), 0);
  const certificado = datosExcel.reduce((s, r) => s + (parseFloat(r.Certificado) || 0), 0);
  const devengado = datosExcel.reduce((s, r) => s + (parseFloat(r.Devengado) || 0), 0);
  
  // Calcular libre vs restringido
  let libre = 0;
  let restringido = 0;
  
  datosExcel.forEach(r => {
    const pimPartida = parseFloat(r.PIM) || 0;
    const descripcion = r['Descripción de Gasto'] || '';
    
    const tieneRestriccion = Object.values(REGLAS).some(v => descripcion.includes(v.split('-')[0].trim()));
    if (tieneRestriccion) {
      restringido += pimPartida;
    } else {
      libre += pimPartida;
    }
  });
  
  // Mes actual (asumir mes 8 si no se especifica)
  const mesActual = obtenerMesActual();
  const mesesRestantes = 12 - mesActual;
  
  return {
    pim,
    certificado,
    devengado,
    libre,
    restringido,
    mesActual,
    mesesRestantes,
    ejecucionPct: (devengado / pim) * 100,
    certificacionPct: (certificado / pim) * 100,
    libreePct: (libre / pim) * 100,
    restringidoPct: (restringido / pim) * 100,
    saldo: pim - devengado,
    saldoLibre: libre - devengado
  };
}

function obtenerMesActual() {
  // TODO: Obtener de los datos del Excel (fecha de corte)
  // Por ahora: mes 8 (agosto) como default
  return 8;
}

// -------------------------------------------------------
// INSIGHT 1: Presupuesto Restringido
// -------------------------------------------------------

function insight_1_restriccionDominante(metricas) {
  if ((metricas.restringido / metricas.pim) > CONFIG_UMBRALES.restriccionDominante) {
    return {
      id: 'insight_1',
      nivel: 'CRÍTICO',
      titulo: '🔴 Presupuesto Restringido',
      vista: 'gestión',
      semaforo: '🔴',
      mensaje: `Existe un ${metricas.restringidoPct.toFixed(1)}% del presupuesto total con restricción que limita su ejecución. Esto representa S/ ${formatoMoneda(metricas.restringido)} que no podrás usar hasta levantar las restricciones.`,
      accion: {
        tipo: 'filtro',
        etiqueta: 'Ver partidas restringidas',
        parametro: 'mostrarRestringidas'
      },
      datos: {
        porcentaje: metricas.restringidoPct.toFixed(1),
        monto: metricas.restringido
      }
    };
  }
  return null;
}

// -------------------------------------------------------
// INSIGHT 2: Presupuesto Disponible
// -------------------------------------------------------

function insight_2_presupuestoDisponible(metricas) {
  return {
    id: 'insight_2',
    nivel: 'CRÍTICO',
    titulo: '🟢 Presupuesto Disponible',
    vista: 'gestión',
    semaforo: '🟢',
    mensaje: `El ${metricas.libreePct.toFixed(1)}% del presupuesto se encuentra disponible para gestión operativa (sin restricción). Son S/ ${formatoMoneda(metricas.libre)} que puedes ejecutar hoy.`,
    accion: {
      tipo: 'filtro',
      etiqueta: 'Ver solo partidas sin restricción',
      parametro: 'mostrarLibres'
    },
    datos: {
      porcentaje: metricas.libreePct.toFixed(1),
      monto: metricas.libre
    }
  };
}

// -------------------------------------------------------
// INSIGHT 3: Ritmo de Ejecución
// -------------------------------------------------------

function insight_3_ritmoEjecucion(metricas) {
  const metaEjecucion = CONFIG_UMBRALES.ejecucionMes[metricas.mesActual] || 0.50;
  const atraso = (metaEjecucion * 100) - metricas.ejecucionPct;
  
  if (metricas.ejecucionPct < (metaEjecucion * 100)) {
    return {
      id: 'insight_3',
      nivel: 'DIAGNÓSTICO',
      titulo: '📉 Ritmo de Ejecución Bajo',
      vista: 'estado',
      semaforo: atraso > 10 ? '🔴' : '🟡',
      mensaje: `El nivel de ejecución actual es ${metricas.ejecucionPct.toFixed(1)}%, por debajo del ritmo óptimo (que debería ser ~${(metaEjecucion * 100).toFixed(1)}% a estas alturas del año). Atraso: ${atraso.toFixed(1)}pp. Esto puede generar riesgos de no uso del presupuesto.`,
      accion: {
        tipo: 'ordenar',
        etiqueta: 'Ver partidas con mayor saldo',
        parametro: 'saldo-descendente'
      },
      datos: {
        ejecucionActual: metricas.ejecucionPct.toFixed(1),
        ejecucionMeta: (metaEjecucion * 100).toFixed(1),
        atraso: atraso.toFixed(1)
      }
    };
  }
  return null;
}

// -------------------------------------------------------
// INSIGHT 4: Alto Saldo No Utilizado
// -------------------------------------------------------

function insight_4_saldoNoUtilizado(metricas, datosExcel) {
  const partidasConSaldo = datosExcel.filter(r => {
    const pim = parseFloat(r.PIM) || 0;
    const cert = parseFloat(r.Certificado) || 0;
    return ((pim - cert) / pim) > 0.30;
  });
  
  if (partidasConSaldo.length > 0) {
    const saldoTotal = partidasConSaldo.reduce((s, r) => {
      return s + ((parseFloat(r.PIM) || 0) - (parseFloat(r.Certificado) || 0));
    }, 0);
    
    return {
      id: 'insight_4',
      nivel: 'OPORTUNIDAD',
      titulo: '🟡 Saldo No Utilizado',
      vista: 'gestión',
      semaforo: '🟡',
      mensaje: `Se han identificado ${partidasConSaldo.length} partidas con presupuesto usable aún no certificado. Saldo pendiente: S/ ${formatoMoneda(saldoTotal)}. Prioriza la certificación de estas partidas para acelerar ejecución.`,
      accion: {
        tipo: 'ordenar',
        etiqueta: 'Ver partidas con alta disponibilidad',
        parametro: 'disponible-descendente'
      },
      datos: {
        cantidadPartidas: partidasConSaldo.length,
        saldoTotal: saldoTotal
      }
    };
  }
  return null;
}

// -------------------------------------------------------
// INSIGHT 5: Redistribución Sugerida
// -------------------------------------------------------

function insight_5_redistribucion(metricas, datosExcel) {
  // Buscar partidas muy restringidas y partidas con saldo
  let sugerencias = [];
  
  datosExcel.forEach(r => {
    const pim = parseFloat(r.PIM) || 0;
    const saldo = pim - (parseFloat(r.Certificado) || 0);
    const descripcion = r['Descripción de Gasto'] || '';
    
    const tieneRestriccion = Object.values(REGLAS).some(v => descripcion.includes(v.split('-')[0].trim()));
    
    if (tieneRestriccion && (saldo / pim) < 0.10) {
      // Esta partida está muy restringida
      sugerencias.push({
        origen: descripcion.substring(0, 50),
        saldoNegativo: saldo,
        pim: pim
      });
    }
  });
  
  if (sugerencias.length > 0) {
    return {
      id: 'insight_5',
      nivel: 'ACCIÓN',
      titulo: '🔄 Redistribución Sugerida',
      vista: 'gestión',
      semaforo: '🟡',
      mensaje: `Se han identificado ${sugerencias.length} partida(s) con alta restricción. Se sugiere evaluar redistribución hacia partidas con saldo disponible y objetivos similares. Esta acción puede liberar S/ ${formatoMoneda(metricas.restringido * 0.30)} adicionales.`,
      accion: {
        tipo: 'export',
        etiqueta: 'Generar nota de redistribución',
        parametro: 'redistribucion'
      },
      datos: {
        sugerencias: sugerencias
      }
    };
  }
  return null;
}

// -------------------------------------------------------
// INSIGHT 6: Restricción por Fuente de Financiamiento
// -------------------------------------------------------

function insight_6_restriccionPorFuente(metricas, datosExcel) {
  // Agrupar restricción por fuente
  const restriccionPorFuente = {};
  let totalRestriction = 0;
  
  datosExcel.forEach(r => {
    const descripcion = r['Descripción de Gasto'] || '';
    const fuente = r['Fuente de Financiamiento'] || 'Desconocida';
    const pim = parseFloat(r.PIM) || 0;
    
    const tieneRestriccion = Object.values(REGLAS).some(v => descripcion.includes(v.split('-')[0].trim()));
    
    if (tieneRestriccion) {
      restriccionPorFuente[fuente] = (restriccionPorFuente[fuente] || 0) + pim;
      totalRestriction += pim;
    }
  });
  
  // Encontrar la fuente dominante
  let fuenteDominante = '';
  let montoFuenteDominante = 0;
  
  for (let [fuente, monto] of Object.entries(restriccionPorFuente)) {
    if (monto > montoFuenteDominante) {
      fuenteDominante = fuente;
      montoFuenteDominante = monto;
    }
  }
  
  if (fuenteDominante && (montoFuenteDominante / totalRestriction) > CONFIG_UMBRALES.concentracionMinima) {
    return {
      id: 'insight_6',
      nivel: 'DIAGNÓSTICO',
      titulo: '🟡 Restricción por Fuente',
      vista: 'gestión',
      semaforo: '🟡',
      mensaje: `El ${((montoFuenteDominante / totalRestriction) * 100).toFixed(1)}% de la restricción total proviene de la fuente "${fuenteDominante}". Gestionar este tipo de restricción es prioritario para liberar S/ ${formatoMoneda(montoFuenteDominante)}.`,
      accion: {
        tipo: 'grafico',
        etiqueta: 'Ver restricción por fuente',
        parametro: 'fuente-financiamiento'
      },
      datos: {
        fuentePrincipal: fuenteDominante,
        montoPrincipal: montoFuenteDominante,
        porcentaje: ((montoFuenteDominante / totalRestriction) * 100).toFixed(1)
      }
    };
  }
  return null;
}

// -------------------------------------------------------
// INSIGHT 7: Desfase Certificación-Ejecución
// -------------------------------------------------------

function insight_7_desfaseCertExec(metricas, datosExcel) {
  const partidasConDesfase = datosExcel.filter(r => {
    const pim = parseFloat(r.PIM) || 0;
    const cert = parseFloat(r.Certificado) || 0;
    const dev = parseFloat(r.Devengado) || 0;
    
    return (cert / pim) > CONFIG_UMBRALES.desfaseCertMinimo &&
           (dev / cert) < CONFIG_UMBRALES.desfaseExecMinimo;
  });
  
  if (partidasConDesfase.length > 0) {
    const gapPromedio = partidasConDesfase.reduce((s, r) => {
      const pim = parseFloat(r.PIM) || 0;
      const cert = parseFloat(r.Certificado) || 0;
      const dev = parseFloat(r.Devengado) || 0;
      return s + ((cert - dev) / pim);
    }, 0) / partidasConDesfase.length;
    
    return {
      id: 'insight_7',
      nivel: 'DIAGNÓSTICO',
      titulo: '📉 Desfase Certificación-Ejecución',
      vista: 'estado',
      semaforo: '🟡',
      mensaje: `Se han certificado ${metricas.certificacionPct.toFixed(1)}% de recursos pero solo se ha ejecutado ${metricas.ejecucionPct.toFixed(1)}%. Brecha: ${(metricas.certificacionPct - metricas.ejecucionPct).toFixed(1)}pp en ${partidasConDesfase.length} partida(s). Esto sugiere procesos lentos post-certificación.`,
      accion: {
        tipo: 'tabla',
        etiqueta: 'Identificar cuello botella',
        parametro: 'desfase-ordenado'
      },
      datos: {
        certificacionPct: metricas.certificacionPct.toFixed(1),
        ejecucionPct: metricas.ejecucionPct.toFixed(1),
        brecha: (metricas.certificacionPct - metricas.ejecucionPct).toFixed(1),
        partidas: partidasConDesfase.length
      }
    };
  }
  return null;
}

// -------------------------------------------------------
// INSIGHT 8: Ventana de Acción Cerrada
// -------------------------------------------------------

function insight_8_ventanaAccion(metricas) {
  const metaMeses = metricas.mesActual <= 9 ? 0.70 : 0.80;
  
  if (metricas.mesesRestantes <= CONFIG_UMBRALES.ventanaMonesesCritica &&
      metricas.ejecucionPct < (metaMeses * 100)) {
    
    const montoFaltante = metricas.saldo;
    const ritmoActual = metricas.devengado / metricas.mesActual;
    const ritmoRequerido = (metricas.pim * metaMeses) / metricas.mesesRestantes;
    
    return {
      id: 'insight_8',
      nivel: 'CRÍTICO',
      titulo: '🚨 Ventana de Acción Cerrada',
      vista: 'estado',
      semaforo: '🔴',
      mensaje: `A mes ${metricas.mesActual} de 12, tienes ${metricas.mesesRestantes} meses para ejecutar S/ ${formatoMoneda(montoFaltante)}. 
Para alcanzar ${(metaMeses * 100).toFixed(0)}% de ejecución:
• Ritmo requerido: S/ ${formatoMoneda(ritmoRequerido)}/mes
• Tu ritmo actual: S/ ${formatoMoneda(ritmoActual)}/mes
• Deficit: S/ ${formatoMoneda(Math.max(0, ritmoRequerido - ritmoActual))}/mes

⚠️ A este ritmo, terminarías en ${(metricas.ejecucionPct * (12 / metricas.mesActual)).toFixed(0)}% al cierre.`,
      accion: {
        tipo: 'recomendacion',
        etiqueta: 'Plan de recuperación',
        parametro: 'ventana-critica'
      },
      datos: {
        mesActual: metricas.mesActual,
        mesesRestantes: metricas.mesesRestantes,
        ejecucionActual: metricas.ejecucionPct.toFixed(1),
        ritmoActual: ritmoActual.toFixed(0),
        ritmoRequerido: ritmoRequerido.toFixed(0),
        deficit: Math.max(0, ritmoRequerido - ritmoActual).toFixed(0)
      }
    };
  }
  return null;
}

// -------------------------------------------------------
// INSIGHT 9: Resumen Ejecutivo
// -------------------------------------------------------

function insight_9_resumenEjecutivo(metricas, cantidadAlertas) {
  return {
    id: 'insight_9',
    nivel: 'RESUMEN',
    titulo: '📊 Resumen Ejecutivo',
    vista: 'ambas',
    semaforo: '⚪',
    mensaje: `El presupuesto presenta un nivel de ejecución de ${metricas.ejecucionPct.toFixed(1)}%, con un ${metricas.libreePct.toFixed(1)}% disponible sin restricciones. Se identifican ${cantidadAlertas} hallazgos que requieren seguimiento para optimizar la ejecución del gasto.`,
    accion: null,
    datos: {
      ejecucion: metricas.ejecucionPct.toFixed(1),
      libre: metricas.libreePct.toFixed(1),
      alertas: cantidadAlertas
    }
  };
}

// -------------------------------------------------------
// INSIGHT 10: Recomendaciones Automáticas
// -------------------------------------------------------

function insight_10_recomendacionesAutomaticas(metricas, datosExcel, insights) {
  const recomendaciones = [];
  
  // Regla 1: Alta restricción
  if (metricas.restringidoPct > 60) {
    recomendaciones.push('🔓 Priorizar el desbloqueo de restricciones (>60% del presupuesto)');
  }
  
  // Regla 2: Baja ejecución
  if (metricas.ejecucionPct < 30 && metricas.mesActual > 6) {
    recomendaciones.push('🚀 URGENTE: Acelerar ejecución en partidas sin restricción');
  }
  
  // Regla 3: Saldo disponible alto
  if ((metricas.saldoLibre / metricas.libre) > 0.40) {
    recomendaciones.push('📋 Enfocar esfuerzos en partidas con alto saldo no ejecutado');
  }
  
  // Regla 4: Ritmo bajo
  const metaEjecucion = CONFIG_UMBRALES.ejecucionMes[metricas.mesActual] || 0.50;
  if (metricas.ejecucionPct < (metaEjecucion * 100 * 0.9)) {
    recomendaciones.push('📈 Monitorear ritmo de ejecución para evitar subejecución');
  }
  
  // Regla 5: Desfase cert-exec
  if ((metricas.certificacionPct - metricas.ejecucionPct) > 25) {
    recomendaciones.push('⚙️ Revisar procesos post-certificación (hay cuello de botella)');
  }
  
  return {
    id: 'insight_10',
    nivel: 'RECOMENDACIONES',
    titulo: '💡 Recomendaciones Automáticas',
    vista: 'ambas',
    semaforo: '⚪',
    mensaje: recomendaciones.map((r, i) => `${i + 1}. ${r}`).join('\n'),
    accion: null,
    datos: {
      recomendaciones: recomendaciones,
      cantidad: recomendaciones.length
    }
  };
}

// -------------------------------------------------------
// UTILIDADES
// -------------------------------------------------------

function formatoMoneda(valor) {
  return 'S/ ' + (valor || 0).toLocaleString('es-PE', {
    maximumFractionDigits: 0
  });
}

function moneda(valor) {
  return 'S/ ' + (valor || 0).toLocaleString('es-PE', {
    maximumFractionDigits: 0
  });
}

// -------------------------------------------------------
// EXPORTAR FUNCIONES (para usar en app.js)
// -------------------------------------------------------

// En app.js, reemplazar la función generarHallazgos por:
// const insights = generarInsightsPremium(datosExcel);
// y luego renderizar con renderInsights(insights);

function renderInsights(insights) {
  let html = '';
  
  insights.forEach(insight => {
    if (!insight) return;
    
    const semaforo = insight.semaforo || '⚪';
    const accionHTML = insight.accion ? 
      `<button class="insight-action" onclick="aplicarAccionInsight('${insight.accion.tipo}', '${insight.accion.parametro}')">${insight.accion.etiqueta}</button>` : '';
    
    html += `
      <div class="insight insight-${insight.nivel.toLowerCase()}">
        <div class="insight-header">
          <span class="insight-titulo">${semaforo} ${insight.titulo}</span>
          <span class="insight-vista">${insight.vista}</span>
        </div>
        <div class="insight-mensaje">${insight.mensaje}</div>
        ${accionHTML}
      </div>
    `;
  });
  
  document.getElementById('hallazgos').innerHTML = html;
}
