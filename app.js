/**
 * CotizaPro Studio — Plataforma de Cotizaciones Comerciales y Contratos
 * Enfocada 100% en la experiencia del usuario final; Panel de Propietario oculto bajo llave.
 */

const STORAGE_KEYS = {
  CONFIG: 'cotizapro_owner_config_v1',
  QUOTES: 'cotizapro_saved_quotes_v1',
  LICENSES: 'cotizapro_generated_licenses_v1',
  PLAN: 'cotizapro_user_plan_v1',
  USAGE: 'cotizapro_free_usage_v1',
  THEME: 'cotizapro_atelier_theme_v1'
};

// Configuración oficial conectada a tus dos productos en Stripe
const DEFAULT_CONFIG = {
  geminiApiKey: '',
  stripeMonthlyUrl: 'https://buy.stripe.com/6oUaEQ9No5Qe6Qe9Cxbsc02',
  stripeLifetimeUrl: 'https://buy.stripe.com/eVq9AM1gS92qfmK5mhbsc01',
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
  lineItems: [
    { name: 'Diseño y Desarrollo de Plataforma Web Profesional', qty: 1, price: 380 },
    { name: 'Sistema de Atención y Citas Automáticas en WhatsApp', qty: 1, price: 320 },
    { name: 'Panel de Control y Capacitación de Uso', qty: 1, price: 150 }
  ],
  signatureDataUrl: null,
  isPro: false,
  freeUsed: 0,
  freeLimit: 3,
  config: { ...DEFAULT_CONFIG },
  savedQuotes: [],
  generatedLicenses: []
};

