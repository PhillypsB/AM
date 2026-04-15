# Reporte de Cobertura PNCM — SAF / SCD

Aplicación web **standalone** para la generación de reportes mensuales de cobertura del **Programa Nacional Cuna Más (PNCM)** — **MIDIS · Perú**, correspondientes a los servicios **SAF** (Servicio de Acompañamiento a Familias) y **SCD** (Servicio de Cuidado Diurno).

La herramienta permite consultar la cobertura a nivel **Departamental**, **Provincia** y **Distrito**, visualizar en pantalla los indicadores y exportar el reporte en formatos **Word**, **Excel** y **PDF** con el diseño institucional.

---

## Captura funcional

- Pantalla con selectores en cascada (Departamento → Provincia → Distrito).
- Tarjetas de indicadores SAF y SCD (familias, niños/as, gestantes, ejecución presupuestal, CIAI, Comités de Gestión, facilitadoras, madres cuidadoras).
- Narrativa automática contextualizada al nivel seleccionado.
- Tres tablas de cobertura (Departamental / Provincias / Distritos) con la fila seleccionada resaltada en amarillo y fila de **Total general** diferenciada por bloque de servicio.
- Exportación a Word, Excel y PDF con un solo clic.

---

## Arquitectura

```
PNCM_Cobertura_FEB2026.html          # Aplicación (HTML + CSS + JS en un solo archivo)
am_febrero26.js                      # Dataset (~17 MB) con la serie mensual por distrito
PNCM_Cobertura_FEB2026.v2026.02-r3.checkpoint.html
                                     # Checkpoint estable de la versión actual
README.md                            # Este documento
```

**Archivo monolítico — sin build tools**. Todo el JS y CSS vive embebido dentro del `.html`; solo depende de librerías cargadas por CDN. El archivo puede abrirse haciendo doble clic desde el explorador de archivos, sin necesidad de servidor web ni instalación.

---

## Tecnologías utilizadas

### Núcleo
| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura del reporte |
| **CSS3** (moderno, sin preprocesador) | Estilos institucionales, layout en grid, tarjetas, tablas responsivas |
| **JavaScript (ES2020+)** | Lógica de filtrado, cálculos, agregaciones y generación de exports |

### Librerías (vía CDN)
| Librería | Versión | Propósito |
|---|---|---|
| **jsPDF** | 2.5.1 | Generación programática de PDF |
| **jsPDF-AutoTable** | 3.8.2 | Tablas paginadas en PDF con estilos y encabezados de 2 niveles |
| **xlsx-js-style** | 1.2.0 | Excel `.xlsx` con estilos (colores, bordes, formatos numéricos, freeze panes) |
| **html2canvas** | 1.4.1 | Captura de componentes de pantalla cuando se requiere imagen |
| **FileSaver.js** | 2.0.5 | Descarga de blobs en el navegador |

### Fuentes de datos
- **Dataset mensual del PNCM** (`am_febrero26.js`) — registros por distrito con los campos: `departamento`, `provincia`, `distrito`, `fecha`, `nfamilia_saf`, `nniños_saf`, `ngestantes_saf`, `ejecucion_saf`, `nniños_scd`, `CIAI_SCD`, `ejecucion_scd`, `CG_SAF`, `CG_SCD`, `FACILITADOR_SAF`, `MadresCuidadoras_SCD`, `dist_saf`, `dist_scd`, `prov_saf`, `prov_scd`, entre otros.

---

## Funcionalidades detalladas

### 1. Consulta interactiva

Los selectores Departamento → Provincia → Distrito filtran el dataset y recalculan todos los indicadores en vivo. El usuario puede dejar vacíos Provincia y/o Distrito para ver el reporte al nivel correspondiente.

### 2. Tablas de cobertura en pantalla

Para cada nivel seleccionado se muestra una tabla con:

- Columna de nombre (Departamento / Provincia / Distrito).
- Bloque **SAF** (rosa `#F8BBD0`): Familias, Niñas/os, Gestantes, S/. Ejecución.
- Bloque **SCD** (verde `#A5D6A7`): Usuarios, CIAI, S/. Ejecución.
- Fila seleccionada resaltada en amarillo `#FFF176` con negrita.
- Fila **Total general** con fondos diferenciados por bloque.

