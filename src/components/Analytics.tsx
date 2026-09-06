"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Simple page view tracker - works with any analytics provider
// Configure by setting NEXT_PUBLIC_ANALYTICS_ID in .env.local
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    // Log page view (replace with your analytics provider)
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ANALYTICS_ID) {
      // Example: Google Analytics gtag
      window.dispatchEvent(
        new CustomEvent("pageview", { detail: { path: url } })
      );
    }
  }, [pathname, searchParams]);

  return null;
}

// Track custom events
export function trackEvent(name: string, properties?: Record<string, string | number>) {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ANALYTICS_ID) {
    window.dispatchEvent(
      new CustomEvent("event", { detail: { name, ...properties } })
    );
  }
}
