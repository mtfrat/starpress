"use client";

import { useState } from "react";
import { Review, DisputeResult } from "@/types/dashboard";

interface ReviewsTabProps {
  reviews: Review[];
  planTier: string;
  respondingIdx: number | null;
  aiResponses: Record<number, string>;
  copiedResponse: number | null;
  disputingIdx: number | null;
  disputeResults: Record<number, DisputeResult>;
  onRespond: (review: Review, index: number) => void;
  onDispute: (review: Review, index: number) => void;
  onCreateCard: (review: Review) => void;
  onCopyResponse: (text: string, index: number) => void;
}

export default function ReviewsTab({
  reviews,
  planTier,
  respondingIdx,
  aiResponses,
  copiedResponse,
  disputingIdx,
  disputeResults,
  onRespond,
  onDispute,
  onCreateCard,
  onCopyResponse,
}: ReviewsTabProps) {
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviews = reviews.filter((r) => {
    const matchesRating = filterRating === "all" || r.rating === filterRating;
    const matchesQuery =
      !searchQuery ||
      r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRating && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-editorial text-2xl font-normal text-[#0c1754]">
              Bandeja de Reseñas de Clientes
            </h2>
            <p className="text-sm text-[#969696]">
              Respondé con IA, generá tarjetas para redes sociales y disputá reseñas sospechosas.
            </p>
          </div>

          {/* Quick star filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterRating("all")}
              className={`h-9 rounded-full px-3.5 text-xs font-semibold transition cursor-pointer ${
                filterRating === "all"
                  ? "bg-[#0c1754] text-white"
                  : "border border-[#f0e9e1] bg-white text-[#222222] hover:bg-[#f9f8f6]"
              }`}
            >
              Todas ({reviews.length})
            </button>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              return (
                <button
                  key={stars}
                  onClick={() => setFilterRating(stars)}
                  className={`h-9 rounded-full px-3 text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${
                    filterRating === stars
                      ? "bg-[#2545ff] text-white"
                      : "border border-[#f0e9e1] bg-white text-[#222222] hover:bg-[#f9f8f6]"
                  }`}
                >
                  <span>{stars}★</span>
                  <span className="opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search input */}
        <div className="mt-5">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por cliente o contenido de la opinión..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 rounded-xl border border-[#f0e9e1] bg-[#f9f8f6] pl-10 pr-4 text-xs text-[#171417] placeholder:text-[#969696] focus:border-[#2545ff] focus:bg-white focus:outline-none"
            />
            <svg
              className="absolute left-3.5 top-3.5 h-4 w-4 text-[#969696]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Reviews Stream */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#f0e9e1] bg-white p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#eaebf8] text-2xl">
              💬
            </div>
            <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
              No se encontraron reseñas con este filtro
            </h3>
            <p className="mt-1 text-xs text-[#969696]">
              Probá seleccionando otra calificación o limpiando la búsqueda.
            </p>
          </div>
        ) : (
          filteredReviews.map((review, i) => {
            const originalIndex = reviews.findIndex(
              (r) => r.author === review.author && r.text === review.text && r.publishedAt === review.publishedAt
            );
            const idx = originalIndex !== -1 ? originalIndex : i;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs transition hover:border-[#cccccc]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eaebf8] font-bold text-[#0c1754] text-xs">
                      {review.author ? review.author.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0c1754] text-sm">
                        {review.author}
                      </h4>
                      <p className="text-[11px] text-[#969696]">
                        {review.publishedAt
                          ? new Date(review.publishedAt).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "Reciente"}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={`text-base ${s <= review.rating ? "text-[#2545ff]" : "text-[#f0e9e1]"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mt-3 text-sm text-[#222222]/85 leading-relaxed font-sans">
                  {review.text || <span className="italic text-[#969696] font-normal">Sin comentario de texto.</span>}
                </p>

                {/* Actions Row */}
                <div className="mt-4 pt-4 border-t border-[#f0e9e1] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Share Card */}
                    <button
                      onClick={() => onCreateCard(review)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#2545ff] bg-white px-3.5 text-xs font-semibold text-[#2545ff] transition hover:bg-[#eaebf8] cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Crear Tarjeta Social
                    </button>

                    {/* Pro AI Reply */}
                    {planTier === "pro" && (
                      <button
                        onClick={() => onRespond(review, idx)}
                        disabled={respondingIdx === idx}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#f0e9e1] bg-[#f9f8f6] px-3.5 text-xs font-semibold text-[#0c1754] transition hover:bg-[#eaebf8] disabled:opacity-50 cursor-pointer"
                      >
                        {respondingIdx === idx ? (
                          <>
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Redactando...
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5 text-[#2545ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Responder con IA
                          </>
                        )}
                      </button>
                    )}

                    {/* Pro Dispute if <= 2 stars */}
                    {planTier === "pro" && review.rating <= 2 && review.text && (
                      <button
                        onClick={() => onDispute(review, idx)}
                        disabled={disputingIdx === idx}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 cursor-pointer"
                      >
                        {disputingIdx === idx ? (
                          <>
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Auditando políticas...
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Disputar ante Google
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* AI Response Output */}
                {aiResponses[idx] && (
                  <div className="mt-4 rounded-2xl border border-[#2545ff]/20 bg-[#eaebf8]/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#0c1754] flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-[#2545ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Respuesta sugerida por IA
                      </span>
                      <button
                        onClick={() => onCopyResponse(aiResponses[idx], idx)}
                        className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-purple-700 shadow-sm transition hover:bg-purple-100 dark:bg-purple-800 dark:text-purple-200"
                      >
                        {copiedResponse === idx ? "¡Copiado!" : "Copiar"}
                      </button>
                    </div>
                    <p className="text-sm text-purple-950 dark:text-purple-200 whitespace-pre-wrap leading-relaxed">
                      {aiResponses[idx]}
                    </p>
                  </div>
                )}

                {/* Dispute Output */}
                {disputeResults[idx] && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50/50 p-4 dark:border-red-900/40 dark:bg-red-900/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                        {disputeResults[idx].is_disputable
                          ? `⚠️ Disputable (${disputeResults[idx].confidence}% de probabilidad)`
                          : "✅ Cumple con políticas de Google"}
                      </span>
                    </div>

                    {disputeResults[idx].violations.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {disputeResults[idx].violations.map((v, vi) => (
                          <span
                            key={vi}
                            className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                      {disputeResults[idx].reasoning}
                    </p>

                    {disputeResults[idx].is_disputable && disputeResults[idx].dispute_letter && (
                      <div className="mt-2 rounded-lg bg-white p-3 border border-red-200/80 dark:bg-slate-900 dark:border-red-900/40">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Carta formal para Soporte de Google:
                          </span>
                          <button
                            onClick={() => onCopyResponse(disputeResults[idx].dispute_letter, idx)}
                            className="text-xs font-bold text-red-600 hover:underline"
                          >
                            {copiedResponse === idx ? "¡Copiada!" : "Copiar Carta"}
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">
                          {disputeResults[idx].dispute_letter}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
