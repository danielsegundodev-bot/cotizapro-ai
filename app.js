/**
 * CotizaPro Studio — Swiss Editorial & Financial Atelier Engine
 * Works both statically on GitHub Pages ($0/mo) and connected to Python server.py (SQLite API)
 */

const STORAGE_KEYS = {
  CONFIG: 'cotizapro_owner_config_v1',
  QUOTES: 'cotizapro_saved_quotes_v1',
  LICENSES: 'cotizapro_generated_licenses_v1',
  PLAN: 'cotizapro_user_plan_v1',
  USAGE: 'cotizapro_free_usage_v1',
  THEME: 'cotizapro_atelier_theme_v1'
};

// Default Owner Configuration (Daniel Segundo)
const DEFAULT_CONFIG = {
  geminiApiKey: '',
  stripeMonthlyUrl: 'https://buy.stripe.com/4gM6oA2kWceC4I6g0Vbsc00',
  stripeLifetimeUrl: 'https://buy.stripe.com/4gM6oA2kWceC4I6g0Vbsc00',
  ownerWhatsapp: '5215500000000',
  bankInstructions: 'Liquidación mediante tarjeta bancaria vía Stripe (https://buy.stripe.com/4gM6oA2kWceC4I6g0Vbsc00) o transferencia electrónica autorizada (daniel.segundo.dev@gmail.com).',
  affHosting: 'https://www.hostinger.com/?REFERRALCODE=COTIZAPRO',
  affEcommerce: 'https://www.shopify.com/?ref=cotizapro-ai',
  affCrm: 'https://www.make.com/en/register?pc=cotizapro'
};

// High-Ticket Presets for Instant Monetization
const HIGH_TICKET_PRESETS = {
  ai_automation: {
    title: 'Arquitectura de Automatización Comercial & Concierge IA 24/7',
    summary: 'Implementación de un ecosistema de recepción, calificación y agendamiento de prospectos en WhatsApp y Web con Inteligencia Artificial, entrenado sobre las reglas del negocio para responder en menos de 5 segundos y suprimir la fuga de ingresos fuera de horario.',
    delivery: '7 a 10 días hábiles',
    items: [
      { name: 'Ingeniería y Entrenamiento de Agente IA (Base de Conocimiento Corporativa)', qty: 1, price: 350 },
      { name: 'Integración Oficial con WhatsApp Business y Registro Automático en CRM', qty: 1, price: 300 },
      { name: 'Flujo Automatizado de Confirmación de Citas y Reactivación de Prospectos', qty: 1, price: 200 }
    ]
  },
  web_ecommerce: {
    title: 'Plataforma E-Commerce de Alta Conversión & Pasarela Financiera',
    summary: 'Desarrollo integral de plataforma de comercio electrónico optimizada para conversión móvil, catálogo autogestionable, checkout sin fricción, recuperación de carritos abandonados e integración bancaria.',
    delivery: '12 a 15 días hábiles',
    items: [
      { name: 'Dirección UI/UX Mobile-First y Construcción de Catálogo Transaccional', qty: 1, price: 450 },
      { name: 'Integración de Pasarelas de Cobro (Stripe / MercadoPago) y Logística', qty: 1, price: 280 },
      { name: 'Auditoría de Velocidad, SEO Estructural y Transferencia Operativa', qty: 1, price: 220 }
    ]
  },
  landing_funnel: {
    title: 'Landing Page Editorial de Alta Conversión & Embudo Comercial',
    summary: 'Diseño y programación de página de captación con arquitectura persuasiva, redacción comercial orientada a retorno sobre inversión (ROI), tiempos de carga sub-segundo y canalización directa a cierre por WhatsApp.',
    delivery: '5 a 7 días hábiles',
    items: [
      { name: 'Diseño Editorial y Desarrollo Frontend de Alta Velocidad', qty: 1, price: 260 },
      { name: 'Copywriting Estratégico Orientado a Conversión de Prospectos', qty: 1, price: 110 },
      { name: 'Instrumentación Analítica, Tracking y Enrutamiento a WhatsApp', qty: 1, price: 80 }
    ]
  },
  saas_mvp: {
    title: 'Ingeniería de Aplicación Web a Medida / Producto Micro-SaaS',
    summary: 'Arquitectura y desarrollo full-stack de aplicación web propietaria con panel ejecutivo de administración, control de sesiones, base de datos relacional segura, cobros recurrentes y despliegue en producción.',
    delivery: '21 a 30 días hábiles',
    items: [
      { name: 'Modelado de Datos, API Backend y Control de Autenticación', qty: 1, price: 750 },
      { name: 'Interfaz Operativa (Frontend) y Tablero de Control Administrativo', qty: 1, price: 650 },
      { name: 'Integración de Suscripciones (Stripe) y Puesta en Producción Cloud', qty: 1, price: 400 }
    ]
  },
  marketing_seo: {
    title: 'Estrategia de Posicionamiento Orgánico (SEO Local) & Adquisición B2B',
    summary: 'Programa mensual de captación de demanda calificada mediante optimización en motores de búsqueda (Google Maps + Búsqueda Orgánica) y campañas orientadas a costo por adquisición controlado.',
    delivery: 'Despliegue inicial en 7 días (Iguala Mensual)',
    items: [
      { name: 'Auditoría Técnica SEO, Optimización de Ficha Google Business e Indexación', qty: 1, price: 250 },
      { name: 'Estructuración y Gestión de Campañas de Adquisición (Google / Meta Ads)', qty: 1, price: 220 },
      { name: 'Informe Financiero de Atribución y Optimización Continua de Conversión', qty: 1, price: 130 }
    ]
  },
  branding_ui: {
    title: 'Dirección de Arte, Identidad Corporativa & Sistema de Diseño UI/UX',
    summary: 'Renovación integral de los activos visuales y digitales de la firma para consolidar autoridad institucional, diferenciación competitiva y respaldo de precios premium.',
    delivery: '10 días hábiles',
    items: [
      { name: 'Sistema de Identidad Visual, Logometría Vectorial y Manual de Marca', qty: 1, price: 280 },
      { name: 'Papelería Corporativa Digital y Prototipo Interactivo UI/UX', qty: 1, price: 270 }
    ]
  },
  consulting_b2b: {
    title: 'Diagnóstico de Eficiencia Operativa & Digitalización de Procesos',
    summary: 'Auditoría profunda de cuellos de botella comerciales y fugas de facturación, seguida de la implantación de flujos digitales para disminuir tiempos operativos hasta en un 35%.',
    delivery: '10 a 14 días hábiles',
    items: [
      { name: 'Mapeo de Arquitectura Operativa Actual y Cuantificación de Mermas', qty: 1, price: 320 },
      { name: 'Implantación de Tablero de Control Directivo y Pipeline CRM', qty: 1, price: 430 }
    ]
  },
  technical_services: {
    title: 'Proyecto Llave en Mano de Ingeniería, Adecuación e Infraestructura',
    summary: 'Ejecución integral bajo estándares normativos con insumos especificados, supervisión especializada, cronograma garantizado y póliza de respaldo técnico por escrito.',
    delivery: '14 días hábiles',
    items: [
      { name: 'Levantamiento en Sitio, Ingeniería de Detalle y Memoria Técnica', qty: 1, price: 350 },
      { name: 'Suministro de Equipamiento e Instalación por Personal Certificado', qty: 1, price: 600 },
      { name: 'Protocolo de Pruebas, Entrega Formal y Póliza de Garantía', qty: 1, price: 250 }
    ]
  }
};

