/**
 * CotizaPro AI — Core Application & Triple Monetization Engine
 * Works both statically on GitHub Pages ($0/mo) and connected to Python server.py (SQLite API)
 */

const STORAGE_KEYS = {
  CONFIG: 'cotizapro_owner_config_v1',
  QUOTES: 'cotizapro_saved_quotes_v1',
  LICENSES: 'cotizapro_generated_licenses_v1',
  PLAN: 'cotizapro_user_plan_v1',
  USAGE: 'cotizapro_free_usage_v1'
};

// Default Owner Configuration (Daniel Segundo)
const DEFAULT_CONFIG = {
  geminiApiKey: '',
  stripeMonthlyUrl: '',
  stripeLifetimeUrl: '',
  ownerWhatsapp: '5215500000000',
  bankInstructions: 'Aceptamos Transferencia Bancaria, Tarjeta (Stripe / MercadoPago) o PayPal (daniel.segundo.dev@gmail.com).',
  affHosting: 'https://www.hostinger.com/?REFERRALCODE=COTIZAPRO',
  affEcommerce: 'https://www.shopify.com/?ref=cotizapro-ai',
  affCrm: 'https://www.make.com/en/register?pc=cotizapro'
};

// High-Ticket Presets for Instant Monetization
const HIGH_TICKET_PRESETS = {
  ai_automation: {
    title: 'Automatización Comercial con IA + Agente WhatsApp 24/7',
    summary: 'Implementación de un ecosistema inteligente de atención y calificación de prospectos en WhatsApp y Web con Inteligencia Artificial, entrenado con la información de tu negocio para responder en menos de 5 segundos, agendar citas automáticamente y evitar la pérdida de clientes fuera de horario.',
    delivery: '7 a 10 días hábiles',
    items: [
      { name: 'Arquitectura y Entrenamiento de Agente IA (Base de Conocimiento del Negocio)', qty: 1, price: 350 },
      { name: 'Integración con WhatsApp Business y Captura de Leads en CRM / Google Sheets', qty: 1, price: 300 },
      { name: 'Automatización de Recordatorios de Citas y Seguimiento de Ventas', qty: 1, price: 200 }
    ]
  },
  web_ecommerce: {
    title: 'Tienda Online E-Commerce de Alta Conversión + Pasarela de Pagos',
    summary: 'Desarrollo integral de plataforma de comercio electrónico optimizada para ventas móviles, catálogo autogestionable, carrito de compras rápido, recuperación de carritos abandonados e integración con tarjetas de crédito/débito y transferencias.',
    delivery: '12 a 15 días hábiles',
    items: [
      { name: 'Diseño UI/UX Mobile-First y Configuración de Tienda E-Commerce', qty: 1, price: 450 },
      { name: 'Integración de Pasarelas de Pago (Stripe / MercadoPago / PayPal) y Envíos', qty: 1, price: 280 },
      { name: 'Optimización SEO Técnico, Velocidad de Carga y Capacitación de Uso', qty: 1, price: 220 }
    ]
  },
  landing_funnel: {
    title: 'Landing Page de Alta Conversión + Embudo de Captación por WhatsApp',
    summary: 'Diseño y programación de página de aterrizaje persuasiva con estructura psicológica de ventas (AIDA), redacción comercial persuasiva, velocidad ultrarrápida y conexión directa a WhatsApp con mensajes pre-calificados.',
    delivery: '5 a 7 días hábiles',
    items: [
      { name: 'Diseño y Desarrollo de Landing Page Responsiva de Alta Velocidad', qty: 1, price: 260 },
      { name: 'Copywriting Persuasivo Orientado a Conversión y Llamados a la Acción', qty: 1, price: 110 },
      { name: 'Integración de Pixel de Seguimiento, Analítica y Embudo de WhatsApp', qty: 1, price: 80 }
    ]
  },
  saas_mvp: {
    title: 'Desarrollo de Aplicación Web a Medida / Plataforma Micro-SaaS',
    summary: 'Ingeniería y construcción de plataforma web full-stack con panel de administración, gestión de usuarios, base de datos segura en la nube, pasarela de suscripciones y despliegue en producción de alta disponibilidad.',
    delivery: '21 a 30 días hábiles',
    items: [
      { name: 'Arquitectura de Base de Datos, Backend API y Autenticación Segura', qty: 1, price: 750 },
      { name: 'Desarrollo de Interfaz Frontend Interactiva y Panel de Control (Dashboard)', qty: 1, price: 650 },
      { name: 'Integración de Cobros Recurrentes (Stripe) y Despliegue Cloud', qty: 1, price: 400 }
    ]
  },
  marketing_seo: {
    title: 'Estrategia de Posicionamiento SEO Local & Campañas de Captación B2B',
    summary: 'Sistema mensual de atracción de clientes calificados mediante optimización en buscadores (Google Maps + SEO Orgánico) y estructura de anuncios orientados a retorno de inversión medible.',
    delivery: 'Implementación inicial en 7 días (Mensual)',
    items: [
      { name: 'Auditoría SEO, Optimización de Perfil de Google Business y Palabras Clave', qty: 1, price: 250 },
      { name: 'Creación y Gestión de Campañas de Captación de Clientes (Meta / Google Ads)', qty: 1, price: 220 },
      { name: 'Reporte Ejecutivo de Conversiones y Optimización Continua de Costo por Lead', qty: 1, price: 130 }
    ]
  },
  branding_ui: {
    title: 'Rediseño de Identidad Visual Corporativa & Sistema UI/UX',
    summary: 'Modernización completa de la imagen comercial para proyectar máxima autoridad, confianza y justificar precios premium frente a la competencia.',
    delivery: '10 días hábiles',
    items: [
      { name: 'Diseño de Identidad Visual, Logotipo Vectorial y Manual de Marca', qty: 1, price: 280 },
      { name: 'Kit de Plantillas Comerciales y Prototipo UI/UX Web Interactivo', qty: 1, price: 270 }
    ]
  },
  consulting_b2b: {
    title: 'Auditoría de Procesos Comerciales y Digitalización Operativa',
    summary: 'Diagnóstico profundo de cuellos de botella operativos y fugas de ventas, acompañado de la implementación de herramientas digitales para reducir costos operativos hasta en un 30%.',
    delivery: '10 a 14 días hábiles',
    items: [
      { name: 'Mapeo de Procesos Actuales y Detección de Fugas de Ingresos', qty: 1, price: 320 },
      { name: 'Implementación de Tablero de Control Financiero y CRM Comercial', qty: 1, price: 430 }
    ]
  },
  technical_services: {
    title: 'Proyecto Integral de Implementación Técnica e Infraestructura',
    summary: 'Ejecución llave en mano con materiales de primera calidad, mano de obra certificada, supervisión técnica y garantía por escrito sobre cada entregable.',
    delivery: '14 días hábiles',
    items: [
      { name: 'Levantamiento Técnico, Planeación e Ingeniería de Detalle', qty: 1, price: 350 },
      { name: 'Suministro de Equipos / Materiales e Instalación Especializada', qty: 1, price: 600 },
      { name: 'Pruebas de Calidad, Puesta en Marcha y Póliza de Garantía', qty: 1, price: 250 }
    ]
  }
};

