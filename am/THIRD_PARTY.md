# Componentes de terceros

- MapLibre GL JS: motor incluido en assets/maplibre; conservar LICENSE.txt de esa carpeta.
- Archivo Black y Manrope: fuentes locales bajo SIL Open Font License 1.1. Textos en assets/licenses. Procedencia: https://github.com/google/fonts/tree/main/ofl/archivoblack y https://github.com/google/fonts/tree/main/ofl/manrope.
- OpenFreeMap Positron: servicio de cartografía https://openfreemap.org/; conservar las atribuciones visibles del mapa a OpenStreetMap y proveedores.
- Relieve: AWS Terrain Tiles, utilizado por el mapa cuando corresponde; conservar atribución.
- FileSaver.js 2.0.5, xlsx-js-style 1.2.0 y html2canvas 1.4.1: cargados a demanda desde CDN; sus URLs exactas están en app/export-libraries.js. No se incluyen sus distribuciones en este paquete.
- Plantillas y datos PNCM: se leen desde DATOS_PNCM y no se distribuyen con este paquete.

Este documento no asigna una licencia al código propio ni concede derechos sobre datos, marcas o plantillas del propietario.
