import { NextResponse } from "next/server";
import { createClient, getServiceClient } from "@/lib/supabase/server";

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

    if (profile?.plan_tier !== "pro") {
      return NextResponse.json(
        { error: "GBP sync requires Pro plan" },
        { status: 403 }
      );
    }

    // Get GBP tokens
    const { data: tokens } = await supabase
      .from("gbp_tokens")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (!tokens) {
      return NextResponse.json(
        { error: "Google Business Profile not connected. Connect it first in the dashboard." },
        { status: 400 }
      );
    }

    // Refresh token if expired
    let accessToken = tokens.access_token;
    if (tokens.token_expiry && new Date(tokens.token_expiry) < new Date()) {
      if (!tokens.refresh_token) {
        return NextResponse.json(
          { error: "Token expired. Please reconnect Google Business Profile." },
          { status: 401 }
        );
      }

      const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_GBP_CLIENT_ID!,
          client_secret: process.env.GOOGLE_GBP_CLIENT_SECRET!,
          refresh_token: tokens.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (refreshResponse.ok) {
        const newTokens = await refreshResponse.json();
        accessToken = newTokens.access_token;

        const serviceClient = getServiceClient();
        await serviceClient
          .from("gbp_tokens")
          .update({
            access_token: newTokens.access_token,
            token_expiry: new Date(
              Date.now() + newTokens.expires_in * 1000
            ).toISOString(),
          })
          .eq("profile_id", user.id);
      }
    }

    // Fetch reviews from GBP API
    const reviewsResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${tokens.account_id}/locations/${tokens.location_id}/reviews`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!reviewsResponse.ok) {
      const errText = await reviewsResponse.text();
      console.error("GBP sync reviews error:", errText);
      return NextResponse.json(
        { error: "Failed to fetch reviews from Google" },
        { status: 500 }
      );
    }

    const data = await reviewsResponse.json();
    const gbpReviews = data.reviews || [];

    // Map GBP reviews to our format
    const reviewsData = gbpReviews.map((r: Record<string, unknown>) => ({
      author: (r.reviewer as Record<string, unknown>)?.displayName || "Anonymous",
      rating: r.starRating || 5,
      text: r.comment || "",
      textTranslated: "",
      language: "unknown",
      publishedAt: r.updateTime || "",
      likes: 0,
      isLocalGuide: false,
      reviewUrl: "",
      detailedRating: null,
      reviewId: r.reviewId || (r.name as string)?.split("/").pop(),
      reply: r.reviewReply || null,
    }));

    // Update reviews_cache
    const serviceClient = getServiceClient();
    const { error: upsertError } = await serviceClient
      .from("reviews_cache")
      .upsert(
        {
          location_id: location_id,
          raw_reviews: reviewsData,
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "location_id" }
      );

    if (upsertError) {
      console.error("GBP sync upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to save reviews" },
        { status: 500 }
      );
    }

    // Also update location stats
    const avgRating = reviewsData.length > 0
      ? reviewsData.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsData.length
      : 0;

    await serviceClient
      .from("locations")
      .update({
        rating: Math.round(avgRating * 10) / 10,
        total_reviews: reviewsData.length,
      })
      .eq("id", location_id);

    return NextResponse.json({
      success: true,
      reviews_count: reviewsData.length,
      source: "google_business_profile",
    });
  } catch (error) {
    console.error("POST /api/gbp/sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