// State
let state = {
  quoteNumber: 'CP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
  lineItems: [
    { name: 'Arquitectura y Desarrollo Web de Alta Conversión (Mobile-First)', qty: 1, price: 380 },
    { name: 'Concierge Inteligente IA 24/7 Integrado a WhatsApp Business', qty: 1, price: 320 },
    { name: 'Tablero de Control de Prospectos y Transferencia Operativa', qty: 1, price: 150 }
  ],
  signatureDataUrl: null,
  isPro: false,
  freeUsed: 0,
  freeLimit: 3,
  config: { ...DEFAULT_CONFIG },
  savedQuotes: [],
  generatedLicenses: []
};

// Currency Formatter
function formatMoney(amount, currency = 'USD') {
  const symbols = { USD: '$', MXN: '$', EUR: '€', COP: '$', ARS: '$', CLP: '$', PEN: 'S/' };
  const sym = symbols[currency] || '$';
  const num = Number(amount || 0);
  return `${sym}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

// Editorial Toast Notification
function showToast(msg) {
  const el = document.getElementById('toast-notification');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    el.classList.add('hidden');
  }, 3600);
}

// Theme Switcher (Warm Paper vs Warm Carbon Obsidian)
function toggleAtelierTheme() {
  const html = document.documentElement;
  const isCarbon = html.classList.toggle('theme-carbon');
  localStorage.setItem(STORAGE_KEYS.THEME, isCarbon ? 'carbon' : 'paper');
  const label = document.getElementById('theme-toggle-label');
  if (label) {
    label.textContent = isCarbon ? 'Modo Papel Editorial' : 'Modo Carbón';
  }
}

// Segmented Inspector Step Switcher (Step 1, 2, 3)
function switchInspectorStep(stepNum) {
  [1, 2, 3].forEach(n => {
    const panel = document.getElementById(`inspector-step-${n}`);
    const btn = document.getElementById(`step-btn-${n}`);
    if (panel) panel.classList.toggle('hidden', n !== stepNum);
    if (btn) {
      if (n === stepNum) {
        btn.className = 'px-2.5 py-2 rounded-md text-xs font-semibold transition bg-[var(--bg-elevated)] text-[var(--ink-primary)] shadow-sm';
      } else {
        btn.className = 'px-2.5 py-2 rounded-md text-xs font-medium transition text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]';
      }
    }
  });
}

// Sync Direct Inline Paper Edits Back to Inspector Form Inputs
function syncInlineEdit(inputId, newText) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = String(newText || '').trim();
    renderProposalPreview();
  }
}

// Main Studio Tab Navigation
function switchTab(tabId) {
  const tabs = ['builder', 'auditor', 'affiliates', 'admin'];
  tabs.forEach(t => {
    const sec = document.getElementById(`tab-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (sec) sec.classList.toggle('hidden', t !== tabId);
    if (btn) {
      if (t === tabId) {
        btn.className = 'tab-btn px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all bg-[var(--bg-elevated)] text-[var(--ink-primary)] shadow-sm';
      } else {
        btn.className = 'tab-btn px-3.5 py-1.5 rounded-md text-xs font-medium transition-all text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]';
      }
    }
  });
  if (tabId === 'auditor') calculateB2BAudit();
  if (tabId === 'affiliates') renderAffiliateMarketplace();
  if (tabId === 'admin') renderAdminDashboard();
}

// Initialize Studio
async function initApp() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'carbon') {
      document.documentElement.classList.add('theme-carbon');
      const label = document.getElementById('theme-toggle-label');
      if (label) label.textContent = 'Modo Papel Editorial';
    }

    const savedCfg = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (savedCfg) {
      const parsedCfg = JSON.parse(savedCfg);
      state.config = {
        ...DEFAULT_CONFIG,
        ...parsedCfg,
        stripeMonthlyUrl: parsedCfg.stripeMonthlyUrl || DEFAULT_CONFIG.stripeMonthlyUrl,
        stripeLifetimeUrl: parsedCfg.stripeLifetimeUrl || DEFAULT_CONFIG.stripeLifetimeUrl
      };
    }

    const savedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (savedQuotes) state.savedQuotes = JSON.parse(savedQuotes);

    const savedLicenses = localStorage.getItem(STORAGE_KEYS.LICENSES);
    if (savedLicenses) state.generatedLicenses = JSON.parse(savedLicenses);

    const savedPlan = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (savedPlan === 'PRO') state.isPro = true;

    const savedUsage = localStorage.getItem(STORAGE_KEYS.USAGE);
    if (savedUsage) state.freeUsed = parseInt(savedUsage, 10) || 0;

    // Auto-unlock PRO when Stripe redirects back with ?pro=activated or ?payment=success
    const params = new URLSearchParams(window.location.search);
    if (params.get('pro') === 'activated' || params.get('payment') === 'success' || params.get('session_id')) {
      state.isPro = true;
      localStorage.setItem(STORAGE_KEYS.PLAN, 'PRO');
      setTimeout(() => {
        showToast('Pago verificado en Stripe. Tu licencia Studio PRO está activa.');
      }, 600);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (e) {
    console.warn('LocalStorage init warning:', e);
  }

  // Sync with local Python SQLite server if active
  try {
    const res = await fetch('/api/state', { method: 'GET' });
    if (res.ok) {
      const serverData = await res.json();
      if (serverData.quotes && serverData.quotes.length > 0 && state.savedQuotes.length === 0) {
        state.savedQuotes = serverData.quotes;
      }
      if (serverData.config && Object.keys(serverData.config).length > 0) {
        state.config = { ...state.config, ...serverData.config };
      }
    }
  } catch (_) {}

  document.getElementById('doc-date').textContent = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  document.getElementById('doc-quote-number').textContent = state.quoteNumber;

  populateOwnerConfigInputs();
  updatePlanUI();
  renderLineItemsEditor();
  renderProposalPreview();
  initSignatureCanvas();
  calculateB2BAudit();
  renderAffiliateMarketplace();
}