### 3. Exportación a Word (`.doc`)

- Archivo HTML con MIME `application/msword`, abre directamente en Microsoft Word y LibreOffice Writer.
- Logo institucional centrado en la cabecera.
- Narrativa + tablas SAF/SCD + tabla de cobertura por nivel, con **saltos de página** entre Departamento, Provincia y Distrito.
- Tablas a tamaño 8 pt para mantener todo en formato vertical sin recortes.
- Footer gris con versión, fecha de corte, próxima actualización y fuente.

### 4. Exportación a Excel (`.xlsx`)

- Una pestaña por nivel: `Departamental`, `Provincia_<nombre>`, `Distrito_<nombre>`, más `Información`.
- **Estilos completos**: cabecera de dos niveles con merges (SAF rosa / SCD verde / columna de nombre gris), bordes finos `#CBD5E1`, fila seleccionada amarilla, total general con fondos rosa/verde pálidos.
- Formato numérico: `#,##0` para conteos y `"S/. "#,##0` para ejecución presupuestal.
- **Freeze panes** debajo de la cabecera y **autofilter** sobre los datos.
- Hoja *Información* con banner azul y metadatos del reporte.

### 5. Exportación a PDF

- Generado programáticamente con jsPDF-AutoTable (sin captura de pantalla).
- Cabecera con título **REPORTE DE COBERTURA — SAF / SCD**, subtítulo con mes/año y ruta, línea azul horizontal y cinta lateral azul.
- Por cada nivel: página vertical con banda de sección coloreada, narrativa y tablas SAF/SCD lado a lado en key-value (rojo y verde).
- Cobertura completa en página **horizontal** con encabezado de 2 niveles coloreado, fila seleccionada en amarillo y total general destacado.
- Footer de 2 líneas con información de versión y **Página X de Y** (resuelto con doble pasada).

---

## Paleta institucional

| Rol | Color |
|---|---|
| Azul institucional PNCM / MIDIS | `#0056B3` |
| SAF (Acompañamiento a Familias) | `#F8BBD0` (rosa) |
| SCD (Cuidado Diurno) | `#A5D6A7` (verde) |
| Selección | `#FFF176` (amarillo) |
| Total SAF | `#FCE4EC` (rosa pálido) |
| Total SCD | `#C8E6C9` (verde pálido) |
| Gris tabla / borde | `#F1F5F9` / `#CBD5E1` |
| Texto atenuado | `#6B7280` |

---

## Ejecución local

1. Ubicar `PNCM_Cobertura_FEB2026.html` y `am_febrero26.js` en la **misma carpeta**.
2. Abrir el `.html` con doble clic (Chrome, Edge o Firefox recomendados).
3. Seleccionar el ámbito geográfico.
4. Usar los botones **📘 Exportar Word**, **📊 Exportar Excel** o **📄 Exportar PDF**.

> No requiere instalación ni servidor. Todas las librerías se cargan desde CDN al abrir el archivo (se necesita conexión a Internet la primera vez; luego el navegador las cachea).

---

## Versionado

| Versión | Hitos |
|---|---|
| **v2026.02-r3** (actual, checkpoint) | Word revertido a patrón simple; logo removido del PDF; Excel con estilos completos vía xlsx-js-style |
| v2026.02-r2 | Excel con colores; Word con header/footer nativo (descartado) |
| v2026.02-r1 | Primera versión con tablas de cobertura y exports básicos |

La etiqueta de versión aparece en el footer (`APP_VERSION`) y en la hoja *Información* del Excel.

---

## Información del corte

- **Datos actualizados a:** Febrero 2026
- **Próxima actualización:** 16 de abril de 2026 (incluirá Marzo 2026)
- **Fuente:** UPPM – PNCM – MIDIS 🇵🇪

---

## Créditos

Desarrollado para la **Unidad de Planeamiento, Presupuesto y Modernización (UPPM)** del **Programa Nacional Cuna Más**, dependiente del **Ministerio de Desarrollo e Inclusión Social (MIDIS)** — Perú.
