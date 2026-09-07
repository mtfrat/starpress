"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Step = 1 | 2 | 3 | 4;

interface OnboardingState {
  step: Step;
  plan: "free" | "pro";
  locationUrl: string;
  widgetType: "list" | "carousel" | "badge";
  widgetColor: string;
  completed: boolean;
}

const STORAGE_KEY = "starpress-onboarding";

function getInitialState(): OnboardingState {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as OnboardingState;
        if (parsed.completed) return { ...parsed, step: 4 };
        return parsed;
      } catch {
        // ignore
      }
    }
  }
  return {
    step: 1,
    plan: "free",
    locationUrl: "",
    widgetType: "list",
    widgetColor: "#2545ff",
    completed: false,
  };
}

function ProgressIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { num: 1, label: "Plan" },
    { num: 2, label: "Location" },
    { num: 3, label: "Widget" },
    { num: 4, label: "Embed" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition ${
                currentStep >= s.num
                  ? "bg-[#2545ff] text-white"
                  : "bg-[#f0e9e1] text-[#969696]"
              }`}
            >
              {currentStep > s.num ? "✓" : s.num}
            </div>
            <span className="mt-1 text-[10px] font-semibold text-[#969696]">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`mx-2 mb-5 h-0.5 w-8 rounded-full ${
                currentStep > s.num ? "bg-[#2545ff]" : "bg-[#f0e9e1]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Step1Plan({
  state,
  onNext,
}: {
  state: OnboardingState;
  onNext: (plan: "free" | "pro") => void;
}) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="font-editorial text-2xl font-normal text-[#0c1754]">Choose Your Plan</h2>
        <p className="mt-1 text-xs text-[#969696]">Start free, upgrade anytime.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNext("free")}
          className={`rounded-2xl border-2 p-6 text-left transition cursor-pointer ${
            state.plan === "free"
              ? "border-[#2545ff] bg-[#eaebf8]/50"
              : "border-[#f0e9e1] bg-white hover:border-[#2545ff]/50"
          }`}
        >
          <p className="text-xs font-bold text-[#969696] uppercase tracking-wider">Free</p>
          <p className="mt-2 text-2xl font-bold text-[#0c1754]">$0</p>
          <p className="mt-1 text-xs text-[#969696]">/month</p>
          <ul className="mt-4 space-y-2 text-xs text-[#222222]">
            <li className="flex items-center gap-2"><span className="text-[#2545ff]">✓</span> 1 location</li>
            <li className="flex items-center gap-2"><span className="text-[#2545ff]">✓</span> Basic widget</li>
            <li className="flex items-center gap-2"><span className="text-[#2545ff]">✓</span> Up to 50 reviews</li>
          </ul>
        </button>

        <button
          onClick={() => onNext("pro")}
          className={`rounded-2xl border-2 p-6 text-left transition cursor-pointer relative ${
            state.plan === "pro"
              ? "border-[#2545ff] bg-[#eaebf8]/50"
              : "border-[#f0e9e1] bg-white hover:border-[#2545ff]/50"
          }`}
        >
          <span className="absolute -top-2.5 right-4 rounded-full bg-[#2545ff] px-2.5 py-0.5 text-[10px] font-bold text-white">
            POPULAR
          </span>
          <p className="text-xs font-bold text-[#969696] uppercase tracking-wider">Pro</p>
          <p className="mt-2 text-2xl font-bold text-[#0c1754]">$19</p>
          <p className="mt-1 text-xs text-[#969696]">/month</p>
          <ul className="mt-4 space-y-2 text-xs text-[#222222]">
            <li className="flex items-center gap-2"><span className="text-[#2545ff]">✓</span> Unlimited locations</li>
            <li className="flex items-center gap-2"><span className="text-[#2545ff]">✓</span> All widget types</li>
            <li className="flex items-center gap-2"><span className="text-[#2545ff]">✓</span> AI analysis & reports</li>
          </ul>
        </button>
      </div>
    </div>
  );
}

