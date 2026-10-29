/**
 * CotizaPro Studio — Plataforma de Cotizaciones Comerciales y Contratos
 * Enfocada 100% en la experiencia del usuario final; Panel de Propietario oculto bajo llave.
 */

const STORAGE_KEYS = {
  CONFIG: 'cotizapro_owner_config_v1',
  QUOTES: 'cotizapro_saved_quotes_v1',
  LICENSES: 'cotizapro_generated_licenses_v1',
  PLAN: 'cotizapro_user_plan_v1',
  LICENSE_KEY: 'cotizapro_license_key_v1',
  CLIENT_ID: 'cotizapro_client_id_v1',
  SENDER: 'cotizapro_sender_profile_v1',
  DOC_THEME: 'cotizapro_doc_theme_v1',
  TOUR_DONE: 'cotizapro_tour_done_v1',
  USAGE: 'cotizapro_free_usage_v1',
  THEME: 'cotizapro_atelier_theme_v1'
};

// Configuración oficial conectada a tus dos productos en Stripe
const DEFAULT_CONFIG = {
  aiEnabled: false,
  stripeMonthlyUrl: 'https://buy.stripe.com/eVq3co9No92q3E2g0Vbsc04',
  stripeLifetimeUrl: 'https://buy.stripe.com/eVq28kaRs92qfmK3e9bsc03',
  ownerWhatsapp: '5215500000000'
};

// Plantillas listas por giro para que cualquier usuario cotice en 10 segundos
const HIGH_TICKET_PRESETS = {
  web_ecommerce: {
    title: 'Desarrollo de Sitio Web & Tienda en Línea',
    summary: 'Diseño y desarrollo completo de plataforma web adaptable a celulares, catálogo de productos/servicios, pasarela de cobro con tarjeta y optimización en buscadores (Google).',
    delivery: '12 a 15 días hábiles',
    items: [
      { name: 'Diseño Web Responsivo (Adaptable a Celular y Computadora)', qty: 1, price: 450 },
      { name: 'Configuración de Catálogo y Pasarela de Pagos en Línea', qty: 1, price: 280 },
      { name: 'Optimización de Velocidad, Dominio, Correo y Capacitación', qty: 1, price: 220 }
    ]
  },
  ai_automation: {
    title: 'Automatización de Atención & Chatbot en WhatsApp 24/7',
    summary: 'Implementación de asistente automático en WhatsApp y sitio web para responder dudas frecuentes al instante, calificar clientes potenciales y agendar citas las 24 horas.',
    delivery: '7 a 10 días hábiles',
    items: [
      { name: 'Configuración y Entrenamiento de Asistente Inteligente', qty: 1, price: 350 },
      { name: 'Conexión con WhatsApp Business y Registro de Clientes', qty: 1, price: 300 },
      { name: 'Automatización de Recordatorios de Citas y Seguimiento', qty: 1, price: 200 }
    ]
  },
  landing_funnel: {
    title: 'Página de Ventas (Landing Page) & Embudo de WhatsApp',
    summary: 'Creación de página de aterrizaje enfocada en convertir visitantes en clientes, con textos persuasivos, botón directo a WhatsApp y medición de resultados.',
    delivery: '5 a 7 días hábiles',
    items: [
      { name: 'Diseño y Programación de Landing Page de Alta Conversión', qty: 1, price: 260 },
      { name: 'Redacción Comercial Persuasiva de Servicios y Beneficios', qty: 1, price: 110 },
      { name: 'Integración con Botón de WhatsApp y Estadísticas', qty: 1, price: 80 }
    ]
  },
  saas_mvp: {
    title: 'Desarrollo de Sistema Web / Aplicación a Medida',
    summary: 'Programación de sistema a medida con acceso de usuarios, base de datos en la nube, panel de control administrativo y reportes.',
    delivery: '21 a 30 días hábiles',
    items: [
      { name: 'Base de Datos, Seguridad e Inicio de Sesión de Usuarios', qty: 1, price: 750 },
      { name: 'Pantallas del Sistema y Panel de Administración', qty: 1, price: 650 },
      { name: 'Instalación en Servidor Cloud, Pruebas y Garantía', qty: 1, price: 400 }
    ]
  },
  marketing_seo: {
    title: 'Manejo de Publicidad Digital & Posicionamiento en Google',
    summary: 'Servicio mensual de captación de clientes mediante campañas publicitarias en redes sociales/Google y mejora de presencia en Google Maps.',
    delivery: 'Inicio en 5 días (Servicio Mensual)',
    items: [
      { name: 'Optimización de Perfil en Google Maps y Buscadores', qty: 1, price: 250 },
      { name: 'Creación y Administración de Campañas de Anuncios', qty: 1, price: 220 },
      { name: 'Reporte Mensual de Prospectos y Resultados', qty: 1, price: 130 }
    ]
  },
  branding_ui: {
    title: 'Diseño de Logotipo, Identidad Corporativa & Manual de Marca',
    summary: 'Creación de imagen visual profesional para proyectar confianza, incluyendo logotipo en alta resolución, paleta de colores, tipografías y papelería digital.',
    delivery: '8 a 10 días hábiles',
    items: [
      { name: 'Diseño de Logotipo Original (3 Propuestas) y Manual de Marca', qty: 1, price: 280 },
      { name: 'Kit de Plantillas para Redes Sociales, Tarjetas y Hoja Membretada', qty: 1, price: 270 }
    ]
  },
  consulting_b2b: {
    title: 'Servicios Profesionales de Consultoría, Asesoría & Gestión',
    summary: 'Diagnóstico especializado, planeación estratégica y acompañamiento profesional para optimizar resultados financieros y operativos.',
    delivery: '10 a 14 días hábiles',
    items: [
      { name: 'Diagnóstico Inicial y Auditoría de Situación Actual', qty: 1, price: 320 },
      { name: 'Plan de Trabajo, Implementación y Entrega de Reporte Final', qty: 1, price: 430 }
    ]
  },
  technical_services: {
    title: 'Proyecto de Remodelación, Instalación & Servicios Técnicos',
    summary: 'Ejecución completa del trabajo con materiales de calidad especificada, mano de obra calificada, supervisión y garantía por escrito.',
    delivery: '14 días hábiles',
    items: [
      { name: 'Levantamiento Técnico, Planeación y Presupuesto de Materiales', qty: 1, price: 350 },
      { name: 'Suministro de Materiales e Instalación Especializada', qty: 1, price: 600 },
      { name: 'Pruebas de Funcionamiento, Limpieza y Garantía por Escrito', qty: 1, price: 250 }
    ]
  }
};

// Estado de la Aplicación
let state = {
  quoteNumber: 'CP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
  // La página arranca en blanco: nada de cotizaciones de ejemplo que confundan al visitante
  lineItems: [],
  signatureDataUrl: null,
  isPro: false,
  freeUsed: 0,
  freeLimit: 3,
  config: { ...DEFAULT_CONFIG },
  savedQuotes: [],
  generatedLicenses: []
};

// Las plantillas y el generador local tienen precios base en USD; se convierten a la moneda elegida
// con un tipo de cambio aproximado y se redondean a cifras "de cotización".
const CURRENCY_ROUNDING = {
  USD: { rate: 1, step: 10 },
  MXN: { rate: 18, step: 50 },
  EUR: { rate: 0.92, step: 10 },
  COP: { rate: 4000, step: 10000 },
  ARS: { rate: 1000, step: 1000 },
  CLP: { rate: 900, step: 1000 },
  PEN: { rate: 3.7, step: 10 }
};

function currentCurrency() {
  return document.getElementById('currency-select')?.value || 'MXN';
}

function localizeBasePrice(usdAmount, currency = currentCurrency()) {
  const conf = CURRENCY_ROUNDING[currency] || CURRENCY_ROUNDING.USD;
  return Math.max(conf.step, Math.round((usdAmount * conf.rate) / conf.step) * conf.step);
}

function localizeItems(items) {
  return items.map(i => ({ ...i, price: localizeBasePrice(i.price) }));
}

function formatMoney(amount, currency = 'USD') {
  const symbols = { USD: '$', MXN: '$', EUR: '€', COP: '$', ARS: '$', CLP: '$', PEN: 'S/' };
  const code = Object.prototype.hasOwnProperty.call(symbols, currency) ? currency : 'USD';
  const num = safeNumber(amount);
  return `${symbols[code]}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${code}`;
}

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

// Datos de localStorage o del servidor son no confiables: se normalizan antes de usarse
function normalizeQuote(q) {
  if (!q || typeof q !== 'object') return null;
  const text = (v, max) => (typeof v === 'string' || typeof v === 'number' ? String(v).slice(0, max) : '');
  const id = text(q.id, 40);
  if (!/^[A-Za-z0-9-]{1,40}$/.test(id)) return null;
  return {
    ...q,
    id,
    date: text(q.date, 40),
    clientName: text(q.clientName, 120),
    projectTitle: text(q.projectTitle, 180),
    total: safeNumber(q.total),
    depositAmount: safeNumber(q.depositAmount),
    currency: text(q.currency, 10),
    items: Array.isArray(q.items)
      ? q.items.slice(0, 50).filter(i => i && typeof i === 'object').map(i => ({
          name: text(i.name, 200),
          qty: safeNumber(i.qty),
          price: safeNumber(i.price)
        }))
      : []
  };
}

function normalizeQuotes(list) {
  return Array.isArray(list) ? list.map(normalizeQuote).filter(Boolean) : [];
}

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

function toggleAtelierTheme() {
  const html = document.documentElement;
  const isCarbon = html.classList.toggle('theme-carbon');
  localStorage.setItem(STORAGE_KEYS.THEME, isCarbon ? 'carbon' : 'paper');
  const label = document.getElementById('theme-toggle-label');
  if (label) {
    label.textContent = isCarbon ? 'Modo Papel' : 'Modo Carbón';
  }
}

