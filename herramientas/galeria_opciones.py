#!/usr/bin/env python3
"""Galería local para que el titular elija qué piezas entran al portafolio.

Uso: python3 herramientas/galeria_opciones.py   → opciones/index.html (no se sube a GitHub: ver .gitignore)
Ábrela con el servidor local: http://localhost:8093/opciones/
Cada pieza tiene un número y una casilla; el botón «Copiar mi selección» copia la lista para pegarla en el chat.
Solo lee las carpetas de origen; nada se mueve ni se borra.
"""
import html, json, subprocess, sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from PIL import Image, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
PP = RAIZ.parent
AI = PP.parent / 'Conquistadores/AI_Design_Conquis'
RES = Path('/srv/respaldo/archivo/05_Iglesia_IASD')
NV = PP / 'Nativzar_videos/video/pruebas'
OUT = RAIZ / 'opciones'
EXT = {'.png', '.jpg', '.jpeg', '.webp'}
FUERA = ('prompt', 'review', 'repair', '/qa/', 'referencia', '-roi', 'comp_frames', '/tmp/', 'captura')


def imagenes(carpeta, recursivo=True, filtro=None):
    if not carpeta.exists():
        return []
    it = carpeta.rglob('*') if recursivo else carpeta.glob('*')
    fs = [f for f in it if f.is_file() and f.suffix.lower() in EXT and not any(x in str(f).lower() for x in FUERA)]
    if filtro:
        fs = [f for f in fs if filtro(f)]
    return sorted(fs, key=lambda f: (str(f.parent), f.name))


# (sección, título, nota, archivos, ¿fotos?)
SECCIONES = [
    ('ropa', 'Uniformes y prendas', 'Poleras, conjuntos, la parca y bocetos. La polera Trazo andino (catálogo) ya está en la página.',
     imagenes(AI / 'output/poleras-coordinadores-mbon-campori') + imagenes(AI / 'output/poleras-coordinadores-mbon')
     + imagenes(AI / 'output/poleras-deportivas-club-central-2026-11-09') + imagenes(AI / 'output/conjunto-trazo-andino')
     + imagenes(AI / 'output/disenos') + imagenes(AI / 'output/patrones_c5'), False),
    ('afiches', 'Afiches y flyers', 'Especialidades, actividades, cumpleaños, menús y banners.',
     imagenes(AI / 'afiches', recursivo=False) + imagenes(AI / 'afiches/red_familiar') + imagenes(AI / 'output', recursivo=False)
     + imagenes(AI / 'output/afiches') + imagenes(AI / 'output/recepcion-sabado-2026-09-18') + imagenes(AI / 'output/reunion-campori-regional-2026-10-08')
     + imagenes(AI / 'output/dia-mundial-conquistador-2026-09-19') + imagenes(AI / 'output/feria-especialidades-conquistadores-2026-10-20')
     + [f for d in sorted(AI.glob('output/cumpleanos-*')) for f in imagenes(d)]
     + imagenes(AI / 'output/menu-gp-central-2026-10-28') + imagenes(AI / 'output/lista-acampante-gp-2026-10-28')
     + imagenes(AI / 'output/banners') + imagenes(AI / 'output/imagegen', filtro=lambda f: 'conquistador-nino' not in f.name)
     + imagenes(AI / 'output/conquisruta'), False),
    ('escudos', 'Escudos, parches y logos', 'Incluye la carpeta de logos de ministerios «a revisar y ordenar» (algunos no son tuyos).',
     imagenes(AI / 'output/cead') + imagenes(AI / 'output/curso-gmm-gmma') + imagenes(AI / 'output/logo-cead-conquistadores-2026-10-13')
     + imagenes(AI / 'assets/logos_ministerios_a_revisar_y_ordenar') + imagenes(AI / 'assets/logos'), False),
    ('cartillas', 'Cartillas y certificados', 'Todas las versiones guardadas.',
     [f for d in sorted(AI.glob('output/cartilla-*')) for f in imagenes(d)] + imagenes(AI / 'output/certificados'), False),
    ('panoleta', 'Semana de la Pañoleta: versiones', 'Las 7 finales ya están en la página; aquí están las demás versiones.',
     imagenes(AI / 'afiches/semana_panoleta'), False),
    ('respaldo', 'Diseños anteriores (respaldo)', 'De /srv/respaldo: diseños 2022–2025, tarjetas GM y logos.',
     imagenes(RES / 'Diseño_y_flyers') + imagenes(RES / '1_Conquistadores/diseño') + imagenes(RES / '1_Conquistadores/tarjeta GM 2025')
     + imagenes(RES / '1_Conquistadores/avance de tarjetas') + imagenes(RES / '1_Conquistadores/Carpeta GM') + imagenes(RES / '1_Conquistadores/Club Central')
     + imagenes(RES / '3_Jovenes_Adventistas_JA') + imagenes(RES / '1_Conquistadores/Especialidades'), False),
    ('fotos', 'Fotos de actividades', 'Fotos reales con niños y jóvenes: para publicarlas hace falta el permiso de sus padres o del club.',
     imagenes(RES / '1_Conquistadores/Camporees') + imagenes(RES / '1_Conquistadores/fotos conquistadores')
     + imagenes(RES / '1_Conquistadores/conquistadores 2022') + imagenes(RES / '1_Conquistadores/fotos para informes')
     + imagenes(RES / '1_Conquistadores/fotos_conquis_2016') + imagenes(RES / '1_Conquistadores/2023'), True),
]

