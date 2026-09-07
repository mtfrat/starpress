# Fase 2: UX Básica — Sub-Plan Detallado

## Prerequisitos (Fase 1) ✅
- [x] 29 tests passing
- [x] Build exitoso
- [x] Error handling con retry + timeout
- [x] UI components (Skeleton, Spinner, Toast, Progress, ErrorBoundary)

---

## 2.1 Email Transaccional (Resend)

### 2.1.1 Instalar Resend SDK
```bash
npm install resend
```

### 2.1.2 Crear email utility
**Archivo:** `src/lib/email.ts`

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emails = {
  welcome: async (to: string, name: string) => {
    await resend.emails.send({
      from: 'StarPress <noreply@starpress.app>',
      to,
      subject: 'Welcome to StarPress!',
      html: welcomeTemplate(name),
    });
  },
  
  paymentSuccess: async (to: string, plan: string) => {
    await resend.emails.send({
      from: 'StarPress <billing@starpress.app>',
      to,
      subject: `You're now on ${plan}!`,
      html: paymentSuccessTemplate(plan),
    });
  },
  
  passwordReset: async (to: string, resetUrl: string) => {
    await resend.emails.send({
      from: 'StarPress <noreply@starpress.app>',
      to,
      subject: 'Reset your password',
      html: passwordResetTemplate(resetUrl),
    });
  },
};
```

### 2.1.3 Crear templates HTML
**Archivos:**
- `src/lib/email-templates/welcome.ts`
- `src/lib/email-templates/payment-success.ts`
- `src/lib/email-templates/password-reset.ts`

### 2.1.4 Integrar en flujo de signup
**Archivo:** `src/app/auth/signup/page.tsx`

**Cambio:** Después del signup exitoso, enviar email de bienvenida.

### 2.1.5 Integrar en webhook de Stripe
**Archivo:** `src/app/api/stripe/webhook/route.ts`

**Cambio:** En `checkout.session.completed`, enviar email de confirmación de pago.

---

## 2.2 Settings/Account Page

### 2.2.1 Crear route
**Archivo:** `src/app/settings/page.tsx`

### 2.2.2 Sección: Perfil
- Nombre
- Email (read-only)
- Botón guardar

### 2.2.3 Sección: Cambiar contraseña
- Contraseña actual
- Nueva contraseña
- Confirmar contraseña
- Botón actualizar

### 2.2.4 Sección: Billing
- Plan actual (Free/Pro)
- Fecha de renovación
- Botón "Manage Billing" → Stripe Portal
- Historial de facturas

### 2.2.5 Sección: Danger Zone
- Botón "Delete Account"
- Confirmación modal
- Lógica de eliminación (GDPR)

### 2.2.6 Agregar link en dashboard
**Archivo:** `src/app/dashboard/page.tsx`

**Cambio:** Agregar link "Settings" en el header.

---

## 2.3 Onboarding Wizard

### 2.3.1 Crear route
**Archivo:** `src/app/onboarding/page.tsx`

### 2.3.2 Step 1: Seleccionar plan
- Free ($0) vs Pro ($19/mo)
- Beneficios de cada plan
- Botón "Continue"

### 2.3.3 Step 2: Agregar primera ubicación
- Input para Google Maps URL
- Botón "Scrape Reviews"
- Loading state durante scraping
- Preview de reseñas encontradas

### 2.3.4 Step 3: Personalizar widget
- Selección de tipo (list/carousel/badge)
- Colores
- Preview en tiempo real
- Botón "Save Widget"

### 2.3.5 Step 4: Copiar embed code
- Code snippet
- Botón "Copy to Clipboard"
- Instrucciones para diferentes plataformas (WordPress, HTML, etc.)
- Botón "Go to Dashboard"

### 2.3.6 Progress indicator
- Steps visuales en el header
- Estado guardado (para continuar después)

### 2.3.7 Redirect post-onboarding
- Si ya completó → redirect a /dashboard
- Si está a mitad → continuar desde donde quedó

---

## 2.4 OG Image

### 2.4.1 Crear imagen
**Archivo:** `public/og-image.png`

**Especificaciones:**
- 1200 x 630px
- Logo de StarPress
- Tagline: "Turn Google Reviews Into Revenue"
- Brand colors: #2545ff, #0c1754

### 2.4.2 Verificar meta tags
**Archivo:** `src/app/layout.tsx`

**Cambio:** Asegurar que `og:image` apunte a `/og-image.png`.

---

## Resumen de Archivos

### Crear (15 archivos)
| Archivo | Descripción |
|---------|-------------|
| `src/lib/email.ts` | Email utility con Resend |
| `src/lib/email-templates/welcome.ts` | Template de bienvenida |
| `src/lib/email-templates/payment-success.ts` | Template de pago exitoso |
| `src/lib/email-templates/password-reset.ts` | Template de reset de contraseña |
| `src/app/settings/page.tsx` | Settings page |
| `src/app/settings/ProfileSection.tsx` | Sección de perfil |
| `src/app/settings/PasswordSection.tsx` | Sección de contraseña |
| `src/app/settings/BillingSection.tsx` | Sección de billing |
| `src/app/settings/DangerZone.tsx` | Zona de peligro |
| `src/app/onboarding/page.tsx` | Onboarding wizard |
| `src/app/onboarding/Step1Plan.tsx` | Step 1: Plan |
| `src/app/onboarding/Step2Location.tsx` | Step 2: Location |
| `src/app/onboarding/Step3Widget.tsx` | Step 3: Widget |
| `src/app/onboarding/Step4Embed.tsx` | Step 4: Embed |
| `public/og-image.png` | OG image |

### Modificar (4 archivos)
| Archivo | Cambio |
|---------|--------|
| `package.json` | +resend |
| `src/app/auth/signup/page.tsx` | +enviar email de bienvenida |
| `src/app/api/stripe/webhook/route.ts` | +enviar email de pago |
| `src/app/dashboard/page.tsx` | +link a Settings |

---

## Estimación de Tiempo

| Tarea | Horas |
|-------|-------|
| Configurar Resend + email utility | 2h |
| Templates HTML (3) | 3h |
| Integrar emails en signup + webhook | 1h |
| Settings page (4 secciones) | 4h |
| Onboarding wizard (4 pasos) | 5h |
| OG Image | 1h |
| Testing manual | 2h |
| **Total** | **18h** |

---

## Dependencias

```
npm install resend
```

## Variables de Entorno

```bash
RESEND_API_KEY=re_...  # Ya configurada en .env.local
```

---

## Verificación

Al finalizar la Fase 2:
- [ ] Email de bienvenida se envía al signup
- [ ] Email de pago se envía al upgrade a Pro
- [ ] Settings page funciona (perfil, password, billing)
- [ ] Onboarding wizard completo (4 pasos)
- [ ] OG image aparece en social sharing
- [ ] `npm run test:run` → todos los tests pasan
- [ ] `npm run build` → build exitoso