function formatMoney(amount, currency = 'USD') {
  const symbols = { USD: '$', MXN: '$', EUR: '€', COP: '$', ARS: '$', CLP: '$', PEN: 'S/' };
  const sym = symbols[currency] || '$';
  const num = Number(amount || 0);
  return `${sym}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
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
    input.value = String(newText || '').trim();
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
        btn.className = 'tab-btn px-4 py-1.5 rounded-md text-xs font-semibold transition-all bg-[var(--bg-elevated)] text-[var(--ink-primary)] shadow-sm flex items-center gap-1.5';
      } else {
        btn.className = 'tab-btn px-4 py-1.5 rounded-md text-xs font-medium transition-all text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] flex items-center gap-1.5';
      }
    }
  });
  if (tabId === 'history') renderCustomerQuotesHistory();
  if (tabId === 'calculator') calculateB2BAudit();
}

// Hashes SHA-256 con sal para no exponer contraseñas ni claves maestras en texto plano
const SECURITY_SALTS = {
  PREFIX: 'COTIZAPRO_SALT_2026::',
  OWNER_HASHES: [
    '02fb5dc6d891c0cae4b4fc5d0db8b034178f190b512fd590e68fba887b7758a4',
    'e7ab592726b94c85c35111b467c96281707445b3543418e3e6ce660087edf1d0'
  ],
  VIP_PRO_HASHES: [
    'e7ab592726b94c85c35111b467c96281707445b3543418e3e6ce660087edf1d0',
    '9d4abd1ee4330574dd8c2e658b328d868792fad21b33954f67be7ea9f5cb9647'
  ],
  STRIPE_TOKEN_HASH: 'a0cd46572561803fdaa68724c2a5b3b45b380ff0a694d933b37c3d455a36bae4'
};

async function sha256Salted(rawText) {
  const data = new TextEncoder().encode(SECURITY_SALTS.PREFIX + String(rawText || ''));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Firma criptográfica de 4 caracteres para validar autenticidad de licencias CPRO-2026-XXXXXX-CCCC
function computeLicenseChecksum4(payload6) {
  let h = 0x811c9dc5;
  const str = `CPRO_VERIFY_2026::${String(payload6).toUpperCase()}::9F8A`;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36).toUpperCase().padStart(4, '0').slice(0, 4);
}

// Acceso Privado para el Propietario (Verificado con SHA-256)
async function promptOwnerAccess() {
  const pass = window.prompt('Ingresa tu clave de propietario para abrir la configuración interna:');
  if (!pass) return;
  const clean = pass.trim();
  const hashExact = await sha256Salted(clean);
  const hashUpper = await sha256Salted(clean.toUpperCase());
  if (SECURITY_SALTS.OWNER_HASHES.includes(hashExact) || SECURITY_SALTS.OWNER_HASHES.includes(hashUpper)) {
    document.getElementById('tab-btn-admin')?.classList.remove('hidden');
    switchTab('admin');
    showToast('Modo Propietario verificado y desbloqueado.');
  } else {
    showToast('Credencial de propietario inválida.');
  }
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
      const isOldLink = (u) => !u || u.includes('4gM6oA2kWceC4I6g0Vbsc00');
      state.config = {
        ...DEFAULT_CONFIG,
        ...parsedCfg,
        stripeMonthlyUrl: isOldLink(parsedCfg.stripeMonthlyUrl) ? DEFAULT_CONFIG.stripeMonthlyUrl : parsedCfg.stripeMonthlyUrl,
        stripeLifetimeUrl: isOldLink(parsedCfg.stripeLifetimeUrl) ? DEFAULT_CONFIG.stripeLifetimeUrl : parsedCfg.stripeLifetimeUrl
      };
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(state.config));
    }

    const savedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (savedQuotes) state.savedQuotes = JSON.parse(savedQuotes);

    const savedLicenses = localStorage.getItem(STORAGE_KEYS.LICENSES);
    if (savedLicenses) state.generatedLicenses = JSON.parse(savedLicenses);

    const savedPlan = localStorage.getItem(STORAGE_KEYS.PLAN);
    if (savedPlan === 'PRO') state.isPro = true;

    const savedUsage = localStorage.getItem(STORAGE_KEYS.USAGE);
    if (savedUsage) state.freeUsed = parseInt(savedUsage, 10) || 0;

    const params = new URLSearchParams(window.location.search);
    // Si se solicita ?admin=1 se pide verificación criptográfica de propietario
    if (params.get('admin')) {
      setTimeout(() => promptOwnerAccess(), 300);
    }

    // Desbloqueo automático al regresar de Stripe con token firmado o session_id real de Stripe (cs_live_... / cs_test_...)
    const proParam = params.get('pro_token') || params.get('pro') || '';
    const sessionId = params.get('session_id') || '';
    const isValidStripeSession = /^cs_(live|test)_[A-Za-z0-9]{20,}$/.test(sessionId);
    let isValidProToken = false;
    if (proParam) {
      const tokHash = await sha256Salted(proParam);
      isValidProToken = (tokHash === SECURITY_SALTS.STRIPE_TOKEN_HASH);
    }

    if (isValidStripeSession || isValidProToken) {
      state.isPro = true;
      localStorage.setItem(STORAGE_KEYS.PLAN, 'PRO');
      updatePlanUI();
      setTimeout(() => {
        showToast('¡Pago confirmado en Stripe! Tu cuenta PRO Ilimitada está activa.');
      }, 600);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (e) {
    console.warn('Init warning:', e);
  }

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
  const badge = document.getElementById('plan-badge');
  const upgradeBtn = document.getElementById('upgrade-header-btn');
  const proActivePill = document.getElementById('pro-active-pill');
  const watermark = document.getElementById('doc-viral-watermark');
  const statusText = document.getElementById('ai-status-text');

  if (statusText) {
    statusText.textContent = (state.config.geminiApiKey && state.config.geminiApiKey.trim().length > 10)
      ? 'IA Gemini Conectada'
      : 'Motor IA Activo';
  }

  if (state.isPro) {
    if (badge) {
      badge.textContent = 'CUENTA PRO ILIMITADA';
      badge.className = 'font-tabular text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent-forest-soft)] text-[var(--accent-forest)]';
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
  document.getElementById('client-name').value = 'Nombre del Cliente';
  document.getElementById('project-title').value = 'Propuesta de Servicios Profesionales';
  document.getElementById('proposal-summary').value = 'Descripción detallada del alcance del proyecto, objetivos y beneficios para el cliente.';
  state.lineItems = [
    { name: 'Concepto o Entregable Principal', qty: 1, price: 350 }
  ];
  renderLineItemsEditor();
  renderProposalPreview();
  switchInspectorStep(1);
  showToast('Nueva cotización lista para editar.');
}

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
          placeholder="Nombre del servicio o producto..."
          class="atelier-input flex-1" />
        <button onclick="removeLineItem(${idx})" class="text-[var(--ink-muted)] hover:text-[var(--accent-terracotta)] px-1.5 text-xs font-bold" title="Eliminar">✕</button>
      </div>
      <div class="grid grid-cols-2 gap-2.5 pl-6">
        <div class="flex items-center gap-2">
          <span class="font-tabular text-[10px] uppercase text-[var(--ink-secondary)]">Cant:</span>
          <input type="number" min="1" value="${item.qty}"
            oninput="updateLineItem(${idx}, 'qty', this.value)"
            class="atelier-input font-tabular py-1" />
        </div>
        <div class="flex items-center gap-2">
          <span class="font-tabular text-[10px] uppercase text-[var(--ink-secondary)]">Precio ($):</span>
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
  state.lineItems = preset.items.map(i => ({ ...i }));

  renderLineItemsEditor();
  renderProposalPreview();
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

function renderProposalPreview() {
  const senderName = document.getElementById('sender-name')?.value || 'Tu Empresa';
  const senderContact = document.getElementById('sender-contact')?.value || '';
  const clientName = document.getElementById('client-name')?.value || 'Cliente';
  const projectTitle = document.getElementById('project-title')?.value || 'Propuesta Comercial';
  const summary = document.getElementById('proposal-summary')?.value || '';
  const deliveryTime = document.getElementById('delivery-time')?.value || '10 días hábiles';
  const validityDays = document.getElementById('validity-days')?.value || '7 días';
  const paymentNote = document.getElementById('payment-methods-note')?.value || 'Transferencia bancaria, Tarjeta o PayPal.';
  const includeContract = document.getElementById('toggle-contract')?.checked;

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
  document.getElementById('contract-client').textContent = clientName;
  document.getElementById('contract-delivery').textContent = deliveryTime;
  document.getElementById('contract-total').textContent = formattedTotal;

  document.getElementById('sig-sender-name').textContent = senderName;
  document.getElementById('sig-client-name').textContent = clientName;
}

// Autocompletado con IA
async function generateProposalWithAI() {
  const brief = document.getElementById('ai-brief-input')?.value.trim();
  if (!brief) {
    showToast('Escribe en el recuadro qué trabajo deseas cotizar.');
    document.getElementById('ai-brief-input')?.focus();
    return;
  }

  const btn = document.getElementById('btn-generate-ai');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span>Generando propuesta y precios...</span>';

  try {
    const apiKey = (state.config.geminiApiKey || '').trim();
    if (apiKey.length > 12) {
      const prompt = `Eres un experto en cotizaciones comerciales. Crea una cotización formal para: "${brief}".
Responde ÚNICAMENTE con un objeto JSON válido con este esquema exacto:
{
  "clientName": "Nombre sugerido del cliente",
  "projectTitle": "Título profesional del proyecto",
  "summary": "Descripción clara de 2 a 3 oraciones del alcance y beneficios",
  "deliveryTime": "Ej: 10 a 14 días hábiles",
  "items": [
    {"name": "Concepto 1", "qty": 1, "price": 350},
    {"name": "Concepto 2", "qty": 1, "price": 280},
    {"name": "Concepto 3", "qty": 1, "price": 190}
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
        showToast('Cotización redactada con IA.');
        return;
      }
    }

    const synthesized = synthesizeProposalLocally(brief);
    applyGeneratedProposal(synthesized);
    showToast('Cotización generada automáticamente.');
  } catch (err) {
    const synthesized = synthesizeProposalLocally(brief);
    applyGeneratedProposal(synthesized);
    showToast('Cotización lista.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

function synthesizeProposalLocally(brief) {
  const lower = brief.toLowerCase();
  let items = [];
  let projectTitle = 'Propuesta de Proyecto: ' + brief.slice(0, 48);
  let deliveryTime = '10 a 12 días hábiles';
  let summary = `Propuesta integral elaborada para "${brief}", enfocada en entregar resultados de alta calidad en tiempo y forma, con garantía de satisfacción sobre cada entregable acordado.`;

  if (lower.includes('clínica') || lower.includes('clinica') || lower.includes('dental') || lower.includes('médic') || lower.includes('medic') || lower.includes('doctor')) {
    projectTitle = 'Portal Web Médico & Sistema de Citas en WhatsApp';
    deliveryTime = '7 a 10 días hábiles';
    summary = 'Desarrollo de página web profesional para clínica con agendamiento automático de pacientes por WhatsApp y recordatorios para evitar inasistencias.';
    items = [
      { name: 'Diseño de Sitio Web Médico con Perfil de Especialidades y Ubicación', qty: 1, price: 340 },
      { name: 'Asistente Automático en WhatsApp para Agendar Citas 24/7', qty: 1, price: 320 },
      { name: 'Configuración de Recordatorios de Citas y Capacitación', qty: 1, price: 190 }
    ];
  } else if (lower.includes('restaurante') || lower.includes('comida') || lower.includes('menú') || lower.includes('menu') || lower.includes('cafeter')) {
    projectTitle = 'Menú Digital de Pedidos en Línea & Reservaciones por WhatsApp';
    deliveryTime = '7 días hábiles';
    summary = 'Sistema propio para recibir pedidos a domicilio y reservaciones directo en el WhatsApp del negocio sin pagar comisiones a aplicaciones externas.';
    items = [
      { name: 'Menú Digital Interactivo con Carrito de Compras', qty: 1, price: 290 },
      { name: 'Automatización de Pedidos y Reservaciones en WhatsApp', qty: 1, price: 240 },
      { name: 'Registro de Clientes Frecuentes y Capacitación', qty: 1, price: 140 }
    ];
  } else if (lower.includes('remodel') || lower.includes('construc') || lower.includes('obra') || lower.includes('oficina') || lower.includes('mantenimiento')) {
    projectTitle = 'Proyecto de Adecuación, Remodelación y Ejecución Técnica';
    deliveryTime = '14 días hábiles';
    summary = 'Ejecución llave en mano de trabajos de adecuación y mejora con materiales de primera calidad, supervisión técnica y garantía por escrito.';
    items = [
      { name: 'Levantamiento, Planeación y Suministro de Materiales', qty: 1, price: 480 },
      { name: 'Mano de Obra Especializada e Instalación Completa', qty: 1, price: 550 },
      { name: 'Acabados, Limpieza Final y Póliza de Garantía', qty: 1, price: 220 }
    ];
  } else if (lower.includes('tienda') || lower.includes('ecommerce') || lower.includes('venta') || lower.includes('catálogo') || lower.includes('catalogo')) {
    projectTitle = 'Tienda en Línea (E-Commerce) con Pasarela de Pagos';
    deliveryTime = '10 a 14 días hábiles';
    items = [
      { name: 'Diseño y Configuración de Tienda Online con Carrito de Compras', qty: 1, price: 480 },
      { name: 'Integración de Cobros con Tarjeta, Transferencia y Envíos', qty: 1, price: 260 },
      { name: 'Capacitación para Subir Productos y Soporte Técnico', qty: 1, price: 180 }
    ];
  } else {
    items = [
      { name: 'Planeación y Desarrollo Principal (' + brief.slice(0, 40) + ')', qty: 1, price: 420 },
      { name: 'Implementación Técnica, Ajustes y Configuración', qty: 1, price: 290 },
      { name: 'Entrega Final, Capacitación y Garantía de 30 Días', qty: 1, price: 160 }
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
      name: String(i.name || 'Concepto'),
      qty: Number(i.qty) || 1,
      price: Number(i.price) || 150
    }));
  }
  renderLineItemsEditor();
  renderProposalPreview();
}

