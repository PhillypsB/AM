// app.js

let dataGlobal = [];

/* =========================
   AUTO CARGA
========================= */

document
.getElementById("fileInput")
.addEventListener(
  "change",
  function(e){

    const file =
      e.target.files[0];

    if(!file) return;

    document
    .getElementById(
      "archivoSeleccionado"
    )
    .innerHTML = `
      <div class="archivo-ok">
        ✅ Archivo seleccionado
        <br><br>
        <strong>${file.name}</strong>
      </div>
    `;

    setTimeout(()=>{
      procesarExcel();
    },700);

  }
);

/* =========================
   PROCESAR
========================= */

function procesarExcel(){

  const file =
    document.getElementById(
      "fileInput"
    ).files[0];

  if(!file) return;

  iniciarLoader();

  const inicio =
    performance.now();

  const reader =
    new FileReader();

  reader.onload = (e)=>{

    actualizarLoader(
      20,
      "Leyendo archivo..."
    );

    const wb =
      XLSX.read(
        new Uint8Array(
          e.target.result
        ),
        {
          type:"array"
        }
      );

    actualizarLoader(
      45,
      "Procesando información..."
    );

    const sheet =
      wb.Sheets[
        wb.SheetNames[0]
      ];

    const raw =
      XLSX.utils
      .sheet_to_json(sheet);

    dataGlobal =
      transformar(raw);

    actualizarLoader(
      70,
      "Calculando indicadores..."
    );

    renderKPIs(dataGlobal);

    renderChart(dataGlobal);

    renderTabla(dataGlobal);

    renderInsights(dataGlobal);

    renderFiltros(dataGlobal);

    actualizarLoader(
      90,
      "Actualizando panel..."
    );

    guardarSnapshot(
      dataGlobal,
      file.name
    );

    finalizarLoader();

    const fin =
      performance.now();

    document
    .getElementById(
      "tiempoCarga"
    )
    .innerText =
      (
        (fin-inicio)/1000
      ).toFixed(2) + "s";

    document
    .getElementById(
      "totalRegistros"
    )
    .innerText =
      raw.length
      .toLocaleString();

  };

  reader.readAsArrayBuffer(file);

}

/* =========================
   TRANSFORMAR
========================= */

function transformar(data){

  return data.map(r => ({

    departamento:
      r["departamento_meta"],

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

  }));

}

/* =========================
   HELPERS
========================= */

function num(v){

  return Number(v || 0);

}

function sumarMeses(
  row,
  prefijo
){

  let total = 0;

  for(let i=1;i<=12;i++){

    const key =
      `${prefijo}_${String(i)
      .padStart(2,"0")}`;

    total +=
      num(row[key]);

  }

  return total;

}