function switchInspectorStep(stepNum) {
  if (stepNum === 3) requestAnimationFrame(sizeSignatureCanvas);
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

function syncInlineEdit(inputId, newText) {
  const input = document.getElementById(inputId);
  if (input) {
    const text = String(newText || '').trim();
    input.value = Object.values(DOC_PLACEHOLDERS).includes(text) ? '' : text;
    renderProposalPreview();
  }
}

function switchTab(tabId) {
  const tabs = ['builder', 'history', 'calculator', 'admin'];
  tabs.forEach(t => {
    const sec = document.getElementById(`tab-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (sec) sec.classList.toggle('hidden', t !== tabId);
    if (btn && !btn.classList.contains('hidden')) {
      if (t === tabId) {
        btn.className = 'tab-btn px-2 sm:px-4 py-1.5 rounded-md text-xs font-semibold transition-all bg-[var(--bg-elevated)] text-[var(--ink-primary)] shadow-sm flex items-center justify-center gap-1.5';
      } else {
        btn.className = 'tab-btn px-2 sm:px-4 py-1.5 rounded-md text-xs font-medium transition-all text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] flex items-center justify-center gap-1.5';
      }
    }
  });
  if (tabId === 'history') renderCustomerQuotesHistory();
  if (tabId === 'calculator') calculateB2BAudit();
}

// Identificador aleatorio (128 bits) de este navegador: el servidor solo devuelve sus propias cotizaciones
function getClientId() {
  let id = localStorage.getItem(STORAGE_KEYS.CLIENT_ID) || '';
  if (!/^[a-f0-9]{32}$/.test(id)) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    id = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(STORAGE_KEYS.CLIENT_ID, id);
  }
  return id;
}

function clientApiHeaders() {
  return { 'Content-Type': 'application/json', 'X-Client-Id': getClientId() };
}

// Acceso Privado para el Propietario (verificado en el servidor; la clave nunca vive en el código)
let ownerSessionToken = '';

function ownerAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ownerSessionToken}`
  };
}

async function promptOwnerAccess() {
  const pass = window.prompt('Ingresa tu clave de propietario para abrir la configuración interna:');
  if (!pass) return;
  try {
    const res = await fetch('/api/owner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass.trim() })
    });
    if (res.status === 429) {
      showToast('Demasiados intentos. Espera unos minutos.');
      return;
    }
    if (!res.ok) {
      showToast('Credencial de propietario inválida.');
      return;
    }
    const data = await res.json();
    ownerSessionToken = data.token;
    await loadOwnerConfig();
    document.getElementById('tab-btn-admin')?.classList.remove('hidden');
    switchTab('admin');
    showToast('Modo Propietario verificado y desbloqueado.');
  } catch (_) {
    showToast('El panel de propietario requiere el servidor de CotizaPro.');
  }
}

async function loadOwnerConfig() {
  const res = await fetch('/api/owner/config', { headers: ownerAuthHeaders() });
  if (!res.ok) return;
  const data = await res.json();
  state.config = { ...state.config, ...data.config };
  populateOwnerConfigInputs();
  const keyInput = document.getElementById('cfg-gemini-key');
  if (keyInput) keyInput.placeholder = data.config.geminiConfigured ? '•••••••• (configurada, escribe para reemplazar)' : 'AIzaSy...';
}

async function initApp() {
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme === 'carbon') {
      document.documentElement.classList.add('theme-carbon');
      const label = document.getElementById('theme-toggle-label');
      if (label) label.textContent = 'Modo Papel';
    }

    const savedCfg = localStorage.getItem(STORAGE_KEYS.CONFIG);
    if (savedCfg) {
      const parsedCfg = JSON.parse(savedCfg);
      // Versiones anteriores guardaban la API key de Gemini en el navegador: se elimina.
      // Los links de pago cacheados se ignoran: solo valen los de este código o los del servidor,
      // así un link viejo (sin redirección de vuelta a la app) nunca se reutiliza.
      delete parsedCfg.geminiApiKey;
      delete parsedCfg.stripeMonthlyUrl;
      delete parsedCfg.stripeLifetimeUrl;
      state.config = { ...DEFAULT_CONFIG, ...parsedCfg };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(state.config));
    }

    const savedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (savedQuotes) state.savedQuotes = normalizeQuotes(JSON.parse(savedQuotes));

    // El plan PRO ya no se confía desde localStorage: se verifica la licencia en el servidor.
    // Las licencias legadas (CPRO-2026-...) eran falsificables y dejan de ser válidas.
    localStorage.removeItem(STORAGE_KEYS.PLAN);
    localStorage.removeItem(STORAGE_KEYS.LICENSES);

    const savedUsage = localStorage.getItem(STORAGE_KEYS.USAGE);
    if (savedUsage) state.freeUsed = parseInt(savedUsage, 10) || 0;

    const params = new URLSearchParams(window.location.search);
    // Si se solicita ?admin=1 se pide verificación criptográfica de propietario
    if (params.get('admin')) {
      setTimeout(() => promptOwnerAccess(), 300);
    }

    // Al regresar de Stripe, el servidor confirma el pago con la API de Stripe y emite la licencia
    const sessionId = params.get('session_id') || '';
    state.skipAutoTour = Boolean(sessionId || params.get('admin'));
    if (sessionId) {
      window.history.replaceState({}, document.title, window.location.pathname);
      await redeemStripeSession(sessionId);
    } else {
      await verifyStoredLicense();
    }
  } catch (e) {
    console.warn('Init warning:', e);
  }

  try {
    const res = await fetch('/api/state', { method: 'GET', headers: { 'X-Client-Id': getClientId() } });
    if (res.ok) {
      const serverData = await res.json();
      if (serverData.quotes && serverData.quotes.length > 0 && state.savedQuotes.length === 0) {
        state.savedQuotes = normalizeQuotes(serverData.quotes);
      }
      if (serverData.config && Object.keys(serverData.config).length > 0) {
        const { stripeMonthlyUrl, stripeLifetimeUrl, aiEnabled } = serverData.config;
        state.config = {
          ...state.config,
          ...(stripeMonthlyUrl ? { stripeMonthlyUrl } : {}),
          ...(stripeLifetimeUrl ? { stripeLifetimeUrl } : {}),
          aiEnabled: aiEnabled === true
        };
      }
    }
  } catch (_) {}

  document.getElementById('doc-date').textContent = new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  document.getElementById('doc-quote-number').textContent = state.quoteNumber;

  loadSenderProfile();
  loadDocTheme();
  setSignatureMode('draw');
  initMobilePreviewShortcut();
  maybeStartFirstVisitTour(state.skipAutoTour);
  populateOwnerConfigInputs();
  updatePlanUI();
  updateQuotesCounter();
  renderLineItemsEditor();
  renderProposalPreview();
  initSignatureCanvas();
  calculateB2BAudit();
}

function updateQuotesCounter() {
  const counter = document.getElementById('nav-quotes-counter');
  if (counter) counter.textContent = String(state.savedQuotes.length);
}

function updatePlanUI() {
  renderThemePicker();
  const badge = document.getElementById('plan-badge');
  const upgradeBtn = document.getElementById('upgrade-header-btn');
  const proActivePill = document.getElementById('pro-active-pill');
  const watermark = document.getElementById('doc-viral-watermark');
  const statusText = document.getElementById('ai-status-text');

  if (statusText) {
    statusText.textContent = state.config.aiEnabled
      ? 'IA Gemini'
      : 'Asistente rápido';
  }

  if (state.isPro) {
    if (badge) {
      badge.textContent = 'CUENTA PRO ILIMITADA';
      badge.className = 'hidden min-[1400px]:inline whitespace-nowrap font-tabular text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-forest-soft)] text-[var(--accent-forest)]';
    }
    // Ocultar por completo el botón de "Obtener PRO Ilimitado" y mostrar la insignia fija de PRO Activo
    if (upgradeBtn) {
      upgradeBtn.classList.add('hidden');
      upgradeBtn.style.display = 'none';
    }
    if (proActivePill) {
      proActivePill.classList.remove('hidden');
      proActivePill.style.display = 'inline-flex';
    }
    // Ocultar por completo la marca de agua y el link de "Quitar marca de agua con Pase PRO"
    if (watermark) {
      watermark.classList.add('hidden');
      watermark.style.display = 'none';
    }
  } else {
    const remaining = Math.max(0, state.freeLimit - state.freeUsed);
    if (badge) {
      badge.textContent = `${remaining} de ${state.freeLimit} Cotizaciones Gratis`;
    }
    if (upgradeBtn) {
      upgradeBtn.classList.remove('hidden');
      upgradeBtn.style.display = 'inline-flex';
    }
    if (proActivePill) {
      proActivePill.classList.add('hidden');
      proActivePill.style.display = 'none';
    }
    if (watermark) {
      watermark.classList.remove('hidden');
      watermark.style.display = 'flex';
    }
  }
}

