#!/usr/bin/env python3
"""Texturas para la polera 3D del Club Central: color (lámina limpia) y relieve (costuras y pespuntes).
Uso: python3 preparar_texturas.py → salida/{frente,espalda}-{color,relieve}.png"""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
from silueta import VISTAS, contorno

AQUI = Path(__file__).resolve().parent
SAL = AQUI / 'salida'
SAL.mkdir(exist_ok=True)
SRC = Path('/srv/respaldo/archivo/05_Iglesia_IASD/1_Conquistadores/Club Central/Polera')
LAMINAS = {'frente': SRC / 'Polera parte delantera.jpg.png', 'espalda': SRC / 'Polera Parte tracera.jpg'}
# debajo de esta fila (en 675 × 900) la plantilla trae la sombra negra del ruedo y una raya gris: se borran
LIMPIAR_DESDE = {'frente': 800, 'espalda': 755}
W, H = 2700, 3600
K = W / 675


def color(vista):
    im = Image.open(LAMINAS[vista]).convert('RGB').resize((W, H), Image.LANCZOS)
    px = im.load()
    y0 = int(LIMPIAR_DESDE[vista] * K)
    for y in range(y0, H):
        for x in range(W):
            r, g, b = px[x, y]
            if max(r, g, b) - min(r, g, b) < 40 and (r + g + b) < 690:
                px[x, y] = (255, 255, 255)
    im.save(SAL / f'{vista}-color.png')


def relieve(vista):
    """Gris medio = plano; más oscuro = hundido (costuras, pespuntes)."""
    v = VISTAS[vista]
    im = Image.new('L', (W, H), 128)
    d = ImageDraw.Draw(im)
    cx = v['cx']
    s = lambda p: (p[0] * K, p[1] * K)
    def linea(a, b, ancho, tono):
        d.line([s(a), s(b)], fill=tono, width=int(ancho * K))
    def pespunte(a, b, tono=96, paso=3.2, largo=1.8):
        L = math.dist(a, b); n = int(L / paso)
        for i in range(n):
            t0, t1 = i * paso / L, (i * paso + largo) / L
            p = (a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0)
            q = (a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1)
            d.line([s(p), s(q)], fill=tono, width=max(1, int(0.7 * K)))
    for sg in (-1, 1):
        cuello = (cx + sg * v['cw'], v['cy'])
        hombro = (cx + sg * v['hombro'][0], v['hombro'][1])
        axila = (cx + sg * v['axila'][0], v['axila'][1])
        pa = (cx + sg * v['puno_a'][0], v['puno_a'][1]); pb = (cx + sg * v['puno_b'][0], v['puno_b'][1])
        linea(cuello, hombro, 1.2, 100)                       # costura del hombro
        # costura de la manga (de hombro a axila, un poco curva)
        m = ((hombro[0] + axila[0]) / 2 - sg * 8, (hombro[1] + axila[1]) / 2)
        d.line([s(hombro), s(m), s(axila)], fill=100, width=int(1.2 * K), joint='curve')
        # pespunte del puño, paralelo al borde
        ux, uy = pb[0] - pa[0], pb[1] - pa[1]; L = math.hypot(ux, uy); nx, ny = -uy / L * sg, ux / L * sg
        off = 9
        pespunte((pa[0] - sg * off * abs(nx), pa[1] + off * ny * 0), (pb[0] - sg * off * abs(nx), pb[1]))
    # pespunte del ruedo
    ru = v['ruedo']
    for i in range(60):
        t0, t1 = i / 60, (i + 0.55) / 60
        y = lambda t: ru[1] + 6 * math.sin(math.pi * t) - 10
        pespunte((cx - ru[0] + 2 * ru[0] * t0, y(t0)), (cx - ru[0] + 2 * ru[0] * t1, y(t1)))
    im = im.filter(ImageFilter.GaussianBlur(1.2 * K / 4))
    im.save(SAL / f'{vista}-relieve.png')


for vista in VISTAS:
    color(vista)
    relieve(vista)
print('texturas listas')
