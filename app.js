// app.js

let dataGlobal = [];

/* =========================
   PROCESAR EXCEL
========================= */

function procesarExcel(){

  const file =
    document.getElementById("fileInput")
    .files[0];

  if(!file){

    return alert(
      "📂 Selecciona un Excel"
    );

  }

  iniciarLoader();

  const start =
    performance.now();

  setTimeout(()=>{

    const reader =
      new FileReader();

    reader.onload = (e)=>{

      actualizarLoader(
        20,
        "📖 Leyendo Excel..."
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
        "🧹 Normalizando..."
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
        65,
        "📊 Calculando KPIs..."
      );

      renderKPIs(dataGlobal);

      actualizarLoader(
        80,
        "📈 Generando gráficos..."
      );

      renderChart(dataGlobal);

      renderTabla(dataGlobal);

      renderInsights(dataGlobal);

      renderFiltros(dataGlobal);

      actualizarLoader(
        95,
        "💾 Guardando snapshot..."
      );

      guardarSnapshot(
        dataGlobal,
        file.name
      );

      finalizarLoader();

      document
        .getElementById(
          "uploadSection"
        )
        .style.display = "none";

      const end =
        performance.now();

      document
        .getElementById(
          "tiempoCarga"
        )
        .innerText =
          (
            (end-start)/1000
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

  },400);

}

/* =========================
   TRANSFORMACIÓN
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
      sumMeses(
        r,
        "mto_devenga"
      ),

    girado:
      sumMeses(
        r,
        "mto_girado"
      ),

    pagado:
      sumMeses(
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

function sumMeses(
  row,
  prefix
){

  let total = 0;

  for(let i=1;i<=12;i++){

    const key =
      `${prefix}_${String(i)
      .padStart(2,"0")}`;

    total +=
      num(row[key]);

  }

  return total;

}

function sum(
  data,
  key
){

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

function set(id,val){

  const el =
    document.getElementById(id);

  if(el){

    el.innerText = val;

  }

}

/* =========================
   KPIS
========================= */

function renderKPIs(data){

  const pim =
    sum(data,"pim");

  const cert =
    sum(data,"certificado");

  const dev =
    sum(data,"devengado");

  const gir =
    sum(data,"girado");

  const pag =
    sum(data,"pagado");

  const ejec =
    pim
      ? ((dev/pim)*100)
        .toFixed(2)
      : 0;

  set("pim", money(pim));

  set(
    "certificado",
    money(cert)
  );

  set(
    "devengado",
    money(dev)
  );

  set(
    "girado",
    money(gir)
  );

  set(
    "pagado",
    money(pag)
  );

  set(
    "ejecucion",
    ejec + "%"
  );

}

/* =========================
   CHART
========================= */

function renderChart(data){

  const grouped =
    groupBy(
      data,
      "programa"
    );

  const labels =
    Object.keys(grouped)
    .slice(0,10);

  const dev =
    labels.map(k =>
      sum(
        grouped[k],
        "devengado"
      )
    );

  const gir =
    labels.map(k =>
      sum(
        grouped[k],
        "girado"
      )
    );

  document
    .querySelector("#chart")
    .innerHTML = "";

  new ApexCharts(

    document
    .querySelector("#chart"),

    {

      chart:{
        type:"bar",
        height:420,
        toolbar:{
          show:false
        }
      },

      theme:{
        mode:
          document.body
          .classList
          .contains("dark")
          ? "dark"
          : "light"
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
      },

      colors:[
        "#2563eb",
        "#10b981"
      ]

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
   GROUP BY
========================= */

function groupBy(arr,key){

  return arr.reduce(
    (acc,item)=>{

      const k =
        item[key]
        || "SIN_DATA";

      if(!acc[k]){
        acc[k]=[];
      }

      acc[k].push(item);

      return acc;

    },{}
  );

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
  .sort()
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
  .sort()
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

  let filtered =
    [...dataGlobal];

  if(dep){

    filtered =
      filtered.filter(
        x =>
          x.departamento
          === dep
      );

  }

  if(prog){

    filtered =
      filtered.filter(
        x =>
          x.programa
          === prog
      );

  }

  renderKPIs(filtered);

  renderChart(filtered);

  renderTabla(filtered);

  renderInsights(filtered);

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

  const topPrograma =
    Object.entries(
      groupBy(
        data,
        "programa"
      )
    )
    .map(([k,v]) => ({
      programa:k,
      total:sum(
        v,
        "devengado"
      )
    }))
    .sort(
      (a,b)=>
        b.total-a.total
    )[0];

  el.innerHTML += `
    <div class="insight">
      🏆 Mayor ejecución:
      <strong>
        ${topPrograma.programa}
      </strong>
    </div>
  `;

  const ejec =
    (
      sum(data,"devengado")
      /
      sum(data,"pim")
    ) * 100;

  el.innerHTML += `
    <div class="insight">
      📊 Ejecución total:
      <strong>
        ${ejec.toFixed(2)}%
      </strong>
    </div>
  `;

}

/* =========================
   SNAPSHOT
========================= */

function guardarSnapshot(
  data,
  fileName
){

  const meta =
    extraerFechaArchivo(
      fileName
    );

  document
    .getElementById(
      "snapshotFecha"
    )
    .innerText =
      meta
      ? `${meta.fecha} ${meta.hora}`
      : "Snapshot cargado";

  const snapshot = {

    fecha:
      meta?.fecha
      || dayjs()
      .format("YYYY-MM-DD"),

    hora:
      meta?.hora
      || dayjs()
      .format("HH:mm:ss"),

    total:data.length

  };

  localStorage.setItem(
    "zaza_snapshot",
    JSON.stringify(snapshot)
  );

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
  percent,
  text
){

  document
    .getElementById(
      "progressBar"
    )
    .style.width =
      percent + "%";

  document
    .getElementById(
      "progressLabel"
    )
    .innerText =
      Math.round(percent)
      + "%";

  document
    .getElementById(
      "loaderText"
    )
    .innerText =
      text;

}

function finalizarLoader(){

  actualizarLoader(
    100,
    "✅ Snapshot listo"
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

  const isDark =
    document.body
    .classList
    .contains("dark");

  localStorage.setItem(
    "zaza_theme",
    isDark
      ? "dark"
      : "light"
  );

  updateThemeButton();

}

function loadTheme(){

  const theme =
    localStorage.getItem(
      "zaza_theme"
    );

  if(theme==="dark"){

    document.body
      .classList
      .add("dark");

  }

  updateThemeButton();

}

function updateThemeButton(){

  const btn =
    document.getElementById(
      "themeToggle"
    );

  if(!btn) return;

  btn.innerHTML =
    document.body
    .classList
    .contains("dark")
      ? "☀️"
      : "🌙";

}

window.addEventListener(
  "DOMContentLoaded",
  loadTheme
);