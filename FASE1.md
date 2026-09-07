# Fase 1: Estabilidad — Sub-Plan Detallado

## Objetivo
Que no se rompa nada crítico. Tests, error handling robusto, y feedback visual.

---

## 1.1 Tests Unitarios

### 1.1.1 Configurar Vitest
**Archivos:**
- [ ] Crear `vitest.config.ts`
- [ ] Agregar scripts en `package.json`

**Implementación:**
```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
```

**package.json:**
```json
"scripts": {
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

---

### 1.1.2 Test: review-scoring.ts
**Archivo:** `src/lib/review-scoring.test.ts`

**Casos de prueba:**
```
✅ calculateReviewScore
  -评分 5 星，100 字，10 likes，local guide → score > 80
  -评分 1 星，0 字，0 likes → score < 20
  -评分 3 星，50 字，5 likes → score 40-60
  - publishedAt 今天 → recency bonus
  - publishedAt 1年前 → no recency bonus

✅ sortReviews
  - "best" → highest score first
  - "recent" → newest first
  - "most_liked" → most likes first
  - "highest" → 5 stars first
  - "lowest" → 1 star first

✅ getCarouselMix
  - 70% positive, 15% negative, 15% neutral
  - 返回数组长度等于请求长度
  - 不会重复同一条 review
```

---

### 1.1.3 Test: rate-limit.ts
**Archivo:** `src/lib/rate-limit.test.ts`

**Casos de prueba:**
```
✅ checkRateLimit
  - 第一次调用 → success: true
  - 连续调用 max 次 → success: false
  - 超过 window 后 → 重置计数

✅ rateLimitResponse
  - 返回 429 状态码
  - 包含 Retry-After header
  - 包含 JSON body
```

---

### 1.1.4 Test: stripe.ts
**Archivo:** `src/lib/stripe.test.ts`

**Casos de prueba:**
```
✅ STRIPE_PRICES
  - 包含 pro_monthly
  - 包含 pro_yearly
  - 值是字符串
```

---

### 1.1.5 Test: stripe webhook route
**Archivo:** `src/app/api/stripe/webhook/route.test.ts`

**Casos de prueba:**
```
✅ POST /api/stripe/webhook
  - 无效签名 → 400
  - checkout.session.completed → plan_tier = "pro"
  - customer.subscription.deleted → plan_tier = "free"
  - 未知事件类型 → 200 (no error)
```

---

### 1.1.6 Test: locations route
**Archivo:** `src/app/api/locations/route.test.ts`

**Casos de prueba:**
```
✅ POST /api/locations
  - 未登录 → 401
  - 超过 rate limit → 429
  - 无效 URL → 400
  - Free plan 超过 1 location → 403
```

---

## 1.2 Error Handling Robusto

### 1.2.1 Crear error classes
**Archivo:** `src/lib/errors.ts`

```ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('Rate limit exceeded', 'RATE_LIMITED', 429, { retryAfter });
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502, { service });
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'AUTH_ERROR', 401);
  }
}
```

---

### 1.2.2 Retry wrapper
**Archivo:** `src/lib/retry.ts`

```ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { retries: number; delay: number; backoff: number }
): Promise<T> {
  const { retries, delay, backoff } = options;
  let lastError: Error;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries) {
        await new Promise(r => setTimeout(r, delay * Math.pow(backoff, i)));
      }
    }
  }
  throw lastError!;
}
```

---

### 1.2.3 Actualizar API routes
**Archivos a modificar:**
- `src/app/api/locations/route.ts`
- `src/app/api/locations/refresh/route.ts`
- `src/app/api/analyze/route.ts`
- `src/app/api/respond/route.ts`
- `src/app/api/dispute/route.ts`

**Cambios:**
1. Importar `withRetry` y error classes
2. Envolver calls a Apify/OpenAI con retry
3. Agregar timeout en fetch
4. Log errors a Sentry con contexto

**Ejemplo para locations/route.ts:**
```ts
import { withRetry } from '@/lib/retry';
import { ExternalServiceError, ValidationError } from '@/lib/errors';
import * as Sentry from '@sentry/nextjs';

// En el handler:
try {
  const result = await withRetry(
    () => fetchApifyData(url),
    { retries: 3, delay: 1000, backoff: 2 }
  );
} catch (error) {
  Sentry.captureException(error, {
    extra: { userId: user.id, url, action: 'scrape' }
  });
  throw new ExternalServiceError('Apify', (error as Error).message);
}
```

---

### 1.2.4 Timeout wrapper
**Archivo:** `src/lib/timeout.ts`

```ts
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}
```

---

## 1.3 Loading States

### 1.3.1 Skeleton loaders
**Archivo:** `src/components/ui/Skeleton.tsx`

```tsx
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`} />
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-xl border p-5">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
```

---

### 1.3.2 Toast notifications
**Instalar:** `sonner`

```bash
npm install sonner
```

**Archivo:** `src/components/ui/Toast.tsx`