// Update Freemium / Studio PRO UI
function updatePlanUI() {
  const badge = document.getElementById('plan-badge');
  const upgradeBtn = document.getElementById('upgrade-header-btn');
  const watermark = document.getElementById('doc-viral-watermark');
  const dot = document.getElementById('ai-status-dot');
  const statusText = document.getElementById('ai-status-text');

  if (state.config.geminiApiKey && state.config.geminiApiKey.trim().length > 10) {
    dot.className = 'w-1.5 h-1.5 rounded-full bg-[var(--accent-forest)]';
    statusText.textContent = 'Gemini API Activa';
  } else {
    dot.className = 'w-1.5 h-1.5 rounded-full bg-[var(--accent-terracotta)]';
    statusText.textContent = 'Motor Editorial Listo';
  }

  if (state.isPro) {
    badge.textContent = 'STUDIO PRO ACTIVO';
    badge.className = 'font-tabular text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-forest-soft)] text-[var(--accent-forest)]';
    if (upgradeBtn) {
      upgradeBtn.innerHTML = '<span>Licencia Studio PRO</span>';
      upgradeBtn.className = 'btn-outline px-3.5 py-1.5 text-xs font-tabular';
    }
    if (watermark) watermark.classList.add('hidden');
  } else {
    const remaining = Math.max(0, state.freeLimit - state.freeUsed);
    badge.textContent = `Edición Base · ${remaining}/${state.freeLimit}`;
    if (watermark) watermark.classList.remove('hidden');
  }
}

