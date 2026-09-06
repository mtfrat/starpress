"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sortReviews, getCarouselMix, type SortMode } from "@/lib/review-scoring";

interface Location {
  id: string;
  name: string;
  address: string;
  rating: number;
  total_reviews: number;
}

interface WidgetConfig {
  location_id: string;
  theme: string;
  primary_color: string;
  font_family: string;
  hide_watermark: boolean;
  widget_type: string;
  sort_by: string;
}

interface Review {
  author: string;
  rating: number;
  text: string;
  publishedAt: string;
  likes?: number;
}

const FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Source Sans Pro",
  "Nunito",
];

function WidgetPreview({
  config,
  location,
  reviews,
}: {
  config: WidgetConfig;
  location: Location | null;
  reviews: Review[];
}) {
  const isDark = config.theme === "dark";
  const fontFamily = config.font_family || "Inter";
  const primaryColor = config.primary_color || "#3b82f6";

  const createStars = (rating: number) =>
    "★".repeat(Math.round(rating)) + "☆".repeat(5 - Math.round(rating));

  // Sort reviews based on config
  const sortedReviews = config.widget_type === "carousel"
    ? getCarouselMix(reviews, 6)
    : sortReviews(reviews, (config.sort_by as SortMode) || "best");

  if (config.widget_type === "badge") {
    return (
      <div className="flex justify-center py-4">
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            borderRadius: "9999px",
            fontFamily: `'${fontFamily}', sans-serif`,
            fontSize: "14px",
            fontWeight: 600,
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
            background: isDark ? "#1f2937" : "#ffffff",
            color: isDark ? "#f9fafb" : "#111827",
          }}
        >
          <span style={{ color: "#f59e0b", fontSize: "16px" }}>★</span>
          <span style={{ fontWeight: 700 }}>{location?.rating || 4.9}</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span style={{ opacity: 0.7, fontWeight: 400 }}>on Google</span>
        </span>
      </div>
    );
  }

  const topReviews = sortedReviews.slice(0, 5);

  return (
    <div
      style={{
        fontFamily: `'${fontFamily}', sans-serif`,
        maxWidth: "600px",
        margin: "0 auto",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
        background: isDark ? "#111827" : "#ffffff",
        color: isDark ? "#f3f4f6" : "#111827",
      }}
    >
      {/* Header */}
      <div style={{ padding: "20px", borderBottom: `1px solid ${isDark ? "#374151" : "#e5e7eb"}` }}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 600 }}>
          {location?.name || "Business Name"}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", opacity: 0.7 }}>
          <span style={{ color: "#f59e0b", letterSpacing: "2px" }}>{createStars(location?.rating || 4.8)}</span>
          <span>{location?.rating || 4.8} · {location?.total_reviews || 127} reviews</span>
        </div>
      </div>

      {config.widget_type === "list" ? (
        /* List */
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {topReviews.length > 0 ? topReviews.map((review, i) => (
            <div key={i} style={{ padding: "16px 20px", borderBottom: `1px solid ${isDark ? "#374151" : "#e5e7eb"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontWeight: 600, fontSize: "14px" }}>{review.author}</span>
                <span style={{ color: "#f59e0b", fontSize: "12px", letterSpacing: "1px" }}>{createStars(review.rating)}</span>
              </div>
              <div style={{ fontSize: "14px", lineHeight: 1.6, opacity: 0.85 }}>{review.text}</div>
              {review.publishedAt && (
                <div style={{ fontSize: "12px", opacity: 0.5, marginTop: "4px" }}>
                  {new Date(review.publishedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )) : (
            <div style={{ padding: "40px", textAlign: "center", opacity: 0.5, fontSize: "14px" }}>
              No reviews yet
            </div>
          )}
        </div>
      ) : (
        /* Carousel */
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)" }}>
            {topReviews.length > 0 ? topReviews.map((review, i) => (
              <div key={i} style={{ minWidth: "100%", padding: "32px 24px" }}>
                <div style={{ fontSize: "16px", lineHeight: 1.7, fontStyle: "italic", marginBottom: "20px", opacity: 0.9 }}>
                  &ldquo;{review.text}&rdquo;
                </div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{review.author}</div>
                <div style={{ fontSize: "12px", opacity: 0.5, marginTop: "2px" }}>
                  {review.publishedAt ? new Date(review.publishedAt).toLocaleDateString() : ""}
                </div>
                <div style={{ marginTop: "8px", color: "#f59e0b", fontSize: "12px", letterSpacing: "1px" }}>
                  {createStars(review.rating)}
                </div>
              </div>
            )) : (
              <div style={{ padding: "40px", textAlign: "center", opacity: 0.5, fontSize: "14px" }}>
                No reviews yet
              </div>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", padding: "16px", borderTop: `1px solid ${isDark ? "#374151" : "#e5e7eb"}` }}>
            <span style={{ fontSize: "12px", opacity: 0.5 }}>{sortedReviews.length} reviews</span>
          </div>
        </div>
      )}

      {/* Footer */}
      {!config.hide_watermark && (
        <div style={{ padding: "12px 20px", textAlign: "center", fontSize: "12px", opacity: 0.5, borderTop: `1px solid ${isDark ? "#374151" : "#e5e7eb"}` }}>
          Powered by <span style={{ fontWeight: 500 }}>StarPress</span>
        </div>
      )}
    </div>
  );
}

export default function WidgetConfigPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [config, setConfig] = useState<WidgetConfig>({
    location_id: "",
    theme: "light",
    primary_color: "#3b82f6",
    font_family: "Inter",
    hide_watermark: false,
    widget_type: "list",
    sort_by: "best",
  });
  const [planTier, setPlanTier] = useState("free");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_tier")
        .eq("id", user.id)
        .single();

      setPlanTier(profile?.plan_tier || "free");

      const { data: locs } = await supabase
        .from("locations")
        .select("id, name, address, rating, total_reviews")
        .eq("profile_id", user.id);

      setLocations(locs || []);

      if (locs && locs.length > 0) {
        setSelectedLocationId(locs[0].id);
        setSelectedLocation(locs[0]);
      }
    };

    fetchData();
  }, [router, supabase]);

  useEffect(() => {
    if (!selectedLocationId) return;

    const fetchConfig = async () => {
      const { data } = await supabase
        .from("widget_configs")
        .select("*")
        .eq("location_id", selectedLocationId)
        .single();

      if (data) {
        setConfig(data);
      }
    };

    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews_cache")
        .select("raw_reviews")
        .eq("location_id", selectedLocationId)
        .single();

      if (data?.raw_reviews) {
        setReviews(data.raw_reviews.slice(0, 5));
      }
    };

    const loc = locations.find((l) => l.id === selectedLocationId);
    if (loc) setSelectedLocation(loc);

    fetchConfig();
    fetchReviews();
  }, [selectedLocationId, supabase, locations]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from("widget_configs")
      .update({
        theme: config.theme,
        primary_color: config.primary_color,
        font_family: config.font_family,
        hide_watermark: config.hide_watermark,
        widget_type: config.widget_type,
        sort_by: config.sort_by,
      })
      .eq("location_id", selectedLocationId);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  };

  const embedCode = selectedLocationId
    ? `<script src="${process.env.NEXT_PUBLIC_APP_URL}/embed.js" data-location-id="${selectedLocationId}" data-widget-type="${config.widget_type}"></script>`
    : "";

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#171417] antialiased">
      <header className="border-b border-[#f0e9e1] bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#0c1754]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0c1754] text-white font-bold text-xs">
              ★
            </span>
            <span>Star<span className="text-[#2545ff]">Press</span></span>
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-[#f0e9e1] bg-white px-4 py-2 text-xs font-semibold text-[#0c1754] hover:bg-[#f9f8f6] transition shadow-xs"
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="font-editorial text-3xl font-normal text-[#0c1754]">
          Configuración y Personalización de Widgets
        </h1>
        <p className="mt-1 mb-8 text-sm text-[#969696]">
          Personalizá cómo se verán tus reseñas en tu sitio web. Los cambios se actualizan en vivo en la vista previa.
        </p>

        {locations.length === 0 ? (
          <div className="rounded-[20px] border border-[#f0e9e1] bg-white p-12 text-center shadow-xs">
            <p className="text-sm text-[#969696]">
              No se encontraron negocios.{" "}
              <Link href="/onboarding" className="text-[#2545ff] font-semibold hover:underline">
                Conectar mi primer negocio
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Config Panel */}
            <div className="space-y-6 lg:col-span-2">
              {/* Location Selector */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Business
                </label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </label>
                <div className="flex gap-3">
                  {["light", "dark"].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setConfig({ ...config, theme })}
                      className={`flex-1 rounded-lg border-2 p-4 text-sm font-medium transition-colors ${
                        config.theme === theme
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      {theme === "light" ? "☀️ Light" : "🌙 Dark"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Widget Type */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Widget Style
                </label>
                <div className="flex gap-3">
                  {[
                    { id: "list", label: "List", desc: "Classic list of reviews", free: true },
                    { id: "carousel", label: "Carousel", desc: "Sliding cards", free: false },
                    { id: "badge", label: "Badge", desc: "Compact rating badge", free: true },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setConfig({ ...config, widget_type: type.id })}
                      className={`flex-1 rounded-lg border-2 p-4 text-left transition-colors ${
                        config.widget_type === type.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      <span className={`block text-sm font-medium ${config.widget_type === type.id ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
                        {type.id === "list" ? "📋" : type.id === "carousel" ? "🎠" : "⭐"} {type.label}
                        {!type.free && planTier === "free" && (
                          <span className="ml-1 text-xs text-gray-400">(Pro)</span>
                        )}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {type.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort Reviews By
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "best", label: "🏆 Best", desc: "Smart mix of quality factors" },
                    { id: "recent", label: "🕐 Recent", desc: "Newest first" },
                    { id: "most_liked", label: "❤️ Most Liked", desc: "Community favorites" },
                    { id: "highest", label: "⬆️ Highest", desc: "5 stars first" },
                    { id: "lowest", label: "⬇️ Lowest", desc: "Show critical reviews" },
                  ].map((sort) => (
                    <button
                      key={sort.id}
                      onClick={() => setConfig({ ...config, sort_by: sort.id })}
                      className={`rounded-lg border-2 p-3 text-left transition-colors ${
                        config.sort_by === sort.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      <span className={`block text-xs font-medium ${config.sort_by === sort.id ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
                        {sort.label}
                      </span>
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {sort.desc}
                      </span>
                    </button>
                  ))}
                </div>
                {config.widget_type === "carousel" && (
                  <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                    Carousel automatically mixes positive and negative reviews to show you respond to feedback.
                  </p>
                )}
              </div>

              {/* Primary Color */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Primary Color
                  {planTier === "free" && (
                    <span className="ml-2 text-xs text-gray-400">(Pro feature)</span>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.primary_color}
                    onChange={(e) =>
                      setConfig({ ...config, primary_color: e.target.value })
                    }
                    disabled={planTier === "free"}
                    className="h-10 w-10 rounded-lg border border-gray-300 disabled:opacity-50 dark:border-gray-700"
                  />
                  <input
                    type="text"
                    value={config.primary_color}
                    onChange={(e) =>
                      setConfig({ ...config, primary_color: e.target.value })
                    }
                    disabled={planTier === "free"}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Font */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Font Family
                  {planTier === "free" && (
                    <span className="ml-2 text-xs text-gray-400">(Pro feature)</span>
                  )}
                </label>
                <select
                  value={config.font_family}
                  onChange={(e) =>
                    setConfig({ ...config, font_family: e.target.value })
                  }
                  disabled={planTier === "free"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              {/* Watermark */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={config.hide_watermark}
                    onChange={(e) =>
                      setConfig({ ...config, hide_watermark: e.target.checked })
                    }
                    disabled={planTier === "free"}
                    className="h-4 w-4 rounded border-gray-300 disabled:opacity-50"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hide &quot;Powered by StarPress&quot; watermark
                    </span>
                    {planTier === "free" && (
                      <span className="ml-2 text-xs text-gray-400">(Pro feature)</span>
                    )}
                  </div>
                </label>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : saved ? "Saved!" : "Save Configuration"}
              </button>

              {/* Embed Code */}
              {embedCode && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Embed Code
                  </h3>
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                    Copy and paste this code into your website&apos;s HTML where you
                    want the reviews widget to appear.
                  </p>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {embedCode}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(embedCode);
                        setSaved(true);
                        setTimeout(() => setSaved(false), 2000);
                      }}
                      className="absolute right-2 top-2 rounded bg-white px-2 py-1 text-xs font-medium text-gray-600 shadow hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-3">
              <div className="sticky top-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Live Preview
                  </h2>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    Real-time
                  </span>
                </div>

                {/* Website mockup */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  {/* Browser chrome */}
                  <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="ml-3 flex-1 rounded-md bg-white px-3 py-1.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                      yourwebsite.com
                    </div>
                  </div>

                  {/* Preview area */}
                  <div
                    ref={previewRef}
                    className="p-6"
                    style={{
                      background: config.theme === "dark"
                        ? "linear-gradient(to bottom, #1a1a2e, #16213e)"
                        : "linear-gradient(to bottom, #f8fafc, #f1f5f9)",
                      minHeight: config.widget_type === "badge" ? "120px" : "400px",
                    }}
                  >
                    <WidgetPreview
                      config={config}
                      location={selectedLocation}
                      reviews={reviews}
                    />
                  </div>
                </div>

                {/* Preview info */}
                <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                  This is how your widget will look on your website.
                  {config.widget_type === "badge" && " The badge is compact and fits in any header."}
                  {config.widget_type === "carousel" && " The carousel auto-rotates every 5 seconds."}
                  {config.widget_type === "list" && " Shows top reviews sorted by rating."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