function resetNewQuote() {
  state.quoteNumber = 'CP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  document.getElementById('doc-quote-number').textContent = state.quoteNumber;
  ['client-name', 'project-title', 'proposal-summary', 'delivery-time', 'ai-brief-input'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('preset-selector').value = '';
  document.getElementById('ai-result')?.classList.add('hidden');
  state.lineItems = [];
  renderLineItemsEditor();
  renderProposalPreview();
  switchInspectorStep(1);
  showToast('Nueva cotización en blanco lista para llenar.');
}

function renderLineItemsEditor() {
  const container = document.getElementById('line-items-editor');
  if (!container) return;
  container.innerHTML = '';
  if (state.lineItems.length === 0) {
    container.innerHTML = `<p class="text-xs text-[var(--ink-muted)] text-center py-6 px-3 rounded-lg border border-dashed border-[var(--border-hairline)]">Aún no tienes conceptos. Pulsa <strong>+ Agregar Concepto</strong>, usa la IA del paso 1 o elige una plantilla.</p>`;
    return;
  }

  state.lineItems.forEach((item, idx) => {
    const numLabel = String(idx + 1).padStart(2, '0');
    const row = document.createElement('div');
    row.className = 'p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-2';
    row.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <span class="font-tabular text-[11px] font-bold text-[var(--ink-muted)]">${numLabel}</span>
        <input type="text" value="${escapeHtml(item.name)}"
          data-input="updateLineItem" data-idx="${idx}" data-field="name"
          placeholder="Nombre del servicio o producto..."
          class="atelier-input flex-1" />
        <button data-click="removeLineItem" data-idx="${idx}" class="text-[var(--ink-muted)] hover:text-[var(--accent-terracotta)] px-1.5 text-xs font-bold" title="Eliminar">✕</button>
      </div>
      <div class="grid grid-cols-2 gap-2.5 pl-6">
        <div class="flex items-center gap-2">
          <span class="font-tabular text-[10px] uppercase text-[var(--ink-secondary)]">Cant:</span>
          <input type="number" min="1" value="${safeNumber(item.qty)}"
            data-input="updateLineItem" data-idx="${idx}" data-field="qty"
            class="atelier-input font-tabular py-1" />
        </div>
        <div class="flex items-center gap-2">
          <span class="font-tabular text-[10px] uppercase text-[var(--ink-secondary)]">Precio ($):</span>
          <input type="number" min="0" step="10" value="${safeNumber(item.price)}"
            data-input="updateLineItem" data-idx="${idx}" data-field="price"
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
    name: 'Servicio o Entregable Adicional',
    qty: 1,
    price: 150
  });
  renderLineItemsEditor();
  renderProposalPreview();
}

function removeLineItem(idx) {
  if (state.lineItems.length <= 1) {
    showToast('La cotización debe incluir al menos un concepto.');
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
  state.lineItems = localizeItems(preset.items);
  clearExampleClient();

  renderLineItemsEditor();
  renderProposalPreview();
  flashUpdated(['doc-project-title', 'doc-summary', 'doc-items-tbody']);
  showToast('Plantilla cargada en tu cotización.');
}

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

// Textos guía que muestra la hoja mientras el usuario no llena un campo (se ven en gris)
const DOC_PLACEHOLDERS = {
  'doc-project-title': 'Título de tu cotización',
  'doc-client-name': 'Nombre de tu cliente',
  'doc-summary': 'Describe aquí el alcance del trabajo: qué incluye, cómo se entrega y qué beneficios obtiene tu cliente.',
  'doc-sender-name': 'Tu Empresa',
  'doc-sender-contact': 'tu@correo.com',
  'doc-delivery-time': 'Por definir'
};

function setDocText(id, value, { respectFocus = false } = {}) {
  const el = document.getElementById(id);
  if (!el || (respectFocus && document.activeElement === el)) return;
  const text = String(value || '').trim();
  el.textContent = text || DOC_PLACEHOLDERS[id] || '';
  el.classList.toggle('doc-placeholder', !text);
}

function renderProposalPreview() {
  const senderName = document.getElementById('sender-name')?.value.trim() || DOC_PLACEHOLDERS['doc-sender-name'];
  const senderContact = document.getElementById('sender-contact')?.value.trim() || '';
  const clientName = document.getElementById('client-name')?.value.trim() || '';
  const projectTitle = document.getElementById('project-title')?.value.trim() || '';
  const summary = document.getElementById('proposal-summary')?.value || '';
  const deliveryTime = document.getElementById('delivery-time')?.value.trim() || '';
  const validityDays = document.getElementById('validity-days')?.value || '7 días';
  const paymentNote = document.getElementById('payment-methods-note')?.value || 'Transferencia bancaria, Tarjeta o PayPal.';
  const includeContract = document.getElementById('toggle-contract')?.checked;

  const calc = getCalculatedTotals();

  setDocText('doc-project-title', projectTitle, { respectFocus: true });
  setDocText('doc-client-name', clientName, { respectFocus: true });
  setDocText('doc-summary', summary, { respectFocus: true });
  setDocText('doc-sender-name', document.getElementById('sender-name')?.value);
  setDocText('doc-sender-contact', senderContact);
  setDocText('doc-delivery-time', deliveryTime);
  document.getElementById('doc-validity').textContent = validityDays;
  document.getElementById('doc-deposit-condition').textContent = `${calc.depositRate}% Anticipo (${formatMoney(calc.depositAmount, calc.currency)})`;

  const tbody = document.getElementById('doc-items-tbody');
  tbody.innerHTML = '';
  if (state.lineItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-6 px-3.5 text-center text-[color:var(--doc-muted)] italic">Aquí aparecerán tus conceptos y precios. Agrégalos en el paso 2, con la IA o con una plantilla.</td></tr>`;
  }
  state.lineItems.forEach((item, index) => {
    const lineTotal = item.qty * item.price;
    const idxStr = String(index + 1).padStart(2, '0');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-3 px-3.5 font-tabular text-[11px] text-[color:var(--doc-muted)]">${idxStr}</td>
      <td class="py-3 px-3.5 font-medium text-[color:var(--doc-ink)]">${escapeHtml(item.name)}</td>
      <td class="py-3 px-3.5 text-center font-tabular text-[color:var(--doc-text-2)]">${safeNumber(item.qty)}</td>
      <td class="py-3 px-3.5 text-right font-tabular text-[color:var(--doc-text-2)]">${formatMoney(item.price, calc.currency)}</td>
      <td class="py-3 px-3.5 text-right font-tabular font-semibold text-[color:var(--doc-ink)]">${formatMoney(lineTotal, calc.currency)}</td>
    `;
    tbody.appendChild(tr);
  });

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

  document.getElementById('doc-deposit-pct').textContent = calc.depositRate;
  document.getElementById('doc-deposit-amount').textContent = formatMoney(calc.depositAmount, calc.currency);
  document.getElementById('doc-balance-amount').textContent = formatMoney(calc.balanceAmount, calc.currency);
  document.getElementById('doc-payment-instructions').textContent = paymentNote;

  const contractSec = document.getElementById('doc-contract-section');
  contractSec.classList.toggle('hidden', !includeContract);
  document.getElementById('contract-sender').textContent = senderName;
  document.getElementById('contract-client').textContent = clientName || 'el Cliente';
  document.getElementById('contract-delivery').textContent = deliveryTime || 'el plazo acordado';
  document.getElementById('contract-total').textContent = formattedTotal;

  document.getElementById('sig-sender-name').textContent = senderName;
  document.getElementById('sig-client-name').textContent = clientName || DOC_PLACEHOLDERS['doc-client-name'];
}

// Autocompletado con IA
const AI_BUTTON_IDLE_HTML = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/></svg><span>Redactar Cotización con IA</span>`;
const AI_BUTTON_BUSY_HTML = `<svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span>Generando tu cotización…</span>`;

async function generateProposalWithAI() {
  const brief = document.getElementById('ai-brief-input')?.value.trim();
  if (!brief) {
    showToast('Escribe en el recuadro qué trabajo deseas cotizar.');
    document.getElementById('ai-brief-input')?.focus();
    return;
  }

  const btn = document.getElementById('btn-generate-ai');
  btn.disabled = true;
  btn.setAttribute('aria-busy', 'true');
  btn.innerHTML = AI_BUTTON_BUSY_HTML;
  document.getElementById('ai-result')?.classList.add('hidden');
  // Un mínimo de espera hace visible que algo ocurrió aunque el motor local responda al instante
  const minDelay = new Promise(r => setTimeout(r, 650));

  let proposal = null;
  try {
    // La IA se invoca a través del servidor: la API key de Gemini nunca llega al navegador
    if (state.config.aiEnabled) {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, currency: currentCurrency() })
      });
      if (response.ok) proposal = (await response.json()).proposal;
    }
  } catch (_) {}
  if (!proposal || !Array.isArray(proposal.items) || proposal.items.length === 0) {
    proposal = synthesizeProposalLocally(brief);
  }

  await minDelay;
  applyGeneratedProposal(proposal);
  showAiResult(proposal);
  btn.disabled = false;
  btn.removeAttribute('aria-busy');
  btn.innerHTML = AI_BUTTON_IDLE_HTML;
}

function showAiResult(proposal) {
  const calc = getCalculatedTotals();
  const panel = document.getElementById('ai-result');
  const text = document.getElementById('ai-result-text');
  const missing = document.getElementById('ai-result-missing');
  if (!panel || !text) return;
  const n = state.lineItems.length;
  text.textContent = `✓ Listo. Llenamos el título, la descripción, el tiempo de entrega y ${n} concepto${n === 1 ? '' : 's'} por un total de ${formatMoney(calc.total, calc.currency)}. Revisa los precios antes de enviarla.`;
  const pending = [];
  if (!document.getElementById('client-name')?.value.trim()) pending.push('el nombre de tu cliente');
  if (!document.getElementById('sender-name')?.value.trim()) pending.push('tu nombre o empresa');
  if (missing) {
    missing.textContent = pending.length ? `Falta: ${pending.join(' y ')}.` : '';
    missing.classList.toggle('hidden', pending.length === 0);
  }
  panel.classList.remove('hidden');
}

function flashUpdated(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('flash-updated');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('flash-updated');
  });
}