```tsx
'use client';
import { Toaster, toast } from 'sonner';

export function ToastProvider() {
  return <Toaster position="bottom-right" richColors />;
}

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
};
```

---

### 1.3.3 Loading spinner para botones
**Archivo:** `src/components/ui/Spinner.tsx`

```tsx
export function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <svg className={`animate-spin ${sizeClass}`} viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
```

---

### 1.3.4 Progress indicator para scraping
**Archivo:** `src/components/ui/Progress.tsx`

```tsx
export function ScrapingProgress({ step }: { step: 'idle' | 'scraping' | 'analyzing' | 'done' }) {
  const steps = [
    { key: 'scraping', label: 'Scraping reviews...' },
    { key: 'analyzing', label: 'Analyzing sentiment...' },
    { key: 'done', label: 'Done!' },
  ];
  
  return (
    <div className="flex items-center gap-4">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${step === s.key ? 'bg-blue-600 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-sm text-gray-600">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
```

---

### 1.3.5 Actualizar Dashboard
**Archivo:** `src/app/dashboard/page.tsx`

**Cambios:**
1. Agregar `<ToastProvider />` al layout
2. Usar skeletons mientras carga datos
3. Usar `showToast` en todas las acciones
4. Agregar loading states en botones

---

## 1.4 Error Boundary por Sección

### 1.4.1 Error boundary component
**Archivo:** `src/components/ui/ErrorBoundary.tsx`

```tsx
'use client';
import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props { children: ReactNode; section: string; }
interface State { hasError: boolean; error?: Error; }

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error) {
    Sentry.captureException(error, { extra: { section: this.props.section } });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800 font-medium">Something went wrong in {this.props.section}</p>
          <p className="text-red-600 text-sm mt-1">{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

---

### 1.4.2 Envolver secciones en dashboard
**Archivo:** `src/app/dashboard/page.tsx`

```tsx
import { SectionErrorBoundary } from '@/components/ui/ErrorBoundary';

// En el JSX:
<SectionErrorBoundary section="AI Analysis">
  <AIAnalysisSection />
</SectionErrorBoundary>

<SectionErrorBoundary section="Weekly Report">
  <WeeklyReportSection />
</SectionErrorBoundary>
```

---

## Resumen de Archivos

### Crear (12 archivos)
| Archivo | Descripción |
|---------|-------------|
| `vitest.config.ts` | Config de tests |
| `src/lib/errors.ts` | Error classes |
| `src/lib/retry.ts` | Retry wrapper |
| `src/lib/timeout.ts` | Timeout wrapper |
| `src/lib/review-scoring.test.ts` | Tests de scoring |
| `src/lib/rate-limit.test.ts` | Tests de rate limit |
| `src/lib/stripe.test.ts` | Tests de stripe |
| `src/app/api/stripe/webhook/route.test.ts` | Tests de webhook |
| `src/app/api/locations/route.test.ts` | Tests de locations |
| `src/components/ui/Skeleton.tsx` | Skeleton loaders |
| `src/components/ui/Spinner.tsx` | Loading spinner |
| `src/components/ui/Toast.tsx` | Toast notifications |
| `src/components/ui/Progress.tsx` | Progress indicator |
| `src/components/ui/ErrorBoundary.tsx` | Error boundary |

### Modificar (7 archivos)
| Archivo | Cambio |
|---------|--------|
| `package.json` | +vitest, +sonner, +scripts |
| `src/app/dashboard/page.tsx` | +skeletons, +toasts, +error boundaries |
| `src/app/api/locations/route.ts` | +retry, +timeout, +error handling |
| `src/app/api/locations/refresh/route.ts` | +retry, +timeout, +error handling |
| `src/app/api/analyze/route.ts` | +retry, +timeout, +error handling |
| `src/app/api/respond/route.ts` | +retry, +timeout, +error handling |
| `src/app/api/dispute/route.ts` | +retry, +timeout, +error handling |

---

## Estimación de Tiempo

| Tarea | Horas |
|-------|-------|
| Configurar Vitest | 1h |
| Tests de review-scoring | 2h |
| Tests de rate-limit | 1h |
| Tests de stripe | 1h |
| Tests de API routes | 2h |
| Error classes + retry | 2h |
| Actualizar API routes | 3h |
| Skeleton loaders | 1h |
| Toast notifications | 1h |
| Progress indicator | 1h |
| Error boundaries | 1h |
| **Total** | **16h** |

---

## Dependencias

```
npm install vitest @vitest/coverage-v8 sonner
```

---

## Verificación

Al finalizar la Fase 1:
- [ ] `npm run test:run` → todos los tests pasan
- [ ] `npm run build` → build exitoso
- [ ] `npm run lint` → sin errores
- [ ] Dashboard muestra skeletons mientras carga
- [ ] Toast notifications aparecen en acciones
- [ ] Error boundaries atrapan errores por sección
- [ ] API routes hacen retry automáticamente
- [ ] Sentry recibe errores con contexto completo
