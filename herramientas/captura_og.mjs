// Imagen para compartir (1200×630): el héroe del portafolio. node herramientas/captura_og.mjs [url]
import { createRequire } from 'node:module';
const puppeteer = createRequire('/home/ediquin/Documents/Claude_projects/Personal_projects/portafolio_web/herramientas/package.json')('puppeteer-core');
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const p = await b.newPage();
await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await p.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await p.goto(process.argv[2] || 'http://localhost:8093/', { waitUntil: 'networkidle0' });
await p.addStyleTag({ content: '.barra{display:none}.heroe{padding-top:34px}.heroe-acciones,.cinta{display:none}.heroe h1{font-size:76px}' });
await new Promise(r => setTimeout(r, 400));
await p.screenshot({ path: 'img/2026/og-ediquin.jpg', type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await b.close();
