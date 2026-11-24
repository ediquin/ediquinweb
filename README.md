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

- `index.html`: la página en español. `en/index.html`: la versión en inglés, generada por `herramientas/construir_en.py`.
- `css/portafolio-20261124-3.css` y `js/portafolio-20261124-3.js`: estilos y comportamiento. Llevan versión en el nombre, así que un cambio futuro necesita un nombre nuevo.
- `fonts/`: Bricolage Grotesque, DM Sans y Fraunces (licencia OFL), las mismas de Kauxte. No se usa Google Fonts.
- `img/2026/` y `video/2026/`: medios optimizados (WebP y vistas previas MP4 de 70–270 KB). Los genera `herramientas/preparar_medios.py`.
- `img/2026/og-ediquin.jpg`: imagen para compartir el enlace. Se genera con `herramientas/captura_og.mjs`.
- `nativzar-mj/`: páginas legales de la app Nativzar MJ (privacidad, términos y eliminación de cuenta). **No mover ni renombrar:** la ficha de la app enlaza a estas direcciones.
- `img/perfil.png`, `circuit.png`, `maquina.png` y `proy.png`: originales de los que salen los WebP.
- `herramientas/logo3d/`: fuente del logo 3D de Nativzar (`montana3d.js`), su empaquetado (`construir.sh` → `js/montana3d-20261124-3.js`), el laboratorio (`lab/`) y la captura de la imagen fija (`capturar_poster.mjs`).

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

## Segunda versión del 24/11/2026: iglesia, inglés y datos del CV

Pedido del titular después de ver el sitio publicado:
- usar el último afiche de Informática Programable, donde él aparece como Guía Mayor;
- reemplazar el «recorte de fondo» (algo que cualquiera hace) por trabajos para la iglesia: afiches, parches y animaciones;
- agregar una versión en inglés;
- cambiar el título «Diseño que se ve bien y funciona» usando su CV de Canva («CV_english_08/2026 Volunteer»).

Qué cambió:
- **Héroe:** «Ingeniero que diseña, programa y crea con IA», con su rol del CV (ingeniero electrónico, full-stack, automatización con IA) y su experiencia en CodeRoad y la UAB. La tercera cifra es «20+ piezas para la iglesia».
- **01 Diseño → «Para la iglesia»:** la serie completa de la *Semana de la Pañoleta* (7 afiches), los escudos CEAD, CEAD Liderazgo y GMM/GMMA, cuatro flyers de actividades, el mapa ConquisRuta, las poleras «Trazo andino» y la intro animada del club hecha en DaVinci Resolve. Todo se abre en el visor, que ahora respeta la proporción de cada imagen (`data-w` y `data-h`).
- **03 Foto:** el recorte se reemplazó por el afiche de Informática con su foto integrada.
- **Trayectoria:** se reescribió con los datos del CV: UMSA 2016–2022, pasantía y proyecto de grado, PASY Mascotas, CodeRoad 2024–2026 (Cox Automotive y el reconocimiento TechStar of the Month de sept. 2025), docencia en la UAB, formación en IA agéntica, Coordinador del SGC de la MBON y liderazgo juvenil. Se quitaron el «bootcamp 2020» y «material de clases», que eran suposiciones mías.
- **Herramientas y contacto:** se sumaron React, PHP, Flutter, Supabase, LangGraph, n8n y Cursor, y el enlace a LinkedIn. La dirección del CV **no** se publica.
- **Inglés:** `en/index.html` se genera con `python3 herramientas/construir_en.py` a partir de `index.html`. Si se cambia un texto en español, el script se detiene y dice cuál traducción hay que actualizar. Las dos páginas se enlazan con `hreflang` y un botón ES/EN en la barra.
- CSS y JS pasaron a `-20261124-2` para que nadie vea la versión vieja en caché.

**No se usó:** los afiches con fotos de otros expositores (Coleccionista con expositor y Red Familiar), porque muestran a otras personas. Tampoco se encontró en el disco ni en el respaldo el «mini video de la convención» con líderes de Conquistadores, JA, Música y Aventureros alrededor de una fogata. Lo más parecido es la portada de Facebook de Nativzar del 10/11, que es una imagen fija.

**Verificación local:** `qa_portafolio.mjs` ahora prueba las dos versiones y dio **67 bien, 0 mal**:
- a 390, 768 y 1440 px, sin desborde, imágenes rotas ni errores;
- axe WCAG 2.1 AA sin infracciones;
- el visor muestra un escudo cuadrado y la polera horizontal completos y sin deformar;
- la intro del club se reproduce sola, se pausa y el botón cambia su texto en cada idioma;
- el idioma de cada página es correcto y enlaza a la otra.

