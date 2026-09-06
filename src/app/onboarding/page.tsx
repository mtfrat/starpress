"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LOADING_STEPS = [
  { text: "Conectando con Google Maps...", progress: 25 },
  { text: "Extrayendo opiniones y calificaciones verificadas...", progress: 55 },
  { text: "Analizando sentimiento y generando widgets...", progress: 85 },
  { text: "¡Preparando tu panel de reputación!", progress: 98 },
];

export default function OnboardingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      setStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 4500);

    return () => clearInterval(interval);
  }, [loading]);

  const extractPlaceId = (input: string): string | null => {
    const placeIdMatch = input.match(/place_id=([a-zA-Z0-9_-]+)/);
    if (placeIdMatch) return placeIdMatch[1];

    if (
      input.includes("google.com/maps") ||
      input.includes("goo.gl/maps") ||
      input.includes("maps.app.goo.gl")
    ) {
      return input;
    }

    if (input.trim().length > 3) {
      return input.trim();
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const query = extractPlaceId(url);
    if (!query) {
      setError("Por favor ingresá un enlace válido de Google Maps o el nombre de tu local.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: query }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ocurrió un error al importar el negocio.");
        setLoading(false);
        return;
      }

      router.push(`/dashboard?location=${data.location_id}`);
    } catch {
      setError("Error de conexión. Por favor intentá nuevamente.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#f9f8f6] px-4 py-12 sm:px-6 lg:px-8 antialiased">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight text-[#0c1754]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c1754] text-white font-bold text-sm shadow-sm">
            ★
          </span>
          <span>Star<span className="text-[#2545ff]">Press</span></span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="rounded-[20px] border border-[#f0e9e1] bg-white p-8 sm:p-10 shadow-[0_16px_40px_rgba(12,23,84,0.06)]">
          <div className="mb-6">
            <h1 className="font-editorial text-3xl font-normal text-[#0c1754]">
              Conectá tu negocio local
            </h1>
            <p className="mt-2 text-sm text-[#222222]/80 leading-relaxed">
              Pegá el link de tu ficha en Google Maps o escribí el nombre de tu negocio para importar tus reseñas automáticamente.
            </p>
          </div>

          {loading ? (
            <div className="py-8 space-y-6 text-center animate-in fade-in duration-200">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaebf8] text-[#2545ff]">
                <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
                  {LOADING_STEPS[stepIndex].text}
                </h3>
                <p className="mt-1 text-xs text-[#969696]">
                  Esto puede demorar unos 15 a 20 segundos mientras sincronizamos con Google.
                </p>
              </div>

              {/* Step Progress Bar */}
              <div className="w-full bg-[#f0e9e1] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#2545ff] h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${LOADING_STEPS[stepIndex].progress}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-[#969696]">
                <span>Paso {stepIndex + 1} de {LOADING_STEPS.length}</span>
                <span>{LOADING_STEPS[stepIndex].progress}%</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#969696] mb-2">
                  Enlace de Google Maps o Nombre del Local
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    className="w-full h-12 rounded-xl border border-[#f0e9e1] bg-[#f9f8f6] px-4 text-sm text-[#171417] placeholder:text-[#969696] transition focus:border-[#2545ff] focus:bg-white focus:outline-none"
                    placeholder="Ej: https://maps.app.goo.gl/... o Restaurante Palermo, CABA"
                  />
                </div>
                <p className="mt-2 text-xs text-[#969696] flex items-center gap-1">
                  💡 Tip: En Google Maps hacé clic en &quot;Compartir&quot; y copiá el vínculo corto.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-medium text-rose-700 border border-rose-100 flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="w-full h-12 rounded-full bg-[#2545ff] px-6 text-sm font-semibold text-white transition hover:bg-[#1a38e8] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                Importar Reseñas y Crear Widgets →
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-[#f0e9e1] text-center">
            <p className="text-xs text-[#969696]">
              Plan Gratuito: 1 negocio incluido. Plan Pro: negocios y widgets ilimitados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
