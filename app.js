// =======================================================
// zaZA PRESUPUESTO
// Plataforma Ejecutiva de Inteligencia Presupuestal
// =======================================================

let datosExcel = [];

let grafico = null;

let vistaGerencial = true;

// =======================================================
// FOOTER OCULTO AL INICIO
// =======================================================

document
.querySelector(".pie")
.classList
.add("oculto");

// =======================================================
// CURSOR
// =======================================================

const cursor =
  document.getElementById(
    "cursor"
  );

document.addEventListener(
  "mousemove",
  (e)=>{

    cursor.style.left =
      e.clientX + "px";

    cursor.style.top =
      e.clientY + "px";

  }
);

// =======================================================
// CAMBIAR TEMA
// =======================================================

function cambiarTema(){

  document.body
  .classList
  .toggle("oscuro");

  const boton =
    document.getElementById(
      "botonTema"
    );

  boton.innerText =
    document.body
    .classList
    .contains("oscuro")
      ? "☀️"
      : "🌙";

}

// =======================================================
// CAMBIAR VISTA
// =======================================================

function cambiarVista(){

  vistaGerencial =
    !vistaGerencial;

  const boton =
    document.getElementById(
      "botonVista"
    );

  boton.innerText =
    vistaGerencial
      ? "📊"
      : "🧾";

  alert(
    vistaGerencial
      ? "Vista Gerencial activada"
      : "Vista Operativa activada"
  );

}

// =======================================================
// DRAG & DROP
// =======================================================

const zonaSoltar =
  document.getElementById(
    "zonaSoltar"
  );

window.addEventListener(
  "dragenter",
  (e)=>{

    e.preventDefault();

    zonaSoltar
    .classList
    .remove("oculto");

  }
);

window.addEventListener(
  "dragover",
  (e)=>{

    e.preventDefault();

  }
);

window.addEventListener(
  "dragleave",
  (e)=>{

    if(
      e.clientX === 0 &&
      e.clientY === 0
    ){

      zonaSoltar
      .classList
      .add("oculto");

    }

  }
);

window.addEventListener(
  "drop",
  (e)=>{

    e.preventDefault();

    zonaSoltar
    .classList
    .add("oculto");

    const archivo =
      e.dataTransfer.files[0];

    validarArchivo(
      archivo
    );

  }
);

// =======================================================
// INPUT ARCHIVO
// =======================================================

document
.getElementById(
  "archivoExcel"
)
.addEventListener(
  "change",
  (e)=>{

    const archivo =
      e.target.files[0];

    validarArchivo(
      archivo
    );

  }
);

// =======================================================
// VALIDAR ARCHIVO
// =======================================================

function validarArchivo(
  archivo
){

  if(!archivo){
    return;
  }

  const extension =
    archivo.name
    .split(".")
    .pop()
    .toLowerCase();

  if(extension !== "xls"){

    mostrarError();

    return;
  }

  document
  .getElementById(
    "nombreArchivo"
  )
  .innerText =
    archivo.name;

  procesarExcel(
    archivo
  );

}

// =======================================================
// ERROR
// =======================================================

function mostrarError(){

  document
  .getElementById(
    "mensajeError"
  )
  .classList
  .remove("oculto");

}

function cerrarError(){

  document
  .getElementById(
    "mensajeError"
  )
  .classList
  .add("oculto");

}

// =======================================================
// FORMATO MONEDA
// =======================================================

function moneda(valor){

  return new Intl
  .NumberFormat(
    "es-PE",
    {
      style:"currency",
      currency:"PEN",
      maximumFractionDigits:0
    }
  )
  .format(valor);

}

// =======================================================
// ESPERAR
// =======================================================

function esperar(ms){

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        ms
      )
  );

}

// =======================================================
// ACTUALIZAR CARGA
// =======================================================

function actualizarCarga(
  porcentaje,
  texto
){

  document
  .getElementById(
    "barraCarga"
  )
  .style.width =
    porcentaje + "%";

  document
  .getElementById(
    "porcentajeCarga"
  )
  .innerText =
    porcentaje + "%";

  document
  .getElementById(
    "textoCarga"
  )
  .innerText =
    texto;

}

// =======================================================
// PROCESAR EXCEL
// =======================================================

