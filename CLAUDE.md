# CotizaPro AI — Contexto del proyecto para asistentes de IA

> Este archivo lo lee automáticamente Claude Code (y `AGENTS.md` apunta aquí para otras IAs).
> Resume qué es el proyecto, cómo está armado, qué se hizo y qué falta. **Nunca pongas secretos aquí.**

## Reglas para trabajar con el dueño

- **Responde siempre en español**, incluidos los resúmenes finales. El código, los commits y los identificadores van en inglés.
- El dueño prefiere que la IA **haga el trabajo completo** y solo le pida lo que únicamente él puede hacer (crear cuentas, autorizar accesos, clics en paneles).
- Commits por fases, en inglés, con prefijo convencional: `security: phase N — ...`, `feat: ...`, `fix: ...`, `seo: ...`, `test: ...`, con un cuerpo que explique el porqué.
- **Antes de desplegar, corre las pruebas:**
  - Servidor: `npm test` (= `python3 -m unittest discover -s tests -v`). Deben pasar los 41 tests.
  - Navegador (`tests/e2e/`, Puppeteer con el Chrome instalado; si no está en la ruta de macOS, usa `CHROME_PATH`): levanta un servidor de prueba con `GEMINI_API_KEY= COTIZAPRO_OWNER_PASSWORD=frase-larga-de-prueba-123 COTIZAPRO_DB_PATH=/tmp/t.db PORT=8765 python3 server.py` y corre `smoke.js` (21 checks), `features.js` (25) y `onboarding.js` (22).
  - Reinicia el servidor entre suites: el límite de 20 verificaciones de licencia por minuto por IP puede dar falsos fallos si las corres seguidas.
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
| `tests/test_security.py` | 41 tests de regresión (seguridad, IA y SEO), contra `server.py` y contra `wsgi.py` |
| `tests/e2e/` | Pruebas en navegador real: `smoke.js` (flujo completo y ataques XSS), `features.js` (IA, firma, diseños, celular) y `onboarding.js` (arranque en blanco, logo y guía) |
| `legacy_redirect_wsgi.py` | App WSGI de la cuenta vieja `ssjosedaniel`: redirige con 301 a la URL nueva |
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

- **Arranque en blanco:** la página no trae cotización de ejemplo (sin cliente, título ni conceptos). Los campos muestran ejemplos en gris (`placeholder`) y la hoja muestra textos guía en gris itálica (`DOC_PLACEHOLDERS` y la clase `.doc-placeholder`). Editar un texto guía directo en la hoja no lo copia al formulario. "+ Nueva en Blanco" deja la página igual que al entrar.
- **Antes de descargar el PDF** se exige: tu nombre o empresa, el nombre del cliente, el título y al menos un concepto con precio. Si falta algo, se avisa qué y se lleva al usuario al campo.
- **Datos del emisor y logo** (gratis y PRO): cada usuario escribe los suyos y se guardan solo en su navegador (`cotizapro_sender_profile_v1`: `name`, `contact`, `logo`). El logo acepta PNG/JPG/WEBP de hasta 2 MB (SVG no, porque puede llevar scripts), se redimensiona a un máximo de 480×200 y se muestra arriba de la hoja (`#doc-logo`). Al cargar solo se aceptan data URLs `image/png|webp`, nunca URLs externas.
- **Guía rápida (burbujas):** 9 pasos (`TOUR_STEPS`) que resaltan IA, plantillas, datos y logo, pasos, vista previa, diseños, WhatsApp, descarga e historial.
  - Aparece sola en la primera visita (`cotizapro_tour_done_v1`), salvo al volver de Stripe.
  - Se repite con el botón "?" del header. Se controla con Esc y con las flechas.
  - Se adapta a celular y escritorio: baja hasta cada elemento y acomoda la burbuja dentro de la pantalla.