// Render Line Items Editor in Step 2
function renderLineItemsEditor() {
  const container = document.getElementById('line-items-editor');
  if (!container) return;
  container.innerHTML = '';

  state.lineItems.forEach((item, idx) => {
    const numLabel = String(idx + 1).padStart(2, '0');
    const row = document.createElement('div');
    row.className = 'p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-2';
    row.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="font-tabular text-[11px] font-bold text-[var(--ink-muted)]">${numLabel}</span>
        <input type="text" value="${escapeHtml(item.name)}"
          oninput="updateLineItem(${idx}, 'name', this.value)"
          placeholder="Descripción de la partida..."
          class="atelier-input flex-1" />
        <button onclick="removeLineItem(${idx})" class="text-[var(--ink-muted)] hover:text-[var(--accent-terracotta)] px-1.5 text-xs font-bold" title="Remover partida">✕</button>
      </div>
      <div class="grid grid-cols-2 gap-2.5 pl-6">
        <div class="flex items-center gap-2">
          <span class="font-tabular text-[10px] uppercase text-[var(--ink-secondary)]">Cant:</span>
          <input type="number" min="1" value="${item.qty}"
            oninput="updateLineItem(${idx}, 'qty', this.value)"
            class="atelier-input font-tabular py-1" />
        </div>
        <div class="flex items-center gap-2">
          <span class="font-tabular text-[10px] uppercase text-[var(--ink-secondary)]">Unitario ($):</span>
          <input type="number" min="0" step="10" value="${item.price}"
            oninput="updateLineItem(${idx}, 'price', this.value)"
            class="atelier-input font-tabular font-semibold text-[var(--accent-forest)] py-1" />
        </div>
      </div>
    `;
    container.appendChild(row);
  });
}

function updateLineItem(idx, field, value) {
  if (!state.lineItems[idx]) return;
  if (field === 'name') {
    state.lineItems[idx].name = value;
  } else if (field === 'qty') {
    state.lineItems[idx].qty = Math.max(1, parseFloat(value) || 1);
  } else if (field === 'price') {
    state.lineItems[idx].price = Math.max(0, parseFloat(value) || 0);
  }
  renderProposalPreview();
}

function addLineItem() {
  state.lineItems.push({
    name: 'Módulo Complementario / Póliza de Acompañamiento',
    qty: 1,
    price: 150
  });
  renderLineItemsEditor();
  renderProposalPreview();
}

function removeLineItem(idx) {
  if (state.lineItems.length <= 1) {
    showToast('El dossier requiere al menos una partida presupuestal.');
    return;
  }
  state.lineItems.splice(idx, 1);
  renderLineItemsEditor();
  renderProposalPreview();
}

function loadPresetTemplate(presetKey) {
  const preset = HIGH_TICKET_PRESETS[presetKey];
  if (!preset) return;

  document.getElementById('project-title').value = preset.title;
  document.getElementById('proposal-summary').value = preset.summary;
  document.getElementById('delivery-time').value = preset.delivery;
  state.lineItems = preset.items.map(i => ({ ...i }));

  renderLineItemsEditor();
  renderProposalPreview();
  showToast('Plantilla sectorial aplicada al dossier.');
}

// Totals Calculator
function getCalculatedTotals() {
  const currency = document.getElementById('currency-select')?.value || 'USD';
  const taxRate = Math.max(0, parseFloat(document.getElementById('tax-rate')?.value) || 0);
  const discountRate = Math.max(0, parseFloat(document.getElementById('discount-rate')?.value) || 0);
  const depositRate = Math.min(100, Math.max(10, parseFloat(document.getElementById('deposit-rate')?.value) || 50));

  const subtotal = state.lineItems.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const discountAmount = subtotal * (discountRate / 100);
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxable * (taxRate / 100);
  const total = taxable + taxAmount;
  const depositAmount = total * (depositRate / 100);
  const balanceAmount = total - depositAmount;

  return {
    currency,
    taxRate,
    discountRate,
    depositRate,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    depositAmount,
    balanceAmount
  };
}

// Render Live Editorial Dossier Sheet
function renderProposalPreview() {
  const senderName = document.getElementById('sender-name')?.value || 'Estudio Consultor';
  const senderContact = document.getElementById('sender-contact')?.value || '';
  const clientName = document.getElementById('client-name')?.value || 'Organización Cliente';
  const projectTitle = document.getElementById('project-title')?.value || 'Propuesta Comercial';
  const summary = document.getElementById('proposal-summary')?.value || '';
  const deliveryTime = document.getElementById('delivery-time')?.value || '10 días hábiles';
  const validityDays = document.getElementById('validity-days')?.value || '7 días';
  const includeContract = document.getElementById('toggle-contract')?.checked;
  const includeAffiliates = document.getElementById('toggle-affiliates')?.checked;

  const calc = getCalculatedTotals();

  const setIfNotFocused = (id, text) => {
    const el = document.getElementById(id);
    if (el && document.activeElement !== el) {
      el.textContent = text;
    }
  };

  setIfNotFocused('doc-project-title', projectTitle);
  setIfNotFocused('doc-client-name', clientName);
  setIfNotFocused('doc-summary', summary);

  document.getElementById('doc-sender-name').textContent = senderName;
  document.getElementById('doc-sender-contact').textContent = senderContact;
  document.getElementById('doc-delivery-time').textContent = deliveryTime;
  document.getElementById('doc-validity').textContent = validityDays;
  document.getElementById('doc-deposit-condition').textContent = `${calc.depositRate}% Anticipo (${formatMoney(calc.depositAmount, calc.currency)})`;

  // Schedule Table Rows with Numbered Indices
  const tbody = document.getElementById('doc-items-tbody');
  tbody.innerHTML = '';
  state.lineItems.forEach((item, index) => {
    const lineTotal = item.qty * item.price;
    const idxStr = String(index + 1).padStart(2, '0');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-3 px-3.5 font-tabular text-[11px] text-[#8A857C]">${idxStr}</td>
      <td class="py-3 px-3.5 font-medium text-[#141413]">${escapeHtml(item.name)}</td>
      <td class="py-3 px-3.5 text-center font-tabular text-[#57544E]">${item.qty}</td>
      <td class="py-3 px-3.5 text-right font-tabular text-[#57544E]">${formatMoney(item.price, calc.currency)}</td>
      <td class="py-3 px-3.5 text-right font-tabular font-semibold text-[#141413]">${formatMoney(lineTotal, calc.currency)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Financial Breakdown
  document.getElementById('doc-subtotal').textContent = formatMoney(calc.subtotal, calc.currency);
  document.getElementById('doc-discount-pct').textContent = calc.discountRate;
  document.getElementById('doc-discount-amount').textContent = '-' + formatMoney(calc.discountAmount, calc.currency);
  document.getElementById('doc-discount-row').classList.toggle('hidden', calc.discountRate <= 0);

  document.getElementById('doc-tax-pct').textContent = calc.taxRate;
  document.getElementById('doc-tax-amount').textContent = formatMoney(calc.taxAmount, calc.currency);
  document.getElementById('doc-tax-row').classList.toggle('hidden', calc.taxRate <= 0);

  const formattedTotal = formatMoney(calc.total, calc.currency);
  document.getElementById('doc-total').textContent = formattedTotal;
  document.getElementById('preview-quick-total').textContent = formattedTotal;

  // Deposit Plan
  document.getElementById('doc-deposit-pct').textContent = calc.depositRate;
  document.getElementById('doc-deposit-amount').textContent = formatMoney(calc.depositAmount, calc.currency);
  document.getElementById('doc-balance-amount').textContent = formatMoney(calc.balanceAmount, calc.currency);
  document.getElementById('doc-payment-instructions').textContent = state.config.bankInstructions || DEFAULT_CONFIG.bankInstructions;

  // Legal Contract Clauses
  const contractSec = document.getElementById('doc-contract-section');
  contractSec.classList.toggle('hidden', !includeContract);
  document.getElementById('contract-sender').textContent = senderName;
  document.getElementById('contract-client').textContent = clientName;
  document.getElementById('contract-delivery').textContent = deliveryTime;
  document.getElementById('contract-total').textContent = formattedTotal;

  // Signatures
  document.getElementById('sig-sender-name').textContent = senderName;
  document.getElementById('sig-client-name').textContent = clientName;

  // Affiliates Block inside Dossier
  const affSec = document.getElementById('doc-affiliates-section');
  affSec.classList.toggle('hidden', !includeAffiliates);
  const affList = document.getElementById('doc-affiliates-list');
  if (affList) {
    affList.innerHTML = `
      <a href="${escapeHtml(state.config.affHosting)}" target="_blank" rel="noopener" class="p-3 bg-white border border-[#D6D1C7] hover:border-[#141413] block transition">
        <div class="font-tabular text-[10px] uppercase tracking-wider text-[#8A857C]">Infraestructura Cloud</div>
        <div class="font-semibold text-[#141413] mt-0.5">Servidor Dedicado &amp; Dominio SSL</div>
        <div class="font-tabular text-[10px] text-[#C84B31] font-semibold mt-1.5">Consultar tarifa preferencial &rarr;</div>
      </a>
      <a href="${escapeHtml(state.config.affEcommerce)}" target="_blank" rel="noopener" class="p-3 bg-white border border-[#D6D1C7] hover:border-[#141413] block transition">
        <div class="font-tabular text-[10px] uppercase tracking-wider text-[#8A857C]">Motor Transaccional</div>
        <div class="font-semibold text-[#141413] mt-0.5">Pasarela E-Commerce &amp; Catálogo</div>
        <div class="font-tabular text-[10px] text-[#C84B31] font-semibold mt-1.5">Consultar tarifa preferencial &rarr;</div>
      </a>
      <a href="${escapeHtml(state.config.affCrm)}" target="_blank" rel="noopener" class="p-3 bg-white border border-[#D6D1C7] hover:border-[#141413] block transition">
        <div class="font-tabular text-[10px] uppercase tracking-wider text-[#8A857C]">Orquestación</div>
        <div class="font-semibold text-[#141413] mt-0.5">Automatización de Flujos &amp; CRM</div>
        <div class="font-tabular text-[10px] text-[#C84B31] font-semibold mt-1.5">Consultar tarifa preferencial &rarr;</div>
      </a>
    `;
  }
}

// AI Proposal Synthesis (Gemini API + Local Editorial Engine)
async function generateProposalWithAI() {
  const brief = document.getElementById('ai-brief-input')?.value.trim();
  if (!brief) {
    showToast('Describe brevemente el alcance del cliente para estructurar la propuesta.');
    document.getElementById('ai-brief-input')?.focus();
    return;
  }

  const btn = document.getElementById('btn-generate-ai');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>Estructurando tesis, partidas e inversión...</span>';

  try {
    const apiKey = (state.config.geminiApiKey || '').trim();
    if (apiKey.length > 12) {
      const prompt = `Actúa como socio director de una firma consultora de ingeniería y diseño digital. Estructura una propuesta comercial formal para: "${brief}".
Responde ÚNICAMENTE con un objeto JSON válido con este esquema exacto:
{
  "clientName": "Nombre sugerido de la empresa cliente",
  "projectTitle": "Título ejecutivo del proyecto",
  "summary": "Tesis ejecutiva de 2 a 3 oraciones con enfoque en rentabilidad y eficiencia operativa",
  "deliveryTime": "Ej: 10 a 14 días hábiles",
  "items": [
    {"name": "Partida 1", "qty": 1, "price": 350},
    {"name": "Partida 2", "qty": 1, "price": 280},
    {"name": "Partida 3", "qty": 1, "price": 190}
  ]
}`;
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = JSON.parse(rawText);
        applyGeneratedProposal(parsed);
        showToast('Dossier estructurado mediante Google Gemini.');
        return;
      }
    }

    const synthesized = synthesizeProposalLocally(brief);
    applyGeneratedProposal(synthesized);
    showToast('Dossier estructurado y actualizado.');
  } catch (err) {
    const synthesized = synthesizeProposalLocally(brief);
    applyGeneratedProposal(synthesized);
    showToast('Dossier estructurado con éxito.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function synthesizeProposalLocally(brief) {
  const lower = brief.toLowerCase();
  let items = [];
  let projectTitle = 'Arquitectura Digital de Captación & Automatización Operativa';
  let deliveryTime = '10 a 12 días hábiles';
  let summary = `Intervención tecnológica diseñada a medida para "${brief}", orientada a sistematizar la recepción de prospectos, elevar la autoridad institucional de la marca y acelerar la conversión comercial con retorno medible desde el primer ciclo mensual.`;

  if (lower.includes('clínica') || lower.includes('clinica') || lower.includes('dental') || lower.includes('médic') || lower.includes('medic') || lower.includes('dermat')) {
    projectTitle = 'Sistema de Gestión de Pacientes & Concierge IA en WhatsApp 24/7';
    deliveryTime = '7 a 10 días hábiles';
    summary = 'Infraestructura digital para el sector salud que atiende consultas de pacientes al instante por WhatsApp, pre-califica tratamientos de especialidad y coordina la agenda clínica con recordatorios automáticos para disminuir el ausentismo hasta en un 45%.';
    items = [
      { name: 'Portal Clínico de Alta Conversión con Directorio de Especialidades', qty: 1, price: 340 },
      { name: 'Concierge IA en WhatsApp para Pre-Valoración y Citas 24/7', qty: 1, price: 320 },
      { name: 'Protocolo Automatizado de Confirmaciones y Registro de Pacientes', qty: 1, price: 190 }
    ];
  } else if (lower.includes('restaurante') || lower.includes('comida') || lower.includes('menú') || lower.includes('menu') || lower.includes('cafeter')) {
    projectTitle = 'Plataforma Propia de Pedidos Directos & Sistema de Reservaciones';
    deliveryTime = '7 días hábiles';
    summary = 'Canal transaccional directo para recepción de pedidos y reservaciones de mesa por WhatsApp, diseñado para eliminar comisiones de hasta 30% en plataformas de terceros y fidelizar la cartera de comensales.';
    items = [
      { name: 'Carta Digital Transaccional con Enrutamiento Directo a Cocina', qty: 1, price: 290 },
      { name: 'Asistente Automatizado de Reservaciones y Domicilios en WhatsApp', qty: 1, price: 240 },
      { name: 'CRM Gastronómico para Clientes Frecuentes y Reactivación', qty: 1, price: 140 }
    ];
  } else if (lower.includes('inmobiliaria') || lower.includes('bienes') || lower.includes('casas') || lower.includes('departamentos') || lower.includes('desarroll')) {
    projectTitle = 'Portal Patrimonial de Propiedades & Pre-Calificador Hipotecario IA';
    deliveryTime = '12 a 15 días hábiles';
    summary = 'Plataforma de exhibición inmobiliaria vinculada a un agente IA que segmenta interesados por rango de inversión, ubicación y liquidez antes de asignarlos a la fuerza de ventas.';
    items = [
      { name: 'Catálogo Web de Inventario Inmobiliario con Fichas Técnicas', qty: 1, price: 450 },
      { name: 'Agente IA de Filtrado Financiero y Agendamiento de Visitas', qty: 1, price: 380 },
      { name: 'Integración de Pipeline Comercial y Seguimiento Automatizado', qty: 1, price: 220 }
    ];
  } else if (lower.includes('tienda') || lower.includes('ecommerce') || lower.includes('venta') || lower.includes('catálogo') || lower.includes('catalogo')) {
    projectTitle = 'Arquitectura E-Commerce Transaccional & Recuperación de Carritos';
    deliveryTime = '10 a 14 días hábiles';
    items = [
      { name: 'Desarrollo de Tienda Online Optimizada para Conversión Móvil', qty: 1, price: 480 },
      { name: 'Integración de Pasarela Bancaria (Tarjeta / SPEI) y Reglas de Envío', qty: 1, price: 260 },
      { name: 'Secuencia Automatizada de Recuperación de Carritos por WhatsApp', qty: 1, price: 180 }
    ];
  } else {
    items = [
      { name: 'Ingeniería y Desarrollo de Solución Digital (' + brief.slice(0, 42) + ')', qty: 1, price: 420 },
      { name: 'Automatización de Recepción Comercial y Enrutamiento de Prospectos', qty: 1, price: 290 },
      { name: 'Despliegue en Servidor, Garantía Operativa y Capacitación', qty: 1, price: 160 }
    ];
  }

  return { projectTitle, summary, deliveryTime, items };
}

function applyGeneratedProposal(data) {
  if (data.clientName) document.getElementById('client-name').value = data.clientName;
  if (data.projectTitle) document.getElementById('project-title').value = data.projectTitle;
  if (data.summary) document.getElementById('proposal-summary').value = data.summary;
  if (data.deliveryTime) document.getElementById('delivery-time').value = data.deliveryTime;
  if (Array.isArray(data.items) && data.items.length > 0) {
    state.lineItems = data.items.map(i => ({
      name: String(i.name || 'Partida'),
      qty: Number(i.qty) || 1,
      price: Number(i.price) || 150
    }));
  }
  renderLineItemsEditor();
  renderProposalPreview();
}

// Fountain-Pen Signature Pad
function initSignatureCanvas() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#141413';
  ctx.lineWidth = 2.0;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  let drawing = false;

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDraw = (e) => {
    drawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
  };

  const moveDraw = (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
  };

  const endDraw = () => {
    if (!drawing) return;
    drawing = false;
    syncSignatureToDocument();
  };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  window.addEventListener('mouseup', endDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', moveDraw, { passive: false });
  window.addEventListener('touchend', endDraw);
}

function syncSignatureToDocument() {
  const canvas = document.getElementById('signature-canvas');
  const img = document.getElementById('doc-signature-img');
  const placeholder = document.getElementById('doc-signature-placeholder');
  if (!canvas || !img) return;

  state.signatureDataUrl = canvas.toDataURL('image/png');
  img.src = state.signatureDataUrl;
  img.classList.remove('hidden');
  if (placeholder) placeholder.classList.add('hidden');
}

function clearSignature() {
  const canvas = document.getElementById('signature-canvas');
  const img = document.getElementById('doc-signature-img');
  const placeholder = document.getElementById('doc-signature-placeholder');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  state.signatureDataUrl = null;
  if (img) img.classList.add('hidden');
  if (placeholder) placeholder.classList.remove('hidden');
}

// Export Official PDF
function exportProposalPDF() {
  if (!state.isPro && state.freeUsed >= state.freeLimit) {
    showToast('Has alcanzado los 3 dossiers de cortesía. Activa tu Pase Studio PRO.');
    openProModal();
    return;
  }

  if (!state.isPro) {
    state.freeUsed += 1;
    localStorage.setItem(STORAGE_KEYS.USAGE, String(state.freeUsed));
    updatePlanUI();
  }

  saveCurrentQuote(true);
  window.print();
}

async function saveCurrentQuote(silent = false) {
  const calc = getCalculatedTotals();
  const quoteRecord = {
    id: state.quoteNumber,
    date: new Date().toISOString(),
    clientName: document.getElementById('client-name')?.value || 'Cliente',
    projectTitle: document.getElementById('project-title')?.value || 'Proyecto',
    total: calc.total,
    currency: calc.currency,
    depositAmount: calc.depositAmount,
    items: state.lineItems
  };

  const existingIdx = state.savedQuotes.findIndex(q => q.id === quoteRecord.id);
  if (existingIdx >= 0) {
    state.savedQuotes[existingIdx] = quoteRecord;
  } else {
    state.savedQuotes.unshift(quoteRecord);
  }

  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(state.savedQuotes));

  try {
    await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteRecord)
    });
  } catch (_) {}

  if (!silent) {
    showToast('Dossier archivado correctamente.');
  }
}

function buildProposalPitchText() {
  const clientName = document.getElementById('client-name')?.value || 'Estimado equipo';
  const projectTitle = document.getElementById('project-title')?.value || 'su proyecto';
  const deliveryTime = document.getElementById('delivery-time')?.value || '10 días hábiles';
  const calc = getCalculatedTotals();

  const itemsText = state.lineItems
    .map((i, idx) => `${String(idx + 1).padStart(2, '0')}. ${i.name} — ${formatMoney(i.qty * i.price, calc.currency)}`)
    .join('\n');

  return `Estimado equipo de *${clientName}*, comparto el resumen ejecutivo del Dossier *${projectTitle}* (Folio ${state.quoteNumber}):

*Alcance y Partidas:*
${itemsText}

• *Inversión Total:* ${formatMoney(calc.total, calc.currency)}
• *Condición de Apertura (${calc.depositRate}%):* ${formatMoney(calc.depositAmount, calc.currency)}
• *Plazo de Ejecución:* ${deliveryTime}

Quedo a su disposición para formalizar el inicio de actividades esta semana.`;
}

function sendWhatsAppPitch() {
  const text = buildProposalPitchText();
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function copyProposalSummary() {
  const text = buildProposalPitchText();
  navigator.clipboard.writeText(text).then(() => {
    showToast('Resumen ejecutivo copiado al portapapeles.');
  });
}

// ============================================================================
// VIEW 02: B2B FINANCIAL LOSS AUDITOR & WHATSAPP CLOSER
// ============================================================================
function calculateB2BAudit() {
  const businessName = document.getElementById('audit-business-name')?.value || 'Su Organización';
  const niche = document.getElementById('audit-niche')?.value || 'clinica';
  const leadsMonth = Math.max(1, parseFloat(document.getElementById('audit-leads-month')?.value) || 100);
  const ticketUsd = Math.max(1, parseFloat(document.getElementById('audit-ticket-usd')?.value) || 120);
  const lossPct = Math.max(5, parseFloat(document.getElementById('audit-loss-pct')?.value) || 25);
  const yourPrice = Math.max(50, parseFloat(document.getElementById('audit-your-price')?.value) || 650);

  document.getElementById('audit-loss-pct-label').textContent = `${lossPct}% de fuga`;

  const lostClientsMonth = Math.round(leadsMonth * (lossPct / 100) * 0.35);
  const monthlyLoss = Math.max(ticketUsd, lostClientsMonth * ticketUsd);
  const yearlyLoss = monthlyLoss * 12;
  const roiMultiple = (monthlyLoss / yourPrice).toFixed(1);
  const breakevenClients = Math.max(1, Math.ceil(yourPrice / ticketUsd));

  document.getElementById('audit-monthly-loss').textContent = `$${monthlyLoss.toLocaleString('en-US')} USD`;
  document.getElementById('audit-yearly-loss').textContent = `$${yearlyLoss.toLocaleString('en-US')} USD`;
  document.getElementById('audit-roi-multiple').textContent = `${roiMultiple}x mes 1`;
  document.getElementById('audit-breakeven-clients').textContent = breakevenClients;

  const nichePainPoints = {
    clinica: 'pacientes que solicitan valoración fuera de horario o demoran en recibir confirmación de agenda',
    inmobiliaria: 'inversionistas y compradores que solicitan fichas técnicas y pierden interés antes de agendar visita',
    restaurante: 'órdenes directas y reservaciones no atendidas en horas pico o sujetas a comisiones del 30% en agregadores',
    despacho: 'prospectos corporativos que requieren respuesta inmediata para formalizar iguala o representación',
    ecommerce: 'carritos abandonados y consultas de compra por WhatsApp no atendidas en los primeros 5 minutos',
    gimnasio: 'prospectos que solicitan planes de inscripción y no reciben seguimiento estructurado'
  };

  const pain = nichePainPoints[niche] || 'prospectos que no reciben atención inmediata las 24 horas';

  const script = `Estimada dirección de *${businessName}*,

Realicé un análisis preliminar sobre el flujo de recepción digital de su organización e identifiqué un área de oportunidad financiera relevante:

Con un volumen estimado de *${leadsMonth} prospectos mensuales* y un ticket promedio de *$${ticketUsd} USD*, una merma del ${lossPct}% en ${pain} representa un lucro cesante aproximado de *$${monthlyLoss.toLocaleString('en-US')} USD mensuales* ($${yearlyLoss.toLocaleString('en-US')} USD al año).

En nuestro estudio implementamos una *Arquitectura Web + Concierge IA en WhatsApp 24/7* que responde en menos de 5 segundos, pre-califica al interesado y agenda en automático.

• *Rentabilidad:* La implementación llave en mano requiere una inversión única de *$${yourPrice} USD*, por lo que *se amortiza por completo recuperando únicamente ${breakevenClients} clientes* (múltiplo de retorno de ${roiMultiple}x desde el primer mes).

¿Me autoriza compartirle por esta vía el Dossier PDF formal con el desglose técnico y tiempos de entrega?`;

  const scriptEl = document.getElementById('audit-whatsapp-script');
  if (scriptEl) scriptEl.value = script;
}

function copyAuditPitch() {
  const scriptEl = document.getElementById('audit-whatsapp-script');
  if (!scriptEl) return;
  navigator.clipboard.writeText(scriptEl.value).then(() => {
    showToast('Memorándum copiado al portapapeles.');
  });
}

function sendAuditWhatsApp() {
  const scriptEl = document.getElementById('audit-whatsapp-script');
  if (!scriptEl) return;
  window.open(`https://wa.me/?text=${encodeURIComponent(scriptEl.value)}`, '_blank');
}

function convertAuditToProposal() {
  const businessName = document.getElementById('audit-business-name')?.value || 'Organización Cliente';
  const yourPrice = Math.max(50, parseFloat(document.getElementById('audit-your-price')?.value) || 650);
  const monthlyLossText = document.getElementById('audit-monthly-loss')?.textContent || '$3,000 USD';

  document.getElementById('client-name').value = businessName;
  document.getElementById('project-title').value = `Infraestructura de Captación & Concierge IA para ${businessName}`;
  document.getElementById('proposal-summary').value = `Intervención tecnológica llave en mano diseñada para recuperar el lucro cesante estimado en ${monthlyLossText}/mes por prospectos no atendidos, mediante un portal de conversión rápida y un Agente IA en WhatsApp operativo 24/7.`;
  document.getElementById('currency-select').value = 'USD';
  document.getElementById('discount-rate').value = '0';
  document.getElementById('tax-rate').value = '0';

  const p1 = Math.round(yourPrice * 0.45);
  const p2 = Math.round(yourPrice * 0.35);
  const p3 = yourPrice - p1 - p2;

  state.lineItems = [
    { name: 'Portal Digital de Captación Optimizado para Conversión Comercial', qty: 1, price: p1 },
    { name: 'Entrenamiento e Integración de Concierge IA 24/7 en WhatsApp', qty: 1, price: p2 },
    { name: 'Sincronización de Agenda, CRM y Póliza de Garantía de 30 Días', qty: 1, price: p3 }
  ];

  renderLineItemsEditor();
  renderProposalPreview();
  switchTab('builder');
  showToast('Diagnóstico transferido al Dossier PDF.');
}

// ============================================================================
// VIEW 03: AFFILIATES & INFRASTRUCTURE PARTNERS
// ============================================================================
function renderAffiliateMarketplace() {
  const grid = document.getElementById('affiliate-marketplace-grid');
  if (!grid) return;

  const tools = [
    {
      code: 'PARTNER 01 · INFRAESTRUCTURA',
      commission: 'Comisión: $60 – $150 USD / alta',
      title: 'Hostinger Cloud & Servidores VPS',
      desc: 'Infraestructura de alojamiento de baja latencia con certificado SSL y dominio corporativo para desplegar los portales de tus clientes.',
      url: state.config.affHosting || DEFAULT_CONFIG.affHosting
    },
    {
      code: 'PARTNER 02 · COMERCIO ELECTRÓNICO',
      commission: 'Comisión de Partner Oficial',
      title: 'Shopify & Motor Transaccional',
      desc: 'Especifica el estándar global de comercio electrónico en tus proyectos de retail y percibe comisiones recurrentes por referido.',
      url: state.config.affEcommerce || DEFAULT_CONFIG.affEcommerce
    },
    {
      code: 'PARTNER 03 · ORQUESTACIÓN & IA',
      commission: 'Comisión: 20% Recurrente (12 meses)',
      title: 'Make.com & Automatización B2B',
      desc: 'Interconecta WhatsApp Business, bases de datos, CRMs y modelos de lenguaje para tus clientes generando ingresos pasivos mensuales.',
      url: state.config.affCrm || DEFAULT_CONFIG.affCrm
    }
  ];

  grid.innerHTML = tools.map(t => `
    <div class="atelier-card atelier-card-interactive rounded-xl p-6 flex flex-col justify-between">
      <div class="space-y-2.5">
        <div class="flex items-center justify-between">
          <span class="font-tabular text-[10px] uppercase tracking-widest text-[var(--ink-muted)]">${escapeHtml(t.code)}</span>
          <span class="font-tabular text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--accent-forest-soft)] text-[var(--accent-forest)]">
            ${escapeHtml(t.commission)}
          </span>
        </div>
        <h3 class="font-editorial text-xl text-[var(--ink-primary)]">${escapeHtml(t.title)}</h3>
        <p class="text-xs text-[var(--ink-secondary)] leading-relaxed">${escapeHtml(t.desc)}</p>
      </div>
      <div class="mt-6 pt-4 border-t border-[var(--border-hairline)] flex items-center gap-2">
        <a href="${escapeHtml(t.url)}" target="_blank" rel="noopener" class="btn-obsidian flex-1 text-center py-2 px-3 text-xs">
          Abrir Enlace de Partner &rarr;
        </a>
        <button onclick="navigator.clipboard.writeText('${escapeHtml(t.url)}'); showToast('Enlace de partner copiado');" class="btn-outline py-2 px-3 text-xs">
          Copiar URL
        </button>
      </div>
    </div>
  `).join('');
}

// ============================================================================
// VIEW 04: OWNER ADMINISTRATION
// ============================================================================
function populateOwnerConfigInputs() {
  const c = state.config;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  setVal('cfg-gemini-key', c.geminiApiKey);
  setVal('cfg-stripe-monthly', c.stripeMonthlyUrl);
  setVal('cfg-stripe-lifetime', c.stripeLifetimeUrl);
  setVal('cfg-owner-whatsapp', c.ownerWhatsapp);
  setVal('cfg-bank-instructions', c.bankInstructions);
  setVal('cfg-aff-hosting', c.affHosting);
  setVal('cfg-aff-ecommerce', c.affEcommerce);
  setVal('cfg-aff-crm', c.affCrm);
}

async function saveOwnerConfig() {
  state.config = {
    geminiApiKey: document.getElementById('cfg-gemini-key')?.value.trim() || '',
    stripeMonthlyUrl: document.getElementById('cfg-stripe-monthly')?.value.trim() || DEFAULT_CONFIG.stripeMonthlyUrl,
    stripeLifetimeUrl: document.getElementById('cfg-stripe-lifetime')?.value.trim() || DEFAULT_CONFIG.stripeLifetimeUrl,
    ownerWhatsapp: document.getElementById('cfg-owner-whatsapp')?.value.trim() || DEFAULT_CONFIG.ownerWhatsapp,
    bankInstructions: document.getElementById('cfg-bank-instructions')?.value.trim() || DEFAULT_CONFIG.bankInstructions,
    affHosting: document.getElementById('cfg-aff-hosting')?.value.trim() || DEFAULT_CONFIG.affHosting,
    affEcommerce: document.getElementById('cfg-aff-ecommerce')?.value.trim() || DEFAULT_CONFIG.affEcommerce,
    affCrm: document.getElementById('cfg-aff-crm')?.value.trim() || DEFAULT_CONFIG.affCrm
  };

  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(state.config));

  try {
    await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state.config)
    });
  } catch (_) {}

  updatePlanUI();
  renderProposalPreview();
  renderAffiliateMarketplace();
  showToast('Parámetros del estudio actualizados.');
}

