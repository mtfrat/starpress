"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function FeedbackPage() {
  const params = useParams();
  const locationId = params.locationId as string;
  const [step, setStep] = useState<"rate" | "positive" | "negative" | "done">("rate");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleUrl, setGoogleUrl] = useState("");
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch(`/api/widget/${locationId}`);
        if (res.ok) {
          const data = await res.json();
          setBusinessName(data.location?.name || "");
          // Build Google Maps review URL
          const placeId = data.location?.place_id || "";
          if (placeId) {
            setGoogleUrl(
              `https://search.google.com/local/writereview?placeid=${placeId}`
            );
          }
        }
      } catch {
        // Silent fail
      }
    };
    fetchLocation();
  }, [locationId]);

  const handleRate = (stars: number) => {
    setRating(stars);
    if (stars >= 4) {
      setStep("positive");
    } else {
      setStep("negative");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: locationId,
          rating,
          comment,
          contact,
        }),
      });
    } catch {
      // Silent fail
    }
    setSubmitting(false);
    setStep("done");
  };

  const redirectToGoogle = () => {
    if (googleUrl) {
      window.open(googleUrl, "_blank");
    } else {
      // Fallback: search for the business
      window.open(
        `https://search.google.com/local/writereview`,
        "_blank"
      );
    }
  };

  // Step 1: Rating
  if (step === "rate") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 text-5xl">⭐</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            How was your experience?
          </h1>
          <p className="mb-2 text-gray-600">
            {businessName ? `at ${businessName}` : "at our business"}
          </p>
          <p className="mb-8 text-sm text-gray-400">
            Your feedback helps us improve our service.
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => handleRate(star)}
                className="text-5xl transition-transform hover:scale-110"
                style={{
                  color: star <= (hoveredStar || rating) ? "#f59e0b" : "#d1d5db",
                }}
              >
                ★
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Tap a star to rate
          </p>
        </div>
      </div>
    );
  }

  // Step 2a: Positive (redirect to Google)
  if (step === "positive") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 text-5xl">😊</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Thank you!
          </h1>
          <p className="mb-4 text-gray-600">
            We&apos;re glad you had a great experience! Would you mind sharing
            your review on Google? It helps us a lot.
          </p>
          <p className="mb-6 text-sm text-gray-400">
            {"⭐".repeat(rating)}
          </p>
          <button
            onClick={redirectToGoogle}
            className="mb-4 w-full rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-500 transition-colors"
          >
            Write Review on Google
          </button>
          <button
            onClick={() => setStep("done")}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            Skip, thanks
          </button>
        </div>
      </div>
    );
  }

  // Step 2b: Negative (internal feedback)
  if (step === "negative") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center text-5xl">🙏</div>
          <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
            We&apos;re sorry to hear that
          </h1>
          <p className="mb-6 text-center text-gray-600">
            Your feedback is important to us. Please tell us what happened so
            we can make it right.
          </p>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                What went wrong? (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="Tell us about your experience..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Your email or phone (optional)
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                placeholder="So we can follow up with you"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-lg bg-orange-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-orange-500 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Sending..." : "Send Feedback"}
            </button>
            <button
              onClick={() => setStep("done")}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              Skip, thanks
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Done
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 text-5xl">💚</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Thank you for your feedback!
        </h1>
        <p className="text-gray-600">
          We appreciate you taking the time to help us improve.
        </p>
      </div>
    </div>
  );
}
