# StarPress — Plan de Implementación para Lanzamiento

## Estado Actual
- Core features: funcionando
- Stripe: configurado (test mode)
- Landing page + SEO: completo
- Rate limiting + Sentry: configurado

---

## Fase 1: Estabilidad (Semana 1)
**Objetivo:** Que no se rompa nada crítico.

### 1.1 Tests Unitarios
- [ ] Configurar Vitest
- [ ] Test `src/lib/review-scoring.ts` (algoritmo de scoring)
- [ ] Test `src/lib/rate-limit.ts` (rate limiting logic)
- [ ] Test `src/lib/stripe.ts` (helper functions)
- [ ] Test `src/app/api/stripe/webhook/route.ts` (event handling)
- [ ] Test `src/app/api/locations/route.ts` (scraping flow)
- [ ] Test `src/app/api/analyze/route.ts` (AI analysis)

### 1.2 Error Handling Robusto
- [ ] Crear `src/lib/errors.ts` (clases de error customizadas)
- [ ] Actualizar API routes para usar error classes
- [ ] Agregar retry logic para Apify (3 intentos con backoff)
- [ ] Agregar retry logic para OpenAI (3 intentos con backoff)
- [ ] Agregar timeout en fetch de Apify (120s max)
- [ ] Agregar timeout en fetch de OpenAI (60s max)
- [ ] Log errors a Sentry con contexto (userId, locationId, etc.)

### 1.3 Loading States
- [ ] Skeleton loaders en dashboard
- [ ] Loading spinner en botones de acción
- [ ] Optimistic updates en UI (toggle, delete, etc.)
- [ ] Progress indicators para scraping
- [ ] Toast notifications para éxito/error

### 1.4 Error Boundary por Sección
- [ ] Error boundary en AI Analysis section
- [ ] Error boundary en Weekly Report section
- [ ] Error boundary en GBP Sync section
- [ ] Error boundary en Widget Config

---

## Fase 2: UX Básica (Semana 2)
**Objetivo:** El usuario puede usar el producto sin fricción.

### 2.1 Email Transaccional (Resend)
- [ ] Instalar `resend` SDK (ya está via fetch, migrar a SDK)
- [ ] Email de bienvenida (signup)
- [ ] Email de confirmación de pago (upgrade a Pro)
- [ ] Email de password reset
- [ ] Email de cancelación de suscripción
- [ ] Template HTML responsive para cada email

### 2.2 Settings/Account Page
- [ ] Crear `/settings` route
- [ ] Sección: perfil (nombre, email)
- [ ] Sección: cambiar contraseña
- [ ] Sección: billing (plan actual, facturas)
- [ ] Botón: Stripe Customer Portal
- [ ] Botón: eliminar cuenta (GDPR)

### 2.3 Onboarding Wizard
- [ ] Crear `/onboarding/step-1` (seleccionar plan)
- [ ] Crear `/onboarding/step-2` (pegar Google Maps URL)
- [ ] Crear `/onboarding/step-3` (personalizar widget)
- [ ] Crear `/onboarding/step-4` (copiar embed code)
- [ ] Progress indicator en pasos
- [ ] Skip option
- [ ] Guardar progreso (para continuar después)

### 2.4 OG Image
- [ ] Crear imagen 1200x630px con branding de StarPress
- [ ] Subir a `public/og-image.png`
- [ ] Verificar que aparece en social sharing

---

## Fase 3: Producción (Semana 3)
**Objetivo:** Listo para usuarios reales.

### 3.1 Documentación
- [ ] Crear `README.md` con:
  - Descripción del proyecto
  - Tech stack
  - Prerrequisitos
  - Variables de entorno requeridas
  - Guía de setup local
  - Guía de deploy
  - Estructura del proyecto
- [ ] Crear `docs/DEPLOYMENT.md` con:
  - Checklist pre-deploy
  - Variables de entorno por ambiente
  - Configuración de Stripe
  - Configuración de Supabase
  - Configuración de DNS