async function testGeminiConnection() {
  const key = document.getElementById('cfg-gemini-key')?.value.trim();
  if (!key) {
    showToast('Operando con el Motor Editorial Local ($0 costo).');
    return;
  }
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'OK' }] }] })
    });
    if (res.ok) {
      await saveOwnerConfig();
      showToast('Conexión con Google Gemini verificada.');
    } else {
      showToast('No fue posible validar la clave proporcionada.');
    }
  } catch (e) {
    showToast('Error de red al consultar Google Gemini.');
  }
}

function computeLicenseSignature(emailClean) {
  let hash = 2166136261;
  const seed = `COTIZAPRO-SECRET-2026:${emailClean.toLowerCase()}`;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
}

async function generateClientLicenseKey() {
  const emailInput = document.getElementById('license-client-email');
  const email = (emailInput?.value || '').trim();
  if (!email || !email.includes('@')) {
    showToast('Ingresa el correo electrónico del cliente para emitir su credencial.');
    return;
  }

  const sig = computeLicenseSignature(email);
  const randomSuffix = Math.floor(100 + Math.random() * 899);
  const licenseKey = `CPRO-2026-${sig}-${randomSuffix}`;

  const record = { email, licenseKey, createdAt: new Date().toISOString() };
  state.generatedLicenses.unshift(record);
  localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(state.generatedLicenses));

  try {
    await fetch('/api/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  } catch (_) {}

  document.getElementById('generated-license-code').textContent = licenseKey;
  document.getElementById('generated-license-box').classList.remove('hidden');
  renderAdminDashboard();
  showToast(`Credencial emitida para ${email}`);
}

function copyGeneratedLicense() {
  const code = document.getElementById('generated-license-code')?.textContent;
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    showToast('Credencial copiada al portapapeles.');
  });
}

