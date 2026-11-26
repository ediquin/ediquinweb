"""Silueta de la polera del Club Central sobre las láminas planas (coordenadas de 675 × 900).
Las láminas no traen el contorno de la prenda: se dedujo de dónde corta el estampado."""
import math

VISTAS = {
    # cx, cuello arriba, medio ancho del cuello, caída del escote, hombro (dx, y), puño arriba (dx, y), puño abajo (dx, y), axila (dx, y), ruedo (dx, y)
    'frente': dict(cx=340, cy=106, cw=90, escote=58, hombro=(232, 168), puno_a=(322, 282), puno_b=(300, 408), axila=(190, 398), ruedo=(205, 818)),
    'espalda': dict(cx=330, cy=80, cw=96, escote=14, hombro=(238, 135), puno_a=(318, 228), puno_b=(302, 368), axila=(188, 372), ruedo=(210, 780)),
}


def contorno(v, n=24):
    """Polígono horario empezando en el cuello (lado izquierdo al mirar)."""
    cx, cy, cw = v['cx'], v['cy'], v['cw']
    P = []
    # escote: de izquierda a derecha, curva hacia abajo
    for i in range(n + 1):
        t = i / n
        x = cx - cw + 2 * cw * t
        y = cy + v['escote'] * math.sin(math.pi * t) ** 1.2
        P.append((x, y))
    def lado(s):
        h, pa, pb, ax, ru = v['hombro'], v['puno_a'], v['puno_b'], v['axila'], v['ruedo']
        pts = [(cx + s * cw, cy), (cx + s * h[0], h[1]), (cx + s * pa[0], pa[1]), (cx + s * pb[0], pb[1]), (cx + s * ax[0], ax[1])]
        # costado con una leve cintura
        for i in range(1, 9):
            t = i / 8
            x = ax[0] + (ru[0] - ax[0]) * t - 6 * math.sin(math.pi * t)
            pts.append((cx + s * x, ax[1] + (ru[1] - ax[1]) * t))
        return pts
    der = lado(1)[1:]
    P += der
    # ruedo con una curva suave
    ru = v['ruedo']
    for i in range(1, n):
        t = i / n
        P.append((cx + ru[0] - 2 * ru[0] * t, ru[1] + 6 * math.sin(math.pi * t)))
    izq = lado(-1)[1:]
    P += izq[::-1]
    return P


def costura(v, sg, n=10):
    """Sisa: del hombro a la axila, combada hacia afuera."""
    cx = v['cx']
    h = (cx + sg * v['hombro'][0], v['hombro'][1]); a = (cx + sg * v['axila'][0], v['axila'][1])
    return [(h[0] + (a[0] - h[0]) * t + sg * 10 * math.sin(math.pi * t), h[1] + (a[1] - h[1]) * t) for t in (i / n for i in range(n + 1))]


def piezas(v, n=24):
    """Torso y mangas por separado. Cada pieza: (polígono, lista de tramos con su tipo: 'c' cerrado, 'a' abierto, 's' sisa)."""
    cx, cy, cw = v['cx'], v['cy'], v['cw']
    ru = v['ruedo']
    def lado(sg):
        ax = v['axila']
        return [(cx + sg * (ax[0] + (ru[0] - ax[0]) * t - 6 * math.sin(math.pi * t)), ax[1] + (ru[1] - ax[1]) * t) for t in (i / 8 for i in range(9))]
    T, tipos = [], []   # tipos[i] = tipo del tramo que LLEGA al punto i
    def agregar(pts, tipo):
        for q in pts:
            if T and math.dist(T[-1], q) < 1e-6:
                continue
            T.append(q); tipos.append(tipo)
    agregar([(cx - cw + 2 * cw * t, cy + v['escote'] * math.sin(math.pi * t) ** 1.2) for t in (i / n for i in range(n + 1))], 'c')
    agregar([(cx + v['hombro'][0], v['hombro'][1])], 'c')
    agregar(costura(v, 1)[1:], 's')
    agregar(lado(1)[1:], 'c')
    agregar([(cx + ru[0] - 2 * ru[0] * t, ru[1] + 6 * math.sin(math.pi * t)) for t in (i / n for i in range(1, n + 1))], 'a')
    agregar(lado(-1)[::-1][1:], 'c')
    agregar(costura(v, -1)[::-1][1:], 's')
    tipos[0] = 'c'      # hombro izquierdo → cuello
    # tramo i→i+1 tiene el tipo con que llega a i+1
    torso = (T, [tipos[(i + 1) % len(T)] for i in range(len(T))])
    mangas = []
    for sg in (-1, 1):
        s = costura(v, sg)
        # la manga se mete 6 px bajo... sobre el torso para tapar la costura
        s_in = [(p[0] - sg * 6, p[1]) for p in s]
        pa = (cx + sg * v['puno_a'][0], v['puno_a'][1]); pb = (cx + sg * v['puno_b'][0], v['puno_b'][1])
        M = [s_in[0], pa, pb] + s_in[::-1][:-1]
        t = ['c', 'a', 'c'] + ['s'] * (len(M) - 3)
        if sg < 0:
            M = M[::-1]; t = (t[::-1][1:] + t[::-1][:1])
        mangas.append((M, t))
    return torso, mangas
