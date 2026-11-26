// Logo 3D de Nativzar para el portafolio (24/11/2026, segunda versión).
// La primera versión apilaba terrazas cilíndricas y parecía una torta. Esta es UNA montaña de roca facetada:
// un relieve con estratos y facetas, con el sendero esmeralda TALLADO en su cara (repisas en zigzag con
// acantilados arriba y abajo), la gran piedra, agaves, piedritas y la cruz con halo en la cima.
// Se gira 360° arrastrando (mouse o dedo) o con el botón «Girar»; sin tocarla, se mece suavemente de frente.
//
// montar(caja, { poster }) crea un <canvas> dentro de `caja` y lo funde sobre la imagen fija.
// { poster: true } dibuja una sola vez la pose de frente (para capturar la imagen fija, ver capturar_poster.mjs).
// Todo el azar usa una semilla fija: el póster y la versión interactiva muestran la misma montaña.
// Empaquetado: herramientas/logo3d/construir.sh → js/montana3d-<versión>.js
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, InstancedMesh, BoxGeometry, BufferGeometry,
  IcosahedronGeometry, ConeGeometry, CircleGeometry, MeshStandardMaterial, MeshBasicMaterial, SpriteMaterial, Sprite,
  HemisphereLight, DirectionalLight, CanvasTexture, Color, Object3D, Vector3, Float32BufferAttribute,
  NeutralToneMapping, SRGBColorSpace, PCFSoftShadowMap, DoubleSide,
} from 'three';

const PAPEL = 0xf3eee4;
const SENDERO = [0x1d6a3a, 0x207241, 0x1a5f34, 0x237a46, 0x1f6d3d];
const BORDE = 0xf2f0ea;
const PIEDRA_ARRIBA = 0xe6e4df;
const PIEDRA_LADO = 0xb9bbbc;
const PLANTA = 0x2f5e3d;
const MADERA = 0x8f5428;

function azar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const suave = t => t * t * (3 - 2 * t);
const fijar = (v, a, b) => Math.max(a, Math.min(b, v));
const paso = (a, b, x) => suave(fijar((x - a) / (b - a), 0, 1));

