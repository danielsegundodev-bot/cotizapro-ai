// Verifies the new UX features: AI feedback, signature modes, document themes, mobile shortcut.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const [BASE, S] = process.argv.slice(2);
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const pg = await b.newPage();
  await pg.setViewport({ width: 1440, height: 900 });
  const errors = [];
  pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  pg.on('pageerror', e => errors.push(e.message));
  await pg.evaluateOnNewDocument(() => { try { localStorage.setItem('cotizapro_tour_done_v1', '1'); } catch (_) {} });
  await pg.evaluateOnNewDocument(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; }; });
  await pg.goto(BASE + '/', { waitUntil: 'networkidle0' });

  // --- Defaults
  check('Moneda por defecto MXN', await pg.$eval('#currency-select', el => el.value) === 'MXN');
  check('Arranca en blanco (sin cotización de ejemplo)', await pg.evaluate(() => state.lineItems.length === 0 && !document.getElementById('client-name').value && document.getElementById('doc-project-title').classList.contains('doc-placeholder')));

  // --- AI feedback
  await pg.$eval('#ai-brief-input', el => { el.value = 'sesión de fotos para boda en Guadalajara'; });
  await pg.$eval('[data-click="generateProposalWithAI"]', el => el.click());
  await sleep(100);
  const busy = await pg.evaluate(() => ({ text: document.getElementById('btn-generate-ai').textContent.trim(), disabled: document.getElementById('btn-generate-ai').disabled }));
  check('Botón muestra estado "Generando…"', busy.disabled && /Generando/.test(busy.text), busy.text);
  await sleep(900);
  const ai = await pg.evaluate(() => ({
    panelVisible: !document.getElementById('ai-result').classList.contains('hidden'),
    panelText: document.getElementById('ai-result-text').textContent,
    missing: document.getElementById('ai-result-missing').textContent,
    title: document.getElementById('project-title').value,
    client: document.getElementById('client-name').value,
    items: state.lineItems.map(i => i.name),
    flashed: document.getElementById('doc-items-tbody').classList.contains('flash-updated'),
    btnIdle: document.getElementById('btn-generate-ai').textContent.trim()
  }));
  check('Panel de confirmación visible', ai.panelVisible, ai.panelText.slice(0, 90));
  check('Detecta giro fotografía + ciudad', /Fotográfica/.test(ai.title) && /Guadalajara/.test(ai.title), ai.title);
  check('Conceptos de fotografía', ai.items.some(n => /fotogr/i.test(n)), ai.items[0]);
  check('Cliente de ejemplo limpiado y se avisa que falta', ai.client === '' && /cliente/.test(ai.missing), ai.missing);
  check('Resalta lo que cambió', ai.flashed);
  check('Botón vuelve a su estado normal', /Redactar/.test(ai.btnIdle));

  // --- Signature: draw
  await pg.$eval('[data-click="switchInspectorStep"][data-arg="3"]', el => el.click());
  await sleep(200);
  const canvasInfo = await pg.evaluate(() => { const c = document.getElementById('signature-canvas'); const r = c.getBoundingClientRect(); return { attr: c.width, css: Math.round(r.width), dpr: devicePixelRatio }; });
  check('Lienzo de firma en alta resolución', canvasInfo.attr === Math.round(canvasInfo.css * canvasInfo.dpr), JSON.stringify(canvasInfo));
  const box = await (await pg.$('#signature-canvas')).boundingBox();
  await pg.mouse.move(box.x + 30, box.y + 60); await pg.mouse.down();
  for (let i = 0; i < 12; i++) await pg.mouse.move(box.x + 40 + i * 20, box.y + 40 + (i % 2) * 40);
  await pg.mouse.up();
  check('Firma dibujada aparece en la cotización', await pg.evaluate(() => !document.getElementById('doc-signature-img').classList.contains('hidden') && document.getElementById('doc-signature-img').src.startsWith('data:image/png')));

  // --- Signature: upload (PNG with white background -> transparent)
  const sigPng = await pg.evaluate(() => { const c = document.createElement('canvas'); c.width = 300; c.height = 100; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 300, 100); x.fillStyle = '#000'; x.font = '40px serif'; x.fillText('J. Daniel', 20, 65); return c.toDataURL('image/png').split(',')[1]; });
  fs.writeFileSync(`${S}/firma-test.png`, Buffer.from(sigPng, 'base64'));
  fs.writeFileSync(`${S}/no-es-imagen.txt`, 'hola');
  await pg.$eval('[data-click="setSignatureMode"][data-arg="upload"]', el => el.click());
  const input = await pg.$('#signature-file');
  await input.uploadFile(`${S}/firma-test.png`);
  await sleep(600);
  const upload = await pg.evaluate(() => new Promise(res => {
    const img = new Image();
    img.onload = () => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); res({ cornerAlpha: x.getImageData(2, 2, 1, 1).data[3], w: img.width }); };
    img.src = document.getElementById('doc-signature-img').src;
  }));
  check('Subir PNG: fondo blanco se vuelve transparente', upload.cornerAlpha === 0, JSON.stringify(upload));
  await input.uploadFile(`${S}/no-es-imagen.txt`);
  await sleep(300);
  check('Rechaza archivos que no son imagen', /Formato no soportado/.test(await pg.$eval('#toast-notification', el => el.textContent)));

  // --- Signature: typed
  await pg.$eval('[data-click="setSignatureMode"][data-arg="type"]', el => el.click());
  await pg.type('#signature-typed-name', 'José Daniel');
  await pg.$eval('[data-click="setTypedSignatureStyle"][data-arg="2"]', el => el.click());
  await sleep(700);
  const typed = await pg.evaluate(() => ({ src: document.getElementById('doc-signature-img').src.slice(0, 22), font: document.fonts.check('64px "Great Vibes"') }));
  check('Firma escrita con fuente tipo firma', typed.src === 'data:image/png;base64,' && typed.font, JSON.stringify(typed));
  await pg.$eval('[data-click="clearSignature"]', el => el.click());
  check('Borrar firma limpia la cotización', await pg.evaluate(() => document.getElementById('doc-signature-img').classList.contains('hidden')));
  await pg.screenshot({ path: `${S}/ux2-sig.png` });

  // --- Themes
  const titleColor = () => pg.$eval('#doc-project-title', el => getComputedStyle(el).color + ' | ' + getComputedStyle(el).fontFamily.split(',')[0]);
  const clasico = await titleColor();
  await pg.$eval('[data-click="setDocTheme"][data-arg="moderno"]', el => el.click());
  const moderno = await titleColor();
  check('Diseño Moderno cambia colores y tipografía', clasico !== moderno, `${clasico} → ${moderno}`);
  check('Aviso de diseño PRO visible', await pg.evaluate(() => !document.getElementById('doc-theme-note').classList.contains('hidden')));
  await pg.$eval('#sender-name', el => { el.value = 'Mi Estudio'; });
  await pg.$eval('#client-name', el => { el.value = 'Cliente Prueba'; });
  await pg.evaluate(() => { window.__printed = 0; });
  await pg.$eval('[data-click="exportProposalPDF"]', el => el.click());
  const blocked = await pg.evaluate(() => ({ printed: window.__printed, modal: !document.getElementById('pro-modal').classList.contains('hidden') }));
  check('Diseño PRO no se descarga sin PRO (abre compra)', blocked.printed === 0 && blocked.modal, JSON.stringify(blocked));
  await pg.$eval('[data-click="closeProModal"]', el => el.click());
  await pg.screenshot({ path: `${S}/ux2-moderno.png` });
  for (const t of ['corporativo', 'elegante', 'vibrante']) {
    await pg.$eval(`[data-click="setDocTheme"][data-arg="${t}"]`, el => el.click());
    await pg.$eval('#proposal-document', el => el.scrollIntoView());
    await pg.screenshot({ path: `${S}/ux2-${t}.png` });
  }
  await pg.$eval('[data-click="setDocTheme"][data-arg="minimal"]', el => el.click());
  await pg.$eval('[data-click="exportProposalPDF"]', el => el.click());
  check('Diseño gratis Minimal sí se descarga', await pg.evaluate(() => window.__printed === 1));
  await pg.reload({ waitUntil: 'networkidle0' });
  check('El diseño elegido se recuerda', await pg.$eval('#proposal-document', el => el.dataset.docTheme) === 'minimal');

  // --- Mobile
  const m = await b.newPage();
  await m.evaluateOnNewDocument(() => { try { localStorage.setItem('cotizapro_tour_done_v1', '1'); } catch (_) {} });
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await m.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await sleep(300);
  const fabTop = await m.$eval('#mobile-preview-fab', el => !el.classList.contains('hidden') && getComputedStyle(el).display !== 'none');
  check('Celular: botón "Ver cotización" visible arriba', fabTop);
  await m.$eval('#mobile-preview-fab', el => el.click());
  await sleep(900);
  const fabAfter = await m.evaluate(() => ({ hidden: document.getElementById('mobile-preview-fab').classList.contains('hidden'), docTop: Math.round(document.getElementById('proposal-document').getBoundingClientRect().top) }));
  check('Celular: lleva a la cotización y se oculta', fabAfter.hidden && fabAfter.docTop < 300, JSON.stringify(fabAfter));
  check('Celular: sin desborde horizontal', await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) === 0);
  await m.evaluate(() => window.scrollTo(0, 0));
  await m.screenshot({ path: `${S}/ux2-mobile-top.png` });
  const d = await b.newPage();
  await d.evaluateOnNewDocument(() => { try { localStorage.setItem('cotizapro_tour_done_v1', '1'); } catch (_) {} });
  await d.setViewport({ width: 1440, height: 900 });
  await d.goto(BASE + '/', { waitUntil: 'networkidle0' });
  check('Escritorio: botón flotante oculto', await d.$eval('#mobile-preview-fab', el => getComputedStyle(el).display === 'none'));
  await d.screenshot({ path: `${S}/ux2-desk-top.png` });

  check('Sin errores en consola', errors.length === 0, errors.slice(0, 3).join(' | '));
  await b.close();
  console.log(results.join('\n'));
  process.exit(results.some(r => r.startsWith('FAIL')) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