VIDEOS = [
    ('Bajo el enebro y el ángel (11/11, el más reciente)', NV / 'enebro_rig/enebro_rig_v01_liviano.mp4'),
    ('Monte Horeb v07 (10/11)', NV / 'horeb_rig/horeb_rig_v07_liviano.mp4'),
    ('Elías en Blender, fábula v12 (06/11)', NV / 'fabula_blender/fabula_rig_elias_v12_liviano.mp4'),
    ('Galería de estilos de personaje (05/11)', NV / 'galeria_personajes/galeria_personajes_movil.mp4'),
]


def miniatura(trabajo):
    src, destino, grande = trabajo
    try:
        im = Image.open(src)
        if im.format == 'JPEG':
            im.draft('RGB', (1400, 1400))
        im = ImageOps.exif_transpose(im)
        im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        w, h = im.size
        for ancho, sufijo in ((420, 'm'),) + (((1400, 'g'),) if grande else ()):
            a = min(ancho, w)
            im.resize((a, round(h * a / w)), Image.LANCZOS).save(destino.with_suffix(f'.{sufijo}.webp'), 'WEBP', quality=72, method=4)
        return (w, h)
    except Exception as e:  # imagen dañada: se omite
        print('omitida', src, e, file=sys.stderr)
        return None


def main():
    (OUT / 'mini').mkdir(parents=True, exist_ok=True)
    (OUT / 'video').mkdir(parents=True, exist_ok=True)
    trabajos, items, n = [], [], 0
    vistos = set()
    for clave, titulo, nota, fs, fotos in SECCIONES:
        for f in fs:
            if f.resolve() in vistos:
                continue
            vistos.add(f.resolve())
            n += 1
            ide = f'{n:03d}'
            trabajos.append((f, OUT / 'mini' / ide, not fotos))
            items.append({'id': ide, 'sec': clave, 'nombre': f.name, 'ruta': str(f), 'grande': not fotos})
    with ProcessPoolExecutor() as ex:
        medidas = list(ex.map(miniatura, trabajos, chunksize=8))
    items = [dict(it, w=m[0], h=m[1]) for it, m in zip(items, medidas) if m]
    vids = []
    for i, (titulo, src) in enumerate(VIDEOS, 1):
        if not src.exists():
            continue
        dst = OUT / 'video' / f'v{i}.mp4'
        if not dst.exists():
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src), '-vf', 'scale=640:-2', '-c:v', 'libx264', '-crf', '28',
                            '-preset', 'veryfast', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', str(dst)], check=True)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '3', '-i', str(src), '-frames:v', '1', '-vf', 'scale=640:-2',
                            str(dst.with_suffix('.jpg'))], check=True)
        vids.append({'id': f'V{i}', 'titulo': titulo, 'ruta': str(src)})
    pagina(items, vids)
    print(f'{len(items)} imágenes y {len(vids)} videos → {OUT / "index.html"}')


