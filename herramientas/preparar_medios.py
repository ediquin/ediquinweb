#!/usr/bin/env python3
"""Prepara las imágenes y vistas previas del portafolio (img/2026/, video/2026/).

Uso: python3 herramientas/preparar_medios.py [carpeta del clon de flyer_iasd]
Las fuentes son trabajos reales del titular: afiches (repo flyer_iasd), miniaturas y clips del canal
Nativzar, identidad y capturas de Kauxte (portafolio_web) y fotos de los proyectos de electrónica.
"""
import shutil, sys
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
PP = RAIZ.parent                                  # Personal_projects
FLYER = Path(sys.argv[1]) if len(sys.argv) > 1 else PP / 'flyer_iasd'
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
webp(FLYER / 'output/afiche-informatica-programable-tecnologico-c1.png', 'afiche-informatica', [480, 900])
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
