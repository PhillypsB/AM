// app.js

let resumenGlobal = {};
let detalleGlobal = [];

/* =========================
   AUTO CARGA
========================= */

document
.getElementById("fileInput")
.addEventListener(
  "change",
  async function(e){

    const file =
      e.target.files[0];

    if(!file) return;

    document
    .getElementById(
      "fileName"
    )
    .innerHTML =
      `✅ ${file.name}`;

    iniciarLoader();

    await procesarExcel(file);

  }
);

/* =========================
   PROCESAR
========================= */

async function procesarExcel(file){

  const reader =
    new FileReader();

  reader.onload =
  async function(e){

    actualizarLoader(
      10,
      "Leyendo archivo Excel..."
    );

    await pausa();

    const workbook =
      XLSX.read(
        new Uint8Array(
          e.target.result
        ),
        {
          type:"array"
        }
      );

    actualizarLoader(
      30,
      "Procesando hoja..."
    );

    await pausa();

    const sheet =
      workbook.Sheets[
        workbook.SheetNames[0]
      ];

    const raw =
      XLSX.utils.sheet_to_json(
        sheet,
        {
          raw:true,
          defval:0
        }
      );

    actualizarLoader(
      50,
      "Calculando indicadores..."
    );

    await pausa();

    const procesado =
      transformarDatos(raw);

    resumenGlobal =
      procesado.resumen;

    detalleGlobal =
      procesado.detalle;

    actualizarLoader(
      70,
      "Generando visualizaciones..."
    );

    await pausa();

    requestAnimationFrame(()=>{

      renderKPIs();

      renderChart();

      renderInsights();

      mostrarPaneles();

      guardarFechaArchivo(
        file.name
      );

    });

    actualizarLoader(
      100,
      "Proceso completado"
    );

    setTimeout(()=>{

      finalizarLoader();

    },500);

  };

  reader.readAsArrayBuffer(file);

}

/* =========================
   TRANSFORMAR
========================= */

function transformarDatos(data){

  let pim = 0;
  let certificado = 0;
  let devengado = 0;
  let girado = 0;
  let pagado = 0;

  const detalle = [];

  for(const r of data){

    const item = {

      programa:
        r["programa_pptal"],

      pim:
        num(r["mto_pim"]),

      certificado:
        num(r["mto_certificado"]),

      devengado:
        sumarMeses(
          r,
          "mto_devenga"
        ),

      girado:
        sumarMeses(
          r,
          "mto_girado"
        ),

      pagado:
        sumarMeses(
          r,
          "mto_pagado"
        )

    };

    pim += item.pim;
    certificado += item.certificado;
    devengado += item.devengado;
    girado += item.girado;
    pagado += item.pagado;

    detalle.push(item);

  }

  return {

    resumen:{
      pim,
      certificado,
      devengado,
      girado,
      pagado
    },

    detalle

  };

}

/* =========================
   HELPERS
========================= */

function num(v){

  return Number(v || 0);

}

function money(v){

  return "S/ " +
    Number(v)
    .toLocaleString(
      "es-PE",
      {
        maximumFractionDigits:0
      }
    );

}

function pausa(){

  return new Promise(
    resolve =>
      setTimeout(resolve,50)
  );

}

function sumarMeses(
  row,
  prefijo
){

  let total = 0;

  for(let i=1;i<=12;i++){

    total +=
      num(
        row[
          `${prefijo}_${String(i)
          .padStart(2,"0")}`
        ]
      );

  }

  return total;

}

/* =========================
   KPIS
========================= */

function renderKPIs(){

  const r =
    resumenGlobal;

  const ejec =
    r.pim
      ? (
          (r.devengado/r.pim)
          *100
        ).toFixed(2)
      : 0;

  document
  .getElementById(
    "kpiPim"
  )
  .innerText =
    money(r.pim);

  document
  .getElementById(
    "kpiCert"
  )
  .innerText =
    money(r.certificado);

  document
  .getElementById(
    "kpiDev"
  )
  .innerText =
    money(r.devengado);

  document
  .getElementById(
    "kpiGir"
  )
  .innerText =
    money(r.girado);

  document
  .getElementById(
    "kpiPag"
  )
  .innerText =
    money(r.pagado);

  document
  .getElementById(
    "kpiEjec"
  )
  .innerText =
    ejec + "%";

}

