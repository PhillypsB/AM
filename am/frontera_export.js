/* frontera_export.js — exportación del ámbito especial FRONTERAS al libro modelo.
 *
 * El modelo (Distritos de frontera.xlsx) trae logo, estilos, configuración de
 * impresión y fórmulas que SheetJS community no sabe reescribir. Por eso NO se
 * reconstruye el libro: se parchea el .xlsx original, que es un ZIP. Solo se
 * descomprimen, editan y recomprimen xl/worksheets/sheet2.xml (ACT.SAF) y
 * xl/worksheets/sheet3.xml (ACT.SCD); las demás entradas se copian tal cual.
 *
 * Celdas que se tocan, y ninguna otra:
 *   ACT.SAF  L6:L90 (familias SAF)         L91 (total)  M6:M90 (1/0)  M91 (total)
 *   ACT.SCD  L6:L90 (niñas y niños SCD)    L91 (total)  M6:M90 (1/0)  M91 (total)
 * Las fórmulas =SUM(L6:L90) y =SUM(M6:M90) de la fila 91 se conservan; solo se
 * actualiza su valor en caché para que el archivo muestre el total sin recalcular.
 */

const FR_HOJA = { SAF: 'xl/worksheets/sheet2.xml', SCD: 'xl/worksheets/sheet3.xml' };

/* El libro modelo pesa 74 KB y solo hace falta al exportar. En el laboratorio
 * viene con la página; en la estable se descarga en ese momento, por el mismo
 * cargador perezoso que usan jsPDF o SheetJS. Este archivo sirve a los dos. */
async function frModeloB64() {
  if (typeof FRONTERA_MODELO_B64 !== 'undefined') return FRONTERA_MODELO_B64;
  if (typeof asegurarLibs === 'function') await asegurarLibs(['frontera']);
  if (typeof FRONTERA_MODELO_B64 !== 'undefined') return FRONTERA_MODELO_B64;
  throw new Error('no se pudo cargar el libro modelo (frontera_modelo.js).');
}

/* ---------- utilidades binarias ---------- */