### 3.2 Monitoring
- [ ] Configurar Sentry alerts (email + Slack)
- [ ] Configurar Vercel Analytics
- [ ] Dashboard de usage en Supabase (queries frecuentes)
- [ ] Alerta de uso de Apify (cuando se acerca al límite)
- [ ] Alerta de uso de OpenAI (cuando se acerca al límite)

### 3.3 Performance
- [ ] Optimizar bundle size (code splitting)
- [ ] Lazy loading de componentes pesados
- [ ] Cache de widget data (5 min TTL)
- [ ] CDN para embed.js
- [ ] Optimizar imágenes

### 3.4 Security Audit
- [ ] Revisar RLS policies en Supabase
- [ ] Revisar CORS en API routes
- [ ] Revisar CSP headers
- [ ] Revisar que no se filtran secrets
- [ ] Revisar que webhook de Stripe valida firma
- [ ] Penetration testing básico

---

## Fase 4: Beta Cerrada (Semana 4)
**Objetivo:** Lanzar con 5-10 usuarios reales.

### 4.1 Pre-Launch
- [ ] Configurar dominio production (starpress.puna-tech.com)
- [ ] Configurar SSL
- [ ] Configurar DNS
- [ ] Deploy a Vercel (production)
- [ ] Configurar Supabase (production)
- [ ] Configurar Stripe (live mode)
- [ ] Configurar Apify (production)
- [ ] Configurar OpenAI (production)
- [ ] Configurar Resend (production)
- [ ] Configurar Sentry (production)

### 4.2 Beta Testing
- [ ] Seleccionar 5-10 negocios reales
- [ ] Crear cuenta de beta tester para cada uno
- [ ] Coordinar setup inicial (15 min por usuario)
- [ ] Recopilar feedback (form o call)
- [ ] Monitorear errores en Sentry
- [ ] Monitorear uso de APIs

### 4.3 Iteración
- [ ] Corregir bugs críticos encontrados
- [ ] Mejorar UX basado en feedback
- [ ] Optimizar flujo de onboarding
- [ ] Ajustar pricing si es necesario

---

## Fase 5: Lanzamiento Público (Semana 5+)
**Objetivo:** Abrir al público general.

### 5.1 Marketing
- [ ] Crear landing page en puna-tech.com/products/starpress
- [ ] Crear post de LinkedIn announcing
- [ ] Crear post de Twitter/X
- [ ] Enviar email a beta testers (pedir testimonio)
- [ ] Crear video demo (1-2 min)
- [ ] Product Hunt launch (opcional)

### 5.2 Growth
- [ ] Implementar referral program
- [ ] Agregar exit-intent popup
- [ ] A/B testing en pricing
- [ ] SEO monitoring (Search Console)
- [ ] Analytics de conversión

### 5.3 Soporte
- [ ] Configurar email de soporte (support@starpress.app)
- [ ] Crear FAQ page
- [ ] Crear chat widget (Intercom o similar)
- [ ] Definir SLA de respuesta

---

## Resumen de Tiempos

| Fase | Semana | Entregable |
|------|--------|------------|
| 1: Estabilidad | 1 | Tests + Error handling + Loading states |
| 2: UX Básica | 2 | Emails + Settings + Onboarding + OG Image |
| 3: Producción | 3 | Docs + Monitoring + Performance + Security |
| 4: Beta | 4 | Deploy + 5-10 beta testers |
| 5: Lanzamiento | 5+ | Marketing + Growth + Soporte |

---

## Dependencias Críticas

```
Supabase SQL migrations → RoDB schema listo
Stripe Live Mode → Pagos reales funcionando
Vercel Deploy → App accesible públicamente
DNS Configuration → Subdominio activo
Resend API Key → Emails funcionando
Sentry DSN → Errores monitoreados
```

---

## Métricas de Éxito (Beta)

| Métrica | Target |
|---------|--------|
| Beta testers activos | 5+ de 10 |
| Tasa de completar onboarding | > 80% |
| Widgets embeddeados | 3+ |
| Pagos Pro | 1+ |
| Errores críticos | 0 |
| NPS score | > 8 |