function scrollToPreview() {
  switchTab('builder');
  document.getElementById('proposal-document')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const EXAMPLE_CLIENT_NAMES = ['Grupo Médico San Ángel', 'Nombre del Cliente'];

function clearExampleClient() {
  const el = document.getElementById('client-name');
  if (el && EXAMPLE_CLIENT_NAMES.includes(el.value.trim())) el.value = '';
}

// Motor local (sin IA externa): reconoce el giro por palabras clave. Precios base en USD.
const LOCAL_NICHES = [
  { keys: ['foto', 'fotógraf', 'fotograf'], title: 'Cobertura Fotográfica Profesional', delivery: '10 a 15 días hábiles para la entrega de fotos editadas',
    summary: 'Cobertura fotográfica profesional con equipo de alta gama, dirección de poses y edición individual de cada fotografía para entregar recuerdos de calidad de galería.',
    items: [['Cobertura fotográfica del evento (hasta 6 horas)', 1, 420], ['Edición profesional y retoque de fotografías', 1, 180], ['Galería digital privada en alta resolución', 1, 70], ['Álbum impreso de lujo (opcional)', 1, 160]] },
  { keys: ['video', 'filmaci', 'grabaci', 'dron'], title: 'Producción y Edición de Video Profesional', delivery: '10 a 14 días hábiles',
    summary: 'Producción de video con cámaras profesionales, audio limpio y edición con corrección de color, música licenciada y versiones para redes sociales.',
    items: [['Jornada de grabación con equipo profesional', 1, 380], ['Edición, corrección de color y musicalización', 1, 260], ['Versiones cortas para redes sociales (3 clips)', 1, 120]] },
  { keys: ['evento', 'boda', 'xv', 'fiesta', 'banquete', 'catering', 'banquet'], title: 'Organización y Servicio para Evento', delivery: 'Según la fecha del evento',
    summary: 'Planeación y operación integral del evento: coordinación de proveedores, montaje, servicio durante el evento y desmontaje, para que solo te ocupes de disfrutar.',
    items: [['Planeación y coordinación del evento', 1, 300], ['Montaje, mobiliario y decoración', 1, 450], ['Servicio de personal durante el evento', 1, 280], ['Desmontaje y limpieza final', 1, 90]] },
  { keys: ['logo', 'branding', 'marca', 'identidad', 'diseño gráfico', 'diseno grafico'], title: 'Diseño de Identidad de Marca', delivery: '7 a 10 días hábiles',
    summary: 'Creación de una identidad visual profesional y coherente: logotipo, paleta de colores, tipografías y aplicaciones listas para usar en redes, papelería y web.',
    items: [['Diseño de logotipo (3 propuestas y 2 rondas de ajustes)', 1, 280], ['Manual de identidad: colores, tipografías y usos', 1, 160], ['Kit de aplicaciones para redes sociales y papelería', 1, 120]] },
  { keys: ['redes sociales', 'community', 'marketing', 'publicidad', 'anuncios', 'facebook ads', 'instagram', 'tiktok'], title: 'Gestión de Redes Sociales y Publicidad Digital', delivery: 'Servicio mensual',
    summary: 'Estrategia y gestión mensual de redes sociales con contenido diseñado, campañas de anuncios segmentadas y reporte de resultados para atraer clientes de forma constante.',
    items: [['Estrategia y calendario mensual de contenido', 1, 150], ['Diseño de 12 publicaciones y 8 historias', 1, 240], ['Gestión de campañas de anuncios (no incluye inversión)', 1, 180], ['Reporte mensual de resultados', 1, 60]] },
  { keys: ['contab', 'contador', 'fiscal', 'impuesto', 'declaraci', ' sat ', 'nómina', 'nomina'], title: 'Servicios Contables y Fiscales', delivery: 'Servicio mensual',
    summary: 'Contabilidad y cumplimiento fiscal en tiempo y forma: registro de operaciones, cálculo y presentación de impuestos y asesoría para pagar lo justo sin multas.',
    items: [['Contabilidad electrónica mensual', 1, 120], ['Cálculo y presentación de declaraciones', 1, 90], ['Asesoría fiscal y atención a requerimientos', 1, 70]] },
  { keys: ['abogad', 'legal', 'contrato', 'jurídic', 'juridic', 'demanda'], title: 'Asesoría y Servicios Legales', delivery: '5 a 10 días hábiles',
    summary: 'Atención legal profesional con análisis del caso, elaboración o revisión de documentos y acompañamiento hasta resolver tu asunto con certeza jurídica.',
    items: [['Consulta y análisis del caso', 1, 120], ['Elaboración o revisión de documentos legales', 1, 260], ['Seguimiento y representación', 1, 300]] },
  { keys: ['limpieza', 'aseo', 'sanitiz'], title: 'Servicio Profesional de Limpieza', delivery: 'Según calendario acordado',
    summary: 'Servicio de limpieza profunda con personal capacitado, productos profesionales y supervisión para entregar espacios impecables y desinfectados.',
    items: [['Limpieza profunda de áreas', 1, 180], ['Productos e insumos profesionales', 1, 60], ['Supervisión y control de calidad', 1, 40]] },
  { keys: ['jardín', 'jardin', 'pasto', 'poda', 'paisaj'], title: 'Servicio de Jardinería y Paisajismo', delivery: '3 a 7 días hábiles',
    summary: 'Mantenimiento y diseño de áreas verdes: poda, corte de pasto, plantas nuevas y sistema de riego para mantener tu jardín sano y atractivo todo el año.',
    items: [['Diseño y trazo de áreas verdes', 1, 160], ['Suministro y plantación', 1, 240], ['Mantenimiento: poda y corte de pasto', 1, 90]] },
  { keys: ['plomer', 'electric', 'instalaci', 'fuga', 'cableado', 'aire acondicionado', 'minisplit'], title: 'Instalación y Reparación Técnica', delivery: '1 a 3 días hábiles',
    summary: 'Diagnóstico e instalación por técnicos con experiencia, materiales de calidad y garantía por escrito sobre la mano de obra.',
    items: [['Diagnóstico y revisión técnica', 1, 40], ['Materiales y refacciones', 1, 120], ['Mano de obra e instalación', 1, 160], ['Garantía de 90 días', 1, 0]] },
  { keys: ['remodel', 'construc', 'obra', 'albañil', 'albanil', 'pintura', 'impermeabil'], title: 'Proyecto de Remodelación y Obra', delivery: '14 a 21 días hábiles',
    summary: 'Ejecución llave en mano de trabajos de remodelación con materiales de primera calidad, supervisión técnica y garantía por escrito.',
    items: [['Levantamiento, planeación y suministro de materiales', 1, 480], ['Mano de obra especializada', 1, 550], ['Acabados, limpieza final y garantía', 1, 220]] },
  { keys: ['clase', 'curso', 'taller', 'capacitaci', 'tutor', 'asesoría escolar'], title: 'Programa de Capacitación', delivery: 'Según calendario de sesiones',
    summary: 'Programa de formación práctico con material didáctico, ejercicios aplicados y seguimiento personalizado para lograr resultados medibles.',
    items: [['Sesiones de capacitación (8 horas)', 1, 320], ['Material didáctico y ejercicios', 1, 80], ['Evaluación y constancia de participación', 1, 50]] },
  { keys: ['mudanza', 'flete', 'transporte', 'envío', 'envio', 'paquete'], title: 'Servicio de Mudanza y Transporte', delivery: 'Fecha acordada',
    summary: 'Traslado seguro con unidad adecuada, personal de carga y protección de tus pertenencias de principio a fin.',
    items: [['Unidad de transporte y combustible', 1, 180], ['Personal de carga y descarga', 1, 120], ['Material de empaque y protección', 1, 50]] },
  { keys: ['belleza', 'maquillaje', 'peinado', 'uñas', 'unas', 'estética', 'estetica', 'spa'], title: 'Servicio de Belleza y Maquillaje Profesional', delivery: 'Fecha y hora acordadas',
    summary: 'Servicio profesional de belleza con productos de alta gama, prueba previa y atención a domicilio para que luzcas increíble en tu día especial.',
    items: [['Maquillaje profesional', 1, 90], ['Peinado', 1, 70], ['Prueba previa', 1, 40]] },
  { keys: ['clínica', 'clinica', 'dental', 'médic', 'medic', 'doctor', 'consultorio'], title: 'Portal Web Médico & Sistema de Citas en WhatsApp', delivery: '7 a 10 días hábiles',
    summary: 'Página web profesional para clínica con agendamiento automático de pacientes por WhatsApp y recordatorios para evitar inasistencias.',
    items: [['Sitio web médico con especialidades y ubicación', 1, 340], ['Agenda automática de citas en WhatsApp 24/7', 1, 320], ['Recordatorios de citas y capacitación', 1, 190]] },
  { keys: ['restaurante', 'comida', 'menú', 'menu', 'cafeter'], title: 'Menú Digital, Pedidos en Línea y Reservaciones', delivery: '7 días hábiles',
    summary: 'Sistema propio para recibir pedidos y reservaciones directo en el WhatsApp del negocio, sin comisiones de aplicaciones externas.',
    items: [['Menú digital interactivo con carrito', 1, 290], ['Automatización de pedidos y reservaciones', 1, 240], ['Registro de clientes frecuentes y capacitación', 1, 140]] },
  { keys: ['página web', 'pagina web', 'sitio web', 'tienda', 'ecommerce', 'landing', 'software', ' app ', 'aplicaci'], title: 'Desarrollo de Sitio Web / Aplicación', delivery: '10 a 15 días hábiles',
    summary: 'Diseño y desarrollo a la medida, adaptable a celulares, con panel de administración, optimización para Google y capacitación para que lo manejes tú mismo.',
    items: [['Diseño responsivo (celular y computadora)', 1, 450], ['Desarrollo de funciones y panel de administración', 1, 380], ['Dominio, publicación, SEO básico y capacitación', 1, 200]] }
];

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function synthesizeProposalLocally(brief) {
  const lower = ` ${brief.toLowerCase()} `;
  const placeMatch = /\ben\s+([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)*)/.exec(brief);
  const place = placeMatch ? placeMatch[1] : '';
  const niche = LOCAL_NICHES.find(n => n.keys.some(k => lower.includes(k)));
  const toItems = rows => localizeItems(rows.map(([name, qty, price]) => ({ name, qty, price })));

  if (niche) {
    return {
      projectTitle: niche.title + (place ? ` en ${place}` : ''),
      summary: niche.summary + (place ? ` Servicio en ${place}.` : ''),
      deliveryTime: niche.delivery,
      items: toItems(niche.items)
    };
  }
  const subject = capitalizeFirst(brief.replace(/^(cotizaci[oó]n|presupuesto)\s+(de|para)\s+/i, '').slice(0, 70));
  return {
    projectTitle: subject,
    summary: `Propuesta para ${brief.charAt(0).toLowerCase() + brief.slice(1)}, con alcance definido, materiales y mano de obra de calidad, entrega en tiempo y garantía por escrito.`,
    deliveryTime: '7 a 10 días hábiles',
    items: toItems([[`Servicio principal: ${subject}`, 1, 350], ['Materiales, insumos y traslados', 1, 140], ['Entrega, seguimiento y garantía de 30 días', 1, 80]])
  };
}

function applyGeneratedProposal(data) {
  if (data.clientName) {
    document.getElementById('client-name').value = data.clientName;
  } else {
    clearExampleClient();
  }
  if (data.projectTitle) document.getElementById('project-title').value = data.projectTitle;
  if (data.summary) document.getElementById('proposal-summary').value = data.summary;
  if (data.deliveryTime) document.getElementById('delivery-time').value = data.deliveryTime;
  if (Array.isArray(data.items) && data.items.length > 0) {
    state.lineItems = data.items.map(i => ({
      name: String(i.name || 'Concepto'),
      qty: Number(i.qty) || 1,
      price: Number(i.price) || 0
    }));
  }
  renderLineItemsEditor();
  renderProposalPreview();
  flashUpdated(['doc-project-title', 'doc-summary', 'doc-items-tbody', 'doc-total']);
}

// Firma: dibujar, subir imagen o escribir. Nunca se envía al servidor.
const SIGNATURE_MAX_BYTES = 2 * 1024 * 1024;
const SIGNATURE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const SIGNATURE_FONTS = { 1: '"Dancing Script"', 2: '"Great Vibes"', 3: '"Caveat"' };
let signatureCanvasReady = false;
let signatureHasStrokes = false;

function sizeSignatureCanvas() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || signatureHasStrokes) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.strokeStyle = '#141413';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function initSignatureCanvas() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas || signatureCanvasReady) return;
  signatureCanvasReady = true;
  const ctx = canvas.getContext('2d');
  let drawing = false;

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  };
  const startDraw = (e) => {
    sizeSignatureCanvas();
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
    signatureHasStrokes = true;
    e.preventDefault();
  };
  const endDraw = () => {
    if (!drawing) return;
    drawing = false;
    if (signatureHasStrokes) setSignatureImage(canvas.toDataURL('image/png'));
  };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  window.addEventListener('mouseup', endDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', moveDraw, { passive: false });
  window.addEventListener('touchend', endDraw);
}

