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

- `index.html` (inicio), `diseno/index.html` y `software/index.html`: las páginas en español (desde el 26/11/2026). `en/…`: sus versiones en inglés, generadas por `herramientas/construir_en.py`.
- `css/portafolio-20261126-1.css` y `js/portafolio-20261126-1.js`: estilos y comportamiento. Llevan versión en el nombre, así que un cambio futuro necesita un nombre nuevo.
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

## Cuarta versión del 24/11/2026: sendero despejado y galería de opciones

- **Logo 3D, el sendero:** el titular notó que la roca asomaba puntiaguda sobre el sendero y lo tapaba en partes. Ahora:
  - el sendero es una cinta verde continua, con bordillos bajos de piedra clara;
  - las curvas cerradas son redondas;
  - el corte de la roca toma el mínimo de **todos** los tramos cercanos, así ninguna roca queda por encima de un tramo y siempre hay paso libre;
  - la gran piedra, las piedritas y los agaves se colocan lejos del sendero.
- **Uniformes:** queda solo la polera Trazo andino (vista de catálogo). Los conjuntos salieron hasta mejorarlos.
- **Animación:** se quitó la escena «Un camino trazado por Dios mismo». El titular la descartó porque es de la versión pendiente del episodio de Elías, y el personaje camina raro.
- **Galería de opciones** (`herramientas/galeria_opciones.py` → `opciones/index.html`, solo local, en `.gitignore`):
  - 1068 imágenes y 4 animaciones recientes de Elías, para que el titular marque qué entra al portafolio;
  - el botón «Copiar mi selección» copia los números;
  - solo lee las carpetas de origen.
- **QA:** `qa_portafolio.mjs` dio **69 bien, 0 mal**. La prueba del carrusel solo corre si hay más de una prenda.

## Quinta versión del 24/11/2026: lo elegido en la galería y el logo en bloques

El titular eligió en la galería la animación de Horeb, el afiche del curso de directivas y la polera del Club Central.

- **Logo 3D, tercera forma** (`herramientas/logo3d/montana3d.js`, empaquetado en `js/montana3d-20261124-4.js`):
  - **Por qué:** el titular notó que la cinta del sendero parecía flotar y hasta tenía sombra propia. Pidió que el sendero rodee toda la montaña, que sea angosto y que tenga obstáculos, y que se parezca más al dibujo original.
  - **Montaña:** se hizo con bloques de roca, como el logo: celdas de Voronoi de techo plano y paredes verticales, más oscuras abajo.
  - **Sendero:** es angosto (0,24 de ancho) y da 2,2 vueltas en espiral. Va metido entre bordillos de piedra clara, que son más altos por dentro y bajos por fuera para no taparlo.
    - Arriba de cada vuelta hay una pared y abajo una caída.
    - La pendiente alterna tramos casi planos y otros empinados.
    - El sendero se mete y se sale un poco, para no formar anillos.
    - Cuatro grietas cortan el sendero y sus bordillos.
  - **Sin flotar:** los costados del sendero bajan dentro de la roca, nunca bajo el suelo. Cada bloque queda acotado por las vueltas vecinas: nunca supera a la de arriba ni baja de la de abajo.
  - La cámara mira un poco más desde arriba.
  - **Ajuste del mismo día: rocas irregulares.** El titular vio que la montaña parecía hecha toda de hexágonos iguales, como columnas de basalto, nada natural. Ahora:
    - **Rocas de tamaños mezclados:** las celdas chicas (0,085) se agrupan en rocas de muy distintos tamaños (de 0,14 a 0,56), con un diagrama de potencia.
    - **Paredes rectas:** cada celda se parte por los bordes rectos de su roca, así las paredes son planos largos.
    - **Techos:** cada roca tiene un techo inclinado propio, y las celdas chicas quedan como lajas con grietas, como el empedrado del logo.
    - **Borde del sendero:** la orilla exterior de los bordillos sigue una línea paralela al sendero.
    - **Agujas:** hay algunas piedras altas con el techo muy inclinado, solo donde no tapan la vuelta de arriba.
    - **Zigzag:** el sendero hace quiebres rectos, con una onda triangular.
    - **Velocidad:** con rejillas de búsqueda para los tramos y las rocas, el armado tarda unos 0,28 s en este equipo (antes, 0,53 s).
    - **Respaldo:** la versión de hexágonos quedó en `herramientas/logo3d/anteriores/montana3d-v5-hexagonos.js`.
  - **Ajuste del 25/11/2026: sendero, bordillos y luz de la base.**
    - **Por qué:** el titular vio que el sendero y las piedras de al lado parecían escalonados («muchas gradas») y que, al girar el modelo, la parte baja tenía una luz rara.
    - **Luz rara en la base:** tenía dos causas.
      - La neblina eran imágenes planas fijas alrededor del pie de la montaña. Al girar, cortaban las rocas: unas quedaban delante y otras detrás, y salían parches de luz.
      - La primera vuelta del sendero iba por el borde de la base, sin roca debajo, y se veía como una franja pálida.
    - **Neblina:** ahora va solo delante y a los costados, y se dibuja siempre encima (`depthTest: false`). Envuelve el pie igual desde cualquier lado.
    - **Entrada del sendero:** sale de la neblina al frente y entra derecho al cerro. La espiral empieza sobre roca.
    - **Gradas falsas:** el pasto tenía franjas de verdes alternados cada dos tramos, y eso parecía una escalera. Ahora el tono cambia despacio y de forma continua.
    - **Escalones reales:** solo donde la subida pasa de 0,21. Son de 0,075 de alto, con la contrahuella en sombra verde. En el resto, el sendero queda llano o en rampa suave. La roca y los bordillos usan la subida lisa (`S.alt`); el pasto usa la escalonada (`S.escalon`).
    - **Bordillos:** son piedras enteras, de 0,14 a 0,34 de largo, con un techo que sigue la subida y su propio tono e inclinación, no un rosario de piedritas a distinta altura.
      - Las orillas del pasto y de los bordillos son cortes rectos, paralelos al sendero.
      - Cada piedra tiene su ancho, así la pared de roca detrás se quiebra en grietas verticales donde cambia de piedra.
    - Armado: unos 0,3 s.
    - Respaldo de la versión anterior: `herramientas/logo3d/anteriores/montana3d-v6-rocas.js`.
  - La versión anterior quedó en `herramientas/logo3d/anteriores/montana3d-v4-cinta.js`.
  - La imagen fija nueva es `nativzar-3d-v3-480/900.webp`.