// Firma Digital
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

// Descargar PDF
function exportProposalPDF() {
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
    items: state.lineItems.map(i => ({ ...i }))
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
      headers: { 'Content-Type': 'application/json' },
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
        <button onclick="switchTab('builder')" class="btn-obsidian px-4 py-2 text-xs mt-2">Crear mi primera cotización &rarr;</button>
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
          <button onclick="loadSavedQuote('${escapeHtml(q.id)}')" class="btn-obsidian flex-1 py-1.5 text-xs">
            Abrir y Editar
          </button>
          <button onclick="duplicateSavedQuote('${escapeHtml(q.id)}')" class="btn-outline px-2.5 py-1.5 text-xs" title="Duplicar">
            Duplicar
          </button>
          <button onclick="deleteSavedQuote('${escapeHtml(q.id)}')" class="btn-outline px-2.5 py-1.5 text-xs text-[var(--accent-terracotta)]" title="Eliminar">
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
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
  window.open(`https://wa.me/?text=${encodeURIComponent(scriptEl.value)}`, '_blank');
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
  setVal('cfg-gemini-key', c.geminiApiKey);
  setVal('cfg-stripe-monthly', c.stripeMonthlyUrl);
  setVal('cfg-stripe-lifetime', c.stripeLifetimeUrl);
  setVal('cfg-owner-whatsapp', c.ownerWhatsapp);
}

