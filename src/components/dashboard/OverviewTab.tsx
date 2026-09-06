"use client";

import { Location, Review } from "@/types/dashboard";

interface OverviewTabProps {
  location: Location;
  reviews: Review[];
  planTier: string;
  onNavigateToTab: (tabId: string) => void;
  onRefreshReviews: () => void;
  refreshing: boolean;
  gbpConnected: boolean;
}

export default function OverviewTab({
  location,
  reviews,
  planTier,
  onNavigateToTab,
  onRefreshReviews,
  refreshing,
  gbpConnected,
}: OverviewTabProps) {
  const fiveStars = reviews.filter((r) => r.rating === 5).length;
  const fourStars = reviews.filter((r) => r.rating === 4).length;
  const positiveCount = fiveStars + fourStars;
  const positivePercentage = reviews.length > 0 ? Math.round((positiveCount / reviews.length) * 100) : 100;
  const lowRatingCount = reviews.filter((r) => r.rating <= 2).length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-6 shadow-xs border border-[#f0e9e1]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-editorial text-2xl font-normal text-[#0c1754]">
              {location.name}
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#eaebf8] px-2.5 py-0.5 text-xs font-semibold text-[#0c1754]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2545ff]" />
              Activo
            </span>
          </div>
          <p className="mt-1 text-sm text-[#969696] flex items-center gap-1.5">
            <svg className="h-4 w-4 text-[#969696]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location.address || "Ubicación verificada de Google Maps"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onRefreshReviews}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#f0e9e1] bg-white px-4 text-xs font-medium text-[#222222] shadow-xs transition hover:bg-[#f9f8f6] hover:border-[#cccccc] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <svg
              className={`h-3.5 w-3.5 text-[#969696] ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {refreshing ? "Sincronizando..." : "Sincronizar"}
          </button>
          
          <button
            onClick={() => onNavigateToTab("widgets")}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#2545ff] px-5 text-xs font-medium text-white shadow-xs transition hover:bg-[#1a38e8] active:scale-95 cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Obtener Widget
          </button>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Rating Card */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
              Calificación Media
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f9f8f6] text-[#2545ff] border border-[#f0e9e1]">
              ★
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-normal text-[#0c1754]">
              {location.rating.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-[#969696]">/ 5.0</span>
          </div>
          <p className="mt-2 text-xs text-[#969696]">
            Opiniones de Google Maps
          </p>
        </div>

        {/* Total Reviews Card */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
              Total Reseñas
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaebf8] text-[#0c1754]">
              💬
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-normal text-[#0c1754]">
              {location.total_reviews}
            </span>
            <span className="text-xs text-[#969696]">totales</span>
          </div>
          <p className="mt-2 text-xs text-[#969696]">
            {reviews.length} disponibles en dashboard {planTier === 'free' ? '(límite 50 en Free)' : ''}
          </p>
        </div>

        {/* Sentiment / Positive Ratio */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
              Satisfacción Positiva
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaebf8] text-[#2545ff]">
              👍
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-normal text-[#2545ff]">
              {positivePercentage}%
            </span>
            <span className="text-xs text-[#969696]">4★ y 5★</span>
          </div>
          <p className="mt-2 text-xs text-[#969696]">
            Excelente índice de reputación pública
          </p>
        </div>

        {/* Actionable Alerts / Complaints */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
              Atención Requerida
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
              ⚠️
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-editorial text-4xl font-normal text-[#0c1754]">
              {lowRatingCount}
            </span>
            <span className="text-xs text-[#969696]">reseñas ≤ 2★</span>
          </div>
          <p className="mt-2 text-xs text-[#969696]">
            {lowRatingCount > 0 ? "Podés disputarlas o responder con IA" : "¡Cero reseñas críticas pendientes!"}
          </p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Card 1: Widgets */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-full bg-[#eaebf8] text-[#2545ff] flex items-center justify-center mb-4 text-sm font-bold">
              ⭐
            </div>
            <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
              Widgets para tu Web
            </h3>
            <p className="mt-2 text-xs text-[#222222]/80 leading-relaxed">
              Instalá el carrusel o insignia en WordPress, Shopify o HTML con 1 sola línea de código.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab("widgets")}
            className="mt-5 inline-flex items-center text-xs font-semibold text-[#2545ff] hover:underline cursor-pointer"
          >
            Configurar Widget →
          </button>
        </div>

        {/* Card 2: AI Responder */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-full bg-[#eaebf8] text-[#0c1754] flex items-center justify-center mb-4 text-sm font-bold">
              🤖
            </div>
            <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
              Respuestas & Disputas con IA
            </h3>
            <p className="mt-2 text-xs text-[#222222]/80 leading-relaxed">
              Generá respuestas amables en 1 clic y detectá reseñas falsas que violan políticas de Google.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab("reviews")}
            className="mt-5 inline-flex items-center text-xs font-semibold text-[#2545ff] hover:underline cursor-pointer"
          >
            Gestionar Reseñas →
          </button>
        </div>

        {/* Card 3: QR Gating */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-full bg-[#eaebf8] text-[#0c1754] flex items-center justify-center mb-4 text-sm font-bold">
              📱
            </div>
            <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
              Kit QR de Mostrador
            </h3>
            <p className="mt-2 text-xs text-[#222222]/80 leading-relaxed">
              Filtrá clientes insatisfechos a un buzón privado antes de que dejen 1 estrella en Google Maps.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab("qr")}
            className="mt-5 inline-flex items-center text-xs font-semibold text-[#2545ff] hover:underline cursor-pointer"
          >
            Ver QR & Feedback →
          </button>
        </div>
      </div>
    </div>
  );
}