- **Polera del Club Central** (`herramientas/polera3d/`):
  - **Origen:** solo había láminas planas, `Polera parte delantera.jpg.png` y `Polera Parte tracera.jpg` en `/srv/respaldo/archivo/05_Iglesia_IASD/1_Conquistadores/Club Central/Polera/`.
  - **Silueta:** se dedujo de dónde corta el estampado y está en `silueta.py`.
  - **Prenda 3D:** `render_polera.py` arma la prenda en Blender 5.3 (Cycles):
    - torso y mangas son piezas infladas por separado y la manga monta sobre la sisa;
    - el escote lleva cuello acanalado y se ve el interior;
    - tiene costuras y pespuntes en relieve (`preparar_texturas.py`), con luz de estudio sobre fondo gris cálido.
  - **Comando:** `python3 preparar_texturas.py && blender -b --factory-startup --python render_polera.py -- 128`, que tarda unos 50 s.
  - **Ajustes pendientes:** las mangas todavía se ven cortas y rígidas.
  - **En la página:** entra al carrusel de Uniformes, con flechas, como segunda prenda.
- **Afiche** «Curso de Entrenamiento Básico de Directivas» (oficial, MBON, enero de 2026): es el cuarto flyer. Los flyers pasan a 4 columnas (2 en el celular) y los escudos a 5 de 12 columnas.
- **Animación:** «Elías en el monte Horeb», 10 s de `horeb_rig_v07.mp4` (de 5,4 s a 15,6 s): el monte, el viento, el terremoto y el fuego. Ocupa todo el ancho, con el texto al lado.
- Inglés regenerado: 203 textos.
- QA: **71 bien, 0 mal**.
- Verificación en el navegador local:
  - el logo 3D carga con aceleración, con sombras, y gira;
  - el carrusel avanza;
  - la animación arranca sola al verse.

## Sexta versión del 26/11/2026: dos caminos (publicada)

**Pedido del titular:** el portafolio había quedado orientado al diseño. Pidió separar el trabajo en dos partes, diseño y video por un lado y software e IA agéntica por el otro, para que cada visitante entre por la que le interesa, de preferencia en páginas distintas. También pidió incluir AI_design_7thday, la skill que diseña afiches con los emblemas del Ministerio Joven y que ya está en nativzar.com.

**Por qué páginas separadas y no pestañas:** cada camino tiene su propia dirección para compartir. Por ejemplo, `…/software/` se le manda a un reclutador y `…/diseno/` a una iglesia o a una marca. Además, cada página tiene su propio título y descripción para los buscadores.

