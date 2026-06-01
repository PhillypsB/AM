// =======================================================
// zaZA PRESUPUESTO — app.js (versión unificada)
// Plataforma Ejecutiva de Inteligencia Presupuestal
// =======================================================

// -------------------------------------------------------
// VARIABLES GLOBALES
// -------------------------------------------------------

let datosExcel   = [];
let grafico      = null;
let vistaGerencial = false;   // Vista Operativa por defecto

// -------------------------------------------------------
// REGLAS DE RESTRICCIÓN (tabla completa de Hoja5)
// -------------------------------------------------------

const REGLAS = {
  '2.1.1.131.1.CONTRATO ADMINISTRATIVO DE SERVICIOS - INDETERMINADO': 'Restringida - CAS',
  '2.1.1.131.2.CONTRATO ADMINISTRATIVO DE SERVICIOS - TRANSITORIO': 'Restringida - CAS',
  '2.1.1.9.1.4.AGUINALDOS DE CONTRATO ADMINISTRATIVO DE SERVICIOS': 'Restringida - CAS',
  '2.1.1.9.3.14.OTROS BONOS EXTRAORDINARIOS PERSONAL CAS': 'Restringida - CAS',
  '2.1.3.1.1.12.CONTRIBUCIONES POR EL SEGURO COMPLEMENTARIO DE TRABAJO DE RIESGO': 'Restringida - CAS',
  '2.1.3.1.1.15.CONTRIBUCIONES A ESSALUD DE CONTRATO ADMINISTRATIVO DE SERVICIOS': 'Restringida - CAS',
  '2.1.4.1.1.5.BONIFICACION ADICIONAL POR VACACIONES': 'Restringida - CAS',
  '2.1.4.1.1.6.COMPENSACION VACACIONAL (VACACIONES TRUNCAS)': 'Restringida - CAS',
  '2.1.4.1.1.7.VACACIONES TRUNCAS PERSONAL CAS': 'Restringida - CAS',
  '2.2.2.3.9999.OTROS BIENES DE ASISTENCIA SOCIAL': 'Sin Restricción - Bienes de asistencia social (2.2)',
  '2.3.1.1.1.1.ALIMENTOS Y BEBIDAS PARA CONSUMO HUMANO': 'Sin Restricción',
  '2.3.1.1.1.2.ALIMENTOS Y BEBIDAS PARA CONSUMO ANIMAL': 'Sin Restricción',
  '2.3.1.111.1.PARA EDIFICIOS Y ESTRUCTURAS': 'Sin Restricción',
  '2.3.1.111.3.PARA MOBILIARIO Y SIMILARES': 'Sin Restricción',
  '2.3.1.111.5.OTROS MATERIALES DE MANTENIMIENTO': 'Sin Restricción',
  '2.3.1.2.1.1.VESTUARIO, ACCESORIOS Y PRENDAS DIVERSAS': 'Sin Restricción',
  '2.3.1.3.1.1.COMBUSTIBLES Y CARBURANTES': 'Sin Restricción',
  '2.3.1.5.1.1.REPUESTOS Y ACCESORIOS': 'Sin Restricción',
  '2.3.1.5.1.2.PAPELERIA EN GENERAL, UTILES Y MATERIALES DE OFICINA': 'Sin Restricción',
  '2.3.1.5.3.1.ASEO, LIMPIEZA Y TOCADOR': 'Sin Restricción',
  '2.3.1.5.3.2.DE COCINA, COMEDOR Y CAFETERIA': 'Sin Restricción',
  '2.3.1.5.4.1.ELECTRICIDAD, ILUMINACION Y ELECTRONICA': 'Sin Restricción',
  '2.3.1.6.1.2.DE COMUNICACIONES Y TELECOMUNICACIONES': 'Restringida - Repuestos y accesorios',
  '2.3.1.6.1.4.DE SEGURIDAD': 'Restringida - Repuestos y accesorios',
  '2.3.1.6.1.99.OTROS ACCESORIOS Y REPUESTOS': 'Restringida - Repuestos y accesorios',
  '2.3.1.8.1.2.MEDICAMENTOS': 'Sin Restricción',
  '2.3.1.8.1.99.OTROS PRODUCTOS SIMILARES': 'Sin Restricción',
  '2.3.1.8.2.1.MATERIAL, INSUMOS, INSTRUMENTAL Y ACCESORIOS  MEDICOS, QUIRURGICOS, ODONTOLOGICOS Y DE LABORATORIO': 'Sin Restricción',
  '2.3.1.9.1.2.MATERIAL DIDACTICO, ACCESORIOS Y UTILES DE ENSEÑANZA': 'Sin restricción - Material Didáctico',
  '2.3.1.9.1.99.OTROS MATERIALES DIVERSOS DE ENSEÑANZA': 'Sin Restricción',
  '2.3.1.991.3.LIBROS, DIARIOS, REVISTAS Y OTROS BIENES IMPRESOS NO VINCULADOS A ENSEÑANZA': 'Sin Restricción',
  '2.3.1.991.4.SIMBOLOS, DISTINTIVOS Y CONDECORACIONES': 'Sin Restricción',
  '2.3.1.991.99.OTROS BIENES': 'Sin Restricción',
  '2.3.2.1.1.2.VIATICOS Y ASIGNACIONES POR COMISION DE SERVICIO': 'Sin Restricción - Comisiones de Servicios',
  '2.3.2.1.2.1.PASAJES Y GASTOS DE TRANSPORTE': 'Sin Restricción - Comisiones de Servicios',
  '2.3.2.1.2.2.VIATICOS Y ASIGNACIONES POR COMISION DE SERVICIO': 'Sin Restricción - Comisiones de Servicios',
  '2.3.2.1.2.99.OTROS GASTOS': 'Sin Restricción - Comisiones de Servicios',
  '2.3.2.2.1.1.SERVICIO DE SUMINISTRO DE ENERGIA ELECTRICA': 'Restringida - Servicios de energía eléctrica',
  '2.3.2.2.1.2.SERVICIO DE AGUA Y DESAGUE': 'Restringida - Servicios de agua y desague',
  '2.3.2.2.2.1.SERVICIO DE TELEFONIA MOVIL': 'Restringida - Telefonia movil',
  '2.3.2.2.2.2.SERVICIO DE TELEFONIA FIJA': 'Restringida - Telefonía Fija',
  '2.3.2.2.2.3.SERVICIO DE INTERNET': 'Restringida - Internet',
  '2.3.2.2.3.1.CORREOS Y SERVICIOS DE MENSAJERIA': 'Sin Restricción',
  '2.3.2.2.3.99.OTROS SERVICIOS DE COMUNICACION': 'Sin Restricción',
  '2.3.2.2.5.1.DIFUSIÓN EN EL DIARIO OFICIAL': 'Sin Restricción',
  '2.3.2.3.1.1.SERVICIOS DE LIMPIEZA E HIGIENE': 'Sin Restricción',
  '2.3.2.3.1.2.SERVICIOS DE SEGURIDAD Y VIGILANCIA': 'Sin Restricción',
  '2.3.2.4.2.1.DE EDIFICACIONES, OFICINAS Y ESTRUCTURAS': 'Restringida - Servicio de Mantenimiento',
  '2.3.2.4.5.1.DE VEHICULOS': 'Restringida - Servicio de Mantenimiento',
  '2.3.2.4.6.1.DE MOBILIARIO Y SIMILARES': 'Restringida - Servicio de Mantenimiento',
  '2.3.2.4.7.1.DE MAQUINARIAS Y EQUIPOS': 'Restringida - Servicio de Mantenimiento',
  '2.3.2.4.9999.DE OTROS BIENES Y ACTIVOS': 'Restringida - Servicio de Mantenimiento',
  '2.3.2.5.1.1.DE EDIFICIOS Y ESTRUCTURAS': 'Sin Restricción',
  '2.3.2.5.1.2.DE VEHICULOS': 'Sin Restricción',
  '2.3.2.5.1.4.DE MAQUINARIAS Y EQUIPOS': 'Sin Restricción',
  '2.3.2.5.1.99.DE OTROS BIENES Y ACTIVOS': 'Sin Restricción',
  '2.3.2.6.1.1.GASTOS LEGALES Y JUDICIALES': 'Sin Restricción',
  '2.3.2.6.1.2.GASTOS NOTARIALES': 'Sin Restricción',
  '2.3.2.6.2.1.CARGOS BANCARIOS': 'Sin Restricción',
  '2.3.2.6.3.2.SEGURO DE VEHICULOS': 'Sin Restricción',
  '2.3.2.6.3.3.SEGURO OBLIGATORIO ACCIDENTES DE TRANSITO (SOAT)': 'Sin Restricción',
  '2.3.2.6.3.4.OTROS SEGUROS PERSONALES': 'Sin Restricción',
  '2.3.2.6.3.99.OTROS SEGUROS DE  BIENES MUEBLES E INMUEBLES': 'Sin Restricción',
  '2.3.2.7.101.SEMINARIOS ,TALLERES Y SIMILARES ORGANIZADOS POR LA  INSTITUCION': 'Sin Restricción',
  '2.3.2.7.111.EMBALAJE Y ALMACENAJE': 'Sin Restricción',
  '2.3.2.7.112.TRANSPORTE Y TRASLADO DE CARGA, BIENES Y MATERIALES': 'Sin Restricción',
  '2.3.2.7.115.SERVICIOS DE ALIMENTACION DE CONSUMO HUMANO': 'Sin Restricción',
  '2.3.2.7.116.SERVICIO DE IMPRESIONES, ENCUADERNACION Y EMPASTADO': 'Sin Restricción - Impresiones, encuadernación, empastado',
  '2.3.2.7.1199.SERVICIOS DIVERSOS': 'Restringida - Servicios Diversos',
  '2.3.2.7.135.ASESORÍA Y/O DEFENSA LEGAL PARA SERVIDORES Y EX-SERVIDORES CIVILES': 'Sin Restricción',
  '2.3.2.7.136.ASESORÍA Y/O DEFENSA LEGAL PARA ENTIDADES PÚBLICAS EN EL MARCO DE CONTROVERSIAS CONTRACTUALES NACIONALES O INTERNACIONALES': 'Sin Restricción',
  '2.3.2.7.1398.OTROS SERVICIOS TÉCNICOS Y PROFESIONALES DESARROLLADOS POR PERSONAS JURÍDICAS': 'Sin Restricción',
  '2.3.2.7.145.ASESORÍA Y/O DEFENSA LEGAL PARA SERVIDORES Y EX-SERVIDORES CIVILES': 'Sin Restricción',
  '2.3.2.7.146.ASESORÍA Y/O DEFENSA LEGAL PARA ENTIDADES PÚBLICAS EN EL MARCO DE CONTROVERSIAS CONTRACTUALES NACIONALES O INTERNACIONALES': 'Sin Restricción',
  '2.3.2.7.1498.OTROS SERVICIOS TÉCNICOS Y PROFESIONALES DESARROLLADOS POR PERSONAS NATURALES': 'Sin Restricción',
  '2.3.2.7.2.1.CONSULTORIAS': 'Restringida - Consultoría Natural',
  '2.3.2.7.3.1.REALIZADO POR PERSONAS JURIDICAS': 'Sin Restricción',
  '2.3.2.7.3.2.REALIZADO POR PERSONAS NATURALES': 'Sin Restricción',
  '2.3.2.7.4.3.SOPORTE TECNICO': 'Sin Restricción',
  '2.3.2.7.4.99.OTROS SERVICIOS DE INFORMATICA': 'Sin Restricción',
  '2.3.2.7.5.1.ESTIPENDIO POR SECIGRA': 'Sin Restricción',
  '2.3.2.7.5.10.SUBVENCION ADICIONAL DE PRACTICAS PROFESIONALES': 'Sin Restricción',
  '2.3.2.7.5.2.PROPINAS PARA PRACTICANTES': 'Sin Restricción',
  '2.3.2.7.9.2.ORGANIZACION Y CONDUCCION DE EVENTOS RECREACIONALES': 'Sin Restricción',
  '2.3.2.7.9.99.OTROS RELACIONADOS A ORGANIZACION DE EVENTOS': 'Sin Restricción',
  '2.3.2.8.1.1.CONTRATO ADMINISTRATIVO DE SERVICIOS': 'Restringida - CAS',
  '2.3.2.8.1.2.CONTRIBUCIONES A ESSALUD DE C.A.S.': 'Restringida - CAS',
  '2.3.2.8.1.4.AGUINALDOS DE C.A.S.': 'Restringida - CAS',
  '2.3.2.8.1.5.VACACIONES TRUNCAS DE C.A.S.': 'Restringida - CAS',
  '2.3.2.8.1.10.OTROS BONOS EXTRAORDINARIOS': 'Restringida - CAS',
  '2.3.2.9.1.1.LOCACIÓN DE SERVICIOS REALIZADOS POR PERSONA NATURAL': 'Restringida - Locadores de Servicios',
  '2.5.2.1.1.99.A OTRAS ORGANIZACIONES': 'Sin Restricción - Transferencia Financiera Corriente',
  '2.5.2.2.1.99.A OTRAS ORGANIZACIONES': 'Restringida - Transferencia Financiera Capital',
  '2.5.4.1.2.1.DERECHOS ADMINISTRATIVOS': 'Sin Restricción',
  '2.5.4.3.2.1.DERECHOS ADMINISTRATIVOS': 'Sin Restricción',
  '2.5.6.1.1.1.GASTOS POR IMPLEMENTACIÓN DE LA NEGOCIACIÓN COLECTIVA - NIVEL DESCENTRALIZADO POR ENTIDAD PÚBLICA': 'Restringida - Negociación Colectiva',
  '2.6.2.3.992.COSTO DE CONSTRUCCION POR CONTRATA': 'Restringida - Bienes de Capital',
  '2.6.3.2.1.1.MAQUINAS Y EQUIPOS': 'Restringida - Bienes de Capital',
  '2.6.3.2.1.2.MOBILIARIO': 'Restringida - Bienes de Capital',
  '2.6.3.2.2.1.MAQUINAS Y EQUIPOS': 'Restringida - Bienes de Capital',
  '2.6.3.2.3.1.EQUIPOS COMPUTACIONALES Y PERIFERICOS': 'Restringida - Bienes de Capital',
  '2.6.3.2.3.3.EQUIPOS DE TELECOMUNICACIONES': 'Restringida - Bienes de Capital',
  '2.6.3.2.9.1.AIRE ACONDICIONADO Y REFRIGERACION': 'Restringida - Bienes de Capital',
  '2.6.3.2.9.2.ASEO,  LIMPIEZA Y COCINA': 'Restringida - Bienes de Capital',
  '2.6.3.2.9.4.ELECTRICIDAD Y ELECTRONICA': 'Restringida - Bienes de Capital',
  '2.6.3.2.9.5.EQUIPOS E INSTRUMENTOS DE MEDICION': 'Restringida - Bienes de Capital',
  '2.6.3.2.9.99.MAQUINARIAS, EQUIPOS Y MOBILIARIOS DE OTRAS INSTALACIONES': 'Restringida - Bienes de Capital',
  '2.6.8.1.4.3.GASTO POR LA CONTRATACION DE SERVICIOS': 'Restringida - Bienes de Capital',
};

