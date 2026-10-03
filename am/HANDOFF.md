# Handoff para la siguiente IA

Fecha: 3 de octubre de 2026.

## Objetivo y contexto

Ayuda Memoria debe permitir consultar y entregar resultados listos para presentar. No es una vitrina. El usuario vende esta solución como producto premium y pide conservar todas las funciones. Aproximadamente 95% de consultas son distritales; 3% centros poblados y 2% departamentos. Directivos consultan en teléfono; operaciones trabaja en PC. Priorizar rapidez en conexiones provinciales.

Fuente original: `19 WEB/am`. Fuente de datos: `19 WEB/DATOS_PNCM`. Entrega de trabajo: `18 AM`. La estructura de producción debe ser `am/` junto a `DATOS_PNCM/`. No se modificaron los datos compartidos. Los respaldos históricos se conservan fuera de la entrega, en `08 LOGISTICA_DEPORTIVA/respaldo-ayuda-memoria-20261003`.

## Identidad aprobada como dirección de trabajo

Referencia MAIA: `15 BRAVO TERRITORIAL/LAB_mapa_premium_v03.html`. Blanco, negro y magenta, Archivo Black y Manrope locales. El usuario rechazó versiones pastel, blandas o sobredimensionadas. Mantener jerarquía compacta y visible acceso a exportaciones. No cambiar lógica ni añadir funciones arbitrariamente.

## Arquitectura y cuidados

- `index.html`: contenedores y arranque.
- `app/loader.js`: orden de carga de configuración, manifiesto, corte seleccionado, almacenes y aplicación. Hay scripts globales dependientes entre sí; no convertirlos a async indiscriminadamente.
- `data-init.js`, `data-stores.js`, `coverage.js`: datos, filtros, cálculo, renderizado y exportación originales.
- `premium.js`: presentación, acordeones, búsqueda, sincronización de URL y restauración de enlaces con corte, ubigeo, departamento/provincia, centro poblado y ámbito especial.
- `editorial.css`: identidad actual. `legacy.css` conserva reglas utilizadas por contenido generado y exportaciones: no eliminarlo por aparentar antiguo.
- `territory-map.js`: MapLibre diferido, Positron de OpenFreeMap, relieve AWS y alternativa SVG. `assets/maps/` contiene geometrías separadas por departamento, procedentes de MAIA. Son contexto geográfico, no un indicador nuevo de riesgo o cobertura. Conservar atribuciones.
- `export-libraries.js`: carga a demanda y reintento tras fallos. Plantillas PPT/frontera siguen en DATOS_PNCM.

## Optimización realizada

Se retiró la precarga de otros períodos y la carga inicial del catálogo de centros poblados. Este catálogo se solicita al usar la búsqueda o el selector de centros; los enlaces con centro poblado esperan esa carga antes de restaurarse. Se invalida el índice de búsqueda tras cargarlo. El logo base64 de Word se separó en `assets/word-logo.js` y se solicita al exportar. Motor de mapa, geometría y librerías de exportación son diferidos. Configuración portable separada de rutas personales. Se escapa texto de búsqueda antes de insertarlo en HTML.

No se redujeron datos ni se modificaron las plantillas documentales. Los archivos originales voluminosos y capturas históricas se retiraron del directorio publicable, conservándolos fuera como respaldo. No hace falta un framework, bundle ni proceso de compilación para esta versión.

## Validación y límites

`tools/check.cjs` verifica sintaxis y referencias locales. `tools/smoke.cjs` verificó en Edge: arranque nacional sin catálogo CPP/logo Word/motor MapLibre; búsqueda de Pichari; corte 2026-08-31 con SAF 537 y SCD 372; Word con logo; descargas Word, Excel, PPT e imagen; restauración de enlace a centro poblado; ámbito VRAEM; ausencia de desbordamiento horizontal a 360, 390, 768 y 1440 px; ausencia de errores JavaScript en esos recorridos.

Transferencia inicial medida en servidor local sin compresión: 796.732 bytes, 24 recursos. No equivale a un tiempo garantizado en 3G ni a toda la sesión: mapa, búsqueda y exportaciones añaden tráfico al usarse. No se midió en un teléfono físico. Los archivos exportados se generaron, pero esta verificación no inspeccionó visualmente cada página/diapositiva en Office.

Pendientes de revisión independiente: comportamiento de cortes históricos sin catálogo CPP, selección rápida entre períodos, todos los ámbitos y variantes de exportación, accesibilidad con teclado/lector, mapa con conexiones muy lentas y revisión visual de documentos. No afirmar que estos casos fueron exhaustivamente probados. Las librerías externas y el mapa requieren red para sus prestaciones completas.

## Cómo continuar

1. Leer README y ejecutar el verificador.
2. Iniciar `tools/serve.py` con DATOS_PNCM real y ejecutar smoke; AM_EXPORTS=1 añade descargas.
3. Revisar teléfono y escritorio sin perder búsqueda avanzada, actores, tablas y exportaciones.
4. Mantener `../DATOS_PNCM/` y excluir config.local.js/test-results al publicar.
5. Si se integra en GitHub, colocar workflow en la raíz del repositorio y confirmar destino de despliegue. No hay publicación ni push realizados. El propietario decide la licencia del código propio.
