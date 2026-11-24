#!/usr/bin/env python3
"""Prepara las imágenes y vistas previas del portafolio (img/2026/, video/2026/).

Uso: python3 herramientas/preparar_medios.py [carpeta de flyer_iasd]
Por defecto usa la copia local Conquistadores/AI_Design_Conquis, que tiene salidas sin subir a GitHub.
Las fuentes son trabajos reales del titular: afiches (repo flyer_iasd), miniaturas y clips del canal
Nativzar, identidad y capturas de Kauxte (portafolio_web) y fotos de los proyectos de electrónica.
"""
import shutil, sys
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
PP = RAIZ.parent                                  # Personal_projects
FLYER = Path(sys.argv[1]) if len(sys.argv) > 1 else PP.parent / 'Conquistadores/AI_Design_Conquis'
RESPALDO = Path('/srv/respaldo/archivo/05_Iglesia_IASD')
WEB = PP / 'portafolio_web'
ID = PP / 'Cloud_nativzar/docs/recursos/kauxte-identidad-20261117-dorado'
OUT = RAIZ / 'img/2026'; VID = RAIZ / 'video/2026'
OUT.mkdir(parents=True, exist_ok=True); VID.mkdir(parents=True, exist_ok=True)

def webp(src, nombre, anchos, q=80):
    im = Image.open(src)
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    for w in anchos:
        w2 = min(w, im.width)
        h2 = round(im.height * w2 / im.width)
        im.resize((w2, h2), Image.LANCZOS).save(OUT / f'{nombre}-{w}.webp', 'WEBP', quality=q, method=6)
    print(f'{nombre}: {im.size} -> {anchos}')

# 01 Diseño
# Informática: la versión final (25/08/2026) con la foto del titular como Guía Mayor
webp(FLYER / 'output/afiche-informatica-programable-guia-mayor-polera-negra.png', 'afiche-informatica-gm', [480, 900])
webp(FLYER / 'output/afiche-arqueologia-biblica.png', 'afiche-arqueologia', [480, 900])
webp(FLYER / 'afiches/afiche-especialidad-coleccionista-parches-reales.png', 'afiche-coleccionista', [480, 900])
webp(ID / 'logos/kauxte-logo-completo-20261117.webp', 'kauxte-logo', [640, 1000])
webp(ID / 'banners/banner-github-1280x640.webp', 'kauxte-banner', [640, 1280])
webp(WEB / 'marca/img/logo3d-20261117-1-800.webp', 'kauxte-3d', [520, 800])
webp(WEB / 'nativzar/img/logo-nativzar-completo-20261120-1.webp', 'nativzar-logo', [512])
webp(WEB / 'nativzar/img/logo3d-nativzar-20261124-1-1080.webp', 'nativzar-3d', [480, 900])
# 02 Video
canal = WEB / 'nativzar/img/canal'
for slug in ('hormiga-salomon', 'vida-sangre', 'protocolo-pandemias', 'senderos-mar', 'ciclo-agua', 'agua-viva', 'camino-vida'):
    webp(canal / f'{slug}-poster-20261120-1.webp', f'short-{slug}', [360, 540], q=78)
    pv = WEB / f'nativzar/video/canal/{slug}-preview-20261120-1.mp4'
    if pv.exists():
        shutil.copy2(pv, VID / f'short-{slug}.mp4')
webp(canal / 'felicidad-huesos-poster-20261120-1.webp', 'video-felicidad-huesos', [640, 960])
webp(WEB / 'marca/img/escena-cap1-20261124-1.webp', 'kauxte-escena', [640, 1200])
for t in ('480',):
    shutil.copy2(PP / f'Cloud_nativzar/servicios/web-publica/redisenos/2026-11-24-kauxte/video/escena-capitulos-20261124-1-{t}.mp4', VID / 'kauxte-escena-480.mp4')
# 03 Foto
webp(RAIZ / 'img/perfil.png', 'perfil', [334])
webp(FLYER / 'output/imagegen/conquistador-nino-rubber-hose-v9-c1-cinco-lados-integrado.png', 'personaje-conquistador', [480, 800])
# 04 Web
for n, src in (('web-kauxte', 'marca/img/hero-kauxte-20261117-1200.webp'),
               ('web-repulgue', 'marca/img/preview-repulgue-20261113-1200.webp'),
               ('web-tres-picos', 'marca/img/preview-tres-picos-20261113-1200.webp'),
               ('web-puntada', 'marca/img/preview-puntada-kantuta-20261113-1200.webp'),
               ('app-nativzar-mj', 'nativzar/img/nativzar-mj-promo-poster-20261120-1.webp')):
    webp(WEB / src, n, [640, 1200])
