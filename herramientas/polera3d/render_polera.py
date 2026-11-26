"""Vista realista (frente y espalda) de la polera del Club Central, con la lámina plana como estampado.
Uso: blender -b --factory-startup --python render_polera.py -- [muestras]
Antes: python3 preparar_texturas.py. Salida: salida/polera-club-central.png"""
import bpy, bmesh, math, sys, random
from pathlib import Path
from mathutils import Vector, kdtree

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
from silueta import VISTAS, contorno, piezas

SAL = AQUI / 'salida'
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
MUESTRAS = int(argv[0]) if argv else 160
ESC = 1 / 300          # unidades por píxel de 675 × 900
PASO = 1.8             # píxeles por celda de la malla

bpy.ops.wm.read_factory_settings(use_empty=True)
esc = bpy.context.scene


def dentro(P, x, y):
    c = False
    j = len(P) - 1
    for i in range(len(P)):
        xi, yi = P[i]; xj, yj = P[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            c = not c
        j = i
    return c


def abierto(v, a, b):
    ru = v['ruedo'][1]
    if a[1] > ru - 2 and b[1] > ru - 2:
        return True
    for sg in (-1, 1):
        pa = (v['cx'] + sg * v['puno_a'][0], v['puno_a'][1]); pb = (v['cx'] + sg * v['puno_b'][0], v['puno_b'][1])
        if {a, b} == {pa, pb}:
            return True
    return False


def borde_denso(P, v=None, paso=0.7):
    pts = []
    for i in range(len(P)):
        a, b = P[i], P[(i + 1) % len(P)]
        if v is not None and abierto(v, a, b):
            continue
        n = max(1, int(math.dist(a, b) / paso))
        for k in range(n):
            t = k / n
            pts.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    kd = kdtree.KDTree(len(pts))
    for i, p in enumerate(pts):
        kd.insert((p[0], p[1], 0), i)
    kd.balance()
    return kd


def material(vista):
    m = bpy.data.materials.new(f'tela-{vista}')
    m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    bsdf = N['Principled BSDF']
    tex = N.new('ShaderNodeTexImage'); tex.image = bpy.data.images.load(str(SAL / f'{vista}-color.png'))
    rel = N.new('ShaderNodeTexImage'); rel.image = bpy.data.images.load(str(SAL / f'{vista}-relieve.png')); rel.image.colorspace_settings.name = 'Non-Color'
    # tejido: ruido muy fino
    coord = N.new('ShaderNodeTexCoord')
    ruido = N.new('ShaderNodeTexNoise'); ruido.inputs['Scale'].default_value = 900; ruido.inputs['Detail'].default_value = 2
    L.new(coord.outputs['UV'], ruido.inputs['Vector'])
    b1 = N.new('ShaderNodeBump'); b1.inputs['Strength'].default_value = 0.35; b1.inputs['Distance'].default_value = 0.004
    L.new(rel.outputs['Color'], b1.inputs['Height'])
    b2 = N.new('ShaderNodeBump'); b2.inputs['Strength'].default_value = 0.08; b2.inputs['Distance'].default_value = 0.001
    L.new(ruido.outputs['Fac'], b2.inputs['Height']); L.new(b1.outputs['Normal'], b2.inputs['Normal'])
    L.new(b2.outputs['Normal'], bsdf.inputs['Normal'])
    # el blanco de la lámina queda como tela blanca, no como papel
    gam = N.new('ShaderNodeHueSaturation'); gam.inputs['Value'].default_value = 0.93; gam.inputs['Saturation'].default_value = 0.96
    L.new(tex.outputs['Color'], gam.inputs['Color']); L.new(gam.outputs['Color'], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.82
    bsdf.inputs['Sheen Weight'].default_value = 0.35
    bsdf.inputs['Sheen Roughness'].default_value = 0.5
    return m


def pliegues(x, y, v, d):
    """Relieve suave (en unidades) de arrugas: diagonales desde las axilas y ondas cerca del ruedo."""
    z = 0.0
    cx = v['cx']
    for sg in (-1, 1):
        ax = (cx + sg * v['axila'][0], v['axila'][1])
        for ang, largo, prof in ((-28, 150, 0.010), (-12, 120, 0.008), (8, 90, 0.006)):
            a = math.radians(ang)
            ux, uy = -sg * math.cos(a), math.sin(a)       # hacia el centro del pecho
            px, py = x - ax[0], y - ax[1]
            t = px * ux + py * uy
            if 0 < t < largo:
                dist = abs(px * uy - py * ux)
                z -= prof * 1.6 * math.exp(-(dist / 8) ** 2) * math.sin(math.pi * t / largo) ** 0.8
    ru = v['ruedo'][1]
    w = max(0.0, min(1.0, (y - (ru - 200)) / 200))
    z += 0.008 * w * math.sin((x - cx) / 38 + 0.7) + 0.004 * w * math.sin((x - cx) / 17)
    # mangas: una onda paralela al puño
    for sg in (-1, 1):
        sx = cx + sg * (v['hombro'][0] + v['puno_a'][0]) / 2
        if (x - sx) * sg > -40:
            z += 0.004 * math.sin((x * sg) / 11 + y / 30)
    return z


def kd_de(P, tipos, cuales, paso=0.7):
    pts = []
    for i in range(len(P)):
        if tipos[i] not in cuales:
            continue
        a, b = P[i], P[(i + 1) % len(P)]
        n = max(1, int(math.dist(a, b) / paso))
        for k in range(n + 1):
            t = k / n
            pts.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    kd = kdtree.KDTree(len(pts))
    for i, q in enumerate(pts):
        kd.insert((q[0], q[1], 0), i)
    kd.balance()
    return kd


def pieza(nombre, v, P, tipos, altura):
    """Malla de una pieza plana inflada; altura(x, y, d_borde, kds) → z."""
    kd = kd_de(P, tipos, 'cas')
    kds = {t: kd_de(P, tipos, t) for t in set(tipos)}
    xs = [q[0] for q in P]; ys = [q[1] for q in P]
    x0, x1, y0, y1 = min(xs) - PASO, max(xs) + PASO, min(ys) - PASO, max(ys) + PASO
    nx, ny = int((x1 - x0) / PASO) + 2, int((y1 - y0) / PASO) + 2
    dentro_ = [[dentro(P, x0 + i * PASO, y0 + j * PASO) for i in range(nx)] for j in range(ny)]
    bm = bmesh.new(); uv = bm.loops.layers.uv.new()
    verts = {}
    def vert(i, j):
        if (i, j) in verts:
            return verts[(i, j)]
        x, y = x0 + i * PASO, y0 + j * PASO
        co, _, dd = kd.find((x, y, 0))
        if not dentro_[j][i] or dd < PASO * 0.5:
            x, y, dd = co[0], co[1], 0.0
        d = {t: k.find((x, y, 0))[2] for t, k in kds.items()}
        z = altura(x, y, dd, d)
        verts[(i, j)] = (bm.verts.new(((x - v['cx']) * ESC, -(y - v['cy']) * ESC, z)), x, y)
        return verts[(i, j)]
    for j in range(ny - 1):
        for i in range(nx - 1):
            esquinas = [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]
            if sum(dentro_[b][a] for a, b in esquinas) < 3:
                continue
            unicos = []
            for w in (vert(a, b) for a, b in esquinas):
                if all((w[0].co - u[0].co).length > 1e-6 for u in unicos):
                    unicos.append(w)
            if len(unicos) < 3:
                continue
            try:
                f = bm.faces.new([w[0] for w in unicos[::-1]])
            except ValueError:
                continue
            for lp, w in zip(f.loops, unicos[::-1]):
                lp[uv].uv = (w[1] / 675, 1 - w[2] / 900)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    me = bpy.data.meshes.new(nombre); bm.to_mesh(me); bm.free()
    for q in me.polygons:
        q.use_smooth = True
    ob = bpy.data.objects.new(nombre, me); esc.collection.objects.link(ob)
    so = ob.modifiers.new('grosor', 'SOLIDIFY'); so.thickness = 0.012; so.offset = -1
    return ob


def redondo(d, D):
    t = min(d / D, 1)
    return math.sqrt(max(0.0, 1 - (1 - t) ** 2))


def polera(vista, ox, rot):
    v = VISTAS[vista]
    (T, tt), mangas = piezas(v)
    mat = material(vista)
    def h_torso(x, y, dd, d):
        dc = min(d.get('c', 1e9), 2.2 * d.get('s', 1e9))
        z = 0.095 * redondo(dc, 60) + pliegues(x, y, v, dc) * min(1, dc / 12)
        z -= 0.012 * max(0.0, 1 - d.get('a', 1e9) / 10) * (1 if dc > 12 else 0)
        return z
    ob = pieza(vista, v, T, tt, h_torso)
    ob.data.materials.append(mat)
    for k, (M, mt) in enumerate(mangas):
        sg = -1 if k == 0 else 1
        def h_manga(x, y, dd, d, sg=sg):
            dc = d.get('c', 1e9)
            ds = d.get('s', 1e9)
            z = 0.075 * redondo(dc, 48) + 0.022            # tubo, apoyado sobre el torso
            z += 0.012 * min(1, ds / 25) - 0.012              # se hunde un poco en la sisa (costura)
            z -= 0.010 * max(0.0, 1 - d.get('a', 1e9) / 10)   # dobladillo del puño
            z += 0.004 * math.sin((x * sg) / 9 + y / 25) * min(1, dc / 15)
            return z
        om = pieza(f'{vista}-manga{k}', v, M, mt, h_manga)
        om.data.materials.append(mat); om.parent = ob
    ob.location = (ox, 0, 0); ob.rotation_euler = (0, math.radians(rot), 0)
    # cuello acanalado sobre el escote
    n = 40
    pts = []
    for k in range(n + 1):
        t = k / n
        x = v['cx'] - v['cw'] + 2 * v['cw'] * t
        y = v['cy'] + v['escote'] * math.sin(math.pi * t) ** 1.2
        pts.append(((x - v['cx']) * ESC, -(y - v['cy']) * ESC, 0.012))
    cu = bpy.data.curves.new(f'cuello-{vista}', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.024; cu.bevel_resolution = 4
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for p, c in zip(sp.points, pts):
        p.co = (*c, 1)
    oc = bpy.data.objects.new(f'cuello-{vista}', cu); esc.collection.objects.link(oc)
    mc = bpy.data.materials.new('rib'); mc.use_nodes = True
    b = mc.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (0.035, 0.09, 0.32, 1); b.inputs['Roughness'].default_value = 0.9
    b.inputs['Sheen Weight'].default_value = 0.4
    cu.materials.append(mc)
    oc.parent = ob
    # interior del cuello (la espalda por dentro) que se ve por el escote del frente
    if v['escote'] > 30:
        bm = bmesh.new(); uvl = bm.loops.layers.uv.new()
        arr = []; aba = []
        for k in range(n + 1):
            t = k / n
            x = v['cx'] - v['cw'] + 2 * v['cw'] * t
            arr.append((x, v['cy'] + 6 * math.sin(math.pi * t)))
            aba.append((x, v['cy'] + v['escote'] * math.sin(math.pi * t) ** 1.2 + 4))
        vs_a = [bm.verts.new(((x - v['cx']) * ESC, -(y - v['cy']) * ESC, -0.03 + 0.03 * math.sin(math.pi * k / n) * 0)) for k, (x, y) in enumerate(arr)]
        vs_b = [bm.verts.new(((x - v['cx']) * ESC, -(y - v['cy']) * ESC, -0.04)) for x, y in aba]
        for k in range(n):
            f = bm.faces.new([vs_a[k], vs_a[k + 1], vs_b[k + 1], vs_b[k]])
            for lp, (x, y) in zip(f.loops, [arr[k], arr[k + 1], aba[k + 1], aba[k]]):
                lp[uvl].uv = (x / 675, 1 - y / 900)
        mi = bpy.data.meshes.new('interior'); bm.to_mesh(mi); bm.free()
        oi = bpy.data.objects.new('interior', mi); esc.collection.objects.link(oi)
        mt = bpy.data.materials.new('interior'); mt.use_nodes = True
        bi = mt.node_tree.nodes['Principled BSDF']; bi.inputs['Base Color'].default_value = (0.55, 0.55, 0.57, 1); bi.inputs['Roughness'].default_value = 0.9
        oi.data.materials.append(mt); oi.parent = ob
        cu2 = bpy.data.curves.new('cuello-atras', 'CURVE'); cu2.dimensions = '3D'; cu2.bevel_depth = 0.02; cu2.bevel_resolution = 4
        sp2 = cu2.splines.new('POLY'); sp2.points.add(len(arr) - 1)
        for p_, (x, y) in zip(sp2.points, arr):
            p_.co = ((x - v['cx']) * ESC, -(y - v['cy']) * ESC, -0.02, 1)
        cu2.materials.append(mc)
        o2 = bpy.data.objects.new('cuello-atras', cu2); esc.collection.objects.link(o2); o2.parent = ob
    return ob


polera('frente', -1.18, 3)
polera('espalda', 1.18, -3)

# fondo continuo gris cálido y luz de estudio
bpy.ops.mesh.primitive_plane_add(size=30, location=(0, 0, -0.45))
fondo = bpy.context.object
mf = bpy.data.materials.new('fondo'); mf.use_nodes = True
bf = mf.node_tree.nodes['Principled BSDF']; bf.inputs['Base Color'].default_value = (0.74, 0.72, 0.69, 1); bf.inputs['Roughness'].default_value = 1
fondo.data.materials.append(mf)


def luz(nombre, loc, energia, tam, rot):
    l = bpy.data.lights.new(nombre, 'AREA'); l.energy = energia; l.size = tam
    o = bpy.data.objects.new(nombre, l); o.location = loc; o.rotation_euler = rot
    esc.collection.objects.link(o)


luz('clave', (-3.5, 3.0, 6.5), 1100, 6, (math.radians(-25), math.radians(-28), 0))
luz('relleno', (4.5, 1.0, 6.0), 420, 7, (math.radians(-8), math.radians(35), 0))
luz('arriba', (0, 6, 3), 300, 5, (math.radians(-60), 0, 0))
mundo = bpy.data.worlds.new('m'); esc.world = mundo; mundo.use_nodes = True
mundo.node_tree.nodes['Background'].inputs['Color'].default_value = (0.8, 0.79, 0.77, 1)
mundo.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.25

cam = bpy.data.cameras.new('cam'); cam.lens = 85
oc = bpy.data.objects.new('cam', cam); esc.collection.objects.link(oc); esc.camera = oc
oc.location = (0, -1.15, 13.2); oc.rotation_euler = (0, 0, 0)

esc.render.engine = 'CYCLES'
esc.cycles.samples = MUESTRAS
esc.cycles.use_denoising = True
esc.render.resolution_x, esc.render.resolution_y = 1650, 1100
esc.view_settings.view_transform = 'Standard'
esc.view_settings.exposure = -1.0
esc.view_settings.look = 'AgX - Medium High Contrast' if 'AgX - Medium High Contrast' in [i.name for i in bpy.types.ColorManagedViewSettings.bl_rna.properties['look'].enum_items] else 'None'
esc.render.filepath = str(SAL / 'polera-club-central.png')
bpy.ops.render.render(write_still=True)
print('render listo', esc.render.filepath)