| Página | Qué tiene |
|---|---|
| `index.html` (inicio) | Héroe con el nombre, ahora con una pieza de código (agente de IA) en el collage y cuatro cifras, entre ellas «Apps y herramientas: 7». «Ver mi trabajo» baja a **dos puertas**, «Diseño y video» y «Software e IA agéntica», y debajo hay un puente a AI_design_7thday. Siguen la Trayectoria completa y el Contacto. |
| `diseno/` | 01 Diseño, 02 Video y 03 Foto, iguales que antes. En Video se agregó «Videos hechos con código», con 6 de los 10 estilos de Kauxte (vistas WebP copiadas de `portafolio_web/marca/video/`, 144 KB) y un enlace a kauxte.com/#video. Le siguen 04 IA creativa (imagen, video y voz, más la tarjeta «Afiches con mi propio agente», que enlaza a Software), Figma, las herramientas de diseño y un contacto con enlace al otro camino. |
| `software/` | 01 Experiencia (CodeRoad, UAB, PASY y proyecto de grado), 02 Sitios web (Kauxte y las demos), 03 Apps: seis tarjetas con estado, tecnologías y enlace, con dibujos tomados de nativzar.com. 04 IA agéntica tiene a AI_design_7thday como proyecto principal, con terminal, skills y ontología, y además desarrollo con agentes, LangGraph/CrewAI/n8n y video por código. Siguen 05 Servidor propio (aislado, con versiones, probado y respaldado, sin direcciones ni nombres de máquinas), las herramientas de software y el contacto. |

- **Menú:** «01 Diseño y video · 02 Software e IA · Trayectoria», con el camino actual resaltado. En el celular ya no se oculta: pasa a una segunda fila.
- **Enlaces viejos:** `…/ediquinweb/#web`, `#ia`, `#diseno`, `#video`, `#foto`, `#aprendiendo` y `#herramientas` redirigen a la sección equivalente del camino nuevo (`js/portafolio-20261126-1.js`, paso 0).
- **Archivos:** CSS y JS pasaron a `-20261126-1`. Los estilos nuevos están al final del CSS, en el bloque «Dos caminos». El reparto se hizo una sola vez con un script descartable. Desde ahora las tres páginas en español son la fuente y se editan a mano.
- **Inglés:** `herramientas/construir_en.py` genera `en/`, `en/diseno/` y `en/software/` (322 textos). Los enlaces entre páginas traducidas se quedan en inglés, y los recursos y `nativzar-mj/` suben de nivel. Si un texto en español cambia, el script dice cuál dejó de encontrarse.
- **Datos que no se inventaron:** todo sale del README anterior, del CV ya publicado, de nativzar.com y de kauxte.com. Se corrigieron dos frases para no exagerar: el servidor tiene «mis sitios y demos», todavía no sitios de clientes.
- **Contraste:** se oscurecieron dos colores decorativos de la maqueta de Figma (`.var` y la etiqueta del cursor) que no llegaban a 4,5:1.

