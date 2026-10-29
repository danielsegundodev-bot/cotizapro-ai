// Blank start, logo upload and guided tour on desktop and phone.
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const [BASE, S] = process.argv.slice(2);
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function walkTour(pg, label) {
  const steps = [];
  for (let i = 0; i < 12; i++) {
    await sleep(600);
    const info = await pg.evaluate(() => {
      const root = document.getElementById('tour-root');
      if (root.classList.contains('hidden')) return null;
      const b = document.getElementById('tour-bubble').getBoundingClientRect();
      const h = document.getElementById('tour-highlight').getBoundingClientRect();
      const step = TOUR_STEPS[tourIndex];
      const t = document.querySelector(step.target).getBoundingClientRect();
      return {
        counter: document.getElementById('tour-counter').textContent,
        title: document.getElementById('tour-title').textContent,
        bubbleInView: b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth,
        targetVisible: t.bottom > 0 && t.top < innerHeight,
        highlightOnTarget: Math.abs(h.left - Math.max(t.left - 6, 8)) < 3
      };
    });
    if (!info) break;
    steps.push(info);
    if (i === 0) await pg.screenshot({ path: `${S}/tour-${label}-1.png` });
    if (i === 4) await pg.screenshot({ path: `${S}/tour-${label}-5.png` });
    await pg.$eval('#tour-next', el => el.click());
  }
  return steps;
}