// -------------------------------------------------------
// INICIO — ocultar footer
// -------------------------------------------------------

document.querySelector('.pie').classList.add('oculto');
// Iniciar en vista operativa
document.body.classList.add('vista-operativa');

// -------------------------------------------------------
// CURSOR PERSONALIZADO
// -------------------------------------------------------

const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// -------------------------------------------------------
// CAMBIAR TEMA
// -------------------------------------------------------

function cambiarTema() {
  document.body.classList.toggle('oscuro');
  const oscuro = document.body.classList.contains('oscuro');
  const icono = document.getElementById('iconoTema');
  if (oscuro) {
    icono.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  } else {
    icono.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
  }
}

// -------------------------------------------------------
// CAMBIAR VISTA
// -------------------------------------------------------

function cambiarVista() {
  vistaGerencial = !vistaGerencial;
  const btn = document.getElementById('botonVista');
  if (vistaGerencial) {
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><span>Modo Operativo</span>';
    document.body.classList.remove('vista-operativa');
    document.body.classList.add('vista-gerencial');
  } else {
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><span>Modo Gerencial</span>';
    document.body.classList.remove('vista-gerencial');
    document.body.classList.add('vista-operativa');
  }
}

// -------------------------------------------------------
// DRAG & DROP
// -------------------------------------------------------

const zonaSoltar = document.getElementById('zonaSoltar');

window.addEventListener('dragenter', (e) => {
  e.preventDefault();
  zonaSoltar.classList.remove('oculto');
});

window.addEventListener('dragover', (e) => { e.preventDefault(); });

window.addEventListener('dragleave', (e) => {
  if (e.clientX === 0 && e.clientY === 0) {
    zonaSoltar.classList.add('oculto');
  }
});

window.addEventListener('drop', (e) => {
  e.preventDefault();
  zonaSoltar.classList.add('oculto');
  validarArchivo(e.dataTransfer.files[0]);
});

// -------------------------------------------------------
// INPUT ARCHIVO
// -------------------------------------------------------

document.getElementById('archivoExcel').addEventListener('change', (e) => {
  validarArchivo(e.target.files[0]);
});

// -------------------------------------------------------
// VALIDAR ARCHIVO
// -------------------------------------------------------

function validarArchivo(archivo) {
  if (!archivo) return;
  const ext = archivo.name.split('.').pop().toLowerCase();
  if (ext !== 'xls') { mostrarError(); return; }
  document.getElementById('nombreArchivo').innerText = archivo.name;
  procesarExcel(archivo);
}

// -------------------------------------------------------
// ERROR
// -------------------------------------------------------

function mostrarError() {
  document.getElementById('mensajeError').classList.remove('oculto');
}

function cerrarError() {
  document.getElementById('mensajeError').classList.add('oculto');
}

// -------------------------------------------------------
// HELPERS DE TEXTO / NÚMERO
// -------------------------------------------------------

function limpiarTexto(txt) {
  return String(txt || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function construirClasificador(item) {
  const tt  = String(item['tipo_transaccion'] || '').trim();
  const gen = String(item['generica']         || '').trim();
  const sg  = String(item['subgenerica']      || '').trim();
  const sgd = String(item['subgenerica_det']  || '').trim();
  const esp = String(item['especifica']       || '').trim();
  const esd = String(item['especifica_det']   || '').trim();
  if (!tt && !gen) return '';
  const gg    = tt.substring(0, 2)   + gen;
  const ggg   = gg.substring(0, 4)   + sg;
  const gggg  = ggg.substring(0, 6)  + sgd;
  const ggggg = gggg.substring(0, 8) + esp;
  return ggggg.substring(0, 10) + esd;
}

function obtenerTipoGasto(clasificador) {
  return REGLAS[clasificador] || (clasificador ? 'Sin Restricción' : 'Sin Restricción');
}

// -------------------------------------------------------
// FORMATOS
// -------------------------------------------------------

function moneda(valor) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency', currency: 'PEN', maximumFractionDigits: 0
  }).format(valor);
}

function numero(valor) {
  return Number(valor || 0).toLocaleString('es-PE', {
    minimumFractionDigits: 0, maximumFractionDigits: 0
  });
}

function pct(valor) {
  return Number(valor || 0).toFixed(1) + '%';
}

// -------------------------------------------------------
// ESPERAR
// -------------------------------------------------------

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// -------------------------------------------------------
// ACTUALIZAR BARRA DE CARGA
// -------------------------------------------------------

function actualizarCarga(porcentaje, texto) {
  document.getElementById('barraCarga').style.width   = porcentaje + '%';
  document.getElementById('porcentajeCarga').innerText = porcentaje + '%';
  document.getElementById('textoCarga').innerText      = texto;
}

// -------------------------------------------------------
// PROCESAR EXCEL
// -------------------------------------------------------

