# CotizaPro AI — Contexto del proyecto para asistentes de IA

> Este archivo lo lee automáticamente Claude Code (y `AGENTS.md` apunta aquí para otras IAs).
> Resume qué es el proyecto, cómo está armado, qué se hizo y qué falta. **Nunca pongas secretos aquí.**

## Reglas para trabajar con el dueño

- **Responde siempre en español**, incluidos los resúmenes finales. El código, los commits y los identificadores van en inglés.
- El dueño prefiere que la IA **haga el trabajo completo** y solo le pida lo que únicamente él puede hacer (crear cuentas, autorizar accesos, clics en paneles).
- Commits por fases, en inglés, con prefijo convencional: `security: phase N — ...`, `feat: ...`, `fix: ...`, `seo: ...`, `test: ...`, con un cuerpo que explique el porqué.
- **Antes de desplegar, corre los tests:** `python3 -m unittest discover -s tests -v`. Deben pasar los 38.
- **No escanees el sitio en vivo** pidiendo rutas sensibles (`/.env`, `/.git/config`, `/server.py`…). El firewall de PythonAnywhere banea la IP. Las pruebas de seguridad se hacen en local con la suite de `tests/`.

## Qué es

Micro-SaaS en español (México/LatAm) para crear **cotizaciones profesionales en PDF** con contrato, firma digital,
envío por WhatsApp, calculadora de ROI y autocompletado con IA (Gemini). Modelo freemium:
3 PDFs gratis y luego **PRO** vía Stripe.

- **App en producción:** https://cotizapro.pythonanywhere.com (PythonAnywhere cuenta `cotizapro`, plan gratis, región US)
- **URL anterior:** https://ssjosedaniel.pythonanywhere.com (cuenta `ssjosedaniel`). Ahora solo redirige con 301 a la nueva y conserva ruta y `?session_id=`. Sus credenciales están en `.env` como `PA_OLD_*`.
- **Repositorio:** github.com/danielsegundodev-bot/cotizapro-ai (rama principal `main`)
- **GitHub Pages** (`danielsegundodev-bot.github.io/cotizapro-ai`): solo una página que **redirige** a la app real y conserva `?session_id=`. Pages se sirve desde la rama `gh-pages`, que publica el workflow.

## Arquitectura

| Archivo | Rol |
|---|---|
| `index.html` | UI completa (Tailwind compilado + `styles.css`). Sin handlers inline: usa `data-click` / `data-input` / `data-change` / `data-blur` |
| `app.js` | Lógica del cliente. Las acciones de la UI se despachan desde la lista blanca `UI_ACTIONS` (delegación de eventos) |
| `server.py` | Backend `http.server` + SQLite. Toda la seguridad y la validación viven aquí |
| `wsgi.py` | Adaptador WSGI para PythonAnywhere; reutiliza el mismo `CotizaProHandler` |
| `deploy_pythonanywhere.py` | Despliegue con un comando vía la API de PythonAnywhere |
| `tests/test_security.py` | 38 tests de regresión de seguridad, contra `server.py` y contra `wsgi.py` |
| `pages/` | Página de redirección que se publica en `gh-pages` |
| `tailwind.css` | **Generado**: `npm install && npm run build:css` después de cambiar clases. El CI falla si queda desactualizado |
| `favicon.svg`, `og-image.png`, `robots.txt`, `sitemap.xml` | SEO. Deben estar en `ALLOWED_STATIC_PATHS` (server.py) y en `PROJECT_FILES` (deploy) |

### API del servidor

- Públicas: `GET /api/health`, `GET /api/state`, `POST /api/quotes`, `POST /api/licenses/verify`, `POST /api/stripe/redeem`, `POST /api/ai/generate`
- Solo propietario (Bearer token tras `POST /api/owner/login`): `GET /api/owner/config`, `POST /api/config`, `POST /api/licenses`, `POST /api/owner/gemini/test`, `POST /api/owner/logout`
- Solo se sirven archivos de `ALLOWED_STATIC_PATHS`; el resto da 403, también con `HEAD`.

