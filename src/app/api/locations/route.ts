import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

interface ApifyReview {
  text: string;
  rating: number;
  publishedAt: string;
  author: string;
}

interface ApifyResult {
  title: string;
  address: string;
  totalScore: number;
  reviewsCount: number;
  placeId: string;
  reviews: Record<string, unknown>[];
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 5 scrapes per hour per user
    const { success, reset } = await checkRateLimit("scrape", user.id);
    if (!success) {
      return rateLimitResponse(reset);
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Check if user can add more locations
    const { data: canAdd } = await supabase.rpc("can_add_location", {
      p_user_id: user.id,
    });

    if (!canAdd) {
      return NextResponse.json(
        {
          error:
            "Free plan allows 1 location. Upgrade to Pro for unlimited locations.",
        },
        { status: 403 }
      );
    }

    // Get plan tier for review limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_tier")
      .eq("id", user.id)
      .single();

    const planTier = profile?.plan_tier || "free";

    console.log("[Locations] Starting Apify scrape for:", url);

    // Determine if input is a URL or search query
    const isUrl = url.includes("google.com/maps") || url.includes("goo.gl/maps") || url.includes("maps.app.goo.gl");

    const apifyInput: Record<string, unknown> = {
      language: "en",
      includeReviews: true,
      reviewsSort: "newest",
      maxReviews: 50,
      scrapePlaceDetailPage: false,
      skipClosedPlaces: true,
      maxCrawledPlacesPerSearch: 1,
    };

    if (isUrl) {
      apifyInput.startUrls = [{ url }];
    } else {
      apifyInput.searchStringsArray = [url];
    }

    // Run Apify actor to scrape Google Maps
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
      const errText = await apifyResponse.text();
      console.error("[Locations] Apify start error:", apifyResponse.status, errText);
      return NextResponse.json(
        { error: "Failed to start scraping. Check your Apify token." },
        { status: 500 }
      );
    }

    const apifyRun = await apifyResponse.json();
    const runId = apifyRun.data.id;
    console.log("[Locations] Apify run started:", runId);

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

      if (!statusResponse.ok) {
        console.error("[Locations] Status check failed:", statusResponse.status);
        continue;
      }

      const status = await statusResponse.json();
      console.log("[Locations] Apify status:", status.data.status, `(${i + 1}/60)`);

      if (status.data.status === "SUCCEEDED") {
        const datasetId = status.data.defaultDatasetId;
        console.log("[Locations] Dataset ID:", datasetId);
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json`,
          {
            headers: { Authorization: `Bearer ${process.env.APIFY_API_TOKEN}` },
          }
        );
        const items = await datasetResponse.json();
        console.log("[Locations] Dataset items:", items.length);
        if (items.length > 0) {
          result = items[0];
        }
        break;
      }

      if (status.data.status === "FAILED" || status.data.status === "ABORTED") {
        console.error("[Locations] Apify run failed:", status.data.status);
        return NextResponse.json(
          { error: "Scraping failed. The URL might be invalid. Try a different URL." },
          { status: 500 }
        );
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "Timeout: scraping took too long. Try again in a moment." },
        { status: 500 }
      );
    }

    console.log("[Locations] Got result:", result.title, result.reviews?.length, "reviews");

    // Save location to database
    const { data: location, error: locError } = await supabase
      .from("locations")
      .insert({
        profile_id: user.id,
        google_place_id: result.placeId,
        google_maps_url: url,
        name: result.title,
        address: result.address,
        rating: result.totalScore,
        total_reviews: result.reviewsCount,
      })
      .select()
      .single();

    if (locError) {
      if (locError.code === "23505") {
        return NextResponse.json(
          { error: "This location was already added." },
          { status: 409 }
        );
      }
      console.error("[Locations] DB error:", locError);
      return NextResponse.json(
        { error: "Failed to save location" },
        { status: 500 }
      );
    }

    // Create widget config
    await supabase.from("widget_configs").insert({
      location_id: location.id,
    });

    // Save reviews cache - keep original language
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

    // Apply review limit for Free plan (50 reviews max)
    const reviewsData = planTier === "pro"
      ? allReviews
      : allReviews.slice(0, 50);

    await supabase.from("reviews_cache").insert({
      location_id: location.id,
      raw_reviews: reviewsData,
      last_synced_at: new Date().toISOString(),
    });

    return NextResponse.json({
      location_id: location.id,
      name: result.title,
      rating: result.totalScore,
      total_reviews: result.reviewsCount,
      reviews_count: reviewsData.length,
    });
  } catch (error) {
    console.error("[Locations] POST /api/locations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