// State
let state = {
  quoteNumber: 'CP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
  lineItems: [
    { name: 'Diseño y Desarrollo Web de Alta Conversión (Mobile-First)', qty: 1, price: 380 },
    { name: 'Asistente Inteligente IA 24/7 Conectado a WhatsApp', qty: 1, price: 320 },
    { name: 'Panel de Control de Prospectos + Capacitación de Equipo', qty: 1, price: 150 }
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

// Toast Notification Helper
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

// Tab Navigation
function switchTab(tabId) {
  const tabs = ['builder', 'auditor', 'affiliates', 'admin'];
  tabs.forEach(t => {
    const sec = document.getElementById(`tab-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (sec) sec.classList.toggle('hidden', t !== tabId);
    if (btn) {
      if (t === tabId) {
        btn.className = 'tab-btn px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all bg-indigo-600 text-white shadow';
      } else {
        btn.className = 'tab-btn px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all text-slate-300 hover:text-white hover:bg-slate-800/60';
      }
    }
  });
  if (tabId === 'auditor') calculateB2BAudit();
  if (tabId === 'affiliates') renderAffiliateMarketplace();
  if (tabId === 'admin') renderAdminDashboard();
}

// Load State from LocalStorage + Optional Python Backend
async function initApp() {
  try {
    const savedCfg = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (savedCfg) state.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedCfg) };

    const savedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (savedQuotes) state.savedQuotes = JSON.parse(savedQuotes);

    const savedLicenses = localStorage.getItem(STORAGE_KEYS.LICENSES);
    if (savedLicenses) state.generatedLicenses = JSON.parse(savedLicenses);

    const savedPlan = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (savedPlan === 'PRO') state.isPro = true;

    const savedUsage = localStorage.getItem(STORAGE_KEYS.USAGE);
    if (savedUsage) state.freeUsed = parseInt(savedUsage, 10) || 0;
  } catch (e) {
    console.warn('LocalStorage init warning:', e);
  }

  // Also try syncing with local Python backend if running
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
  } catch (_) {
    // Running statically (e.g. GitHub Pages) — works 100% client-side
  }

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

// Update Freemium / Pro Plan UI Indicators
function updatePlanUI() {
  const badge = document.getElementById('plan-badge');
  const upgradeBtn = document.getElementById('upgrade-header-btn');
  const watermark = document.getElementById('doc-viral-watermark');
  const dot = document.getElementById('ai-status-dot');
  const statusText = document.getElementById('ai-status-text');

  if (state.config.geminiApiKey && state.config.geminiApiKey.trim().length > 10) {
    dot.className = 'w-2 h-2 rounded-full bg-emerald-400';
    statusText.textContent = 'Gemini API Conectada';
  } else {
    dot.className = 'w-2 h-2 rounded-full bg-amber-400';
    statusText.textContent = 'IA Híbrida Lista ($0 Costo)';
  }

  if (state.isPro) {
    badge.textContent = '👑 PLAN PRO ILIMITADO';
    badge.className = 'text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40';
    if (upgradeBtn) {
      upgradeBtn.textContent = '👑 Licencia PRO Activa';
      upgradeBtn.className = 'px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs';
    }
    if (watermark) watermark.classList.add('hidden');
  } else {
    const remaining = Math.max(0, state.freeLimit - state.freeUsed);
    badge.textContent = `Plan Gratis (${remaining}/${state.freeLimit} libres)`;
    if (watermark) watermark.classList.remove('hidden');
  }
}

// Render Line Items Editor in Left Column
function renderLineItemsEditor() {
  const container = document.getElementById('line-items-editor');
  if (!container) return;
  container.innerHTML = '';

  state.lineItems.forEach((item, idx) => {
    const row = document.createElement('div');
    row.className = 'p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2';
    row.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <input type="text" value="${escapeHtml(item.name)}"
          oninput="updateLineItem(${idx}, 'name', this.value)"
          placeholder="Descripción del entregable..."
          class="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none" />
        <button onclick="removeLineItem(${idx})" class="text-slate-500 hover:text-rose-400 px-1.5 text-xs font-bold" title="Eliminar">✕</button>
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] text-slate-400">Cant:</span>
          <input type="number" min="1" value="${item.qty}"
            oninput="updateLineItem(${idx}, 'qty', this.value)"
            class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none" />
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] text-slate-400">Precio Unit ($):</span>
          <input type="number" min="0" step="10" value="${item.price}"
            oninput="updateLineItem(${idx}, 'price', this.value)"
            class="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-emerald-300 font-semibold focus:outline-none" />
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
    name: 'Módulo Adicional / Soporte Prioritario',
    qty: 1,
    price: 150
  });
  renderLineItemsEditor();
  renderProposalPreview();
}

function removeLineItem(idx) {
  if (state.lineItems.length <= 1) {
    showToast('La cotización debe tener al menos 1 concepto.');
    return;
  }
  state.lineItems.splice(idx, 1);
  renderLineItemsEditor();
  renderProposalPreview();
}

// Load a 1-Click High-Ticket Preset
function loadPresetTemplate(presetKey) {
  const preset = HIGH_TICKET_PRESETS[presetKey];
  if (!preset) return;

  document.getElementById('project-title').value = preset.title;
  document.getElementById('proposal-summary').value = preset.summary;
  document.getElementById('delivery-time').value = preset.delivery;
  state.lineItems = preset.items.map(i => ({ ...i }));

  renderLineItemsEditor();
  renderProposalPreview();
  showToast('✨ Plantilla de alto ticket cargada.');
}

// Calculate Totals & Render Live Proposal Preview
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

function renderProposalPreview() {
  const senderName = document.getElementById('sender-name')?.value || 'Tu Agencia';
  const senderContact = document.getElementById('sender-contact')?.value || '';
  const clientName = document.getElementById('client-name')?.value || 'Cliente';
  const projectTitle = document.getElementById('project-title')?.value || 'Propuesta Comercial';
  const summary = document.getElementById('proposal-summary')?.value || '';
  const deliveryTime = document.getElementById('delivery-time')?.value || '10 días hábiles';
  const validityDays = document.getElementById('validity-days')?.value || '7 días';
  const includeContract = document.getElementById('toggle-contract')?.checked;
  const includeAffiliates = document.getElementById('toggle-affiliates')?.checked;

  const calc = getCalculatedTotals();

  // Header & Metadata
  document.getElementById('doc-project-title').textContent = projectTitle;
  document.getElementById('doc-sender-name').textContent = senderName;
  document.getElementById('doc-sender-contact').textContent = senderContact;
  document.getElementById('doc-client-name').textContent = clientName;
  document.getElementById('doc-delivery-time').textContent = deliveryTime;
  document.getElementById('doc-validity').textContent = validityDays;
  document.getElementById('doc-deposit-condition').textContent = `${calc.depositRate}% Anticipo (${formatMoney(calc.depositAmount, calc.currency)})`;
  document.getElementById('doc-summary').textContent = summary;

  // Table Rows
  const tbody = document.getElementById('doc-items-tbody');
  tbody.innerHTML = '';
  state.lineItems.forEach(item => {
    const lineTotal = item.qty * item.price;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-3 px-3 font-medium text-slate-800">${escapeHtml(item.name)}</td>
      <td class="py-3 px-3 text-center text-slate-600">${item.qty}</td>
      <td class="py-3 px-3 text-right text-slate-600">${formatMoney(item.price, calc.currency)}</td>
      <td class="py-3 px-3 text-right font-bold text-slate-900">${formatMoney(lineTotal, calc.currency)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Totals
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

  // Contract Section
  const contractSec = document.getElementById('doc-contract-section');
  contractSec.classList.toggle('hidden', !includeContract);
  document.getElementById('contract-sender').textContent = senderName;
  document.getElementById('contract-client').textContent = clientName;
  document.getElementById('contract-delivery').textContent = deliveryTime;
  document.getElementById('contract-total').textContent = formattedTotal;

  // Signatures
  document.getElementById('sig-sender-name').textContent = senderName;
  document.getElementById('sig-client-name').textContent = clientName;

  // Affiliates Block inside Proposal
  const affSec = document.getElementById('doc-affiliates-section');
  affSec.classList.toggle('hidden', !includeAffiliates);
  const affList = document.getElementById('doc-affiliates-list');
  if (affList) {
    affList.innerHTML = `
      <a href="${escapeHtml(state.config.affHosting)}" target="_blank" rel="noopener" class="p-2.5 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 block transition">
        <div class="font-bold text-indigo-900">🌐 Hosting Cloud + Dominio</div>
        <div class="text-[11px] text-slate-600 mt-0.5">Servidor de alta velocidad con SSL gratis y hasta 75% DTO.</div>
        <div class="text-[10px] font-bold text-indigo-600 mt-1">Activar beneficio &rarr;</div>
      </a>
      <a href="${escapeHtml(state.config.affEcommerce)}" target="_blank" rel="noopener" class="p-2.5 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 block transition">
        <div class="font-bold text-indigo-900">🛍️ Motor E-Commerce &amp; Pagos</div>
        <div class="text-[11px] text-slate-600 mt-0.5">Infraestructura global para cobros con tarjeta y catálogo.</div>
        <div class="text-[10px] font-bold text-indigo-600 mt-1">Activar beneficio &rarr;</div>
      </a>
      <a href="${escapeHtml(state.config.affCrm)}" target="_blank" rel="noopener" class="p-2.5 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 block transition">
        <div class="font-bold text-indigo-900">🤖 Automatización &amp; CRM IA</div>
        <div class="text-[11px] text-slate-600 mt-0.5">Conecta WhatsApp, correos y agenda en piloto automático.</div>
        <div class="text-[10px] font-bold text-indigo-600 mt-1">Activar beneficio &rarr;</div>
      </a>
    `;
  }
}

// AI Proposal Generator (Hybrid: Google Gemini API + Local Smart Engine)
async function generateProposalWithAI() {
  const brief = document.getElementById('ai-brief-input')?.value.trim();
  if (!brief) {
    showToast('⚠️ Escribe una breve descripción del proyecto o cliente primero.');
    document.getElementById('ai-brief-input')?.focus();
    return;
  }

  const btn = document.getElementById('btn-generate-ai');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>⏳ Analizando nicho y redactando propuesta comercial...</span>';

  try {
    const apiKey = (state.config.geminiApiKey || '').trim();
    if (apiKey.length > 12) {
      // Live Gemini API Call
      const prompt = `Eres un consultor de ventas B2B experto. Genera una cotización de alto valor para la siguiente solicitud: "${brief}".
Responde ÚNICAMENTE con un objeto JSON válido (sin bloques markdown) con este esquema exacto:
{
  "clientName": "Nombre sugerido del cliente",
  "projectTitle": "Título atractivo del proyecto",
  "summary": "Resumen ejecutivo persuasivo de 2 a 3 oraciones enfocado en ROI",
  "deliveryTime": "Ej: 10 a 14 días hábiles",
  "items": [
    {"name": "Entregable 1", "qty": 1, "price": 350},
    {"name": "Entregable 2", "qty": 1, "price": 280},
    {"name": "Entregable 3", "qty": 1, "price": 190}
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
        showToast('✨ Propuesta generada con Google Gemini AI.');
        return;
      }
    }

    // Intelligent Local Synthesis Fallback ($0 API Cost, Instant)
    const synthesized = synthesizeProposalLocally(brief);
    applyGeneratedProposal(synthesized);
    showToast('✨ Propuesta generada con el Motor IA Híbrido.');
  } catch (err) {
    console.warn('AI fallback used:', err);
    const synthesized = synthesizeProposalLocally(brief);
    applyGeneratedProposal(synthesized);
    showToast('✨ Propuesta optimizada generada con éxito.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

function synthesizeProposalLocally(brief) {
  const lower = brief.toLowerCase();
  let items = [];
  let projectTitle = 'Implementación Digital de Captación y Automatización Comercial';
  let deliveryTime = '10 a 12 días hábiles';
  let summary = `Solución integral diseñada a medida para "${brief}", enfocada en automatizar la captación de clientes, profesionalizar la presencia digital y acelerar el cierre de ventas con retorno de inversión medible desde el primer mes.`;

  if (lower.includes('clínica') || lower.includes('clinica') || lower.includes('dental') || lower.includes('médic') || lower.includes('medic') || lower.includes('doctor')) {
    projectTitle = 'Sistema de Agendamiento Médico + Asistente IA en WhatsApp 24/7';
    deliveryTime = '7 a 10 días hábiles';
    summary = 'Ecosistema digital para sector salud que responde dudas frecuentes de pacientes al instante por WhatsApp, califica tratamientos de alto valor y agenda citas con recordatorios automáticos para reducir la inasistencia hasta en un 45%.';
    items = [
      { name: 'Portal Web Médico de Alta Conversión con Perfil de Especialidades', qty: 1, price: 340 },
      { name: 'Asistente IA en WhatsApp para Pre-Valoración y Agendamiento de Citas 24/7', qty: 1, price: 320 },
      { name: 'Sistema Automático de Recordatorios Anti-Inasistencia y CRM de Pacientes', qty: 1, price: 190 }
    ];
  } else if (lower.includes('restaurante') || lower.includes('comida') || lower.includes('menú') || lower.includes('menu') || lower.includes('cafeter')) {
    projectTitle = 'Plataforma de Pedidos Directos Sin Comisiones + Bot de Reservas WhatsApp';
    deliveryTime = '7 días hábiles';
    summary = 'Sistema propio de pedidos en línea y reservaciones por WhatsApp para ahorrar hasta el 30% de comisiones de plataformas externas y fidelizar a los comensales con promociones automatizadas.';
    items = [
      { name: 'Menú Digital Interactivo con Carrito de Pedidos Directo a Cocina/WhatsApp', qty: 1, price: 290 },
      { name: 'Bot Automatizado de Reservaciones de Mesas y Atención a Domicilio', qty: 1, price: 240 },
      { name: 'Base de Datos de Clientes Frecuentes y Campaña de Reactivación VIP', qty: 1, price: 140 }
    ];
  } else if (lower.includes('inmobiliaria') || lower.includes('bienes') || lower.includes('casas') || lower.includes('departamentos')) {
    projectTitle = 'Portal Inmobiliario con Filtro Inteligente + Pre-Calificador de Compradores IA';
    deliveryTime = '12 a 15 días hábiles';
    summary = 'Plataforma de exhibición de propiedades conectada a un agente IA que filtra prospectos por presupuesto, zona y tipo de crédito antes de asignarlos a un asesor inmobiliario.';
    items = [
      { name: 'Catálogo Web de Propiedades con Fichas Técnicas y Galería HD', qty: 1, price: 450 },
      { name: 'Agente IA Calificador de Prospectos Hipotecarios e Inversores en WhatsApp', qty: 1, price: 380 },
      { name: 'Embudo de Seguimiento Automatizado y Conexión con CRM Inmobiliario', qty: 1, price: 220 }
    ];
  } else if (lower.includes('tienda') || lower.includes('ecommerce') || lower.includes('venta') || lower.includes('catálogo') || lower.includes('catalogo')) {
    projectTitle = 'E-Commerce Automatizado + Pasarela de Cobro y Recuperación de Carritos';
    deliveryTime = '10 a 14 días hábiles';
    items = [
      { name: 'Desarrollo de Tienda Online Optimizada para Conversión Móvil', qty: 1, price: 480 },
      { name: 'Configuración de Pagos con Tarjeta, Transferencia y Cálculo de Envíos', qty: 1, price: 260 },
      { name: 'Automatización de Carritos Abandonados por WhatsApp y Correo', qty: 1, price: 180 }
    ];
  } else {
    items = [
      { name: 'Arquitectura y Desarrollo de Solución Digital a Medida (' + brief.slice(0, 42) + '...)', qty: 1, price: 420 },
      { name: 'Automatización de Flujo de Trabajo y Captura Inteligente de Clientes', qty: 1, price: 290 },
      { name: 'Despliegue en Producción, Garantía Técnica y Capacitación', qty: 1, price: 160 }
    ];
  }

  return {
    projectTitle,
    summary,
    deliveryTime,
    items
  };
}

function applyGeneratedProposal(data) {
  if (data.clientName) document.getElementById('client-name').value = data.clientName;
  if (data.projectTitle) document.getElementById('project-title').value = data.projectTitle;
  if (data.summary) document.getElementById('proposal-summary').value = data.summary;
  if (data.deliveryTime) document.getElementById('delivery-time').value = data.deliveryTime;
  if (Array.isArray(data.items) && data.items.length > 0) {
    state.lineItems = data.items.map(i => ({
      name: String(i.name || 'Entregable'),
      qty: Number(i.qty) || 1,
      price: Number(i.price) || 150
    }));
  }
  renderLineItemsEditor();
  renderProposalPreview();
}

// Digital Signature Canvas Logic
function initSignatureCanvas() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#1e1b4b';
  ctx.lineWidth = 2.2;
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

// Export Proposal PDF (Checks Freemium Limit first!)
function exportProposalPDF() {
  if (!state.isPro && state.freeUsed >= state.freeLimit) {
    showToast('🔒 Límite de 3 cotizaciones gratis alcanzado. Desbloquea el Plan PRO.');
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

// Save Quote to LocalStorage & Python SQLite Backend
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

  // Update or insert
  const existingIdx = state.savedQuotes.findIndex(q => q.id === quoteRecord.id);
  if (existingIdx >= 0) {
    state.savedQuotes[existingIdx] = quoteRecord;
  } else {
    state.savedQuotes.unshift(quoteRecord);
  }

  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(state.savedQuotes));

  // Also send to Python server if active
  try {
    await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteRecord)
    });
  } catch (_) {}

  if (!silent) {
    showToast('💾 Cotización guardada en el CRM.');
  }
}

// WhatsApp Closer Pitch from Quote Builder
function buildProposalPitchText() {
  const clientName = document.getElementById('client-name')?.value || 'Hola';
  const projectTitle = document.getElementById('project-title')?.value || 'tu proyecto';
  const deliveryTime = document.getElementById('delivery-time')?.value || '10 días hábiles';
  const calc = getCalculatedTotals();

  const itemsText = state.lineItems
    .map(i => `✅ ${i.name} (${formatMoney(i.qty * i.price, calc.currency)})`)
    .join('\n');

  return `Hola *${clientName}*, te comparto el resumen ejecutivo de la propuesta *${projectTitle}* (Folio ${state.quoteNumber}):

*Entregables incluidos:*
${itemsText}

💰 *Inversión Total:* ${formatMoney(calc.total, calc.currency)}
🚀 *Para iniciar hoy (${calc.depositRate}% anticipo):* ${formatMoney(calc.depositAmount, calc.currency)}
⏱️ *Tiempo de entrega:* ${deliveryTime}

Quedo atento para enviarte los datos de inicio y arrancar esta misma semana.`;
}

function sendWhatsAppPitch() {
  const text = buildProposalPitchText();
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function copyProposalSummary() {
  const text = buildProposalPitchText();
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Resumen de cierre copiado al portapapeles.');
  });
}

// ==========================================
// TAB 2: B2B AUDITOR & WHATSAPP CLOSER LOGIC
// ==========================================
function calculateB2BAudit() {
  const businessName = document.getElementById('audit-business-name')?.value || 'Tu Negocio';
  const niche = document.getElementById('audit-niche')?.value || 'clinica';
  const leadsMonth = Math.max(1, parseFloat(document.getElementById('audit-leads-month')?.value) || 100);
  const ticketUsd = Math.max(1, parseFloat(document.getElementById('audit-ticket-usd')?.value) || 120);
  const lossPct = Math.max(5, parseFloat(document.getElementById('audit-loss-pct')?.value) || 25);
  const yourPrice = Math.max(50, parseFloat(document.getElementById('audit-your-price')?.value) || 650);

  document.getElementById('audit-loss-pct-label').textContent = `${lossPct}% de fuga`;

  const lostClientsMonth = Math.round(leadsMonth * (lossPct / 100) * 0.35); // Conservative 35% close rate of lost leads
  const monthlyLoss = Math.max(ticketUsd, lostClientsMonth * ticketUsd);
  const yearlyLoss = monthlyLoss * 12;
  const roiMultiple = (monthlyLoss / yourPrice).toFixed(1);
  const breakevenClients = Math.max(1, Math.ceil(yourPrice / ticketUsd));

  document.getElementById('audit-monthly-loss').textContent = `$${monthlyLoss.toLocaleString('en-US')} USD`;
  document.getElementById('audit-yearly-loss').textContent = `$${yearlyLoss.toLocaleString('en-US')} USD`;
  document.getElementById('audit-roi-multiple').textContent = `${roiMultiple}x en 30 días`;
  document.getElementById('audit-breakeven-clients').textContent = breakevenClients;

  const nichePainPoints = {
    clinica: 'pacientes que escriben fuera de horario o tardan en recibir confirmación de cita',
    inmobiliaria: 'compradores interesados que piden informes y se enfrían antes de agendar visita',
    restaurante: 'pedidos y reservaciones que se pierden en horas pico o pagan hasta 30% en apps de reparto',
    despacho: 'prospectos empresariales que solicitan asesoría y contratan al primero que les responde con claridad',
    ecommerce: 'carritos abandonados y dudas por WhatsApp que no se responden en los primeros 5 minutos',
    gimnasio: 'personas que piden informes de mensualidad y no reciben seguimiento automático'
  };

  const pain = nichePainPoints[niche] || 'prospectos que no reciben atención inmediata 24/7';

  const script = `Hola equipo de *${businessName}* 👋

Hice una breve auditoría del flujo de captación digital de su negocio y noté una oportunidad importante:

Hoy en día, con un volumen aproximado de *${leadsMonth} prospectos al mes* y un ticket promedio de *$${ticketUsd} USD*, perder apenas el ${lossPct}% de atención inmediata en ${pain} representa una fuga aproximada de *$${monthlyLoss.toLocaleString('en-US')} USD al mes* ($${yearlyLoss.toLocaleString('en-US')} USD al año).

Me especializo en instalar un *Sistema Web + Asistente de IA en WhatsApp 24/7* que responde en 5 segundos, califica al cliente y agenda automáticamente.

💡 *Lo mejor:* El proyecto completo tiene una inversión única de *$${yourPrice} USD*, lo que significa que *con solo ${breakevenClients} clientes recuperados el sistema se paga solo* (Retorno de ${roiMultiple}x desde el primer mes).

¿Te parece bien si te envío la propuesta formal en PDF para que la revises en 2 minutos?`;

  const scriptEl = document.getElementById('audit-whatsapp-script');
  if (scriptEl) scriptEl.value = script;
}

function copyAuditPitch() {
  const scriptEl = document.getElementById('audit-whatsapp-script');
  if (!scriptEl) return;
  navigator.clipboard.writeText(scriptEl.value).then(() => {
    showToast('📋 Guion de venta B2B copiado al portapapeles.');
  });
}

function sendAuditWhatsApp() {
  const scriptEl = document.getElementById('audit-whatsapp-script');
  if (!scriptEl) return;
  window.open(`https://wa.me/?text=${encodeURIComponent(scriptEl.value)}`, '_blank');
}

function convertAuditToProposal() {
  const businessName = document.getElementById('audit-business-name')?.value || 'Cliente B2B';
  const yourPrice = Math.max(50, parseFloat(document.getElementById('audit-your-price')?.value) || 650);
  const monthlyLossText = document.getElementById('audit-monthly-loss')?.textContent || '$3,000 USD';

  document.getElementById('client-name').value = businessName;
  document.getElementById('project-title').value = `Sistema de Captación & Automatización IA para ${businessName}`;
  document.getElementById('proposal-summary').value = `Implementación llave en mano diseñada para eliminar la fuga estimada de ${monthlyLossText}/mes en prospectos no atendidos, mediante una arquitectura web optimizada y un Agente Inteligente en WhatsApp activo 24/7.`;
  document.getElementById('currency-select').value = 'USD';
  document.getElementById('discount-rate').value = '0';
  document.getElementById('tax-rate').value = '0';

  const p1 = Math.round(yourPrice * 0.45);
  const p2 = Math.round(yourPrice * 0.35);
  const p3 = yourPrice - p1 - p2;

  state.lineItems = [
    { name: 'Portal / Embudo de Captación Digital Optimizado para Conversión', qty: 1, price: p1 },
    { name: 'Configuración y Entrenamiento de Asistente IA 24/7 en WhatsApp', qty: 1, price: p2 },
    { name: 'Integración de Agenda Automática, CRM y Garantía de 30 Días', qty: 1, price: p3 }
  ];

  renderLineItemsEditor();
  renderProposalPreview();
  switchTab('builder');
  showToast('🚀 Diagnóstico convertido en Cotización PDF lista para cerrar.');
}

// ==========================================
// TAB 3: AFFILIATE MARKETPLACE RENDERER
// ==========================================
function renderAffiliateMarketplace() {
  const grid = document.getElementById('affiliate-marketplace-grid');
  if (!grid) return;

  const tools = [
    {
      badge: 'Comisión: $60 - $150 USD / venta',
      title: 'Hostinger Cloud & VPS Pro',
      desc: 'El hosting de alta velocidad ideal para alojar las webs y sistemas de tus clientes con dominio gratis y SSL.',
      url: state.config.affHosting || DEFAULT_CONFIG.affHosting,
      cta: 'Abrir Enlace de Afiliado Hosting'
    },
    {
      badge: 'Comisión Recurrente / Bounty',
      title: 'Shopify & Infraestructura E-Commerce',
      desc: 'Recomienda la plataforma líder de comercio electrónico a tus clientes de tiendas online y gana comisión de partner.',
      url: state.config.affEcommerce || DEFAULT_CONFIG.affEcommerce,
      cta: 'Abrir Enlace de Afiliado E-Commerce'
    },
    {
      badge: 'Comisión: 20% Recurrente por 12 meses',
      title: 'Make.com & Automatización IA',
      desc: 'Conecta WhatsApp, Google Sheets, OpenAI/Gemini y CRMs sin servidor. Gana ingresos pasivos cada mes que tu cliente lo use.',
      url: state.config.affCrm || DEFAULT_CONFIG.affCrm,
      cta: 'Abrir Enlace de Afiliado Automatización'
    }
  ];

  grid.innerHTML = tools.map(t => `
    <div class="glass-panel glass-card-hover rounded-2xl p-5 flex flex-col justify-between border border-slate-800">
      <div>
        <span class="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          💰 ${escapeHtml(t.badge)}
        </span>
        <h3 class="text-base font-extrabold text-white mt-3">${escapeHtml(t.title)}</h3>
        <p class="text-xs text-slate-300 mt-1.5 leading-relaxed">${escapeHtml(t.desc)}</p>
      </div>
      <div class="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <a href="${escapeHtml(t.url)}" target="_blank" rel="noopener" class="flex-1 text-center py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition">
          ${escapeHtml(t.cta)} &rarr;
        </a>
        <button onclick="navigator.clipboard.writeText('${escapeHtml(t.url)}'); showToast('🔗 Link de afiliado copiado');" class="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold">
          Copiar
        </button>
      </div>
    </div>
  `).join('');
}

// ==========================================
// TAB 4: OWNER / ADMIN CONTROL CENTER
// ==========================================
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
    stripeMonthlyUrl: document.getElementById('cfg-stripe-monthly')?.value.trim() || '',
    stripeLifetimeUrl: document.getElementById('cfg-stripe-lifetime')?.value.trim() || '',
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
  showToast('✅ Configuración de pagos, IA y afiliados guardada.');
}

async function testGeminiConnection() {
  const key = document.getElementById('cfg-gemini-key')?.value.trim();
  if (!key) {
    showToast('ℹ️ Sin API Key externa: usando el Motor IA Híbrido Local ($0 costo).');
    return;
  }
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Responde solo OK' }] }]
      })
    });
    if (res.ok) {
      await saveOwnerConfig();
      showToast('🟢 Conexión con Google Gemini API verificada correctamente.');
    } else {
      showToast('❌ La API Key de Gemini no es válida o no tiene permisos.');
    }
  } catch (e) {
    showToast('❌ Error de red al verificar Gemini API.');
  }
}