### Variables de entorno (`.env`, ignorado por git; plantilla en `.env.example`)

`COTIZAPRO_OWNER_PASSWORD`, `STRIPE_SECRET_KEY` (restricted key `rk_live_…` de solo lectura de Checkout Sessions y Subscriptions),
`STRIPE_PAYMENT_LINK_IDS`, `GEMINI_API_KEY` (opcional), `HOST`, `TRUST_PROXY`, y para desplegar `PA_USERNAME`, `PA_API_TOKEN`, `PA_REGION`.
El deploy sube al servidor **solo** los secretos del servidor; el token de PythonAnywhere se queda en la máquina local.
En otra computadora hay que recrear `.env` a mano: los valores los tiene el dueño, no están en el repo.

## Pagos (Stripe, cuenta "Syslo", live)

- **PRO Mensual:** https://buy.stripe.com/eVq3co9No92q3E2g0Vbsc04 · `plink_1UVbHD2Uj5JI4KG84VTcz4eg` · $168.22 MXN/mes (≈ $9 USD)
- **PRO de por vida:** https://buy.stripe.com/eVq28kaRs92qfmK3e9bsc03 · `plink_1UVbFu2Uj5JI4KG8t40HKWZx` · $542.13 MXN (≈ $29 USD)
- Ambos redirigen después del pago a `https://cotizapro.pythonanywhere.com/?session_id={CHECKOUT_SESSION_ID}`.
- Flujo: el cliente vuelve con `session_id` → `POST /api/stripe/redeem` → el servidor consulta la sesión en la API de Stripe (`status=complete`, pagada y de un link permitido) → emite una licencia `CPRO-XXXXX-XXXXX-XXXXX-XXXXX` (100 bits aleatorios, se guarda solo el hash SHA-256). Cada sesión se canjea una sola vez; las licencias mensuales dejan de valer al cancelar la suscripción.
- Links viejos todavía activos en Stripe y que **no** desbloquean PRO: `…Vbsc00`, `…mhbsc01`, `…Cxbsc02`. Conviene desactivarlos.
- Si cambian los precios, actualiza la sección `#precios` y el modal en `index.html`, el JSON-LD y este archivo.

## Seguridad: qué se corrigió (auditoría del 2026-10-28)

Todas las vulnerabilidades se explotaron primero con pruebas reales y después se corrigieron:

1. **Fase 1:** `POST /api/config` no tenía autenticación (cualquiera podía cambiar los links de Stripe y quedarse con los pagos). La clave maestra `CPRO-OWNER-PRO` estaba publicada en el README. → Login del propietario verificado en el servidor, con límite de intentos.
2. **Fase 2:** PRO se regalaba con `?session_id=cs_live_AAAA…`, con licencias falsificables (checksum FNV en JS) y con claves VIP públicas. → Licencias emitidas por el servidor y pago verificado con la API de Stripe.
3. **Fase 3:** `/api/state` exponía las cotizaciones de todos los usuarios. → Aislamiento por `X-Client-Id` aleatorio, validación estricta, CSRF, `HEAD` protegido, bind a 127.0.0.1, timeouts y límites de peticiones.
4. **Fase 4:** La API key de Gemini estaba en el navegador. → Proxy en el servidor (`/api/ai/generate`) con la salida saneada.
5. **Fase 5:** XSS almacenado vía `onclick="loadSavedQuote('${id}')"`. → Se quitaron todos los handlers inline y se usa delegación de eventos con lista blanca.
6. **Fase 6:** CSP con `unsafe-inline` y el CDN de Tailwind. → CSP estricta (también como header) y Tailwind 3.4.17 compilado.
7. **Fase 7:** GitHub Pages publicaba `server.py`; el script de deploy metía el token en la URL. → Actions fijadas por SHA y token por variable de entorno.
8. **Fase 8:** Suite de regresión en CI.
9. **Fase 10:** `gh-pages` todavía servía la app vieja y vulnerable. → Ahora solo hay una página de redirección.

