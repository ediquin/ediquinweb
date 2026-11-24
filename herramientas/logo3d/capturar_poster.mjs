// Imagen fija del logo 3D (pose de frente, fondo transparente) con Chrome sin ventana y WebGL por software.
//   node capturar_poster.mjs [url-del-lab] [salida.png] [ángulo]
// Requiere el portafolio servido (puerto 8093) y lab/montana3d-lab.js recién construido.
import { createRequire } from 'node:module';
const require = createRequire('/home/ediquin/Documents/Claude_projects/Personal_projects/portafolio_web/herramientas/');
const puppeteer = require('puppeteer-core');
const url = process.argv[2] || 'http://localhost:8093/herramientas/logo3d/lab/?poster';
const salida = process.argv[3] || new URL('./poster-montana3d.png', import.meta.url).pathname;
const nav = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'] });
try {
  const p = await nav.newPage();
  p.on('pageerror', e => console.error(String(e)));
  await p.setViewport({ width: 720, height: 720, deviceScaleFactor: 1.5 });
  await p.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));
  await (await p.$('#c')).screenshot({ path: salida, omitBackground: true });
  console.log(salida);
} finally { await nav.close(); }
