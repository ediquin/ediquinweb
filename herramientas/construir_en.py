#!/usr/bin/env python3
"""Genera en/index.html (versión en inglés) a partir de index.html (español).

Uso: python3 herramientas/construir_en.py
Cada par (español, inglés) debe aparecer en index.html; si un texto cambió, el script se detiene
y dice cuál, para actualizar la traducción. Al final avisa si quedó texto que parece español.
"""
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
s = (RAIZ / 'index.html').read_text(encoding='utf-8')

# 1. Rutas: la página inglesa vive en en/, así que los recursos locales suben un nivel.
s = re.sub(r'(src|href|poster|data-src|data-grande|data-vista)="(?!https?:|mailto:|#|\.\./|/)([^"]+)"', r'\1="../\2"', s)
s = re.sub(r'srcset="([^"]+)"', lambda m: 'srcset="' + re.sub(r'(^|, )(img/)', r'\1../\2', m.group(1)) + '"', s)

# 2. Textos. Orden: primero los fragmentos largos que contienen a otros más cortos.
PARES = [
    ('<html lang="es">', '<html lang="en">'),
    ('<title>Edilson Laura · ediquin — Ingeniero, diseño, video, web e IA</title>',
     '<title>Edilson Laura · ediquin — Engineer, design, video, web and AI</title>'),
    ('content="Portafolio de Edilson Byron Laura Mercado (ediquin), ingeniero electrónico y desarrollador full-stack: diseño gráfico y de marca, piezas para la iglesia, video, sitios web y automatización con IA. La Paz, Bolivia."',
     'content="Portfolio of Edilson Byron Laura Mercado (ediquin), electronics engineer and full-stack developer: graphic and brand design, church design work, video, websites and AI automation. La Paz, Bolivia."'),
    ('<link rel="canonical" href="https://ediquin.github.io/ediquinweb/">', '<link rel="canonical" href="https://ediquin.github.io/ediquinweb/en/">'),
    ('<meta property="og:title" content="Edilson Laura · ediquin — Ingeniero, diseño, video, web e IA">',
     '<meta property="og:title" content="Edilson Laura · ediquin — Engineer, design, video, web and AI">'),
    ('content="Ingeniero electrónico y desarrollador full-stack que diseña afiches, identidades, videos y sitios web, y automatiza con IA."',
     'content="Electronics engineer and full-stack developer who designs posters, brand identities, videos and websites, and automates with AI."'),
    ('<meta property="og:url" content="https://ediquin.github.io/ediquinweb/">', '<meta property="og:url" content="https://ediquin.github.io/ediquinweb/en/">\n<meta property="og:locale" content="en_US">'),
    ('<a class="saltar" href="#contenido">Saltar al contenido</a>', '<a class="saltar" href="#contenido">Skip to content</a>'),
    ('<nav class="menu" aria-label="Secciones">', '<nav class="menu" aria-label="Sections">'),
    ('<span aria-hidden="true">01</span>Diseño</a>', '<span aria-hidden="true">01</span>Design</a>'),
    ('<span aria-hidden="true">03</span>Foto</a>', '<span aria-hidden="true">03</span>Photo</a>'),
    ('<span aria-hidden="true">05</span>IA</a>', '<span aria-hidden="true">05</span>AI</a>'),
    ('<a href="#trayectoria">Trayectoria</a>', '<a href="#trayectoria">Experience</a>'),
    ('<a class="idioma" href="../en/" hreflang="en" lang="en"><span class="sr-only">Read in English · </span>EN</a>',
     '<a class="idioma" href="../" hreflang="es" lang="es"><span class="sr-only">Leer en español · </span>ES</a>'),
    ('href="#contacto">Escríbeme</a>', 'href="#contacto">Contact me</a>'),

    # héroe
    ('<h1 id="heroe-t">Ingeniero que diseña, programa <em>y crea con IA.</em></h1>',
     '<h1 id="heroe-t">An engineer who designs, codes <em>and creates with AI.</em></h1>'),
    ('<p class="heroe-rol">Ingeniero electrónico · Desarrollador full-stack · Automatización con IA</p>',
     '<p class="heroe-rol">Electronics engineer · Full-stack developer · AI automation</p>'),
    ('<p class="heroe-lead">Hice sitios para clientes como <strong>Cox Automotive</strong> en CodeRoad y enseñé en la universidad. Hoy uno la ingeniería con el diseño: <strong>afiches, identidades, videos, sitios web y flujos con agentes de IA</strong>, cuidando que cada pieza se vea bien y funcione.</p>',
     '<p class="heroe-lead">I built websites for clients such as <strong>Cox Automotive</strong> at CodeRoad and taught at university. Today I bring engineering and design together: <strong>posters, brand identities, videos, websites and AI agent workflows</strong>, making sure every piece looks good and works.</p>'),
    ('>Ver mi trabajo <svg', '>See my work <svg'),
    ('href="#contacto">Hablemos</a>', 'href="#contacto">Let\'s talk</a>'),
    ('<dt>Videos en YouTube</dt>', '<dt>YouTube videos</dt>'),
    ('<dt>Sitios publicados</dt>', '<dt>Websites live</dt>'),
    ('<dt>Piezas para la iglesia</dt>', '<dt>Church design pieces</dt>'),
    ('aria-label="Muestras de mi trabajo"', 'aria-label="Samples of my work"'),
    ('alt="Edilson Laura, retrato recortado sin fondo"', 'alt="Edilson Laura, cut-out portrait"'),
    ('<figcaption>Afiche</figcaption>', '<figcaption>Poster</figcaption>'),
    ('alt="Miniatura del Short «Dijeron que Salomón se equivocó»"', 'alt="Thumbnail of the Short «They said Solomon was wrong»"'),
    ('alt="Logo 3D de Kauxte"', 'alt="Kauxte 3D logo"'),
    ('<figcaption>Logo 3D</figcaption>', '<figcaption>3D logo</figcaption>'),
    ('alt="Portada del sitio kauxte.com"', 'alt="Home page of kauxte.com"'),
    ('DISEÑO · VIDEO · FOTO · WEB · IA · ', 'DESIGN · VIDEO · PHOTO · WEB · AI · '),
    ('<span>Afiches</span><span>Identidad de marca</span><span>Logos 3D</span><span>Shorts</span><span>Animación</span><span>Escudos y parches</span><span>Uniformes</span><span>Sitios web</span><span>IA generativa</span><span>Figma · aprendiendo</span>',
     '<span>Posters</span><span>Brand identity</span><span>3D logos</span><span>Shorts</span><span>Animation</span><span>Badges and patches</span><span>Uniforms</span><span>Websites</span><span>Generative AI</span><span>Figma · learning</span>'),

    # índice
    ('<p class="pre">Índice</p>', '<p class="pre">Index</p>'),
    ('<h2 id="indice-t">Lo que hago, <em>en orden.</em></h2>', '<h2 id="indice-t">What I do, <em>in order.</em></h2>'),
    ('<p>Cinco áreas que se apoyan entre sí: el diseño da la base, y el video, la foto, la web y la IA la llevan a cada pantalla.</p>',
     '<p>Five areas that support each other: design is the foundation, and video, photo, web and AI take it to every screen.</p>'),
    ('<span class="ix-t">Diseño gráfico y de marca</span><span class="ix-d">Afiches, identidad, logos 3D y piezas para la iglesia</span>',
     '<span class="ix-t">Graphic and brand design</span><span class="ix-d">Posters, identity, 3D logos and church design</span>'),
    ('<span class="ix-t">Video y animación</span><span class="ix-d">Shorts, edición, motion y 3D</span>',
     '<span class="ix-t">Video and animation</span><span class="ix-d">Shorts, editing, motion and 3D</span>'),
    ('<span class="ix-t">Edición fotográfica</span><span class="ix-d">Fotos integradas al diseño, fotomontaje y miniaturas</span>',
     '<span class="ix-t">Photo editing</span><span class="ix-d">Photos built into designs, composites and thumbnails</span>'),
    ('<span class="ix-t">Sitios web y apps</span><span class="ix-d">Rápidos, accesibles y bilingües</span>',
     '<span class="ix-t">Websites and apps</span><span class="ix-d">Fast, accessible and bilingual</span>'),
    ('<span class="ix-t">IA aplicada</span><span class="ix-d">Imagen, voz, video y agentes</span>',
     '<span class="ix-t">Applied AI</span><span class="ix-d">Image, voice, video and agents</span>'),

    # 01 diseño
    ('<p class="pre">Diseño gráfico y de marca</p>', '<p class="pre">Graphic and brand design</p>'),
    ('<h2 id="diseno-t">Piezas que se <em>entienden</em> de un vistazo.</h2>', '<h2 id="diseno-t">Pieces you <em>understand</em> at a glance.</h2>'),
    ('<p class="area-intro">Jerarquía clara, contraste que se lee en un celular y una paleta que se repite en todo: así diseño afiches para eventos, identidades completas y logos que también viven en 3D.</p>',
     '<p class="area-intro">Clear hierarchy, contrast that reads on a phone and one palette used everywhere: that is how I design event posters, complete identities and logos that also live in 3D.</p>'),
    ('Afiche de la especialidad de Informática Programable con Edilson como Guía Mayor', 'Programmable Computing honor poster featuring Edilson as a Master Guide'),
    ('Afiche de la especialidad de Arqueología Bíblica', 'Biblical Archaeology honor poster'),
    ('Afiche de la especialidad de Coleccionista con parches reales', 'Collector honor poster with real patches'),
    ('<h3>Afiches de especialidades</h3>', '<h3>Honor posters</h3>'),
    ('<p>Serie para clubes de Conquistadores: un mismo sistema (título grande, emblema al centro, fecha en placa) que cambia de textura según el tema. Toca un afiche para verlo grande.</p>',
     '<p>A series for Pathfinder clubs: one system (large title, emblem in the centre, date on a plaque) that changes texture with each topic. Tap a poster to see it large.</p>'),
    ('alt="Logo completo de Kauxte by ediquin sobre fondo verde"', 'alt="Full Kauxte by ediquin logo on a green background"'),
    ('<h3>Identidad de Kauxte</h3>', '<h3>Kauxte identity</h3>'),
    ('<p>Logo <b>&gt;e:</b>, paleta verde y dorada, tipografía, íconos y banners para redes y GitHub.</p>',
     '<p>The <b>&gt;e:</b> logo, green and gold palette, typography, icons and banners for social media and GitHub.</p>'),
    ('alt="Logo de Nativzar: montaña, sendero verde y cruz"', 'alt="Nativzar logo: mountain, green path and cross"'),
    ('alt="Versión 3D del logo de Nativzar"', 'alt="3D version of the Nativzar logo"'),
    ('<h3>Nativzar: del logo al 3D</h3>', '<h3>Nativzar: from logo to 3D</h3>'),
    ('<p>El logo plano convertido en un diorama 3D interactivo (Three.js) para el sitio.</p>',
     '<p>The flat logo turned into an interactive 3D diorama (Three.js) for the website.</p>'),
    ('alt="Banner de Kauxte para GitHub: Ingeniería limpia. Diseño a medida."', 'alt="Kauxte GitHub banner: Clean engineering. Tailored design."'),
    ('<h3>Banners y piezas para redes</h3>', '<h3>Banners and social media pieces</h3>'),
    ('<p>Cada formato con su propia composición, no un recorte del anterior.</p>', '<p>Each format gets its own layout, not a crop of the last one.</p>'),

    # 01 iglesia
    ('<p class="pre">Para la iglesia · Conquistadores y Ministerio Joven, MBON</p>', '<p class="pre">For the church · Pathfinders and Youth Ministries, MBON</p>'),
    ('<h3>Series, escudos y eventos <em>con un flujo propio de IA.</em></h3>', '<h3>Series, badges and events <em>with my own AI workflow.</em></h3>'),
    ('<p>Diseño con un agente que conoce los emblemas, pañoletas y uniformes oficiales, y que repara los símbolos cuando la IA los deforma. Así una serie entera sale coherente y fiel a la identidad del club.</p>',
     '<p>I design with an agent that knows the official emblems, scarves and uniforms, and repairs the symbols when the AI distorts them. That way a whole series comes out consistent and true to the club\'s identity.</p>'),
    ('aria-label="Serie Semana de la Pañoleta"', 'aria-label="Scarf Week series"'),
    ('Semana de la Pañoleta, desafío 1: Disciplina y civismo', 'Scarf Week, challenge 1: Discipline and civic duty'),
    ('Semana de la Pañoleta, desafío 2: Fe y oración', 'Scarf Week, challenge 2: Faith and prayer'),
    ('Semana de la Pañoleta, desafío 3: Comparte esperanza', 'Scarf Week, challenge 3: Share hope'),
    ('Semana de la Pañoleta, desafío 4: Generosidad en acción', 'Scarf Week, challenge 4: Generosity in action'),
    ('Semana de la Pañoleta, desafío 5: Gratitud en familia', 'Scarf Week, challenge 5: Gratitude as a family'),
    ('Semana de la Pañoleta, desafío 6: Identidad conquistadora', 'Scarf Week, challenge 6: Pathfinder identity'),
    ('Semana de la Pañoleta, desafío 7: Amistad entre clubes', 'Scarf Week, challenge 7: Friendship between clubs'),
    ('<span>01 · Disciplina y civismo</span>', '<span>01 · Discipline and civic duty</span>'),
    ('<span>02 · Fe y oración</span>', '<span>02 · Faith and prayer</span>'),
    ('<span>03 · Comparte esperanza</span>', '<span>03 · Share hope</span>'),
    ('<span>04 · Generosidad en acción</span>', '<span>04 · Generosity in action</span>'),
    ('<span>05 · Gratitud en familia</span>', '<span>05 · Gratitude as a family</span>'),
    ('<span>06 · Identidad conquistadora</span>', '<span>06 · Pathfinder identity</span>'),
    ('<span>07 · Amistad entre clubes</span>', '<span>07 · Friendship between clubs</span>'),
    ('<figcaption><b>Semana de la Pañoleta · 7 desafíos.</b> Una ilustración por día con el mismo estilo, marco y jerarquía. Toca un afiche para verlo grande.</figcaption>',
     '<figcaption><b>Scarf Week · 7 challenges.</b> One illustration a day with the same style, frame and hierarchy. The posters are in Spanish. Tap one to see it large.</figcaption>'),
    ('Escudo hexagonal del CEAD, curso de entrenamiento avanzado de directivas', 'Hexagonal badge for CEAD, an advanced leadership training course'),
    ('Mapa ilustrado ConquisRuta de agosto de 2026', 'Illustrated ConquisRuta map for August 2026'),
    ('<h4>ConquisRuta</h4><p>Mapa ilustrado del mes: cada papiro es una actividad del club.</p>', '<h4>ConquisRuta</h4><p>An illustrated map of the month: each scroll is a club activity.</p>'),
    ('Logo CEAD Liderazgo con dos conquistadores sobre una montaña', 'CEAD Leadership logo with two Pathfinders on a mountain'),
    ('Escudo del Curso de GMM y GMMA con el Illimani', 'Badge for the GMM and GMMA course with Mount Illimani'),
    ('<h4>Escudos y parches</h4><p>Insignias para cursos y campamentos, pensadas para bordarse: pocos colores, borde grueso y texto que se lee a 8 cm.</p>',
     '<h4>Badges and patches</h4><p>Badges for courses and camps, made to be embroidered: few colours, a thick border and text you can read at 8 cm.</p>'),
    ('Afiche de la excursión del Día Mundial del Conquistador', 'Poster for the World Pathfinder Day hike'),
    ('Afiche de la Recepción de Sábado del Día Mundial del Conquistador', 'Poster for the Sabbath welcome on World Pathfinder Day'),
    ('Flyer de la reunión informativa para el Camporí Regional', 'Flyer for the Regional Camporee information meeting'),
    ('Afiche del Día Mundial del Conquistador del Club Central', 'Club Central poster for World Pathfinder Day'),
    ('<h4>Flyers de actividades</h4><p>Excursiones, reuniones y celebraciones, listos para WhatsApp el mismo día: fecha, hora y lugar primero.</p>',
     '<h4>Activity flyers</h4><p>Hikes, meetings and celebrations, ready for WhatsApp the same day: date, time and place first.</p>'),
    ('Polera Trazo Andino para coordinadores de la MBON, frente y espalda', 'Trazo Andino T-shirt for MBON coordinators, front and back'),
    ('<h4>Uniformes «Trazo andino»</h4><p>Poleras y conjunto deportivo para coordinadores de la MBON, con la cordillera como franja y tres paletas para elegir.</p>',
     '<h4>«Trazo andino» uniforms</h4><p>T-shirts and a tracksuit for MBON coordinators, with the Andes as a stripe and three palettes to choose from.</p>'),
    ('aria-label="Intro animada del club: conquistadores caminando por el bosque hacia el título Misión Boliviana Occidental Norte"',
     'aria-label="Animated club intro: Pathfinders walking through a forest towards the title Misión Boliviana Occidental Norte"'),
    ('<figcaption><b>Intro animada para videos del club.</b> Ilustración animada y títulos en DaVinci Resolve, 6 s.</figcaption>',
     '<figcaption><b>Animated intro for club videos.</b> Animated illustration and titles in DaVinci Resolve, 6 s.</figcaption>'),

    # 02 video
    ('<p class="pre">Video y animación</p>', '<p class="pre">Video and animation</p>'),
    ('<h2 id="video-t">Historias cortas que <em>se quedan.</em></h2>', '<h2 id="video-t">Short stories that <em>stick.</em></h2>'),
    ('<p class="area-intro">Escribo el guion, grabo o genero la voz, edito, animo y subtitulo. La serie <b>«Escrito antes de ser descubierto»</b> del canal Nativzar ya tiene siete capítulos.</p>',
     '<p class="area-intro">I write the script, record or generate the voice, edit, animate and add subtitles. The Nativzar channel series <b>«Written before it was discovered»</b> already has seven episodes (in Spanish).</p>'),
    ('<span class="chip">Cap. 7 · Nuevo</span><b>Dijeron que Salomón se equivocó con las hormigas</b><span>Proverbios 6:6–8 · 2:55</span>',
     '<span class="chip">Ep. 7 · New</span><b>They said Solomon was wrong about ants</b><span>Proverbs 6:6–8 · 2:55</span>'),
    ('<span class="chip">Cap. 6</span><b>¿Curar sacando sangre?</b><span>Levítico 17:11 · 2:51</span>',
     '<span class="chip">Ep. 6</span><b>Healing by drawing blood?</b><span>Leviticus 17:11 · 2:51</span>'),
    ('<span class="chip">Cap. 4</span><b>¿Quién inventó la cuarentena?</b><span>Levítico 13 · 1:46</span>',
     '<span class="chip">Ep. 4</span><b>Who invented quarantine?</b><span>Leviticus 13 · 1:46</span>'),
    ('<span class="chip">Cap. 3</span><b>¿Senderos dentro del mar?</b><span>Salmos 8:8 · 1:36</span>',
     '<span class="chip">Ep. 3</span><b>Paths in the sea?</b><span>Psalm 8:8 · 1:36</span>'),
    ('<span class="chip">Cap. 2</span><b>Agua Viva: el secreto de la higiene</b><span>Levítico 15:13 · 1:30</span>',
     '<span class="chip">Ep. 2</span><b>Living water: the secret of hygiene</b><span>Leviticus 15:13 · 1:30</span>'),
    ('<span class="chip">Cap. 1</span><b>¿Por qué el mar nunca se llena?</b><span>Eclesiastés 1:7 · 1:41</span>',
     '<span class="chip">Ep. 1</span><b>Why is the sea never full?</b><span>Ecclesiastes 1:7 · 1:41</span>'),
    ('<span class="chip">Reflexión</span><b>El camino de la vida</b><span>Mateo 7:13–14 · 0:53</span>',
     '<span class="chip">Reflection</span><b>The path of life</b><span>Matthew 7:13–14 · 0:53</span>'),
    ('<span class="sr-only">(abre YouTube)</span>', '<span class="sr-only">(opens YouTube)</span>'),
    ('aria-label="Shorts anteriores"', 'aria-label="Previous Shorts"'),
    ('aria-label="Shorts siguientes"', 'aria-label="Next Shorts"'),
    ('>Todo el canal en YouTube <svg', '>The whole channel on YouTube <svg'),
    ('aria-label="Animación de Kauxte: de la idea a la web, al video y al crecimiento"', 'aria-label="Kauxte animation: from the idea to the website, the video and growth"'),
    ('aria-label="Pausar la animación"', 'aria-label="Pause the animation"'),
    ('<figcaption><b>Animación de marca para Kauxte.</b> Cuatro tomas generadas con Higgsfield, unidas y editadas en una sola historia de 20 s.</figcaption>',
     '<figcaption><b>Brand animation for Kauxte.</b> Four shots generated with Higgsfield, cut together into one 20-second story.</figcaption>'),
    ('<h3>Cómo edito un video</h3>', '<h3>How I edit a video</h3>'),
    ('<li><b>Guion y ritmo.</b> Un gancho en los primeros segundos y una idea por escena.</li>', '<li><b>Script and pacing.</b> A hook in the first seconds and one idea per scene.</li>'),
    ('<li><b>Voz.</b> Grabada o sintetizada, limpia y con buena dicción.</li>', '<li><b>Voice.</b> Recorded or synthesised, clean and clearly spoken.</li>'),
    ('<li><b>Montaje.</b> Cortes al ritmo de la voz y la música, en Kdenlive o DaVinci Resolve.</li>', '<li><b>Editing.</b> Cuts on the rhythm of the voice and music, in Kdenlive or DaVinci Resolve.</li>'),
    ('<li><b>Animación.</b> Motion graphics por código con Remotion, y 3D con Blender o Three.js.</li>', '<li><b>Animation.</b> Motion graphics in code with Remotion, and 3D with Blender or Three.js.</li>'),
    ('<li><b>Cierre.</b> Subtítulos, miniatura propia y versiones para cada red.</li>', '<li><b>Finishing.</b> Subtitles, a custom thumbnail and versions for each platform.</li>'),
    ('>Ver el capítulo largo (4:03) <svg', '>Watch the long episode (4:03) <svg'),

    # 03 foto
    ('<p class="pre">Edición fotográfica</p>', '<p class="pre">Photo editing</p>'),
    ('<h2 id="foto-t">La foto correcta, <em>bien tratada.</em></h2>', '<h2 id="foto-t">The right photo, <em>well treated.</em></h2>'),
    ('<p class="area-intro">No solo recorto: integro personas y objetos reales a un diseño con la misma luz, color y sombra, y dejo cada pieza lista para imprimir, para miniatura o para una web liviana.</p>',
     '<p class="area-intro">I don\'t just cut photos out: I build real people and objects into a design with matching light, colour and shadow, and prepare each piece for print, for a thumbnail or for a lightweight website.</p>'),
    ('Afiche de Informática Programable con Edilson como Guía Mayor', 'Programmable Computing poster featuring Edilson as a Master Guide'),
    ('<figcaption><b>Foto integrada.</b> Mi foto como expositor, con la pañoleta de Guía Mayor, unida al fondo tecnológico con la misma luz azul y el parche al frente.</figcaption>',
     '<figcaption><b>Photo built into the design.</b> My photo as the speaker, wearing the Master Guide scarf, blended into the tech background with the same blue light and the patch in front.</figcaption>'),
    ('Afiche de Coleccionista compuesto con fotos reales de parches', 'Collector poster composed from real photos of patches'),
    ('<figcaption><b>Fotomontaje.</b> Parches reales fotografiados, recortados uno por uno e integrados con sombra y luz comunes.</figcaption>',
     '<figcaption><b>Photo composite.</b> Real patches photographed, cut out one by one and blended with shared light and shadow.</figcaption>'),
    ('alt="Miniatura del Short sobre la sangría"', 'alt="Thumbnail of the Short about bloodletting"'),
    ('alt="Miniatura del Short sobre los senderos del mar"', 'alt="Thumbnail of the Short about the paths of the sea"'),
    ('alt="Miniatura del Short sobre el agua viva"', 'alt="Thumbnail of the Short about living water"'),
    ('<figcaption><b>Miniaturas.</b> Imagen, tipografía y color pensados para leerse en el tamaño de una uña.</figcaption>',
     '<figcaption><b>Thumbnails.</b> Image, type and colour designed to read at the size of a fingernail.</figcaption>'),
    ('<h3>Qué hago con una foto</h3>', '<h3>What I do with a photo</h3>'),
    ('<li>Integrar personas y objetos a un diseño</li>', '<li>Build people and objects into a design</li>'),
    ('<li>Corrección de luz, color y balance de blancos</li>', '<li>Light, colour and white balance correction</li>'),
    ('<li>Retoque de piel y limpieza de detalles</li>', '<li>Skin retouching and clean-up</li>'),
    ('<li>Fotomontaje y composición para afiches</li>', '<li>Composites and layouts for posters</li>'),
    ('<li>Exportación para web: WebP en varios tamaños, livianas y nítidas</li>', '<li>Web export: WebP in several sizes, light and sharp</li>'),

    # 04 web
    ('<p class="pre">Sitios web y apps</p>', '<p class="pre">Websites and apps</p>'),
    ('<h2 id="web-t">El diseño, <em>funcionando</em> en el celular.</h2>', '<h2 id="web-t">Design, <em>working</em> on your phone.</h2>'),
    ('<p class="area-intro">Diseño y programo sitios rápidos, accesibles y en dos idiomas. Los publico en mi propio servidor y los pruebo en celular, tableta y escritorio antes de entregarlos.</p>',
     '<p class="area-intro">I design and build fast, accessible, bilingual websites. I host them on my own server and test them on phone, tablet and desktop before handing them over.</p>'),
    ('alt="Portada del sitio Kauxte"', 'alt="Kauxte home page"'),
    ('<span class="sr-only">Abrir kauxte.com</span>', '<span class="sr-only">Open kauxte.com</span>'),
    ('<p class="pre">Mi estudio</p>', '<p class="pre">My studio</p>'),
    ('<p>Sitio de mis servicios de web y video, en español e inglés, con armador de presupuesto, logo 3D animado y un reproductor de video por capítulos.</p>',
     '<p>The site for my web and video services, in Spanish and English, with a quote builder, an animated 3D logo and a chaptered video player.</p>'),
    ('<dt>Rendimiento móvil</dt>', '<dt>Mobile performance</dt>'),
    ('<dt>Accesibilidad</dt>', '<dt>Accessibility</dt>'),
    ('<dt>Idiomas</dt>', '<dt>Languages</dt>'),
    ('>Visitar kauxte.com <svg', '>Visit kauxte.com <svg'),
    ('<span><b>Repulgue</b>Salteñería · menú y pedidos por WhatsApp</span>', '<span><b>Repulgue</b>Salteña bakery · menu and WhatsApp orders</span>'),
    ('<span><b>Odontología Tres Picos</b>Consultorio · servicios, equipo y primera visita</span>', '<span><b>Odontología Tres Picos</b>Dental clinic · services, team and first visit</span>'),
    ('<span><b>Puntada Kantuta</b>Bordados · catálogo y cotización</span>', '<span><b>Puntada Kantuta</b>Embroidery · catalogue and quotes</span>'),
    ('<span><b>Nativzar</b>Proyectos cristocéntricos · Shorts y logo 3D</span><em>Propio</em>', '<span><b>Nativzar</b>Christ-centred projects · Shorts and 3D logo</span><em>Mine</em>'),
    ('<h3>Apps y herramientas</h3>', '<h3>Apps and tools</h3>'),
    ('<span>App Android para clubes, eventos y reportes del Ministerio Joven, con lector QR.</span>', '<span>Android app for clubs, events and Youth Ministries reports, with a QR reader.</span>'),
    ('<span>App web instalable para generar y evaluar con códigos QR en campamentos.</span>', '<span>Installable web app to create QR codes and score with them at camps.</span>'),
    ('<b>Certificados con QR</b><span>Generador de certificados y página pública para validarlos.</span>', '<b>QR certificates</b><span>Certificate generator and a public page to verify them.</span>'),
    ('<b>Curso virtual SGC</b><span>Recursos de capacitación para líderes de Conquistadores.</span>', '<b>SGC online course</b><span>Training resources for Pathfinder leaders.</span>'),

    # 05 IA
    ('<p class="pre">IA aplicada</p>', '<p class="pre">Applied AI</p>'),
    ('<h2 id="ia-t">La IA acelera. <em>El criterio decide.</em></h2>', '<h2 id="ia-t">AI speeds things up. <em>Judgement decides.</em></h2>'),
    ('<p class="area-intro">Uso la IA como parte del taller, no como atajo: genero bocetos, voces y tomas, y después elijo, corrijo y termino cada pieza con criterio de diseño.</p>',
     '<p class="area-intro">I use AI as part of the workshop, not as a shortcut: I generate drafts, voices and shots, then choose, correct and finish each piece with a designer\'s eye.</p>'),
    ('alt="Ilustración de un niño conquistador en estilo de caricatura clásica"', 'alt="Illustration of a young Pathfinder in a classic cartoon style"'),
    ('<div><h3>Imagen</h3><p>Personajes e ilustraciones con generadores de imagen, corregidos hasta respetar cada detalle del uniforme y los emblemas.</p></div>',
     '<div><h3>Image</h3><p>Characters and illustrations made with image generators, corrected until every detail of the uniform and emblems is right.</p></div>'),
    ('<h3>Video</h3><p>Tomas cinematográficas con <b>Higgsfield</b> y animación por código con Remotion.</p>', '<h3>Video</h3><p>Cinematic shots with <b>Higgsfield</b> and animation in code with Remotion.</p>'),
    ('<h3>Voz</h3><p>Narraciones con <b>ElevenLabs</b>, voz clonada propia y limpieza de audio.</p>', '<h3>Voice</h3><p>Narration with <b>ElevenLabs</b>, my own cloned voice and audio clean-up.</p>'),
    ('<h3>Código y agentes</h3><p>Desarrollo con <b>Claude Code</b>, Codex y Cursor. Agentes con LangGraph, CrewAI y n8n, y un flujo de agentes que diseña los afiches del club.</p>',
     '<h3>Code and agents</h3><p>I develop with <b>Claude Code</b>, Codex and Cursor. Agents with LangGraph, CrewAI and n8n, and an agent workflow that designs the club\'s posters.</p>'),

    # aprendiendo
    ('<div class="fm-marco fm-a"><span>Frame · Móvil</span>', '<div class="fm-marco fm-a"><span>Frame · Mobile</span>'),
    ('<div class="fm-marco fm-b"><span>Componente · Botón</span><em>Escríbeme</em><em class="var">Escríbeme</em></div>', '<div class="fm-marco fm-b"><span>Component · Button</span><em>Contact me</em><em class="var">Contact me</em></div>'),
    ('<span>Portafolio — Figma</span>', '<span>Portfolio — Figma</span>'),
    ('</span>Ahora mismo</p>', '</span>Right now</p>'),
    ('<h2 id="figma-t">Estoy aprendiendo <em>Figma.</em></h2>', '<h2 id="figma-t">I\'m learning <em>Figma.</em></h2>'),
    ('<p>Quiero pasar del boceto al diseño de interfaz con un sistema ordenado antes de programarlo. Estoy practicando:</p>',
     '<p>I want to go from sketch to interface design with a tidy system before I code it. I\'m practising:</p>'),
    ('<li>Frames, cuadrículas y <b>auto layout</b></li>', '<li>Frames, grids and <b>auto layout</b></li>'),
    ('<li><b>Componentes</b> y variantes reutilizables</li>', '<li>Reusable <b>components</b> and variants</li>'),
    ('<li>Estilos de color y texto como sistema de diseño</li>', '<li>Colour and text styles as a design system</li>'),
    ('<li>Prototipos navegables para mostrar una idea antes de construirla</li>', '<li>Clickable prototypes to show an idea before building it</li>'),

    # herramientas
    ('<p class="pre">Herramientas</p>', '<p class="pre">Tools</p>'),
    ('<h2 id="herr-t">Con qué <em>trabajo.</em></h2>', '<h2 id="herr-t">What I <em>work with.</em></h2>'),
    ('<h3>Diseño</h3><ul><li>Canva</li><li>Figma <em>aprendiendo</em></li><li>Three.js (logos 3D)</li>', '<h3>Design</h3><ul><li>Canva</li><li>Figma <em>learning</em></li><li>Three.js (3D logos)</li>'),
    ('<h3>Web y apps</h3>', '<h3>Web and apps</h3>'),
    ('<h3>IA</h3><ul>', '<h3>AI</h3><ul>'),

    # trayectoria
    ('<p class="pre">Trayectoria</p>', '<p class="pre">Experience</p>'),
    ('<h2 id="tray-t">De los circuitos <em>a las pantallas.</em></h2>', '<h2 id="tray-t">From circuits <em>to screens.</em></h2>'),
    ('<p class="area-intro">Empecé diseñando placas y sistemas electrónicos, después hice sitios para clientes internacionales y enseñé en la universidad. De ahí viene mi manera de trabajar: medir, probar y cuidar que cada parte encaje.</p>',
     '<p class="area-intro">I started out designing circuit boards and electronic systems, then built websites for international clients and taught at university. That is where my way of working comes from: measure, test and make sure every part fits.</p>'),
    ('<div><h3>Ingeniería Electrónica · UMSA</h3><p>Universidad Mayor de San Andrés, La Paz, con mención en Sistemas de Computación.</p></div>',
     '<div><h3>Electronic Engineering · UMSA</h3><p>Universidad Mayor de San Andrés, La Paz, specialising in Computer Systems.</p></div>'),
    ('<h3>Pasantía y proyecto de grado</h3>', '<h3>Internship and degree project</h3>'),
    ('<p>En la pasantía diseñé y armé unos diez circuitos, del esquema a la placa: un tablero interactivo para enseñar electrónica y el control de una máquina prensadora de alimentos. Mi proyecto de grado fue un sistema de asistencia biométrico con IoT y su web de reportes para el Instituto de Electrónica Aplicada.</p>',
     '<p>During my internship I designed and assembled about ten circuits, from schematic to board: an interactive board for teaching electronics and the controller for a food pressing machine. My degree project was a biometric attendance system with IoT and a reporting website for the Institute of Applied Electronics.</p>'),
    ('alt="Diseño de una placa de circuito impreso"', 'alt="Printed circuit board design"'),
    ('alt="Circuito de control de la máquina prensadora"', 'alt="Control circuit of the pressing machine"'),
    ('alt="Lector biométrico del sistema de asistencia"', 'alt="Fingerprint reader of the attendance system"'),
    ('<div><h3>Backend de «PASY Mascotas»</h3><p>App web de código abierto para adoptar mascotas: base de datos, backend en PHP y MySQL y despliegue en la nube. <a class="enlace" href="https://github.com/ediquin/pasy" target="_blank" rel="noopener">Ver el código</a></p></div>',
     '<div><h3>Backend for «PASY Mascotas»</h3><p>An open-source web app for pet adoption: database, PHP and MySQL backend and cloud deployment. <a class="enlace" href="https://github.com/ediquin/pasy" target="_blank" rel="noopener">See the code</a></p></div>'),
    ('<p>Sitios y experiencias digitales automotrices para clientes como Cox Automotive: implementación, QA y validación de migraciones, y trato directo en inglés con los clientes. Reconocido como <b>TechStar of the Month · Customer Success Legend</b> en septiembre de 2025.</p>',
     '<p>Automotive websites and digital experiences for clients such as Cox Automotive: implementation, QA and migration validation, working directly with English-speaking clients. Named <b>TechStar of the Month · Customer Success Legend</b> in September 2025.</p>'),
    ('<div><h3>Docente universitario · UAB</h3><p>Arquitectura de Computadoras, Sistemas Digitales I y II y Bases de Datos I en la Universidad Adventista de Bolivia, con materiales por competencias e IA en clase. En 2024 terminé el Diplomado en Educación Superior Basada en Competencias.</p></div>',
     '<div><h3>University lecturer · UAB</h3><p>Computer Architecture, Digital Systems I and II and Database Systems I at Universidad Adventista de Bolivia, with competency-based materials and AI in class. In 2024 I completed a Diploma in Competency-Based Higher Education.</p></div>'),
    ('<div><h3>IA agéntica y nube</h3><p>Bootcamp de despliegue en la nube y de IA agéntica en CodeRoad, hackatones de IA agéntica, cursos de Anthropic (Model Context Protocol, Claude Code in Action) y de LangGraph.</p></div>',
     '<div><h3>Agentic AI and cloud</h3><p>Cloud deployment and agentic AI training at CodeRoad, agentic AI hackathons, and courses from Anthropic (Model Context Protocol, Claude Code in Action) and on LangGraph.</p></div>'),
    ('<div><h3>Coordinador del SGC · MBON, Kauxte y Nativzar</h3><p>Herramientas para el Ministerio Joven: un sistema para evaluar eventos y campamentos, flujos de agentes que diseñan afiches y una app para las unidades de Conquistadores. Además, mi estudio Kauxte y el canal Nativzar.</p></div>',
     '<div><h3>SGC coordinator · MBON, Kauxte and Nativzar</h3><p>Tools for Adventist Youth Ministries: a system to score events and camps, agent workflows that design posters and an app for Pathfinder units. Plus my studio, Kauxte, and the Nativzar channel.</p></div>'),
    ('<span class="linea-cuando">Iglesia</span>', '<span class="linea-cuando">Church</span>'),
    ('<div><h3>Liderazgo juvenil</h3><p>Guía Mayor investido en diciembre de 2025, director del Club de Conquistadores de 2020 a 2024 y director de Ministerio Joven en 2017.</p></div>',
     '<div><h3>Youth leadership</h3><p>Invested as a Master Guide in December 2025, Pathfinder Club director from 2020 to 2024 and Adventist Youth Ministries director in 2017.</p></div>'),
    ('<span class="linea-cuando">Ahora</span>', '<span class="linea-cuando">Now</span>'),
    ('<div><h3>Aprendiendo Figma</h3><p>Para diseñar interfaces con sistema antes de programarlas.</p></div>', '<div><h3>Learning Figma</h3><p>To design interfaces as a system before coding them.</p></div>'),

    # contacto y pie
    ('<p class="pre">Contacto</p>', '<p class="pre">Contact</p>'),
    ('<h2 id="contacto-t">¿Tienes un proyecto? <em>Hagámoslo bien.</em></h2>', '<h2 id="contacto-t">Got a project? <em>Let\'s do it right.</em></h2>'),
    ('<p>Afiches, un logo, un video para redes o un sitio web completo. Cuéntame qué necesitas y te respondo con una propuesta clara.</p>',
     '<p>Posters, a logo, a social media video or a complete website. Tell me what you need and I\'ll reply with a clear proposal. I work in Spanish and English.</p>'),
    ('<p><a href="../nativzar-mj/">Nativzar MJ</a> · <a href="../nativzar-mj/privacidad.html">Privacidad</a> · <a href="../nativzar-mj/terminos.html">Términos</a></p>',
     '<p><a href="../nativzar-mj/" hreflang="es">Nativzar MJ</a> · <a href="../nativzar-mj/privacidad.html" hreflang="es">Privacy (Spanish)</a> · <a href="../nativzar-mj/terminos.html" hreflang="es">Terms (Spanish)</a></p>'),
    ('<dialog class="visor" data-visor aria-label="Imagen ampliada">', '<dialog class="visor" data-visor aria-label="Enlarged image">'),
    ('<button class="redondo visor-cerrar" aria-label="Cerrar">', '<button class="redondo visor-cerrar" aria-label="Close">'),
]

for es, en in PARES:
    n = s.count(es)
    if n == 0:
        raise SystemExit(f'No encontré este texto en index.html (¿cambió?):\n  {es[:120]}')
    s = s.replace(es, en)

# 3. Aviso: texto visible que todavía parezca español
cuerpo = re.sub(r'<(script|style|svg)\b.*?</\1>', '', s, flags=re.S)
texto = re.sub(r'<[^>]+>', '\n', cuerpo)
sospechoso = [t.strip() for t in texto.split('\n') if re.search(r'[áéíóúñ¿¡]| y | de | con | para ', t)]
permitido = ('Edilson Byron Laura Mercado', 'Leer en español', 'Salteña', 'Misión Boliviana', 'Universidad', 'Odontología', 'PASY Mascotas', 'Trazo andino', 'Kauxte', 'kauxte')
resto = [t for t in sospechoso if t and not any(p in t for p in permitido)]
salida = RAIZ / 'en/index.html'
salida.parent.mkdir(exist_ok=True)
salida.write_text(s, encoding='utf-8')
print(f'en/index.html: {len(PARES)} textos traducidos')
if resto:
    print('Revisar, parece español:'); [print('  ·', t[:110]) for t in resto]
