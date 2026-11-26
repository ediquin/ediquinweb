// Logo 3D de Nativzar para el portafolio (24/11/2026, tercera versión).
// v1 apilaba terrazas cilíndricas (parecía una torta); v2 era un cono liso con el sendero como cinta aparte,
// que parecía flotar. Esta sigue el dibujo del logo: bloques de roca de techo plano y paredes verticales,
// con un sendero verde angosto que RODEA la montaña en espiral, metido entre bordillos de piedra clara,
// con paredes arriba, caídas abajo, tramos planos y empinados, y cuatro grietas que lo cortan.
// Lleva la gran piedra, agaves, piedritas y la cruz con halo en la cima.
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

// ---- la montaña: columnas de roca, como el logo ----------------------------------------------
// El logo dibuja la montaña con bloques de roca de techo plano y paredes verticales, y el sendero verde
// metido entre piedras claras. Aquí cada bloque es una celda de Voronoi extruida hasta el suelo.
const ALTO = 3.5;          // altura de la cima
const RX = 2.6, RZ = 2.25, CZ = -0.2;
const MEDIO = 0.12;        // medio ancho del sendero: angosto
const BORDILLO = 0.12;     // franja de piedras claras a cada lado
const REPISA = MEDIO + BORDILLO;
const CIMA = [0, CZ];
const VUELTAS = 2.2;       // el sendero rodea la montaña
const GRIETAS = [0.2, 0.41, 0.6, 0.8];   // cortes que atraviesan el sendero (fracción del recorrido)
const SEP = 0.13;          // separación media entre bloques

const radio = (x, z) => Math.hypot(x / RX, (z - CZ) / RZ);
const conoLiso = rho => (rho >= 1 ? 0 : ALTO * Math.pow(1 - rho, 1.05));
function relieve(x, z) {
  const r = radio(x, z) + (fbm(x * 0.9 + 3, z * 0.9, 11) - 0.5) * 0.14;
  if (r >= 1) return 0;
  return conoLiso(r) + 0.25 * Math.pow(Math.max(0, 1 - r / 0.2), 2) + (facetas(x * 1.7, z * 1.7, 31) - 0) * 0.35 * paso(0, 0.3, 1 - r);
}

// sendero en espiral: sale de la neblina al frente, da 2,2 vueltas subiendo y llega a la cima.
// La pendiente cambia: g(t) alterna tramos casi planos y otros empinados.
function construirSendero() {
  const R0 = 1.03, R1 = 0.12, F0 = -0.5;
  const g = t => t + (0.72 * Math.sin(2 * Math.PI * 5 * t)) / (2 * Math.PI * 5);
  const en = t => {
    const f = F0 + t * VUELTAS * Math.PI * 2;
    // el sendero se mete y se sale un poco: no es un anillo perfecto
    const rho = R0 - (R0 - R1) * g(t) + (0.05 * Math.sin(f * 2.6 + 1) + 0.06 * (fbm(t * 30, 1.3, 81) - 0.5)) * paso(0, 0.06, t) * (1 - paso(0.9, 1, t));
    return [Math.sin(f) * RX * rho, CZ + Math.cos(f) * RZ * rho, rho];
  };
  const pts = [], alt = [];
  for (let t = 0; t < 1;) {
    const [x, z, rho] = en(t);
    pts.push([x, z]); alt.push(conoLiso(rho));
    const [x2, z2] = en(t + 1e-4);
    t += 0.035 / (Math.hypot(x2 - x, z2 - z) / 1e-4);
  }
  const cima = conoLiso(R1);
  const [xf, zf] = en(1);
  for (let s = 0; s <= 6; s++) { pts.push([xf + (CIMA[0] - xf) * s / 6, zf + (CIMA[1] - zf) * s / 6]); alt.push(cima); }
  for (let i = 1; i < alt.length; i++) alt[i] = Math.max(alt[i], alt[i - 1]);
  const largo = [0];
  for (let i = 1; i < pts.length; i++) largo.push(largo[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = largo[largo.length - 1];
  const grieta = largo.map(l => GRIETAS.some(g0 => Math.abs(l - g0 * total) < 0.085));
  return { pts, alt, largo, total, cima, grieta };
}

// distancia del punto (x,z) al sendero → { d, h (altura del sendero), s (fracción), px, pz, grieta }
function cercano(S, x, z) {
  let m = { d: 9, h: 0, s: 0, px: 0, pz: 0, grieta: false };
  for (let i = 0; i < S.pts.length - 1; i++) {
    const [x1, z1] = S.pts[i], [x2, z2] = S.pts[i + 1];
    const dx = x2 - x1, dz = z2 - z1, l2 = dx * dx + dz * dz || 1e-9;
    const t = fijar(((x - x1) * dx + (z - z1) * dz) / l2, 0, 1);
    const px = x1 + dx * t, pz = z1 + dz * t;
    const d = Math.hypot(x - px, z - pz);
    if (d < m.d) m = { d, h: S.alt[i] + (S.alt[i + 1] - S.alt[i]) * t, s: (S.largo[i] + (S.largo[i + 1] - S.largo[i]) * t) / S.total, px, pz, grieta: S.grieta[t < 0.5 ? i : i + 1] };
  }
  return m;
}

function recortar(poly, mx, mz, nx, nz) {
  const out = [], f = p => (p[0] - mx) * nx + (p[1] - mz) * nz;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], fa = f(a), fb = f(b);
    if (fa <= 0) out.push(a);
    if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  }
  return out;
}