## Tercera versión del 24/11/2026: nombre, logo 3D nuevo y trabajos propios

Pedido del titular al revisar la segunda versión:
- **Héroe:** el título es ahora su nombre, «Edilson Byron *Laura Mercado*». Se quitó la línea «Edilson Byron Laura Mercado · La Paz, Bolivia» de arriba.
- **Video:** «Historias cortas que se quedan» pasó a «Compartir el Mensaje, un video a la vez» (en inglés, «Sharing the Message, one video at a time»).
- **Logo de Nativzar:** se usa el logo oficial con el inicio del sendero suavizado en la neblina (`Nativzar_videos/video/recursos/marca/nativzar/nativzar-sin-tipografia-sendero-suave-v02.png`), con el nombre NATIVZAR del logo completo debajo. La unión no se nota.
- **Logo 3D rehecho.** El anterior apilaba terrazas cilíndricas y parecía una torta. El nuevo (`herramientas/logo3d/montana3d.js`, Three.js 0.170, 130 KB gzip) tiene:
  - una sola montaña de roca facetada, con estratos y caras planas;
  - el sendero verde **tallado** en la cara delantera, en zigzag por las curvas de nivel, con corte arriba y relleno abajo;
  - la gran piedra, agaves, piedritas, la cruz con halo y neblina en la base.

  Se puede girar 360° arrastrando (mouse o dedo) o con el botón «Girar 360°», y tiene inercia. Sin tocarla, vuelve de frente y se mece. El módulo se pide solo cuando la tarjeta se acerca a la pantalla. Con *reducir movimiento*, ahorro de datos o sin aceleración gráfica se ve la imagen fija `nativzar-3d-v2-*.webp`. La tarjeta pasó a ocupar todo el ancho para que haya espacio para girarla.
- **Escudos:** el escudo hexagonal del CEAD era casi el mismo diseño que el de GMM y GMMA. Se reemplazó por el **parche de la Convención 2026 de la MBON** (`AI_Design_Conquis/assets/logos_ministerios_a_revisar_y_ordenar/parche_prototipo.jpg`).
- **Flyers:** se quitó el de la reunión informativa del Camporí Regional, que se veía genérico.
- **ConquisRuta:** se quitó. Todas las versiones guardadas, en el disco y en `/srv/respaldo`, tienen los papiros vacíos. Vuelve cuando el titular pase la versión enviada con las actividades.
- **Uniformes:** carrusel con las vistas de catálogo, que parecen prendas reales: la polera Trazo andino y el conjunto deportivo en sus tres paletas. Tiene flechas y se puede deslizar, y cada imagen se abre en el visor.
- **Animación:** se quitó la intro del club (DaVinci Resolve), porque el titular aclaró que no la hizo él. La reemplaza la escena **«Un camino trazado por Dios mismo»** del episodio horizontal de Elías del canal Nativzar, animado en Blender: 6:24 a 6:37, 13 s, 270 KB.
- Imagen para compartir regenerada con el nombre. CSS y JS pasaron a `-20261124-3`. Los medios que ya no se usan salieron del repositorio.

**Verificación local:** `qa_portafolio.mjs` dio **71 bien, 0 mal** en español e inglés, a 390, 768 y 1440 px. Ahora prueba también:
- que el carrusel de indumentaria avanza;
- que el logo 3D deja su imagen fija cuando no hay WebGL acelerado.

En el navegador de la app, con GPU, se comprobó que el 3D carga, gira al arrastrar y oculta el aviso al tocarlo. A 375 px no hay desborde horizontal.

### Pendiente del titular

- Revisar la trayectoria nueva (tomada del CV) y la traducción al inglés.
- Pasar la ConquisRuta enviada con las actividades en cada papiro, si la tiene en el teléfono o en WhatsApp.
- Si quiere una intro nueva hecha con Google Flow, generarla en su cuenta (ese servicio no se usa desde aquí).
- Si quiere, pasar la foto profesional del CV para reemplazar el retrato de 334 px.
- Una foto de perfil de mayor resolución, con fondo recortado.
- Si quiere, agregar ejemplos de retoque «antes y después» de fotos propias, y nombrar sus herramientas de edición de fotos.
- La captura de Nativzar muestra el rediseño del 24/11 (logo 3D y Shorts), que todavía no está publicado en nativzar.com.