async function procesarExcel(archivo) {
  const inicio   = performance.now();
  const cargador = document.getElementById('cargador');
  cargador.classList.remove('oculto');

  actualizarCarga(5, 'Leyendo archivo XLS...');

  const reader = new FileReader();

  reader.onload = async function (e) {
    try {
      await esperar(120);
      actualizarCarga(20, 'Interpretando información...');

      const data     = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      await esperar(120);
      actualizarCarga(45, 'Procesando registros...');

      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      const raw  = XLSX.utils.sheet_to_json(hoja, { defval: 0 });
      datosExcel = raw;

      await esperar(120);
      actualizarCarga(65, 'Calculando indicadores...');

      renderizarIndicadores(raw);
      actualizarEntidad(raw);
      actualizarFecha(archivo.name);

      await esperar(120);
      actualizarCarga(82, 'Construyendo gráficos...');

      renderizarGrafico(raw);
      renderizarProductos(raw);
      renderizarTablaRestriccion(raw);
      poblarFiltrosGeo(raw);
      generarHallazgos(raw);

      document.getElementById('seccionRestriccion').classList.remove('oculto');
      document.getElementById('seccionFiltrosGerencial').classList.remove('oculto');
      document.getElementById('seccionExportar').classList.remove('oculto');

      await esperar(120);
      actualizarCarga(100, 'Finalizando...');

      const fin    = performance.now();
      const tiempo = ((fin - inicio) / 1000).toFixed(2);

      document.getElementById('pieTiempo').innerText =
        '⚡ Tiempo de carga: ' + tiempo + ' segundos';
      document.getElementById('pieRegistros').innerText =
        '📂 Registros procesados: ' + raw.length.toLocaleString();

      setTimeout(() => {
        cargador.classList.add('oculto');
        document.getElementById('seccionCarga').style.display = 'none';
        document.querySelector('.pie').classList.remove('oculto');
      }, 500);

    } catch (error) {
      console.error(error);
      mostrarError();
      cargador.classList.add('oculto');
    }
  };

  reader.readAsArrayBuffer(archivo);
}

// -------------------------------------------------------
// ACTUALIZAR ENTIDAD
// -------------------------------------------------------

function actualizarEntidad(data) {
  if (!data.length) return;
  const fila = data[0];

  const ministerio = (fila.pliego || '')
    .split('.').slice(1).join('.').trim();
  const programa   = (fila.unidad_ejecutora || '')
    .split('.').slice(1).join('.').trim();

  const html = `${ministerio}<br>${programa}`;
  document.getElementById('tituloEntidad').innerHTML    = html;
  document.getElementById('entidadCabecera').innerHTML  = html;
  document.getElementById('seccionEntidad').classList.remove('oculto');
  document.getElementById('informacionCabecera').classList.remove('oculto');
}

// -------------------------------------------------------
// FECHA
// -------------------------------------------------------

function actualizarFecha(nombre) {
  const match = nombre.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (!match) return;
  const fecha = `${match[3]}/${match[2]}/${match[1]}`;
  const hora  = `${match[4]}:${match[5]}:${match[6]}`;
  const texto = fecha + ' ' + hora;
  document.getElementById('fechaActualizacion').innerText = texto;
  document.getElementById('pieActualizado').innerText     = '📅 Corte de datos: ' + texto;
}

// -------------------------------------------------------
// INDICADORES KPI
// -------------------------------------------------------

function renderizarIndicadores(data) {
  let pim = 0, certificado = 0, devengado = 0, girado = 0, pagado = 0;

  data.forEach(item => {
    pim         += Number(item.mto_pim         || 0);
    certificado += Number(item.mto_certificado || 0);

    for (let i = 1; i <= 12; i++) {
      const mes = String(i).padStart(2, '0');
      devengado += Number(item['mto_devenga_' + mes] || 0);
      girado    += Number(item['mto_girado_'  + mes] || 0);
      pagado    += Number(item['mto_pagado_'  + mes] || 0);
    }
  });

  const ejecucion = pim > 0 ? (devengado / pim) * 100 : 0;

  document.getElementById('kpiPim').innerText  = moneda(pim);
  document.getElementById('kpiCert').innerText = moneda(certificado);
  document.getElementById('kpiDev').innerText  = moneda(devengado);
  document.getElementById('kpiGir').innerText  = moneda(girado);
  document.getElementById('kpiPag').innerText  = moneda(pagado);
  document.getElementById('kpiEjec').innerText = ejecucion.toFixed(1) + '%';

  document.getElementById('seccionIndicadores').classList.remove('oculto');
}

// -------------------------------------------------------
// PRODUCTOS / PROYECTOS
// -------------------------------------------------------

function renderizarProductos(data) {
  const acumulado = {};

  data.forEach(item => {
    const nombre = item.producto_proyecto || 'SIN NOMBRE';
    acumulado[nombre] = (acumulado[nombre] || 0) + Number(item.mto_pim || 0);
  });

  const lista   = Object.entries(acumulado).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const maximo  = lista[0] ? lista[0][1] : 1;

  let html = '';
  lista.forEach(item => {
    const porcentaje = (item[1] / maximo) * 100;
    html += `
      <div class="producto-item">
        <div class="producto-top"><strong>${item[0]}</strong></div>
        <div class="producto-barra">
          <div class="producto-barra-fill" style="width:${porcentaje}%"></div>
        </div>
        <div class="producto-valores">
          <span>PIM</span>
          <strong>${moneda(item[1])}</strong>
        </div>
      </div>
    `;
  });

  document.getElementById('contenedorProductos').innerHTML = html;
  document.getElementById('seccionProductos').classList.remove('oculto');
}

// -------------------------------------------------------
// GRÁFICO (ApexCharts)
// -------------------------------------------------------

function renderizarGrafico(data) {
  const resumen = {};

  data.forEach(item => {
    const nombre = item.programa_pptal || 'SIN NOMBRE';
    resumen[nombre] = (resumen[nombre] || 0) + Number(item.mto_pim || 0);
  });

  const categorias = Object.keys(resumen).slice(0, 8);
  const valores    = Object.values(resumen).slice(0, 8);

  if (grafico) grafico.destroy();

  grafico = new ApexCharts(
    document.querySelector('#grafico'),
    {
      chart:       { type: 'bar', height: 360, toolbar: { show: false } },
      series:      [{ name: 'PIM', data: valores }],
      xaxis:       { categories: categorias },
      dataLabels:  { enabled: false },
      colors:      ['#2563eb']
    }
  );

  grafico.render();
  document.getElementById('seccionGrafico').classList.remove('oculto');
}

// -------------------------------------------------------
// HALLAZGOS AUTOMÁTICOS
// -------------------------------------------------------

function generarHallazgos(data) {
  const hallazgos = [];

  // Cálculos básicos
  let pim = 0, devengado = 0;
  let restringido = 0, libre = 0;

  data.forEach(item => {
    pim       += Number(item.mto_pim || 0);
    const clasificador = construirClasificador(item);
    const tipo = obtenerTipoGasto(clasificador);

    let devItem = 0;
    for (let i = 1; i <= 12; i++) {
      devItem += Number(item['mto_devenga_' + String(i).padStart(2, '0')] || 0);
    }
    devengado += devItem;

    if (limpiarTexto(tipo).includes('RESTRING')) {
      restringido += Number(item.mto_pim || 0);
    } else {
      libre += Number(item.mto_pim || 0);
    }
  });

  const ejec    = pim > 0 ? (devengado / pim) * 100 : 0;
  const pctRest = pim > 0 ? (restringido / pim) * 100 : 0;

  hallazgos.push('🚀 Información procesada correctamente.');
  hallazgos.push('📊 Registros analizados: ' + data.length.toLocaleString());
  hallazgos.push('💰 PIM total: ' + moneda(pim));
  hallazgos.push('📉 Avance de ejecución (Devengado/PIM): ' + ejec.toFixed(1) + '%');
  hallazgos.push('🔒 Gasto con restricción presupuestal: ' + moneda(restringido) + ' (' + pctRest.toFixed(1) + '% del PIM)');
  hallazgos.push('✅ Gasto sin restricción: ' + moneda(libre));

  if (ejec < 30) {
    hallazgos.push('⚠️ Alerta: Ejecución por debajo del 30%. Se recomienda acelerar compromisos.');
  } else if (ejec >= 80) {
    hallazgos.push('🏆 Excelente nivel de ejecución presupuestal.');
  }

  let html = '';
  hallazgos.forEach(h => {
    html += `<div class="hallazgo">${h}</div>`;
  });

  document.getElementById('hallazgos').innerHTML = html;
  document.getElementById('seccionHallazgos').classList.remove('oculto');
}

// -------------------------------------------------------
// CONSTRUIR RESUMEN POR TIPO DE GASTO (para Excel)
// -------------------------------------------------------

function construirResumen(data) {
  const grupos = {};

  data.forEach(item => {
    const clasificador = construirClasificador(item);
    const tipo         = obtenerTipoGasto(clasificador);

    if (!grupos[tipo]) {
      grupos[tipo] = { tipo, pia: 0, pim: 0, certificado: 0, compromiso: 0, devengado: 0 };
    }

    grupos[tipo].pia         += Number(item['mto_pia']          || 0);
    grupos[tipo].pim         += Number(item['mto_pim']          || 0);
    grupos[tipo].certificado += Number(item['mto_certificado']  || 0);
    grupos[tipo].compromiso  += Number(item['mto_compro_anual'] || 0);

    for (let i = 1; i <= 12; i++) {
      grupos[tipo].devengado += Number(item['mto_devenga_' + String(i).padStart(2, '0')] || 0);
    }
  });

  const resumen  = Object.values(grupos);
  const totalPIM = resumen.reduce((acc, x) => acc + x.pim, 0);

  resumen.forEach(r => {
    r.porcentaje  = totalPIM > 0 ? (r.pim / totalPIM) * 100 : 0;
    r.avanceCert  = r.pim > 0   ? (r.certificado / r.pim)  * 100 : 0;
    r.avanceDev   = r.pim > 0   ? (r.devengado   / r.pim)  * 100 : 0;
    r.saldoCert   = r.pim - r.certificado;
    r.saldoDev    = r.pim - r.devengado;
  });

  resumen.sort((a, b) => b.pim - a.pim);
  return resumen;
}