# Electrónica
for n in ('circuit', 'maquina', 'proy'):
    webp(RAIZ / f'img/{n}.png', f'electronica-{n}', [560])
# Para la iglesia (Conquistadores, MBON): serie, flyers, escudos, indumentaria y una intro animada
SP = FLYER / 'afiches/semana_panoleta'
for n, f in ((1, 'afiche-desafio-1-disciplina-civismo-v12-insignias-correctas-hd.png'),
             (2, 'afiche-desafio-2-fe-y-oracion-v6-centrado-borde-completo.png'),
             (3, 'afiche-desafio-3-comparte-esperanza-v2-receptor-amigo.png'),
             (4, 'afiche-desafio-4-generosidad-en-accion-v6-pie-separado.png'),
             (5, 'afiche-desafio-5-gratitud-en-familia-v6-pie-separado.png'),
             (6, 'afiche-desafio-6-identidad-conquistadora-v2-cuphead-cruz.png'),
             (7, 'afiche-desafio-7-amistad-entre-clubes-v1.png')):
    webp(SP / f, f'panoleta-{n}', [360, 900], q=78)
for n, f in (('flyer-excursion', 'output/afiches/club-central-excursion-v4.png'),
             ('flyer-recepcion', 'output/recepcion-sabado-2026-09-18/afiche-v5.png'),
             ('flyer-campori', 'output/reunion-campori-regional-2026-10-08/flyer-reunion-campori-whatsapp-1080x1350.png'),
             ('flyer-dia-mundial', 'output/dia-mundial-conquistador-2026-09-19/afiche-club-central-v1.png'),
             ('conquisruta', 'output/conquisruta/conquisruta-agosto-2026-cuatro-papiros.png')):
    webp(FLYER / f, n, [420, 900], q=78)
for n, f in (('escudo-cead', 'output/cead/cead-escudo-hexagonal-v9-tipografia-borde-unico.png'),
             ('escudo-gmm', 'output/curso-gmm-gmma/escudo-gmm-gmma-v4-minimalista.png'),
             ('escudo-cead-liderazgo', 'output/logo-cead-conquistadores-2026-10-13/logo-cead-fixed-v2-sin-achocalla.png')):
    webp(FLYER / f, n, [400, 800], q=80)
webp(FLYER / 'output/poleras-coordinadores-mbon-campori/trazo-andino-cordillera-rev07.png', 'polera-trazo-andino', [640, 1200], q=80)
webp(FLYER / 'output/conjunto-trazo-andino/conjunto-trazo-andino-v01.png', 'conjunto-trazo-andino', [480, 900], q=80)
# Intro del club (DaVinci Resolve, 4K, 5,7 s): versión liviana de 640 px y su póster
intro = RESPALDO / 'Videos/DaVinci_resolve/INTROCONQUIS.mp4'
if intro.exists():
    import subprocess
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(intro), '-an', '-vf', 'scale=640:-2', '-c:v', 'libx264',
                    '-crf', '26', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(VID / 'intro-conquis-640.mp4')], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '5.2', '-i', str(intro), '-frames:v', '1', '-vf', 'scale=1280:-2',
                    str(OUT / 'intro-conquis-final.png')], check=True)
    webp(OUT / 'intro-conquis-final.png', 'intro-conquis', [640, 1200]); (OUT / 'intro-conquis-final.png').unlink()
print('listo')

# Capturas de pantalla de los sitios (1440×900). La de Kauxte se tomó del sitio local el 24/11/2026;
# las de Nativzar y el reproductor por capítulos vienen de Cloud_nativzar/docs/verificaciones/2026-11-24-web/.
VER = PP / 'Cloud_nativzar/docs/verificaciones/2026-11-24-web'
for src, n in ((RAIZ / 'herramientas/captura-kauxte-home-1440.png', 'pantalla-kauxte'),
               (VER / 'nativzar-1440-heroe.png', 'pantalla-nativzar'),
               (VER / 'nativzar-1440-shorts.png', 'pantalla-nativzar-shorts'),
               (VER / 'kauxte-es-1440-capitulos.png', 'pantalla-kauxte-capitulos')):
    if src.exists():
        webp(src, n, [640, 1200])
