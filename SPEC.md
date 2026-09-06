# StarPress — Especificación Técnica por Feature

**Proyecto:** StarPress — Micro-SaaS de Google Reviews Widgets
**Stack:** Next.js 16 (App Router) + Tailwind CSS + Supabase + Apify + OpenAI
**Versión:** 1.1.0
**Fecha:** 2026-08-25

---

## Índice

1. [Arquitectura General](#1-arquitectura-general)
2. [Schema de Base de Datos](#2-schema-de-base-de-datos)
3. [Feature 1: Review Cards Descargables](#3-feature-1-review-cards-descargables)
4. [Feature 2: Carousel Widget](#4-feature-2-carousel-widget)
5. [Feature 3: Badge Widget](#5-feature-3-badge-widget)
6. [Feature 4: AI Response (Responder Reseñas)](#6-feature-4-ai-response)
7. [Feature 5: Review Gating QR + Alertas Instantáneas](#7-feature-5-review-gating-qr)
8. [Feature 6: Weekly Report](#8-feature-6-weekly-report)
9. [Feature 7: SEO Schema Markup](#9-feature-7-seo-schema-markup)
10. [Feature 8: Google Business Profile](#10-feature-8-google-business-profile)
11. [Feature 9: GBP Sync (reemplaza Apify para Pro)](#11-feature-9-gbp-sync)
12. [Feature 10: Outbound Webhooks](#12-feature-10-outbound-webhooks)
13. [Feature 11: Auto-Disputa de Reseñas Falsas](#13-feature-11-auto-disputa-de-reseas-falsas)
14. [Feature 0: Core — Scraping, Auth, Dashboard](#14-feature-0-core)
15. [Variables de Entorno](#15-variables-de-entorno)
16. [Modelo Freemium](#16-modelo-freemium)

---

## 1. Arquitectura General

### Estructura de Directorios

```
starpress/
├── public/
│   └── embed.js                    # Widget embeddable (Vanilla JS + Shadow DOM)
├── src/
│   ├── app/
│   │   ├── page.tsx                # Landing page
│   │   ├── auth/
│   │   │   ├── login/page.tsx      # Login (email + Google OAuth)
│   │   │   ├── signup/page.tsx     # Registro
│   │   │   └── callback/route.ts   # OAuth callback handler
│   │   ├── onboarding/
│   │   │   └── page.tsx            # Paste Google Maps URL
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Dashboard principal
│   │   ├── widget-config/
│   │   │   └── page.tsx            # Configuración del widget
│   │   ├── feedback/
│   │   │   └── [locationId]/
│   │   │       └── page.tsx        # Página pública de feedback (QR landing)
│   │   └── api/
│   │       ├── locations/route.ts      # POST: Apify scraping + DB save
│   │       ├── analyze/route.ts        # POST: OpenAI sentiment analysis
│   │       ├── respond/route.ts        # POST: AI review response
│   │       ├── widget/[locationId]/
│   │       │   └── route.ts            # GET: public widget data
│   │       ├── feedback/route.ts       # POST/GET: save/fetch feedback
│   │       ├── alerts/route.ts         # POST: weekly report
│   │       ├── dispute/route.ts        # POST: AI fake review analysis
│   │       ├── webhooks/route.ts       # GET/POST/DELETE: webhook management
│   │       └── gbp/
│   │           ├── auth/route.ts       # GET: OAuth URL generator
│   │           ├── callback/route.ts   # GET: OAuth callback
│   │           ├── reviews/route.ts    # GET: fetch GBP reviews
│   │           ├── reply/route.ts      # POST: reply to review on Google
│   │           └── sync/route.ts       # POST: sync reviews from GBP
│   ├── components/
│   │   ├── ReviewCard.tsx              # Tarjeta descargable con 5 plantillas
│   │   └── QRCodeGenerator.tsx         # Generador de código QR
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts               # Browser Supabase client
│   │       ├── server.ts               # Server Supabase client + service role
│   │       └── middleware.ts            # Auth middleware
│   └── middleware.ts                    # Next.js middleware wrapper
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql       # Core DB schema
│       ├── 002_add_widget_type.sql      # Widget type column
│       ├── 003_add_feedback.sql         # Feedback table
│       └── 004_add_gbp_tokens.sql       # GBP OAuth tokens
│       └── 005_add_webhooks.sql         # Outbound webhooks
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### Flujo de Datos

```
Usuario → Landing → Auth (Supabase) → Onboarding (paste URL) → API /api/locations
    ↓
Apify scrapes Google Maps → Reviews guardadas en reviews_cache
    ↓
Dashboard carga reviews → Opciones: AI Analysis, AI Response, QR, Cards, GBP Reply
    ↓
Widget embeddable: Host page loads embed.js → Fetch /api/widget/[locationId] → Render widget
```

---

## 2. Schema de Base de Datos

### Tabla: `profiles`

| Columna | Tipo | Constraint | Default | Descripción |
|---------|------|------------|---------|-------------|
| id | uuid | PK, FK → auth.users(id) | — | Referencia al usuario de Supabase Auth |
| plan_tier | text | NOT NULL | 'free' | Tier del plan ('free' o 'pro') |
| created_at | timestamptz | NOT NULL | now() | Fecha de creación |

**RLS Policy:** Users can view/update own profile (auth.uid() = id)

**Trigger:** `handle_new_user()` se ejecuta en INSERT de auth.users → crea profile con plan_tier = 'free'

### Tabla: `locations`

| Columna | Tipo | Constraint | Default | Descripción |
|---------|------|------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | ID único de la ubicación |
| profile_id | uuid | FK → profiles(id) ON DELETE CASCADE | — | Dueño de la ubicación |
| google_place_id | text | NOT NULL | — | Place ID de Google Maps |
| google_maps_url | text | NOT NULL | — | URL original de Google Maps |
| name | text | NOT NULL | — | Nombre del negocio |
| address | text | NOT NULL | — | Dirección del negocio |
| rating | numeric | NOT NULL | — | Rating promedio |
| total_reviews | integer | NOT NULL | — | Total de reseñas |
| created_at | timestamptz | NOT NULL | now() | Fecha de creación |

**RLS Policy:** Users can manage own locations (auth.uid() = profile_id)
**Unique Constraint:** (profile_id, google_place_id) — evita duplicados
**Index:** idx_locations_profile_id ON (profile_id)

### Tabla: `reviews_cache`

| Columna | Tipo | Constraint | Default | Descripción |
|---------|------|------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | — |
| location_id | uuid | FK → locations(id) ON DELETE CASCADE | — | Ubicación asociada |
| raw_reviews | jsonb | NOT NULL | '[]' | Reseñas crudas en JSON |
| llm_analysis | jsonb | — | NULL | Resultado del análisis AI |
| last_synced_at | timestamptz | NOT NULL | now() | Última sincronización |

**RLS Policy:** Users can manage own location reviews
**Index:** idx_reviews_cache_location_id ON (location_id)

### Tabla: `widget_configs`

| Columna | Tipo | Constraint | Default | Descripción |
|---------|------|------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | — |
| location_id | uuid | FK → locations(id) ON DELETE CASCADE, UNIQUE | — | Una config por ubicación |
| theme | text | NOT NULL | 'light' | 'light' o 'dark' |
| primary_color | text | NOT NULL | '#3b82f6' | Color primario (hex) |
| font_family | text | NOT NULL | 'Inter' | Fuente del widget |
| hide_watermark | boolean | NOT NULL | false | Ocultar "Powered by StarPress" |
| widget_type | text | NOT NULL | 'list' | 'list', 'carousel', o 'badge' |

**RLS Policy:** Users can manage own widget config

### Tabla: `feedback`

| Columna | Tipo | Constraint | Default | Descripción |
|---------|------|------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | — |
| location_id | uuid | FK → locations(id) ON DELETE CASCADE | — | Ubicación asociada |
| rating | integer | NOT NULL, CHECK (1-5) | — | Rating del cliente |
| comment | text | — | NULL | Comentario interno |
| contact | text | — | NULL | Email o teléfono |
| created_at | timestamptz | NOT NULL | now() | Fecha del feedback |

**RLS Policies:**
- SELECT: Users can view own feedback (via locations.profile_id)
- INSERT: Anyone can insert feedback (público, para el QR)

**Index:** idx_feedback_location_id ON (location_id)

### Tabla: `gbp_tokens`

| Columna | Tipo | Constraint | Default | Descripción |
|---------|------|------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | — |
| profile_id | uuid | FK → profiles(id) ON DELETE CASCADE, UNIQUE | — | Un token por usuario |
| access_token | text | NOT NULL | — | Token de acceso Google |
| refresh_token | text | — | NULL | Token de refresh |
| token_expiry | timestamptz | — | NULL | Expiración del token |
| account_id | text | — | NULL | ID de cuenta GBP |
| location_id | text | — | NULL | ID de ubicación GBP |
| business_name | text | — | NULL | Nombre del negocio |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | — |

**RLS Policy:** Users can manage own GBP tokens (ALL operations)

**Index:** idx_gbp_tokens_profile_id ON (profile_id)

### Funciones

#### `can_add_location(p_user_id uuid) → boolean`

```sql
SELECT COUNT(*) < CASE
  WHEN (SELECT plan_tier FROM profiles WHERE id = p_user_id) = 'pro' THEN 999
  ELSE 1
END FROM locations WHERE profile_id = p_user_id;
```

- **Free plan:** máximo 1 ubicación
- **Pro plan:** sin límite (999)

#### `handle_new_user()`

Trigger ejecutado en INSERT de auth.users → INSERT en profiles con id = NEW.id y plan_tier = 'free'

---

## 3. Feature 1: Review Cards Descargables

**Archivos:** `src/components/ReviewCard.tsx`

### Descripción

Componente que genera tarjetas de reseñas descargables como PNG, con 5 plantillas de diseño diferentes.

### Interfaces

```typescript
interface Review {
  author: string;
  rating: number;
  text: string;
  publishedAt: string;
}

interface CardTemplate {
  id: string;
  name: string;
  bg: string;        // Color de fondo
  textColor: string;  // Color del texto
  accentColor: string; // Color de acento
  starColor: string;   // Color de las estrellas
}
```

### Plantillas

| ID | Nombre | Background | Texto | Acento | Estrellas |
|----|--------|------------|-------|--------|-----------|
| classic | Classic | #ffffff | #1a1a1a | #2563eb | #f59e0b |
| dark | Dark | #111827 | #f9fafb | #3b82f6 | #f59e0b |
| elegant | Elegant | #fefce8 | #1c1917 | #b45309 | #d97706 |
| bold | Bold | #eff6ff | #1e3a5f | #1d4ed8 | #ea580c |
| minimal | Minimal | #f9fafb | #374151 | #6b7280 | #f59e0b |

### Componentes Internos

#### `StarRating({ rating, color })`

Renderiza 5 estrellas (llenadas/vacías) con el color especificado.

- **Input:** rating (0-5), color (hex string)
- **Output:** SVG de 5 estrellas

### Props del Componente

```typescript
{ review: Review; businessName: string }
```

### Estado

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| selectedTemplate | string | "classic" | Plantilla seleccionada |
| downloading | boolean | false | Flag de descarga en progreso |
| cardRef | useRef<HTMLDivElement> | — | Referencia al div de la tarjeta |

### Funcionalidad de Descarga

1. Usa `html2canvas` para renderizar el div de la tarjeta como canvas
2. Escala: 2x (para resolución retina)
3. Genera filename: `starpress-review-{author}.png`
4. Crea link temporal `<a>` con `download` attribute
5. Dispara click programático para descargar

### Dimensiones de la Tarjeta

- **Ancho fijo:** 400px
- **Padding:** 32px
- **Border radius:** 16px
- **Box shadow:** 0 4px 6px -1px rgba(0,0,0,0.1)
- **Fuente:** Inter (inline style)

### Contenido de la Tarjeta

```
[Estrellas ★★★★★]

"review.text"

review.author — Google Review

businessName
```

### Uso en Dashboard

```tsx
<ReviewCard review={cardReview} businessName={selectedLocation.name} />
```

Se muestra en un modal overlay cuando el usuario hace clic en "Create Card" en una reseña.

### Dependencias Externas

- `html2canvas` (package.json)

---

## 4. Feature 2: Carousel Widget

**Archivos:** `public/embed.js` (funciones `renderCarouselWidget`, `initCarouselLogic`)

### Descripción

Widget de carrusel auto-rotante con navegación manual (flechas y puntos).

### Configuración

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Auto-rotate interval | 5000ms | Rotación automática cada 5 segundos |
| Transición | transform 0.5s ease | Transición suave entre slides |
| Visible items | 1 (desktop), 1 (mobile) | Un slide visible a la vez |

### Estructura HTML

```html
<div class="sp-carousel" style="position: relative; overflow: hidden;">
  <div class="sp-carousel-track" style="transition: transform 0.5s ease;">
    <!-- Review cards -->
  </div>
  <button class="sp-carousel-prev">←</button>
  <button class="sp-carousel-next">→</button>
  <div class="sp-carousel-dots">
    <!-- Dot indicators -->
  </div>
</div>
```

### Funciones Internas

#### `renderCarouselWidget(data)`

- Genera HTML del carrusel
- Incluye header (nombre del negocio, rating, count de reseñas)
- Renderiza top 10 reseñas ordenadas por rating
- Cada slide contiene: estrellas, texto de reseña, autor, fecha
- Incluye botones prev/next y dots indicadores

#### `initCarouselLogic(shadowRoot)`

- Selecciona track, prev, next, dots del shadow DOM
- Implementa `currentSlide` variable para tracking
- **`updateCarousel()`:** Calcula `translateX` basado en `currentSlide * -100%`
- **Event listeners:**
  - `prev.addEventListener("click")`: Decrementa currentSlide, wrap around
  - `next.addEventListener("click")`: Incrementa currentSlide, wrap around
  - `dots[i].addEventListener("click")`: Salta a slide específico
- **Auto-play:** `setInterval` cada 5000ms, se limpia en recalculo
- **Dot updates:** Agrega/remueve clase "active" según currentSlide

### Estilos del Carrusel

```css
.sp-carousel { position: relative; overflow: hidden; }
.sp-carousel-track { display: flex; transition: transform 0.5s ease; }
.sp-carousel-prev, .sp-carousel-next {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: rgba(255,255,255,0.9); border: 1px solid #e5e7eb;
  border-radius: 9999px; width: 36px; height: 36px; cursor: pointer;
}
.sp-carousel-dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
.sp-carousel-dot {
  width: 8px; height: 8px; border-radius: 9999px;
  background: #d1d5db; border: none; cursor: pointer;
}
.sp-carousel-dot.active { background: {primary_color}; }
```

### Navegación

- **Flecha izquierda:** Slide anterior (wrap around al final)
- **Flecha derecha:** Siguiente slide (wrap around al inicio)
- **Puntos:** Saltar a slide específico
- **Auto-play:** Se reinicia en cada interacción manual

---

## 5. Feature 3: Badge Widget

**Archivos:** `public/embed.js` (función `renderBadgeWidget`)

### Descripción

Widget compacto inline tipo badge: `★ 4.9 [Google] on Google`

### Estructura HTML

```html
<a href="{google_maps_url}" target="_blank" rel="noopener"
   class="sp-badge" style="display: inline-flex; align-items: center; ...">
  <span style="color: {starColor}; font-weight: 600;">★</span>
  <span style="font-weight: 700;">{rating}</span>
  <!-- Google icon SVG -->
  <span>on Google</span>
</a>
```

### Estilos del Badge

```css
.sp-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 9999px (pill shape);
  background: {bg}; border: 1px solid {border};
  font-family: {fontFamily}; text-decoration: none;
  transition: box-shadow 0.2s;
}
.sp-badge:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
```

### Datos Mostrados

| Elemento | Fuente | Descripción |
|----------|--------|-------------|
| ★ | rating | Estrella rellena |
| {rating} | location.rating | Número de rating (ej: 4.9) |
| Google icon | SVG inline | Icono de Google |
| "on Google" | Texto fijo | Label |

### Link

El badge completo es un tag `<a>` que enlaza a la URL de Google Maps del negocio, abriendo en nueva pestaña.

---

## 6. Feature 4: AI Response

**Archivos:** `src/app/api/respond/route.ts`

### Descripción

Genera respuestas profesionales a reseñas de Google Maps usando GPT-4o. La respuesta se genera en el **mismo idioma** que la reseña original.

### API Route

| Método | Path | Auth | Body |
|--------|------|------|------|
| POST | /api/respond | Required | `{ review_text, review_author, review_rating, location_id }` |

### System Prompt

```
You are a professional customer service representative for a business.
Write a thoughtful, professional reply to this Google Maps review.

Rules:
- Write in the SAME LANGUAGE as the review
- Keep it under 100 words
- Be warm and genuine, not robotic
- If positive review: thank them specifically, mention something from their review
- If negative review: acknowledge their concern, offer to make it right, provide contact
- Never be defensive or dismissive
- Use the business name naturally, not forced
- End with an invitation to return

Business name: {businessName}
Review rating: {review_rating}/5 stars
Customer name: {review_author}

Review to respond to:
"{review_text}"
```

### Parámetros OpenAI

| Parámetro | Valor |
|-----------|-------|
| model | gpt-4o |
| temperature | 0.7 |
| max_tokens | 200 |

### Respuesta

```json
{
  "reply": "Gracias por tu reseña, María. Nos encanta saber que disfrutaste..."
}
```

### Validaciones

1. **Auth:** Requiere usuario autenticado
2. **Tier:** Solo usuarios Pro (planTier !== "pro" → 403)
3. **Input:** review_text y location_id son requeridos
4. **Business name:** Se obtiene de la tabla locations

### Errores

| Código | Mensaje |
|--------|---------|
| 400 | "review_text and location_id are required" |
| 401 | "Unauthorized" |
| 403 | "AI Response requires Pro plan" |
| 500 | "Failed to generate response" |

### Uso en Dashboard

```tsx
// Botón "Reply" en cada reseña (solo Pro)
<button onClick={() => handleRespond(review, i)}>Reply</button>

// Respuesta generada se muestra debajo de la reseña
<div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
  <strong>Suggested Response:</strong> {aiResponses[i]}
</div>
```

### Copiar al Clipboard

El usuario puede copiar la respuesta con un botón "Copy" que usa `navigator.clipboard.writeText()`.

---

## 7. Feature 5: Review Gating QR + Alertas Instantáneas

**Archivos:** `src/app/feedback/[locationId]/page.tsx`, `src/components/QRCodeGenerator.tsx`, `src/app/api/feedback/route.ts`, `supabase/migrations/003_add_feedback.sql`

### Descripción

Sistema de Review Gating: QR code que redirige clientes satisfechos (4-5★) a Google Maps y captura feedback negativo (1-3★) internamente. Incluye alertas instantáneas por email y dispatch de webhooks para feedback negativo.

### Flujo del Usuario

```
1. Escanea QR → /feedback/{locationId}
2. Selecciona rating (1-5 estrellas)
3. Si 4-5★ → Redirección a Google Maps (reviews públicas)
4. Si 1-3★ → Formulario de feedback interno
5. Feedback se guarda en tabla "feedback"
6. Si 1-3★ → Email instantáneo al dueño + webhook dispatch
```

### Página de Feedback (`/feedback/[locationId]`)

#### Estado

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| step | "rate" \| "positive" \| "negative" \| "done" | "rate" | Paso actual del flujo |
| rating | number | 0 | Rating seleccionado |
| hoveredStar | number | 0 | Estrellahovered |
| comment | string | "" | Comentario del usuario |
| contact | string | "" | Email o teléfono |
| submitting | boolean | false | Flag de envío |
| googleUrl | string | "" | URL de Google Maps |
| businessName | string | "" | Nombre del negocio |

#### Pasos

**Paso 1 — Rate:**
- Título: "How was your experience?"
- Subtítulo: "at {businessName}"
- Instrucción: "Tap a star to rate"
- 5 botones de estrella interactivos
- Hover effect: escala 1.1, color amarillo

**Paso 2a — Positive (4-5★):**
- Fondo: gradiente verde
- Título: "Thank you!"
- Mensaje: "We're glad you had a great experience! Would you mind sharing your review on Google?"
- Botón: "Write Review on Google" → abre Google Maps en nueva pestaña
- Alternativa: "Skip, thanks" → paso "done"

**Paso 2b — Negative (1-3★):**
- Fondo: gradiente naranja
- Título: "We're sorry to hear that"
- Mensaje: "Your feedback is important to us."
- Campos:
  - Textarea: "What went wrong?" (opcional)
  - Input: "Your email or phone" (opcional)
- Botón: "Send Feedback" → POST /api/feedback
- Alternativa: "Skip, thanks" → paso "done"

**Paso 3 — Done:**
- Mensaje: "Thank you for your feedback!"

### QR Code Generator (`QRCodeGenerator.tsx`)

#### Props

```typescript
{ locationId: string; businessName: string }
```

#### Funcionalidad

1. Genera URL: `{origin}/feedback/{locationId}`
2. Usa librería `qrcode` para renderizar QR en canvas (256x256px)
3. Genera download URL con `QRCode.toDataURL()`
4. Botón "Download QR Code" descarga como `starpress-qr-{businessName}.png`

#### API de Feedback

**POST /api/feedback:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| location_id | string | Sí | Ubicación |
| rating | number | Sí | 1-5 |
| comment | string | No | Comentario |
| contact | string | No | Email/teléfono |

**Lógica adicional para rating ≤ 3:**
1. Busca email del dueño via `profiles` → `auth.users`
2. Envía email instantáneo via Resend API
3. Dispatch outbound webhooks configurados

**GET /api/feedback?location_id={id}:**

Retorna array de feedback ordenado por fecha descendente.

### Email Alert (Feedback Negativo)

**Servicio:** Resend API (`RESEND_API_KEY`)

**Template HTML:**
- Asunto: `⚠️ Negative feedback at {locationName} — {rating}/5`
- Contenido: Rating con estrellas, comentario, contacto del cliente
- Estilo: Borde rojo izquierdo, fondo rojo claro

### Dashboard — Review Gating QR

Solo visible para usuarios **Pro**. Incluye:

1. **QR Code section:** Muestra el QR generado con instrucciones
2. **Customer Feedback section:** Lista de feedback recibido (1-3★)
3. **Instrucciones:**
   - "Print this QR code on tables, receipts, or menus"
   - "4-5 stars → Redirects to Google Maps review"
   - "1-3 stars → Internal feedback form"

---

## 8. Feature 6: Weekly Report

**Archivos:** `src/app/api/alerts/route.ts`

### Descripción

Genera un reporte semanal de reseñas y feedback usando GPT-4o.

### API Route

| Método | Path | Auth | Body |
|--------|------|------|------|
| POST | /api/alerts | Required | `{ location_id }` |

### System Prompt

```
You are a business review analyst. Generate a concise weekly report based on:

Reviews from the past 7 days:
{formattedReviews}

Internal feedback from QR:
{formattedFeedback}

Return JSON with:
- summary: 2-3 sentence overview
- highlights: top 3 positive themes
- concerns: top 3 areas of concern
- trend: "improving", "stable", or "declining"
- action_items: 3 specific actionable recommendations
- week_stats: { new_reviews, avg_rating, internal_feedback, negative_feedback }

Keep it concise and actionable. Under 300 words total.
```

### Parámetros OpenAI

| Parámetro | Valor |
|-----------|-------|
| model | gpt-4o |
| temperature | 0.3 |
| response_format | { type: "json_object" } |

### Lógica Interna

1. **Filtra reseñas de los últimos 7 días** (basado en `publishedAt`)
2. **Calcula stats:**
   - `new_reviews`: count de reseñas de la semana
   - `avg_rating`: promedio de ratings
   - `internal_feedback`: count de feedback interno (QR 1-3★)
   - `negative_feedback`: count de feedback con rating <= 3
3. **Formatea contexto** para el LLM:
   - Reseñas con author, rating, text
   - Feedback con rating, comment, contact
4. **Genera reporte** con OpenAI
5. **Guarda en DB** (actualiza llm_analysis del reviews_cache)

### Respuesta

```json
{
  "summary": "This week your business received 8 new reviews with an average rating of 4.6...",
  "highlights": ["Customers love your friendly staff", "Fast service appreciated", ...],
  "concerns": ["Some complaints about parking", "Wait times during lunch", ...],
  "trend": "improving",
  "action_items": ["Add more parking signage", "Consider extended lunch hours", ...],
  "week_stats": {
    "new_reviews": 8,
    "avg_rating": 4.6,
    "internal_feedback": 3,
    "negative_feedback": 1
  }
}
```

### Dashboard — Weekly Report

Solo visible para usuarios **Pro**. Incluye:

1. **Botón:** "Generate Report" / "Refresh Report"
2. **Stats de la semana:** Grid de 4 métricas
3. **Trend:** Badge colorido (green=improving, red=declining, yellow=stable)
4. **Highlights:** Lista de aspectos positivos
5. **Concerns:** Lista de áreas de mejora
6. **Action Items:** Lista de recomendaciones accionables

---

## 9. Feature 7: SEO Schema Markup

**Archivos:** `public/embed.js` (función `injectSchema`)

### Descripción

Inyecta datos estructurados JSON-LD en el `<head>` del host page para SEO.

### Tipo de Schema

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "{business name}",
  "address": { ... },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{rating}",
    "reviewCount": "{total_reviews}",
    "bestRating": "5"
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "{author}" },
      "reviewRating": { "@type": "Rating", "ratingValue": "{rating}", "bestRating": "5" },
      "reviewBody": "{text}",
      "datePublished": "{publishedAt}"
    }
  ]
}
```

### Lógica

1. Se ejecuta después de cargar los datos del widget
2. Crea element `<script type="application/ld+json">`
3. Serializa el objeto a JSON
4. Inserta en `document.head`
5. Solo incluye reseñas que tengan texto (reviewBody)

### Limitaciones

- Máximo de reseñas en el schema: todas las disponibles en la respuesta del API
- El schema se regenera en cada carga del widget

---

## 10. Feature 8: Google Business Profile

**Archivos:** `src/app/api/gbp/auth/route.ts`, `src/app/api/gbp/callback/route.ts`, `src/app/api/gbp/reviews/route.ts`, `src/app/api/gbp/reply/route.ts`, `src/app/api/gbp/sync/route.ts`, `supabase/migrations/004_add_gbp_tokens.sql`

### Descripción

Conexión con Google Business Profile API para ver y responder reseñas directamente desde el dashboard. Incluye sincronización automática de reseñas (reemplaza Apify para usuarios Pro).

### Flujo OAuth2

```
1. Usuario hace clic "Connect Google"
2. GET /api/gbp/auth → genera Google OAuth2 URL
3. Redirect a Google → usuario autoriza
4. Google redirige a /api/gbp/callback con code
5. POST code a Google → obtiene access_token + refresh_token
6. GET /v1/accounts → obtiene account_id
7. GET /v1/accounts/{id}/locations → obtiene location_id
8. Guarda tokens en tabla gbp_tokens
9. Redirect a /dashboard?gbp_connected=true
```

### API Routes

#### GET /api/gbp/auth

Genera URL de autorización Google OAuth2.

**Parámetros OAuth2:**
- `client_id`: GOOGLE_GBP_CLIENT_ID
- `redirect_uri`: {NEXT_PUBLIC_APP_URL}/api/gbp/callback
- `response_type`: code
- `scope`: https://www.googleapis.com/auth/business.manage
- `access_type`: offline
- `prompt`: consent
- `state`: user.id (para identificar al usuario en el callback)

**Respuesta:** `{ authUrl: string }`

#### GET /api/gbp/callback

Maneja el callback del OAuth2 de Google.

**Query params:** code, state (user_id), error

**Pasos:**
1. Intercambia code por tokens
2. Obtiene accounts y locations del usuario
3. Guarda tokens y metadata en `gbp_tokens`
4. Redirect a `/dashboard?gbp_connected=true`

**Tokens guardados:**
- access_token
- refresh_token
- token_expiry (calculado: now + expires_in seconds)
- account_id
- location_id
- business_name

#### GET /api/gbp/reviews

Obtiene reseñas de Google Business Profile.

**Query params:** location_id (required)

**Lógica:**
1. Verifica autenticación
2. Obtiene tokens de `gbp_tokens`
3. Si token expiró → refresh con refresh_token
4. GET `/v1/accounts/{account_id}/locations/{location_id}/reviews`
5. Mapea respuesta a formato interno

**Respuesta:**
```json
{
  "reviews": [
    {
      "reviewId": "abc123",
      "author": "John Doe",
      "rating": 5,
      "text": "Great place!",
      "updateTime": "2026-08-20T10:00:00Z",
      "reply": null | { "comment": "Thanks!" }
    }
  ],
  "total": 15
}
```

#### POST /api/gbp/reply

Publica una respuesta a una reseña en Google.

**Body:** `{ review_id, reply_text }`

**Lógica:**
1. Verifica autenticación
2. Obtiene tokens
3. Refresh si necesario
4. PUT `/v1/accounts/{account_id}/locations/{location_id}/reviews/{review_id}/reply`
5. Body: `{ comment: reply_text }`

### Endpoints de Google API

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `https://oauth2.googleapis.com/token` | POST | Intercambiar/refrescar tokens |
| `https://mybusinessbusinessinformation.googleapis.com/v1/accounts` | GET | Listar cuentas GBP |
| `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{id}/locations` | GET | Listar ubicaciones |
| `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{id}/locations/{lid}/reviews` | GET | Obtener reseñas |
| `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{id}/locations/{lid}/reviews/{rid}/reply` | PUT | Responder reseña |

### Dashboard — Google Business Profile

Solo visible para usuarios **Pro**. Incluye:

1. **Si no conectado:** Botón "Connect Google" con icono de Google
2. **Si conectado:** Badge "Connected" en verde
3. **Lista de reseñas:** Muestra reseñas de GBP con opción de responder
4. **Reply on Google:** Botón que abre textarea para escribir respuesta
5. **Publish on Google:** Publica la respuesta directamente en Google Maps
6. **Feedback visual:** Muestra "Your reply:" debajo de la reseña si ya se respondió

---

## 11. Feature 0: Core — Scraping, Auth, Dashboard

### 11.1 Scraping de Google Maps (Apify)

**Archivos:** `src/app/api/locations/route.ts`

#### API Route

| Método | Path | Auth | Body |
|--------|------|------|------|
| POST | /api/locations | Required | `{ url: string }` |

#### Flujo

1. **Valida input:** extractPlaceId() parsea la URL
2. **Verifica plan:** llama `can_add_location()` RPC
3. **Verifica duplicado:** busca google_place_id en locations
4. **Lanza Apify actor:** compass~crawler-google-places
5. **Polling:** cada 2 segundos, max 60 iteraciones (120s)
6. **Obtiene dataset:** resultados limpios
7. **Guarda en DB:** locations + widget_configs + reviews_cache

#### Configuración Apify

```json
{
  "language": "en",
  "includeReviews": true,
  "reviewsSort": "newest",
  "maxReviews": 20,
  "scrapePlaceDetailPage": false,
  "skipClosedPlaces": true,
  "maxCrawledPlacesPerSearch": 1,
  "startUrls/searchStringsArray": ["{url}"]
}
```

#### Mapeo de Datos

| Campo Apify | Campo DB |
|-------------|----------|
| title | name |
| address | address |
| totalScore | rating |
| reviewsCount | total_reviews |
| placeId | google_place_id |
| reviews[].name | author |
| reviews[].stars | rating |
| reviews[].text | text |
| reviews[].publishedAtDate | publishedAt |

#### Errores

| Código | Mensaje | Causa |
|--------|---------|-------|
| 400 | "URL is required" | Body vacío |
| 403 | "Free plan allows 1 location..." | Free plan intenta agregar 2da ubicación |
| 409 | "This location was already added." | Duplicado |
| 500 | "Failed to start scraping..." | Error de Apify |
| 500 | "Scraping failed..." | URL inválida |
| 500 | "Timeout: scraping took too long..." | >120 segundos |

### 11.2 Autenticación

**Archivos:** `src/app/auth/login/page.tsx`, `src/app/auth/signup/page.tsx`, `src/app/auth/callback/route.ts`, `src/lib/supabase/middleware.ts`

#### Login

- **Email/Password:** `supabase.auth.signInWithPassword()`
- **Google OAuth:** `supabase.auth.signInWithOAuth({ provider: "google" })`
- **Redirect post-login:** `/dashboard`

#### Signup

- **Email/Password:** `supabase.auth.signUp()` con email confirmation
- **Google OAuth:** mismo que login
- **Redirect post-signup:** pantalla "Check your email"

#### OAuth Callback

- **Ruta:** `/auth/callback`
- **Lógica:** `supabase.auth.exchangeCodeForSession(code)`
- **Fallback:** redirect a `/auth/login?error=auth_failed`

#### Middleware

- **Matcher:** todas las rutas excepto assets estáticos
- **Lógica:**
  - Sin usuario + ruta protegida → redirect a `/auth/login`
  - Con usuario + ruta auth → redirect a `/dashboard`
  - Refresca sesión en cada request

### 11.3 Dashboard

**Archivos:** `src/app/dashboard/page.tsx`

#### Estado (21 variables)

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| locations | Location[] | [] | Lista de ubicaciones |
| selectedId | string \| null | null | Ubicación seleccionada |
| reviews | Review[] | [] | Reseñas cargadas |
| analysis | Analysis \| null | null | Análisis AI |
| planTier | string | "free" | Tier del plan |
| loading | boolean | true | Loading general |
| analyzing | boolean | false | Generando análisis |
| copiedField | string \| null | null | Campo copiado |
| cardReview | Review \| null | null | Reseña para tarjeta |
| respondingIdx | number \| null | null | Índice respondiendo |
| aiResponses | Record<number, string> | {} | Respuestas AI generadas |
| copiedResponse | number \| null | null | Respuesta copiada |
| feedbackList | Array | [] | Feedback interno |
| showQR | boolean | false | Toggle QR |
| weeklyReport | Record \| null | null | Reporte semanal |
| generatingReport | boolean | false | Generando reporte |
| gbpConnected | boolean | false | GBP conectado |
| gbpReviews | Array | [] | Reseñas de GBP |
| replyingTo | string \| null | null | ID reseña respondiendo |
| replyText | string | "" | Texto de respuesta |
| publishingReply | boolean | false | Publicando respuesta |

#### useEffect Hooks

1. **Carga inicial:** Fetch user + profile + locations. Auto-selecciona ubicación.
2. **Carga reviews:** Cuando selectedId cambia, fetch reviews_cache.
3. **Carga feedback:** Solo Pro, fetch /api/feedback.
4. **Carga GBP:** Solo Pro, fetch /api/gbp/reviews.

#### Secciones del Dashboard

| Sección | Tier | Descripción |
|---------|------|-------------|
| Header | Todos | Brand, plan badge, nav links |
| Sidebar | Todos | Lista de ubicaciones, botón "+ Add" |
| Stats | Todos | Rating promedio, total reseñas, reseñas cargadas |
| AI Analysis | Pro | Análisis de sentimiento, aspectos, social media copy |
| Weekly Report | Pro | Resumen semanal con stats, trend, action items |
| Google Business Profile | Pro | Conectar GBP, ver reseñas, responder |
| Review Gating QR | Pro | QR code + feedback interno |
| Customer Feedback | Pro | Lista de feedback de 1-3★ |
| Recent Reviews | Todos | Lista de reseñas con acciones |

### 11.4 Widget Config

**Archivos:** `src/app/widget-config/page.tsx`

#### Configuración

| Campo | Tipo | Options | Tier |
|-------|------|---------|------|
| theme | select | light, dark | Free |
| widget_type | select | list, carousel, badge | Free |
| primary_color | color picker | hex color | Pro |
| font_family | select | Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Source Sans Pro, Nunito | Pro |
| hide_watermark | checkbox | true/false | Pro |

#### Embed Code

```html
<script src="{APP_URL}/embed.js"
  data-location-id="{locationId}"
  data-widget-type="{widgetType}">
</script>
```

### 11.5 Embeddable Widget (embed.js)

**Archivos:** `public/embed.js`

#### Arquitectura

- **IIFE** auto-ejecutante
- **Shadow DOM** para aislamiento de estilos
- **Fetch** a `/api/widget/{locationId}` para datos
- **Renderizado** condicional según `data-widget-type`

#### Funciones Principales

| Función | Descripción |
|---------|-------------|
| `createStars(rating)` | Genera string de estrellas |
| `escapeHtml(str)` | Escapa HTML entities |
| `getStyles(theme, fontFamily)` | CSS completo del widget |
| `renderListWidget(data)` | Widget de lista |
| `renderCarouselWidget(data)` | Widget de carrusel |
| `initCarouselLogic(shadowRoot)` | Lógica de navegación del carrusel |
| `renderBadgeWidget(data)` | Widget badge compacto |
| `renderWidget(data)` | Crea Shadow DOM, renderiza widget |
| `injectSchema(data)` | Inyecta JSON-LD en head |
| `init()` | Orquestador principal |

#### API Consumida

```
GET /api/widget/{LOCATION_ID}
→ { location, config, reviews, last_synced }
```

---

## 15. Variables de Entorno

### Requeridas

| Variable | Uso | Servicio |
|----------|-----|----------|
| NEXT_PUBLIC_SUPABASE_URL | URL del proyecto Supabase | Supabase |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Anon key de Supabase | Supabase |
| SUPABASE_SERVICE_ROLE_KEY | Service role key (solo server) | Supabase |
| APIFY_API_TOKEN | Token de Apify (solo para Free) | Apify |
| OPENAI_API_KEY | API key de OpenAI | OpenAI |
| NEXT_PUBLIC_APP_URL | URL pública de la app | General |
| GOOGLE_GBP_CLIENT_ID | Client ID de Google OAuth | Google Business Profile |
| GOOGLE_GBP_CLIENT_SECRET | Client Secret de Google OAuth | Google Business Profile |
| RESEND_API_KEY | API key para email alerts | Resend |

### Opcionales

| Variable | Uso |
|----------|-----|
| FEEDBACK_ALERT_FROM | Email remitente para alerts (default: alerts@starpress.app) |
| STRIPE_SECRET_KEY | Para integración futura |
| STRIPE_WEBHOOK_SECRET | Para integración futura |

---

## 16. Modelo Freemium

### Free Plan

| Feature | Límite |
|---------|--------|
| Ubicaciones | 1 |
| Widget type | list, badge |
| Tema | light/dark |
| Watermark | visible ("Powered by StarPress") |
| Color | default (#3b82f6) |
| Font | default (Inter) |
| AI Analysis | ❌ |
| AI Response | ❌ |
| AI Dispute | ❌ |
| Weekly Report | ❌ |
| Review Gating QR | ❌ |
| GBP Connection | ❌ |
| GBP Sync | ❌ |
| Outbound Webhooks | ❌ |
| Review Cards | ✅ |
| Negative Feedback Email Alerts | ✅ |

### Pro Plan

| Feature | Límite |
|---------|--------|
| Ubicaciones | Ilimitado |
| Widget type | list, carousel, badge |
| Tema | light/dark |
| Watermark | ocultable |
| Color | personalizable |
| Font | 8 opciones |
| AI Analysis | ✅ |
| AI Response | ✅ |
| AI Dispute | ✅ |
| Weekly Report | ✅ |
| Review Gating QR | ✅ |
| GBP Connection | ✅ |
| GBP Sync | ✅ (costo $0) |
| Outbound Webhooks | ✅ (con firma HMAC) |
| Review Cards | ✅ |
| Negative Feedback Email Alerts | ✅ |

### Verificación en Código

```typescript
// Dashboard
const isProUser = planTier === "pro";

// Secciones condicionales
{planTier === "pro" && ( /* AI Analysis, Weekly Report, GBP, QR, Webhooks, Dispute */ )}

// Widget Config
disabled={planTier === "free"}

// Badge Widget - ahora disponible en Free
{planTier === "free" && config.widget_type === "badge"} // ✅ Permitido

// API Routes
if (planTier !== "pro") {
  return NextResponse.json({ error: "...requires Pro plan" }, { status: 403 });
}
```

---

## 11. Feature 9: GBP Sync (reemplaza Apify para Pro)

**Archivos:** `src/app/api/gbp/sync/route.ts`

### Descripción

Endpoint que sincroniza reseñas desde la API oficial de Google Business Profile, reemplazando Apify para usuarios Pro. Costo de infraestructura: $0.

### API Route

| Método | Path | Auth | Body |
|--------|------|------|------|
| POST | /api/gbp/sync | Required | `{ location_id }` |

### Flujo

1. Verifica que el usuario tenga plan Pro
2. Obtiene tokens de GBP de la tabla `gbp_tokens`
3. Refresca el token si expiró
4. GET `/v1/accounts/{account_id}/locations/{location_id}/reviews`
5. Mapea reseñas al formato interno
6. Upsert en `reviews_cache` (reemplaza datos anteriores)
7. Actualiza estadísticas en `locations` (rating promedio, total)

### Respuesta

```json
{
  "success": true,
  "reviews_count": 45,
  "source": "google_business_profile"
}
```

### Estrategia Híbrida (Apify → GBP)

| Etapa | Método | Costo | Experiencia |
|-------|--------|-------|-------------|
| Registro (Free) | Apify (1 vez) | Centavos | Fricción cero, widget instantáneo |
| Upsell a Pro | GBP OAuth | $0 | Sincronización automática infinita |

### Dashboard — Botón "Sync from Google"

Visible solo cuando: `planTier === "pro"` AND `gbpConnected === true`

- Botón verde con icono de refresh
- Texto: "Sync from Google"
- Subtexto: "Free — uses Google Business Profile API"
- Estado: "Syncing..." con spinner

---

## 12. Feature 10: Outbound Webhooks

**Archivos:** `src/app/api/webhooks/route.ts`, `supabase/migrations/005_add_webhooks.sql`

### Descripción

Permite a usuarios Pro configurar URLs de webhook que reciben POST con firma HMAC cuando ocurren eventos (ej: feedback negativo).

### Tabla: `webhooks`

| Columna | Tipo | Constraint | Default | Descripción |
|---------|------|------------|---------|-------------|
| id | uuid | PK | gen_random_uuid() | — |
| location_id | uuid | FK → locations(id) ON DELETE CASCADE | — | Ubicación asociada |
| url | text | NOT NULL | — | URL del webhook |
| secret | text | NOT NULL | gen_random_bytes(32) | Secreto para firma HMAC |
| is_active | boolean | NOT NULL | true | webhook habilitado |
| events | text[] | NOT NULL | {"feedback.received.negative"} | Eventos que disparan |
| created_at | timestamptz | NOT NULL | now() | — |
| updated_at | timestamptz | NOT NULL | now() | — |

**RLS:** Users can manage own webhooks (via locations.profile_id)

### API Routes

#### GET /api/webhooks?location_id={id}

Lista webhooks de una ubicación. Requiere Pro.

#### POST /api/webhooks

Crea un webhook. Body: `{ location_id, url, events? }`

Retorna el `secret` solo una vez (en la creación).

#### DELETE /api/webhooks?id={webhookId}

Elimina un webhook.

### Payload del Webhook

```json
{
  "event_id": "evt_8f7b2c9a-1234-4567-b890-abcdef123456",
  "event_type": "feedback.received.negative",
  "created_at": "2026-08-25T15:30:00Z",
  "data": {
    "feedback": {
      "id": "fdb_44556677",
      "rating": 2,
      "comment": "La comida llegó fría...",
      "contact": "cliente@email.com",
      "submitted_at": "2026-08-25T15:29:55Z"
    },
    "location": {
      "id": "loc_11223344",
      "name": "Pizzería Los Amigos"
    }
  }
}
```

### Seguridad — Firma HMAC

Cada request incluye header `x-starpress-signature` con hash SHA-256 del body firmado con el secreto del webhook.

```typescript
const signature = createHmac("sha256", webhook.secret)
  .update(body)
  .digest("hex");
```

Headers enviados:
- `x-starpress-signature`: hash HMAC-SHA256
- `x-starpress-event`: tipo de evento
- `x-starpress-id`: ID del evento (para deduplicación)

### Eventos Disponibles

| Evento | Descripción |
|--------|-------------|
| `feedback.received.negative` | Feedback 1-3★ via QR |

---

## 13. Feature 11: Auto-Disputa de Reseñas Falsas

**Archivos:** `src/app/api/dispute/route.ts`

### Descripción

Analiza reseñas sospechosas con GPT-4o contra las políticas de contenido de Google y genera una carta de disputa lista para copiar y pegar.

### API Route

| Método | Path | Auth | Body |
|--------|------|------|------|
| POST | /api/dispute | Required | `{ review_text, review_author, review_rating, review_date }` |

### System Prompt

```
Analyze the review text against Google's content policies:
1. Spam or fake content
2. Off-topic reviews
3. Restricted content
4. Illegal content
5. Sexually explicit content
6. Offensive content
7. Dangerous content
8. Impersonation
9. Conflict of interest (competitor reviews)

Return JSON with:
- is_disputable: boolean
- confidence: number (0-100)
- violations: string[]
- reasoning: string
- dispute_letter: string (formal, under 300 words, English)
```

### Parámetros OpenAI

| Parámetro | Valor |
|-----------|-------|
| model | gpt-4o |
| temperature | 0.3 |
| response_format | { type: "json_object" } |

### Respuesta

```json
{
  "is_disputable": true,
  "confidence": 85,
  "violations": ["Spam or fake content", "Conflict of interest"],
  "reasoning": "The review contains generic language typical of fake reviews...",
  "dispute_letter": "Dear Google Business Profile Support,\n\nI am writing to dispute a review posted on our business listing..."
}
```

### Dashboard — Botón "Report Review"

- Visible solo para reseñas con rating ≤ 2 que tengan texto
- Solo para usuarios Pro
- Muestra resultado con:
  - Badge de confianza (verde si compliant, rojo si disputable)
  - Tags de violaciones
  - Razonamiento
  - Carta de disputa copiable

### Validaciones

1. **Auth:** Requiere usuario autenticado
2. **Tier:** Solo Pro (403 si Free)
3. **Input:** review_text es requerido

---

**Fin de especificación.**