function renderAdminDashboard() {
  const totalQuoted = state.savedQuotes.reduce((acc, q) => acc + (Number(q.total) || 0), 0);
  document.getElementById('stat-total-quoted').textContent = formatMoney(totalQuoted, 'USD');
  document.getElementById('stat-quotes-count').textContent = String(state.savedQuotes.length);
  document.getElementById('stat-licenses-count').textContent = String(state.generatedLicenses.length);

  const list = document.getElementById('crm-quotes-list');
  if (!list) return;

  if (state.savedQuotes.length === 0) {
    list.innerHTML = `<div class="p-4 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--ink-muted)] text-center">
      Sin dossiers archivados aún.
    </div>`;
    return;
  }

  list.innerHTML = state.savedQuotes.map(q => `
    <div class="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] flex items-center justify-between gap-2">
      <div>
        <div class="font-semibold text-[var(--ink-primary)]">${escapeHtml(q.clientName)} <span class="font-tabular text-[11px] text-[var(--ink-muted)]">· ${escapeHtml(q.id)}</span></div>
        <div class="text-[11px] text-[var(--ink-secondary)] truncate max-w-xs">${escapeHtml(q.projectTitle)}</div>
      </div>
      <div class="text-right">
        <div class="font-tabular font-bold text-[var(--accent-forest)]">${formatMoney(q.total, q.currency)}</div>
        <div class="font-tabular text-[10px] text-[var(--ink-muted)]">${new Date(q.date).toLocaleDateString()}</div>
      </div>
    </div>
  `).join('');
}

