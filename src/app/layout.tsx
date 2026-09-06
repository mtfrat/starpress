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
    default: "StarPress - Turn Google Reviews Into Revenue",
    template: "%s | StarPress",
  },
  description:
    "Embed Google Reviews on your website, get AI-powered insights, and grow your business. Free plan available.",
  keywords: [
    "google reviews",
    "review widget",
    "business reviews",
    "embed reviews",
    "AI review analysis",
    "reputation management",
    "google business profile",
    "customer reviews",
    "review monitoring",
  ],
  authors: [{ name: "StarPress" }],
  creator: "StarPress",
  publisher: "StarPress",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "StarPress",
    title: "StarPress - Turn Google Reviews Into Revenue",
    description:
      "Embed Google Reviews on your website, get AI-powered insights, and grow your business.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "StarPress - Review Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StarPress - Turn Google Reviews Into Revenue",
    description:
      "Embed Google Reviews on your website, get AI-powered insights, and grow your business.",
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
  verification: {
    google: "YOUR_GOOGLE_VERIFICATION_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0c1754" />
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
