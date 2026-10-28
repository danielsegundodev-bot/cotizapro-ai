# CotizaPro AI — Micro-SaaS de Propuestas Comerciales, Contratos Legales y Auditoría B2B

**CotizaPro AI** es una plataforma Micro-SaaS llave en mano diseñada con un **Triple Motor de Monetización** para generar ingresos recurrentes, ventas B2B de alto ticket y comisiones de afiliados con **$0 USD de costo de servidor** (lista para GitHub Pages o servidor Python con SQLite).

---

## 💰 Los 3 Motores de Ingresos Integrados

1. **Motor 1 — Suscripciones SaaS & Licencias PRO ($9/mes o $29 USD Lifetime):**
   - Los usuarios pueden generar hasta **3 cotizaciones gratis** (las cuales llevan una marca de agua viral al pie del PDF que atrae tráfico orgánico a tu plataforma).
   - Para eliminar la marca de agua y desbloquear cotizaciones ilimitadas, el usuario adquiere el **Plan PRO** mediante tu enlace de **Stripe / LemonSqueezy / MercadoPago / PayPal** o pago directo por WhatsApp.
   - En el **Panel de Dueño** tienes un **Generador Criptográfico de Licencias (`CPRO-2026-...`)** para activar cuentas de clientes con 100% de margen para ti.

2. **Motor 2 — Cierre de Proyectos B2B High-Ticket ($300 a $1,500 USD por cliente):**
   - Incluye la herramienta **Auditor B2B & WhatsApp Closer**: ingresas los datos de cualquier negocio (clínica, restaurante, inmobiliaria, despacho, tienda) y calcula en tiempo real cuánto dinero pierde al mes por no automatizar su captación.
   - Genera el **Guion de Venta por WhatsApp** listo para enviar y convierte el diagnóstico en una **Propuesta PDF con Contrato Legal y Firma Digital** en 1 clic.

3. **Motor 3 — Comisiones Automáticas de Afiliados ($60 a $180 USD extra por proyecto):**
   - Cada PDF exportado y el tab **Kit Afiliados** incluyen recomendaciones de infraestructura (Hosting, E-Commerce, Automatización CRM) con tus enlaces de referido configurables desde el Panel de Dueño.

---

## 🚀 Cómo Ejecutar Localmente

```bash
cp .env.example .env   # define tus secretos (nunca subas .env a GitHub)
python server.py
```

Abre en tu navegador: `http://localhost:8080`

Si cambias clases de Tailwind en `index.html` o `app.js`, recompila el CSS estático
(la CSP no permite cargar scripts de terceros como el CDN de Tailwind):

```bash
npm install && npm run build:css
```

El **Panel de Propietario** se abre desde el pie de página ("Acceso Propietario") con la clave definida en
`COTIZAPRO_OWNER_PASSWORD`. La clave se verifica en el servidor y nunca se incluye en el código del navegador.
Si la variable no está definida, el panel queda deshabilitado.

## 💳 Desbloqueo PRO seguro con Stripe

1. En cada Payment Link de Stripe, en **Después del pago → Redirigir a tu sitio**, usa:
   `https://TU-DOMINIO/?session_id={CHECKOUT_SESSION_ID}`
2. Define `STRIPE_SECRET_KEY` en `.env` (idealmente una *restricted key* de solo lectura).
3. Al volver de Stripe, el servidor consulta la sesión en la API de Stripe, confirma que está pagada
   y emite una licencia única `CPRO-XXXXX-XXXXX-XXXXX-XXXXX` (cada pago canjea una sola licencia).
   Las suscripciones mensuales dejan de ser válidas cuando se cancelan en Stripe.

> GitHub Pages solo sirve archivos estáticos: ahí funciona el cotizador como demo, pero el desbloqueo PRO
> y el Panel de Propietario requieren desplegar `server.py` (Render, Railway, Fly.io, un VPS, etc.).

## 🛡️ Pruebas de seguridad

```bash
python -m unittest discover -s tests -v
```

La suite reproduce los ataques corregidos (secuestro de enlaces de Stripe, licencias falsificadas,
PRO gratis por URL, XSS almacenado, fuga de cotizaciones entre usuarios, CSRF, archivos sensibles)
y se ejecuta en GitHub Actions antes de cada despliegue.