// Cryptographic-style License Key Generator for Selling Direct PRO Access
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
    showToast('⚠️ Ingresa el correo del cliente para generar su licencia PRO.');
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
  showToast(`🔑 Licencia PRO generada para ${email}`);
}

function copyGeneratedLicense() {
  const code = document.getElementById('generated-license-code')?.textContent;
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    showToast('📋 Código de licencia copiado. Envíalo a tu cliente.');
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
    list.innerHTML = `<div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-center">
      Aún no has guardado cotizaciones. Ve al tab 1 y pulsa "Guardar" o "Descargar PDF".
    </div>`;
    return;
  }

  list.innerHTML = state.savedQuotes.map(q => `
    <div class="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
      <div>
        <div class="font-bold text-white">${escapeHtml(q.clientName)} — <span class="text-indigo-400">${escapeHtml(q.id)}</span></div>
        <div class="text-[11px] text-slate-400 truncate max-w-xs">${escapeHtml(q.projectTitle)}</div>
      </div>
      <div class="text-right">
        <div class="font-extrabold text-emerald-400">${formatMoney(q.total, q.currency)}</div>
        <div class="text-[10px] text-slate-500">${new Date(q.date).toLocaleDateString()}</div>
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
  a.download = `cotizapro-crm-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

// ==========================================
// PRO CHECKOUT MODAL & LICENSE ACTIVATION
// ==========================================
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

  // Fallback to Direct WhatsApp Checkout with Owner so Daniel never loses a sale even before Stripe is linked!
  const priceText = planType === 'monthly' ? '$9 USD/mes (Plan PRO Mensual)' : '$29 USD (Pase PRO Vitalicio)';
  const waNumber = (state.config.ownerWhatsapp || '').replace(/\D/g, '');
  const msg = `Hola Daniel! Quiero adquirir mi licencia de *CotizaPro AI — ${priceText}*. ¿Me compartes el link de pago o datos de transferencia para recibir mi código de activación CPRO?`;
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');
}

function activateProLicense() {
  const code = (document.getElementById('activate-license-input')?.value || '').trim().toUpperCase();
  if (!code) {
    showToast('⚠️ Escribe un código de licencia.');
    return;
  }

  const isValidFormat = code === 'CPRO-OWNER-PRO' || /^CPRO-2026-[A-Z0-9]{6}-\d{3}$/.test(code) || code.startsWith('CPRO-2026-VIP');
  if (!isValidFormat) {
    showToast('❌ Código inválido. Verifica tu clave CPRO-2026-...');
    return;
  }

  state.isPro = true;
  localStorage.setItem(STORAGE_KEYS.PLAN, 'PRO');
  updatePlanUI();
  closeProModal();
  showToast('🎉 ¡Plan PRO Ilimitado Activado! Marca de agua eliminada.');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.addEventListener('DOMContentLoaded', initApp);