/* =========================
   CHART
========================= */

function renderChart(){

  const top =
    [...detalleGlobal]

    .sort(
      (a,b)=>
        b.devengado
        - a.devengado
    )

    .slice(0,10);

  const labels =
    top.map(x=>x.programa);

  const data =
    top.map(x=>x.devengado);

  document
  .querySelector("#chart")
  .innerHTML = "";

  new ApexCharts(

    document.querySelector("#chart"),

    {

      chart:{
        type:"bar",
        height:420,
        toolbar:{
          show:false
        }
      },

      series:[
        {
          name:"Devengado",
          data
        }
      ],

      xaxis:{
        categories:labels
      },

      dataLabels:{
        enabled:false
      }

    }

  ).render();

}

/* =========================
   INSIGHTS
========================= */

function renderInsights(){

  const r =
    resumenGlobal;

  const ejec =
    r.pim
      ? (
          (r.devengado/r.pim)
          *100
        ).toFixed(2)
      : 0;

  document
  .getElementById(
    "insights"
  )
  .innerHTML = `

    <div class="insight">
      📊 La ejecución presupuestal actual alcanza el
      <strong>${ejec}%</strong>
      del PIM.
    </div>

    <div class="insight">
      💰 El monto devengado asciende a
      <strong>${money(r.devengado)}</strong>.
    </div>

    <div class="insight">
      🏦 El monto girado total es de
      <strong>${money(r.girado)}</strong>.
    </div>

  `;

}

/* =========================
   MOSTRAR
========================= */

function mostrarPaneles(){

  document
  .getElementById(
    "headerInfo"
  )
  .classList
  .remove("hidden");

  document
  .getElementById(
    "kpiSection"
  )
  .classList
  .remove("hidden");

  document
  .getElementById(
    "chartSection"
  )
  .classList
  .remove("hidden");

  document
  .getElementById(
    "insightSection"
  )
  .classList
  .remove("hidden");

}

/* =========================
   FECHA
========================= */

function guardarFechaArchivo(nombre){

  const regex =
    /(\d{4}-\d{2}-\d{2})T(\d{2})(\d{2})(\d{2})/;

  const match =
    nombre.match(regex);

  if(!match) return;

  const texto =
    `${match[1]} ${match[2]}:${match[3]}:${match[4]}`;

  document
  .getElementById(
    "fechaActualizacion"
  )
  .innerText = texto;

}

/* =========================
   LOADER
========================= */

function iniciarLoader(){

  document
  .getElementById(
    "loader"
  )
  .classList
  .remove("hidden");

}

function actualizarLoader(
  porcentaje,
  texto
){

  document
  .getElementById(
    "progressBar"
  )
  .style.width =
    porcentaje + "%";

  document
  .getElementById(
    "progressLabel"
  )
  .innerText =
    porcentaje + "%";

  document
  .getElementById(
    "loaderText"
  )
  .innerText =
    texto;

}

function finalizarLoader(){

  document
  .getElementById(
    "loader"
  )
  .classList
  .add("hidden");

}

/* =========================
   DARK MODE
========================= */

function toggleTheme(){

  document.body
  .classList
  .toggle("dark");

  localStorage.setItem(
    "zaza_theme",

    document.body
    .classList
    .contains("dark")
      ? "dark"
      : "light"
  );

  actualizarTheme();

}

function actualizarTheme(){

  document
  .getElementById(
    "themeBtn"
  )
  .innerHTML =

    document.body
    .classList
    .contains("dark")

    ? "☀️"
    : "🌙";

}

window.addEventListener(
  "DOMContentLoaded",
  ()=>{

    if(
      localStorage.getItem(
        "zaza_theme"
      ) === "dark"
    ){

      document.body
      .classList
      .add("dark");

    }

    actualizarTheme();

  }
);