- Responsive verificado de 360 a 1440 px sin desborde. Header: 67–74 px en escritorio; en celular, 2 renglones (111 px). El eslogan, el contador de cotizaciones gratis y "Modo Carbón" solo se ven desde 1400 px.
- Sección de beneficios, precios y preguntas frecuentes debajo del cotizador.
- SEO: title, description y H1 con palabras clave ("cotizador online gratis", "formato de cotización en PDF"), `es-MX`, canonical, Open Graph y Twitter con `og-image.png`, JSON-LD (WebApplication + FAQPage), `robots.txt` y `sitemap.xml`.
- **Moneda por defecto: MXN.** Las plantillas y el generador local tienen precios base en USD y se convierten con `localizeBasePrice` (tipo de cambio aproximado y redondeo).
- **Gemini (activo desde 2026-10-28, key gratuita de Google AI Studio en `.env` como `GEMINI_API_KEY`):** usa los modelos `GEMINI_MODELS` en orden, `gemini-3.5-flash-lite` (≈1.5 s) → `gemini-3.1-flash-lite` → `gemini-3.5-flash`, con reintento si Google está saturado (503 frecuente en el plan gratis). Si todo falla, el navegador usa el motor local. Las keys nuevas de Google tienen formato `AQ.…` (con punto). El prompt pide no inventar el nombre del cliente.
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

## Historial de cambios (2026-10-28)

1. Auditoría de seguridad en 10 fases (ver arriba) y suite de regresión.
2. Despliegue gratis en PythonAnywhere (`wsgi.py` y `deploy_pythonanywhere.py`); después, cambio a `cotizapro.pythonanywhere.com` con redirección 301 desde la URL vieja.
3. Stripe: links nuevos que regresan a la app con `session_id`; el servidor verifica el pago y solo aceptan pagos de esos links.
4. Privacidad (sin datos del dueño), responsive, sección de precios y preguntas frecuentes, SEO técnico y Search Console.
5. IA con confirmación visible, firma (dibujar, subir o escribir), 6 diseños (4 PRO), menos ruido visual y MXN por defecto.
6. Gemini real (`gemini-3.5-flash-lite` con respaldo entre modelos).
7. Arranque en blanco, logo para todos los planes, guía con burbujas y pruebas de navegador en `tests/e2e/`.

## Pendientes / ideas

- [x] URL cambiada a `cotizapro.pythonanywhere.com` (2026-10-28); la vieja redirige.
- [ ] A largo plazo: dominio propio (unos $10–15 USD al año), que requiere el plan de pago de PythonAnywhere (unos $5 USD al mes). Al migrar, cambia la URL en `index.html` (canonical, og, twitter, JSON-LD), `robots.txt`, `sitemap.xml`, `pages/`, `CLAUDE.md`, las redirecciones de Stripe y Search Console.
- [ ] **PRIORIDAD: el límite de 3 PDFs gratis se puede saltar.** Hoy el contador vive en `localStorage` (`cotizapro_free_usage_v1`) y el PDF se genera con `window.print()` en el navegador. Con modo incógnito, borrando datos, cambiando de navegador o con DevTools se obtienen cotizaciones ilimitadas. El PRO sí está protegido (licencias verificadas en el servidor); lo débil es solo el límite gratuito.
  Plan propuesto (de menor a mayor esfuerzo):
  1. **Contador en el servidor por huella**: `POST /api/usage/consume` antes de imprimir, contando por IP (con `TRUST_PROXY`/`X-Real-IP`) + `X-Client-Id`. Frena a la mayoría, aunque con VPN o red móvil cambia la IP.
  2. **Cuenta gratuita con correo verificado** (enlace mágico de un solo uso): el límite se cuenta por correo. Es lo más efectivo sin pedir tarjeta.
  3. **PDF generado en el servidor** para usuarios sin PRO (o la marca de agua aplicada en el servidor), para que la versión gratis no pueda imprimirse sin pasar por el contador. Con `window.print()` siempre se podrá imprimir la vista previa con DevTools.
  4. Mantener la marca de agua "Generada con CotizaPro" en la versión gratis como incentivo (hoy también se puede quitar desde el navegador).
  Recomendación: 1 + 4 primero (rápido), luego 2 si hay abuso real. No bloquear de más: un poco de "fuga" en la versión gratis también trae usuarios.
- [ ] Páginas de aterrizaje por giro (cotización para página web, remodelación, fotografía, clínica…) para ganar búsquedas de Google.
- [ ] Renovar el token de API de PythonAnywhere (se expuso en un chat).
- [ ] Desactivar los 3 Payment Links viejos en Stripe.
- [ ] Enviar `sitemap.xml` en Search Console y pedir la indexación.