// -------------------------------------------------------
// TABLA RESUMEN RESTRICCIONES (Vista Operativa)
// -------------------------------------------------------

let resumenRestriccionCache = [];
let datosRestriccionRaw    = [];   // ← datos crudos para filtros geo

function renderizarTablaRestriccion(data) {
  datosRestriccionRaw    = data;
  resumenRestriccionCache = construirResumen(data);
  pintarTablaRestriccion(resumenRestriccionCache);
}

function pintarTablaRestriccion(resumen) {
  const tbody = document.getElementById('cuerpoRestriccion');
  const tfoot = document.getElementById('totalRestriccion');

  let totPIA = 0, totPIM = 0, totCert = 0, totDev = 0, totSaldo = 0;

  let html = '';
  resumen.forEach((item, i) => {
    totPIA   += item.pia;
    totPIM   += item.pim;
    totCert  += item.certificado;
    totDev   += item.devengado;
    totSaldo += item.saldoDev;

    const esRestringida = limpiarTexto(item.tipo).includes('RESTRING');
    const badge = esRestringida
      ? `<span class="badge-restrin badge-restringida">🔒 Restringida</span>`
      : `<span class="badge-restrin badge-libre">✅ Sin Restricción</span>`;

    // Quitar prefijo "Sin Restricción - " / "Restringida - " / "Sin restricción - " del texto visible
    const tipoVisible = item.tipo
      .replace(/^sin restricci[oó]n\s*[-–]\s*/i, '')
      .replace(/^restringida\s*[-–]\s*/i, '')
      .replace(/^sin restricci[oó]n$/i, 'General')
      || item.tipo;

    const avDev = item.pim > 0 ? (item.devengado / item.pim * 100).toFixed(1) : '0.0';
    const pctBar = Math.min(100, parseFloat(avDev));
    const pctColor = pctBar >= 80 ? '#10b981' : pctBar >= 50 ? '#f59e0b' : '#ef4444';

    html += `
      <tr class="fila-tipo" onclick="toggleDrillDown(this, '${item.tipo.replace(/'/g,"\\'")}')">
        <td>${i + 1}</td>
        <td class="col-tipo">
          <span class="drill-toggle">▶</span>
          ${tipoVisible}
        </td>
        <td>${badge}</td>
        <td>${numero(item.pia)}</td>
        <td>${numero(item.pim)}</td>
        <td>
          <div class="pct-cell">
            <span>${item.porcentaje.toFixed(1)}%</span>
          </div>
        </td>
        <td>${numero(item.certificado)}</td>
        <td>${numero(item.devengado)}</td>
        <td>
          <div class="pct-cell">
            <div class="pct-bar-wrap">
              <div class="pct-bar-fill" style="width:${pctBar}%;background:${pctColor}"></div>
            </div>
            <span>${avDev}%</span>
          </div>
        </td>
        <td>${numero(item.saldoDev)}</td>
      </tr>
      <tr class="fila-drill oculto" id="drill-${i}">
        <td colspan="10" class="drill-celda">
          <div class="drill-contenido" id="drill-contenido-${i}"></div>
        </td>
      </tr>
    `;
  });

  // guardar índice para drill-down
  tbody.innerHTML = html;
  // guardar resumen actual para uso en drill-down
  tbody._resumen = resumen;

  const avDevTot = totPIM > 0 ? (totDev / totPIM * 100).toFixed(1) : '0.0';
  tfoot.innerHTML = `
    <tr>
      <td></td>
      <td class="col-tipo">TOTAL GENERAL</td>
      <td></td>
      <td>${numero(totPIA)}</td>
      <td>${numero(totPIM)}</td>
      <td>100.0%</td>
      <td>${numero(totCert)}</td>
      <td>${numero(totDev)}</td>
      <td>${avDevTot}%</td>
      <td>${numero(totSaldo)}</td>
    </tr>
  `;
}

// -------------------------------------------------------
// DRILL-DOWN por clasificador
// -------------------------------------------------------

