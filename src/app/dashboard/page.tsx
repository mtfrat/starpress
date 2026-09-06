"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ReviewCard from "@/components/ReviewCard";
import OverviewTab from "@/components/dashboard/OverviewTab";
import ReviewsTab from "@/components/dashboard/ReviewsTab";
import WidgetsTab from "@/components/dashboard/WidgetsTab";
import GatingQRTab from "@/components/dashboard/GatingQRTab";
import ReportsTab from "@/components/dashboard/ReportsTab";
import { Location, Review, Analysis, FeedbackItem, GbpReview, DisputeResult } from "@/types/dashboard";

type ActiveTab = "overview" | "reviews" | "widgets" | "qr" | "reports";

function DashboardContent() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [planTier, setPlanTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  // Feature states
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [cardReview, setCardReview] = useState<Review | null>(null);
  const [respondingIdx, setRespondingIdx] = useState<number | null>(null);
  const [aiResponses, setAiResponses] = useState<Record<number, string>>({});
  const [copiedResponse, setCopiedResponse] = useState<number | null>(null);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<Record<string, unknown> | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [gbpConnected, setGbpConnected] = useState(false);
  const [gbpReviews, setGbpReviews] = useState<GbpReview[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [publishingReply, setPublishingReply] = useState(false);
  const [disputingIdx, setDisputingIdx] = useState<number | null>(null);
  const [disputeResults, setDisputeResults] = useState<Record<number, DisputeResult>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
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

      // Get plan
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan_tier")
        .eq("id", user.id)
        .single();

      setPlanTier(profile?.plan_tier || "free");

      // Get locations
      const { data: locs } = await supabase
        .from("locations")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      setLocations((locs as Location[]) || []);
      setLoading(false);

      // Auto-select from URL or first location
      const urlLocation = searchParams.get("location");
      if (urlLocation) {
        setSelectedId(urlLocation);
      } else if (locs && locs.length > 0) {
        setSelectedId(locs[0].id);
      } else {
        router.push("/onboarding");
      }
    };

    fetchData();
  }, [searchParams, router, supabase]);

  useEffect(() => {
    if (!selectedId) return;

    const fetchLocationData = async () => {
      const { data: cache } = await supabase
        .from("reviews_cache")
        .select("raw_reviews, llm_analysis")
        .eq("location_id", selectedId)
        .single();

      if (cache) {
        setReviews((cache.raw_reviews as Review[]) || []);
        setAnalysis(cache.llm_analysis as Analysis | null);
      }
    };

    fetchLocationData();
  }, [selectedId, supabase]);

  // Fetch feedback
  useEffect(() => {
    if (!selectedId || planTier !== "pro") return;

    const fetchFeedback = async () => {
      try {
        const res = await fetch(`/api/feedback?location_id=${selectedId}`);
        if (res.ok) {
          const data = await res.json();
          setFeedbackList(data);
        }
      } catch {
        // Silent fail
      }
    };

    fetchFeedback();
  }, [selectedId, planTier]);

  // Check GBP connection and fetch reviews
  useEffect(() => {
    if (planTier !== "pro") return;

    const fetchGbp = async () => {
      try {
        const res = await fetch("/api/gbp/reviews?location_id=current");
        if (res.ok) {
          const data = await res.json();
          setGbpConnected(true);
          setGbpReviews(data.reviews || []);
        } else {
          setGbpConnected(false);
        }
      } catch {
        setGbpConnected(false);
      }
    };

    fetchGbp();
  }, [planTier]);

  const handleAnalyze = async () => {
    if (!selectedId) return;
    setAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location_id: selectedId }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch {
      // Handled
    }

    setAnalyzing(false);
  };

  const handleRespond = async (review: Review, idx: number) => {
    if (!selectedId) return;
    setRespondingIdx(idx);

    try {
      const response = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_text: review.text,
          review_author: review.author,
          review_rating: review.rating,
          location_id: selectedId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiResponses((prev) => ({ ...prev, [idx]: data.reply }));
      } else {
        const err = await response.json();
        setAiResponses((prev) => ({
          ...prev,
          [idx]: `Error: ${err.error}`,
        }));
      }
    } catch {
      // Handled
    }

    setRespondingIdx(null);
  };

  const handleDispute = async (review: Review, idx: number) => {
    if (!selectedId) return;
    setDisputingIdx(idx);

    try {
      const response = await fetch("/api/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_text: review.text,
          review_author: review.author,
          review_rating: review.rating,
          location_id: selectedId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDisputeResults((prev) => ({ ...prev, [idx]: data }));
      }
    } catch {
      // Handled
    }

    setDisputingIdx(null);
  };

  const handleGenerateReport = async () => {
    if (!selectedId) return;
    setGeneratingReport(true);

    try {
      const response = await fetch("/api/alerts?type=report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location_id: selectedId }),
      });

      if (response.ok) {
        const data = await response.json();
        setWeeklyReport(data.report);
      }
    } catch {
      // Handled
    }

    setGeneratingReport(false);
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await fetch("/api/gbp/auth");
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // Handled
    }
  };

  const handlePublishReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setPublishingReply(true);

    try {
      const res = await fetch("/api/gbp/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: "current",
          review_id: reviewId,
          comment: replyText,
        }),
      });

      if (res.ok) {
        setGbpReviews((prev) =>
          prev.map((r) =>
            r.reviewId === reviewId ? { ...r, reply: { comment: replyText } } : r
          )
        );
        setReplyingTo(null);
        setReplyText("");
      }
    } catch {
      // Handled
    }

    setPublishingReply(false);
  };

  const handleRefreshReviews = async () => {
    if (!selectedId) return;
    setRefreshing(true);

    try {
      if (gbpConnected) {
        const response = await fetch("/api/gbp/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location_id: selectedId }),
        });

        if (response.ok) {
          const { data: cache } = await supabase
            .from("reviews_cache")
            .select("raw_reviews")
            .eq("location_id", selectedId)
            .single();

          if (cache?.raw_reviews) {
            setReviews(cache.raw_reviews);
          }
        }
      } else {
        const response = await fetch("/api/locations/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ location_id: selectedId }),
        });

        if (response.ok) {
          const { data: cache } = await supabase
            .from("reviews_cache")
            .select("raw_reviews")
            .eq("location_id", selectedId)
            .single();

          if (cache?.raw_reviews) {
            setReviews(cache.raw_reviews);
          }
        }
      }
    } catch {
      // Handled
    }

    setRefreshing(false);
  };

  const handleDeleteLocation = async () => {
    if (!selectedId) return;

    try {
      const response = await fetch(
        `/api/locations?location_id=${selectedId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setLocations((prev) => prev.filter((l) => l.id !== selectedId));
        setSelectedId(null);
        setReviews([]);
        setAnalysis(null);
        setShowDeleteConfirm(false);

        if (locations.length <= 1) {
          router.push("/onboarding");
        }
      }
    } catch {
      // Handled
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const selectedLocation = locations.find((l) => l.id === selectedId);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs font-medium text-slate-500">Cargando tu panel de StarPress...</p>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: ActiveTab; label: string; icon: string; count?: number }> = [
    { id: "overview", label: "Métricas & Resumen", icon: "📊" },
    { id: "reviews", label: "Reseñas & IA", icon: "💬", count: reviews.length },
    { id: "widgets", label: "Widgets Web", icon: "⭐" },
    { id: "qr", label: "Kit QR & Feedback", icon: "📱", count: feedbackList.length > 0 ? feedbackList.length : undefined },
    { id: "reports", label: "Reportes & GBP", icon: "🤖" },
  ];

  return (
    <div className="min-h-screen bg-[#f9f8f6] text-[#171417] antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-[#f0e9e1] bg-[#f9f8f6]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#0c1754]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0c1754] text-white font-bold text-sm shadow-sm">
                ★
              </span>
              <span>Star<span className="text-[#2545ff]">Press</span></span>
            </Link>

            {/* Business Selector dropdown for multiple locations */}
            {locations.length > 1 && (
              <select
                value={selectedId || ""}
                onChange={(e) => setSelectedId(e.target.value)}
                className="hidden sm:block h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} (⭐ {l.rating})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
              planTier === "pro"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}>
              Plan {planTier}
            </span>

            {planTier === "pro" ? (
              <button
                onClick={async () => {
                  const res = await fetch("/api/stripe/portal", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                className="hidden sm:inline-flex text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Facturación
              </button>
            ) : (
              <Link
                href="/pricing"
                className="inline-flex h-8 items-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-500"
              >
                Pasar a Pro
              </Link>
            )}

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/auth/login");
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Sidebar / Businesses List */}
          <aside className="lg:col-span-3">
            <div className="rounded-2xl border border-[#f0e9e1] bg-white p-4 shadow-xs sticky top-24">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[#969696]">
                  Tus Negocios
                </h2>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-1 rounded-full bg-[#eaebf8] px-3 py-1 text-xs font-semibold text-[#0c1754] hover:bg-[#dcdff7] transition"
                >
                  + Agregar
                </Link>
              </div>

              <div className="space-y-1.5">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedId(loc.id)}
                    className={`w-full rounded-xl p-3 text-left transition cursor-pointer ${
                      selectedId === loc.id
                        ? "bg-[#eaebf8] border border-[#2545ff]/20 shadow-xs"
                        : "hover:bg-[#f9f8f6] border border-transparent"
                    }`}
                  >
                    <p className="text-sm font-bold text-[#0c1754] truncate">
                      {loc.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-[#969696]">
                      <span className="text-[#2545ff] font-semibold">★ {loc.rating.toFixed(1)}</span>
                      <span>·</span>
                      <span>{loc.total_reviews} opiniones</span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedLocation && (
                <div className="mt-4 pt-4 border-t border-[#f0e9e1]">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full text-left text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 p-1.5 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar negocio
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Right Main Panel with Tabs */}
          <div className="lg:col-span-9 space-y-6">
            {selectedLocation ? (
              <>
                {/* Clean Tab Navigation Bar — Officevibe Pill Tabs */}
                <div className="flex border border-[#f0e9e1] bg-white p-1.5 rounded-2xl shadow-xs overflow-x-auto scrollbar-none gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[#0c1754] text-white shadow-xs"
                          : "text-[#222222] hover:text-[#0c1754] hover:bg-[#f9f8f6]"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className={`ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          activeTab === tab.id
                            ? "bg-[#2545ff] text-white"
                            : "bg-[#eaebf8] text-[#0c1754]"
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content Display */}
                {activeTab === "overview" && (
                  <OverviewTab
                    location={selectedLocation}
                    reviews={reviews}
                    planTier={planTier}
                    onNavigateToTab={(t) => setActiveTab(t as ActiveTab)}
                    onRefreshReviews={handleRefreshReviews}
                    refreshing={refreshing}
                    gbpConnected={gbpConnected}
                  />
                )}

                {activeTab === "reviews" && (
                  <ReviewsTab
                    reviews={reviews}
                    planTier={planTier}
                    respondingIdx={respondingIdx}
                    aiResponses={aiResponses}
                    copiedResponse={copiedResponse}
                    disputingIdx={disputingIdx}
                    disputeResults={disputeResults}
                    onRespond={handleRespond}
                    onDispute={handleDispute}
                    onCreateCard={(r) => setCardReview(r)}
                    onCopyResponse={(text, idx) => {
                      navigator.clipboard.writeText(text);
                      setCopiedResponse(idx);
                      setTimeout(() => setCopiedResponse(null), 2000);
                    }}
                  />
                )}

                {activeTab === "widgets" && (
                  <WidgetsTab location={selectedLocation} />
                )}

                {activeTab === "qr" && (
                  <GatingQRTab
                    location={selectedLocation}
                    feedbackList={feedbackList}
                    planTier={planTier}
                  />
                )}

                {activeTab === "reports" && (
                  <ReportsTab
                    planTier={planTier}
                    analysis={analysis}
                    analyzing={analyzing}
                    onAnalyze={handleAnalyze}
                    weeklyReport={weeklyReport}
                    generatingReport={generatingReport}
                    onGenerateReport={handleGenerateReport}
                    gbpConnected={gbpConnected}
                    gbpReviews={gbpReviews}
                    onConnectGoogle={handleConnectGoogle}
                    onPublishReply={handlePublishReply}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    publishingReply={publishingReply}
                    copiedField={copiedField}
                    onCopyText={copyToClipboard}
                  />
                )}
              </>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm text-slate-500">No tenés negocios activos seleccionados.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Social Card Preview Modal */}
      {cardReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c1754]/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[20px] bg-white p-6 sm:p-7 shadow-[0_20px_60px_rgba(12,23,84,0.25)] border border-[#f0e9e1]">
            <div className="mb-5 flex items-center justify-between border-b border-[#f0e9e1] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2545ff]">
                  Diseño & Publicación
                </span>
                <h3 className="font-editorial text-xl font-normal text-[#0c1754]">
                  Tarjeta Editorial para Redes Sociales
                </h3>
              </div>
              <button
                onClick={() => setCardReview(null)}
                className="rounded-full p-2 text-[#969696] hover:bg-[#f9f8f6] hover:text-[#0c1754] transition cursor-pointer"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ReviewCard
              review={cardReview}
              businessName={selectedLocation?.name || "Mi Negocio"}
            />
          </div>
        </div>
      )}

      {/* Delete Business Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Eliminar Ubicación
                </h3>
                <p className="text-xs text-slate-500">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              ¿Estás seguro de eliminar <strong>{selectedLocation?.name}</strong>? Se borrarán sus reseñas y configuraciones de widgets asociadas.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteLocation}
                className="flex-1 h-11 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500 shadow-sm shadow-red-500/20"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