**Límite conocido:** el contador de 3 PDFs gratis y la generación del PDF (`window.print`) viven en el navegador. Alguien técnico puede saltárselos. Arreglarlo exige mover el conteo al servidor (pendiente).

## Producto / UX / SEO (hecho)

- El ejemplo de cotización ya **no trae datos personales del dueño**. Cada usuario escribe los suyos y se guardan solo en su navegador (`cotizapro_sender_profile_v1`).
- Responsive verificado de 360 a 1440 px sin desborde. En celular el header mide 111 px.
- Sección de beneficios, precios y preguntas frecuentes debajo del cotizador.
- SEO: title, description y H1 con palabras clave ("cotizador online gratis", "formato de cotización en PDF"), `es-MX`, canonical, Open Graph y Twitter con `og-image.png`, JSON-LD (WebApplication + FAQPage), `robots.txt` y `sitemap.xml`.
- **Moneda por defecto: MXN.** Las plantillas y el generador local tienen precios base en USD y se convierten con `localizeBasePrice` (tipo de cambio aproximado y redondeo).
- **"Redactar con IA":** si el servidor tiene la key de Gemini (`aiEnabled`), usa `/api/ai/generate` (recibe `currency`). Si no, usa `synthesizeProposalLocally`, que reconoce unos 17 giros (`LOCAL_NICHES`) y la ciudad. El panel `#ai-result` confirma qué se llenó y qué falta, y resalta los cambios (`flash-updated`).
- **Firma:** 3 modos (dibujar en canvas HiDPI, subir PNG/JPG/WEBP de hasta 2 MB quitando el fondo blanco, o escribir con 3 fuentes tipo firma). Todo ocurre en el navegador y nunca se envía al servidor.
- **Diseños del documento** (`DOC_THEMES`, variables CSS `--doc-*` en `styles.css`): Clásico y Minimal son gratis; Moderno, Corporativo, Elegante y Vibrante son PRO. Los PRO se pueden previsualizar, pero descargarlos exige PRO (`isLockedTheme`). El diseño elegido se recuerda y se guarda con cada cotización.
- **Celular:** el botón flotante "Ver cotización" (`#mobile-preview-fab`) aparece mientras la hoja no está en pantalla.
- **Google Search Console:** la etiqueta `<meta name="google-site-verification" …>` está en `index.html`. **No la borres.**

## Operación

- **Desplegar:** `python3 deploy_pythonanywhere.py`. Requiere `.env` con `PA_USERNAME` y `PA_API_TOKEN`.
- **Correr en local:** `python3 server.py` y abrir http://localhost:8080. El panel de propietario está en el pie de página ("Acceso Propietario").
- **Renovación:** el plan gratis de PythonAnywhere exige entrar a la pestaña *Web* cada 3 meses y pulsar "Run until 3 months from today".
- **Bloqueo de IP:** el 2026-10-28 PythonAnywhere baneó la IP de la casa del dueño por escaneo de rutas. Si `www.pythonanywhere.com` no responde desde su red, despliega desde el hotspot del celular (con datos móviles) o espera unas horas.

## Pendientes / ideas

- [x] URL cambiada a `cotizapro.pythonanywhere.com` (2026-10-28); la vieja redirige.
- [ ] A largo plazo: dominio propio (unos $10–15 USD al año), que requiere el plan de pago de PythonAnywhere (unos $5 USD al mes). Al migrar, cambia la URL en `index.html` (canonical, og, twitter, JSON-LD), `robots.txt`, `sitemap.xml`, `pages/`, `CLAUDE.md`, las redirecciones de Stripe y Search Console.
- [ ] Mover al servidor el límite de 3 PDFs gratis.
- [ ] Páginas de aterrizaje por giro (cotización para página web, remodelación, fotografía, clínica…) para ganar búsquedas de Google.
- [ ] Renovar el token de API de PythonAnywhere (se expuso en un chat).
- [ ] Desactivar los 3 Payment Links viejos en Stripe.
- [ ] Enviar `sitemap.xml` en Search Console y pedir la indexación.
