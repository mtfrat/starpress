"use client";

import { useState } from "react";
import Link from "next/link";
import { Location } from "@/types/dashboard";

interface WidgetsTabProps {
  location: Location;
}

export default function WidgetsTab({ location }: WidgetsTabProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const getEmbedCode = (type: string) => {
    return `<div id="starpress-widget" data-location="${location.id}" data-type="${type}"></div>\n<script src="${window.location.origin}/embed.js" async></script>`;
  };

  const handleCopy = (type: string) => {
    const code = getEmbedCode(type);
    navigator.clipboard.writeText(code);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Card */}
      <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-normal text-[#0c1754]">
            Widgets de Reseñas para tu Sitio Web
          </h2>
          <p className="mt-1 text-sm text-[#969696]">
            Elegí el estilo de widget que mejor combine con tu marca y pegá el código en tu web.
          </p>
        </div>

        <Link
          href="/widget-config"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#0c1754] px-5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1a287a] active:scale-95"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Editor Visual Avanzado
        </Link>
      </div>

      {/* Widget Presets Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Preset 1: Carousel */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-full bg-[#eaebf8] text-[#2545ff] flex items-center justify-center mb-4 text-sm font-bold">
              🎠
            </div>
            <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
              Carrusel Interactivo
            </h3>
            <p className="mt-2 text-xs text-[#222222]/80 leading-relaxed">
              Ideal para páginas de inicio o secciones hero. Los visitantes deslizan tus mejores opiniones con estrellas doradas.
            </p>

            <div className="mt-4 rounded-xl bg-[#f9f8f6] p-4 border border-[#f0e9e1]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0c1754]">
                <span>⭐ {location.rating.toFixed(1)} en Google</span>
                <span className="text-[#969696]">· Deslizable</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleCopy("carousel")}
            className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#2545ff] px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-[#1a38e8] active:scale-95 cursor-pointer"
          >
            {copiedType === "carousel" ? "✓ ¡Código Copiado!" : "Copiar Código Carrusel"}
          </button>
        </div>

        {/* Preset 2: Badge */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-full bg-[#eaebf8] text-[#0c1754] flex items-center justify-center mb-4 text-sm font-bold">
              🏷️
            </div>
            <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
              Insignia Flotante o Header
            </h3>
            <p className="mt-2 text-xs text-[#222222]/80 leading-relaxed">
              Un badge compacto con el logo de Google y tu puntuación promedio. Perfecto para el navbar o footer de tu web.
            </p>

            <div className="mt-4 flex justify-center py-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#f0e9e1] bg-[#f9f8f6] px-3.5 py-1.5 text-xs font-bold text-[#0c1754]">
                <span className="text-[#2545ff] text-sm">★</span>
                <span>{location.rating.toFixed(1)}</span>
                <span className="text-[#969696] font-normal">en Google</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => handleCopy("badge")}
            className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#0c1754] bg-white px-4 text-xs font-semibold text-[#0c1754] shadow-xs transition hover:bg-[#f9f8f6] active:scale-95 cursor-pointer"
          >
            {copiedType === "badge" ? "✓ ¡Código Copiado!" : "Copiar Código Badge"}
          </button>
        </div>

        {/* Preset 3: List / Grid */}
        <div className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-full bg-[#eaebf8] text-emerald-700 flex items-center justify-center mb-4 text-sm font-bold">
              📑
            </div>
            <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
              Muro de Testimonios (Lista)
            </h3>
            <p className="mt-2 text-xs text-[#222222]/80 leading-relaxed">
              Muestra una lista vertical de reseñas completas con avatares y fechas para máxima confianza en páginas de aterrizaje.
            </p>

            <div className="mt-4 space-y-1.5">
              <div className="h-3 w-3/4 rounded-full bg-[#f0e9e1]" />
              <div className="h-3 w-1/2 rounded-full bg-[#f0e9e1]" />
            </div>
          </div>

          <button
            onClick={() => handleCopy("list")}
            className="mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-[#f0e9e1] bg-[#f9f8f6] px-4 text-xs font-semibold text-[#222222] shadow-xs transition hover:bg-white hover:border-[#cccccc] active:scale-95 cursor-pointer"
          >
            {copiedType === "list" ? "✓ ¡Código Copiado!" : "Copiar Código Lista"}
          </button>
        </div>
      </div>
    </div>
  );
}
