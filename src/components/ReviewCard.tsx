"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";

interface Review {
  author: string;
  rating: number;
  text: string;
  publishedAt?: string;
}

interface CardTemplate {
  id: string;
  name: string;
  description: string;
  bg: string;
  textColor: string;
  authorColor: string;
  metaColor: string;
  accentColor: string;
  starColor: string;
  borderColor: string;
  isSerifQuote: boolean;
  quoteColor: string;
  badgeBg: string;
  badgeText: string;
}

const TEMPLATES: CardTemplate[] = [
  {
    id: "editorial",
    name: "Editorial Cream",
    description: "Inspirado en Officevibe: papel cálido con tipografía serif literaria",
    bg: "#f9f8f6",
    textColor: "#171417",
    authorColor: "#0c1754",
    metaColor: "#969696",
    accentColor: "#2545ff",
    starColor: "#2545ff",
    borderColor: "#f0e9e1",
    isSerifQuote: true,
    quoteColor: "#2545ff",
    badgeBg: "#eaebf8",
    badgeText: "#0c1754",
  },
  {
    id: "navy",
    name: "Ink Navy Luxury",
    description: "Contraste profundo y elegante con acentos en lavanda y cobalto",
    bg: "#0c1754",
    textColor: "#ffffff",
    authorColor: "#ffffff",
    metaColor: "#eaebf8",
    accentColor: "#2545ff",
    starColor: "#fbbf24",
    borderColor: "rgba(255, 255, 255, 0.12)",
    isSerifQuote: true,
    quoteColor: "#eaebf8",
    badgeBg: "rgba(37, 69, 255, 0.25)",
    badgeText: "#ffffff",
  },
  {
    id: "minimal",
    name: "Pure Paper",
    description: "Blanco inmaculado con bordes sutiles y lectura hiperlimpia",
    bg: "#ffffff",
    textColor: "#171417",
    authorColor: "#171417",
    metaColor: "#969696",
    accentColor: "#2545ff",
    starColor: "#fbbf24",
    borderColor: "#f0e9e1",
    isSerifQuote: false,
    quoteColor: "#f0e9e1",
    badgeBg: "#f9f8f6",
    badgeText: "#222222",
  },
  {
    id: "cobalt",
    name: "Cobalt Punch",
    description: "Vibrante y audaz, ideal para testimonios estelares breves",
    bg: "#ffffff",
    textColor: "#0c1754",
    authorColor: "#0c1754",
    metaColor: "#64748b",
    accentColor: "#2545ff",
    starColor: "#2545ff",
    borderColor: "#2545ff",
    isSerifQuote: true,
    quoteColor: "#2545ff",
    badgeBg: "#2545ff",
    badgeText: "#ffffff",
  },
];

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={i <= rating ? color : "none"}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewCard({
  review,
  businessName,
}: {
  review: Review;
  businessName: string;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState("editorial");
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const template = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });

      const link = document.createElement("a");
      const safeAuthor = (review.author || "customer").replace(/\s+/g, "-").toLowerCase();
      link.download = `starpress-review-${safeAuthor}-${template.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error("Download failed:", err);
    }

    setDownloading(false);
  };

  return (
    <div className="w-full">
      {/* Template Selector — Pill Buttons */}
      <div className="mb-5">
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#969696]">
          Estilo Editorial de Publicación
        </label>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => {
            const isSelected = selectedTemplate === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplate(t.id)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                  isSelected
                    ? "bg-[#2545ff] text-white shadow-sm"
                    : "border border-[#f0e9e1] bg-white text-[#222222] hover:border-[#cccccc] hover:bg-[#f9f8f6]"
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-[#969696]">
          {template.description}
        </p>
      </div>

      {/* Card Preview Container */}
      <div className="mb-6 flex justify-center overflow-hidden rounded-2xl bg-[#f0e9e1]/40 p-4 sm:p-6">
        <div
          ref={cardRef}
          style={{
            width: "440px",
            maxWidth: "100%",
            backgroundColor: template.bg,
            color: template.textColor,
            borderRadius: "16px",
            border: `1.5px solid ${template.borderColor}`,
            padding: "32px",
            boxShadow: "0 8px 32px rgba(12, 23, 84, 0.08)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            boxSizing: "border-box",
          }}
        >
          {/* Top Bar: Stars + Verified Badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <StarRating rating={review.rating || 5} color={template.starColor} />

            <div
              style={{
                backgroundColor: template.badgeBg,
                color: template.badgeText,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                padding: "4px 10px",
                borderRadius: "100px",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>✓</span>
              <span>Google Maps Verificado</span>
            </div>
          </div>

          {/* Decorative Opening Quote */}
          <div
            style={{
              fontSize: "44px",
              lineHeight: 0.8,
              fontFamily: "var(--font-newsreader), 'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              color: template.quoteColor,
              opacity: 0.6,
              marginBottom: "12px",
              userSelect: "none",
            }}
          >
            &ldquo;
          </div>

          {/* Review Text Body */}
          <p
            style={{
              fontFamily: template.isSerifQuote
                ? "var(--font-newsreader), 'Playfair Display', Georgia, serif"
                : "var(--font-inter), 'Inter', sans-serif",
              fontSize: template.isSerifQuote ? "20px" : "15px",
              lineHeight: "1.55",
              fontStyle: template.isSerifQuote ? "italic" : "normal",
              margin: "0 0 28px 0",
              color: template.textColor,
              letterSpacing: "-0.01em",
            }}
          >
            {review.text || "Excelente experiencia, muy recomendable en todo sentido."}
          </p>

          {/* Footer: Author, Role/Location & Brand */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              borderTop: `1px solid ${template.borderColor}`,
              paddingTop: "20px",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "var(--font-inter), 'Inter', sans-serif",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: template.authorColor,
                  margin: "0 0 2px 0",
                  letterSpacing: "-0.01em",
                }}
              >
                {review.author || "Cliente Satisfecho"}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-inter), 'Inter', sans-serif",
                  fontSize: "12px",
                  color: template.metaColor,
                  margin: 0,
                }}
              >
                Reseña en Google
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontFamily: "var(--font-inter), 'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: template.authorColor,
                  margin: "0 0 2px 0",
                }}
              >
                {businessName || "Mi Negocio"}
              </p>
              <span
                style={{
                  fontFamily: "var(--font-newsreader), Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "11px",
                  color: template.accentColor,
                  fontWeight: 500,
                }}
              >
                Vía StarPress
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA: Pill button */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="w-full sm:flex-1 rounded-full bg-[#2545ff] px-6 py-3 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#1a38e8] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {downloading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Exportando imagen de alta resolución...
            </span>
          ) : downloadSuccess ? (
            "✓ ¡Imagen descargada con éxito!"
          ) : (
            "Descargar Imagen para Redes Sociales (PNG HD)"
          )}
        </button>

        <span className="text-[11px] text-[#969696] font-medium text-center">
          100% lista para publicar en Instagram, LinkedIn y Twitter
        </span>
      </div>
    </div>
  );
}