function setSignatureImage(dataUrl) {
  const img = document.getElementById('doc-signature-img');
  const placeholder = document.getElementById('doc-signature-placeholder');
  state.signatureDataUrl = dataUrl;
  if (!img) return;
  if (dataUrl) {
    img.src = dataUrl;
    img.classList.remove('hidden');
    placeholder?.classList.add('hidden');
  } else {
    img.removeAttribute('src');
    img.classList.add('hidden');
    placeholder?.classList.remove('hidden');
  }
}

function setSignatureMode(mode) {
  ['draw', 'upload', 'type'].forEach(m => {
    document.getElementById(`sig-panel-${m}`)?.classList.toggle('hidden', m !== mode);
    const tab = document.getElementById(`sig-mode-${m}`);
    if (tab) {
      tab.setAttribute('aria-selected', String(m === mode));
      tab.className = `sig-mode-btn px-2 py-1.5 rounded-md text-xs ${m === mode ? 'font-semibold bg-[var(--bg-elevated)] text-[var(--ink-primary)] shadow-sm' : 'font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'}`;
    }
  });
  if (mode === 'draw') requestAnimationFrame(sizeSignatureCanvas);
  if (mode === 'type') renderTypedSignature();
}

// Imagen subida: se redimensiona y se vuelve transparente el fondo claro, todo en el navegador
function onSignatureUpload(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  if (!SIGNATURE_TYPES.includes(file.type)) {
    showToast('Formato no soportado. Usa una imagen PNG, JPG o WEBP.');
    return;
  }
  if (file.size > SIGNATURE_MAX_BYTES) {
    showToast('La imagen pesa más de 2 MB. Usa una más ligera.');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 600 / image.width, 200 / image.height);
      const w = Math.max(1, Math.round(image.width * scale));
      const h = Math.max(1, Math.round(image.height * scale));
      const off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      const ctx = off.getContext('2d');
      ctx.drawImage(image, 0, 0, w, h);
      const pixels = ctx.getImageData(0, 0, w, h);
      const d = pixels.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > 225 && d[i + 1] > 225 && d[i + 2] > 225) d[i + 3] = 0;
      }
      ctx.putImageData(pixels, 0, 0);
      setSignatureImage(off.toDataURL('image/png'));
      showToast('Firma cargada en tu cotización.');
      flashUpdated(['doc-signature-img']);
    };
    image.onerror = () => showToast('No pudimos leer esa imagen.');
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

state.typedSignatureStyle = 1;

function setTypedSignatureStyle(style) {
  state.typedSignatureStyle = Number(style) || 1;
  document.querySelectorAll('.sig-style-btn').forEach(btn => {
    const active = btn.dataset.arg === String(state.typedSignatureStyle);
    btn.classList.toggle('ring-2', active);
    btn.classList.toggle('ring-[var(--ink-primary)]', active);
  });
  renderTypedSignature();
}

async function renderTypedSignature() {
  const name = (document.getElementById('signature-typed-name')?.value || '').trim().slice(0, 60);
  if (!name) {
    if (!signatureHasStrokes) setSignatureImage(null);
    return;
  }
  const family = SIGNATURE_FONTS[state.typedSignatureStyle] || SIGNATURE_FONTS[1];
  try { await document.fonts.load(`64px ${family}`); } catch (_) {}
  const off = document.createElement('canvas');
  const ctx = off.getContext('2d');
  ctx.font = `64px ${family}`;
  const width = Math.min(900, Math.ceil(ctx.measureText(name).width) + 40);
  off.width = width;
  off.height = 120;
  ctx.font = `64px ${family}`;
  ctx.fillStyle = '#141413';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 20, 64);
  setSignatureImage(off.toDataURL('image/png'));
}