function suma(data,key){

  return data.reduce(
    (a,b)=>
      a + (b[key] || 0)
  ,0);

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

/* =========================
   KPIS
========================= */

function renderKPIs(data){

  const pim =
    suma(data,"pim");

  const cert =
    suma(data,"certificado");

  const dev =
    suma(data,"devengado");

  const gir =
    suma(data,"girado");

  const pag =
    suma(data,"pagado");

  const ejec =
    pim
      ? ((dev/pim)*100)
      .toFixed(2)
      : 0;

  document
  .getElementById("pim")
  .innerText = money(pim);

  document
  .getElementById("certificado")
  .innerText = money(cert);

  document
  .getElementById("devengado")
  .innerText = money(dev);

  document
  .getElementById("girado")
  .innerText = money(gir);

  document
  .getElementById("pagado")
  .innerText = money(pag);

  document
  .getElementById("ejecucion")
  .innerText =
    ejec + "%";

}

/* =========================
   CHART
========================= */

function renderChart(data){

  const labels =
    data
    .slice(0,10)
    .map(x=>x.programa);

  const dev =
    data
    .slice(0,10)
    .map(x=>x.devengado);

  const gir =
    data
    .slice(0,10)
    .map(x=>x.girado);

  document
  .querySelector("#chart")
  .innerHTML = "";

  new ApexCharts(

    document.querySelector("#chart"),

    {

      chart:{
        type:"bar",
        height:420
      },

      series:[
        {
          name:"Devengado",
          data:dev
        },
        {
          name:"Girado",
          data:gir
        }
      ],

      xaxis:{
        categories:labels
      }

    }

  ).render();

}

/* =========================
   TABLA
========================= */

function renderTabla(data){

  if(
    $.fn.DataTable
    .isDataTable("#tabla")
  ){

    $("#tabla")
    .DataTable()
    .destroy();

  }

  const tbody =
    document.querySelector(
      "#tabla tbody"
    );

  tbody.innerHTML = "";

  data.slice(0,300)
  .forEach(r => {

    tbody.innerHTML += `
      <tr>
        <td>${r.programa}</td>
        <td>${money(r.pim)}</td>
        <td>${money(r.certificado)}</td>
        <td>${money(r.devengado)}</td>
        <td>${money(r.girado)}</td>
      </tr>
    `;

  });

  $("#tabla")
  .DataTable({
    pageLength:10
  });

}

/* =========================
   FILTROS
========================= */

function renderFiltros(data){

  const dep =
    document.getElementById(
      "filterDepartamento"
    );

  const prog =
    document.getElementById(
      "filterPrograma"
    );

  dep.innerHTML =
    '<option value="">Todos</option>';

  prog.innerHTML =
    '<option value="">Todos</option>';

  [
    ...new Set(
      data.map(
        x=>x.departamento
      )
    )
  ]
  .forEach(v => {

    dep.innerHTML += `
      <option value="${v}">
        ${v}
      </option>
    `;

  });

  [
    ...new Set(
      data.map(
        x=>x.programa
      )
    )
  ]
  .forEach(v => {

    prog.innerHTML += `
      <option value="${v}">
        ${v}
      </option>
    `;

  });

}

function aplicarFiltros(){

  const dep =
    document.getElementById(
      "filterDepartamento"
    ).value;

  const prog =
    document.getElementById(
      "filterPrograma"
    ).value;

  let filtrado =
    [...dataGlobal];

  if(dep){

    filtrado =
      filtrado.filter(
        x =>
          x.departamento
          === dep
      );

  }

  if(prog){

    filtrado =
      filtrado.filter(
        x =>
          x.programa
          === prog
      );

  }

  renderKPIs(filtrado);

  renderChart(filtrado);

  renderTabla(filtrado);

}

/* =========================
   INSIGHTS
========================= */

function renderInsights(data){

  const el =
    document.getElementById(
      "insights"
    );

  el.innerHTML = "";

  const total =
    suma(data,"devengado");

  el.innerHTML += `
    <div class="insight">
      📊 Devengado total:
      <strong>${money(total)}</strong>
    </div>
  `;

}

/* =========================
   FECHA
========================= */

function guardarSnapshot(
  data,
  fileName
){

  const meta =
    extraerFechaArchivo(
      fileName
    );

  const texto =
    meta
      ? `${meta.fecha} · ${meta.hora}`
      : "Sin información";

  document
  .getElementById(
    "fechaActualizacion"
  )
  .innerText = texto;

  guardarHistorial(texto);

}

function extraerFechaArchivo(nombre){

  const regex =
    /(\d{4}-\d{2}-\d{2})T(\d{2})(\d{2})(\d{2})/;

  const match =
    nombre.match(regex);

  if(!match){
    return null;
  }

  return {

    fecha:match[1],

    hora:
      `${match[2]}:${match[3]}:${match[4]}`

  };

}

/* =========================
   HISTORIAL
========================= */

function guardarHistorial(
  fecha
){

  let historial =
    JSON.parse(
      localStorage.getItem(
        "zaza_historial"
      )
    ) || [];

  if(!historial.includes(fecha)){

    historial.unshift(fecha);

  }

  localStorage.setItem(
    "zaza_historial",
    JSON.stringify(historial)
  );

  renderHistorial();

}

function renderHistorial(){

  const historial =
    JSON.parse(
      localStorage.getItem(
        "zaza_historial"
      )
    ) || [];

  const select =
    document.getElementById(
      "selectorHistorial"
    );

  select.innerHTML = "";

  historial.forEach(h => {

    select.innerHTML += `
      <option>${h}</option>
    `;

  });

}

/* =========================
   LOADER
========================= */

function iniciarLoader(){

  document
  .getElementById(
    "loaderOverlay"
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
  .innerText = texto;

}

function finalizarLoader(){

  actualizarLoader(
    100,
    "Proceso finalizado"
  );

  setTimeout(()=>{

    document
    .getElementById(
      "loaderOverlay"
    )
    .classList
    .add("hidden");

  },700);

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

  updateThemeButton();

}

function updateThemeButton(){

  document
  .getElementById(
    "themeToggle"
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

    updateThemeButton();

    renderHistorial();

  }
);