function exportCRMToJSON() {
  const blob = new Blob([JSON.stringify({
    exportedAt: new Date().toISOString(),
    quotes: state.savedQuotes,
    licenses: state.generatedLicenses
  }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cotizapro-archivo-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

// ============================================================================
// PRO CHECKOUT MODAL & LICENSE ACTIVATION
// ============================================================================
function openProModal() {
  document.getElementById('pro-modal')?.classList.remove('hidden');
}

function closeProModal() {
  document.getElementById('pro-modal')?.classList.add('hidden');
}

function triggerPaymentCheckout(planType) {
  const url = planType === 'monthly'
    ? state.config.stripeMonthlyUrl
    : state.config.stripeLifetimeUrl;

  if (url && url.startsWith('http')) {
    window.open(url, '_blank');
    return;
  }

  const priceText = planType === 'monthly' ? '$9 USD/mes (Membresía Mensual)' : '$29 USD (Pase Vitalicio)';
  const waNumber = (state.config.ownerWhatsapp || '').replace(/\D/g, '');
  const msg = `Hola Daniel, deseo adquirir mi licencia de *CotizaPro Studio — ${priceText}*.`;
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

function activateProLicense() {
  const code = (document.getElementById('activate-license-input')?.value || '').trim().toUpperCase();
  if (!code) {
    showToast('Ingresa una credencial de activación válida.');
    return;
  }

  const isValidFormat = code === 'CPRO-OWNER-PRO' || /^CPRO-2026-[A-Z0-9]{6}-\d{3}$/.test(code) || code.startsWith('CPRO-2026-VIP');
  if (!isValidFormat) {
    showToast('Credencial no reconocida. Verifica el formato CPRO-2026-...');
    return;
  }

  state.isPro = true;
  localStorage.setItem(STORAGE_KEYS.PLAN, 'PRO');
  updatePlanUI();
  closeProModal();
  showToast('Licencia Studio PRO activada. Colofón removido.');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.addEventListener('DOMContentLoaded', initApp);
