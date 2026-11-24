# ediquinweb

Portafolio personal de **Edilson Byron Laura Mercado (ediquin)**, publicado con GitHub Pages en
https://ediquin.github.io/ediquinweb/ (rama `master`, carpeta raíz).

## Rediseño del 24/11/2026

La plantilla Bootstrap «Grayscale» de 2020 se reemplazó por un sitio propio, estático y sin librerías. Está ordenado por áreas, y cada una muestra trabajo real:

| # | Sección | Qué muestra |
|---|---|---|
| — | Inicio | Retrato recortado y un collage de piezas reales: afiche, Short, logo 3D y sitio web |
| — | Índice | Las cinco áreas en orden. En escritorio, cada fila muestra una imagen que sigue al puntero |
| 01 | Diseño gráfico y de marca | Afiches de especialidades (se amplían en un visor), identidad de Kauxte, logo de Nativzar y su versión 3D, banners |
| 02 | Video y animación | Riel con los 7 Shorts del canal @nativzar (vista previa muda y enlace a YouTube), animación de Kauxte con pausa y el proceso de edición |
| 03 | Edición fotográfica | Recorte de fondo (con botón para cambiar el color), fotomontaje con parches reales, miniaturas y lista de servicios |
| 04 | Sitios web y apps | Kauxte destacado, las tres demos, Nativzar y las apps (Nativzar MJ, Campori QR, certificados con QR, curso SGC) |
| 05 | IA aplicada | Imagen, video (Higgsfield), voz (ElevenLabs), código y agentes |
| — | Aprendiendo | **Figma**, con una maqueta animada de frames y componentes |
| — | Herramientas · Trayectoria · Contacto | Herramientas por área, línea de tiempo desde Electrónica (UMSA) hasta hoy, WhatsApp y correo |

### Archivos

- `index.html`: la página.
- `css/portafolio-20261124-1.css` y `js/portafolio-20261124-1.js`: estilos y comportamiento. Llevan versión en el nombre, así que un cambio futuro necesita un nombre nuevo.
- `fonts/`: Bricolage Grotesque, DM Sans y Fraunces (licencia OFL), las mismas de Kauxte. No se usa Google Fonts.
- `img/2026/` y `video/2026/`: medios optimizados (WebP y vistas previas MP4 de 70–270 KB). Los genera `herramientas/preparar_medios.py`.
- `img/2026/og-ediquin.jpg`: imagen para compartir el enlace. Se genera con `herramientas/captura_og.mjs`.
- `nativzar-mj/`: páginas legales de la app Nativzar MJ (privacidad, términos y eliminación de cuenta). **No mover ni renombrar:** la ficha de la app enlaza a estas direcciones.
- `img/perfil.png`, `circuit.png`, `maquina.png` y `proy.png`: originales de los que salen los WebP.

### Regenerar los medios y probar

```bash
git clone https://github.com/ediquin/flyer_iasd.git /tmp/flyer_iasd   # fuente de los afiches
python3 herramientas/preparar_medios.py /tmp/flyer_iasd
node herramientas/captura_og.mjs http://localhost:8093/
node herramientas/qa_portafolio.mjs http://localhost:8093/ /tmp/qa-portafolio
```

`qa_portafolio.mjs` usa puppeteer-core y axe-core de `portafolio_web/herramientas` y el Chrome del sistema.

### Verificación (24/11/2026, local)

- **`qa_portafolio.mjs`: 28 bien, 0 mal.** Se probó a 390, 768 y 1440 px:
  - sin desborde horizontal, imágenes rotas ni errores de consola;
  - texto de al menos 12 px;
  - axe WCAG 2.1 AA sin infracciones;
  - el visor de afiches abre y se cierra con Esc, y devuelve el foco;
  - los Shorts reproducen su vista previa;
  - la animación arranca sola y se pausa con el botón;
  - el riel avanza con las flechas;
  - con *reducir movimiento*, nada arranca solo.
- **`navegador.mjs medir`** (celular): **97** (LCP 2,0 s, TBT 0 ms, CLS 0, 487 KB).
- **`navegador.mjs revisar`** dejó dos avisos:
  - `kauxte-3d` «deformada» es un falso positivo, porque la tarjeta está girada;
  - el retrato original mide solo 334 px y se ve suave en pantallas de alta densidad. Hace falta una foto de mejor resolución para reemplazar `img/perfil.png`.

### Publicación (24/11/2026)

- Con el visto bueno del titular, `rediseno-2026-11` se fusionó en `master` sin conflictos y se subió a GitHub (commit `ec33fc5`). GitHub Pages lo construyó sin errores.
- **En vivo:** responden con 200 la página, el CSS, el JS, las fuentes, los videos (y con 206 los pedidos parciales) y las cuatro páginas de `nativzar-mj/`.
- **`qa_portafolio.mjs` sobre https://ediquin.github.io/ediquinweb/: 28 bien, 0 mal.** La primera pasada marcó una vista previa de Short como fallida. Era la prueba cancelando la descarga al quitar el mouse (`ERR_ABORTED`), así que la prueba ahora ignora esas cancelaciones de video.
- **Para revertir:** `git revert ec33fc5` y subir, o volver `master` a `b31a30a`.

### Pendiente del titular

- Revisar los textos y datos de la trayectoria (fechas, docencia y cursos) y corregir lo que haga falta.
- Una foto de perfil de mayor resolución, con fondo recortado.
- Si quiere, agregar ejemplos de retoque «antes y después» de fotos propias, y nombrar sus herramientas de edición de fotos.
- La captura de Nativzar muestra el rediseño del 24/11 (logo 3D y Shorts), que todavía no está publicado en nativzar.com.
