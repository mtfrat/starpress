import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://starpress.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/onboarding", "/widget-config", "/feedback/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