// ---- ruido con semilla -----------------------------------------------------------------------
function hash2(i, j, s) {
  let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(s, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function ruido(x, y, s) {
  const i = Math.floor(x), j = Math.floor(y);
  const fx = suave(x - i), fy = suave(y - j);
  const a = hash2(i, j, s), b = hash2(i + 1, j, s), c = hash2(i, j + 1, s), d = hash2(i + 1, j + 1, s);
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}
const fbm = (x, y, s) => ruido(x, y, s) * 0.55 + ruido(x * 2.1, y * 2.1, s + 1) * 0.3 + ruido(x * 4.3, y * 4.3, s + 2) * 0.15;
// facetas: cada celda de Voronoi es un plano inclinado al azar → caras de roca anchas, como en el logo
function facetas(x, y, s) {
  const i = Math.floor(x), j = Math.floor(y);
  let mejor = 9, gx = 0, gy = 0, cx = 0, cy = 0, base = 0;
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
    const px = i + a + hash2(i + a, j + b, s), py = j + b + hash2(i + a, j + b, s + 7);
    const d = (px - x) ** 2 + (py - y) ** 2;
    if (d < mejor) {
      mejor = d; cx = px; cy = py;
      gx = hash2(i + a, j + b, s + 3) - 0.5; gy = hash2(i + a, j + b, s + 5) - 0.5; base = hash2(i + a, j + b, s + 9) - 0.5;
    }
  }
  return gx * (x - cx) + gy * (y - cy) + base * 0.5;
}

// ---- la montaña ------------------------------------------------------------------------------
const ALTO = 3.7;          // altura de la cima
const RX = 2.75, RZ = 2.35, CZ = -0.25;
const MEDIO = 0.19;        // medio ancho del sendero
const CIMA = [0.02, CZ + 0.05];

function relieve(x, z) {
  const u = x / RX, v = (z - CZ) / RZ;
  const r = Math.hypot(u, v) + (fbm(x * 0.9 + 3, z * 0.9, 11) - 0.5) * 0.22;
  if (r >= 1) return 0;
  let h = ALTO * Math.pow(1 - r, 1.08);
  h += 0.3 * Math.pow(Math.max(0, 1 - r / 0.25), 2);                     // pico más agudo
  const borde = r * (1 - r) * 4;                                            // 0 en base y cima
  h += (fbm(x * 1.3, z * 1.3, 21) - 0.5) * 1.1 * borde;                     // lomos y quebradas
  h += facetas(x * 2.2, z * 2.2, 31) * 0.42 * borde;                         // caras de roca
  // estratos: bandas de acantilado torcidas por el ruido, mezcladas a medias para que no queden anillos
  const e = (h + (fbm(x * 0.8, z * 0.8, 41) - 0.5) * 0.7) / 0.46;
  const banda = (Math.floor(e) + paso(0.62, 0.86, e - Math.floor(e))) * 0.46;
  h = h * 0.45 + banda * 0.55 * paso(0, 0.3, h);
  return Math.max(0, h);
}

// sendero: sale de la neblina al frente y sube en zigzag siguiendo las curvas de nivel de la cara delantera
// (cada tramo va por un anillo de la montaña y gira en los extremos), hasta la cima.
const ANILLOS = [0.86, 0.73, 0.6, 0.48, 0.37, 0.27, 0.17];
function puntosSendero() {
  const p = [[-0.5, CZ + RZ * 1.32], [-0.62, CZ + RZ * 1.05]];
  const enAnillo = (a, t) => [Math.sin(t) * RX * a, CZ + Math.cos(t) * RZ * a];
  ANILLOS.forEach((a, k) => {
    const abre = 0.58 + k * 0.07;                       // los tramos de arriba abarcan más ángulo
    const desde = k % 2 ? abre : -abre, hasta = -desde;
    for (let s = 0; s <= 18; s++) p.push(enAnillo(a, desde + ((hasta - desde) * s) / 18));
    // curva cerrada redonda hacia el tramo siguiente: un medio círculo que sale un poco hacia el costado
    if (k + 1 < ANILLOS.length) {
      const a2 = ANILLOS[k + 1], sig = Math.sign(hasta);
      const am = (a + a2) / 2, rm = (a - a2) / 2;
      for (let s = 1; s < 8; s++) {
        const f = (s / 8) * Math.PI;
        const aa = am + Math.cos(f) * rm;                      // de un anillo al otro
        const extra = Math.sin(f) * (rm * RZ) / (aa * RX) * 1.1;   // se abre hacia afuera en ángulo
        p.push(enAnillo(aa, hasta + sig * extra));
      }
    }
  });
  p.push(CIMA);
  return p;
}

function construirSendero() {
  const PUNTOS = puntosSendero();
  const pts = [];
  for (let k = 0; k < PUNTOS.length - 1; k++) {
    const [x1, z1] = PUNTOS[k], [x2, z2] = PUNTOS[k + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, z2 - z1) / 0.04));
    for (let s = 0; s < n; s++) pts.push([x1 + ((x2 - x1) * s) / n, z1 + ((z2 - z1) * s) / n]);
  }
  pts.push(CIMA);
  const largo = [0];
  for (let i = 1; i < pts.length; i++) largo.push(largo[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = largo[largo.length - 1];
  // pendiente pareja: sube en proporción al largo recorrido desde que toca la roca
  const entra = largo[pts.findIndex(([x, z]) => Math.hypot(x / RX, (z - CZ) / RZ) < 0.97)] || 0;
  const cima = relieve(...CIMA) * 0.9;
  const lineal = largo.map(l => cima * fijar((l - entra) / (total - entra), 0, 1));
  // mezcla con el relieve suavizado (siempre en subida) para que el sendero no flote ni se hunda demasiado
  const crudo = pts.map(([x, z]) => relieve(x, z));
  const terreno = crudo.map((_, i) => {
    let s = 0, n = 0;
    for (let k = -12; k <= 12; k++) { const j = i + k; if (j >= 0 && j < crudo.length) { s += crudo[j]; n++; } }
    return s / n;
  });
  const alt = lineal.map((l, i) => l * 0.5 + terreno[i] * 0.5);
  for (let i = 1; i < alt.length; i++) alt[i] = Math.max(alt[i], alt[i - 1]);
  alt[alt.length - 1] = cima;
  return { pts, alt, largo, total, cima };
}

// distancia del punto (x,z) al sendero → { d, i (índice del tramo), t, h (altura del sendero) }
function cercano(S, x, z) {
  let mejor = { d: 9, h: 0, s: 0 };
  for (let i = 0; i < S.pts.length - 1; i++) {
    const [x1, z1] = S.pts[i], [x2, z2] = S.pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, l2 = dx * dx + dz * dz || 1e-9;
    const t = fijar(((x - x1) * dx + (z - z1) * dz) / l2, 0, 1);
    const d = Math.hypot(x - x1 - dx * t, z - z1 - dz * t);
    if (d < mejor.d) mejor = { d, h: S.alt[i] + (S.alt[i + 1] - S.alt[i]) * t, s: (S.largo[i] + (S.largo[i + 1] - S.largo[i]) * t) / S.total };
  }
  return mejor;
}

// altura final: relieve con el sendero tallado y la cima aplanada.
// - Repisa: plana en todo el ancho del sendero y sus bordillos (REPISA), un poco por debajo de la cinta verde.
// - Corte: ninguna roca puede quedar por encima de NINGÚN tramo cercano (se toma el mínimo de todos los tramos),
//   así un tramo de arriba nunca tapa al de abajo y siempre queda paso libre.
// - Relleno: bajo el tramo más cercano, para que la repisa no quede en el aire.
const REPISA = MEDIO + 0.08;
function alturaFinal(S, x, z) {
  const base = relieve(x, z);
  const rugoso = facetas(x * 3.2, z * 3.2, 51) * 0.5 + (fbm(x * 2.5, z * 2.5, 61) - 0.5) * 0.35 + 0.08;
  let corte = Infinity;
  let c = { d: 9, h: 0, s: 0 };
  for (let i = 0; i < S.pts.length - 1; i++) {
    const [x1, z1] = S.pts[i], [x2, z2] = S.pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, l2 = dx * dx + dz * dz || 1e-9;
    const t = fijar(((x - x1) * dx + (z - z1) * dz) / l2, 0, 1);
    const d = Math.hypot(x - x1 - dx * t, z - z1 - dz * t);
    if (d > 1.4) continue;
    const hs = S.alt[i] + (S.alt[i + 1] - S.alt[i]) * t;
    if (d < c.d) c = { d, h: hs, s: (S.largo[i] + (S.largo[i + 1] - S.largo[i]) * t) / S.total };
    const lejos = Math.max(0, d - REPISA);
    corte = Math.min(corte, hs - 0.012 + 3.2 * lejos + rugoso * Math.min(1, lejos * 5));
  }
  let h = c.d < REPISA ? c.h - 0.012 : Math.max(base, c.h - 0.012 - 1.7 * (c.d - REPISA));
  h = Math.min(h, corte);
  const dc = Math.hypot(x - CIMA[0], z - CIMA[1]);
  if (dc < 0.3) h = Math.max(h, S.cima) * (1 - paso(0.18, 0.3, dc)) + h * paso(0.18, 0.3, dc);
  return { h, c };
}

// ---- texturas de luz y niebla ------------------------------------------------------------------
function textura(dibujar, lado = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = lado;
  dibujar(c.getContext('2d'), lado);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}
const halo = () => textura((x, n) => {
  const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  g.addColorStop(0, 'rgba(255,214,140,0.95)');
  g.addColorStop(0.22, 'rgba(255,190,100,0.55)');
  g.addColorStop(0.55, 'rgba(250,190,120,0.16)');
  g.addColorStop(1, 'rgba(250,200,140,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, n, n);
});
const rayos = () => textura((x, n) => {
  const c = n / 2;
  x.translate(c, c);
  for (let k = 0; k < 20; k++) {
    x.rotate((Math.PI * 2) / 20);
    const g = x.createLinearGradient(0, 0, c, 0);
    g.addColorStop(0, 'rgba(255,205,120,0.45)');
    g.addColorStop(1, 'rgba(255,205,120,0)');
    x.fillStyle = g;
    const a = k % 2 ? 0.04 : 0.07;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(c, -c * a); x.lineTo(c, c * a); x.closePath(); x.fill();
  }
}, 512);
const bruma = () => textura((x, n) => {
  const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  g.addColorStop(0, 'rgba(246,242,234,1)');
  g.addColorStop(0.5, 'rgba(246,242,234,0.72)');
  g.addColorStop(1, 'rgba(246,242,234,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, n, n);
}, 128);

// ¿WebGL por software? Animar así gasta CPU y batería: mejor la imagen fija.
export function graficosPorSoftware() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
    if (!gl) return true;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const nombre = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(nombre);
  } catch { return true; }
}

export function montar(caja, opciones = {}) {
  const poster = !!opciones.poster;
  if (!poster && graficosPorSoftware()) throw new Error('montana3d: sin aceleración gráfica');
  const renderer = new WebGLRenderer({
    antialias: true, alpha: true, powerPreference: 'high-performance',
    preserveDrawingBuffer: poster, failIfMajorPerformanceCaveat: !poster,
  });
  renderer.setPixelRatio(poster ? (opciones.escala || 2) : Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);
  const lienzo = renderer.domElement;
  lienzo.className = 'montana3d-canvas';
  lienzo.setAttribute('aria-hidden', 'true');
  caja.appendChild(lienzo);

  const r = azar(20261124);
  const escena = new Scene();
  const camara = new PerspectiveCamera(30, 1, 0.1, 60);
  const giro = new Group();
  const mundo = new Group();
  mundo.position.z = -CZ;                // el eje de giro pasa por el centro de la montaña
  giro.add(mundo);
  escena.add(giro);

  // ---- malla del relieve (triángulos sueltos para colorear cada cara) ----
  const S = construirSendero();
  const N = 170, X0 = -3.3, X1 = 3.3, Z0 = -2.9, Z1 = 3.6;
  const vx = new Float32Array((N + 1) * (N + 1)), vz = new Float32Array(vx.length), vy = new Float32Array(vx.length);
  const vd = new Float32Array(vx.length), vs = new Float32Array(vx.length);
  const celda = (X1 - X0) / N;
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const k = j * (N + 1) + i;
    const borde = i === 0 || j === 0 || i === N || j === N;
    const x = X0 + i * celda + (borde ? 0 : (r() - 0.5) * celda * 0.5);
    const z = Z0 + j * ((Z1 - Z0) / N) + (borde ? 0 : (r() - 0.5) * celda * 0.5);
    const { h, c } = alturaFinal(S, x, z);
    vx[k] = x; vz[k] = z; vy[k] = h; vd[k] = c.d; vs[k] = c.s;
  }
  const pos = [], colores = [];
  const col = new Color(), n = new Vector3(), a = new Vector3(), b = new Vector3();
  const dentroBase = k => Math.hypot(vx[k] / RX, (vz[k] - CZ) / RZ) < 1.12 || vd[k] < 0.5;
  const tri = (p, q, s) => {
    if (!dentroBase(p) && !dentroBase(q) && !dentroBase(s)) return;
    if (vy[p] < 0.04 && vy[q] < 0.04 && vy[s] < 0.04) return;   // suelo: lo cubre la neblina
    a.set(vx[q] - vx[p], vy[q] - vy[p], vz[q] - vz[p]);
    b.set(vx[s] - vx[p], vy[s] - vy[p], vz[s] - vz[p]);
    n.crossVectors(b, a).normalize();
    if (n.y < 0) n.negate();
    const d = (vd[p] + vd[q] + vd[s]) / 3;
    const h = (vy[p] + vy[q] + vy[s]) / 3;
    // la repisa queda bajo la cinta del sendero; alrededor, piedra clara pisada (como en el logo)
    if (h < 0.05) col.setHex(PAPEL);
    else if (d < REPISA + 0.1 && n.y > 0.6) col.setHex(BORDE).multiplyScalar(0.94 + r() * 0.05);
    else {
      const plano = paso(0.55, 0.85, n.y);
      col.setHex(PIEDRA_LADO).lerp(new Color(PIEDRA_ARRIBA), plano);
      col.multiplyScalar(0.86 + r() * 0.16 + (n.x - n.z * 0.2) * 0.04);
      col.r *= 1.01; col.b *= 0.99;
      if (h < 0.35) col.lerp(new Color(PAPEL), (0.35 - h) * 1.6);   // la base se funde con la neblina
    }
    for (const v of [p, q, s]) { pos.push(vx[v], vy[v], vz[v]); colores.push(col.r, col.g, col.b); }
  };
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    const k = j * (N + 1) + i, k2 = k + N + 1;
    if ((i + j) % 2) { tri(k, k2, k + 1); tri(k + 1, k2, k2 + 1); } else { tri(k, k2, k2 + 1); tri(k, k2 + 1, k + 1); }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new Float32BufferAttribute(colores, 3));
  geo.computeVertexNormals();
  const montana = new Mesh(geo, new MeshStandardMaterial({ vertexColors: true, roughness: 0.93, flatShading: true }));
  montana.castShadow = montana.receiveShadow = true;
  mundo.add(montana);

  // ---- el sendero: una cinta verde continua con bordillos de piedra clara, apoyada sobre la repisa ----
  {
    const M = MEDIO, B = 0.04;
    // sección transversal: [desplazamiento lateral, altura sobre la repisa, ¿verde?]
    const sec = [[-M - B, -0.05, 2], [-M - B, 0.026, 0], [-M, 0.026, 0], [-M + 0.01, 0.016, 1], [M - 0.01, 0.016, 1], [M, 0.026, 0], [M + B, 0.026, 0], [M + B, -0.05, 2]];
    const P = S.pts, n0 = P.length;
    const lado = P.map((_, i) => {
      const a0 = P[Math.max(0, i - 2)], a1 = P[Math.min(n0 - 1, i + 2)];
      const tx = a1[0] - a0[0], tz = a1[1] - a0[1], l = Math.hypot(tx, tz) || 1;
      return [-tz / l, tx / l];
    });
    const vert = (i, k) => [P[i][0] + lado[i][0] * sec[k][0], S.alt[i] + sec[k][1], P[i][1] + lado[i][1] * sec[k][0]];
    const cp = [], cc = [];
    const verde = new Color(), clara = new Color(), papel = new Color(PAPEL);
    const primero = Math.max(0, P.findIndex(([x, z]) => Math.hypot(x / RX, (z - CZ) / RZ) < 1.04));
    for (let i = primero; i < n0 - 1; i++) {
      verde.setHex(SENDERO[Math.floor(i / 2) % SENDERO.length]).multiplyScalar(0.95 + ((i >> 1) % 3) * 0.03);
      clara.setHex(BORDE).multiplyScalar(0.9 + r() * 0.08);
      const h = S.alt[i];
      for (let k = 0; k < sec.length - 1; k++) {
        const c = (sec[k][2] === 1 && sec[k + 1][2] === 1) ? verde.clone()
          : (sec[k][2] === 2 || sec[k + 1][2] === 2) ? new Color(PIEDRA_LADO).multiplyScalar(0.95) : clara.clone();
        if (h < 0.22) c.lerp(papel, Math.pow((0.22 - h) / 0.22, 1.3));     // la entrada se funde con la neblina
        const q = [vert(i, k), vert(i, k + 1), vert(i + 1, k + 1), vert(i + 1, k)];
        for (const v of [q[0], q[1], q[2], q[0], q[2], q[3]]) { cp.push(...v); cc.push(c.r, c.g, c.b); }
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(cp, 3));
    g.setAttribute('color', new Float32BufferAttribute(cc, 3));
    g.computeVertexNormals();
    const cinta = new Mesh(g, new MeshStandardMaterial({ vertexColors: true, roughness: 0.8, flatShading: true, side: DoubleSide }));
    cinta.castShadow = cinta.receiveShadow = true;
    mundo.add(cinta);
  }

  const alturaEn = (x, z) => alturaFinal(S, x, z).h;
  const pendiente = (x, z) => Math.hypot(alturaEn(x + 0.05, z) - alturaEn(x - 0.05, z), alturaEn(x, z + 0.05) - alturaEn(x, z - 0.05)) / 0.1;
  const lejosDelSendero = (x, z, m) => cercano(S, x, z).d > m;

  // ---- la gran piedra, piedritas y agaves ----
  const roca = new MeshStandardMaterial({ color: 0xdedbd4, roughness: 0.9, flatShading: true });
  const geoPiedra = new IcosahedronGeometry(1, 1);
  {
    const p = geoPiedra.attributes.position;
    const rp = azar(5);
    for (let i = 0; i < p.count; i++) { const k = 0.86 + rp() * 0.26; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k); }
    geoPiedra.computeVertexNormals();
  }
  // la gran piedra: en una repisa a la derecha, lejos del sendero (nunca lo tapa)
  let PX = 0.78, PZ = 0.78;
  {
    let mejor = Infinity;
    for (let k = 0; k < 400; k++) {
      const x = 0.9 + r() * 1.3, z = -0.4 + r() * 1.5;
      if (!lejosDelSendero(x, z, REPISA + 0.3) || pendiente(x, z) > 1.3 || alturaEn(x, z) < 0.6) continue;
      const e = Math.hypot(x - 1.35, z - 0.55);
      if (e < mejor) { mejor = e; PX = x; PZ = z; }
    }
  }
  {
    const x = PX, z = PZ;
    const m = new Mesh(geoPiedra, roca);
    m.scale.set(0.3, 0.27, 0.27);
    m.rotation.set(0.4, 0.7, 0.1);
    m.position.set(x, alturaEn(x, z) + 0.2, z);
    m.castShadow = m.receiveShadow = true;
    mundo.add(m);
  }
  const geoRoca = new IcosahedronGeometry(1, 0);
  const piedritas = [];
  const plantas = [];
  for (let n0 = 0; n0 < 900 && (piedritas.length < 46 || plantas.length < 22); n0++) {
    const x = (r() * 2 - 1) * RX * 0.92, z = CZ + (r() * 2 - 1) * RZ * 0.92;
    const rr = Math.hypot(x / RX, (z - CZ) / RZ);
    if (rr > 0.9) continue;
    const c = cercano(S, x, z);
    if (c.d < REPISA + 0.26) continue;
    if (Math.hypot(x - PX, z - PZ) < 0.42) continue;
    if (pendiente(x, z) > 0.9) continue;
    const y = alturaEn(x, z);
    if (y < 0.08) continue;
    if (piedritas.length < 46 && r() < 0.6) piedritas.push([x, y, z, 0.04 + r() * 0.08]);
    else if (plantas.length < 22) plantas.push([x, y, z, 0.13 + r() * 0.1]);
  }
  const rocas = new InstancedMesh(geoRoca, roca, piedritas.length);
  const o = new Object3D();
  piedritas.forEach(([x, y, z, s], i) => {
    o.position.set(x, y + s * 0.35, z);
    o.rotation.set(r() * 3, r() * 3, r() * 3);
    o.scale.set(s * (0.8 + r() * 0.5), s * (0.6 + r() * 0.4), s * (0.8 + r() * 0.5));
    o.updateMatrix();
    rocas.setMatrixAt(i, o.matrix);
  });
  rocas.castShadow = rocas.receiveShadow = true;
  mundo.add(rocas);
  const HOJAS = 8;
  const geoHoja = new ConeGeometry(0.03, 1, 4);
  geoHoja.translate(0, 0.5, 0);
  const hojas = new InstancedMesh(geoHoja, new MeshStandardMaterial({ color: PLANTA, roughness: 0.8, flatShading: true }), plantas.length * HOJAS);
  let ih = 0;
  for (const [x, y, z, h] of plantas) for (let k = 0; k < HOJAS; k++) {
    o.position.set(x, y - 0.01, z);
    o.rotation.set(0, (k / HOJAS) * Math.PI * 2 + r(), 0.3 + r() * 0.55, 'YXZ');
    o.scale.set(1, h * (0.7 + r() * 0.5), 1);
    o.updateMatrix();
    hojas.setMatrixAt(ih++, o.matrix);
  }
  hojas.castShadow = true;
  mundo.add(hojas);

  // ---- la cruz con halo ----
  const cimaY = alturaEn(...CIMA);
  const cruz = new Group();
  const madera = new MeshStandardMaterial({ color: MADERA, roughness: 0.7, flatShading: true, emissive: 0x6a3510, emissiveIntensity: 0.3 });
  const palo = new Mesh(new BoxGeometry(0.1, 0.8, 0.1), madera);
  palo.position.y = 0.4;
  const brazo = new Mesh(new BoxGeometry(0.46, 0.1, 0.1), madera);
  brazo.position.y = 0.57;
  palo.castShadow = brazo.castShadow = true;
  cruz.add(palo, brazo);
  cruz.position.set(CIMA[0], cimaY - 0.02, CIMA[1]);
  mundo.add(cruz);
  const luz = new Sprite(new SpriteMaterial({ map: halo(), transparent: true, depthWrite: false, opacity: 0.75 }));
  luz.position.set(CIMA[0], cimaY + 0.55, CIMA[1] - 0.35);
  luz.scale.setScalar(2.2);
  const corona = new Sprite(new SpriteMaterial({ map: rayos(), transparent: true, depthWrite: false, opacity: 0.32 }));
  corona.position.copy(luz.position);
  corona.scale.setScalar(2.9);
  luz.renderOrder = corona.renderOrder = -1;
  giro.add(corona, luz);                 // los sprites siguen a la cruz al girar
  corona.position.z += -CZ; luz.position.z += -CZ;

  // ---- neblina en la base y nubes detrás ----
  const texBruma = bruma();
  const nieblas = new Group();
  for (const [ang, rad, y, s, op] of [[0, 2.7, 0.1, 3.6, 1], [0.9, 2.6, 0.15, 3.2, 0.95], [-0.9, 2.6, 0.15, 3.2, 0.95], [1.9, 2.5, 0.2, 3, 0.9], [-1.9, 2.5, 0.2, 3, 0.9], [3.1, 2.4, 0.2, 3, 0.9], [0.4, 3.2, -0.1, 4.6, 1], [-0.4, 3.2, -0.1, 4.6, 1]]) {
    const sp = new Sprite(new SpriteMaterial({ map: texBruma, transparent: true, depthWrite: false, opacity: op }));
    sp.userData = { ang, rad, y };
    sp.scale.set(s, s * 0.42, 1);
    sp.renderOrder = 2;
    nieblas.add(sp);
  }
  escena.add(nieblas);                   // fuera del grupo que gira: la base siempre queda envuelta
  const sombra = new Mesh(new CircleGeometry(3.4, 48), new MeshBasicMaterial({ map: textura((x, n) => {
    const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    g.addColorStop(0, 'rgba(214,205,190,0.55)'); g.addColorStop(0.6, 'rgba(225,217,203,0.3)'); g.addColorStop(1, 'rgba(235,229,218,0)');
    x.fillStyle = g; x.fillRect(0, 0, n, n);
  }, 128), transparent: true, depthWrite: false }));
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.y = -0.01;
  escena.add(sombra);

  escena.add(new HemisphereLight(0xffffff, 0x8e9196, 1.3));
  const sol = new DirectionalLight(0xfffaf0, 2.3);
  sol.position.set(-3.8, 7.5, 5.5);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -4, right: 4, top: 5, bottom: -3.5 });
  sol.shadow.bias = -0.0006;
  sol.shadow.normalBias = 0.03;
  escena.add(sol);
  const contra = new DirectionalLight(0xffc77a, 0.8);
  contra.position.set(1.5, 5, -7);
  escena.add(contra);

  function encuadrar() {
    const ancho = Math.max(1, caja.clientWidth), alto = Math.max(1, caja.clientHeight);
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    const tan = Math.tan((camara.fov * Math.PI) / 360);
    const d = Math.max(6.6, 6.6 / camara.aspect) / (2 * tan);
    const elev = 0.36;
    camara.position.set(0, 1.8 + Math.sin(elev) * d, Math.cos(elev) * d);
    camara.lookAt(0, 1.8, 0);
    camara.updateProjectionMatrix();
  }
  encuadrar();

  const fijarNiebla = () => {
    for (const sp of nieblas.children) {
      const { ang, rad, y } = sp.userData;
      sp.position.set(Math.sin(ang) * rad * 0.95, y, Math.cos(ang) * rad * 0.8);
    }
  };
  fijarNiebla();

  function dibujar(angulo, inclinacion, t) {
    giro.rotation.y = angulo;
    giro.rotation.x = inclinacion;
    corona.material.rotation = t * 0.05;
    const pulso = 1 + Math.sin(t * 1.2) * 0.05;
    luz.scale.setScalar(2.2 * pulso);
    renderer.render(escena, camara);
  }

  if (poster) {
    dibujar(opciones.angulo ?? -0.12, 0, 0);
    caja.classList.add('is-3d');
    return { lienzo, destruir() { renderer.dispose(); lienzo.remove(); } };
  }

  // ---- interacción: arrastrar gira 360°, con inercia; quieta, vuelve de frente y se mece ----
  let angulo = -0.12, vel = 0, incl = 0, objIncl = 0, desdeX = null, desdeY = 0, ultimoX = 0, ultimoT = 0, quietaDesde = 0;
  let vuelta = null;   // { desde, hasta, t0 } giro completo del botón
  const alBajar = ev => {
    desdeX = ultimoX = ev.clientX; desdeY = ev.clientY; ultimoT = performance.now(); vel = 0; vuelta = null;
    lienzo.setPointerCapture?.(ev.pointerId);
    caja.classList.add('arrastrando');
  };
  const alArrastrar = ev => {
    if (desdeX === null) return;
    const ahora = performance.now();
    const dx = ((ev.clientX - ultimoX) / Math.max(220, caja.clientWidth)) * Math.PI * 1.6;
    angulo += dx;
    vel = dx / Math.max(8, ahora - ultimoT) * 16;
    ultimoX = ev.clientX; ultimoT = ahora;
    objIncl = fijar(((ev.clientY - desdeY) / Math.max(220, caja.clientHeight)) * 0.5, -0.12, 0.22);
  };
  const alSoltar = () => {
    if (desdeX === null) return;
    desdeX = null; objIncl = 0; quietaDesde = performance.now();
    caja.classList.remove('arrastrando');
  };
  lienzo.addEventListener('pointerdown', alBajar);
  lienzo.addEventListener('pointermove', alArrastrar);
  lienzo.addEventListener('pointerup', alSoltar);
  lienzo.addEventListener('pointercancel', alSoltar);

  let visible = true, idCuadro = 0, t0 = performance.now(), previo = performance.now();
  const cuadro = ahora => {
    idCuadro = 0;
    const dt = Math.min(0.05, (ahora - previo) / 1000);
    previo = ahora;
    const t = (ahora - t0) / 1000;
    if (vuelta) {
      const k = fijar((ahora - vuelta.t0) / 4200, 0, 1);
      angulo = vuelta.desde + (vuelta.hasta - vuelta.desde) * (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      if (k >= 1) { vuelta = null; quietaDesde = ahora; }
    } else if (desdeX === null) {
      angulo += vel; vel *= Math.pow(0.04, dt);                       // inercia
      if (Math.abs(vel) < 0.0008 && ahora - quietaDesde > 2600) {
        // vuelve a la cara del sendero por el camino corto y se mece
        const frente = Math.round((angulo + 0.12) / (Math.PI * 2)) * Math.PI * 2 - 0.12;
        const meta = frente + Math.sin(t * 0.35) * 0.32;
        angulo += (meta - angulo) * Math.min(1, dt * 1.4);
      }
    }
    incl += (objIncl - incl) * Math.min(1, dt * 8);
    dibujar(angulo, incl, t);
    pedir();
  };
  const pedir = () => { if (!idCuadro && visible && !document.hidden) { previo = performance.now(); idCuadro = requestAnimationFrame(cuadro); } };
  const pausar = () => { if (idCuadro) cancelAnimationFrame(idCuadro); idCuadro = 0; };
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? pedir() : pausar(); });
  io.observe(caja);
  const alOcultar = () => (document.hidden ? pausar() : pedir());
  document.addEventListener('visibilitychange', alOcultar);
  const ro = new ResizeObserver(() => { encuadrar(); if (!idCuadro) dibujar(angulo, incl, 0); });
  ro.observe(caja);

  dibujar(angulo, 0, 0);
  requestAnimationFrame(() => caja.classList.add('is-3d'));
  quietaDesde = performance.now();
  pedir();

  return {
    lienzo,
    girar() { vel = 0; vuelta = { desde: angulo, hasta: angulo + Math.PI * 2, t0: performance.now() }; pedir(); },
    destruir() {
      pausar(); io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', alOcultar);
      renderer.dispose(); lienzo.remove(); caja.classList.remove('is-3d');
    },
  };
}
