"use client";

import { Location, FeedbackItem } from "@/types/dashboard";
import QRCodeGenerator from "@/components/QRCodeGenerator";

interface GatingQRTabProps {
  location: Location;
  feedbackList: FeedbackItem[];
  planTier: string;
}

export default function GatingQRTab({
  location,
  feedbackList,
  planTier,
}: GatingQRTabProps) {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs">
        <h2 className="font-editorial text-2xl font-normal text-[#0c1754]">
          Sistema de Review Gating & Kit QR
        </h2>
        <p className="mt-1 text-sm text-[#969696]">
          El arma secreta para negocios físicos: filtrá el descontento antes de que afecte tu puntaje en Google Maps.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Display Card */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
                Tu Código QR de Mostrador
              </h3>
              <span className="rounded-full bg-[#eaebf8] px-3 py-1 text-xs font-semibold text-[#0c1754]">
                Imprimible
              </span>
            </div>

            <p className="text-xs text-[#222222]/80 leading-relaxed mb-6">
              Imprimí este código QR en mesas, servilleteros, cartas o tickets de caja.
            </p>

            <div className="flex justify-center p-6 rounded-2xl bg-[#f9f8f6] border border-[#f0e9e1]">
              <QRCodeGenerator
                locationId={location.id}
                businessName={location.name || "Tu Negocio"}
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-[#eaebf8]/60 p-4 border border-[#2545ff]/15">
            <h4 className="text-xs font-bold uppercase tracking-[0.14em] text-[#0c1754]">
              ¿Cómo funciona el embudo inteligente?
            </h4>
            <div className="mt-2 text-xs text-[#0c1754]/80 space-y-1.5 leading-relaxed">
              <p>🟢 <strong>4 y 5 Estrellas:</strong> Se redirigen inmediatamente a dejar su reseña 5★ en Google Maps.</p>
              <p>🟡 <strong>1 a 3 Estrellas:</strong> Se abre un formulario privado interno para que te dejen su queja sin dañar tu reputación pública.</p>
            </div>
          </div>
        </div>

        {/* Private Feedback Inbox */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-[#f0e9e1] pb-4">
            <h3 className="font-editorial text-xl font-normal text-[#0c1754] flex items-center gap-2">
              Buzón de Sugerencias Privadas
              {feedbackList.length > 0 && (
                <span className="rounded-full bg-[#eaebf8] px-2.5 py-0.5 text-xs font-bold text-[#2545ff]">
                  {feedbackList.length}
                </span>
              )}
            </h3>
          </div>

          {planTier !== "pro" ? (
            <div className="my-auto rounded-2xl border border-dashed border-[#f0e9e1] bg-[#f9f8f6] p-8 text-center">
              <span className="text-3xl mb-2 block">🔒</span>
              <h4 className="font-editorial text-lg font-normal text-[#0c1754]">
                Buzón Privado exclusivo del Plan Pro
              </h4>
              <p className="mt-1 text-xs text-[#969696] max-w-sm mx-auto">
                Actualizá a Pro para capturar reclamos internos y el contacto de tus clientes antes de que califiquen negativamente en Google.
              </p>
            </div>
          ) : feedbackList.length === 0 ? (
            <div className="my-auto rounded-2xl border border-dashed border-[#f0e9e1] bg-[#f9f8f6] p-8 text-center">
              <span className="text-3xl mb-2 block">📥</span>
              <h4 className="font-editorial text-lg font-normal text-[#0c1754]">
                No hay quejas internas registradas
              </h4>
              <p className="mt-1 text-xs text-[#969696]">
                Colocá tu código QR en el local para empezar a capturar sugerencias privadas.
              </p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
              {feedbackList.map((fb) => (
                <div
                  key={fb.id}
                  className="rounded-2xl border border-[#f0e9e1] p-4 bg-[#f9f8f6]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-[#2545ff]">
                      {"★".repeat(fb.rating)}
                      <span className="text-[#f0e9e1]">
                        {"★".repeat(5 - fb.rating)}
                      </span>
                    </span>
                    <span className="text-[11px] text-[#969696]">
                      {new Date(fb.created_at).toLocaleDateString("es-ES")}
                    </span>
                  </div>

                  {fb.comment && (
                    <p className="text-xs text-[#222222]/85 leading-relaxed font-sans">
                      {fb.comment}
                    </p>
                  )}

                  {fb.contact && (
                    <p className="mt-2 text-xs font-semibold text-[#2545ff]">
                      Contacto del cliente: {fb.contact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