**Verificación local (26/11/2026, http://localhost:8093/):** `qa_portafolio.mjs` dio **182 bien, 0 mal** en 6 páginas (3 en español y 3 en inglés) y a 390, 768 y 1440 px. Pruebas nuevas:
- todos los enlaces internos de cada página responden 200;
- el menú de caminos se ve en el celular;
- `#web`, `#diseno` e `#ia` redirigen al camino correcto;
- el enlace de idioma correcto en cada subpágina;
- la prueba de reducir movimiento ahora corre en `diseno/`.

axe mide el contraste sin la animación de aparición, porque esa animación deja a medio fundir lo que está en el borde de la pantalla, que es su estado de transición. Además se revisaron capturas en el navegador a 1440 y a 375 px. **No probado:** en vivo en GitHub Pages, que se sirve bajo `/ediquinweb/`. Las rutas son relativas, así que no debería cambiar nada.

**Ajuste del mismo día: nombres técnicos, certificaciones y clips.**
- **Pedido del titular:** que un reclutador encuentre los nombres técnicos de lo que hace, tanto en software como en video. En las puertas del inicio:
  - «Apps para el Ministerio Joven con QR» pasó a «Desarrollo móvil (Flutter)».
  - «Sitios web» pasó a «Desarrollo full-stack y DevOps».
  - Se sumaron «IA agéntica: agentes, LangGraph y MCP» y «QA y automatización de pruebas».
  - En diseño: «Diseño gráfico y branding», «Edición de video y motion graphics», «Animación 3D» e «IA generativa».
- **Nombres de las secciones:**
  - En `software/`: 02 Desarrollo full-stack, 03 Desarrollo móvil y apps y 05 DevOps e infraestructura.
  - En `diseno/`: Diseño gráfico y branding, Edición de video y motion graphics, Retoque y composición fotográfica, e IA generativa.
  - El rol del héroe suma «Diseño y video», como en el CV.
- **Palabras clave:** debajo del título de cada sección hay una fila con las habilidades y tecnologías de esa área (Branding, Motion graphics, DaVinci Resolve, React, REST APIs, Flutter, LangGraph, MCP, Cloudflare Tunnel…).
- **06 Certificaciones y formación** (`software/#certificaciones`), con datos del CV `cvEdilsonLaura.pdf` del 26/11/2026:
  - el título de la UMSA y el diplomado de la UAB;
  - el reconocimiento TechStar de CodeRoad;
  - los cursos de Anthropic, LangChain, CodeRoad y Platzi, con su año;
  - los idiomas.

  Los nombres de los cursos van como los emite cada institución. No hay enlaces a los certificados porque no se encontraron sus direcciones.
- **Herramientas de software,** según el CV:
  - lenguajes: Python, JavaScript, Java y PHP;
  - bases de datos: MongoDB, además de las anteriores;
  - nube: DigitalOcean, además de las anteriores;
  - QA y DevOps: Playwright, Selenium, PyTest, Postman, Sentry y Scrum.
- **Clips en «Videos hechos con código»:**
  - **Qué son:** el titular propuso GIF. En su lugar se usan clips MP4 mudos de 4 s, que se ven igual y pesan mucho menos: 6 clips, 424 KB en total, en `video/2026/estilo-*-480.mp4`.
  - **Cómo se hicieron:** se cortaron de los demos de Kauxte con `ffmpeg -ss 1 -t 4`, recortados a 4:3, a 480×360, 24 fps y CRF 30.
  - **Cómo se comportan:** corren solos mientras la sección está a la vista y tienen un botón para pausarlos (WCAG 2.2.2). Con *reducir movimiento* o ahorro de datos arrancan en pausa y no se descargan. Es el paso 9 del JS.
- **QA:** **187 bien, 0 mal**. Ahora prueba también que los clips corren a la vista, que el botón los pausa y que con *reducir movimiento* no se descargan. El inglés tiene 347 textos.

**Publicación (26/11/2026):**
- Con el visto bueno del titular, `caminos-2026-11` se fusionó en `master` sin conflictos (fast-forward, commit `e142a84`) y se subió a GitHub. GitHub Pages lo construyó sin errores.
- **En vivo:** responden con 200 las seis páginas, el CSS, el JS, los clips y `nativzar-mj/`.
- **`qa_portafolio.mjs` sobre https://ediquin.github.io/ediquinweb/: 187 bien, 0 mal.**
- **Para revertir:** `git revert e142a84` y subir, o volver `master` a `274f751`.

**Ajuste posterior del 26/11/2026: certificados en LinkedIn.**
- El titular indicó que sus certificados y el trofeo TechStar están enlazados en su LinkedIn.
- La sección 06 enlaza a `linkedin.com/in/ediquin/details/certifications/`, y la tarjeta TechStar a `…/details/honors/`. Así, cuando sume un certificado en LinkedIn, el portafolio queda al día sin editarlo.
- No se copiaron los enlaces de cada certificado.
- QA local: 187 bien, 0 mal. Inglés: 350 textos.
- **Publicado** el 26/11/2026 con el visto bueno del titular (commit `1a6d5bc`). Pages lo construyó sin errores. QA sobre el sitio en vivo: **187 bien, 0 mal**. Para revertir: `git revert 1a6d5bc`.

### Pendiente del titular
- Agregar con tiempo el resto de los requisitos de la sexta versión: enlaces de certificados que no estén en LinkedIn, un botón para descargar el CV si lo quiere, y revisar la cifra «Apps y herramientas: 7» y las tecnologías de Nativzar MJ.

- Buscar los otros diseños de la parca (con otros colores) y decir si las mangas de la polera del Club Central necesitan otro ajuste.
- Revisar la trayectoria nueva (tomada del CV) y la traducción al inglés.
- Pasar la ConquisRuta enviada con las actividades en cada papiro, si la tiene en el teléfono o en WhatsApp.
- Si quiere una intro nueva hecha con Google Flow, generarla en su cuenta (ese servicio no se usa desde aquí).
- Si quiere, pasar la foto profesional del CV para reemplazar el retrato de 334 px.
- Una foto de perfil de mayor resolución, con fondo recortado.
- Si quiere, agregar ejemplos de retoque «antes y después» de fotos propias, y nombrar sus herramientas de edición de fotos.
- La captura de Nativzar muestra el rediseño del 24/11 (logo 3D y Shorts), que todavía no está publicado en nativzar.com.
