# Fase 3: Producción — Sub-Plan Detallado

## Prerequisitos (Fase 1 y 2) ✅
- [x] 29 tests passing
- [x] Build exitoso
- [x] Error handling con retry + timeout
- [x] UI components
- [x] Email transaccional (Resend)
- [x] Settings page
- [x] Onboarding wizard
- [x] Todas las API keys configuradas

---

## 3.1 Documentación

### 3.1.1 Crear README.md
**Archivo:** `README.md`

**Contenido:**
```markdown
# StarPress

Turn Google Reviews Into Revenue. Embed reviews on your website, get AI-powered insights, and grow your business.

## Tech Stack
- Next.js 16 (App Router)
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Apify (Review scraping)
- OpenAI GPT-4o (AI analysis)
- Stripe (Payments)
- Resend (Emails)
- Sentry (Error tracking)

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- Apify account
- OpenAI account
- Stripe account
- Resend account (optional)
- Sentry account (optional)

## Setup

1. Clone the repo
   git clone https://github.com/mtfrat/starpress.git

2. Install dependencies
   npm install

3. Copy .env.example to .env.local
   cp .env.example .env.local

4. Fill in your API keys in .env.local

5. Run database migrations in Supabase SQL Editor
   - supabase/migrations/001_initial_schema.sql
   - supabase/migrations/002_add_widget_type.sql
   - supabase/migrations/003_add_feedback.sql
   - supabase/migrations/004_add_gbp_tokens.sql
   - supabase/migrations/005_add_webhooks.sql
   - supabase/migrations/006_add_sort_by.sql

6. Start development server
   npm run dev

## Scripts
- npm run dev - Start development server
- npm run build - Build for production
- npm run start - Start production server
- npm run test - Run tests in watch mode
- npm run test:run - Run tests once
- npm run lint - Run linter
- npm run check:stripe - Verify Stripe configuration

## Project Structure
[Insertar estructura completa]

## Deployment
See docs/DEPLOYMENT.md
```

### 3.1.2 Crear .env.example
**Archivo:** `.env.example`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Apify
APIFY_API_TOKEN=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_YEARLY_PRICE_ID=

# Resend (optional)
RESEND_API_KEY=
FEEDBACK_ALERT_FROM=noreply@starpress.app

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Google Business Profile (optional)
GOOGLE_GBP_CLIENT_ID=
GOOGLE_GBP_CLIENT_SECRET=

# Upstash Redis (optional - for rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=
```

### 3.1.3 Crear docs/DEPLOYMENT.md
**Archivo:** `docs/DEPLOYMENT.md`

**Contenido:**
- Pre-deploy checklist
- Vercel setup
- Environment variables
- Domain configuration
- DNS setup
- SSL verification
- Post-deploy verification

---

## 3.2 Monitoring

### 3.2.1 Configurar Sentry Alerts
**Acción:** En Sentry Dashboard:
1. Settings → Notifications
2. Configurar email alerts para errores nuevos
3. Configurar Slack integration (opcional)

### 3.2.2 Crear health check endpoint
**Archivo:** `src/app/api/health/route.ts`

```ts
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

### 3.2.3 Agregar uptime monitoring
**Opción A:** Usar UptimeRobot (gratis)
- URL: `https://starpress.puna-tech.com/api/health`
- Intervalo: 5 minutos

**Opción B:** Usar Vercel Analytics
- Ya incluido en Vercel
- Monitorea uptime automáticamente

---

## 3.3 Performance

### 3.3.1 Bundle analysis
**Acción:** Ejecutar `npx @next/bundle-analyzer`
- Identificar chunks grandes
- Optimizar imports

### 3.3.2 Code splitting
**Archivo:** `next.config.ts`

```ts
const nextConfig = {
  // ... existing config
  experimental: {
    optimizePackageImports: ['lucide-react', '@sentry/nextjs'],
  },
};
```

### 3.3.3 Caching para widget data
**Archivo:** `src/app/api/widget/[locationId]/route.ts`

Agregar cache headers:
```ts
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  },
});
```

### 3.3.4 Optimizar imágenes
- Usar Next.js Image component
- Configurar formatos WebP/AVIF
- Lazy loading por defecto

---

## 3.4 Security Audit

### 3.4.1 Revisar RLS policies
**Acción:** En Supabase Dashboard → SQL Editor
- Verificar que cada tabla tiene RLS habilitado
- Verificar que los policies son correctos
- Verificar que no hay tablas sin RLS

### 3.4.2 Revisar API routes
**Checklist:**
- [ ] Todas las routes autenticadas verifican auth
- [ ] No se exponen datos sensibles en respuestas
- [ ] Rate limiting configurado en endpoints públicos
- [ ] Input validation en todas las POST routes
- [ ] No hay secrets en el código fuente

### 3.4.3 Revisar .gitignore
**Archivo:** `.gitignore`

Verificar que incluye:
```
.env.local
.env
*.log
node_modules
.next
.vercel
```

### 3.4.4 Revisar CSP headers
**Archivo:** `next.config.ts`

Verificar que Content-Security-Policy está configurado correctamente.

### 3.4.5 Dependency audit
**Acción:** Ejecutar `npm audit`
- Revisar vulnerabilidades
- Actualizar dependencias si es necesario

---

## Resumen de Archivos

### Crear (4 archivos)
| Archivo | Descripción |
|---------|-------------|
| `README.md` | Documentación principal |
| `.env.example` | Template de variables de entorno |
| `docs/DEPLOYMENT.md` | Guía de deploy |
| `src/app/api/health/route.ts` | Health check endpoint |

### Modificar (2 archivos)
| Archivo | Cambio |
|---------|--------|
| `next.config.ts` | +optimizePackageImports, +cache headers |
| `.gitignore` | Verificar que incluye todos los archivos sensibles |

---

## Estimación de Tiempo

| Tarea | Horas |
|-------|-------|
| README.md completo | 2h |
| .env.example | 0.5h |
| docs/DEPLOYMENT.md | 1.5h |
| Health check endpoint | 0.5h |
| Sentry alerts setup | 0.5h |
| Performance optimizations | 2h |
| Security audit | 2h |
| **Total** | **9h** |

---

## Verificación

Al finalizar la Fase 3:
- [ ] README.md completo con instrucciones de setup
- [ ] .env.example con todas las variables
- [ ] docs/DEPLOYMENT.md con guía paso a paso
- [ ] Health check endpoint funciona
- [ ] Sentry alerts configurados
- [ ] Bundle size optimizado
- [ ] Security audit completado
- [ ] `npm run test:run` → todos los tests pasan
- [ ] `npm run build` → build exitoso
- [ ] `npm audit` → sin vulnerabilidades críticas