(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  const errors = [];

  for (const [label, w, h, mobile] of [['desk', 1440, 900, false], ['mobile', 390, 844, true]]) {
    const ctx = await b.createBrowserContext();
    const pg = await ctx.newPage();
    await pg.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`${label}: ${m.text()}`); });
    pg.on('pageerror', e => errors.push(`${label}: ${e.message}`));
    await pg.goto(BASE + '/', { waitUntil: 'networkidle0' });
    await sleep(1000);
    check(`[${label}] Guía aparece sola la primera visita`, await pg.evaluate(() => !document.getElementById('tour-root').classList.contains('hidden')));
    const steps = await walkTour(pg, label);
    check(`[${label}] Recorre los ${steps.length} pasos`, steps.length === 9, steps.map(s => s.counter).join(','));
    check(`[${label}] Burbuja siempre dentro de la pantalla`, steps.every(s => s.bubbleInView), JSON.stringify(steps.filter(s => !s.bubbleInView).map(s => s.title)));
    check(`[${label}] Cada paso muestra su elemento`, steps.every(s => s.targetVisible && s.highlightOnTarget), JSON.stringify(steps.filter(s => !(s.targetVisible && s.highlightOnTarget)).map(s => s.title)));
    check(`[${label}] Al terminar se cierra y no vuelve a aparecer`, await (async () => {
      const closed = await pg.evaluate(() => document.getElementById('tour-root').classList.contains('hidden'));
      await pg.reload({ waitUntil: 'networkidle0' }); await sleep(1100);
      return closed && await pg.evaluate(() => document.getElementById('tour-root').classList.contains('hidden'));
    })());
    await pg.$eval('[data-click="startTour"]', el => el.click());
    await sleep(500);
    const replay = await pg.evaluate(() => !document.getElementById('tour-root').classList.contains('hidden'));
    await pg.keyboard.press('Escape');
    check(`[${label}] Botón "?" repite la guía y Esc la cierra`, replay && await pg.evaluate(() => document.getElementById('tour-root').classList.contains('hidden')));

    if (label === 'desk') {
      // Blank start
      const blank = await pg.evaluate(() => ({
        items: state.lineItems.length, client: document.getElementById('client-name').value, title: document.getElementById('project-title').value,
        sheetTitle: document.getElementById('doc-project-title').textContent.trim(), placeholder: document.getElementById('doc-project-title').classList.contains('doc-placeholder'),
        emptyRow: document.getElementById('doc-items-tbody').textContent.includes('Aquí aparecerán')
      }));
      check('Arranca sin cotización de ejemplo', blank.items === 0 && !blank.client && !blank.title && blank.placeholder && blank.emptyRow, JSON.stringify(blank));
      await pg.evaluateOnNewDocument(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; }; });
      await pg.reload({ waitUntil: 'networkidle0' });
      await pg.$eval('#sender-name', el => { el.value = 'Mi Estudio'; });
      await pg.$eval('[data-click="exportProposalPDF"]', el => el.click());
      const toast = await pg.$eval('#toast-notification', el => el.textContent);
      check('PDF incompleto: avisa qué falta y no imprime', await pg.evaluate(() => !window.__printed) && /cliente/.test(toast) && /concepto/.test(toast), toast);
      // Inline edit of a placeholder doesn't leak into the form
      await pg.$eval('#doc-project-title', el => { el.focus(); el.blur(); });
      check('Editar texto guía no lo copia al formulario', await pg.$eval('#project-title', el => el.value === ''));
      // "Nueva en blanco" after filling
      await pg.$eval('#preset-selector', el => { el.value = 'web_ecommerce'; el.dispatchEvent(new Event('change', { bubbles: true })); });
      await pg.$eval('[data-click="resetNewQuote"]', el => el.click());
      check('"Nueva en blanco" vacía todo', await pg.evaluate(() => state.lineItems.length === 0 && !document.getElementById('project-title').value));

      // Logo upload
      const logoPng = await pg.evaluate(() => { const c = document.createElement('canvas'); c.width = 800; c.height = 300; const x = c.getContext('2d'); x.fillStyle = '#C84B31'; x.fillRect(0, 0, 800, 300); x.fillStyle = '#fff'; x.font = 'bold 120px sans-serif'; x.fillText('LOGO', 160, 200); return c.toDataURL('image/png').split(',')[1]; });
      fs.writeFileSync(`${S}/logo-test.png`, Buffer.from(logoPng, 'base64'));
      await (await pg.$('#logo-file')).uploadFile(`${S}/logo-test.png`);
      await sleep(600);
      const logo = await pg.evaluate(() => ({ doc: !document.getElementById('doc-logo').classList.contains('hidden'), w: document.getElementById('doc-logo').naturalWidth, h: document.getElementById('doc-logo').naturalHeight, thumb: !document.getElementById('sender-logo-preview').classList.contains('hidden') }));
      check('Logo aparece en la hoja y en el formulario (redimensionado)', logo.doc && logo.thumb && logo.w <= 480 && logo.h <= 200, JSON.stringify(logo));
      await pg.reload({ waitUntil: 'networkidle0' });
      check('Logo se recuerda al volver', await pg.evaluate(() => !document.getElementById('doc-logo').classList.contains('hidden')));
      fs.writeFileSync(`${S}/logo.svg`, '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
      await (await pg.$('#logo-file')).uploadFile(`${S}/logo.svg`);
      await sleep(300);
      check('Rechaza SVG (posible script)', /no soportado/.test(await pg.$eval('#toast-notification', el => el.textContent)));
      await pg.evaluate(() => localStorage.setItem('cotizapro_sender_profile_v1', JSON.stringify({ logo: 'https://evil.example/x.png' })));
      await pg.reload({ waitUntil: 'networkidle0' });
      check('Ignora logos que no son imagen local', await pg.evaluate(() => document.getElementById('doc-logo').classList.contains('hidden')));
      await pg.evaluate(() => localStorage.removeItem('cotizapro_sender_profile_v1'));
      await (await pg.$('#logo-file')).uploadFile(`${S}/logo-test.png`);
      await sleep(500);
      await pg.$eval('[data-click="removeLogo"]', el => el.click());
      check('Quitar logo', await pg.evaluate(() => document.getElementById('doc-logo').classList.contains('hidden')));
      await pg.$eval('#proposal-document', el => el.scrollIntoView());
      await pg.screenshot({ path: `${S}/blank-desk.png` });
    }
    await ctx.close();
  }
  check('Sin errores en consola', errors.length === 0, errors.slice(0, 3).join(' | '));
  await b.close();
  console.log(results.join('\n'));
  process.exit(results.some(r => r.startsWith('FAIL')) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
