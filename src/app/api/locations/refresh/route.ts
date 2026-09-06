import { NextResponse } from "next/server";
import { createClient, getServiceClient } from "@/lib/supabase/server";

const FREE_REVIEW_LIMIT = 50;

interface ApifyResult {
  title: string;
  address: string;
  totalScore: number;
  reviewsCount: number;
  placeId: string;
  reviews: Record<string, unknown>[];
}

// Refresh reviews for a location (re-scrape via Apify or GBP)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { location_id } = await request.json();

    if (!location_id) {
      return NextResponse.json(
        { error: "location_id is required" },
        { status: 400 }
      );
    }

    // Check plan tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_tier")
      .eq("id", user.id)
      .single();

    const planTier = profile?.plan_tier || "free";

    // Get location data
    const { data: location, error: locError } = await supabase
      .from("locations")
      .select("*")
      .eq("id", location_id)
      .eq("profile_id", user.id)
      .single();

    if (locError || !location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Check if GBP is connected (Pro users use GBP API - free)
    const { data: tokens } = await supabase
      .from("gbp_tokens")
      .select("account_id, location_id")
      .eq("profile_id", user.id)
      .single();

    if (tokens) {
      // Use GBP API (free, no Apify cost)
      return await refreshFromGBP(supabase, location_id, tokens);
    }

    // Fallback to Apify
    return await refreshFromApify(supabase, location_id, location.google_maps_url, planTier);
  } catch (error) {
    console.error("POST /api/locations/refresh error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function refreshFromGBP(
  supabase: ReturnType<typeof getServiceClient>,
  locationId: string,
  tokens: { account_id: string; location_id: string }
) {
  // This is handled by /api/gbp/sync - redirect logic
  return NextResponse.json({
    use_gbp_sync: true,
    message: "Use /api/gbp/sync for GBP-connected locations",
  });
}

async function refreshFromApify(
  supabase: ReturnType<typeof getServiceClient>,
  locationId: string,
  googleMapsUrl: string,
  planTier: string
) {
  console.log("[Refresh] Starting Apify scrape for:", googleMapsUrl, "(plan:", planTier, ")");

  const isUrl = googleMapsUrl.includes("google.com/maps") ||
    googleMapsUrl.includes("goo.gl/maps") ||
    googleMapsUrl.includes("maps.app.goo.gl");

  // Free: max 50 reviews, Pro: unlimited (use 200 as Apify practical max)
  const maxReviews = planTier === "pro" ? 200 : FREE_REVIEW_LIMIT;

  const apifyInput: Record<string, unknown> = {
    language: "en",
    includeReviews: true,
    reviewsSort: "newest",
    maxReviews,
    scrapePlaceDetailPage: false,
    skipClosedPlaces: true,
    maxCrawledPlacesPerSearch: 1,
  };

  if (isUrl) {
    apifyInput.startUrls = [{ url: googleMapsUrl }];
  } else {
    apifyInput.searchStringsArray = [googleMapsUrl];
  }

  // Run Apify actor
  const apifyResponse = await fetch(
    "https://api.apify.com/v2/acts/compass~crawler-google-places/runs",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
      },
      body: JSON.stringify(apifyInput),
    }
  );

  if (!apifyResponse.ok) {
    console.error("[Refresh] Apify start error:", apifyResponse.status);
    return NextResponse.json(
      { error: "Failed to start scraping" },
      { status: 500 }
    );
  }

  const apifyRun = await apifyResponse.json();
  const runId = apifyRun.data.id;
  console.log("[Refresh] Apify run started:", runId);

  // Poll for completion (max 120 seconds)
  let result: ApifyResult | null = null;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusResponse = await fetch(
      `https://api.apify.com/v2/acts/compass~crawler-google-places/runs/${runId}`,
      {
        headers: { Authorization: `Bearer ${process.env.APIFY_API_TOKEN}` },
      }
    );

    if (!statusResponse.ok) continue;

    const status = await statusResponse.json();
    console.log("[Refresh] Apify status:", status.data.status, `(${i + 1}/60)`);

    if (status.data.status === "SUCCEEDED") {
      const datasetId = status.data.defaultDatasetId;
      const datasetResponse = await fetch(
        `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json`,
        {
          headers: { Authorization: `Bearer ${process.env.APIFY_API_TOKEN}` },
        }
      );
      const items = await datasetResponse.json();
      if (items.length > 0) {
        result = items[0];
      }
      break;
    }

    if (status.data.status === "FAILED" || status.data.status === "ABORTED") {
      return NextResponse.json(
        { error: "Scraping failed. Try again." },
        { status: 500 }
      );
    }
  }

  if (!result) {
    return NextResponse.json(
      { error: "Timeout: scraping took too long" },
      { status: 500 }
    );
  }

  console.log("[Refresh] Got result:", result.title, result.reviews?.length, "reviews");

  // Map reviews
  const allReviews = (result.reviews || []).map((r: Record<string, unknown>) => ({
    author: (r.name as string) || "Anonymous",
    rating: (r.stars as number) || (r.rating as number) || 5,
    text: (r.text as string) || "",
    textTranslated: (r.textTranslated as string) || "",
    language: (r.originalLanguage as string) || "unknown",
    publishedAt: (r.publishedAtDate as string) || "",
    likes: (r.likesCount as number) || 0,
    isLocalGuide: (r.isLocalGuide as boolean) || false,
    reviewUrl: (r.reviewUrl as string) || "",
    detailedRating: r.reviewDetailedRating || null,
  }));

  // Apply review limit for Free plan
  const reviewsData = planTier === "pro"
    ? allReviews
    : allReviews.slice(0, FREE_REVIEW_LIMIT);

  console.log("[Refresh] Saving", reviewsData.length, "reviews (limit:", planTier === "pro" ? "unlimited" : FREE_REVIEW_LIMIT, ")");

  // Update reviews_cache
  const { error: upsertError } = await supabase
    .from("reviews_cache")
    .upsert(
      {
        location_id: locationId,
        raw_reviews: reviewsData,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "location_id" }
    );

  if (upsertError) {
    console.error("[Refresh] DB upsert error:", upsertError);
    return NextResponse.json(
      { error: "Failed to save reviews" },
      { status: 500 }
    );
  }

  // Update location stats
  const avgRating = reviewsData.length > 0
    ? reviewsData.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsData.length
    : 0;

  await supabase
    .from("locations")
    .update({
      rating: Math.round(avgRating * 10) / 10,
      total_reviews: result.reviewsCount || reviewsData.length,
    })
    .eq("id", locationId);

  return NextResponse.json({
    success: true,
    reviews_count: reviewsData.length,
    source: "apify",
  });
}

// Delete a location
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");

    if (!locationId) {
      return NextResponse.json(
        { error: "location_id is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: location } = await supabase
      .from("locations")
      .select("id")
      .eq("id", locationId)
      .eq("profile_id", user.id)
      .single();

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    // Delete (cascade will handle related tables)
    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", locationId);

    if (error) {
      console.error("[Locations] Delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete location" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/locations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
