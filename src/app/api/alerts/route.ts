import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a business intelligence analyst for local businesses. Generate a weekly review report based on the reviews data.

RULES:
- Write in the SAME language as the reviews (if mixed, use English)
- Be concise and actionable
- Highlight both positives and concerns
- Detect patterns that need operational attention
- Keep the total report under 300 words

Return a JSON object with this EXACT structure:
{
  "summary": "2-3 sentence overview of the week",
  "highlights": ["top 2-3 positive themes"],
  "concerns": ["any recurring complaints or issues to fix"],
  "trend": "improving" | "stable" | "declining",
  "action_items": ["1-2 specific things the owner should do this week"]
}`;

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

    // Check plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_tier")
      .eq("id", user.id)
      .single();

    if (profile?.plan_tier !== "pro") {
      return NextResponse.json(
        { error: "Weekly reports require Pro plan" },
        { status: 403 }
      );
    }

    // Get location and reviews
    const { data: location } = await supabase
      .from("locations")
      .select("name")
      .eq("id", location_id)
      .single();

    const { data: cache } = await supabase
      .from("reviews_cache")
      .select("raw_reviews")
      .eq("location_id", location_id)
      .single();

    // Get internal feedback
    const { data: feedback } = await supabase
      .from("feedback")
      .select("rating, comment, contact, created_at")
      .eq("location_id", location_id)
      .order("created_at", { ascending: false })
      .limit(20);

    const reviews = (cache?.raw_reviews as Array<{ author: string; rating: number; text: string; publishedAt: string }>) || [];
    const feedbackList = feedback || [];

    // Filter reviews from last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentReviews = reviews.filter((r) => {
      if (!r.publishedAt) return true;
      return new Date(r.publishedAt) >= weekAgo;
    });

    const avgRating = recentReviews.length > 0
      ? (recentReviews.reduce((sum, r) => sum + (r.rating || 5), 0) / recentReviews.length).toFixed(1)
      : "N/A";

    const negativeFeedback = feedbackList.filter((f) => f.rating <= 3);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Weekly report for "${location?.name}":

Google Reviews (last 7 days): ${recentReviews.length} new reviews
Average rating this week: ${avgRating} stars
Total reviews all time: ${reviews.length}

Recent reviews:
${recentReviews.slice(0, 10).map((r) => `[${r.rating}/5] ${r.author}: "${r.text}"`).join("\n")}

Internal feedback (from QR gating): ${feedbackList.length} entries
Negative feedback (1-3 stars): ${negativeFeedback.length}
${negativeFeedback.map((f) => `[${f.rating}/5] ${f.comment || "No comment"}${f.contact ? ` (Contact: ${f.contact})` : ""}`).join("\n")}

Generate the weekly report JSON.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate report" },
        { status: 500 }
      );
    }

    let report;
    try {
      report = JSON.parse(content);
    } catch {
      return NextResponse.json(
        { error: "Invalid AI response format" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...report,
      week_stats: {
        new_reviews: recentReviews.length,
        avg_rating: avgRating,
        internal_feedback: feedbackList.length,
        negative_feedback: negativeFeedback.length,
      },
    });
  } catch (error) {
    console.error("POST /api/alerts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