async function procesarExcel(
  archivo
){

  const inicio =
    performance.now();

  const cargador =
    document.getElementById(
      "cargador"
    );

  cargador
  .classList
  .remove("oculto");

  actualizarCarga(
    5,
    "Leyendo archivo XLS..."
  );

  const reader =
    new FileReader();

  reader.onload =
  async function(e){

    try{

      await esperar(120);

      actualizarCarga(
        20,
        "Interpretando información..."
      );

      const data =
        new Uint8Array(
          e.target.result
        );

      const workbook =
        XLSX.read(
          data,
          {
            type:"array"
          }
        );

      await esperar(120);

      actualizarCarga(
        45,
        "Procesando registros..."
      );

      const hoja =
        workbook.Sheets[
          workbook
          .SheetNames[0]
        ];

      const raw =
        XLSX.utils
        .sheet_to_json(
          hoja,
          {
            defval:0
          }
        );

      datosExcel = raw;

      await esperar(120);

      actualizarCarga(
        65,
        "Calculando indicadores..."
      );

      renderizarIndicadores(
        raw
      );

      actualizarEntidad(
        raw
      );

      actualizarFecha(
        archivo.name
      );

      await esperar(120);

      actualizarCarga(
        82,
        "Construyendo gráficos..."
      );

      renderizarGrafico(
        raw
      );

      renderizarProductos(
        raw
      );

      generarHallazgos(
        raw
      );

      document
      .getElementById(
        "seccionFiltros"
      )
      .classList
      .remove("oculto");

      document
      .getElementById(
        "seccionExportar"
      )
      .classList
      .remove("oculto");

      await esperar(120);

      actualizarCarga(
        100,
        "Finalizando..."
      );

      const fin =
        performance.now();

      const tiempo =
        (
          (fin-inicio)
          /1000
        )
        .toFixed(2);

      document
      .getElementById(
        "pieTiempo"
      )
      .innerText =
        "⚡ Tiempo de carga: "
        + tiempo
        + " segundos";

      document
      .getElementById(
        "pieRegistros"
      )
      .innerText =
        "📂 Registros procesados: "
        + raw.length
        .toLocaleString();

      setTimeout(()=>{

        cargador
        .classList
        .add("oculto");

        document
        .getElementById(
          "seccionCarga"
        )
        .style.display =
          "none";

        document
        .querySelector(".pie")
        .classList
        .remove("oculto");

      },500);

    }catch(error){

      console.error(error);

      mostrarError();

      cargador
      .classList
      .add("oculto");

    }

  };

  reader.readAsArrayBuffer(
    archivo
  );

}

// =======================================================
// ACTUALIZAR ENTIDAD
// =======================================================

function actualizarEntidad(
  data
){

  if(!data.length){
    return;
  }

  const fila =
    data[0];

  const ministerio =
    (
      fila.pliego || ""
    )
    .split(".")
    .slice(1)
    .join(".")
    .trim();

  const programa =
    (
      fila.unidad_ejecutora || ""
    )
    .split(".")
    .slice(1)
    .join(".")
    .trim();

  document
  .getElementById(
    "tituloEntidad"
  )
  .innerHTML =
    `
      ${ministerio}
      <br>
      ${programa}
    `;

  document
  .getElementById(
    "entidadCabecera"
  )
  .innerHTML =
    `
      ${ministerio}
      <br>
      ${programa}
    `;

  document
  .getElementById(
    "seccionEntidad"
  )
  .classList
  .remove("oculto");

  document
  .getElementById(
    "informacionCabecera"
  )
  .classList
  .remove("oculto");

}

// =======================================================
// FECHA
// =======================================================

function actualizarFecha(
  nombre
){

  const regex =
    /(\d{4})-(\d{2})-(\d{2})T(\d{2})(\d{2})(\d{2})/;

  const match =
    nombre.match(regex);

  if(!match){
    return;
  }

  const fecha =
    `${match[3]}/${match[2]}/${match[1]}`;

  const hora =
    `${match[4]}:${match[5]}:${match[6]}`;

  const texto =
    fecha + " " + hora;

  document
  .getElementById(
    "fechaActualizacion"
  )
  .innerText =
    texto;

  document
  .getElementById(
    "pieActualizado"
  )
  .innerText =
    "📅 Corte de datos: "
    + texto;

}

// =======================================================
// INDICADORES
// =======================================================

