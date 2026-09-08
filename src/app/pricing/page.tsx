"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const plans = [
  {
    name: "Plan Gratuito",
    price: "$0",
    period: "para siempre",
    description: "Ideal para pequeños negocios locales que dan sus primeros pasos con prueba social.",
    features: [
      "1 negocio o sucursal conectado",
      "Widgets web: Insignia y Muro de testimonios",
      "Generador de tarjetas para redes (Retina 3x)",
      "Kit QR de mostrador imprimible",
      "Buzón privado de sugerencias",
      "Hasta 50 reseñas sincronizadas",
      "Diagnóstico básico de satisfacción",
    ],
    cta: "Comenzar Gratis",
    href: "/auth/signup",
    popular: false,
  },
  {
    name: "Plan Pro",
    price: "$19",
    period: "/mes",
    yearlyPrice: "$190",
    yearlyPeriod: "/año",
    save: "Ahorra 17%",
    description: "Para marcas y profesionales que quieren automatizar su reputación y multiplicar clientes.",
    features: [
      "Ubicaciones y sucursales ilimitadas",
      "Widgets avanzados: Carrusel auto-rotativo interactivo",
      "Respuestas automáticas con IA en el idioma del cliente",
      "Detección y solicitud de disputa de reseñas falsas con IA",
      "Sincronización oficial con Google Business Profile",
      "Alertas tempranas por email ante reseñas negativas",
      "Reporte ejecutivo semanal con plan de acción",
      "Sin marca de agua en widgets ni tarjetas",
      "Reseñas y widgets embebibles ilimitados",
      "Schema markup SEO automático para Google",
      "Webhooks personalizados e integraciones",
    ],
    cta: "Comenzar con Pro",
    href: "#",
    popular: true,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/auth/signup";
        return;
      }

      let res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: annual ? "yearly" : "monthly" }),
      });

      // If Lemon Squeezy is not configured yet, fallback gracefully to Stripe
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.error?.includes("Lemon Squeezy is not fully configured")) {
          res = await fetch("/api/stripe/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ interval: annual ? "yearly" : "monthly" }),
          });
        } else {
          alert(errorData.error || "Error al iniciar el pago");
          return;
        }
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Error al crear la sesión de pago");
      }
    } catch {
      alert("Ocurrió un error inesperado. Por favor, reintenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#171417] antialiased">
      {/* Header */}
      <header className="border-b border-[#f0e9e1] bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#0c1754]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0c1754] text-white font-bold text-sm">
              ★
            </span>
            <span>Star<span className="text-[#2545ff]">Press</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-xs font-semibold text-[#222222] hover:text-[#0c1754]"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-[#2545ff] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1a38e8]"
            >
              Empezar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      {/* Schema FAQPage for Pricing Rich Results & AI Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "¿Puedo cancelar mi suscripción en cualquier momento?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sí, sin contratos forzosos. Podés cancelar desde el portal de facturación en cualquier momento y mantendrás el plan Pro hasta finalizar el ciclo abonado."
                }
              },
              {
                "@type": "Question",
                "name": "¿Qué sucede con mis reseñas si decido volver al plan Free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutamente nada. Tu historial y ubicaciones se conservan intactos. Simplemente volverás a las capacidades del plan gratuito sin perder datos."
                }
              },
              {
                "@type": "Question",
                "name": "¿Ofrecen garantía de satisfacción?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Si durante los primeros 7 días sientes que StarPress no aportó valor a tu negocio, escribinos a soporte y te reembolsamos el 100% de tu pago."
                }
              }
            ]
          }),
        }}
      />
      <div className="px-6 pt-20 pb-12 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
            Precios Simples y Transparentes
          </span>
          <h1 className="font-editorial mt-3 text-4xl font-normal tracking-tight text-[#0c1754] md:text-5xl">
            Inversión clara para hacer crecer tu{" "}
            <em className="font-editorial italic font-normal text-[#2545ff]">prestigio</em>
          </h1>
          <p className="mt-4 text-base text-[#222222]/80 max-w-lg mx-auto">
            Comienza gratis para siempre. Pasa a Pro cuando quieras delegar respuestas en IA y automatizar tus publicaciones.
          </p>

          {/* Annual toggle */}
          <div className="mt-8 inline-flex items-center justify-center gap-3 rounded-full border border-[#f0e9e1] bg-white p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                !annual ? "bg-[#0c1754] text-white" : "text-[#969696] hover:text-[#0c1754]"
              }`}
            >
              Facturación Mensual
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                annual ? "bg-[#0c1754] text-white" : "text-[#969696] hover:text-[#0c1754]"
              }`}
            >
              <span>Facturación Anual</span>
              <span className="rounded-full bg-[#eaebf8] px-2 py-0.5 text-[10px] font-bold text-[#2545ff]">
                Ahorra 17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-6 pb-20 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-[20px] bg-white p-8 flex flex-col justify-between shadow-[0_16px_40px_rgba(12,23,84,0.06)] ${
              plan.popular
                ? "border-2 border-[#2545ff]"
                : "border border-[#f0e9e1]"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#2545ff] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
                Opción Recomendada
              </div>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-2xl font-normal text-[#0c1754]">
                  {plan.name}
                </h3>
                {plan.popular && (
                  <span className="rounded-full bg-[#eaebf8] px-2.5 py-0.5 text-[10px] font-bold text-[#2545ff] uppercase">
                    Ilimitado
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-editorial text-5xl font-normal text-[#0c1754]">
                  {annual && plan.yearlyPrice ? plan.yearlyPrice : plan.price}
                </span>
                <span className="text-xs text-[#969696]">
                  {annual && plan.yearlyPeriod ? plan.yearlyPeriod : plan.period}
                </span>
              </div>

              {annual && plan.save && (
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  {plan.save} con facturación anual
                </p>
              )}

              <p className="mt-3 text-xs text-[#222222]/80 leading-relaxed">
                {plan.description}
              </p>

              <button
                onClick={
                  plan.popular
                    ? handleUpgrade
                    : () => (window.location.href = plan.href)
                }
                disabled={loading}
                className={`mt-6 w-full rounded-full py-3.5 text-xs font-semibold transition-all cursor-pointer ${
                  plan.popular
                    ? "bg-[#2545ff] text-white hover:bg-[#1a38e8] shadow-xs active:scale-[0.98] disabled:opacity-50"
                    : "border border-[#f0e9e1] bg-[#f9f8f6] text-[#0c1754] hover:bg-white hover:border-[#cccccc]"
                }`}
              >
                {loading && plan.popular ? "Conectando con Stripe..." : plan.cta}
              </button>

              <div className="mt-8 pt-6 border-t border-[#f0e9e1]">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696] mb-4">
                  Incluye:
                </p>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-xs text-[#222222]/85 leading-tight"
                    >
                      <span className="text-[#2545ff] font-bold">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-3xl px-6 pb-24 border-t border-[#f0e9e1] pt-16">
        <h2 className="font-editorial text-3xl font-normal text-[#0c1754] text-center">
          Preguntas Frecuentes
        </h2>
        <div className="mt-8 space-y-4">
          {[
            {
              q: "¿Puedo cancelar mi suscripción en cualquier momento?",
              a: "Sí, sin contratos forzosos. Podés cancelar desde el portal de facturación en cualquier momento y mantendrás el plan Pro hasta finalizar el ciclo abonado.",
            },
            {
              q: "¿Qué sucede con mis reseñas si decido volver al plan Free?",
              a: "Absolutamente nada. Tu historial y ubicaciones se conservan intactos. Simplemente volverás a las capacidades del plan gratuito sin perder datos.",
            },
            {
              q: "¿Ofrecen garantía de satisfacción?",
              a: "Si durante los primeros 7 días sientes que StarPress no aportó valor a tu negocio, escribinos a soporte y te reembolsamos el 100% de tu pago.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-[#f0e9e1] bg-white p-6 shadow-xs"
            >
              <h3 className="text-sm font-semibold text-[#0c1754]">
                {item.q}
              </h3>
              <p className="mt-2 text-xs text-[#222222]/85 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
