import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Newsreader } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://starpress.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "StarPress — Gestión de Reseñas de Google Maps, Widgets & IA",
    template: "%s | StarPress",
  },
  description:
    "Convierte las reseñas de Google Maps en clientes. Widgets web ligeros, respuestas automáticas con Inteligencia Artificial, tarjetas de diseño editorial para Instagram y kit QR con review gating.",
  keywords: [
    "gestión de reseñas google maps",
    "widgets de reseñas para web",
    "review widget google",
    "responder reseñas con ia",
    "reputación online para negocios locales",
    "tarjetas para redes sociales reseñas",
    "google business profile api",
    "kit qr opiniones clientes",
    "review gating",
    "starpress",
  ],
  authors: [{ name: "StarPress Team" }],
  creator: "StarPress",
  publisher: "StarPress",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "es_LA",
    url: BASE_URL,
    siteName: "StarPress",
    title: "StarPress — Convierte Reseñas de Google Maps en Ingresos y Autoridad",
    description:
      "Plataforma líder para negocios físicos y profesionales: widgets ultraligeros, IA para responder y disputar reseñas, y generador de piezas gráficas para redes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StarPress — Plataforma de Gestión de Reputación y Reseñas de Google",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StarPress — Gestión de Reseñas de Google Maps, Widgets & IA",
    description:
      "Widgets web interactivos, respuestas inteligentes con IA y tarjetas editoriales para redes sociales basadas en reseñas reales.",
    images: ["/og-image.png"],
    creator: "@starpress",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "StarPress",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "All",
  "url": BASE_URL,
  "description": "Plataforma de software para importar, gestionar, embeber y transformar reseñas de Google Maps en widgets web y piezas visuales para redes sociales con inteligencia artificial.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Plan Gratuito para siempre disponible"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "248",
    "bestRating": "5",
    "worstRating": "1"
  },
  "creator": {
    "@type": "Organization",
    "name": "StarPress",
    "url": BASE_URL,
    "logo": `${BASE_URL}/logo.png`,
    "sameAs": [
      "https://twitter.com/starpress",
      "https://linkedin.com/company/starpress"
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${newsreader.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0c1754" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
      </head>
      <body className="antialiased bg-[#f9f8f6] text-[#171417]">
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