function renderizarIndicadores(
  data
){

  let pim = 0;
  let certificado = 0;
  let devengado = 0;
  let girado = 0;
  let pagado = 0;

  data.forEach(item=>{

    pim +=
      Number(
        item.mto_pim || 0
      );

    certificado +=
      Number(
        item.mto_certificado || 0
      );

    for(let i=1;i<=12;i++){

      const mes =
        String(i)
        .padStart(2,"0");

      devengado +=
        Number(
          item[
            "mto_devenga_"
            + mes
          ] || 0
        );

      girado +=
        Number(
          item[
            "mto_girado_"
            + mes
          ] || 0
        );

      pagado +=
        Number(
          item[
            "mto_pagado_"
            + mes
          ] || 0
        );

    }

  });

  const ejecucion =
    pim > 0
      ? (
          devengado
          / pim
        ) * 100
      : 0;

  document
  .getElementById(
    "kpiPim"
  )
  .innerText =
    moneda(pim);

  document
  .getElementById(
    "kpiCert"
  )
  .innerText =
    moneda(certificado);

  document
  .getElementById(
    "kpiDev"
  )
  .innerText =
    moneda(devengado);

  document
  .getElementById(
    "kpiGir"
  )
  .innerText =
    moneda(girado);

  document
  .getElementById(
    "kpiPag"
  )
  .innerText =
    moneda(pagado);

  document
  .getElementById(
    "kpiEjec"
  )
  .innerText =
    ejecucion
    .toFixed(1)
    + "%";

  document
  .getElementById(
    "seccionIndicadores"
  )
  .classList
  .remove("oculto");

}

// =======================================================
// PRODUCTOS / PROYECTOS
// =======================================================

function renderizarProductos(
  data
){

  const acumulado = {};

  data.forEach(item=>{

    const nombre =
      item.producto_proyecto
      || "SIN NOMBRE";

    if(!acumulado[nombre]){

      acumulado[nombre] = 0;

    }

    acumulado[nombre] +=
      Number(
        item.mto_pim || 0
      );

  });

  const lista =
    Object.entries(
      acumulado
    )
    .sort(
      (a,b)=>
        b[1]-a[1]
    )
    .slice(0,12);

  const maximo =
    lista[0]
      ? lista[0][1]
      : 1;

  let html = "";

  lista.forEach(item=>{

    const porcentaje =
      (
        item[1]
        / maximo
      ) * 100;

    html += `

      <div class="producto-item">

        <div class="producto-top">

          <strong>
            ${item[0]}
          </strong>

        </div>

        <div class="producto-barra">

          <div
            class="producto-barra-fill"
            style="
              width:${porcentaje}%
            "
          ></div>

        </div>

        <div class="producto-valores">

          <span>
            PIM
          </span>

          <strong>
            ${moneda(item[1])}
          </strong>

        </div>

      </div>

    `;

  });

  document
  .getElementById(
    "contenedorProductos"
  )
  .innerHTML =
    html;

  document
  .getElementById(
    "seccionProductos"
  )
  .classList
  .remove("oculto");

}

// =======================================================
// GRAFICO
// =======================================================

function renderizarGrafico(
  data
){

  const resumen = {};

  data.forEach(item=>{

    const nombre =
      item.programa_pptal
      || "SIN NOMBRE";

    if(!resumen[nombre]){

      resumen[nombre] = 0;

    }

    resumen[nombre] +=
      Number(
        item.mto_pim || 0
      );

  });

  const categorias =
    Object.keys(resumen)
    .slice(0,8);

  const valores =
    Object.values(resumen)
    .slice(0,8);

  if(grafico){

    grafico.destroy();

  }

  grafico =
    new ApexCharts(
      document.querySelector(
        "#grafico"
      ),
      {
        chart:{
          type:"bar",
          height:360,
          toolbar:{
            show:false
          }
        },

        series:[
          {
            name:"PIM",
            data:valores
          }
        ],

        xaxis:{
          categories:categorias
        },

        dataLabels:{
          enabled:false
        },

        colors:[
          "#2563eb"
        ]
      }
    );

  grafico.render();

  document
  .getElementById(
    "seccionGrafico"
  )
  .classList
  .remove("oculto");

}

// =======================================================
// HALLAZGOS
// =======================================================

function generarHallazgos(
  data
){

  const hallazgos = [];

  hallazgos.push(
    "🚀 Información procesada correctamente."
  );

  hallazgos.push(
    "📊 Registros analizados: "
    + data.length
    .toLocaleString()
  );

  hallazgos.push(
    "⚡ Plataforma optimizada para análisis rápido."
  );

  let html = "";

  hallazgos.forEach(h=>{

    html += `
      <div class="hallazgo">
        ${h}
      </div>
    `;

  });

  document
  .getElementById(
    "hallazgos"
  )
  .innerHTML =
    html;

  document
  .getElementById(
    "seccionHallazgos"
  )
  .classList
  .remove("oculto");

}

// =======================================================
// EXPORTAR
// =======================================================

function accionExportar(
  tipo
){

  alert(
    "Próximamente exportación a "
    + tipo
  );

}
