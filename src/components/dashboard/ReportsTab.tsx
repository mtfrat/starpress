"use client";

import { Analysis, GbpReview } from "@/types/dashboard";

interface ReportsTabProps {
  planTier: string;
  analysis: Analysis | null;
  analyzing: boolean;
  onAnalyze: () => void;
  weeklyReport: Record<string, unknown> | null;
  generatingReport: boolean;
  onGenerateReport: () => void;
  gbpConnected: boolean;
  gbpReviews: GbpReview[];
  onConnectGoogle: () => void;
  onPublishReply: (reviewId: string) => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  publishingReply: boolean;
  copiedField: string | null;
  onCopyText: (text: string, field: string) => void;
}

export default function ReportsTab({
  planTier,
  analysis,
  analyzing,
  onAnalyze,
  weeklyReport,
  generatingReport,
  onGenerateReport,
  gbpConnected,
  gbpReviews,
  onConnectGoogle,
  onPublishReply,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  publishingReply,
  copiedField,
  onCopyText,
}: ReportsTabProps) {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs">
        <h2 className="font-editorial text-2xl font-normal text-[#0c1754]">
          Reportes Ejecutivos & Conexión Google Business
        </h2>
        <p className="mt-1 text-sm text-[#969696]">
          Analítica de reputación impulsada por IA y sincronización directa con la API oficial de Google.
        </p>
      </div>

      {planTier !== "pro" ? (
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-8 text-center shadow-xs">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#eaebf8] text-2xl text-[#2545ff]">
            🤖
          </div>
          <h3 className="font-editorial text-2xl font-normal text-[#0c1754]">
            Desbloqueá Reportes Semanales y Google Business Profile
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#969696]">
            Obtené informes ejecutivos semanales automáticos y respondé reseñas de Google Maps de forma instantánea desde este panel.
          </p>
          <a
            href="/pricing"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#2545ff] px-6 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1a38e8] active:scale-95"
          >
            Actualizar a Pro
          </a>
        </div>
      ) : (
        <>
          {/* AI Analysis Card */}
          <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs">
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0e9e1] pb-4">
              <div>
                <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
                  Diagnóstico de Sentimiento & Copys para Redes
                </h3>
                <p className="text-xs text-[#969696] mt-0.5">
                  La IA resume las tendencias que más valoran tus clientes y genera publicaciones para Instagram y X.
                </p>
              </div>
              <button
                onClick={onAnalyze}
                disabled={analyzing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#2545ff] px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1a38e8] disabled:opacity-50 cursor-pointer"
              >
                {analyzing ? "Analizando..." : "Re-analizar con IA"}
              </button>
            </div>

            {analysis ? (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-[#f9f8f6] p-5 border border-[#f0e9e1]">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 mb-1">
                      Lo que más aman tus clientes
                    </p>
                    <p className="font-editorial italic text-base text-[#0c1754]">
                      {analysis.top_positive}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#f9f8f6] p-5 border border-[#f0e9e1]">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-700 mb-1">
                      Punto clave a mejorar
                    </p>
                    <p className="font-editorial italic text-base text-[#0c1754]">
                      {analysis.top_negative || "Sin quejas recurrentes destacadas"}
                    </p>
                  </div>
                </div>

                {/* Social Posts — Officevibe Clean Cards */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#969696]">
                      Publicaciones Sugeridas para Redes Sociales
                    </span>
                    <span className="text-[11px] font-medium text-[#2545ff] bg-[#eaebf8] px-2.5 py-0.5 rounded-full">
                      Listas para publicar
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[#f0e9e1] bg-[#f9f8f6] p-5 transition hover:border-[#cccccc]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c1754]">
                          <span className="h-2 w-2 rounded-full bg-[#2545ff]" />
                          Instagram / LinkedIn
                        </span>
                        <button
                          onClick={() => onCopyText(analysis.instagram_copy, "instagram")}
                          className="rounded-full bg-white border border-[#f0e9e1] px-3 py-1 text-xs font-semibold text-[#0c1754] hover:bg-[#2545ff] hover:text-white hover:border-[#2545ff] transition-all cursor-pointer shadow-xs"
                        >
                          {copiedField === "instagram" ? "✓ ¡Copiado!" : "Copiar texto"}
                        </button>
                      </div>
                      <p className="text-xs text-[#222222]/85 whitespace-pre-wrap leading-relaxed font-sans">
                        {analysis.instagram_copy}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#f0e9e1] bg-[#f9f8f6] p-5 transition hover:border-[#cccccc]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0c1754]">
                          <span className="h-2 w-2 rounded-full bg-[#171417]" />
                          Twitter / X
                        </span>
                        <button
                          onClick={() => onCopyText(analysis.twitter_copy, "twitter")}
                          className="rounded-full bg-white border border-[#f0e9e1] px-3 py-1 text-xs font-semibold text-[#0c1754] hover:bg-[#2545ff] hover:text-white hover:border-[#2545ff] transition-all cursor-pointer shadow-xs"
                        >
                          {copiedField === "twitter" ? "✓ ¡Copiado!" : "Copiar post"}
                        </button>
                      </div>
                      <p className="text-xs text-[#222222]/85 whitespace-pre-wrap leading-relaxed font-sans">
                        {analysis.twitter_copy}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#969696]">
                Presioná &quot;Re-analizar con IA&quot; para generar el informe de percepción de tus clientes.
              </p>
            )}
          </div>

          {/* Weekly Report Card */}
          <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0e9e1] pb-4">
              <div>
                <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
                  Reporte Semanal de Rendimiento
                </h3>
                <p className="text-xs text-[#969696] mt-0.5">
                  Resumen de evolución semanal con ítems de acción concretos para el personal.
                </p>
              </div>
              <button
                onClick={onGenerateReport}
                disabled={generatingReport}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0c1754] px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1a287a] disabled:opacity-50 cursor-pointer"
              >
                {generatingReport ? "Generando..." : weeklyReport ? "Actualizar Reporte" : "Generar Reporte"}
              </button>
            </div>

            {weeklyReport ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-[#f9f8f6] p-5 border border-[#f0e9e1]">
                  <p className="text-sm font-medium text-[#0c1754] leading-relaxed">
                    {weeklyReport.summary as string}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#969696]">
                Hacé clic en &quot;Generar Reporte&quot; para compilar las métricas de la semana.
              </p>
            )}
          </div>

          {/* Google Business Profile Connection */}
          <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
                  Google Business Profile (API Oficial)
                </h3>
                <p className="text-xs text-[#969696] mt-0.5">
                  Conectá tu cuenta de Google para responder reseñas directamente sin abrir Google Maps.
                </p>
              </div>

              {!gbpConnected ? (
                <button
                  onClick={onConnectGoogle}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#2545ff] px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1a38e8] cursor-pointer"
                >
                  Conectar Google
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaebf8] px-3.5 py-1 text-xs font-semibold text-[#0c1754]">
                  <span className="h-2 w-2 rounded-full bg-[#2545ff]" />
                  Conectado con Google
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
