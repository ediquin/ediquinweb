/* Portafolio de ediquin · 24/11/2026, dividido en dos caminos el 26/11/2026. Sin librerías.
   Barra de progreso y sección activa · collage con paralaje · vista previa del índice ·
   riel de Shorts con vistas previas · animación con pausa · visor de imágenes ·
   carrusel de indumentaria · logo 3D de Nativzar (Three.js, se carga solo al acercarse). Textos en español o inglés según <html lang>. */
(() => {
  'use strict';
  const en = document.documentElement.lang === 'en';
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ahorro = !!(navigator.connection && navigator.connection.saveData);
  const conMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* 0. enlaces viejos del portafolio de una sola página (…/ediquinweb/#web): llevan al camino nuevo */
  if (document.body.dataset.pagina === 'inicio') {
    const viejas = { diseno: 'diseno/', video: 'diseno/', foto: 'diseno/', aprendiendo: 'diseno/', web: 'software/', ia: 'software/', herramientas: 'software/' };
    const h = location.hash.slice(1);
    if (viejas[h]) { location.replace(viejas[h] + '#' + h); return; }
  }

  /* 1. progreso de lectura y sección activa en la barra de cada página (solo enlaces internos #…) */
  const barra = $('[data-progreso]');
  const enlaces = $$('.subnav a[href^="#"], .menu a[href^="#"]');
  const secciones = enlaces.map(a => $(a.getAttribute('href'))).filter(Boolean);
  let pendiente = false;
  const alDesplazar = () => {
    pendiente = false;
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    if (barra) barra.style.transform = `scaleX(${p.toFixed(4)})`;
    const y = innerHeight * 0.35;
    let activa = -1;
    secciones.forEach((s, i) => { if (s.getBoundingClientRect().top <= y) activa = i; });
    enlaces.forEach((a, i) => { if (i === activa) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  };
  addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(alDesplazar); } }, { passive: true });
  alDesplazar();

  /* 2. collage del héroe: las piezas siguen al puntero con distinta profundidad */
  const collage = $('[data-collage]');
  if (collage && conMouse && !reducir) {
    const piezas = $$('[data-prof]', collage);
    collage.addEventListener('pointermove', e => {
      const r = collage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      piezas.forEach(p => { const k = +p.dataset.prof * 14; p.style.transform = `translate(${(x * k).toFixed(1)}px, ${(y * k).toFixed(1)}px)`; });
    });
    collage.addEventListener('pointerleave', () => piezas.forEach(p => { p.style.transform = ''; }));
  }

  /* 3. índice: imagen de muestra que sigue al puntero */
  const vista = $('[data-indice-vista]');
  const indice = $('[data-indice]');
  if (vista && indice && conMouse && !reducir) {
    let vx = 0, vy = 0, tx = 0, ty = 0, anim = 0;
    const mover = () => {
      vx += (tx - vx) * 0.18; vy += (ty - vy) * 0.18;
      vista.style.transform = `translate(${vx.toFixed(1)}px, ${vy.toFixed(1)}px) rotate(${((tx - vx) * 0.04).toFixed(2)}deg)`;
      anim = Math.abs(tx - vx) + Math.abs(ty - vy) > 0.5 ? requestAnimationFrame(mover) : 0;
    };
    $$('a[data-vista]', indice).forEach(a => {
      a.addEventListener('pointerenter', () => { vista.src = a.dataset.vista; vista.classList.add('visible'); });
    });
    indice.addEventListener('pointermove', e => {
      tx = e.clientX + 28; ty = e.clientY - 150;
      if (!vista.classList.contains('visible')) { vx = tx; vy = ty; }
      if (!anim) anim = requestAnimationFrame(mover);
    });
    indice.addEventListener('pointerleave', () => vista.classList.remove('visible'));
  }

  /* 4. riel de Shorts: vista previa muda al pasar el mouse (escritorio) o en la tarjeta más visible (celular) */
  const pista = $('[data-riel-pista]');
  if (pista) {
    const tarjetas = $$('.short', pista);
    const sePuede = !reducir && !ahorro;
    const jugar = t => {
      if (!sePuede) return;
      const v = $('video', t);
      if (!v.src) { v.src = v.dataset.src; }
      const p = v.play(); if (p && p.catch) p.catch(() => {});
      t.classList.add('reproduce');
    };
    const parar = t => { const v = $('video', t); if (!v.paused) v.pause(); t.classList.remove('reproduce'); };
    if (conMouse) {
      tarjetas.forEach(t => {
        t.addEventListener('pointerenter', () => jugar(t));
        t.addEventListener('pointerleave', () => parar(t));
        t.addEventListener('focus', () => jugar(t));
        t.addEventListener('blur', () => parar(t));
      });
    } else if ('IntersectionObserver' in window) {
      // en táctil: solo la tarjeta que está casi entera a la vista reproduce
      const io = new IntersectionObserver(entradas => {
        entradas.forEach(e => (e.intersectionRatio > 0.9 ? jugar : parar)(e.target));
      }, { root: pista, threshold: [0, 0.9] });
      const ioPagina = new IntersectionObserver(([e]) => {
        tarjetas.forEach(t => (e.isIntersecting ? io.observe(t) : (io.unobserve(t), parar(t))));
      }, { threshold: 0.3 });
      ioPagina.observe(pista);
    }
    const ant = $('[data-riel-ant]'), sig = $('[data-riel-sig]');
    const paso = () => (tarjetas[0].getBoundingClientRect().width + 18) * (innerWidth > 860 ? 2 : 1);
    const actualizar = () => {
      if (ant) ant.disabled = pista.scrollLeft < 8;
      if (sig) sig.disabled = pista.scrollLeft + pista.clientWidth > pista.scrollWidth - 8;
    };
    if (ant) ant.addEventListener('click', () => pista.scrollBy({ left: -paso(), behavior: reducir ? 'auto' : 'smooth' }));
    if (sig) sig.addEventListener('click', () => pista.scrollBy({ left: paso(), behavior: reducir ? 'auto' : 'smooth' }));
    pista.addEventListener('scroll', actualizar, { passive: true });
    addEventListener('resize', actualizar);
    actualizar();
  }

  /* 5. animación de Kauxte: se reproduce sola mientras está a la vista; botón de pausa (WCAG 2.2.2) */
  $$('[data-video-auto]').forEach(fig => {
    const v = $('video', fig);
    const b = $('[data-video-pausa]', fig);
    let elegida = reducir || ahorro;
    let aLaVista = false;
    const pintar = () => {
      fig.classList.toggle('en-pausa', v.paused);
      b.setAttribute('aria-label', en ? (v.paused ? 'Play the animation' : 'Pause the animation') : (v.paused ? 'Reproducir la animación' : 'Pausar la animación'));
    };
    const jugar = () => { if (!v.src) v.src = v.dataset.src; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    v.addEventListener('play', pintar);
    v.addEventListener('pause', pintar);
    b.addEventListener('click', () => { if (v.paused) { elegida = false; jugar(); } else { elegida = true; v.pause(); } });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        aLaVista = e.isIntersecting;
        if (aLaVista && !elegida) jugar(); else if (!aLaVista && !v.paused) v.pause();
      }, { threshold: 0.5 }).observe(v);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) v.pause(); else if (aLaVista && !elegida) jugar();
    });
    pintar();
  });

  /* 6. visor de imágenes (afiches, escudos, flyers): usa data-w y data-h si la imagen no es 2:3 */
  const visor = $('[data-visor]');
  if (visor && typeof visor.showModal === 'function') {
    // la imagen se crea al abrir: así no queda un <img> vacío en la página
    const img = document.createElement('img');
    img.width = 900; img.height = 1350; img.alt = '';
    let creada = false;
    let origen = null;
    $$('[data-grande]').forEach(btn => btn.addEventListener('click', () => {
      origen = btn;
      if (!creada) { visor.append(img); creada = true; }
      img.width = +btn.dataset.w || 900; img.height = +btn.dataset.h || 1350;
      img.src = btn.dataset.grande;
      img.alt = btn.dataset.alt || '';
      visor.showModal();
    }));
    visor.addEventListener('click', e => { if (e.target === visor) visor.close(); });
    visor.addEventListener('close', () => { if (origen) origen.focus(); });
  } else {
    // sin <dialog>: el botón abre la imagen grande en la misma pestaña
    $$('[data-grande]').forEach(btn => btn.addEventListener('click', () => { location.href = btn.dataset.grande; }));
  }


  /* 7. carrusel de indumentaria: flechas que avanzan una prenda */
  const ropa = $('[data-ropa-pista]');
  const ropaAnt = $('[data-ropa-ant]'), ropaSig = $('[data-ropa-sig]');
  if (ropa && ropaAnt && ropaSig) {
    const ant = ropaAnt, sig = ropaSig;
    const mover = d => {
      const li = $('li', ropa);
      ropa.scrollBy({ left: d * (li ? li.getBoundingClientRect().width + 14 : 300), behavior: reducir ? 'auto' : 'smooth' });
    };
    const estado = () => {
      ant.disabled = ropa.scrollLeft < 4;
      sig.disabled = ropa.scrollLeft + ropa.clientWidth > ropa.scrollWidth - 4;
    };
    ant.addEventListener('click', () => mover(-1));
    sig.addEventListener('click', () => mover(1));
    ropa.addEventListener('scroll', estado, { passive: true });
    addEventListener('resize', estado);
    $$('img', ropa).forEach(i => i.addEventListener('load', estado));
    estado();
  }

  /* 8. logo 3D de Nativzar: el módulo (Three.js, ~130 KB) se pide solo cuando la tarjeta se acerca a la pantalla.
     Con «reducir movimiento», ahorro de datos o sin aceleración gráfica queda la imagen fija. */
  const m3d = $('[data-montana3d]');
  if (m3d && !reducir && !ahorro && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      import(new URL(m3d.dataset.montana3d, document.baseURI).href).then(mod => {
        const vista = mod.montar(m3d);
        const girar = $('[data-montana3d-girar]', m3d);
        const pista = $('.montana3d-pista', m3d);
        if (pista) pista.textContent = en ? 'Drag to rotate' : 'Arrastra para girar';
        if (girar) {
          girar.textContent = en ? 'Spin 360°' : 'Girar 360°';
          girar.hidden = false;
          girar.addEventListener('click', () => vista.girar());
        }
        m3d.addEventListener('pointerdown', () => m3d.classList.add('tocada'), { once: true });
      }).catch(() => {});   // sin WebGL acelerado: se queda la imagen fija
    }, { rootMargin: '300px 0px' });
    io.observe(m3d);
  }

  /* 9. estilos de video (diseno/): clips mudos de 4 s, como GIF pero mucho más livianos.
     Corren solos mientras la sección está a la vista, con un botón para pausarlos (WCAG 2.2.2).
     Con «reducir movimiento» o ahorro de datos arrancan en pausa y no se descargan. */
  const estilos = $('[data-estilos]');
  const estilosB = estilos && $('[data-estilos-pausa]', estilos);
  if (estilos && estilosB) {
    const vids = $$('video', estilos);
    let pausado = reducir || ahorro, visible = false;
    vids.forEach(v => v.addEventListener('playing', () => v.parentElement.classList.add('reproduce')));
    const pintar = () => {
      estilos.classList.toggle('en-pausa', pausado);
      estilosB.setAttribute('aria-label', en ? (pausado ? 'Play the videos' : 'Pause the videos') : (pausado ? 'Reproducir los videos' : 'Pausar los videos'));
    };
    const aplicar = () => vids.forEach(v => {
      if (visible && !pausado && !document.hidden) {
        if (!v.src) v.src = v.dataset.src;
        const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
      } else if (!v.paused) v.pause();
    });
    estilosB.addEventListener('click', () => { pausado = !pausado; pintar(); aplicar(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; aplicar(); }, { threshold: 0.2 }).observe(estilos);
    document.addEventListener('visibilitychange', aplicar);
    pintar();
  }

})();