const FR_CRC_TABLA = (function () {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

function frCrc32(u8) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < u8.length; i++) c = FR_CRC_TABLA[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function frB64aBytes(b64) {
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
}

async function frInflar(u8) {
  const s = new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}

async function frDeflar(u8) {
  if (typeof CompressionStream === 'undefined') return null;
  const s = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}

/* ---------- lectura y escritura del ZIP ---------- */

function frLeerZip(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let eocd = -1;
  for (let i = u8.length - 22; i >= 0 && i > u8.length - 66000; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('El modelo embebido no es un ZIP válido (falta el EOCD).');

  const total = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const dec = new TextDecoder();
  const entradas = [];

  for (let n = 0; n < total; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('Cabecera central corrupta en la entrada ' + n + '.');
    const metodo   = dv.getUint16(p + 10, true);
    const hora     = dv.getUint16(p + 12, true);
    const fecha    = dv.getUint16(p + 14, true);
    const crc      = dv.getUint32(p + 16, true);
    const compSz   = dv.getUint32(p + 20, true);
    const origSz   = dv.getUint32(p + 24, true);
    const lgNombre = dv.getUint16(p + 28, true);
    const lgExtra  = dv.getUint16(p + 30, true);
    const lgComen  = dv.getUint16(p + 32, true);
    const attrExt  = dv.getUint32(p + 38, true);
    const offLocal = dv.getUint32(p + 42, true);
    const nombre   = dec.decode(u8.subarray(p + 46, p + 46 + lgNombre));

    const lgNomLocal = dv.getUint16(offLocal + 26, true);
    const lgExtLocal = dv.getUint16(offLocal + 28, true);
    const iniDatos   = offLocal + 30 + lgNomLocal + lgExtLocal;

    entradas.push({
      nombre: nombre, metodo: metodo, hora: hora, fecha: fecha, crc: crc,
      compSz: compSz, origSz: origSz, attrExt: attrExt,
      datos: u8.subarray(iniDatos, iniDatos + compSz)
    });
    p += 46 + lgNombre + lgExtra + lgComen;
  }
  return entradas;
}

function frEscribirZip(entradas) {
  const enc = new TextEncoder();
  const nombres = entradas.map(e => enc.encode(e.nombre));
  let tamano = 22;
  entradas.forEach((e, i) => { tamano += 30 + nombres[i].length + e.datos.length + 46 + nombres[i].length; });

  const out = new Uint8Array(tamano);
  const dv  = new DataView(out.buffer);
  const offsets = [];
  let o = 0;

  entradas.forEach((e, i) => {
    offsets.push(o);
    dv.setUint32(o, 0x04034b50, true);
    dv.setUint16(o + 4, 20, true);            // versión necesaria
    dv.setUint16(o + 6, 0, true);             // sin banderas: nada de descriptor de datos
    dv.setUint16(o + 8, e.metodo, true);
    dv.setUint16(o + 10, e.hora, true);
    dv.setUint16(o + 12, e.fecha, true);
    dv.setUint32(o + 14, e.crc, true);
    dv.setUint32(o + 18, e.datos.length, true);
    dv.setUint32(o + 22, e.origSz, true);
    dv.setUint16(o + 26, nombres[i].length, true);
    dv.setUint16(o + 28, 0, true);
    o += 30;
    out.set(nombres[i], o); o += nombres[i].length;
    out.set(e.datos, o);    o += e.datos.length;
  });

  const iniCentral = o;
  entradas.forEach((e, i) => {
    dv.setUint32(o, 0x02014b50, true);
    dv.setUint16(o + 4, 20, true);            // versión que lo creó
    dv.setUint16(o + 6, 20, true);            // versión necesaria
    dv.setUint16(o + 8, 0, true);
    dv.setUint16(o + 10, e.metodo, true);
    dv.setUint16(o + 12, e.hora, true);
    dv.setUint16(o + 14, e.fecha, true);
    dv.setUint32(o + 16, e.crc, true);
    dv.setUint32(o + 20, e.datos.length, true);
    dv.setUint32(o + 24, e.origSz, true);
    dv.setUint16(o + 28, nombres[i].length, true);
    dv.setUint16(o + 30, 0, true);            // extra
    dv.setUint16(o + 32, 0, true);            // comentario
    dv.setUint16(o + 34, 0, true);            // disco
    dv.setUint16(o + 36, 0, true);            // atributos internos
    dv.setUint32(o + 38, e.attrExt, true);
    dv.setUint32(o + 42, offsets[i], true);
    o += 46;
    out.set(nombres[i], o); o += nombres[i].length;
  });

  const tamCentral = o - iniCentral;
  dv.setUint32(o, 0x06054b50, true);
  dv.setUint16(o + 4, 0, true);
  dv.setUint16(o + 6, 0, true);
  dv.setUint16(o + 8, entradas.length, true);
  dv.setUint16(o + 10, entradas.length, true);
  dv.setUint32(o + 12, tamCentral, true);
  dv.setUint32(o + 16, iniCentral, true);
  dv.setUint16(o + 20, 0, true);
  return out.subarray(0, o + 22);
}

/* ---------- edición de celdas ---------- */

function frPonerNumero(xml, ref, valor) {
  const marca = '<c r="' + ref + '"';
  const i = xml.indexOf(marca);
  if (i < 0) throw new Error('El modelo no tiene la celda ' + ref + '.');
  const cierreApertura = xml.indexOf('>', i);
  const autoCerrada = xml.charAt(cierreApertura - 1) === '/';

  let apertura, interior, fin;
  if (autoCerrada) {
    apertura = xml.slice(i, cierreApertura - 1) + '>';
    interior = '';
    fin = cierreApertura + 1;
  } else {
    apertura = xml.slice(i, cierreApertura + 1);
    const cierre = xml.indexOf('</c>', cierreApertura);
    interior = xml.slice(cierreApertura + 1, cierre);
    fin = cierre + 4;
  }
  apertura = apertura.replace(/ t="[^"]*"/, '');   // numérica: sin atributo de tipo

  let formula = '';
  const f0 = interior.indexOf('<f');
  if (f0 >= 0) {
    const f1 = interior.indexOf('</f>');
    formula = (f1 >= 0) ? interior.slice(f0, f1 + 4) : interior.slice(f0, interior.indexOf('/>', f0) + 2);
  }
  return xml.slice(0, i) + apertura + formula + '<v>' + valor + '</v></c>' + xml.slice(fin);
}

function frPatchHoja(xml, valoresL, valoresM, totalL, totalM) {
  for (let k = 0; k < valoresL.length; k++) {
    const fila = 6 + k;
    xml = frPonerNumero(xml, 'L' + fila, valoresL[k]);
    xml = frPonerNumero(xml, 'M' + fila, valoresM[k]);
  }
  xml = frPonerNumero(xml, 'L91', totalL);
  xml = frPonerNumero(xml, 'M91', totalM);
  return xml;
}

/* ---------- cálculo de la cobertura ---------- */

function frCobertura(datos) {
  const porUbigeo = {};
  (datos || []).forEach(d => { porUbigeo[d.ubigeo] = d; });

  const saf = { L: [], M: [], totalL: 0, totalM: 0 };
  const scd = { L: [], M: [], totalL: 0, totalM: 0 };
  const sinPadron = [];

  FRONTERA_FILAS.forEach(f => {
    const d = porUbigeo[f[0]];
    if (!d) sinPadron.push(f);
    const familias = d ? Math.round(d.nfamilia_saf || 0) : 0;
    const ninos    = d ? Math.round(d['nniños_scd'] || 0) : 0;
    saf.L.push(familias); saf.M.push(familias > 0 ? 1 : 0);
    scd.L.push(ninos);    scd.M.push(ninos > 0 ? 1 : 0);
  });
  const suma = (a, b) => a + b;
  saf.totalL = saf.L.reduce(suma, 0); saf.totalM = saf.M.reduce(suma, 0);
  scd.totalL = scd.L.reduce(suma, 0); scd.totalM = scd.M.reduce(suma, 0);
  return { saf: saf, scd: scd, sinPadron: sinPadron };
}

/* ---------- exportador ---------- */

async function exportarExcelFronteras() {
  if (typeof DecompressionStream === 'undefined') {
    return alert('Este navegador no puede abrir el libro modelo. Use Chrome o Edge actualizado.');
  }
  const res = window.ultimoResultado;
  if (!res || res._ambito !== 'FRONTERAS') return alert('Primero consulte el ámbito especial FRONTERAS.');

  const btn = document.getElementById('btnExcel');
  const rotulo = btn ? btn.innerHTML : null;
  if (btn) { btn.disabled = true; btn.innerHTML = 'Generando…'; }

  try {
    const cob = frCobertura(res._datos);
    const entradas = frLeerZip(frB64aBytes(await frModeloB64()));
    const dec = new TextDecoder();
    const enc = new TextEncoder();

    for (const clave of ['SAF', 'SCD']) {
      const e = entradas.find(x => x.nombre === FR_HOJA[clave]);
      if (!e) throw new Error('El modelo no contiene ' + FR_HOJA[clave] + '.');
      const crudo = (e.metodo === 0) ? e.datos : await frInflar(e.datos);
      const c = (clave === 'SAF') ? cob.saf : cob.scd;
      const xml = frPatchHoja(dec.decode(crudo), c.L, c.M, c.totalL, c.totalM);

      const bytes = enc.encode(xml);
      const comprimido = await frDeflar(bytes);
      e.origSz = bytes.length;
      e.crc = frCrc32(bytes);
      if (comprimido && comprimido.length < bytes.length) { e.metodo = 8; e.datos = comprimido; }
      else { e.metodo = 0; e.datos = bytes; }
    }

    const salida = frEscribirZip(entradas);
    const nombre = 'Distritos_de_frontera_SAF_SCD_' + mesNombre + '_' + año + '.xlsx';
    // en la estable FileSaver tambien es perezoso; si no esta, se pide
    if (typeof saveAs !== 'function' && typeof asegurarLibs === 'function') {
      try { await asegurarLibs(['filesaver']); } catch (e) { /* queda el enlace */ }
    }
    const blob = new Blob([salida], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    if (typeof saveAs === 'function') saveAs(blob, nombre);
    else {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = nombre; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }

    let aviso = 'Libro modelo actualizado con el corte ' + mesNombre + ' ' + año + '.\n\n' +
                'ACT.SAF   ' + cob.saf.totalL.toLocaleString('es-PE') + ' familias en ' + cob.saf.totalM + ' distritos\n' +
                'ACT.SCD   ' + cob.scd.totalL.toLocaleString('es-PE') + ' niñas y niños en ' + cob.scd.totalM + ' distritos';
    if (cob.sinPadron.length) {
      aviso += '\n\nSin registro en el padrón (van en 0): ' +
               cob.sinPadron.map(f => f[3] + ' (' + f[0] + ')').join(', ');
    }
    alert(aviso);
  } catch (err) {
    console.error(err);
    alert('No se pudo generar el archivo: ' + err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = rotulo; }
  }
}
