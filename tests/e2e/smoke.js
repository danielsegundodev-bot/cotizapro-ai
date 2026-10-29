// E2E smoke + XSS test for CotizaPro. Usage: node smoke.js http://127.0.0.1:8765 <ownerPassword>
const puppeteer = require('puppeteer-core');

const BASE = process.argv[2];
const OWNER_PASS = process.argv[3];
const results = [];
const check = (name, ok, extra = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-first-run', '--no-default-browser-check']
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem('cotizapro_tour_done_v1', '1'); } catch (_) {} });
  const consoleErrors = [];
  const xssDialogs = [];
  let promptAnswer = null;

  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push('pageerror: ' + err.message));
  page.on('dialog', async d => {
    if (d.type() === 'prompt' && promptAnswer !== null) {
      await d.accept(promptAnswer);
      promptAnswer = null;
    } else {
      xssDialogs.push(`${d.type()}: ${d.message()}`);
      await d.dismiss();
    }
  });

  // 1. Seed malicious data the way the old server / a tampered localStorage could
  await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    localStorage.setItem('cotizapro_saved_quotes_v1', JSON.stringify([
      { id: "x');alert('xss-id');//", clientName: 'evil', total: 1, items: [] },
      { id: 'CP-2026-0001', clientName: '<img src=x onerror=alert("xss-name")>', projectTitle: '<svg onload=alert(1)>',
        total: 5, currency: '<img src=x onerror=alert("xss-cur")>', items: [{ name: 'a', qty: '1"><img src=x onerror=alert("xss-qty")>', price: 1 }] }
    ]));
    localStorage.setItem('cotizapro_user_plan_v1', 'PRO');
  });
  await page.reload({ waitUntil: 'networkidle0' });

  check('PRO flag in localStorage is ignored', await page.evaluate(() => state.isPro === false));
  check('Malicious quote id dropped on load', await page.evaluate(() => state.savedQuotes.length === 1));

  // 2. Navigation through delegated handlers
  await page.$eval('#tab-btn-history', el => el.click());
  await page.waitForSelector('[data-click="loadSavedQuote"]');
  check('History tab renders via data-click', true);
  await page.$eval('[data-click="loadSavedQuote"]', el => el.click());
  await new Promise(r => setTimeout(r, 300));
  check('Open saved quote (malicious qty neutralized)', await page.evaluate(() => state.lineItems[0].qty === 0 && !document.querySelector('#line-items-editor img')));

  // 3. Builder interactions
  await page.$eval('[data-click="switchInspectorStep"][data-arg="2"]', el => el.click());
  const before = await page.$$eval('#line-items-editor > div', els => els.length);
  await page.$eval('[data-click="addLineItem"]', el => el.click());
  const after = await page.$$eval('#line-items-editor > div', els => els.length);
  check('Add line item', after === before + 1, `${before} -> ${after}`);

  const nameInput = await page.$('#line-items-editor > div:last-child input[data-field="name"]');
  await nameInput.click({ clickCount: 3 });
  await nameInput.type('Servicio de prueba');
  const priceInput = await page.$('#line-items-editor > div:last-child input[data-field="price"]');
  await priceInput.click({ clickCount: 3 });
  await priceInput.type('250');
  check('Line item input updates preview', await page.evaluate(() => document.getElementById('doc-items-tbody').textContent.includes('Servicio de prueba')));

  await page.$eval('[data-click="removeLineItem"]', el => el.click());
  check('Remove line item', (await page.$$eval('#line-items-editor > div', els => els.length)) === after - 1);

  await page.$eval('[data-click="switchInspectorStep"][data-arg="2"]', el => el.click());
  check('Inspector step switch', await page.evaluate(() => !document.getElementById('step-btn-2').className.includes('text-[var(--ink-secondary)]')));

  await page.$eval('[data-click="switchInspectorStep"][data-arg="1"]', el => el.click());
  await page.$eval('#ai-brief-input', (el, v) => { el.value = v; }, 'pagina web para clinica dental');
  await page.$eval('[data-click="generateProposalWithAI"]', el => el.click());
  await new Promise(r => setTimeout(r, 800));
  check('Generate proposal (local engine fallback)', await page.evaluate(() => document.getElementById('project-title').value.length > 0));

  await page.$eval('[data-click="saveCurrentQuote"]', el => el.click());
  await new Promise(r => setTimeout(r, 400));
  const serverQuotes = await page.evaluate(async () => (await (await fetch('/api/state', { headers: { 'X-Client-Id': getClientId() } })).json()).quotes.length);
  check('Save quote reaches server with client id', serverQuotes >= 1, `${serverQuotes} on server`);

  await page.$eval('#tab-btn-calculator', el => el.click());
  await page.$eval('[data-click="convertAuditToProposal"]', el => el.click());
  check('Calculator -> proposal', await page.evaluate(() => state.lineItems.length === 3));

  // 4. Theme toggle + PRO modal
  await page.$eval('[data-click="toggleAtelierTheme"]', el => el.click());
  check('Theme toggle', await page.evaluate(() => document.documentElement.classList.contains('theme-carbon')));
  await page.$eval('#upgrade-header-btn', el => el.click());
  check('Open PRO modal', await page.evaluate(() => !document.getElementById('pro-modal').classList.contains('hidden')));

  // 5. Forged license is rejected, real one accepted
  await page.$eval('#activate-license-input', (el, v) => { el.value = v; }, 'CPRO-2026-HACKED-1RNU');
  await page.$eval('[data-click="activateProLicense"]', el => el.click());
  await new Promise(r => setTimeout(r, 400));
  check('Forged legacy license rejected', await page.evaluate(() => state.isPro === false));

  // 6. Owner login through prompt, generate a license, activate it
  await page.$eval('[data-click="closeProModal"]', el => el.click());
  promptAnswer = OWNER_PASS;
  await page.$eval('[data-click="promptOwnerAccess"]', el => el.click());
  await page.waitForFunction(() => !document.getElementById('tab-admin').classList.contains('hidden'), { timeout: 3000 }).catch(() => {});
  check('Owner login via server', await page.evaluate(() => !document.getElementById('tab-admin').classList.contains('hidden')));

  await page.$eval('#license-client-email', (el, v) => { el.value = v; }, 'cliente@correo.com');
  await page.$eval('[data-click="generateClientLicenseKey"]', el => el.click());
  await page.waitForFunction(() => /^CPRO-[A-Z2-7]{5}(-[A-Z2-7]{5}){3}$/.test(document.getElementById('generated-license-code').textContent), { timeout: 3000 }).catch(() => {});
  const key = await page.$eval('#generated-license-code', el => el.textContent);
  check('Owner generates server license', /^CPRO-[A-Z2-7]{5}(-[A-Z2-7]{5}){3}$/.test(key), key);

  await page.evaluate(() => { document.getElementById('pro-modal').classList.remove('hidden'); });
  await page.$eval('#activate-license-input', (el, v) => { el.value = v; }, key);
  await page.$eval('[data-click="activateProLicense"]', el => el.click());
  await new Promise(r => setTimeout(r, 500));
  check('Real license activates PRO', await page.evaluate(() => state.isPro === true));

  await page.reload({ waitUntil: 'networkidle0' });
  check('PRO survives reload via server re-verification', await page.evaluate(() => state.isPro === true));

  // 7. Fake Stripe return does not unlock
  const attackerCtx = await browser.createBrowserContext();
  const page2 = await attackerCtx.newPage();
  await page2.evaluateOnNewDocument(() => { try { localStorage.setItem('cotizapro_tour_done_v1', '1'); } catch (_) {} });
  await page2.goto(BASE + '/?session_id=cs_live_AAAAAAAAAAAAAAAAAAAAAAAA', { waitUntil: 'load' });
  await page2.waitForFunction(() => !location.search, { timeout: 5000 });
  await new Promise(r => setTimeout(r, 1000));
  check('Fake ?session_id does not unlock PRO', await page2.evaluate(() => state.isPro === false));

  check('No XSS dialogs fired', xssDialogs.length === 0, xssDialogs.join(' | '));
  const relevantErrors = consoleErrors.filter(e => !/Failed to load resource/.test(e));
  check('No console/CSP errors', relevantErrors.length === 0, relevantErrors.slice(0, 5).join(' | '));

  await browser.close();
  console.log(results.join('\n'));
  process.exit(results.some(r => r.startsWith('FAIL')) ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