function Step2Location({
  state,
  onNext,
  onBack,
}: {
  state: OnboardingState;
  onNext: (url: string) => void;
  onBack: () => void;
}) {
  const [url, setUrl] = useState(state.locationUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const query = url.match(/place_id=([a-zA-Z0-9_-]+)/)?.[1] || url.trim();
    if (!query || query.length < 3) {
      setError("Please enter a valid Google Maps URL or business name.");
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
        setError(data.error || "Error importing business.");
        setLoading(false);
        return;
      }

      onNext(url);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="font-editorial text-2xl font-normal text-[#0c1754]">Add Your Location</h2>
        <p className="mt-1 text-xs text-[#969696]">Paste your Google Maps link or enter your business name.</p>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaebf8] text-[#2545ff]">
            <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="mt-3 text-sm text-[#0c1754] font-medium">Importing your reviews...</p>
          <p className="mt-1 text-xs text-[#969696]">This may take 15-20 seconds.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full h-12 rounded-xl border border-[#f0e9e1] bg-[#f9f8f6] px-4 text-sm text-[#171417] placeholder:text-[#969696] focus:border-[#2545ff] focus:bg-white focus:outline-none"
            placeholder="https://maps.app.goo.gl/... or Business Name, City"
          />
          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="h-12 rounded-full border border-[#f0e9e1] px-6 text-sm font-semibold text-[#0c1754] hover:bg-[#f9f8f6] transition cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="flex-1 h-12 rounded-full bg-[#2545ff] px-6 text-sm font-semibold text-white hover:bg-[#1a38e8] disabled:opacity-50 transition cursor-pointer"
            >
              Import Reviews →
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Step3Widget({
  state,
  onNext,
  onBack,
}: {
  state: OnboardingState;
  onNext: (type: "list" | "carousel" | "badge", color: string) => void;
  onBack: () => void;
}) {
  const [widgetType, setWidgetType] = useState<"list" | "carousel" | "badge">(state.widgetType);
  const [widgetColor, setWidgetColor] = useState(state.widgetColor);

  const widgetTypes = [
    { type: "list" as const, label: "Review List", desc: "Vertical list of reviews" },
    { type: "carousel" as const, label: "Carousel", desc: "Horizontal scrolling cards" },
    { type: "badge" as const, label: "Rating Badge", desc: "Compact star rating badge" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="font-editorial text-2xl font-normal text-[#0c1754]">Customize Widget</h2>
        <p className="mt-1 text-xs text-[#969696]">Choose a type and color for your widget.</p>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696] mb-3">
          Widget Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {widgetTypes.map((w) => (
            <button
              key={w.type}
              onClick={() => setWidgetType(w.type)}
              className={`rounded-xl border-2 p-4 text-center transition cursor-pointer ${
                widgetType === w.type
                  ? "border-[#2545ff] bg-[#eaebf8]/50"
                  : "border-[#f0e9e1] bg-white hover:border-[#2545ff]/50"
              }`}
            >
              <p className="text-sm font-bold text-[#0c1754]">{w.label}</p>
              <p className="mt-1 text-[10px] text-[#969696]">{w.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696] mb-3">
          Accent Color
        </label>
        <div className="flex gap-3">
          {["#2545ff", "#0c1754", "#10b981", "#f59e0b", "#ef4444"].map((c) => (
            <button
              key={c}
              onClick={() => setWidgetColor(c)}
              className={`h-8 w-8 rounded-full transition cursor-pointer ${
                widgetColor === c ? "ring-2 ring-offset-2 ring-[#2545ff]" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696] mb-3">
          Preview
        </label>
        <div className="rounded-xl border border-[#f0e9e1] bg-white p-4">
          {widgetType === "list" && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#f0e9e1]" />
                  <div className="flex-1">
                    <div className="flex gap-0.5 mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="text-xs" style={{ color: s <= 4 ? widgetColor : "#e5e7eb" }}>★</span>
                      ))}
                    </div>
                    <div className="h-2 w-3/4 rounded bg-[#f0e9e1]" />
                    <div className="mt-1 h-2 w-1/2 rounded bg-[#f0e9e1]" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {widgetType === "carousel" && (
            <div className="flex gap-3 overflow-hidden">
              {[1, 2].map((i) => (
                <div key={i} className="min-w-[140px] rounded-lg border border-[#f0e9e1] p-3">
                  <div className="flex gap-0.5 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-xs" style={{ color: s <= 5 ? widgetColor : "#e5e7eb" }}>★</span>
                    ))}
                  </div>
                  <div className="h-2 w-full rounded bg-[#f0e9e1]" />
                  <div className="mt-1 h-2 w-2/3 rounded bg-[#f0e9e1]" />
                </div>
              ))}
            </div>
          )}
          {widgetType === "badge" && (
            <div className="flex items-center gap-3">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-lg" style={{ color: widgetColor }}>★</span>
                ))}
              </div>
              <span className="text-sm font-bold text-[#0c1754]">4.8</span>
              <span className="text-xs text-[#969696]">(127 reviews)</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-12 rounded-full border border-[#f0e9e1] px-6 text-sm font-semibold text-[#0c1754] hover:bg-[#f9f8f6] transition cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={() => onNext(widgetType, widgetColor)}
          className="flex-1 h-12 rounded-full bg-[#2545ff] px-6 text-sm font-semibold text-white hover:bg-[#1a38e8] transition cursor-pointer"
        >
          Save Widget →
        </button>
      </div>
    </div>
  );
}

function Step4Embed({
  state,
  onComplete,
}: {
  state: OnboardingState;
  onComplete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script src="https://starpress.app/widget.js" data-type="${state.widgetType}" data-color="${state.widgetColor}"></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="font-editorial text-2xl font-normal text-[#0c1754]">Copy Embed Code</h2>
        <p className="mt-1 text-xs text-[#969696]">Paste this code into your website.</p>
      </div>

      <div>
        <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[#969696] mb-2">
          Your Embed Code
        </label>
        <div className="relative">
          <pre className="rounded-xl border border-[#f0e9e1] bg-[#0c1754] p-4 text-xs text-white overflow-x-auto">
            {embedCode}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 rounded-lg bg-[#2545ff] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-[#1a38e8] transition cursor-pointer"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-[#f0e9e1] bg-white p-4">
        <p className="text-xs font-bold text-[#0c1754] mb-2">Where to paste it:</p>
        <ul className="space-y-1.5 text-xs text-[#969696]">
          <li><strong>WordPress:</strong> Paste in Custom HTML block or theme footer</li>
          <li><strong>Shopify:</strong> Settings → Themes → Edit code → theme.liquid</li>
          <li><strong>HTML:</strong> Before the closing &lt;/body&gt; tag</li>
        </ul>
      </div>

      <button
        onClick={onComplete}
        className="w-full h-12 rounded-full bg-[#2545ff] px-6 text-sm font-semibold text-white hover:bg-[#1a38e8] transition cursor-pointer"
      >
        Go to Dashboard →
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const [state, setState] = useState<OnboardingState>(getInitialState);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (partial: Partial<OnboardingState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const handleComplete = () => {
    updateState({ completed: true });
    localStorage.removeItem(STORAGE_KEY);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f9f8f6] px-4 py-12 antialiased">
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
          <ProgressIndicator currentStep={state.step} />

          {state.step === 1 && (
            <Step1Plan
              state={state}
              onNext={(plan) => updateState({ plan, step: 2 })}
            />
          )}

          {state.step === 2 && (
            <Step2Location
              state={state}
              onNext={(url) => updateState({ locationUrl: url, step: 3 })}
              onBack={() => updateState({ step: 1 })}
            />
          )}

          {state.step === 3 && (
            <Step3Widget
              state={state}
              onNext={(type, color) => updateState({ widgetType: type, widgetColor: color, step: 4 })}
              onBack={() => updateState({ step: 2 })}
            />
          )}

          {state.step === 4 && (
            <Step4Embed
              state={state}
              onComplete={handleComplete}
            />
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/dashboard"
            className="text-xs text-[#969696] hover:text-[#0c1754] transition"
          >
            Skip for now →
          </Link>
        </div>
      </div>
    </div>
  );
}