// bloques: semillas en rejilla con desorden, polígono de Voronoi por recorte con los vecinos, y su altura.
function construirBloques(S, r) {
  const sem = [];
  for (let z = CZ - RZ * 1.1; z <= CZ + RZ * 1.1; z += SEP) for (let x = -RX * 1.1; x <= RX * 1.1; x += SEP) {
    const sx = x + (r() - 0.5) * SEP * 0.8, sz = z + (r() - 0.5) * SEP * 0.8;
    if (radio(sx, sz) < 1.04) sem.push([sx, sz]);
  }
  const H = new Map(), clave = (i, j) => i * 100003 + j;
  sem.forEach((p, k) => { const c = clave(Math.floor(p[0] / SEP), Math.floor(p[1] / SEP)); if (!H.has(c)) H.set(c, []); H.get(c).push(k); });
  const vecinos = (x, z, rad) => {
    const out = [];
    for (let i = Math.floor((x - rad) / SEP); i <= Math.floor((x + rad) / SEP); i++)
      for (let j = Math.floor((z - rad) / SEP); j <= Math.floor((z + rad) / SEP); j++) { const l = H.get(clave(i, j)); if (l) out.push(...l); }
    return out;
  };
  const bloques = sem.map(([x, z], k) => {
    let poly = [[x - 0.17, z - 0.17], [x + 0.17, z - 0.17], [x + 0.17, z + 0.17], [x - 0.17, z + 0.17]];
    for (const m of vecinos(x, z, 0.3)) {
      if (m === k) continue;
      const [qx, qz] = sem[m];
      poly = recortar(poly, (x + qx) / 2, (z + qz) / 2, qx - x, qz - z);
    }
    // la orilla de la base se recorta en elipse para que la montaña no quede cuadrada
    const c = cercano(S, x, z);
    let dmin = c.d;
    for (const p of poly) dmin = Math.min(dmin, cercano(S, p[0], p[1]).d);
    const rc = radio(x, z);
    let h, tipo;
    if (rc < 0.13) { tipo = 'cima'; h = S.cima + 0.02; }
    else if (c.d < MEDIO || dmin < MEDIO * 0.7) { tipo = 'bajo'; h = c.h - (c.grieta ? 0.6 : 0.05); }
    else if (c.d < REPISA) {
      tipo = 'bordillo';
      const adentro = rc < radio(c.px, c.pz);
      h = c.grieta ? c.h - 0.35 : c.h + (adentro ? 0.04 + r() * 0.06 : 0.008 + r() * 0.02);   // por fuera, bajos: no tapan el sendero
    }
    else {
      tipo = 'roca';
      const hc = relieve(x, z);
      h = Math.round(hc / 0.22) * 0.22 * 0.75 + hc * 0.25;                 // escalones de roca
      // cada vuelta del sendero acota la roca: por fuera queda más baja (caída), por dentro más alta (pared).
      // Se miran todas las vueltas cercanas, así la roca entre dos vueltas nunca tapa la de arriba.
      let tope = Infinity, piso = 0, dArr = 9, dAba = 9, hArr = 0, hAba = 0;
      for (let i = 0; i < S.pts.length - 1; i += 2) {
        const j = Math.min(i + 2, S.pts.length - 1);
        const [x1, z1] = S.pts[i], [x2, z2] = S.pts[j];
        const dx = x2 - x1, dz = z2 - z1, l2 = dx * dx + dz * dz || 1e-9;
        const t = fijar(((x - x1) * dx + (z - z1) * dz) / l2, 0, 1);
        const px = x1 + dx * t, pz = z1 + dz * t, d = Math.hypot(x - px, z - pz);
        if (d > 0.9) continue;
        const hs = S.alt[i] + (S.alt[j] - S.alt[i]) * t;
        if (rc > radio(px, pz)) { tope = Math.min(tope, hs - 0.07); if (d < dArr) { dArr = d; hArr = hs; } }   // vuelta de arriba
        else { piso = Math.max(piso, hs + 0.1); if (d < dAba) { dAba = d; hAba = hs; } }                       // vuelta de abajo
      }
      // entre dos vueltas: ladera de la vuelta de abajo a la de arriba, rota en pilares y huecos
      let base = h;
      if (dArr < 9 && dAba < 9) base = hAba + (hArr - hAba) * fijar((dAba - REPISA) / Math.max(0.05, dAba + dArr - 2 * REPISA), 0, 1);
      else if (dArr < 9) base = Math.min(h, hArr - 0.07 - 0.9 * Math.max(0, dArr - REPISA));
      const quiebre = (fbm(x * 2.4, z * 2.4, 91) - 0.5) * 0.9 + (r() - 0.5) * 0.3;
      h = Math.max(piso + r() * 0.08, Math.min(tope - r() * 0.05, base + quiebre));
      if (piso > tope) h = tope;
    }
    if (rc > 0.97) h = Math.min(h, relieve(x, z) * 0.6);
    // techo un poco inclinado (las rocas no son mesas perfectas), salvo bajo el sendero y en sus bordillos
    const incl = tipo === 'roca' ? [(r() - 0.5) * 0.7, (r() - 0.5) * 0.7] : [0, 0];
    return { x, z, poly, h: Math.max(0, h), tipo, incl, c };
  });
  const alturaEn = (x, z) => {
    let mejor = null, md = 9;
    for (const k of vecinos(x, z, SEP * 1.6)) { const d = (sem[k][0] - x) ** 2 + (sem[k][1] - z) ** 2; if (d < md) { md = d; mejor = bloques[k]; } }
    return mejor ? mejor.h : 0;
  };
  return { bloques, alturaEn };
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

  // ---- los bloques de roca (triángulos sueltos para colorear cada cara) ----
  const S = construirSendero();
  const { bloques, alturaEn } = construirBloques(S, r);
  const pos = [], colores = [];
  const papel = new Color(PAPEL), ta = new Vector3(), tb = new Vector3(), tn = new Vector3();
  // agrega un triángulo con la cara hacia `hacia` (así se ve con el material de una sola cara)
  const cara = (p, q, s, cp, cq, cs, hacia) => {
    ta.set(q[0] - p[0], q[1] - p[1], q[2] - p[2]); tb.set(s[0] - p[0], s[1] - p[1], s[2] - p[2]);
    tn.crossVectors(ta, tb);
    if (tn.x * hacia[0] + tn.y * hacia[1] + tn.z * hacia[2] < 0) { [q, s] = [s, q]; [cq, cs] = [cs, cq]; }
    pos.push(...p, ...q, ...s);
    colores.push(cp.r, cp.g, cp.b, cq.r, cq.g, cq.b, cs.r, cs.g, cs.b);
  };
  const neblina = (c, y) => (y < 0.4 ? c.clone().lerp(papel, Math.pow((0.4 - y) / 0.4, 1.4) * 0.85) : c);
  for (const B of bloques) {
    if (B.h < 0.015 || B.poly.length < 3) continue;
    const techo = ([px, pz]) => [px, B.h + B.incl[0] * (px - B.x) + B.incl[1] * (pz - B.z), pz];
    let ct;
    if (B.tipo === 'roca') ct = new Color(PIEDRA_ARRIBA).multiplyScalar(0.86 + r() * 0.14);
    else if (B.tipo === 'bajo') ct = B.c.grieta ? new Color(0x5d5850) : new Color(SENDERO[2]).multiplyScalar(0.8);
    else ct = new Color(BORDE).multiplyScalar(0.88 + r() * 0.1);
    ct = neblina(ct, B.h);
    const centro = techo([B.x, B.z]);
    const tope = B.poly.map(techo);
    for (let i = 0; i < tope.length; i++) cara(centro, tope[i], tope[(i + 1) % tope.length], ct, ct, ct, [0, 1, 0]);
    // paredes hasta el suelo: más oscuras abajo, como el logo
    const lado = new Color(B.tipo === 'bordillo' ? BORDE : PIEDRA_LADO).multiplyScalar((B.tipo === 'bordillo' ? 0.82 : 0.9) + r() * 0.1);
    const ca = neblina(lado, B.h), cb = neblina(lado.clone().multiplyScalar(0.66), 0);
    for (let i = 0; i < tope.length; i++) {
      const p = tope[i], q = tope[(i + 1) % tope.length];
      const fuera = [(p[0] + q[0]) / 2 - B.x, 0, (p[2] + q[2]) / 2 - B.z];
      const p0 = [p[0], 0, p[2]], q0 = [q[0], 0, q[2]];
      cara(p, q, q0, ca, ca, cb, fuera);
      cara(p, q0, p0, ca, cb, cb, fuera);
    }
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  geo.setAttribute('color', new Float32BufferAttribute(colores, 3));
  geo.computeVertexNormals();
  const montana = new Mesh(geo, new MeshStandardMaterial({ vertexColors: true, roughness: 0.93, flatShading: true }));
  montana.castShadow = montana.receiveShadow = true;
  mundo.add(montana);

  // ---- el sendero: pasto verde metido entre los bordillos, apoyado en los bloques de abajo ----
  // No flota: sus costados bajan dentro de la roca y en cada grieta se corta con una pared.
  {
    const P = S.pts, n0 = P.length;
    const lado = P.map((_, i) => {
      const a0 = P[Math.max(0, i - 2)], a1 = P[Math.min(n0 - 1, i + 2)];
      const tx = a1[0] - a0[0], tz = a1[1] - a0[1], l = Math.hypot(tx, tz) || 1;
      return [-tz / l, tx / l];
    });
    const ancho = P.map((_, i) => MEDIO * (1.02 + (fbm(i * 0.21, 3.7, 71) - 0.5) * 0.3));
    const pt = (i, s, dy = 0) => [P[i][0] + lado[i][0] * ancho[i] * s, S.alt[i] + dy, P[i][1] + lado[i][1] * ancho[i] * s];
    const cp = [], cc = [];
    const poner = (p, q, s, c) => { cp.push(...p, ...q, ...s); cc.push(c.r, c.g, c.b, c.r, c.g, c.b, c.r, c.g, c.b); };
    const quad = (a, b, c, d, col) => { poner(a, b, c, col); poner(a, c, d, col); };
    const piedra = new Color(PIEDRA_LADO).multiplyScalar(0.8);
    for (let i = 0; i < n0 - 1; i++) {
      if (S.grieta[i] || S.grieta[i + 1]) {
        // pared del corte, del lado donde sigue el sendero
        if (!S.grieta[i]) quad(pt(i, -1), pt(i, 1), pt(i, 1, -0.6), pt(i, -1, -0.6), piedra);
        if (!S.grieta[i + 1]) quad(pt(i + 1, 1), pt(i + 1, -1), pt(i + 1, -1, -0.6), pt(i + 1, 1, -0.6), piedra);
        continue;
      }
      const verde = new Color(SENDERO[Math.floor(i / 2) % SENDERO.length]).multiplyScalar(0.95 + ((i >> 1) % 3) * 0.03);
      const h = S.alt[i];
      if (h < 0.22) verde.lerp(papel, Math.pow((0.22 - h) / 0.22, 1.3));
      quad(pt(i, -1), pt(i + 1, -1), pt(i + 1, 1), pt(i, 1), verde);
      const b0 = -Math.min(0.3, S.alt[i]), b1 = -Math.min(0.3, S.alt[i + 1]);   // nunca bajo el suelo
      quad(pt(i, 1), pt(i + 1, 1), pt(i + 1, 1, b1), pt(i, 1, b0), piedra);
      quad(pt(i + 1, -1), pt(i, -1), pt(i, -1, b0), pt(i + 1, -1, b1), piedra);
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(cp, 3));
    g.setAttribute('color', new Float32BufferAttribute(cc, 3));
    g.computeVertexNormals();
    const cinta = new Mesh(g, new MeshStandardMaterial({ vertexColors: true, roughness: 0.85, flatShading: true, side: DoubleSide }));
    cinta.castShadow = false; cinta.receiveShadow = true;
    mundo.add(cinta);
  }

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
      if (!lejosDelSendero(x, z, REPISA + 0.2) || pendiente(x, z) > 1.3 || alturaEn(x, z) < 0.6) continue;
      const e = Math.hypot(x - 1.35, z - 0.55);
      if (e < mejor) { mejor = e; PX = x; PZ = z; }
    }
  }
  {
    const x = PX, z = PZ;
    const m = new Mesh(geoPiedra, roca);
    m.scale.set(0.2, 0.18, 0.18);
    m.rotation.set(0.4, 0.7, 0.1);
    m.position.set(x, alturaEn(x, z) + 0.12, z);
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
    if (c.d < REPISA + 0.07) continue;
    if (Math.hypot(x - PX, z - PZ) < 0.3) continue;
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
    const elev = 0.5;
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