function clearSignature() {
  const canvas = document.getElementById('signature-canvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  signatureHasStrokes = false;
  const typed = document.getElementById('signature-typed-name');
  if (typed) typed.value = '';
  setSignatureImage(null);
}

// Diseños del documento: 2 gratis, 4 PRO (se pueden previsualizar; descargar requiere PRO)
const DOC_THEMES = {
  clasico: { label: 'Clásico', pro: false },
  minimal: { label: 'Minimal', pro: false },
  moderno: { label: 'Moderno', pro: true },
  corporativo: { label: 'Corporativo', pro: true },
  elegante: { label: 'Elegante', pro: true },
  vibrante: { label: 'Vibrante', pro: true }
};

function setDocTheme(name, { silent = false } = {}) {
  const theme = DOC_THEMES[name];
  if (!theme) return;
  state.docTheme = name;
  const doc = document.getElementById('proposal-document');
  if (doc) doc.dataset.docTheme = name;
  try { localStorage.setItem(STORAGE_KEYS.DOC_THEME, name); } catch (_) {}
  renderThemePicker();
  if (!silent && theme.pro && !state.isPro) {
    showToast(`Vista previa del diseño ${theme.label} (PRO). Para descargarlo activa Studio PRO.`);
  }
}

function isLockedTheme() {
  const theme = DOC_THEMES[state.docTheme];
  return Boolean(theme && theme.pro && !state.isPro);
}

function renderThemePicker() {
  document.querySelectorAll('#doc-theme-picker [data-arg]').forEach(btn => {
    btn.setAttribute('aria-pressed', String(btn.dataset.arg === state.docTheme));
  });
  document.querySelectorAll('#doc-theme-picker .theme-lock').forEach(el => el.classList.toggle('hidden', state.isPro));
  document.getElementById('doc-theme-note')?.classList.toggle('hidden', !isLockedTheme());
}

function loadDocTheme() {
  let saved = 'clasico';
  try { saved = localStorage.getItem(STORAGE_KEYS.DOC_THEME) || 'clasico'; } catch (_) {}
  setDocTheme(DOC_THEMES[saved] ? saved : 'clasico', { silent: true });
}

// Guía rápida con burbujas: se muestra sola la primera visita y se repite con el botón "Guía"
const TOUR_STEPS = [
  { target: '#tour-ai', step: 1, title: 'Empieza aquí: la IA cotiza por ti', text: 'Escribe qué trabajo vas a cotizar, por ejemplo "logo para cafetería en Monterrey", y la IA llena el título, la descripción, los conceptos y los precios.' },
  { target: '#preset-selector', title: 'O usa una plantilla por giro', text: 'Elige tu giro y se carga una cotización base que puedes editar a tu gusto.' },
  { target: '#tour-sender', step: 1, tall: true, title: 'Tus datos, tu logo y tu cliente', text: 'Escribe tu nombre y contacto y sube tu logo. Se guardan solo en tu navegador para la próxima vez.' },
  { target: '#tour-steps', title: 'Todo en 3 pasos', text: '1) Datos e IA · 2) Conceptos y precios (moneda, IVA, descuento y anticipo) · 3) Firma y contrato.' },
  { target: '#proposal-document', tall: true, title: 'Vista previa en vivo', text: 'Así se verá tu PDF. También puedes hacer clic sobre los textos de la hoja para editarlos directamente.' },
  { target: '#doc-theme-picker', title: 'Elige el diseño', text: 'Clásico y Minimal son gratis. Los diseños PRO puedes verlos en vista previa antes de comprar.' },
  { target: '#tour-share', title: 'Compártela por WhatsApp', text: 'Envía a tu cliente un resumen con conceptos, total y anticipo, o copia el texto.' },
  { target: '#btn-download-top', title: 'Descarga tu PDF', text: 'Revisamos que no falte nada y se abre para guardarla en PDF o imprimirla. Tienes 3 cotizaciones gratis.' },
  { target: '#tab-btn-history', title: 'Tus cotizaciones guardadas', text: 'Todo lo que guardes o descargues queda aquí para abrirlo, duplicarlo o borrarlo.' }
];
let tourIndex = -1;
let tourRepositionTimer = null;

function startTour() {
  closeProModal();
  tourIndex = 0;
  document.body.classList.add('tour-active');
  const root = document.getElementById('tour-root');
  root.classList.remove('hidden');
  root.setAttribute('aria-hidden', 'false');
  window.addEventListener('resize', scheduleTourReposition);
  window.addEventListener('scroll', scheduleTourReposition, { passive: true });
  document.addEventListener('keydown', onTourKeydown);
  showTourStep();
}

function endTour() {
  if (tourIndex < 0) return;
  tourIndex = -1;
  document.body.classList.remove('tour-active');
  const root = document.getElementById('tour-root');
  root.classList.add('hidden');
  root.setAttribute('aria-hidden', 'true');
  window.removeEventListener('resize', scheduleTourReposition);
  window.removeEventListener('scroll', scheduleTourReposition);
  document.removeEventListener('keydown', onTourKeydown);
  try { localStorage.setItem(STORAGE_KEYS.TOUR_DONE, '1'); } catch (_) {}
}

function tourNext() {
  if (tourIndex >= TOUR_STEPS.length - 1) {
    endTour();
    showToast('¡Listo! Puedes repetir la guía cuando quieras con el botón "?".');
    return;
  }
  tourIndex += 1;
  showTourStep();
}

function tourPrev() {
  if (tourIndex <= 0) return;
  tourIndex -= 1;
  showTourStep();
}

function onTourKeydown(e) {
  if (e.key === 'Escape') endTour();
  else if (e.key === 'ArrowRight') tourNext();
  else if (e.key === 'ArrowLeft') tourPrev();
}

function showTourStep() {
  const step = TOUR_STEPS[tourIndex];
  if (step.target !== '#tab-btn-history') switchTab('builder');
  if (step.step) switchInspectorStep(step.step);
  const el = document.querySelector(step.target);
  document.getElementById('tour-counter').textContent = `${tourIndex + 1} de ${TOUR_STEPS.length}`;
  document.getElementById('tour-title').textContent = step.title;
  document.getElementById('tour-text').textContent = step.text;
  document.getElementById('tour-prev').classList.toggle('invisible', tourIndex === 0);
  document.getElementById('tour-next').innerHTML = tourIndex === TOUR_STEPS.length - 1 ? '¡Entendido!' : 'Siguiente &rarr;';
  if (el) {
    const rect = el.getBoundingClientRect();
    const headerOffset = window.innerWidth >= 640 ? 96 : 16;
    const top = step.tall || rect.height > window.innerHeight * 0.6
      ? rect.top + window.scrollY - headerOffset
      : rect.top + window.scrollY - (window.innerHeight - rect.height) / 2;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
  positionTour();
  setTimeout(positionTour, 450);
  document.getElementById('tour-next').focus({ preventScroll: true });
}

function scheduleTourReposition() {
  clearTimeout(tourRepositionTimer);
  tourRepositionTimer = setTimeout(positionTour, 30);
}

function positionTour() {
  if (tourIndex < 0) return;
  const el = document.querySelector(TOUR_STEPS[tourIndex].target);
  const highlight = document.getElementById('tour-highlight');
  const bubble = document.getElementById('tour-bubble');
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 8;
  const rect = el ? el.getBoundingClientRect() : { top: vh / 2, bottom: vh / 2, left: vw / 2, right: vw / 2 };
  const top = Math.max(rect.top - 6, margin);
  const bottom = Math.min(rect.bottom + 6, vh - margin);
  const left = Math.max(rect.left - 6, margin);
  const right = Math.min(rect.right + 6, vw - margin);
  Object.assign(highlight.style, {
    top: `${top}px`, left: `${left}px`,
    width: `${Math.max(0, right - left)}px`, height: `${Math.max(0, bottom - top)}px`,
    boxShadow: '0 0 0 9999px rgba(20, 20, 19, 0.55)'
  });

  const width = Math.min(360, vw - 32);
  bubble.style.width = `${width}px`;
  const bh = bubble.offsetHeight;
  let bubbleTop;
  if (bottom + 12 + bh <= vh - margin) bubbleTop = bottom + 12;
  else if (top - 12 - bh >= margin) bubbleTop = top - 12 - bh;
  else bubbleTop = vh - bh - 16;
  const bubbleLeft = Math.min(Math.max(left, 16), vw - width - 16);
  bubble.style.top = `${Math.max(margin, bubbleTop)}px`;
  bubble.style.left = `${bubbleLeft}px`;
}

function maybeStartFirstVisitTour(skip) {
  let done = false;
  try { done = localStorage.getItem(STORAGE_KEYS.TOUR_DONE) === '1'; } catch (_) {}
  if (!done && !skip) setTimeout(startTour, 700);
}

// Botón flotante en celular: solo aparece mientras la cotización está fuera de la pantalla
function initMobilePreviewShortcut() {
  const fab = document.getElementById('mobile-preview-fab');
  const doc = document.getElementById('proposal-document');
  const builder = document.getElementById('tab-builder');
  if (!fab || !doc || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(([entry]) => {
    const builderVisible = builder && !builder.classList.contains('hidden');
    fab.classList.toggle('hidden', entry.isIntersecting || !builderVisible);
  }, { threshold: 0.05 });
  observer.observe(doc);
}

// Datos del emisor y logo: cada usuario guarda los suyos solo en su navegador (nunca en el servidor)
const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function readSenderProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SENDER) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch (_) {
    return {};
  }
}

function writeSenderProfile(patch) {
  try {
    localStorage.setItem(STORAGE_KEYS.SENDER, JSON.stringify({ ...readSenderProfile(), ...patch }));
    return true;
  } catch (_) {
    return false;
  }
}

function loadSenderProfile() {
  const saved = readSenderProfile();
  const nameEl = document.getElementById('sender-name');
  const contactEl = document.getElementById('sender-contact');
  if (nameEl && typeof saved.name === 'string') nameEl.value = saved.name.slice(0, 120);
  if (contactEl && typeof saved.contact === 'string') contactEl.value = saved.contact.slice(0, 120);
  // Solo se aceptan data URLs de imagen generadas por nosotros (nunca URLs externas)
  const logo = typeof saved.logo === 'string' && /^data:image\/(png|webp);base64,/.test(saved.logo) ? saved.logo : null;
  renderLogo(logo);
}

function onSenderInput() {
  writeSenderProfile({
    name: document.getElementById('sender-name')?.value || '',
    contact: document.getElementById('sender-contact')?.value || ''
  });
  renderProposalPreview();
}

function renderLogo(dataUrl) {
  state.logoDataUrl = dataUrl || null;
  [['doc-logo'], ['sender-logo-preview']].forEach(([id]) => {
    const img = document.getElementById(id);
    if (!img) return;
    if (dataUrl) {
      img.src = dataUrl;
      img.classList.remove('hidden');
    } else {
      img.removeAttribute('src');
      img.classList.add('hidden');
    }
  });
  document.getElementById('sender-logo-empty')?.classList.toggle('hidden', Boolean(dataUrl));
  document.getElementById('logo-remove-btn')?.classList.toggle('hidden', !dataUrl);
}

// El logo se redimensiona en el navegador (máx. 480x200) conservando transparencia
function onLogoUpload(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  if (!LOGO_TYPES.includes(file.type)) {
    showToast('Formato no soportado. Usa un logo PNG, JPG o WEBP.');
    return;
  }
  if (file.size > LOGO_MAX_BYTES) {
    showToast('El logo pesa más de 2 MB. Usa una versión más ligera.');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 480 / image.width, 200 / image.height);
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.round(image.width * scale));
      off.height = Math.max(1, Math.round(image.height * scale));
      off.getContext('2d').drawImage(image, 0, 0, off.width, off.height);
      let dataUrl = off.toDataURL('image/png');
      if (dataUrl.length > 400000) dataUrl = off.toDataURL('image/webp', 0.9);
      renderLogo(dataUrl);
      if (!writeSenderProfile({ logo: dataUrl })) {
        showToast('Logo agregado (no se pudo recordar para la próxima vez en este navegador).');
      } else {
        showToast('Logo agregado a tu cotización.');
      }
      flashUpdated(['doc-logo']);
    };
    image.onerror = () => showToast('No pudimos leer esa imagen.');
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  renderLogo(null);
  writeSenderProfile({ logo: '' });
  showToast('Logo quitado.');
}

