#!/usr/bin/env node
// QA del portafolio: inicio, diseno/ y software/, en español y en/ inglés.
// node herramientas/qa_portafolio.mjs [url] [carpeta-capturas]
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
const PAGINAS = ['', 'diseno/', 'software/'];
for (const idioma of ['es', 'en']) for (const carpeta of PAGINAS) for (const [w0, h] of [[390, 844], [768, 1024], [1440, 900]]) {
  const URL_P = new URL((idioma === 'en' ? 'en/' : '') + carpeta, URL_).href;
  const prof = carpeta ? 1 : 0;
  const otroEsperado = idioma === 'es' ? '../'.repeat(prof) + 'en/' + carpeta : '../'.repeat(prof + 1) + carpeta;
  const w = w0; const T = `${idioma === 'es' ? '' : 'en '}${carpeta || 'inicio/'} ${w}`;
  const p = await b.newPage();
  const errores = [];
  p.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  p.on('pageerror', e => errores.push(String(e)));
  p.on('requestfailed', r => { const t = (r.failure() || {}).errorText || ''; if (r.resourceType() === 'media' && t.includes('ERR_ABORTED')) return; errores.push('falló ' + r.url() + ' ' + t); });
  p.on('response', r => { if (r.status() >= 400) errores.push(r.status() + ' ' + r.url()); });
  await p.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 });
  await p.goto(URL_P, { waitUntil: 'networkidle0' });
  // recorrer la página para cargar imágenes diferidas
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
  await new Promise(r => setTimeout(r, 600));
  const info = await p.evaluate(() => ({
    desborde: document.documentElement.scrollWidth - innerWidth,
    rotas: [...document.images].filter(i => i.complete && i.naturalWidth === 0 && !i.src.startsWith('data:')).map(i => i.src),
    h1: document.querySelectorAll('h1').length,
    lang: document.documentElement.lang, otro: document.querySelector('.idioma')?.getAttribute('href'),
    fuentes: [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family),
    chicas: [...document.querySelectorAll('body *')].filter(e => !(e instanceof SVGElement) && e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && e.checkVisibility?.() && parseFloat(getComputedStyle(e).fontSize) < 12).map(e => e.className || e.tagName).slice(0, 5),
  }));
  ok(`${T}px sin desborde horizontal`, info.desborde <= 0, `${info.desborde}px`);
  ok(`${T}px imágenes sin romper`, info.rotas.length === 0, info.rotas.join(' '));
  ok(`${T}px un solo h1`, info.h1 === 1);
  ok(`${T}px idioma y enlace al otro idioma`, info.lang === idioma && info.otro === otroEsperado, `${info.lang} → ${info.otro}`);
  if (w === 390) ok(`${T}px menú de caminos visible en el celular`, await p.evaluate(() => [...document.querySelectorAll('.menu a')].filter(a => a.checkVisibility()).length === 3));
  ok(`${T}px fuentes propias cargadas`, info.fuentes.length >= 2, info.fuentes.join(','));
  ok(`${T}px texto ≥ 12 px`, info.chicas.length === 0, info.chicas.join(','));
  // la aparición al desplazarse deja a medio fundir lo que queda justo en el borde de la pantalla;
  // el contraste se mide con el estado final de cada elemento
  await p.addStyleTag({ content: '.revelar, .area-n { animation: none !important; }' });
  await p.addScriptTag({ content: AXE });
  const axe = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] })).violations.map(v => `${v.id}(${v.nodes.length}): ${v.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')}`));
  ok(`${T}px axe WCAG 2.1 AA`, axe.length === 0, axe.join(' ; '));
  if (w === 1440) {
    // todos los enlaces internos responden (otras páginas, PDF, subpáginas de Nativzar MJ)
    const internos = await p.evaluate(() => [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href.split('#')[0]).filter(u => u.startsWith(location.origin)))]);
    const rotos = [];
    for (const u of internos) { const r = await fetch(u); if (!r.ok) rotos.push(`${r.status} ${u}`); }
    ok(`${T}px enlaces internos sin romper (${internos.length})`, rotos.length === 0, rotos.join(' '));
  }
  if (w === 1440 && carpeta === 'diseno/') {
    // visor con imágenes que no son 2:3 (escudo cuadrado y polera horizontal)
    for (const sel of ['.escudos .afiche', '.ig-ropa .afiche']) {
      await p.evaluate(q => document.querySelector(q).scrollIntoView({ block: 'center' }), sel);
      await p.evaluate(q => document.querySelector(q).click(), sel);
      await new Promise(r => setTimeout(r, 700));
      const v = await p.evaluate(() => { const i = document.querySelector('[data-visor] img'); const r = i.getBoundingClientRect(); return { ok: i.naturalWidth > 0, prop: +(r.width / r.height).toFixed(2), nat: +(i.naturalWidth / i.naturalHeight).toFixed(2), cabe: r.right <= innerWidth && r.bottom <= innerHeight }; });
      ok(`${T}px visor muestra ${sel} completo y sin deformar`, v.ok && Math.abs(v.prop - v.nat) < 0.03 && v.cabe, JSON.stringify(v));
      await p.keyboard.press('Escape'); await new Promise(r => setTimeout(r, 300));
    }
    await p.evaluate(() => scrollTo(0, 0));
    // visor de afiches
    await p.evaluate(() => document.querySelector('.t-afiches .afiche').scrollIntoView({ block: 'center' }));
    await new Promise(r => setTimeout(r, 400));
    await p.click('.t-afiches .afiche');
    await new Promise(r => setTimeout(r, 500));
    const abierto = await p.evaluate(() => { const d = document.querySelector('[data-visor]'); return d.open && d.querySelector('img').naturalWidth > 0; });
    ok(`${T} visor abre el afiche grande`, abierto);
    await p.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
    ok(`${T} Esc cierra el visor y devuelve el foco`, await p.evaluate(() => !document.querySelector('[data-visor]').open && document.activeElement.classList.contains('afiche')));
    // vista previa de Shorts al pasar el mouse
    await p.evaluate(() => document.querySelector('#video').scrollIntoView());
    await p.hover('.short');
    await new Promise(r => setTimeout(r, 1500));
    ok(`${T} Short reproduce su vista previa al pasar el mouse`, await p.evaluate(() => { const v = document.querySelector('.short video'); return !v.paused && v.currentTime > 0; }));
    // animación de Kauxte
    await p.evaluate(() => document.querySelector('[data-video-auto]').scrollIntoView({ block: 'center' }));
    await new Promise(r => setTimeout(r, 1500));
    ok(`${T} intro del club se reproduce sola a la vista`, await p.evaluate(() => !document.querySelector('[data-video-auto] video').paused));
    await p.click('[data-video-pausa]');
    ok(`${T} botón de pausa detiene la animación`, await p.evaluate(() => document.querySelector('[data-video-auto] video').paused));
    await new Promise(r => setTimeout(r, 300));
    ok(`${T} el botón cambia su texto al pausar`, await p.evaluate(e => document.querySelector('[data-video-pausa]').getAttribute('aria-label') === (e ? 'Play the animation' : 'Reproducir la animación'), idioma === 'en'));
    // carrusel de indumentaria: la flecha siguiente está activa y avanza
    if (await p.$('[data-ropa-sig]')) {
    const ropa0 = await p.evaluate(() => { const q = document.querySelector('[data-ropa-pista]'); q.scrollIntoView({ block: 'center' }); return { x: q.scrollLeft, sig: document.querySelector('[data-ropa-sig]').disabled }; });
    await p.evaluate(() => document.querySelector('[data-ropa-sig]').click());
    await new Promise(r => setTimeout(r, 900));
    ok(`${T} carrusel de indumentaria avanza`, !ropa0.sig && await p.evaluate(a => document.querySelector('[data-ropa-pista]').scrollLeft > a, ropa0.x));
    }
    // logo 3D: sin aceleración gráfica (Chrome sin ventana) debe quedar la imagen fija, visible y sin errores
    await p.evaluate(() => document.querySelector('[data-montana3d]').scrollIntoView({ block: 'center' }));
    await new Promise(r => setTimeout(r, 1500));
    ok(`${T} logo 3D muestra su imagen fija sin WebGL acelerado`, await p.evaluate(() => { const f = document.querySelector('[data-montana3d]'); const i = f.querySelector('img'); return i.complete && i.naturalWidth > 0 && (f.classList.contains('is-3d') || getComputedStyle(i).opacity === '1'); }));
    // estilos de video: corren solos a la vista y el botón los pausa
    await p.evaluate(() => document.querySelector('[data-estilos]').scrollIntoView({ block: 'center' }));
    await new Promise(r => setTimeout(r, 1800));
    ok(`${T} clips de estilos de video corren a la vista`, await p.evaluate(() => [...document.querySelectorAll('[data-estilos] video')].every(v => !v.paused && v.currentTime > 0)));
    await p.click('[data-estilos-pausa]');
    ok(`${T} botón pausa los clips de estilos`, await p.evaluate(e => [...document.querySelectorAll('[data-estilos] video')].every(v => v.paused) && document.querySelector('[data-estilos-pausa]').getAttribute('aria-label') === (e ? 'Play the videos' : 'Reproducir los videos'), idioma === 'en'));
    // riel: flecha siguiente
    const antes = await p.evaluate(() => document.querySelector('[data-riel-pista]').scrollLeft);
    await p.evaluate(() => document.querySelector('[data-riel-sig]').click());
    await new Promise(r => setTimeout(r, 900));
    ok(`${T} flecha mueve el riel`, await p.evaluate(a => document.querySelector('[data-riel-pista]').scrollLeft > a, antes));
  }
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({ path: `${OUT}/portafolio-${idioma}-${(carpeta || 'inicio/').slice(0, -1)}-${w}.png`, fullPage: true });
  ok(`${T}px sin errores de consola ni recursos`, errores.length === 0, errores.slice(0, 4).join(' | '));
  await p.close();
}
// enlaces viejos del portafolio de una página (#web, #diseno…) llevan al camino nuevo
for (const [hash, destino] of [['#web', 'software/#web'], ['#diseno', 'diseno/#diseno'], ['#ia', 'software/#ia']]) {
  const p = await b.newPage();
  await p.goto(URL_ + hash, { waitUntil: 'networkidle0' });
  ok(`enlace viejo ${hash} lleva a ${destino}`, p.url() === new URL(destino, URL_).href, p.url());
  await p.close();
}
// movimiento reducido: sin vistas previas ni animación automática
{
  const p = await b.newPage();
  await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(new URL('diseno/', URL_).href, { waitUntil: 'networkidle0' });
  await p.evaluate(() => document.querySelector('[data-video-auto]').scrollIntoView({ block: 'center' }));
  await new Promise(r => setTimeout(r, 1200));
  await p.evaluate(() => document.querySelector('[data-estilos]').scrollIntoView({ block: 'center' }));
  await new Promise(r => setTimeout(r, 1000));
  ok('reducir movimiento: los clips de estilos no se descargan ni corren', await p.evaluate(() => [...document.querySelectorAll('[data-estilos] video')].every(v => v.paused && !v.getAttribute('src'))));
  ok('reducir movimiento: la animación no arranca sola', await p.evaluate(() => { const v = document.querySelector('[data-video-auto] video'); return v.paused && !v.getAttribute('src'); }));
  await p.close();
}
await b.close();
const mal = res.filter(r => !r.ok).length;
console.log(`\n${res.length - mal} bien, ${mal} mal`);
fs.writeFileSync(`${OUT}/qa.json`, JSON.stringify(res, null, 2));
process.exit(mal ? 1 : 0);
