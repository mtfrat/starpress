import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("location_id");

    if (!locationId) {
      return NextResponse.json(
        { error: "location_id is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get GBP tokens
    const { data: tokens } = await supabase
      .from("gbp_tokens")
      .select("*")
      .eq("profile_id", user.id)
      .single();

    if (!tokens) {
      return NextResponse.json(
        { error: "Google Business Profile not connected" },
        { status: 400 }
      );
    }

    // Refresh token if expired
    let accessToken = tokens.access_token;
    if (tokens.token_expiry && new Date(tokens.token_expiry) < new Date()) {
      if (!tokens.refresh_token) {
        return NextResponse.json(
          { error: "Token expired. Please reconnect." },
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

        await supabase
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
      console.error("GBP reviews error:", errText);
      return NextResponse.json(
        { error: "Failed to fetch reviews from Google" },
        { status: 500 }
      );
    }

    const data = await reviewsResponse.json();
    const reviews = (data.reviews || []).map(
      (r: Record<string, unknown>) => ({
        reviewId: r.reviewId || (r.name as string)?.split("/").pop(),
        author: (r.reviewer as Record<string, unknown>)?.displayName || "Anonymous",
        rating: r.starRating || 5,
        text: r.comment || "",
        updateTime: r.updateTime || "",
        reply: r.reviewReply || null,
      })
    );

    return NextResponse.json({ reviews, total: reviews.length });
  } catch (error) {
    console.error("GET /api/gbp/reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