def pagina(items, vids):
    e = html.escape
    sec_html = []
    sec_html.append('<section id="videos"><h2>Animaciones de Elías y personajes <small>%d</small></h2><p class="nota">Las versiones más recientes. La escena «Un camino trazado por Dios mismo» se quitó de la página.</p><div class="grilla videos">' % len(vids)
                    + ''.join(f'<label class="pieza"><input type="checkbox" value="{v["id"]}" data-nombre="{e(v["titulo"])}"><video controls preload="none" poster="video/v{v["id"][1:]}.jpg" src="video/v{v["id"][1:]}.mp4"></video><span><b>{v["id"]}</b> {e(v["titulo"])}</span></label>' for v in vids)
                    + '</div></section>')
    for clave, titulo, nota, _, fotos in SECCIONES:
        its = [i for i in items if i['sec'] == clave]
        if not its:
            continue
        tarjetas = ''.join(
            f'<label class="pieza"><input type="checkbox" value="{i["id"]}" data-nombre="{e(i["nombre"])}">'
            f'<img loading="lazy" src="mini/{i["id"]}.m.webp" alt="" width="{min(420, i["w"])}" height="{round(i["h"] * min(420, i["w"]) / i["w"])}"'
            + (f' data-grande="mini/{i["id"]}.g.webp"' if i['grande'] else '') +
            f'><span><b>{i["id"]}</b> {e(i["nombre"])}</span></label>' for i in its)
        sec_html.append(f'<section id="{clave}"><details{" open" if clave not in ("fotos", "panoleta") else ""}><summary><h2>{e(titulo)} <small>{len(its)}</small></h2></summary>'
                        f'<p class="nota">{e(nota)}</p><div class="grilla">{tarjetas}</div></details></section>')
    indice = ''.join(f'<a href="#{c}">{e(t)}</a>' for c, t, *_ in SECCIONES)
    rutas = json.dumps({i['id']: i['ruta'] for i in items} | {v['id']: v['ruta'] for v in vids}, ensure_ascii=False)
    (OUT / 'index.html').write_text(f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Opciones para el portafolio</title><meta name="robots" content="noindex">
<style>
:root{{--papel:#f6f2ea;--tinta:#16141a;--gris:#6b6670;--acento:#c2410c}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--papel);color:var(--tinta);font:15px/1.45 system-ui,sans-serif}}
header{{position:sticky;top:0;z-index:5;background:rgba(246,242,234,.95);backdrop-filter:blur(6px);border-bottom:1px solid #ddd5c8;padding:12px 16px;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center}}
header h1{{font-size:18px;margin:0}}header nav{{display:flex;flex-wrap:wrap;gap:6px}}header nav a{{color:var(--tinta);text-decoration:none;padding:4px 10px;border:1px solid #cfc6b8;border-radius:99px;font-size:13px}}
.barra{{margin-left:auto;display:flex;gap:8px;align-items:center}}button{{font:inherit;padding:7px 14px;border-radius:99px;border:1.5px solid var(--tinta);background:var(--tinta);color:#fff;cursor:pointer}}button.claro{{background:transparent;color:var(--tinta)}}
main{{padding:8px 16px 80px;max-width:1500px;margin:0 auto}}section{{margin-top:22px}}summary{{cursor:pointer;list-style:none}}summary h2{{display:inline;font-size:22px}}summary::before{{content:"▸ ";}}details[open] summary::before{{content:"▾ ";}}
h2 small{{color:var(--gris);font-weight:500;font-size:15px}}.nota{{color:var(--gris);margin:4px 0 12px}}
.grilla{{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}}.grilla.videos{{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}}
.pieza{{position:relative;display:flex;flex-direction:column;background:#fff;border:2px solid transparent;border-radius:10px;overflow:hidden;cursor:pointer}}
.pieza:has(input:checked){{border-color:var(--acento);box-shadow:0 0 0 3px rgba(194,65,12,.25)}}.pieza img,.pieza video{{width:100%;height:auto;background:#e9e3d8;display:block}}
.pieza input{{position:absolute;top:8px;left:8px;width:22px;height:22px;accent-color:var(--acento);z-index:2}}
.pieza span{{padding:6px 8px;font-size:12px;word-break:break-word;color:var(--gris)}}.pieza b{{color:var(--tinta)}}
dialog{{border:0;padding:0;background:transparent;max-width:96vw}}dialog img{{max-width:94vw;max-height:90vh;display:block;border-radius:8px}}dialog::backdrop{{background:rgba(0,0,0,.85)}}
</style></head><body>
<header><h1>Opciones para el portafolio</h1><nav><a href="#videos">Elías y animaciones</a>{indice}</nav>
<div class="barra"><span id="cuenta">0 elegidas</span><button type="button" id="copiar">Copiar mi selección</button><button type="button" class="claro" id="limpiar">Limpiar</button></div></header>
<main><p class="nota">Marca las piezas que te gusten y pulsa «Copiar mi selección» para pegarla en el chat. Toca una imagen (no la casilla) para verla grande. Esta página es solo local: no se publica.</p>
{"".join(sec_html)}</main>
<dialog id="visor"><img alt=""></dialog>
<script>
const RUTAS={rutas};
const cajas=[...document.querySelectorAll('.pieza input')];
const guardar=()=>{{const s=cajas.filter(c=>c.checked).map(c=>c.value);try{{localStorage.setItem('opciones',JSON.stringify(s))}}catch(e){{}}document.getElementById('cuenta').textContent=s.length+' elegidas'}};
try{{const s=new Set(JSON.parse(localStorage.getItem('opciones')||'[]'));cajas.forEach(c=>c.checked=s.has(c.value))}}catch(e){{}}
cajas.forEach(c=>c.addEventListener('change',guardar));guardar();
document.getElementById('copiar').onclick=async()=>{{const t=cajas.filter(c=>c.checked).map(c=>c.value+' · '+c.dataset.nombre).join('\\n')||'(nada elegido)';try{{await navigator.clipboard.writeText('Elegí estas piezas:\\n'+t);document.getElementById('copiar').textContent='¡Copiado!'}}catch(e){{prompt('Copia esta lista:',t)}}setTimeout(()=>document.getElementById('copiar').textContent='Copiar mi selección',1500)}};
document.getElementById('limpiar').onclick=()=>{{cajas.forEach(c=>c.checked=false);guardar()}};
const visor=document.getElementById('visor');
document.querySelectorAll('.pieza img').forEach(i=>i.addEventListener('click',ev=>{{ev.preventDefault();visor.querySelector('img').src=i.dataset.grande||i.src;visor.showModal()}}));
visor.addEventListener('click',()=>visor.close());
</script></body></html>''', encoding='utf-8')


if __name__ == '__main__':
    main()