function toggleDrillDown(fila, tipoGasto) {
  // Encontrar el índice de la fila
  const filas = fila.parentElement.querySelectorAll('.fila-tipo');
  let idx = -1;
  filas.forEach((f, i) => { if (f === fila) idx = i; });
  if (idx < 0) return;

  const drillRow  = document.getElementById('drill-' + idx);
  const drillDiv  = document.getElementById('drill-contenido-' + idx);
  const toggle    = fila.querySelector('.drill-toggle');
  const abierto   = !drillRow.classList.contains('oculto');

  if (abierto) {
    drillRow.classList.add('oculto');
    if (toggle) toggle.textContent = '▶';
    return;
  }

  // Construir detalle de clasificadores para este tipo
  // Filtramos los datos crudos actuales (ya filtrados por geo) y agrupamos por clasificador
  const datosActuales = obtenerDatosFiltradosActuales();
  const grupos = {};

  datosActuales.forEach(item => {
    const clas = construirClasificador(item);
    const tipo = obtenerTipoGasto(clas);
    if (tipo !== tipoGasto) return;

    const key  = clas;
    if (!grupos[key]) {
      grupos[key] = { clas, pia: 0, pim: 0, devengado: 0, certificado: 0 };
    }
    grupos[key].pia         += Number(item['mto_pia']         || 0);
    grupos[key].pim         += Number(item['mto_pim']         || 0);
    grupos[key].certificado += Number(item['mto_certificado'] || 0);
    for (let m = 1; m <= 12; m++) {
      grupos[key].devengado += Number(item['mto_devenga_' + String(m).padStart(2,'0')] || 0);
    }
  });

  const lista = Object.values(grupos).sort((a,b) => b.pim - a.pim);

  if (!lista.length) {
    drillDiv.innerHTML = '<p class="drill-vacio">Sin detalle disponible</p>';
  } else {
    let rows = '';
    lista.forEach((g, i) => {
      const av = g.pim > 0 ? (g.devengado / g.pim * 100).toFixed(1) : '0.0';
      const pctC = Math.min(100, parseFloat(av));
      const col  = pctC >= 80 ? '#10b981' : pctC >= 50 ? '#f59e0b' : '#ef4444';
      rows += `
        <tr>
          <td class="drill-num">${i+1}</td>
          <td class="drill-clas">${g.clas}</td>
          <td class="drill-monto">${numero(g.pim)}</td>
          <td class="drill-monto">${numero(g.devengado)}</td>
          <td class="drill-pct">
            <div class="pct-bar-wrap" style="width:80px">
              <div class="pct-bar-fill" style="width:${pctC}%;background:${col}"></div>
            </div>
            <span>${av}%</span>
          </td>
          <td class="drill-monto">${numero(g.pim - g.devengado)}</td>
        </tr>`;
    });

    drillDiv.innerHTML = `
      <table class="tabla-drill">
        <thead>
          <tr>
            <th>N°</th>
            <th>Clasificador</th>
            <th>PIM</th>
            <th>Devengado</th>
            <th>% Dev.</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  drillRow.classList.remove('oculto');
  if (toggle) toggle.textContent = '▼';
}

function obtenerDatosFiltradosActuales() {
  // Filtros de la vista OPERATIVA (nueva estructura)
  const programa = (document.getElementById('filtroPrograma')?.value || '').trim();
  const producto = (document.getElementById('filtroProducto')?.value || '').trim();
  const actividad = (document.getElementById('filtroActividad')?.value || '').trim();
  const depto = (document.getElementById('filtroDepartamento')?.value || '').trim();

  return datosRestriccionRaw.filter(item => {
    if (programa && normalizarCampoGeo(item,'programa_pptal') !== programa) return false;
    if (producto && normalizarCampoGeo(item,'producto_proyecto') !== producto) return false;
    if (actividad && normalizarCampoGeo(item,'activ_obra_accinv') !== actividad) return false;
    if (depto && normalizarCampoGeo(item,'departamento_meta') !== depto) return false;
    return true;
  });
}

function obtenerDatosFiltradosGerencial() {
  // Filtros de la vista GERENCIAL
  const dept     = (document.getElementById('gFiltroDepartamento')?.value || '').trim();
  const prov     = (document.getElementById('gFiltroProvincia')?.value    || '').trim();
  const dist     = (document.getElementById('gFiltroDistrito')?.value     || '').trim();
  const fuente   = (document.getElementById('gFiltroFuente')?.value       || '').trim();
  const programa = (document.getElementById('gFiltroPrograma')?.value     || '').trim();

  return datosRestriccionRaw.filter(item => {
    if (dept     && normalizarCampoGeo(item,'departamento_meta')   !== dept)     return false;
    if (prov     && normalizarCampoGeo(item,'provincia_meta')      !== prov)     return false;
    if (dist     && normalizarCampoGeo(item,'distrito_meta')       !== dist)     return false;
    if (fuente   && normalizarCampoGeo(item,'fuente_financiamiento') !== fuente) return false;
    if (programa && normalizarCampoGeo(item,'programa_pptal')      !== programa) return false;
    return true;
  });
}

// -------------------------------------------------------
// FILTROS GEOGRÁFICOS — campos candidatos
// -------------------------------------------------------

const CAMPOS_GEO = {
  departamento_meta:     ['departamento_meta','departamento','dep','dpto'],
  provincia_meta:        ['provincia_meta','provincia','prov'],
  distrito_meta:         ['distrito_meta','distrito','dist'],
  fuente_financiamiento: ['fuente_financiamiento','fuente','ffte_financiamiento','tipo_recurso'],
  programa_pptal:        ['programa_pptal','programa','prog_pptal'],
  producto_proyecto:     ['producto_proyecto','producto','prod_proyecto'],
  activ_obra_accinv:     ['activ_obra_accinv','actividad','obra','accion_inversion']
};

function normalizarCampoGeo(item, campo) {
  const candidatos = CAMPOS_GEO[campo] || [campo];
  for (const c of candidatos) {
    const v = item[c];
    if (v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '0') {
      return String(v).trim().replace(/^\d+\.\s*/,'');
    }
  }
  return '';
}

// -------------------------------------------------------
// POBLAR FILTROS — carga inicial (solo departamentos)
// -------------------------------------------------------

function poblarFiltrosGeo(data) {
  // Recolectar todos los valores únicos del dataset completo
  const programaSet = new Set();
  const productoSet = new Set();
  const actividadSet = new Set();
  const deptSet = new Set();
  const fuenteSet = new Set();

  data.forEach(item => {
    const g = normalizarCampoGeo(item,'programa_pptal');
    const pd = normalizarCampoGeo(item,'producto_proyecto');
    const a = normalizarCampoGeo(item,'activ_obra_accinv');
    const d = normalizarCampoGeo(item,'departamento_meta');
    const f = normalizarCampoGeo(item,'fuente_financiamiento');
    if (g) programaSet.add(g);
    if (pd) productoSet.add(pd);
    if (a) actividadSet.add(a);
    if (d) deptSet.add(d);
    if (f) fuenteSet.add(f);
  });

  const hayGeo = programaSet.size > 0 || productoSet.size > 0 || actividadSet.size > 0 || deptSet.size > 0;
  const filaGeo = document.getElementById('filaFiltrosGeoMeta');
  if (filaGeo) filaGeo.style.display = hayGeo ? '' : 'none';

  // Vista operativa — nuevos filtros
  llenarSelect('filtroPrograma',   programaSet);
  llenarSelect('filtroProducto',   productoSet);
  llenarSelect('filtroActividad',  actividadSet);
  llenarSelect('filtroDepartamento', deptSet);

  // Vista gerencial (mantiene su estructura anterior)
  llenarSelect('gFiltroDepartamento', deptSet);
  llenarSelect('gFiltroProvincia',    new Set());
  llenarSelect('gFiltroDistrito',     new Set());
  llenarSelect('gFiltroFuente',       fuenteSet);
  llenarSelect('gFiltroPrograma',     programaSet);
}

// -------------------------------------------------------
// LLENAR SELECT
// -------------------------------------------------------

function llenarSelect(id, set, placeholder) {
  const sel = document.getElementById(id);
  if (!sel) return;
  const valorActual = sel.value;
  while (sel.options.length > 1) sel.remove(1);
  [...set].sort().forEach(v => {
    if (!v) return;
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
  // Restaurar selección si aún es válida
  if (valorActual && [...set].includes(valorActual)) {
    sel.value = valorActual;
  }
}

// -------------------------------------------------------
// ENCADENAMIENTO — Dept → Provincia → Distrito
// (operativa) — DEPRECATED: No longer used with new filter structure
// -------------------------------------------------------

// function alCambiarDepartamentoOp() {
//   const dept = (document.getElementById('filtroDepartamentoMeta')?.value || '').trim();
//   const provSet = new Set();
//   datosRestriccionRaw.forEach(item => {
//     if (dept && normalizarCampoGeo(item,'departamento_meta') !== dept) return;
//     const p = normalizarCampoGeo(item,'provincia_meta');
//     if (p) provSet.add(p);
//   });
//   llenarSelect('filtroProvincia', provSet);
//   llenarSelect('filtroDistrito',  new Set());
//   filtrarTablaRestriccion();
// }
//
// function alCambiarProvinciaOp() {
//   const dept = (document.getElementById('filtroDepartamentoMeta')?.value || '').trim();
//   const prov = (document.getElementById('filtroProvincia')?.value        || '').trim();
//   const distSet = new Set();
//   datosRestriccionRaw.forEach(item => {
//     if (dept && normalizarCampoGeo(item,'departamento_meta') !== dept) return;
//     if (prov && normalizarCampoGeo(item,'provincia_meta')    !== prov) return;
//     const t = normalizarCampoGeo(item,'distrito_meta');
//     if (t) distSet.add(t);
//   });
//   llenarSelect('filtroDistrito', distSet);
//   filtrarTablaRestriccion();
// }

// -------------------------------------------------------
// ENCADENAMIENTO — Dept → Provincia → Distrito
// (gerencial)
// -------------------------------------------------------

function alCambiarDepartamentoGer() {
  const dept = (document.getElementById('gFiltroDepartamento')?.value || '').trim();

  const provSet = new Set();
  datosRestriccionRaw.forEach(item => {
    if (dept && normalizarCampoGeo(item,'departamento_meta') !== dept) return;
    const p = normalizarCampoGeo(item,'provincia_meta');
    if (p) provSet.add(p);
  });

  llenarSelect('gFiltroProvincia', provSet);
  llenarSelect('gFiltroDistrito',  new Set());
  filtrarVistaGerencial();
}

function alCambiarProvinciaGer() {
  const dept = (document.getElementById('gFiltroDepartamento')?.value || '').trim();
  const prov = (document.getElementById('gFiltroProvincia')?.value    || '').trim();

  const distSet = new Set();
  datosRestriccionRaw.forEach(item => {
    if (dept && normalizarCampoGeo(item,'departamento_meta') !== dept) return;
    if (prov && normalizarCampoGeo(item,'provincia_meta')    !== prov) return;
    const t = normalizarCampoGeo(item,'distrito_meta');
    if (t) distSet.add(t);
  });

  llenarSelect('gFiltroDistrito', distSet);
  filtrarVistaGerencial();
}

// -------------------------------------------------------
// LIMPIAR FILTROS
// -------------------------------------------------------

function limpiarFiltrosOperativa() {
  ['filtroPrograma','filtroProducto','filtroActividad','filtroDepartamento',
   'filtroRestrin','filtroTipoRestrin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  // Repoblar filtros desde cero (todo el dataset)
  poblarFiltrosGeo(datosRestriccionRaw);
  ordenActual = { col: null, dir: 'asc' };
  document.querySelectorAll('.th-sort').forEach(th => {
    th.classList.remove('sort-asc','sort-desc');
    const si = th.querySelector('.sort-icon');
    if (si) si.textContent = '↕';
  });
  filtrarTablaRestriccion();
}

function limpiarFiltros() { limpiarFiltrosOperativa(); }

function limpiarFiltrosGerencial() {
  ['gFiltroDepartamento','gFiltroProvincia','gFiltroDistrito',
   'gFiltroFuente','gFiltroPrograma'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  poblarFiltrosGeo(datosRestriccionRaw);
  filtrarVistaGerencial();
}

// -------------------------------------------------------
// FILTRAR VISTA GERENCIAL
// -------------------------------------------------------

function filtrarVistaGerencial() {
  const datos = obtenerDatosFiltradosGerencial();
  renderizarGrafico(datos);
  renderizarProductos(datos);
  renderizarIndicadores(datos);
}

// -------------------------------------------------------
// ORDENAMIENTO
// -------------------------------------------------------

let ordenActual = { col: null, dir: 'asc' };

function ordenarTabla(col) {
  if (ordenActual.col === col) {
    ordenActual.dir = ordenActual.dir === 'asc' ? 'desc' : 'asc';
  } else {
    ordenActual.col = col;
    ordenActual.dir = 'asc';
  }

  document.querySelectorAll('.th-sort').forEach(th => {
    th.classList.remove('sort-asc','sort-desc');
    const si = th.querySelector('.sort-icon');
    if (si) si.textContent = '↕';
  });
  const thActivo = document.querySelector(`[data-col="${col}"]`);
  if (thActivo) {
    thActivo.classList.add(ordenActual.dir === 'asc' ? 'sort-asc' : 'sort-desc');
    const si = thActivo.querySelector('.sort-icon');
    if (si) si.textContent = ordenActual.dir === 'asc' ? '↑' : '↓';
  }

  filtrarTablaRestriccion();
}

function filtrarTablaRestriccion() {
  // 1. Filtrar datos crudos por geo y fuente
  const datosFiltrados = obtenerDatosFiltradosActuales();

  // 2. Re-agrupar con esos datos filtrados
  let resumen = construirResumen(datosFiltrados);

  // 3. Filtrar por texto y tipo de restricción
  const texto = limpiarTexto(document.getElementById('filtroRestrin')?.value || '');
  const tipo  = (document.getElementById('filtroTipoRestrin')?.value || '').toLowerCase();

  resumen = resumen.filter(item => {
    const tipoLimpio    = limpiarTexto(item.tipo);
    const matchTexto    = !texto || tipoLimpio.includes(texto);
    const esRestringida = tipoLimpio.includes('RESTRING');
    const matchTipo     =
      !tipo ||
      (tipo === 'restringida'     && esRestringida) ||
      (tipo === 'sin restriccion' && !esRestringida);
    return matchTexto && matchTipo;
  });

  // 4. Ordenar
  if (ordenActual.col) {
    const col = ordenActual.col;
    const dir = ordenActual.dir === 'asc' ? 1 : -1;
    resumen = [...resumen].sort((a, b) => {
      let va = a[col], vb = b[col];
      if (col === 'tipo' || col === 'estado') {
        va = String(va || ''); vb = String(vb || '');
        return va.localeCompare(vb) * dir;
      }
      return (Number(va) - Number(vb)) * dir;
    });
  }

  pintarTablaRestriccion(resumen);
}

// -------------------------------------------------------

function accionExportar(tipo) {
  if (!datosExcel.length) {
    alert('Primero debe cargar un archivo XLS.');
    return;
  }

  if (tipo === 'Excel') {
    exportarExcelHermoso();
  } else if (tipo === 'WhatsApp') {
    exportarWhatsApp();
  } else if (tipo === 'Word') {
    exportarWord();
  } else if (tipo === 'PDF') {
    exportarPDF();
  }
}

// -------------------------------------------------------
// EXPORTAR WHATSAPP (texto enriquecido)
// -------------------------------------------------------

function exportarWhatsApp() {
  let pim = 0, certificado = 0, devengado = 0, restringido = 0;

  datosExcel.forEach(item => {
    pim         += Number(item.mto_pim         || 0);
    certificado += Number(item.mto_certificado || 0);
    for (let i = 1; i <= 12; i++) {
      devengado += Number(item['mto_devenga_' + String(i).padStart(2, '0')] || 0);
    }
    const clasificador = construirClasificador(item);
    const tipo = obtenerTipoGasto(clasificador);
    if (limpiarTexto(tipo).includes('RESTRING')) {
      restringido += Number(item.mto_pim || 0);
    }
  });

  const ejec     = pim > 0 ? (devengado / pim) * 100 : 0;
  const pctRest  = pim > 0 ? (restringido / pim) * 100 : 0;
  const saldo    = pim - devengado;
  const fila0    = datosExcel[0] || {};
  const ministerio = (fila0.pliego || '').split('.').slice(1).join('.').trim();
  const entidad  = (fila0.unidad_ejecutora || '').split('.').slice(1).join('.').trim();
  const fecha    = document.getElementById('fechaActualizacion').innerText || '--';

  // Emoji de semáforo según ejecución
  const semaforo = ejec >= 80 ? '🟢' : ejec >= 50 ? '🟡' : '🔴';

  const msg =
    `🚀 *zaZA PRESUPUESTO*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🏛️ *Ministerio:* ${ministerio}\n` +
    `🏢 *Unidad Ejecutora:* ${entidad}\n` +
    `📅 *Corte de datos:* ${fecha}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *PIM:* ${moneda(pim)}\n` +
    `📌 *Certificado:* ${moneda(certificado)}\n` +
    `📉 *Devengado:* ${moneda(devengado)}\n` +
    `💸 *Saldo por devengar:* ${moneda(saldo)}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `${semaforo} *Ejecución:* ${ejec.toFixed(1)}%\n` +
    `🔒 *Gasto restringido:* ${moneda(restringido)} (${pctRest.toFixed(1)}%)\n` +
    `✅ *Gasto libre:* ${moneda(pim - restringido)}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📊 _Generado con zaZA PRESUPUESTO_ 🚀\n` +
    `🛰️ _Fuente: SIAF WEB_`;

  const url = 'https://wa.me/?text=' + encodeURIComponent(msg);
  window.open(url, '_blank');
}

// -------------------------------------------------------
// EXPORTAR WORD (HTML → .doc blob)
// -------------------------------------------------------

function exportarWord() {
  const resumen  = construirResumen(datosExcel);
  const fila0    = datosExcel[0] || {};
  const ministerio = (fila0.pliego           || '').split('.').slice(1).join('.').trim();
  const ejecutora  = (fila0.unidad_ejecutora || '').split('.').slice(1).join('.').trim();
  const fecha      = document.getElementById('fechaActualizacion').innerText || '--';

  // Calcular totales y hallazgos
  let pim = 0, devengado = 0, restringido = 0, libre = 0;
  datosExcel.forEach(item => {
    pim += Number(item.mto_pim || 0);
    const clasificador = construirClasificador(item);
    const tipo = obtenerTipoGasto(clasificador);
    let devItem = 0;
    for (let i = 1; i <= 12; i++) devItem += Number(item['mto_devenga_' + String(i).padStart(2, '0')] || 0);
    devengado += devItem;
    if (limpiarTexto(tipo).includes('RESTRING')) restringido += Number(item.mto_pim || 0);
    else libre += Number(item.mto_pim || 0);
  });
  const ejec    = pim > 0 ? (devengado / pim) * 100 : 0;
  const pctRest = pim > 0 ? (restringido / pim) * 100 : 0;

  // Filas tabla
  let filas = '';
  resumen.forEach((item, i) => {
    const esR = limpiarTexto(item.tipo).includes('RESTRING');
    const bg  = esR ? '#FEE2E2' : '#DCFCE7';
    filas += `
      <tr style="background:${i%2===0?'#ffffff':bg}">
        <td style="text-align:center">${i+1}</td>
        <td>${item.tipo}</td>
        <td style="text-align:center;background:${bg}">${esR ? '🔒 Restringida' : '✅ Sin Restricción'}</td>
        <td style="text-align:right">${numero(item.pim)}</td>
        <td style="text-align:right">${numero(item.devengado)}</td>
        <td style="text-align:center">${item.avanceDev.toFixed(1)}%</td>
        <td style="text-align:right">${numero(item.saldoDev)}</td>
      </tr>`;
  });

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Calibri, sans-serif; font-size: 10pt; margin: 2cm; }
        h1   { font-size: 16pt; color: #1E3A5F; margin-bottom: 4px; }
        h2   { font-size: 12pt; color: #2563EB; margin: 18px 0 6px; }
        .sub { font-size: 9pt; color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt; }
        th   { background: #1E3A5F; color: white; padding: 7px 8px; text-align: center; }
        td   { padding: 6px 8px; border: 1px solid #CBD5E1; }
        tfoot td { background: #14532d; color: white; font-weight: bold; }
        .kpi-grid { display: flex; gap: 16px; flex-wrap: wrap; margin: 10px 0; }
        .kpi { background: #DBEAFE; border-radius: 8px; padding: 10px 14px; min-width: 130px; }
        .kpi-label { font-size: 8pt; color: #1d4ed8; font-weight: bold; }
        .kpi-val   { font-size: 13pt; font-weight: bold; color: #1E3A5F; }
        .hallazgo  { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
                     padding: 8px 12px; margin: 6px 0; font-size: 9pt; }
        hr { border: none; border-top: 2px solid #DBEAFE; margin: 16px 0; }
      </style>
    </head>
    <body>
      <h1>🚀 zaZA PRESUPUESTO — Reporte Ejecutivo</h1>
      <p class="sub">🏛️ ${ministerio} | 🏢 ${ejecutora} | 📅 Corte: ${fecha}</p>
      <hr>

      <h2>📊 Indicadores Principales</h2>
      <table>
        <tr>
          <td><b>💰 PIM</b></td>
          <td style="text-align:right"><b>${moneda(pim)}</b></td>
          <td><b>📉 Devengado</b></td>
          <td style="text-align:right"><b>${moneda(devengado)}</b></td>
          <td><b>🚀 Ejecución</b></td>
          <td style="text-align:right"><b>${ejec.toFixed(1)}%</b></td>
        </tr>
        <tr>
          <td>🔒 Restringido</td>
          <td style="text-align:right">${moneda(restringido)} (${pctRest.toFixed(1)}%)</td>
          <td>✅ Sin Restricción</td>
          <td style="text-align:right">${moneda(libre)}</td>
          <td>💸 Saldo Dev.</td>
          <td style="text-align:right">${moneda(pim - devengado)}</td>
        </tr>
      </table>

      <h2>📋 Resumen por Tipo de Gasto</h2>
      <table>
        <thead>
          <tr>
            <th>N°</th><th>Tipo de Gasto</th><th>Estado</th>
            <th>PIM</th><th>Devengado</th><th>% Dev.</th><th>Saldo Dev.</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
        <tfoot>
          <tr>
            <td></td><td>TOTAL GENERAL</td><td></td>
            <td style="text-align:right">${numero(resumen.reduce((a,r)=>a+r.pim,0))}</td>
            <td style="text-align:right">${numero(resumen.reduce((a,r)=>a+r.devengado,0))}</td>
            <td style="text-align:center">${ejec.toFixed(1)}%</td>
            <td style="text-align:right">${numero(resumen.reduce((a,r)=>a+r.saldoDev,0))}</td>
          </tr>
        </tfoot>
      </table>

      <h2>💡 Hallazgos Automáticos</h2>
      <div class="hallazgo">🚀 Información procesada correctamente. ${datosExcel.length.toLocaleString()} registros analizados.</div>
      <div class="hallazgo">📉 Avance de ejecución (Devengado/PIM): <b>${ejec.toFixed(1)}%</b> ${ejec >= 80 ? '🏆 Excelente nivel de ejecución.' : ejec < 30 ? '⚠️ Por debajo del 30% — se recomienda acelerar compromisos.' : ''}</div>
      <div class="hallazgo">🔒 Gasto con restricción presupuestal: <b>${moneda(restringido)}</b> (${pctRest.toFixed(1)}% del PIM)</div>
      <div class="hallazgo">✅ Gasto sin restricción: <b>${moneda(libre)}</b></div>

      <hr>
      <p class="sub">📊 Generado con zaZA PRESUPUESTO | 🛰️ Fuente: SIAF WEB</p>
    </body>
    </html>`;

  const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `zaZA_Reporte_${new Date().toISOString().slice(0,10)}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------------------------------------------
// EXPORTAR PDF (ventana imprimible)
// -------------------------------------------------------

function exportarPDF() {
  const resumen  = construirResumen(datosExcel);
  const fila0    = datosExcel[0] || {};
  const ministerio = (fila0.pliego           || '').split('.').slice(1).join('.').trim();
  const ejecutora  = (fila0.unidad_ejecutora || '').split('.').slice(1).join('.').trim();
  const fecha      = document.getElementById('fechaActualizacion').innerText || '--';

  let pim = 0, devengado = 0, restringido = 0, libre = 0;
  datosExcel.forEach(item => {
    pim += Number(item.mto_pim || 0);
    const clasificador = construirClasificador(item);
    const tipo = obtenerTipoGasto(clasificador);
    let devItem = 0;
    for (let i = 1; i <= 12; i++) devItem += Number(item['mto_devenga_' + String(i).padStart(2, '0')] || 0);
    devengado += devItem;
    if (limpiarTexto(tipo).includes('RESTRING')) restringido += Number(item.mto_pim || 0);
    else libre += Number(item.mto_pim || 0);
  });
  const ejec    = pim > 0 ? (devengado / pim) * 100 : 0;
  const pctRest = pim > 0 ? (restringido / pim) * 100 : 0;

  let filas = '';
  resumen.forEach((item, i) => {
    const esR = limpiarTexto(item.tipo).includes('RESTRING');
    const bg  = esR ? '#FEE2E2' : '#DCFCE7';
    const bgRow = i%2===0 ? '#ffffff' : (esR ? '#FFF5F5' : '#F0FFF4');
    filas += `
      <tr style="background:${bgRow}">
        <td style="text-align:center">${i+1}</td>
        <td>${item.tipo}</td>
        <td style="text-align:center"><span style="background:${bg};padding:2px 8px;border-radius:999px;font-size:9pt">${esR ? '🔒 Restringida' : '✅ Sin Restricción'}</span></td>
        <td style="text-align:right">${numero(item.pim)}</td>
        <td style="text-align:right">${numero(item.devengado)}</td>
        <td style="text-align:center">${item.avanceDev.toFixed(1)}%</td>
        <td style="text-align:right">${numero(item.saldoDev)}</td>
      </tr>`;
  });

  const semaforo = ejec >= 80 ? '#10b981' : ejec >= 50 ? '#f59e0b' : '#ef4444';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>zaZA PRESUPUESTO — Reporte PDF</title>
  <style>
    @page { size: A4 landscape; margin: 1.5cm; }
    * { box-sizing: border-box; }
    body { font-family: Calibri, sans-serif; font-size: 10pt; color: #0f172a; }
    .header { background: linear-gradient(135deg,#1E3A5F,#2563EB); color: white;
              padding: 18px 24px; border-radius: 12px; margin-bottom: 16px; }
    .header h1 { font-size: 18pt; margin: 0 0 4px; }
    .header p  { font-size: 9pt; opacity: .85; margin: 0; }
    .kpi-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .kpi { flex: 1; min-width: 120px; background: #DBEAFE; border-radius: 10px;
            padding: 10px 14px; }
    .kpi-label { font-size: 8pt; color: #2563EB; font-weight: 700; }
    .kpi-val   { font-size: 14pt; font-weight: 800; color: #1E3A5F; margin-top: 4px; }
    .ejec-kpi  { background: ${semaforo}22; }
    .ejec-kpi .kpi-val { color: ${semaforo}; }
    h2 { font-size: 12pt; color: #1E3A5F; margin: 14px 0 6px; border-left: 4px solid #2563EB; padding-left: 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
    th { background: #1E3A5F; color: white; padding: 7px 8px; text-align: center; font-size: 8pt; }
    td { padding: 5px 8px; border: 1px solid #CBD5E1; }
    tfoot td { background: #14532d; color: white; font-weight: bold; }
    .hallazgos { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
    .hallazgo  { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;
                 padding: 7px 12px; font-size: 9pt; }
    .footer { margin-top: 16px; text-align: center; font-size: 8pt; color: #64748b;
              border-top: 1px solid #e2e8f0; padding-top: 10px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 zaZA PRESUPUESTO — Reporte Ejecutivo</h1>
    <p>🏛️ ${ministerio} &nbsp;|&nbsp; 🏢 ${ejecutora} &nbsp;|&nbsp; 📅 Corte: ${fecha}</p>
  </div>

  <div class="kpi-row">
    <div class="kpi"><div class="kpi-label">💰 PIM</div><div class="kpi-val">${moneda(pim)}</div></div>
    <div class="kpi"><div class="kpi-label">📉 Devengado</div><div class="kpi-val">${moneda(devengado)}</div></div>
    <div class="kpi ejec-kpi"><div class="kpi-label">🚀 Ejecución</div><div class="kpi-val">${ejec.toFixed(1)}%</div></div>
    <div class="kpi"><div class="kpi-label">🔒 Restringido</div><div class="kpi-val">${moneda(restringido)}</div></div>
    <div class="kpi"><div class="kpi-label">✅ Sin Restricción</div><div class="kpi-val">${moneda(libre)}</div></div>
    <div class="kpi"><div class="kpi-label">💸 Saldo Dev.</div><div class="kpi-val">${moneda(pim - devengado)}</div></div>
  </div>

  <h2>📋 Resumen por Tipo de Gasto</h2>
  <table>
    <thead>
      <tr>
        <th>N°</th><th>Tipo de Gasto</th><th>Estado</th>
        <th>PIM</th><th>Devengado</th><th>% Dev.</th><th>Saldo Dev.</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
    <tfoot>
      <tr>
        <td></td><td>TOTAL GENERAL</td><td></td>
        <td style="text-align:right">${numero(resumen.reduce((a,r)=>a+r.pim,0))}</td>
        <td style="text-align:right">${numero(resumen.reduce((a,r)=>a+r.devengado,0))}</td>
        <td style="text-align:center">${ejec.toFixed(1)}%</td>
        <td style="text-align:right">${numero(resumen.reduce((a,r)=>a+r.saldoDev,0))}</td>
      </tr>
    </tfoot>
  </table>

  <h2>💡 Hallazgos</h2>
  <div class="hallazgos">
    <div class="hallazgo">🚀 Información procesada correctamente. ${datosExcel.length.toLocaleString()} registros analizados.</div>
    <div class="hallazgo">📉 Avance de ejecución: <b>${ejec.toFixed(1)}%</b> ${ejec >= 80 ? '🏆 Excelente nivel.' : ejec < 30 ? '⚠️ Por debajo del 30%.' : ''}</div>
    <div class="hallazgo">🔒 Gasto con restricción: <b>${moneda(restringido)}</b> (${pctRest.toFixed(1)}% del PIM)</div>
    <div class="hallazgo">✅ Gasto sin restricción: <b>${moneda(libre)}</b></div>
  </div>

  <div class="footer">📊 Generado con zaZA PRESUPUESTO &nbsp;|&nbsp; 🛰️ Fuente: SIAF WEB</div>

  <script>window.onload = () => window.print();<\/script>
</body>
</html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
}



function exportarExcelHermoso() {

  // ── Colores ──────────────────────────────────────────
  const AZUL_OSCURO  = '1E3A5F';   // cabecera principal
  const AZUL_MEDIO   = '2563EB';   // cabecera subhoja
  const AZUL_CLARO   = 'EFF6FF';   // filas pares (más suave)
  const AZUL_MEDIO_F = 'BFDBFE';   // filas pares alternativas
  const VERDE_OSCURO = '065F46';   // fila total
  const VERDE_CLARO  = 'D1FAE5';   // sin restricción
  const VERDE_MED    = 'A7F3D0';   // sin restricción impares
  const ROJO_CLARO   = 'FEE2E2';   // restringida
  const ROJO_MED     = 'FECACA';   // restringida impares
  const AMARILLO     = 'FFFBEB';   // encabezado entidad
  const NARANJA_TIT  = 'FEF9C3';   // título
  const BLANCO       = 'FFFFFF';
  const GRIS_TEXTO   = '1E293B';

  // ── Estilos reutilizables ────────────────────────────
  const estCabecera = {
    font:      { bold: true, color: { rgb: BLANCO }, sz: 11 },
    fill:      { patternType: 'solid', fgColor: { rgb: AZUL_OSCURO } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border:    borde()
  };

  const estCabeceraNum = {
    ...estCabecera,
    alignment: { horizontal: 'right', vertical: 'center', wrapText: true }
  };

  const estTitulo = {
    font:      { bold: true, color: { rgb: '1E3A5F' }, sz: 14 },
    fill:      { patternType: 'solid', fgColor: { rgb: 'DBEAFE' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  };

  const estEntidad = {
    font:      { bold: true, color: { rgb: GRIS_TEXTO }, sz: 10 },
    fill:      { patternType: 'solid', fgColor: { rgb: AZUL_CLARO } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true }
  };

  const estTotal = {
    font:      { bold: true, color: { rgb: BLANCO }, sz: 10 },
    fill:      { patternType: 'solid', fgColor: { rgb: VERDE_OSCURO } },
    alignment: { horizontal: 'right', vertical: 'center' },
    border:    borde()
  };

  const estTotalTxt = {
    ...estTotal,
    alignment: { horizontal: 'left', vertical: 'center' }
  };

  function borde() {
    const b = { style: 'thin', color: { rgb: 'CBD5E1' } };
    return { top: b, bottom: b, left: b, right: b };
  }

  function celdaDato(valor, alineacion, color) {
    return {
      font:      { sz: 9, color: { rgb: GRIS_TEXTO } },
      fill:      { patternType: 'solid', fgColor: { rgb: color } },
      alignment: { horizontal: alineacion || 'right', vertical: 'center' },
      border:    borde()
    };
  }

  function celdaRestriccion(tipo, par) {
    const restring = limpiarTexto(tipo).includes('RESTRING');
    if (restring) {
      return celdaDato(tipo, 'left', par ? ROJO_CLARO : ROJO_MED);
    }
    return celdaDato(tipo, 'left', par ? VERDE_CLARO : VERDE_MED);
  }

  // ── Helpers de celda ────────────────────────────────
  function celda(v, s, t) {
    return { v, s, t: t || (typeof v === 'number' ? 'n' : 's') };
  }

  function numFmt(v, s, fmt) {
    return { v, s, t: 'n', z: fmt || '#,##0' };
  }

  function pctFmt(v, s) {
    return { v: v / 100, s, t: 'n', z: '0.0%' };
  }

  // ── Datos ────────────────────────────────────────────
  const resumen   = construirResumen(datosExcel);
  const fila0     = datosExcel[0] || {};
  const ministerio = (fila0.pliego          || '').split('.').slice(1).join('.').trim();
  const ejecutora  = (fila0.unidad_ejecutora|| '').split('.').slice(1).join('.').trim();
  const fechaTxt   = document.getElementById('fechaActualizacion').innerText || '--';

  // ═══════════════════════════════════════════════════
  //  HOJA 1: RESUMEN EJECUTIVO
  // ═══════════════════════════════════════════════════

  const wb = XLSX.utils.book_new();

  // Construimos la hoja como array de objetos {celda: {v,s,t}}
  // Usamos XLSX.utils.aoa_to_sheet y luego aplicamos estilos celda por celda

  // Fila 1: Título (12 columnas → A:L)
  const NUM_COLS = 12;
  const COLS     = ['A','B','C','D','E','F','G','H','I','J','K','L'];

  // Generar hoja con datos primero
  let wsData = [];

  // F1 → Título
  wsData.push([ '🚀 zaZA PRESUPUESTO — Resumen Ejecutivo por Tipo de Gasto', ...Array(NUM_COLS-1).fill('') ]);
  // F2 → Entidad
  wsData.push([ `Entidad: ${ministerio}  |  Unidad Ejecutora: ${ejecutora}  |  Corte: ${fechaTxt}`, ...Array(NUM_COLS-1).fill('') ]);
  // F3 → Vacía
  wsData.push(Array(NUM_COLS).fill(''));
  // F4 → Cabeceras
  wsData.push([
    'N°', 'TIPOS DE GASTO', 'PIA', 'PIM', '% DEL PIM',
    'CERTIFICACIÓN', 'COMPROMISO', '% AV. CERT.',
    'DEVENGADO', '% AV. DEV.',
    'SALDO SIN CERT.', 'SALDO SIN DEVENGAR'
  ]);

  // Filas de datos
  let totPIA=0, totPIM=0, totCert=0, totComp=0, totDev=0;
  resumen.forEach((item, i) => {
    totPIA  += item.pia;
    totPIM  += item.pim;
    totCert += item.certificado;
    totComp += item.compromiso;
    totDev  += item.devengado;
    wsData.push([
      i + 1,
      item.tipo,
      item.pia,
      item.pim,
      item.porcentaje / 100,
      item.certificado,
      item.compromiso,
      item.avanceCert / 100,
      item.devengado,
      item.avanceDev  / 100,
      item.saldoCert,
      item.saldoDev
    ]);
  });

  // Fila Total
  const avCertTotal = totPIM > 0 ? totCert / totPIM : 0;
  const avDevTotal  = totPIM > 0 ? totDev  / totPIM : 0;
  wsData.push([
    '', 'TOTAL GENERAL',
    totPIA, totPIM, 1,
    totCert, totComp, avCertTotal,
    totDev, avDevTotal,
    totPIM - totCert, totPIM - totDev
  ]);

  const ws1 = XLSX.utils.aoa_to_sheet(wsData);

  // ── Aplicar estilos ──────────────────────────────────
  const FILA_CAB  = 3;   // índice 0-based de la fila de cabecera (fila 4 en Excel = índice 3)
  const FILA_DAT  = 4;   // primera fila de datos
  const FILA_TOT  = wsData.length - 1;  // última fila

  // F1: Título
  ws1['A1'].s = estTitulo;
  // F2: Entidad
  ws1['A2'].s = estEntidad;

  // F4: Cabeceras
  const cabecerasNum = ['C','D','E','F','G','H','I','J','K','L'];
  ws1['A4'].s = estCabecera;
  ws1['B4'].s = estCabecera;
  cabecerasNum.forEach(c => { if (ws1[c+'4']) ws1[c+'4'].s = estCabeceraNum; });

  // Filas de datos (5 en adelante, sin la última que es total)
  for (let r = FILA_DAT + 1; r <= FILA_TOT; r++) {
    const excelRow = r + 1;  // Excel es 1-based
    const item     = resumen[r - FILA_DAT - 1];
    if (!item) continue;
    const par      = (r % 2 === 0);
    const esRestr  = limpiarTexto(item.tipo).includes('RESTRING');
    // Usar color de fondo basado en restricción para toda la fila
    const bgBase   = esRestr
      ? (par ? ROJO_CLARO : ROJO_MED)
      : (par ? BLANCO     : AZUL_CLARO);

    // Columna A (número)
    const cA = 'A' + excelRow;
    if (ws1[cA]) ws1[cA].s = celdaDato('', 'center', bgBase);

    // Columna B (tipo — con color por restricción)
    const cB = 'B' + excelRow;
    if (ws1[cB]) ws1[cB].s = celdaRestriccion(item.tipo, par);

    // Columnas numéricas
    ['C','D','F','G','I','K','L'].forEach(col => {
      const ref = col + excelRow;
      if (ws1[ref]) {
        ws1[ref].s = celdaDato('', 'right', bgBase);
        ws1[ref].z = '#,##0';
        ws1[ref].t = 'n';
      }
    });

    // Columnas porcentaje
    ['E','H','J'].forEach(col => {
      const ref = col + excelRow;
      if (ws1[ref]) {
        ws1[ref].s = celdaDato('', 'center', bgBase);
        ws1[ref].z = '0.0%';
        ws1[ref].t = 'n';
      }
    });
  }

  // Fila Total
  const rowTotal = FILA_TOT + 1;
  COLS.forEach((col, idx) => {
    const ref = col + rowTotal;
    if (ws1[ref]) {
      ws1[ref].s = idx === 1 ? estTotalTxt : estTotal;
      if (idx >= 2) {
        ws1[ref].z = [4, 7, 9].includes(idx) ? '0.0%' : '#,##0';
        ws1[ref].t = 'n';
      }
    }
  });

  // Fusionar celdas de título y entidad
  ws1['!merges'] = [
    { s: { r:0, c:0 }, e: { r:0, c: NUM_COLS-1 } },
    { s: { r:1, c:0 }, e: { r:1, c: NUM_COLS-1 } },
    { s: { r: rowTotal-1, c:0 }, e: { r: rowTotal-1, c:1 } }
  ];

  // Anchos de columna
  ws1['!cols'] = [
    { wch: 4  },   // A N°
    { wch: 42 },   // B Tipo
    { wch: 14 },   // C PIA
    { wch: 14 },   // D PIM
    { wch: 10 },   // E %
    { wch: 14 },   // F Certificado
    { wch: 14 },   // G Compromiso
    { wch: 10 },   // H % Cert
    { wch: 14 },   // I Devengado
    { wch: 10 },   // J % Dev
    { wch: 14 },   // K Saldo cert
    { wch: 14 }    // L Saldo dev
  ];

  // Alto de filas especiales
  ws1['!rows'] = [ { hpt: 30 }, { hpt: 24 }, { hpt: 6 }, { hpt: 40 } ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Resumen Ejecutivo');

  // ═══════════════════════════════════════════════════
  //  HOJA 2: DETALLE POR PRODUCTO/PROYECTO
  // ═══════════════════════════════════════════════════

  const acumuladoProyecto = {};
  datosExcel.forEach(item => {
    const nombre = item.producto_proyecto || 'SIN NOMBRE';
    if (!acumuladoProyecto[nombre]) {
      acumuladoProyecto[nombre] = { pim: 0, devengado: 0 };
    }
    acumuladoProyecto[nombre].pim += Number(item.mto_pim || 0);
    for (let i = 1; i <= 12; i++) {
      acumuladoProyecto[nombre].devengado +=
        Number(item['mto_devenga_' + String(i).padStart(2,'0')] || 0);
    }
  });

  const proyectos = Object.entries(acumuladoProyecto)
    .sort((a, b) => b[1].pim - a[1].pim);

  const ws2Data = [];
  ws2Data.push(['🚀 zaZA PRESUPUESTO — Detalle por Producto / Proyecto', '','','','']);
  ws2Data.push([`Entidad: ${ejecutora}  |  Corte: ${fechaTxt}`, '','','','']);
  ws2Data.push(['','','','','']);
  ws2Data.push(['N°','PRODUCTO / PROYECTO','PIM','DEVENGADO','% EJECUCIÓN']);

  let ptotPIM = 0, ptotDev = 0;
  proyectos.forEach(([nombre, vals], i) => {
    ptotPIM += vals.pim;
    ptotDev += vals.devengado;
    const ejec = vals.pim > 0 ? vals.devengado / vals.pim : 0;
    ws2Data.push([ i+1, nombre, vals.pim, vals.devengado, ejec ]);
  });
  const totalEjec = ptotPIM > 0 ? ptotDev / ptotPIM : 0;
  ws2Data.push(['', 'TOTAL GENERAL', ptotPIM, ptotDev, totalEjec]);

  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);

  const COLS2 = ['A','B','C','D','E'];
  const cabH2 = {
    font:      { bold: true, color: { rgb: BLANCO }, sz: 11 },
    fill:      { patternType: 'solid', fgColor: { rgb: AZUL_MEDIO } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border:    borde()
  };

  ['A4','B4'].forEach(r => { if (ws2[r]) ws2[r].s = { ...cabH2, alignment: { horizontal: r==='B4'?'left':'center', vertical:'center' } }; });
  ['C4','D4','E4'].forEach(r => { if (ws2[r]) ws2[r].s = cabH2; });

  ws2['A1'].s = estTitulo;
  ws2['A2'].s = estEntidad;

  for (let r = 5; r <= ws2Data.length; r++) {
    const isTotal = (r === ws2Data.length);
    const par     = (r % 2 === 0);
    const bg      = isTotal ? VERDE_OSCURO : (par ? BLANCO : AZUL_CLARO);
    const fontClr = isTotal ? BLANCO : GRIS_TEXTO;

    COLS2.forEach((col, ci) => {
      const ref = col + r;
      if (!ws2[ref]) return;
      ws2[ref].s = {
        font:      { bold: isTotal, sz: 9, color: { rgb: fontClr } },
        fill:      { patternType: 'solid', fgColor: { rgb: bg } },
        alignment: { horizontal: ci === 1 ? 'left' : ci === 4 ? 'center' : 'right', vertical: 'center' },
        border:    borde()
      };
      if (ci >= 2) {
        ws2[ref].t = 'n';
        ws2[ref].z = ci === 4 ? '0.0%' : '#,##0';
      }
    });
  }

  ws2['!merges'] = [
    { s: { r:0, c:0 }, e: { r:0, c:4 } },
    { s: { r:1, c:0 }, e: { r:1, c:4 } },
    { s: { r: ws2Data.length-1, c:0 }, e: { r: ws2Data.length-1, c:1 } }
  ];

  ws2['!cols'] = [
    { wch: 4  },
    { wch: 55 },
    { wch: 16 },
    { wch: 16 },
    { wch: 12 }
  ];

  ws2['!rows'] = [ { hpt: 30 }, { hpt: 24 }, { hpt: 6 }, { hpt: 40 } ];

  XLSX.utils.book_append_sheet(wb, ws2, 'Productos y Proyectos');

  // ═══════════════════════════════════════════════════
  //  EXPORTAR
  // ═══════════════════════════════════════════════════

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  const nombreArchivo = `zaZA_Presupuesto_${fechaArchivo}.xlsx`;

  XLSX.writeFile(wb, nombreArchivo, { bookType: 'xlsx', cellStyles: true });
}
