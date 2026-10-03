# Ayuda Memoria · en un clic

Aplicación estática de consulta territorial y preparación de reportes. Mantiene búsqueda avanzada, actores comunales y exportaciones Word, Excel, PPT, WhatsApp e imagen. Interfaz blanca, negra y magenta inspirada en MAIA, adaptada a teléfono y escritorio.

## Publicación

Mantener esta estructura en el servidor o repositorio:

```
/am/index.html
/am/app/
/am/assets/
/am/lib/
/DATOS_PNCM/
```

La ruta de datos se configura en `app/config.js`: `../DATOS_PNCM/`. Los datos no están incluidos en este paquete. Conservar sus archivos, nombres y estructura originales. No se requiere compilación ni npm para ejecutar la aplicación. Publicar por HTTP/HTTPS, conservando mayúsculas y minúsculas. No se ha realizado ninguna subida a GitHub.

El archivo `app/config.local.js` es una adaptación de esta máquina para abrir con file://; está excluido de Git y del ZIP. Para otra máquina copiar `app/config.local.example.js` y configurar su ruta. Es preferible la vista previa HTTP.

## Vista previa

Desde la carpeta de la aplicación, con Python 3.9 o superior:

```
python tools/serve.py --data ../DATOS_PNCM
```

Abrir http://127.0.0.1:8765/am/. Se puede indicar otra carpeta de datos mediante `--data` y otro puerto mediante `--port`.

## Verificación

```
node tools/check.cjs
```

Pruebas de navegador opcionales: instalar Playwright en el entorno de trabajo o indicar su ruta con `PLAYWRIGHT_MODULE`, iniciar la vista previa y ejecutar `node tools/smoke.cjs`. Usa Edge por defecto; `AM_BROWSER` permite cambiar el canal. `AM_EXPORTS=1` verifica también descargas reales y guarda resultados en `test-results/`, excluido de Git. `AM_BASE_URL` permite otra dirección. Estas pruebas requieren el corte agosto de 2026 y conectividad para exportaciones externas.

El flujo `.github/workflows/check.yml` comprueba sintaxis y referencias locales. Si esta carpeta se incorpora como `am/` dentro de un repositorio mayor, trasladar ese flujo a `.github/workflows/` de la raíz del repositorio. El flujo no publica ni ejecuta las pruebas con datos.

Consultar `HANDOFF.md` antes de continuar el desarrollo y `THIRD_PARTY.md` para dependencias.