// Descargar PDF
function exportProposalPDF() {
  if (isLockedTheme()) {
    showToast(`El diseño ${DOC_THEMES[state.docTheme].label} es PRO. Activa Studio PRO o elige Clásico o Minimal.`);
    openProModal();
    return;
  }
  const missing = [
    ['sender-name', 'tu nombre o empresa', 1],
    ['client-name', 'el nombre de tu cliente', 1],
    ['project-title', 'el título del trabajo', 1]
  ].filter(([id]) => !document.getElementById(id)?.value.trim());
  const hasItems = state.lineItems.some(i => String(i.name || '').trim() && safeNumber(i.price) > 0);
  if (missing.length || !hasItems) {
    const parts = missing.map(m => m[1]);
    if (!hasItems) parts.push('al menos un concepto con precio');
    showToast(`Antes de descargar, agrega ${parts.join(', ')}.`);
    switchTab('builder');
    if (missing.length) {
      switchInspectorStep(missing[0][2]);
      document.getElementById(missing[0][0])?.focus();
    } else {
      switchInspectorStep(2);
    }
    return;
  }

  if (!state.isPro && state.freeUsed >= state.freeLimit) {
    showToast('Llegaste al límite de 3 cotizaciones gratuitas. Desbloquea Studio PRO.');
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

// Guardar Cotización en "Mis Cotizaciones"
async function saveCurrentQuote(silent = false) {
  const calc = getCalculatedTotals();
  const quoteRecord = {
    id: state.quoteNumber,
    date: new Date().toISOString(),
    senderName: document.getElementById('sender-name')?.value || '',
    senderContact: document.getElementById('sender-contact')?.value || '',
    clientName: document.getElementById('client-name')?.value || 'Cliente',
    projectTitle: document.getElementById('project-title')?.value || 'Proyecto',
    summary: document.getElementById('proposal-summary')?.value || '',
    deliveryTime: document.getElementById('delivery-time')?.value || '10 días hábiles',
    validityDays: document.getElementById('validity-days')?.value || '7 días',
    total: calc.total,
    currency: calc.currency,
    taxRate: calc.taxRate,
    discountRate: calc.discountRate,
    depositRate: calc.depositRate,
    depositAmount: calc.depositAmount,
    items: state.lineItems.map(i => ({ ...i })),
    docTheme: state.docTheme || 'clasico'
  };

  const existingIdx = state.savedQuotes.findIndex(q => q.id === quoteRecord.id);
  if (existingIdx >= 0) {
    state.savedQuotes[existingIdx] = quoteRecord;
  } else {
    state.savedQuotes.unshift(quoteRecord);
  }

  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(state.savedQuotes));
  updateQuotesCounter();

  try {
    await fetch('/api/quotes', {
      method: 'POST',
      headers: clientApiHeaders(),
      body: JSON.stringify(quoteRecord)
    });
  } catch (_) {}

  if (!silent) {
    showToast('Cotización guardada en "Mis Cotizaciones".');
  }
}

// Renderizar Historial de Cotizaciones del Usuario ("Mis Cotizaciones")
function renderCustomerQuotesHistory() {
  const grid = document.getElementById('customer-quotes-grid');
  const totalEl = document.getElementById('history-total-amount');
  if (!grid) return;

  const sumTotal = state.savedQuotes.reduce((acc, q) => acc + (Number(q.total) || 0), 0);
  if (totalEl) totalEl.textContent = formatMoney(sumTotal, 'USD');

  if (state.savedQuotes.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full atelier-card rounded-xl p-10 text-center space-y-3">
        <p class="font-editorial text-xl text-[var(--ink-primary)]">Aún no tienes cotizaciones guardadas</p>
        <p class="text-xs text-[var(--ink-secondary)]">Todas las cotizaciones que guardes o descargues en PDF aparecerán aquí para cuando quieras volver a editarlas.</p>
        <button data-click="switchTab" data-arg="builder" class="btn-obsidian px-4 py-2 text-xs mt-2">Crear mi primera cotización &rarr;</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.savedQuotes.map(q => `
    <div class="atelier-card atelier-card-interactive rounded-xl p-5 flex flex-col justify-between space-y-4">
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="font-tabular text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[var(--bg-subtle)] text-[var(--ink-secondary)]">${escapeHtml(q.id)}</span>
          <span class="font-tabular text-[11px] text-[var(--ink-muted)]">${new Date(q.date).toLocaleDateString()}</span>
        </div>
        <h3 class="font-editorial text-lg text-[var(--ink-primary)] leading-snug pt-1">${escapeHtml(q.projectTitle)}</h3>
        <p class="text-xs text-[var(--ink-secondary)]">Cliente: <strong class="text-[var(--ink-primary)]">${escapeHtml(q.clientName)}</strong></p>
      </div>

      <div class="pt-3 border-t border-[var(--border-hairline)] space-y-3">
        <div class="flex items-baseline justify-between">
          <span class="text-[11px] text-[var(--ink-muted)]">Total Cotizado:</span>
          <span class="font-tabular text-base font-bold text-[var(--accent-forest)]">${formatMoney(q.total, q.currency)}</span>
        </div>
        <div class="flex items-center gap-2">
          <button data-click="loadSavedQuote" data-quote-id="${escapeHtml(q.id)}" class="btn-obsidian flex-1 py-1.5 text-xs">
            Abrir y Editar
          </button>
          <button data-click="duplicateSavedQuote" data-quote-id="${escapeHtml(q.id)}" class="btn-outline px-2.5 py-1.5 text-xs" title="Duplicar">
            Duplicar
          </button>
          <button data-click="deleteSavedQuote" data-quote-id="${escapeHtml(q.id)}" class="btn-outline px-2.5 py-1.5 text-xs text-[var(--accent-terracotta)]" title="Eliminar">
            ✕
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function loadSavedQuote(quoteId) {
  const q = state.savedQuotes.find(item => item.id === quoteId);
  if (!q) return;

  state.quoteNumber = q.id;
  document.getElementById('doc-quote-number').textContent = q.id;
  if (q.senderName) document.getElementById('sender-name').value = q.senderName;
  if (q.senderContact) document.getElementById('sender-contact').value = q.senderContact;
  document.getElementById('client-name').value = q.clientName || '';
  document.getElementById('project-title').value = q.projectTitle || '';
  if (q.summary) document.getElementById('proposal-summary').value = q.summary;
  if (q.deliveryTime) document.getElementById('delivery-time').value = q.deliveryTime;
  if (q.validityDays) document.getElementById('validity-days').value = q.validityDays;
  if (q.currency) document.getElementById('currency-select').value = q.currency;
  if (q.taxRate !== undefined) document.getElementById('tax-rate').value = q.taxRate;
  if (q.discountRate !== undefined) document.getElementById('discount-rate').value = q.discountRate;
  if (q.depositRate !== undefined) document.getElementById('deposit-rate').value = q.depositRate;

  if (Array.isArray(q.items) && q.items.length > 0) {
    state.lineItems = q.items.map(i => ({ ...i }));
  }
  if (q.docTheme && DOC_THEMES[q.docTheme]) setDocTheme(q.docTheme, { silent: true });

  renderLineItemsEditor();
  renderProposalPreview();
  switchTab('builder');
  showToast(`Cotización ${q.id} cargada en el editor.`);
}

function duplicateSavedQuote(quoteId) {
  const q = state.savedQuotes.find(item => item.id === quoteId);
  if (!q) return;
  const newId = 'CP-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  const copy = {
    ...q,
    id: newId,
    date: new Date().toISOString(),
    clientName: q.clientName + ' (Copia)'
  };
  state.savedQuotes.unshift(copy);
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(state.savedQuotes));
  updateQuotesCounter();
  renderCustomerQuotesHistory();
  showToast('Cotización duplicada.');
}

function deleteSavedQuote(quoteId) {
  state.savedQuotes = state.savedQuotes.filter(item => item.id !== quoteId);
  localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(state.savedQuotes));
  updateQuotesCounter();
  renderCustomerQuotesHistory();
  showToast('Cotización eliminada.');
}

function buildProposalPitchText() {
  const clientName = document.getElementById('client-name')?.value || 'Cliente';
  const projectTitle = document.getElementById('project-title')?.value || 'su proyecto';
  const deliveryTime = document.getElementById('delivery-time')?.value || '10 días hábiles';
  const calc = getCalculatedTotals();

  const itemsText = state.lineItems
    .map((i, idx) => `${String(idx + 1).padStart(2, '0')}. ${i.name} — ${formatMoney(i.qty * i.price, calc.currency)}`)
    .join('\n');

  return `Hola *${clientName}*, te comparto el resumen de la cotización *${projectTitle}* (Folio ${state.quoteNumber}):

*Conceptos incluidos:*
${itemsText}

• *Total:* ${formatMoney(calc.total, calc.currency)}
• *Anticipo para iniciar (${calc.depositRate}%):* ${formatMoney(calc.depositAmount, calc.currency)}
• *Tiempo de entrega:* ${deliveryTime}

Quedo atento a tus comentarios para iniciar.`;
}

function sendWhatsAppPitch() {
  const text = buildProposalPitchText();
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
}

function copyProposalSummary() {
  const text = buildProposalPitchText();
  navigator.clipboard.writeText(text).then(() => {
    showToast('Resumen copiado al portapapeles.');
  });
}

// Calculadora de Precio & ROI
function calculateB2BAudit() {
  const businessName = document.getElementById('audit-business-name')?.value || 'Tu Cliente';
  const leadsMonth = Math.max(1, parseFloat(document.getElementById('audit-leads-month')?.value) || 100);
  const ticketUsd = Math.max(1, parseFloat(document.getElementById('audit-ticket-usd')?.value) || 120);
  const lossPct = Math.max(5, parseFloat(document.getElementById('audit-loss-pct')?.value) || 25);
  const yourPrice = Math.max(50, parseFloat(document.getElementById('audit-your-price')?.value) || 650);

  document.getElementById('audit-loss-pct-label').textContent = `${lossPct}%`;

  const gainedClientsMonth = Math.round(leadsMonth * (lossPct / 100) * 0.35);
  const monthlyBenefit = Math.max(ticketUsd, gainedClientsMonth * ticketUsd);
  const yearlyBenefit = monthlyBenefit * 12;
  const roiMultiple = (monthlyBenefit / yourPrice).toFixed(1);
  const breakevenClients = Math.max(1, Math.ceil(yourPrice / ticketUsd));

  document.getElementById('audit-monthly-loss').textContent = `$${monthlyBenefit.toLocaleString('en-US')} USD`;
  document.getElementById('audit-yearly-loss').textContent = `$${yearlyBenefit.toLocaleString('en-US')} USD`;
  document.getElementById('audit-roi-multiple').textContent = `${roiMultiple}x mes 1`;
  document.getElementById('audit-breakeven-clients').textContent = breakevenClients;

  const script = `Hola *${businessName}*,

Junto con mi cotización, hice una proyección rápida del retorno de inversión para tu negocio:

Actualmente, con un promedio de *${leadsMonth} prospectos al mes* y una venta promedio de *$${ticketUsd} USD*, mejorar apenas un ${lossPct}% la captación y seguimiento representa aproximadamente *$${monthlyBenefit.toLocaleString('en-US')} USD adicionales al mes* ($${yearlyBenefit.toLocaleString('en-US')} USD al año).

• *Lo más importante:* El proyecto tiene una inversión de *$${yourPrice} USD*, por lo que *con solo ${breakevenClients} clientes nuevos el proyecto se paga solo* (retorno estimado de ${roiMultiple}x desde el primer mes).

Te adjunto el PDF con el desglose completo.`;

  const scriptEl = document.getElementById('audit-whatsapp-script');
  if (scriptEl) scriptEl.value = script;
}

function copyAuditPitch() {
  const scriptEl = document.getElementById('audit-whatsapp-script');
  if (!scriptEl) return;
  navigator.clipboard.writeText(scriptEl.value).then(() => {
    showToast('Mensaje copiado al portapapeles.');
  });
}

function sendAuditWhatsApp() {
  const scriptEl = document.getElementById('audit-whatsapp-script');
  if (!scriptEl) return;
  window.open(`https://wa.me/?text=${encodeURIComponent(scriptEl.value)}`, '_blank', 'noopener,noreferrer');
}

function convertAuditToProposal() {
  const businessName = document.getElementById('audit-business-name')?.value || 'Cliente';
  const yourPrice = Math.max(50, parseFloat(document.getElementById('audit-your-price')?.value) || 650);
  const monthlyBenefitText = document.getElementById('audit-monthly-loss')?.textContent || '$3,000 USD';

  document.getElementById('client-name').value = businessName;
  document.getElementById('project-title').value = `Propuesta de Optimización Comercial para ${businessName}`;
  document.getElementById('proposal-summary').value = `Proyecto integral diseñado para generar un impacto estimado de ${monthlyBenefitText}/mes en ventas recuperadas y mejora operativa para ${businessName}.`;
  document.getElementById('currency-select').value = 'USD';
  document.getElementById('discount-rate').value = '0';
  document.getElementById('tax-rate').value = '0';

  const p1 = Math.round(yourPrice * 0.45);
  const p2 = Math.round(yourPrice * 0.35);
  const p3 = yourPrice - p1 - p2;

  state.lineItems = [
    { name: 'Diseño e Implementación de Solución Principal', qty: 1, price: p1 },
    { name: 'Automatización de Captación y Seguimiento de Clientes', qty: 1, price: p2 },
    { name: 'Puesta en Marcha, Capacitación y Garantía de 30 Días', qty: 1, price: p3 }
  ];

  renderLineItemsEditor();
  renderProposalPreview();
  switchTab('builder');
  showToast('Datos cargados en tu Cotización PDF.');
}

// Configuración Privada del Propietario
function populateOwnerConfigInputs() {
  const c = state.config;
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };
  setVal('cfg-gemini-key', '');
  setVal('cfg-stripe-monthly', c.stripeMonthlyUrl);
  setVal('cfg-stripe-lifetime', c.stripeLifetimeUrl);
  setVal('cfg-owner-whatsapp', c.ownerWhatsapp);
}

async function saveOwnerConfig() {
  const geminiInput = document.getElementById('cfg-gemini-key');
  const payload = {
    geminiApiKey: geminiInput?.value.trim() || '',
    stripeMonthlyUrl: document.getElementById('cfg-stripe-monthly')?.value.trim() || DEFAULT_CONFIG.stripeMonthlyUrl,
    stripeLifetimeUrl: document.getElementById('cfg-stripe-lifetime')?.value.trim() || DEFAULT_CONFIG.stripeLifetimeUrl,
    ownerWhatsapp: document.getElementById('cfg-owner-whatsapp')?.value.trim() || DEFAULT_CONFIG.ownerWhatsapp
  };

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: ownerAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showToast(res.status === 401 ? 'Tu sesión de propietario expiró. Vuelve a ingresar.' : `No se guardó: ${err.error || 'datos inválidos'}`);
      return false;
    }
  } catch (_) {
    showToast('No se pudo conectar con el servidor.');
    return false;
  }

  // La API key se guarda solo en el servidor; en el navegador se conserva la configuración pública
  const { geminiApiKey, ...publicConfig } = payload;
  state.config = { ...state.config, ...publicConfig, aiEnabled: state.config.aiEnabled || Boolean(geminiApiKey) };
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(state.config));
  if (geminiInput) {
    geminiInput.value = '';
    if (geminiApiKey) geminiInput.placeholder = '•••••••• (configurada, escribe para reemplazar)';
  }

  updatePlanUI();
  showToast('Configuración guardada.');
  return true;
}