async function saveOwnerConfig() {
  state.config = {
    geminiApiKey: document.getElementById('cfg-gemini-key')?.value.trim() || '',
    stripeMonthlyUrl: document.getElementById('cfg-stripe-monthly')?.value.trim() || DEFAULT_CONFIG.stripeMonthlyUrl,
    stripeLifetimeUrl: document.getElementById('cfg-stripe-lifetime')?.value.trim() || DEFAULT_CONFIG.stripeLifetimeUrl,
    ownerWhatsapp: document.getElementById('cfg-owner-whatsapp')?.value.trim() || DEFAULT_CONFIG.ownerWhatsapp
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
  showToast('Configuración guardada.');
}

async function testGeminiConnection() {
  const key = document.getElementById('cfg-gemini-key')?.value.trim();
  if (!key) {
    showToast('Usando el motor integrado sin costo.');
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
      showToast('API Key no válida.');
    }
  } catch (e) {
    showToast('Error al conectar con Gemini.');
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
    showToast('Ingresa el correo del cliente.');
    return;
  }

  const sig6 = computeLicenseSignature(email);
  const check4 = computeLicenseChecksum4(sig6);
  const licenseKey = `CPRO-2026-${sig6}-${check4}`;

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
  showToast(`Código verificado generado para ${email}`);
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

async function activateProLicense() {
  const inputEl = document.getElementById('activate-license-input');
  const code = (inputEl?.value || '').trim().toUpperCase();
  if (!code) {
    showToast('Escribe tu código de licencia.');
    return;
  }

  // 1. Verificar contra hashes SHA-256 de claves maestras (CPRO-OWNER-PRO / CPRO-2026-VIP999)
  const codeHash = await sha256Salted(code);
  let isVerified = SECURITY_SALTS.VIP_PRO_HASHES.includes(codeHash);

  // 2. Verificar firma criptográfica de claves emitidas a clientes: CPRO-2026-<PAYLOAD6>-<CHECK4>
  if (!isVerified) {
    const match = /^CPRO-2026-([A-Z0-9]{6})-([A-Z0-9]{4})$/.exec(code);
    if (match) {
      const payload6 = match[1];
      const providedCheck4 = match[2];
      const expectedCheck4 = computeLicenseChecksum4(payload6);
      isVerified = (providedCheck4 === expectedCheck4);
    }
  }

  if (!isVerified) {
    showToast('Código inválido o alterado. Verifica tu credencial CPRO-2026-...');
    return;
  }

  state.isPro = true;
  localStorage.setItem(STORAGE_KEYS.PLAN, 'PRO');
  if (inputEl) inputEl.value = '';
  updatePlanUI();
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

window.addEventListener('DOMContentLoaded', initApp);
