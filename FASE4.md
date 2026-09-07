# Fase 4: Beta Cerrada — Sub-Plan Detallado

## Prerequisitos (Fase 1-3) ✅
- [x] 29 tests passing
- [x] Build exitoso
- [x] Error handling, loading states, UI components
- [x] Email transaccional (Resend)
- [x] Settings page, Onboarding wizard
- [x] Docs completos (README, .env.example, DEPLOYMENT.md)
- [x] Health check endpoint
- [x] Performance optimizado
- [x] Security audit aprobado
- [x] Todas las API keys configuradas

---

## 4.1 Deploy a Vercel

### 4.1.1 Preparar repositorio
**Acción:** Hacer push de todos los cambios a GitHub

```bash
cd C:\Users\martin\Documents\Default Project\starpress
git add -A
git commit -m "feat: ready for beta deployment"
git push origin main
```

### 4.1.2 Crear proyecto en Vercel
1. Ir a [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Seleccionar **GitHub** → `mtfrat/starpress`
4. Click **"Import"**

### 4.1.3 Configurar Variables de Entorno
En Vercel Dashboard → Settings → Environment Variables, agregar:

| Variable | Valor | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fpbncsjens...` | Production |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Production |
| `APIFY_API_TOKEN` | `apify_api_PS...` | Production |
| `OPENAI_API_KEY` | `sk-proj-hax...` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://starpress.puna-tech.com` | Production |
| `STRIPE_SECRET_KEY` | `sk_test_51UBd...` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_omb4...` | Production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_51UBd...` | Production |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | `price_1UBdHN...` | Production |
| `STRIPE_PRO_YEARLY_PRICE_ID` | `price_1UBdHN...` | Production |
| `RESEND_API_KEY` | `re_eEyGbx8...` | Production |
| `FEEDBACK_ALERT_FROM` | `noreply@starpress.app` | Production |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://e771882...` | Production |
| `SENTRY_AUTH_TOKEN` | (tu token) | Production |

### 4.1.4 Build Settings
- **Framework Preset:** Next.js
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 4.1.5 Deploy
1. Click **"Deploy"**
2. Esperar a que termine (2-3 minutos)
3. Verificar que el build es exitoso
4. Obtener URL temporal de Vercel (ej: `starpress-xxx.vercel.app`)

---

## 4.2 Configurar Dominio

### 4.2.1 Agregar dominio en Vercel
1. En Vercel Dashboard → Settings → Domains
2. Click **"Add"**
3. Escribir: `starpress.puna-tech.com`
4. Click **"Add"**

### 4.2.2 Configurar DNS
En el proveedor de DNS de puna-tech.com (donde tengas el dominio):

Agregar registro CNAME:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| CNAME | starpress | cname.vercel-dns.com | 3600 |

### 4.2.3 Verificar SSL
1. Esperar 5-10 minutos a que se propague el DNS
2. Verificar que `https://starpress.puna-tech.com` carga con SSL
3. Verificar que `https://starpress.puna-tech.com/api/health` retorna `{ status: 'ok' }`

---

## 4.3 Configurar Supabase (Producción)

### 4.3.1 Ejecutar migraciones SQL
En Supabase Dashboard → SQL Editor, ejecutar en orden:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_add_widget_type.sql`
3. `supabase/migrations/003_add_feedback.sql`
4. `supabase/migrations/004_add_gbp_tokens.sql`
5. `supabase/migrations/005_add_webhooks.sql`
6. `supabase/migrations/006_add_sort_by.sql`

### 4.3.2 Verificar tablas
En Supabase Dashboard → Table Editor, verificar que existen:
- `profiles`
- `locations`
- `widget_configs`
- `reviews_cache`
- `feedback`
- `gbp_tokens`
- `webhooks`

### 4.3.3 Verificar RLS
En Supabase Dashboard → Authentication → Policies, verificar que:
- Todas las tablas tienen RLS habilitado
- Los policies son correctos

---

## 4.4 Configurar Stripe (Producción)

### 4.4.1 Cambiar a Live Mode
1. En Stripe Dashboard, click **"Entorno de prueba"** → **"Cambia a la cuenta activa"**
2. Copiar las keys de producción:
   - `sk_live_...` (Secret key)
   - `pk_live_...` (Publishable key)

### 4.4.2 Crear productos en Live Mode
1. Products → Add Product
2. Crear **StarPress Pro (Monthly)** - $19/mes
3. Crear **StarPress Pro (Yearly)** - $190/año
4. Copiar los `price_...` IDs

### 4.4.3 Configurar webhook en Live Mode
1. Developers → Webhooks → Add endpoint
2. URL: `https://starpress.puna-tech.com/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copiar el `whsec_...`

### 4.4.4 Actualizar Vercel
Actualizar las variables de entorno en Vercel con las keys de producción.

---

## 4.5 Configurar Sentry (Producción)

### 4.5.1 Verificar proyecto
1. En Sentry Dashboard, verificar que el proyecto está configurado
2. Verificar que los errores se están capturando
3. Configurar alerts:
   - Settings → Notifications → Email alerts para errores nuevos

### 4.5.2 Verificar en producción
1. Hacer un request a una API route que falle
2. Verificar que Sentry captura el error
3. Verificar que llega email de alerta

---

## 4.6 Beta Testers

### 4.6.1 Seleccionar beta testers
**Objetivo:** 5-10 negocios reales

**Criterios:**
- Negocio físico con presencia en Google Maps
- Al menos 10 reseñas en Google
- Dispuesto a probar el widget en su web
- Dispuesto a dar feedback

**Fuentes:**
- Contactos personales
- Empresas locales (restaurantes, dentistas, hoteles)
- LinkedIn outreach

### 4.6.2 Crear cuentas de beta tester
Para cada beta tester:
1. Crear cuenta en StarPress
2. Agregar su ubicación
3. Configurar widget
4. Entregar embed code

### 4.6.3 Coordinar setup
Para cada beta tester:
1. Enviar email de bienvenida con instrucciones
2. Agendar call de 15 minutos para setup
3. Ayudar a embedear el widget en su web
4. Verificar que funciona

### 4.6.4 Recopilar feedback
**Métricas a monitorear:**
- Tasa de completar onboarding
- Widgets embeddeados
- Tiempo en el dashboard
- Errores en Sentry
- Pagos Pro

**Feedback a recopilar:**
- ¿El onboarding es claro?
- ¿El widget se ve bien en tu web?
- ¿Los insights son útiles?
- ¿Pagarías $19/mes por esto?

---

## 4.7 Iteración

### 4.7.1 Corregir bugs críticos
- Priorizar bugs que impiden uso básico
- Deploy fixes a Vercel (auto-deploy desde main)

### 4.7.2 Mejorar UX
- Basado en feedback de beta testers
- Simplificar onboarding si es necesario
- Ajustar colores, textos, layout

### 4.7.3 Ajustar pricing
- Si nadie paga $19/mes → considerar bajar a $9/mes
- Si muchos pagan → considerar agregar plan Enterprise

---

## Resumen de Acciones

| Acción | Responsable | Tiempo |
|--------|-------------|--------|
| Push a GitHub | vos | 5 min |
| Crear proyecto en Vercel | vos | 10 min |
| Configurar env vars en Vercel | vos | 15 min |
| Deploy inicial | automático | 3 min |
| Configurar DNS | vos | 10 min |
| Ejecutar migraciones SQL | vos | 10 min |
| Configurar Stripe live mode | vos | 20 min |
| Seleccionar beta testers | vos | 1-2 días |
| Coordinar setup calls | vos | 1-2 días |
| Recopilar feedback | vos | 1 semana |

---

## Verificación Post-Deploy

- [ ] `https://starpress.puna-tech.com` carga correctamente
- [ ] `https://starpress.puna-tech.com/api/health` retorna `{ status: 'ok' }`
- [ ] Signup funciona
- [ ] Login funciona
- [ ] Onboarding wizard funciona
- [ ] Scraping de reseñas funciona
- [ ] Widget se puede embedear
- [ ] Stripe checkout funciona (test mode)
- [ ] Emails se envían (Resend)
- [ ] Sentry captura errores

---

## Timeline

| Día | Acción |
|-----|--------|
| Día 1 | Deploy a Vercel + configurar DNS |
| Día 2 | Ejecutar migraciones SQL + configurar Stripe live |
| Día 3 | Seleccionar beta testers |
| Día 4-5 | Coordinar setup calls |
| Día 6-7 | Recopilar feedback |
| Día 8-14 | Iterar basado en feedback |