async function testGeminiConnection() {
  if (!(await saveOwnerConfig())) return;
  try {
    const res = await fetch('/api/owner/gemini/test', { method: 'POST', headers: ownerAuthHeaders(), body: '{}' });
    const data = await res.json();
    showToast(data.ok ? 'Conexión con Google Gemini verificada.' : 'API Key no válida o sin configurar.');
  } catch (e) {
    showToast('Error al conectar con Gemini.');
  }
}

async function generateClientLicenseKey() {
  const emailInput = document.getElementById('license-client-email');
  const email = (emailInput?.value || '').trim();
  if (!email || !email.includes('@')) {
    showToast('Ingresa el correo del cliente.');
    return;
  }

  try {
    const res = await fetch('/api/licenses', {
      method: 'POST',
      headers: ownerAuthHeaders(),
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      showToast(res.status === 401 ? 'Tu sesión de propietario expiró. Vuelve a ingresar.' : 'No se pudo generar la licencia.');
      return;
    }
    const record = await res.json();
    state.generatedLicenses.unshift({ email: record.email, licenseKey: record.licenseKey, createdAt: new Date().toISOString() });
    document.getElementById('generated-license-code').textContent = record.licenseKey;
    document.getElementById('generated-license-box').classList.remove('hidden');
    showToast(`Licencia generada para ${record.email}`);
  } catch (_) {
    showToast('No se pudo conectar con el servidor.');
  }
}

function copyGeneratedLicense() {
  const code = document.getElementById('generated-license-code')?.textContent;
  if (!code) return;
  navigator.clipboard.writeText(code).then(() => {
    showToast('Código copiado.');
  });
}

// Modal de Compra PRO para los Clientes
function openProModal() {
  if (state.isPro) {
    showToast('Tu cuenta Studio PRO Ilimitada ya se encuentra activa.');
    return;
  }
  document.getElementById('pro-modal')?.classList.remove('hidden');
}

function closeProModal() {
  document.getElementById('pro-modal')?.classList.add('hidden');
}

function triggerPaymentCheckout(planType) {
  const url = planType === 'monthly'
    ? state.config.stripeMonthlyUrl
    : state.config.stripeLifetimeUrl;

  if (url && /^https:\/\/buy\.stripe\.com\/[A-Za-z0-9_-]+$/.test(url.trim())) {
    window.open(url.trim(), '_blank', 'noopener,noreferrer');
    return;
  }
}

function setProActive(licenseKey) {
  state.isPro = true;
  localStorage.setItem(STORAGE_KEYS.LICENSE_KEY, licenseKey);
  updatePlanUI();
}

async function verifyLicenseOnServer(licenseKey) {
  try {
    const res = await fetch('/api/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey })
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch (_) {
    return false;
  }
}

async function verifyStoredLicense() {
  const storedKey = localStorage.getItem(STORAGE_KEYS.LICENSE_KEY);
  if (!storedKey) return;
  if (await verifyLicenseOnServer(storedKey)) {
    setProActive(storedKey);
  } else {
    state.isPro = false;
  }
}

async function redeemStripeSession(sessionId) {
  try {
    const res = await fetch('/api/stripe/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    if (res.ok) {
      const data = await res.json();
      setProActive(data.licenseKey);
      setTimeout(() => {
        window.prompt('¡Pago confirmado en Stripe! Guarda tu licencia PRO para activarla en otros dispositivos:', data.licenseKey);
      }, 600);
      return;
    }
  } catch (_) {}
  await verifyStoredLicense();
  if (!state.isPro) {
    setTimeout(() => showToast('No pudimos confirmar el pago. Si ya pagaste, contáctanos con tu recibo de Stripe.'), 600);
  }
}

async function activateProLicense() {
  const inputEl = document.getElementById('activate-license-input');
  const code = (inputEl?.value || '').trim().toUpperCase();
  if (!code) {
    showToast('Escribe tu código de licencia.');
    return;
  }

  if (!(await verifyLicenseOnServer(code))) {
    showToast('Código inválido o revocado. Verifica tu licencia CPRO-...');
    return;
  }

  setProActive(code);
  if (inputEl) inputEl.value = '';
  closeProModal();
  showToast('¡Cuenta PRO Ilimitada Activada! Se eliminaron todos los anuncios de actualización.');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Delegación de eventos: sin handlers inline, la CSP puede prohibir todo script en línea.
// Solo se ejecutan acciones de esta lista blanca.
function scrollToBuilder() {
  switchTab('builder');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startNewQuote() {
  switchTab('builder');
  resetNewQuote();
}

const UI_ACTIONS = {
  switchTab: el => switchTab(el.dataset.arg),
  switchInspectorStep: el => switchInspectorStep(Number(el.dataset.arg)),
  triggerPaymentCheckout: el => triggerPaymentCheckout(el.dataset.arg),
  loadPresetTemplate: el => loadPresetTemplate(el.value),
  syncInlineEdit: el => syncInlineEdit(el.dataset.arg, el.innerText),
  onSenderInput,
  onLogoUpload: el => onLogoUpload(el),
  removeLogo,
  setDocTheme: el => setDocTheme(el.dataset.arg),
  scrollToPreview,
  startTour,
  endTour,
  tourNext,
  tourPrev,
  setSignatureMode: el => setSignatureMode(el.dataset.arg),
  onSignatureUpload: el => onSignatureUpload(el),
  renderTypedSignature,
  setTypedSignatureStyle: el => setTypedSignatureStyle(el.dataset.arg),
  updateLineItem: el => updateLineItem(Number(el.dataset.idx), el.dataset.field, el.value),
  removeLineItem: el => removeLineItem(Number(el.dataset.idx)),
  loadSavedQuote: el => loadSavedQuote(el.dataset.quoteId),
  duplicateSavedQuote: el => duplicateSavedQuote(el.dataset.quoteId),
  deleteSavedQuote: el => deleteSavedQuote(el.dataset.quoteId),
  startNewQuote,
  scrollToBuilder,
  activateProLicense,
  addLineItem,
  calculateB2BAudit,
  clearSignature,
  closeProModal,
  convertAuditToProposal,
  copyAuditPitch,
  copyGeneratedLicense,
  copyProposalSummary,
  exportProposalPDF,
  generateClientLicenseKey,
  generateProposalWithAI,
  openProModal,
  promptOwnerAccess,
  renderProposalPreview,
  resetNewQuote,
  saveCurrentQuote: () => saveCurrentQuote(),
  saveOwnerConfig,
  sendAuditWhatsApp,
  sendWhatsAppPitch,
  testGeminiConnection,
  toggleAtelierTheme
};

function dispatchUiAction(kind, event) {
  const el = event.target instanceof Element ? event.target.closest(`[data-${kind}]`) : null;
  if (!el) return;
  const action = UI_ACTIONS[el.dataset[kind]];
  if (typeof action === 'function' && Object.prototype.hasOwnProperty.call(UI_ACTIONS, el.dataset[kind])) {
    action(el);
  }
}

['click', 'input', 'change'].forEach(kind => {
  document.addEventListener(kind, event => dispatchUiAction(kind, event));
});
document.addEventListener('focusout', event => dispatchUiAction('blur', event));

window.addEventListener('DOMContentLoaded', initApp);
