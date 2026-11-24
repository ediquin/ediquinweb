#!/usr/bin/env node
// QA del portafolio: node herramientas/qa_portafolio.mjs [url] [carpeta-capturas]
// Usa puppeteer-core y axe-core de portafolio_web/herramientas y el Chrome del sistema.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const HERR = '/home/ediquin/Documents/Claude_projects/Personal_projects/portafolio_web/herramientas/package.json';
const require = createRequire(HERR);
const puppeteer = require('puppeteer-core');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const URL_ = process.argv[2] || 'http://localhost:8093/';
const OUT = process.argv[3] || 'capturas-qa';
fs.mkdirSync(OUT, { recursive: true });
const res = []; const ok = (n, c, d = '') => { res.push({ n, ok: !!c, d }); console.log(`${c ? 'bien' : 'MAL '}  ${n}${d ? ' · ' + d : ''}`); };

const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[390, 844], [768, 1024], [1440, 900]]) {
  const p = await b.newPage();
  const errores = [];
  p.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  p.on('pageerror', e => errores.push(String(e)));
  p.on('requestfailed', r => { const t = (r.failure() || {}).errorText || ''; if (r.resourceType() === 'media' && t.includes('ERR_ABORTED')) return; errores.push('falló ' + r.url() + ' ' + t); });
  p.on('response', r => { if (r.status() >= 400) errores.push(r.status() + ' ' + r.url()); });
  await p.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 });
  await p.goto(URL_, { waitUntil: 'networkidle0' });
  // recorrer la página para cargar imágenes diferidas
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
  await new Promise(r => setTimeout(r, 600));
  const info = await p.evaluate(() => ({
    desborde: document.documentElement.scrollWidth - innerWidth,
    rotas: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && !i.src.startsWith('data:')).map(i => i.src),
    h1: document.querySelectorAll('h1').length,
    fuentes: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family),
    chicas: [...document.querySelectorAll('body *')].filter(e => !(e instanceof SVGElement) && e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && e.checkVisibility?.() && parseFloat(getComputedStyle(e).fontSize) < 12).map(e => e.className || e.tagName).slice(0, 5),
  }));
  ok(`${w}px sin desborde horizontal`, info.desborde <= 0, `${info.desborde}px`);
  ok(`${w}px imágenes sin romper`, info.rotas.length === 0, info.rotas.join(' '));
  ok(`${w}px un solo h1`, info.h1 === 1);
  ok(`${w}px fuentes propias cargadas`, info.fuentes.length >= 2, info.fuentes.join(','));
  ok(`${w}px texto ≥ 12 px`, info.chicas.length === 0, info.chicas.join(','));
  await p.addScriptTag({ content: AXE });
  const axe = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] })).violations.map(v => `${v.id}(${v.nodes.length}): ${v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')}`));
  ok(`${w}px axe WCAG 2.1 AA`, axe.length === 0, axe.join(' ; '));
  if (w === 1440) {
    // visor de afiches
    await p.click('.t-afiches .afiche');
    await new Promise(r => setTimeout(r, 500));
    const abierto = await p.evaluate(() => { const d = document.querySelector('[data-visor]'); return d.open && d.querySelector('img').naturalWidth > 0; });
    ok('visor abre el afiche grande', abierto);
    await p.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
    ok('Esc cierra el visor y devuelve el foco', await p.evaluate(() => !document.querySelector('[data-visor]').open && document.activeElement.classList.contains('afiche')));
    // vista previa de Shorts al pasar el mouse
    await p.evaluate(() => document.querySelector('#video').scrollIntoView());
    await p.hover('.short');
    await new Promise(r => setTimeout(r, 1500));
    ok('Short reproduce su vista previa al pasar el mouse', await p.evaluate(() => { const v = document.querySelector('.short video'); return !v.paused && v.currentTime > 0; }));
    // animación de Kauxte
    await p.evaluate(() => document.querySelector('[data-video-auto]').scrollIntoView({ block: 'center' }));
    await new Promise(r => setTimeout(r, 1500));
    ok('animación se reproduce sola a la vista', await p.evaluate(() => !document.querySelector('[data-video-auto] video').paused));
    await p.click('[data-video-pausa]');
    ok('botón de pausa detiene la animación', await p.evaluate(() => document.querySelector('[data-video-auto] video').paused));
    // riel: flecha siguiente
    const antes = await p.evaluate(() => document.querySelector('[data-riel-pista]').scrollLeft);
    await p.evaluate(() => document.querySelector('[data-riel-sig]').click());
    await new Promise(r => setTimeout(r, 900));
    ok('flecha mueve el riel', await p.evaluate(a => document.querySelector('[data-riel-pista]').scrollLeft > a, antes));
  }
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({ path: `${OUT}/portafolio-${w}.png`, fullPage: true });
  ok(`${w}px sin errores de consola ni recursos`, errores.length === 0, errores.slice(0, 4).join(' | '));
  await p.close();
}
// movimiento reducido: sin vistas previas ni animación automática
{
  const p = await b.newPage();
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(URL_, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.querySelector('[data-video-auto]').scrollIntoView({ block: 'center' }));
  await new Promise(r => setTimeout(r, 1200));
  ok('reducir movimiento: la animación no arranca sola', await p.evaluate(() => { const v = document.querySelector('[data-video-auto] video'); return v.paused && !v.getAttribute('src'); }));
  await p.close();
}
await b.close();
const mal = res.filter(r => !r.ok).length;
console.log(`\n${res.length - mal} bien, ${mal} mal`);
fs.writeFileSync(`${OUT}/qa.json`, JSON.stringify(res, null, 2));
process.exit(mal ? 1 : 0);
