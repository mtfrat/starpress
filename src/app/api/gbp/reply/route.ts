import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { review_id, reply_text } = await request.json();

    if (!review_id || !reply_text) {
      return NextResponse.json(
        { error: "review_id and reply_text are required" },
        { status: 400 }
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

    // Reply to review via GBP API
    const replyResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${tokens.account_id}/locations/${tokens.location_id}/reviews/${review_id}/reply`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: reply_text,
        }),
      }
    );

    if (!replyResponse.ok) {
      const errText = await replyResponse.text();
      console.error("GBP reply error:", errText);
      return NextResponse.json(
        { error: "Failed to post reply to Google" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/gbp/reply error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
